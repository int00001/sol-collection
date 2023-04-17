import {
  createInitializeAccountInstruction,
  getAccountLenForMint,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

// user token account
// (non-deterministic version)

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const tokenMint = new PublicKey(process.env.TOKEN_MINT_1!);

  const tokenAccount = Keypair.generate();
  const mintState = await getMint(connection, tokenMint);
  const space = getAccountLenForMint(mintState);
  const rent = await connection.getMinimumBalanceForRentExemption(space);

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: tokenAccount.publicKey,
    space,
    lamports: rent,
    programId: TOKEN_PROGRAM_ID,
  });

  const createTokenAccountIx = createInitializeAccountInstruction(
    tokenAccount.publicKey,
    tokenMint,
    wallet.publicKey,
    TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(createAccountIx).add(createTokenAccountIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [
    wallet,
    tokenAccount,
  ]);
  console.log(sig);
};

main();
