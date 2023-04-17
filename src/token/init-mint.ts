import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Keypair,
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

// Token Mint
// holds data about a specific token

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const rent = await getMinimumBalanceForRentExemptMint(connection);
  const tokenMint = Keypair.generate();

  // spl createMint is just two ixs
  // first create account for token mint, then init mint

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: tokenMint.publicKey,
    space: MINT_SIZE,
    lamports: rent,
    programId: TOKEN_PROGRAM_ID,
  });

  const decimals = 6;
  const mintIx = createInitializeMintInstruction(
    tokenMint.publicKey,
    decimals,
    wallet.publicKey,
    wallet.publicKey,
    TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(createAccountIx).add(mintIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [
    wallet,
    tokenMint,
  ]);
  console.log(sig);

  console.log(`token: ${tokenMint.publicKey}`);
};

main();
