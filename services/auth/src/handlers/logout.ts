/**
 * Handles POST /auth/logout. Removes the provided JWT from Redis, effectively
 * invalidating it for all future requests.
 * See TDD Section 2.1.4 for full API contract and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { JWTService } from '../services/jwt.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import type { LogoutRequest } from '../types/auth.types';

export const logoutHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let body: LogoutRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as LogoutRequest;
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { jwt_token } = body;
  if (!jwt_token) {
    throw new CustomError(400, 'MISSING_FIELDS', 'jwt_token is required');
  }

  // Determine remaining TTL — soft decode so expired tokens can still be blocklisted
  let remainingTtl = 3600;
  try {
    const payload = await JWTService.verifyJWT(jwt_token);
    remainingTtl = payload.exp - Math.floor(Date.now() / 1000);
  } catch {
    // Token expired or invalid — blocklist with default TTL to prevent any reuse window
    logger.info('Logout with already-expired or invalid token', { tokenPrefix: jwt_token.slice(0, 20) });
  }

  if (remainingTtl > 0) {
    await redis.set(`jwt:blocklist:${jwt_token}`, '1', 'EX', remainingTtl);
  }

  logger.info('User logged out', { tokenPrefix: jwt_token.slice(0, 20) });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Logged out successfully' }),
  };
};

export default logoutHandler;
