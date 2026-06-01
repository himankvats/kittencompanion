/**
 * Handles POST /auth/refresh. Validates an existing JWT and issues a new one with a
 * fresh 7-day expiry, replacing the old token in Redis.
 * See TDD Section 2.1.3 for full API contract.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { JWTService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import type { RefreshRequest } from '../types/auth.types';

export const refreshHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let body: RefreshRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as RefreshRequest;
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { jwt_token } = body;
  if (!jwt_token) {
    throw new CustomError(400, 'MISSING_FIELDS', 'jwt_token is required');
  }

  // Throws TOKEN_EXPIRED or INVALID_TOKEN if bad
  const payload = await JWTService.verifyJWT(jwt_token);

  // Check if token was explicitly revoked via logout
  const isBlocked = await redis.exists(`jwt:blocklist:${jwt_token}`);
  if (isBlocked) {
    throw new CustomError(401, 'INVALID_TOKEN', 'Token has been revoked');
  }

  const user = await UserService.getUserByEmail(payload.email);
  if (!user) {
    throw new CustomError(401, 'INVALID_TOKEN', 'User not found');
  }

  const newToken = await JWTService.generateJWT(user.id, user.email);
  const expiresIn = parseInt(process.env.JWT_EXPIRY ?? '604800', 10);

  // Blocklist the old token so it can't be refreshed again
  const oldTokenTtl = payload.exp - Math.floor(Date.now() / 1000);
  if (oldTokenTtl > 0) {
    await redis.set(`jwt:blocklist:${jwt_token}`, '1', 'EX', oldTokenTtl);
  }

  // Store new token so logout can revoke it
  await redis.set(`jwt:active:${newToken}`, user.id, 'EX', expiresIn);

  logger.info('JWT refreshed', { userId: user.id });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jwt_token: newToken,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      expires_in: expiresIn,
    }),
  };
};

export default refreshHandler;
