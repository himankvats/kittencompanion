/**
 * OTPService — generates, hashes, and verifies one-time passcodes using PBKDF2.
 * Plaintext OTPs are never persisted; only the salted hash is stored.
 * See TDD Section 3.1 for algorithm specification.
 */

import crypto from 'crypto';

export class OTPService {
  static generateOTP(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  static hashOTP(otp: string): string {
    const salt = crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(otp, salt, 10_000, 64, 'sha256');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  // storedHash format: "<saltHex>:<hashHex>"
  static verifyOTP(storedHash: string, providedOTP: string): boolean {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');
    const actualHash = crypto.pbkdf2Sync(providedOTP, salt, 10_000, 64, 'sha256');
    return crypto.timingSafeEqual(expectedHash, actualHash);
  }

  static isOTPExpired(expiresAt: Date): boolean {
    return Date.now() > expiresAt.getTime();
  }
}

export default OTPService;
