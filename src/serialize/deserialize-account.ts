/* eslint-disable no-return-assign */
/* eslint-disable arrow-body-style */

import { deserializeUnchecked } from 'borsh';
import { Connection, PublicKey } from '@solana/web3.js';

// class that takes passed in props and adds them to an object
class Assignable {
  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      // @ts-ignore
      return (this[key] = properties[key]);
    });
  }
}

class AccountData extends Assignable { }

const dataSchema = new Map([
  [
    AccountData,
    {
      kind: 'struct',
      fields: [
        ['initialized', 'u8'],
        ['tree_length', 'u32'],
        ['map', { kind: 'map', key: 'string', value: 'string' }],
      ],
    },
  ],
]);

export const getAccountData = async (
  connection: Connection,
  account: PublicKey
) => {
  const nameAccount = await connection.getAccountInfo(account, 'processed');
  return deserializeUnchecked(dataSchema, AccountData, nameAccount!.data);
};
