import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const sig = await connection.requestAirdrop(
    wallet.publicKey,
    LAMPORTS_PER_SOL * 2
  );
  console.log(sig);
};

main();
