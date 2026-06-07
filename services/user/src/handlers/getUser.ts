/**
 * Handles GET /users/{user_id}. Returns the authenticated user's profile.
 * Checks Redis cache first (5-min TTL) before querying the database.
 * See TDD Section 2.2.1 for full API contract and response format.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UserService } from '../services/user.service';
import { RedisService } from '../services/redis.service';
import { validateJWT, verifyOwnership } from '../middleware/auth';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { User } from '../types/user.types';

export const getUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.id;
  if (!userId) {
    throw new CustomError(400, 'MISSING_USER_ID', 'user_id path parameter is required');
  }

  const claims = await validateJWT(event);
  verifyOwnership(claims.sub, userId);

  const cacheKey = `user:${userId}`;
  const cached = await RedisService.get<User>(cacheKey);
  if (cached) {
    logger.info('User served from cache', { userId });
    return respond(200, formatUser(cached));
  }

  const user = await UserService.getUserById(userId);
  if (!user) {
    throw new CustomError(404, 'USER_NOT_FOUND', 'User not found');
  }

  await RedisService.set(cacheKey, user, 300);
  logger.info('User fetched from DB', { userId });

  return respond(200, formatUser(user));
};

function formatUser(user: User): Record<string, unknown> {
  const { deleted_at: _deleted, ...rest } = user;
  return rest;
}

function respond(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export default getUserHandler;
