import crypto from 'crypto';

// Use a secure key from environment or fallback for development (do not use fallback in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 chars
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY not set in production environment!');
}

/**
 * Encrypts text using AES-256-CBC with a random IV.
 * Returns format: "iv:encryptedData" (both in hex)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text on error to prevent data loss (or throw?)
  }
}

/**
 * Decrypts text using AES-256-CBC.
 * Expects format: "iv:encryptedData"
 * If format doesn't match or decryption fails, returns original text (legacy support).
 */
export function decrypt(text: string): string {
  if (!text) return text;
  
  const textParts = text.split(':');
  if (textParts.length < 2) {
    // Not encrypted or legacy data
    return text;
  }

  try {
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    // Silent fail for mixed content (might be plain text containing a colon)
    // or wrong key. Returning original text is usually safer than crashing.
    return text; 
  }
}
