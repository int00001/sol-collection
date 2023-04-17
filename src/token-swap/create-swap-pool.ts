import {
  Account,
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { CurveType, TokenSwap, TokenSwapLayout } from '@solana/spl-token-swap';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';
import {
  ACCOUNT_SIZE,
  createMint,
  getAssociatedTokenAddressSync,
  createInitializeAccountInstruction,
  getMinimumBalanceForRentExemptAccount,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createMintToInstruction,
} from '@solana/spl-token';

dotenv.config();

const TRADING_FEE_NUMERATOR = 0;
const TRADING_FEE_DENOMINATOR = 10_000;
const OWNER_TRADING_FEE_NUMERATOR = 5;
const OWNER_TRADING_FEE_DENOMINATOR = 10_000;
const OWNER_WITHDRAW_FEE_NUMERATOR = 0;
const OWNER_WITHDRAW_FEE_DENOMINATOR = 0;
const HOST_FEE_NUMERATOR = 20;
const HOST_FEE_DENOMINATOR = 100;

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!, {
    commitment: 'finalized',
  });
  const wallet = loadWallet();
  const SPL_TOKEN_SWAP_PROGRAM = new PublicKey(
    process.env.SPL_TOKEN_SWAP_PROGRAM!
  );

  // token swap state account - holds info about pool
  // pool authority - pda that signs txs on behalf of swap program
  // token account token A
  // token account token B
  // pool token mint - mint for pool's LP token
  // pool token account - account where initial LP tokens get minted to
  // pool fee account - collects fees from pool's swap fee

  // (1) token swap state account
  const tokenSSA = Keypair.generate();
  const rent = await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection);
  const createTokenSSAIx = SystemProgram.createAccount({
    newAccountPubkey: tokenSSA.publicKey,
    fromPubkey: wallet.publicKey,
    lamports: rent,
    space: TokenSwapLayout.span,
    programId: SPL_TOKEN_SWAP_PROGRAM,
  });
  const createTokenSSATx = new Transaction().add(createTokenSSAIx);
  const createTokenSSASig = await sendAndConfirmTransaction(
    connection,
    createTokenSSATx,
    [wallet, tokenSSA]
  );
  console.log(createTokenSSASig);

  // (2) pool authority, derived
  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [tokenSSA.publicKey.toBuffer()],
    SPL_TOKEN_SWAP_PROGRAM
  );

  // (3) create associated token accounts for token A and token B owned by pool authority
  // these hold token A and B for the pool
  const tokenAMint = new PublicKey(process.env.TOKEN_MINT_1!);
  const tokenBMint = new PublicKey(process.env.TOKEN_MINT_2!);

  const tokenAAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    tokenAMint,
    poolAuthority,
    true
  );
  const tokenBAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    tokenBMint,
    poolAuthority,
    true
  );

  // fund token accounts
  // have to be funded when creating pool
  const mintAIx = createMintToInstruction(
    tokenAMint,
    tokenAAccount.address,
    wallet.publicKey, // authority
    100_000_000
  );
  const mintBIx = createMintToInstruction(
    tokenBMint,
    tokenBAccount.address,
    wallet.publicKey,
    555_000_000_000
  );
  const fundTx = new Transaction().add(mintAIx).add(mintBIx);
  const fundSig = await sendAndConfirmTransaction(connection, fundTx, [wallet]);
  console.log(fundSig);

  // (4) pool token mint
  const poolLPTokenMint = await createMint(
    connection,
    wallet,
    poolAuthority, // owner
    null, // no freeze authority
    2
  );

  // (5) pool token account
  // initial LP tokens minted go here
  // susequent LP tokens minted go directly to users adding liquidity
  const poolTokenAccount = Keypair.generate();
  const ptaRent = await getMinimumBalanceForRentExemptAccount(connection);
  const createPoolTokenAccountIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: poolTokenAccount.publicKey,
    space: ACCOUNT_SIZE,
    lamports: ptaRent,
    programId: TOKEN_PROGRAM_ID,
  });
  const initPoolTokenAccountIx = createInitializeAccountInstruction(
    poolTokenAccount.publicKey,
    poolLPTokenMint,
    wallet.publicKey
  );
  const poolTokenAccountTx = new Transaction()
    .add(createPoolTokenAccountIx)
    .add(initPoolTokenAccountIx);
  const poolTokenAccountSig = await sendAndConfirmTransaction(
    connection,
    poolTokenAccountTx,
    [wallet, poolTokenAccount]
  );
  console.log(poolTokenAccountSig);

  // (6) pool token fee account
  const feeOwner = Keypair.generate();
  const feeAccountAddress = getAssociatedTokenAddressSync(
    poolLPTokenMint,
    feeOwner.publicKey,
    true
  );
  const createFeeAccountIx = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    feeAccountAddress,
    feeOwner.publicKey,
    poolLPTokenMint
  );
  const feeAccountTx = new Transaction().add(createFeeAccountIx);
  const feeAccountSig = await sendAndConfirmTransaction(
    connection,
    feeAccountTx,
    [wallet]
  );
  console.log(feeAccountSig);

  // logs
  console.log(`token swap state acc ${tokenSSA.publicKey}`);
  console.log(`pool authority acc ${poolAuthority}`);
  console.log(`pool token A acc ${tokenAAccount.address}`);
  console.log(`pool token B acc ${tokenBAccount.address}`);
  console.log(`pool LP token mint ${poolLPTokenMint}`);
  console.log(`pool token acc ${poolTokenAccount.publicKey}`);
  console.log(`pool fee owner ${feeOwner.publicKey}`);
  console.log(`pool fee acc ${feeAccountAddress}`);

  // FINALLY
  // create swap pool
  const createPoolIx = TokenSwap.createInitSwapInstruction(
    new Account(tokenSSA.secretKey), // method requires account instead of keypair
    poolAuthority,
    tokenAAccount.address,
    tokenBAccount.address,
    poolLPTokenMint,
    feeAccountAddress,
    poolTokenAccount.publicKey,
    TOKEN_PROGRAM_ID,
    SPL_TOKEN_SWAP_PROGRAM,
    TRADING_FEE_NUMERATOR,
    TRADING_FEE_DENOMINATOR,
    OWNER_TRADING_FEE_NUMERATOR,
    OWNER_TRADING_FEE_DENOMINATOR,
    OWNER_WITHDRAW_FEE_NUMERATOR,
    OWNER_WITHDRAW_FEE_DENOMINATOR,
    HOST_FEE_NUMERATOR,
    HOST_FEE_DENOMINATOR,
    CurveType.ConstantProduct
  );

  const createPoolTx = new Transaction().add(createPoolIx);
  const createPoolSig = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [wallet]
  );
  console.log(createPoolSig);
};

main();
