/* eslint-disable no-return-assign */
/* eslint-disable arrow-body-style */

import { Buffer } from 'buffer';

import { serialize, deserialize } from 'borsh';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

/**
 * Can be used to serialize payloads for custom programs
 */

// class that takes passed in props and adds them to an object
class Assignable {
  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      // @ts-ignore
      return (this[key] = properties[key]);
    });
  }
}

// ix payload
class Payload extends Assignable { }

// borsh schema describing the payload
const payloadSchema = new Map([
  [
    Payload,
    {
      kind: 'struct',
      fields: [
        ['id', 'u8'],
        ['key', 'string'],
        ['value', 'string'],
      ],
    },
  ],
]);

enum InstructionVariant {
  InitializeAccount = 0,
  MintKeypair,
  TransferKeypair,
  BurnKeypair,
}

// mint key value pair to an account
export const mintKV = async (
  connection: Connection,
  programId: PublicKey,
  account: PublicKey,
  wallet: Keypair,
  mintKey: string,
  mintValue: string
) => {
  // construct payload
  const mint = new Payload({
    id: InstructionVariant.MintKeypair,
    key: mintKey,
    value: mintValue,
  });

  // serialize payload
  const mintSerBuf = Buffer.from(serialize(payloadSchema, mint));
  console.log(mintSerBuf);
  const mintPayloadCopy = deserialize(payloadSchema, Payload, mintSerBuf);
  console.log(mintPayloadCopy);

  // create ix
  const ix = new TransactionInstruction({
    data: mintSerBuf,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
    ],
    programId,
  });

  // create tx
  const tx = new Transaction().add(ix);

  // send tx
  const txSig = await sendAndConfirmTransaction(connection, tx, [wallet], {
    commitment: 'singleGossip',
    preflightCommitment: 'singleGossip',
  });

  console.log(txSig);
};
