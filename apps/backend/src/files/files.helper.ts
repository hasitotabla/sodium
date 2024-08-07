import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto-js';
import { lookup } from 'mime-types';

import { generateRandomString } from 'src/utilities/string';

// prettier-ignore
const normalizeChars: { [key: string]: string } = {
  'Š': 'S', 'š': 's', 'Ð': 'Dj', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A',
  'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I',
  'Ï': 'I', 'Ñ': 'N', 'Ń': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U',
  'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
  'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i',
  'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ń': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u',
  'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y', 'ƒ': 'f',
  'ă': 'a', 'ș': 's', 'ț': 't', 'Ă': 'A', 'Ș': 'S', 'Ț': 'T', ' ': '_', '-': ''
};

const normalizeString = (input: string) =>
  input
    .split('')
    .map((char) => normalizeChars[char] || char)
    .join('');

export const generateFileName = (file: Express.Multer.File) => {
  const splitted = normalizeString(file.originalname).split('.');

  return (
    splitted.slice(0, splitted.length - 1).join('') +
    '_' +
    generateRandomString(8) +
    '.' +
    splitted[splitted.length - 1]
  );
};

export const generateFileChecksum = (file: Express.Multer.File) => {
  try {
    return crypto
      .MD5(file.buffer.toString('hex').substring(0, 536870912))
      .toString();
  } catch (error) {
    console.error('Error while generating checksum:', error);
    return crypto.MD5(file.originalname + file.size + file.mimetype).toString();
  }
};

export const removeFileFromDisk = (fileName: string) => {
  const uploadFolder = path.resolve(process.env.UPLOAD_FOLDER);
  const uploadPath = path.resolve(uploadFolder, fileName);

  if (!fs.existsSync(uploadPath)) {
    return;
  }

  fs.unlinkSync(uploadPath);
};

export const getFileMimeType = (fileName: string) => {
  const type = lookup(fileName);
  return type || 'application/octet-stream';
};
