import * as dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { loadWallet } from 'keypair';
import { createAccount } from 'account';
import { getAccountData, initAcc, mintKV } from 'serialize';

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
  const key = 'key-two';
  const value = '555';
  await mintKV(
    connection,
    programId,
    programOwnedAccount.publicKey,
    wallet,
    key,
    value
  );

  // deserialize from chain
  const accData = await getAccountData(
    connection,
    programOwnedAccount.publicKey
  );
  console.log(accData);
};

main();
