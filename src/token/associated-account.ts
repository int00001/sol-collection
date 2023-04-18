import {
  createAssociatedTokenAccountInstruction,
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

// user associated token account
// deterministically derived

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const tokenMint = new PublicKey(process.env.TOKEN_MINT_1!);

  const associatedTokenAddress = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );
  console.log(`assosciated token address ${associatedTokenAddress}`);

  const createTokenAccountIx = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    associatedTokenAddress,
    wallet.publicKey,
    tokenMint
  );

  const tx = new Transaction().add(createTokenAccountIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);

  console.log(sig);
};

main();
