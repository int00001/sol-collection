import * as dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { loadWallet } from 'keypair';
import { createAccount } from 'account';
import { initAcc } from 'serialize';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_DEV_HTTPS!);
  const programId = new PublicKey(process.env.CLI_TEMPLATE_PROGRAM_ID!);
  const wallet = loadWallet();

  // create account owned by program
  const ACCOUT_STATE_SPACE = 1024;
  const programOwnedAccount = Keypair.generate();
  const createAccSig = await createAccount(
    connection,
    wallet,
    programOwnedAccount,
    ACCOUT_STATE_SPACE,
    programId
  );
  console.log(createAccSig);

  // init account owned by program to store data
  const initAccSig = await initAcc(
    connection,
    programId,
    programOwnedAccount.publicKey,
    wallet
  );
  console.log(initAccSig);

  console.log(`account init ${programOwnedAccount.publicKey}`);
};

main();
