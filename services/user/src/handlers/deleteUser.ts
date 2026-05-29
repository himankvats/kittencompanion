/**
 * Handles DELETE /users/{user_id}. Initiates the two-step account deletion flow
 * by generating a confirmation token and emailing it to the user.
 * See TDD Section 2.2.3 for full API contract and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UserService } from '../services/user.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';

// TODO: Implement deleteUserHandler (TDD Section 2.2.3)
// Steps:
//   1. Extract user_id from path, verify JWT ownership
//   2. Generate deletion confirmation token (24h expiry)
//   3. Store token (similar to OTP pattern)
//   4. Send confirmation email via EmailService
//   5. Log audit entry: "deletion_requested"
//   6. Return 200 with { message, email }
export const deleteUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.2.3');
};

export default deleteUserHandler;
