import {
  Keypair,
  Connection,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableProgram,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const createLUT = async (connection: Connection, wallet: Keypair) => {
  const slot = await connection.getSlot();

  // create LUT ix, pubkey
  const [lookupTableIx, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot: slot,
    });

  const blockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  // send ix, create LUT on-chain
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: [lookupTableIx],
  }).compileToV0Message();
  const tx = new VersionedTransaction(messageV0);
  tx.sign([wallet]);
  await connection.sendTransaction(tx);

  return lookupTableAddress;
};

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const lookupTableAddress = await createLUT(connection, wallet);
  console.log(lookupTableAddress);
};

main();
