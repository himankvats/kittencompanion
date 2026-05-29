/**
 * JWT validation middleware for the user service. Extracts and verifies the
 * Bearer token from the Authorization header before passing control to handlers.
 * See TDD Section 11.2 for authentication and authorization specification.
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { JWTClaims } from '../types/user.types';

// TODO: Implement validateJWT (TDD Section 11.2)
// Steps:
//   1. Extract Authorization header value
//   2. Strip "Bearer " prefix
//   3. Verify HS256 signature using JWT_SECRET from Secrets Manager
//   4. Check token exists in Redis (not logged out)
//   5. Return decoded claims { sub, email }
//   6. Throw CustomError(401, "UNAUTHORIZED") on any failure
export async function validateJWT(event: APIGatewayProxyEvent): Promise<JWTClaims> {
  throw new Error('Not implemented - see TDD Section 11.2');
}

// TODO: Implement verifyOwnership (TDD Section 11.2)
// Throws 403 FORBIDDEN if jwtUserId does not match resourceOwnerId
export function verifyOwnership(jwtUserId: string, resourceOwnerId: string): void {
  throw new Error('Not implemented - see TDD Section 11.2');
}

export default validateJWT;
