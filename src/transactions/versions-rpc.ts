import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_DEV_HTTPS!);
  const slot = await connection.getSlot();

  // get latest block. allow for v0 txs
  const block = await connection.getBlock(slot, {
    maxSupportedTransactionVersion: 0,
  });
  console.log(block);

  // get specific tx. allow for v0 txs
  const firstTx = block!.transactions[0].transaction.signatures[0];
  const getTx = await connection.getTransaction(firstTx, {
    maxSupportedTransactionVersion: 0,
  });
  console.log(getTx);
};

main();
