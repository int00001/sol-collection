import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

// test if accounts are executable

const main = async () => {
  const connection = new Connection(process.env.ALCHEMY_SOL_DEV_HTTPS!);

  const account1 = await connection.getAccountInfo(
    new PublicKey(process.env.DEVNET_ACCOUNT!)
  );
  console.log(account1?.executable);

  const account2 = await connection.getAccountInfo(TOKEN_PROGRAM_ID);
  console.log(account2?.executable);
};

main();
