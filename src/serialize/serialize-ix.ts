/* eslint-disable no-return-assign */
/* eslint-disable arrow-body-style */

import { Buffer } from 'buffer';

import { serialize } from 'borsh';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

/**
 * Borsh method of serialization.
 * Different than @project-serum/anchor
 * Though same as @coral-xyz/anchor
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

class Payload extends Assignable { }

enum InstructionVariant {
  InitializeAccount = 0,
  MintKeypair,
  TransferKeypair,
  BurnKeypair,
}

// initialize_account
const initPayloadSchema = new Map([
  [
    Payload,
    {
      kind: 'struct',
      fields: [['id', 'u8']],
    },
  ],
]);

// mint_keypair_to_account
const mintPayloadSchema = new Map([
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

// transfer_keypair_to_account
const transferKeypairSchema = new Map([
  [
    Payload,
    {
      kind: 'struct',
      fields: [
        ['id', 'u8'],
        ['key', 'string'],
      ],
    },
  ],
]);

export const transferKeypair = async (
  connection: Connection,
  programId: PublicKey,
  fromAccount: PublicKey,
  toAccount: PublicKey,
  key: string,
  wallet: Keypair
) => {
  const transferKeypairPayload = new Payload({
    id: InstructionVariant.TransferKeypair,
    key,
  });
  const ixData = Buffer.from(
    serialize(transferKeypairSchema, transferKeypairPayload)
  );

  const ix = new TransactionInstruction({
    data: ixData,
    keys: [
      { pubkey: fromAccount, isSigner: false, isWritable: true },
      { pubkey: toAccount, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    ],
    programId,
  });

  const tx = new Transaction().add(ix);

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet], {
    commitment: 'singleGossip',
    preflightCommitment: 'singleGossip',
  });

  return sig;
};

export const initAcc = async (
  connection: Connection,
  programId: PublicKey,
  account: PublicKey,
  wallet: Keypair
) => {
  // construct payload.
  // to be serialized as payload schema
  const init = new Payload({
    id: InstructionVariant.InitializeAccount,
  });

  // serialize
  const ixData = Buffer.from(serialize(initPayloadSchema, init));

  // ix
  const ix = new TransactionInstruction({
    data: ixData,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
    ],
    programId,
  });

  // tx
  const tx = new Transaction().add(ix);

  // send
  const txSig = await sendAndConfirmTransaction(connection, tx, [wallet], {
    commitment: 'singleGossip',
    preflightCommitment: 'singleGossip',
  });

  return txSig;
};

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
  const ixData = Buffer.from(serialize(mintPayloadSchema, mint));
  // console.log(mintSerBuf);
  // const mintPayloadCopy = deserialize(mintPayloadSchema, Payload, mintSerBuf);
  // console.log(mintPayloadCopy);

  // create ix
  const ix = new TransactionInstruction({
    data: ixData,
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

  return txSig;
};
