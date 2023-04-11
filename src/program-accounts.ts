import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Returns all accounts owned by a program
 *
 * programId   pubkey of program to query
 * encoding    base58 | base64 | jsonParsed
 * dataSlice
 *  offset     num bytes into account data to begin returning
 *  length     num bytes of accoutn data to return
 * filters[]
 *  memcmp
 *   offset    num bytes into account data to being comparing
 *   bytes     bytes data to match. base58. limited to 129 bytes
 *  dataSize   compares account data length with provided data size
 *
 *
 * - all token accounts for a wallet
 * - all token accounts for a mint
 * - all custom accounts for a specific program
 */

const main = async () => {
  const c = new Connection(process.env.ALCHEMY_SOL_MAIN_HTTPS!);

  // get all token accounts for UXD token mint
  // SPL token accounts are 165 bytes in length (dataSize: 165)
  // has 8 different fields, mint is the first (offset: 0)
  // searching by token mint
  const TOKEN_MINT_ADDRESS = '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT';
  const dataSlice = {
    offset: 0,
    length: 0,
  };
  const filters = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 0,
        bytes: TOKEN_MINT_ADDRESS,
      },
    },
  ];
  const accounts = await c.getProgramAccounts(TOKEN_PROGRAM_ID, {
    dataSlice,
    filters,
  });

  console.log(accounts.length);
};

main();
