const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

// Derive a consistent 32-byte key from the env variable
function getKey() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error('ENCRYPTION_KEY not set in environment');
  // Use SHA-256 to always get a 32-byte key regardless of input length
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a string
 * @param {string} text - Plain text to encrypt
 * @returns {{ encryptedData: string, iv: string }}
 */
function encrypt(text) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt a string
 * @param {string} encryptedData - Hex-encoded encrypted data
 * @param {string} ivHex - Hex-encoded IV
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData, ivHex) {
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypt a Buffer (for file encryption)
 * @param {Buffer} buffer
 * @returns {{ encryptedBuffer: Buffer, iv: string }}
 */
function encryptBuffer(buffer) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    encryptedBuffer: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt a Buffer
 * @param {Buffer} encryptedBuffer
 * @param {string} ivHex
 * @returns {Buffer}
 */
function decryptBuffer(encryptedBuffer, ivHex) {
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

module.exports = { encrypt, decrypt, encryptBuffer, decryptBuffer };
