import { unescape } from 'querystring';

import nacl from 'tweetnacl';
import { loadWallet } from './load-wallet';

const decodeUTF8 = (s: string) => {
  if (typeof s !== 'string') throw new TypeError('expected string');
  const d = unescape(encodeURIComponent(s));
  const b = new Uint8Array(d.length);
  for (let i = 0; i < d.length; i += 1) b[i] = d.charCodeAt(i);
  return b;
};

const bufferToBase64 = (buffer: Uint8Array) =>
  Buffer.from(buffer).toString('base64');

const main = () => {
  const wallet = loadWallet();

  // u8 array of message
  const message = 'any message';
  const messageBytes = decodeUTF8(message);
  console.log(messageBytes);

  // sign with priv key
  const signature = nacl.sign.detached(messageBytes, wallet.secretKey);
  console.log(bufferToBase64(signature));

  // verify with public key
  const result = nacl.sign.detached.verify(
    messageBytes,
    signature,
    wallet.publicKey.toBytes()
  );
  console.log(result);
};

main();
