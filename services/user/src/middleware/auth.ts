/**
 * JWT validation middleware for the user service. Extracts and verifies the
 * Bearer token from the Authorization header before passing control to handlers.
 * See TDD Section 11.2 for authentication and authorization specification.
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { getSecret } from '../config/secrets';
import { redis } from '../services/redis.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { JWTClaims } from '../types/user.types';

export async function validateJWT(event: APIGatewayProxyEvent): Promise<JWTClaims> {
  const authHeader = event.headers?.Authorization ?? event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);

  let claims: JWTClaims;
  try {
    const secret = await getSecret('jwt-secret');
    claims = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTClaims;
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

  // Ensure the token hasn't been revoked (e.g. via logout)
  const activeKey = `jwt:active:${token}`;
  const isActive = await redis.get(activeKey);
  if (!isActive) {
    throw new CustomError(401, 'TOKEN_REVOKED', 'Token has been revoked');
  }

  return claims;
}

export function verifyOwnership(jwtUserId: string, resourceOwnerId: string): void {
  if (jwtUserId !== resourceOwnerId) {
    throw new CustomError(403, 'FORBIDDEN', 'You are not authorized to access this resource');
  }
}

export default validateJWT;
