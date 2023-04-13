import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);

  const lutAddress = new PublicKey(process.env.LUT_DEVNET_1!);

  const lookupTableAccount = await connection
    .getAddressLookupTable(lutAddress)
    .then((res) => res.value);

  for (let i = 0; i < lookupTableAccount!.state.addresses.length; i += 1) {
    const address = lookupTableAccount!.state.addresses[i];
    console.log(i, address.toBase58());
  }
};

main();
