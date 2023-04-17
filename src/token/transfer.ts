import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!, {
    commitment: 'finalized',
  });
  const wallet = loadWallet();

  const tokenMint = new PublicKey(process.env.TOKEN_MINT_1!);

  const sourceTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );

  // create destination token account
  const destinationAccount = Keypair.generate();
  const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    tokenMint,
    destinationAccount.publicKey
  );
  const amount = 100_000_000;
  console.log(destinationAccount.publicKey);
  console.log(destinationTokenAccount.address);

  // send
  const transferIx = createTransferInstruction(
    sourceTokenAccount,
    destinationTokenAccount.address,
    wallet.publicKey,
    amount
  );

  const tx = new Transaction().add(transferIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log(sig);
};

main();
