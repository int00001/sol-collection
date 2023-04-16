import * as dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { loadWallet } from 'keypair';
import { createAccount } from 'account';
import { initAcc, mintKV } from 'serialize';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_DEV_HTTPS!);
  const programId = new PublicKey(process.env.CLI_TEMPLATE_PROGRAM_ID!);
  const wallet = loadWallet();

  // create account to mint to
  const ACCOUT_STATE_SPACE = 1024;
  const programOwnedAccount = Keypair.generate();
  await createAccount(
    connection,
    wallet,
    programOwnedAccount,
    ACCOUT_STATE_SPACE,
    programId
  );
  await initAcc(connection, programId, programOwnedAccount.publicKey, wallet);

  // mint KV pair
  const key = 'first mint';
  const value = '888';
  const mintSig = await mintKV(
    connection,
    programId,
    programOwnedAccount.publicKey,
    wallet,
    key,
    value
  );
  console.log(mintSig);
};

main();
