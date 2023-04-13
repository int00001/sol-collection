import {
  Connection,
  Keypair,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const blockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  const newAccount = Keypair.generate();

  const minRent = await connection.getMinimumBalanceForRentExemption(0);

  // construct instructions array
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: newAccount.publicKey,
      lamports: minRent,
    }),
  ];

  // construct v0 message
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  // create versioned tx, passing in v0 message
  const transaction = new VersionedTransaction(messageV0);
  // sign tx with array of required Signers
  transaction.sign([wallet]);

  // sign transaction before calling sendTransaction
  const txSig = await connection.sendTransaction(transaction);
  console.log(txSig);
};

main();
