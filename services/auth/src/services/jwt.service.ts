/**
 * JWTService — signs and verifies HS256 JSON Web Tokens.
 * Secrets are fetched from AWS Secrets Manager at runtime.
 * See TDD Section 3.1 for JWT payload specification and expiry rules.
 */

import jwt from 'jsonwebtoken';
import { getSecret } from '../config/secrets';
import { logger } from '../utils/logger';
import type { JWTPayload } from '../types/auth.types';

export class JWTService {
  // TODO: Implement generateJWT (TDD Section 3.1)
  // Algorithm: HS256
  // Payload: { sub: userId, email, iat, exp, type: "user" }
  // Expiry: 7 days (604800 seconds)
  // Secret: retrieved from AWS Secrets Manager key "jwt-secret"
  static async generateJWT(userId: string, email: string): Promise<string> {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement verifyJWT (TDD Section 3.1)
  // Verifies algorithm (HS256), issuer, and audience
  // Throws CustomError(401, "INVALID_TOKEN") on failure
  // Throws CustomError(401, "TOKEN_EXPIRED") when token is past expiry
  static async verifyJWT(token: string): Promise<JWTPayload> {
    throw new Error('Not implemented - see TDD Section 3.1');
  }
}

export default JWTService;
