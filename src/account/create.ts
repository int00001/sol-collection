import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

export const createAccount = async (
  connection: Connection,
  fromPubkey: Keypair,
  newAccountPubkey: Keypair,
  space: number
) => {
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(space);

  const createAccountParams = {
    fromPubkey: fromPubkey.publicKey,
    newAccountPubkey: newAccountPubkey.publicKey,
    lamports: rentExemptionAmount,
    space,
    programId: SystemProgram.programId,
  };

  const createAccountTransaction = new Transaction().add(
    SystemProgram.createAccount(createAccountParams)
  );

  const txSig = await sendAndConfirmTransaction(
    connection,
    createAccountTransaction,
    [fromPubkey, newAccountPubkey]
  );

  return txSig;
};
