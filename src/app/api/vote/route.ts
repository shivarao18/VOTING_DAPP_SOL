import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require('@/../anchor/target/idl/voting.json');

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetdata: ActionGetResponse = {
    icon: "https://zestfulkitchen.com/wp-content/uploads/2021/09/Peanut-butter_hero_for-web-2.jpg",
    title: "Vote for your favorite type of peanut butter!",
    description: "Vote between crunchy and smooth peanut butter.",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
        },
        {
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
        }
      ]
    }
  };
  return Response.json(actionMetdata, { headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Crunchy" && candidate != "Smooth") {
    return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, {connection});

  const body: ActionPostRequest = await request.json(); 
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
      feePayer: voter,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction
    }
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });

}



/*

// let em think about how a frontend application works . and how I can relate to actions and blinks with it

First fo all when i access the page , i need to see a Ui , that is the 

so, when I land on teh page , there is a get request that lets me see the UI
Then I need to clik on something to trigger an action, that is a post request
now , this request should make a connection to the wallet, and I need to see my wallet open with transactoin details
Then once I confirm , I need to accept the transaction with my provider 

let me dive into the code and then see where each import or keyword works :


Ok, there are only 2 requests one GET and POST


/// GET Summary

now, we need a fixed structure for all get responses , so we create a struct of type ActionGetResponse (imported from @solana/actions)

what are the fields in thsi struct  : 

there is a icon, title, description , links is the important part where actual actionable Ui is there

and basically on clicking them , you make a post reques t, but instead of doing a axios, post or something it is jsut a href redirectiong to psot requests int the same page

in the end , you just send the Response as a json , the bosy is this struct and we nee dto involve a header to avoid cors erros (header is imported )


/// POST Summary 

Doubt? : I didn't quite understood how the post method is triggered , by clicking on a label with href

First 4 lines are straight forward , we get the url, get the candidate to eb voted for from search params , check if it matches our two options
 The check is mainly probably because , it a url and we can type anything

 now , we need to send whatever we go to the blockchain 

 we first need to establish a connection with blockchain , simialr to using rpc

 but here we are usign the imported connection function to connect to out test net 
 Doubt??? : "confirmed " why? 

 here, we already have our program declared but we need to be able to talk to it

 let program : Program<voting> (like saying vector<u64>) = new Program<IDL, {connection}> this program has this IDL, and it is on this chain
 Doubt? how will we find the actual program with programID mentioned


 The next logic is to find the account that votes , here we assume that the request follows the specific structure i,e ActionPostRequest 
 so , body : ActionPostREquest = await request.json(); (we convert it to a json object and get the account parameter, which will be there if it follows the structure)


 out objective to make the transaction and let the frontend know the status of transaction vai a reponse

 for transaction we need, we need a instruction and certian information 

 the const instruction tells , what needs to be done , feepayer: voter pays for it 

 blockhash and latesValidBlockheights are just the other paramerters that we can get

 we Need to send a response , this reponse is of the type createPostResponse, we build the body and send it back 

*/
