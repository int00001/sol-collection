import {
  Keypair,
  PublicKey,
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const createTransfer = (
  wallet: Keypair,
  address: PublicKey,
  lamports: number
) =>
  SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: address,
    lamports,
  });

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const lutAddress = new PublicKey(process.env.LUT_DEVNET_1!);

  const lookupTableAccount = await connection
    .getAddressLookupTable(lutAddress)
    .then((res) => res.value);
  const { addresses } = lookupTableAccount!.state;

  // create system transfer to each address in LUT
  const minRent = await connection.getMinimumBalanceForRentExemption(0);
  const transferIxs = addresses.map((address) =>
    createTransfer(wallet, address, minRent)
  );

  const blockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  // include LUT in message, contains accounts needed for ixs
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: transferIxs,
  }).compileToV0Message([lookupTableAccount!]);

  const tx = new VersionedTransaction(messageV0);
  tx.sign([wallet]);

  const sig = await connection.sendTransaction(tx);
  console.log(sig);
};

main();
