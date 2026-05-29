/**
 * OTPService — generates, hashes, and verifies one-time passcodes using PBKDF2.
 * Plaintext OTPs are never persisted; only the salted hash is stored.
 * See TDD Section 3.1 for algorithm specification.
 */

import crypto from 'crypto';

export class OTPService {
  // TODO: Implement generateOTP (TDD Section 3.1)
  // Returns a 6-digit zero-padded numeric string (e.g., "042371")
  static generateOTP(): string {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement hashOTP (TDD Section 3.1)
  // Uses PBKDF2 with random 32-byte salt; returns "<saltHex>:<hashHex>"
  static hashOTP(otp: string): string {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement verifyOTP (TDD Section 3.1)
  // Splits stored hash, re-derives hash, and compares with constant-time comparison
  static verifyOTP(storedHash: string, providedOTP: string): boolean {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement isOTPExpired (TDD Section 3.1)
  // Returns true if the current time is past the given expiry timestamp
  static isOTPExpired(expiresAt: Date): boolean {
    throw new Error('Not implemented - see TDD Section 3.1');
  }
}

export default OTPService;
