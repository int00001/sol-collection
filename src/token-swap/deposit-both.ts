import * as dotenv from 'dotenv';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  PublicKey,
  Connection,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TokenSwap } from '@libs/spl-token-swap';

import { loadWallet } from 'keypair';
import poolData from './pools.json';

dotenv.config();

/**
 * Two deposit methods
 * 1 deposit tokens to both sides of the pool
 *     provide the amount of LP tokens to receive
 * 2 deposit tokens to one side of the pool
 *     provide the amount of tokens to deposit
 */

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!, {
    commitment: 'finalized',
  });
  const wallet = loadWallet();

  const tokenA = process.env.TOKEN_MINT_1!;
  const tokenB = process.env.TOKEN_MINT_2!;
  const userTokenA = await getAssociatedTokenAddress(
    new PublicKey(tokenA),
    wallet.publicKey
  );
  const userTokenB = await getAssociatedTokenAddress(
    new PublicKey(tokenB),
    wallet.publicKey
  );
  const poolAccounts = poolData.pools.find(
    (pool) =>
      (pool.tokenAMint === tokenA && pool.tokenBMint === tokenB) ||
      (pool.tokenAMint === tokenB && pool.tokenBMint === tokenA)
  )!;
  const userPoolToken = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    new PublicKey(poolAccounts.poolTokenMint),
    wallet.publicKey
  );
  const poolTokenAmount = 1_000;

  // BUG
  // npm spl lib is outdated
  // import the updated lib into project locally
  const depositBothIx = TokenSwap.depositAllTokenTypesInstruction(
    new PublicKey(poolAccounts.tokenSwap), // token swap state account
    new PublicKey(poolAccounts.authority), // pool authority
    wallet.publicKey,
    userTokenA, // user token A account
    userTokenB, // user token B account
    new PublicKey(poolAccounts.poolTokenA), // pool token A account
    new PublicKey(poolAccounts.poolTokenB), // pool token B account
    new PublicKey(poolAccounts.poolTokenMint), // pool LP token mint
    userPoolToken.address, // user token LP account. LP tokens minted here
    new PublicKey(tokenA),
    new PublicKey(tokenB),
    new PublicKey(process.env.SPL_TOKEN_SWAP_PROGRAM!),
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    poolTokenAmount * 10 ** 2,
    100e9,
    100e9
  );

  const depositBothTx = new Transaction().add(depositBothIx);
  const depositBothSig = await sendAndConfirmTransaction(
    connection,
    depositBothTx,
    [wallet]
  );
  console.log(depositBothSig);
};

main();
