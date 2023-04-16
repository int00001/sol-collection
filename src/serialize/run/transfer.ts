import * as dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { loadWallet } from 'keypair';
import { createAccount } from 'account';
import { getAccountData, initAcc, mintKV, transferKeypair } from 'serialize';

dotenv.config();

const init = async (
  connection: Connection,
  wallet: Keypair,
  programId: PublicKey
) => {
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

  return programOwnedAccount;
};

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const programId = new PublicKey(process.env.CLI_TEMPLATE_PROGRAM_ID!);
  const wallet = loadWallet();

  // init two accounts
  const acc1 = await init(connection, wallet, programId);
  const acc2 = await init(connection, wallet, programId);

  // mint KV pair for account 1
  const key = 'mint-kv-pair';
  const value = '749823749823';
  await mintKV(connection, programId, acc1.publicKey, wallet, key, value);

  // check account 1 data
  const accData = await getAccountData(connection, acc1.publicKey);
  console.log(accData);

  // transfer from KV from account 1 -> 2
  await transferKeypair(
    connection,
    programId,
    acc1.publicKey,
    acc2.publicKey,
    key,
    wallet
  );

  // check accounts data
  const newAcc1Data = await getAccountData(connection, acc1.publicKey);
  const newAcc2Data = await getAccountData(connection, acc2.publicKey);
  console.log(newAcc1Data);
  console.log(newAcc2Data);
};

main();
