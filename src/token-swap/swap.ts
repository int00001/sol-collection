import { TokenSwap } from '@libs/spl-token-swap';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';
import { getPoolByTokens } from 'utils';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const tokenA = new PublicKey(process.env.TOKEN_MINT_1!);
  const tokenB = new PublicKey(process.env.TOKEN_MINT_2!);
  const userTokenA = await getAssociatedTokenAddress(
    new PublicKey(tokenA),
    wallet.publicKey
  );
  const userTokenB = await getAssociatedTokenAddress(
    new PublicKey(tokenB),
    wallet.publicKey
  );

  const poolAccounts = getPoolByTokens(tokenA.toString(), tokenB.toString())!;
  const {
    tokenSwap,
    authority,
    poolTokenA,
    poolTokenB,
    feeAccount,
    poolTokenMint,
  } = poolAccounts;

  const amount = 10_000;
  const decimals = 6;

  const swapIx = TokenSwap.swapInstruction(
    new PublicKey(tokenSwap),
    new PublicKey(authority),
    wallet.publicKey,
    userTokenA, // user token account, transfer in ->
    new PublicKey(poolTokenA), // pool token account, receive tokens transfered in <-
    new PublicKey(poolTokenB), // pool token account, send tokens to user ->
    userTokenB, // user token account, receive tokens from pool <-
    new PublicKey(poolTokenMint),
    new PublicKey(feeAccount),
    null,
    tokenA, // source mint
    tokenB, // destination mint
    new PublicKey(process.env.SPL_TOKEN_SWAP_PROGRAM!),
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    amount * 10 ** decimals,
    0
  );

  const swapTx = new Transaction().add(swapIx);
  const swapSig = await sendAndConfirmTransaction(connection, swapTx, [wallet]);
  console.log(swapSig);
};

main();
