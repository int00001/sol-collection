/* eslint-disable no-await-in-loop */

import * as dotenv from 'dotenv';
import { Connection } from '@solana/web3.js';
import { sleep } from 'utils';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_MAIN_HTTPS!);

  // store last valid blockheight
  const latest = await connection.getLatestBlockhash();
  const { lastValidBlockHeight } = latest;

  // poll cluster blockheight
  let blockHeight = await connection.getBlockHeight();

  console.log(lastValidBlockHeight);

  // submit the tx until the current blockheight surpasses the last valid blockheight
  while (blockHeight < lastValidBlockHeight) {
    // connection.sendRawTransaction(rawTransaction, {
    //   skipPreflight: true,
    // });
    await sleep(300);
    blockHeight = await connection.getBlockHeight();

    console.log(blockHeight);
    console.log('send');
  }
};

main();
