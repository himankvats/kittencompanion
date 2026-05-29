/**
 * Handles POST /auth/refresh. Validates an existing JWT and issues a new one with a
 * fresh 7-day expiry, replacing the old token in Redis.
 * See TDD Section 2.1.3 for full API contract.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { JWTService } from '../services/jwt.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';

// TODO: Implement refreshHandler (TDD Section 2.1.3)
// Steps:
//   1. Extract jwt_token from request body
//   2. Verify JWT is valid and not expired via JWTService.verifyJWT
//   3. Check JWT exists in Redis (not logged out)
//   4. Generate a new JWT with fresh expiry
//   5. Replace old token in Redis with new one
//   6. Return 200 with { jwt_token, expires_in: 604800 }
export const refreshHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.1.3');
};

export default refreshHandler;
