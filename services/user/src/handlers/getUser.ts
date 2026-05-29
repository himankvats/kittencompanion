/**
 * Handles GET /users/{user_id}. Returns the authenticated user's profile.
 * Checks Redis cache first (5-min TTL) before querying the database.
 * See TDD Section 2.2.1 for full API contract and response format.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UserService } from '../services/user.service';
import { RedisService } from '../services/redis.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';

// TODO: Implement getUserHandler (TDD Section 2.2.1)
// Steps:
//   1. Extract user_id from path parameters
//   2. Verify JWT sub matches requested user_id (TDD Section 11.2)
//   3. Check Redis cache: key "user:{user_id}" with 5-min TTL
//   4. On cache miss: query users table, cache result
//   5. Return 200 with user profile object
//   6. Return 404 if user not found or soft-deleted
export const getUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.2.1');
};

export default getUserHandler;
