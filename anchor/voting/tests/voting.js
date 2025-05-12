// will try to write pusedo code since there is a lot goin on.

//first intuition , i need ot set up a enviroment where my program can be deployed , BellPlus;loy my program there 

/* 
importing anchor makes sense
import * as anchor frrom "@coral-xyz/anchor"
import {BN, Program } from "@coral-xyz/anchor" , BN makes sense, but cna be directly used form anchor aswell , lets check if we will need progrma somewhere

Testign libraries import : 
import { startAnchor } from "solana-bankrun"; (this one creates the environment, with oput program in it)
import { BankrunProvider } from "anchor-bankrun"; (we can use this wrapoer to interacct with out environment)

import { PublicKey } from '@solana/web3.js'; (maybe we will need this in development as well, let see where will use thsi )




//// Now , things we need from our code base , that is the program we need to actually tst, we also need that.

we need idl/ ABI generated during anchor build , similar to hardhat
const IDL = require("../target/idl/voting.json");

we need the program itseld to be deployed
import { Voting } from '../target/types/voting';

I think in testing instead of getting the key after deploying, it will jsut get deployed at whereevr it is mentioend in out program  (doubt)

const PUPPET_PROGRAM_ID = new PublicKey("5s3PtT8kLYCv1WEp6dSh3T7EuF35Z6jSu5Cvx4hWG79H");

/// Actual test 

first we need to deploy our contract at the beginning before performing tests:






*/





import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from "@coral-xyz/anchor";


const IDL = require("../target/idl/voting.json");
import { Voting } from '../target/types/voting';

const PUPPET_PROGRAM_ID = new PublicKey("5s3PtT8kLYCv1WEp6dSh3T7EuF35Z6jSu5Cvx4hWG79H");

describe('Create a system account', () => {

  test("bankrun", async () => {
    const context = await startAnchor("", [{name: "voting", programId: PUPPET_PROGRAM_ID}], []);
    const provider = new BankrunProvider(context);

    const puppetProgram = new Program<Voting>(
      IDL,
      provider,
    );

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new BN(1).toArrayLike(Buffer, "le", 8)],
      puppetProgram.programId
    );

    await puppetProgram.methods.initializePoll(
      new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1759508293),
        "test-poll",
        "description",
    ).rpc();

    const pollAccount = await puppetProgram.account.pollAccount.fetch(pollAddress);
    console.log(pollAccount);

  });

});