/**
 * JWTService — signs and verifies HS256 JSON Web Tokens.
 * Secrets are fetched from AWS Secrets Manager at runtime.
 * See TDD Section 3.1 for JWT payload specification and expiry rules.
 */

import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { getSecret } from '../config/secrets';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/errors';
import type { JWTPayload } from '../types/auth.types';

export class JWTService {
  static async generateJWT(userId: string, email: string): Promise<string> {
    const secret = await getSecret('jwt-secret');
    const expiresIn = parseInt(process.env.JWT_EXPIRY ?? '604800', 10);
    return jwt.sign(
      { sub: userId, email, type: 'user' },
      secret,
      { algorithm: 'HS256', expiresIn }
    );
  }

  static async verifyJWT(token: string): Promise<JWTPayload> {
    const secret = await getSecret('jwt-secret');
    try {
      return jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        logger.info('JWT expired', { token: token.slice(0, 20) });
        throw new CustomError(401, 'TOKEN_EXPIRED', 'Token has expired');
      }
      if (err instanceof JsonWebTokenError) {
        throw new CustomError(401, 'INVALID_TOKEN', 'Token is invalid');
      }
      throw err;
    }
  }
}

export default JWTService;
