import {
  createMintToInstruction,
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
  const destination = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );
  // NOTE can set authority to null after all tokens have been minted
  // or, set to a program so tokens can be minted at regular intervals
  const authority = wallet.publicKey;
  // 6 decimal token, so this amount is actually 100_000
  const amount = 100_000_000_000;

  const mintToIx = createMintToInstruction(
    tokenMint,
    destination,
    authority,
    amount
  );

  const tx = new Transaction().add(mintToIx);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log(sig);
};

main();
