import {
  createBurnInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const tokenMint = new PublicKey(process.env.TOKEN_MINT_1!);
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );
  const amount = 100_000_000;

  const burnIx = createBurnInstruction(
    tokenAccount,
    tokenMint,
    wallet.publicKey,
    amount
  );

  const tx = new Transaction().add(burnIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log(sig);
};

main();
