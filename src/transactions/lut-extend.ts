import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { loadWallet } from 'keypair';

dotenv.config();

const extendLUT = async (
  connection: Connection,
  wallet: Keypair,
  lutAddress: PublicKey,
  addresses: PublicKey[]
) => {
  const extendLUTIx = AddressLookupTableProgram.extendLookupTable({
    payer: wallet.publicKey,
    authority: wallet.publicKey,
    lookupTable: lutAddress,
    addresses,
  });

  const blockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: [extendLUTIx],
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);
  tx.sign([wallet]);

  await connection.sendTransaction(tx);
};

const main = async () => {
  const connection = new Connection(process.env.OFFICIAL_SOL_DEV_HTTPS!);
  const wallet = loadWallet();

  const lutAddress = new PublicKey(process.env.LUT_DEVNET_1!);

  // random addresses to add to LUT
  const addresses = Array.from({ length: 20 }).map(
    () => Keypair.generate().publicKey
  );

  await extendLUT(connection, wallet, lutAddress, addresses);
};

main();
