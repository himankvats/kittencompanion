/**
 * Handles POST /auth/logout. Removes the provided JWT from Redis, effectively
 * invalidating it for all future requests.
 * See TDD Section 2.1.4 for full API contract and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { JWTService } from '../services/jwt.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';

// TODO: Implement logoutHandler (TDD Section 2.1.4)
// Steps:
//   1. Extract jwt_token from request body
//   2. Remove token from Redis blocklist/store
//   3. Log audit entry: "logout"
//   4. Return 200 with { message: "Logged out successfully" }
export const logoutHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.1.4');
};

export default logoutHandler;
