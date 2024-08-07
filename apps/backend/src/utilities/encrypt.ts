import * as crypto from 'crypto-js';

export const encrypt = (text: string): string =>
  crypto.AES.encrypt(text, process.env.AES_SECRET).toString();

export const decrypt = (text: string): string =>
  crypto.AES.decrypt(text, process.env.AES_SECRET).toString(crypto.enc.Utf8);
