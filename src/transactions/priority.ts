import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

/**
 * Base Fee
 * Prio Fee
 *
 * default compute budget is 200,000 CU * num ix
 * max CU?
 *
 * Base fee is 5000 lamports
 * Prio fee is microLamports * CU budget. rounded up in ones
 * 1 microLamport is 0.000001 lamports
 */

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 500_000,
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 30,
  });

  const newAccount = Keypair.generate();
  const transfer = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: newAccount.publicKey,
    lamports: 10_000_000,
  });

  const tx = new Transaction()
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(transfer);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log(sig);
};

main();
