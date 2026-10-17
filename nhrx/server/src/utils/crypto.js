// AES-256-GCM field encryption — Encrypt-on-Write / Decrypt-on-Read
require('dotenv').config();
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
  return Buffer.from(hex, 'hex');
}

/** Returns "iv:authTag:ciphertext" (hex) */
function encrypt(plainText) {
  if (plainText == null) return plainText;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

function decrypt(payload) {
  if (!payload) return payload;
  try {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    return '[Unable to decrypt]';
  }
}

const SENSITIVE_FIELDS = ['diagnosis', 'treatment'];

function encryptCase(data) {
  const out = { ...data };
  SENSITIVE_FIELDS.forEach((f) => { if (out[f] !== undefined) out[f] = encrypt(out[f]); });
  return out;
}

function decryptCase(record) {
  const out = { ...record };
  SENSITIVE_FIELDS.forEach((f) => { if (out[f]) out[f] = decrypt(out[f]); });
  return out;
}

module.exports = { encrypt, decrypt, encryptCase, decryptCase };
