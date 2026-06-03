/**
 * Handles DELETE /users/{user_id}. Initiates the two-step account deletion flow
 * by generating a confirmation token and emailing it to the user.
 * See TDD Section 2.2.3 for full API contract and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import crypto from 'crypto';
import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';
import { validateJWT, verifyOwnership } from '../middleware/auth';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export const deleteUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.user_id;
  if (!userId) {
    throw new CustomError(400, 'MISSING_USER_ID', 'user_id path parameter is required');
  }

  const claims = await validateJWT(event);
  verifyOwnership(claims.sub, userId);

  const user = await UserService.getUserById(userId);
  if (!user) {
    throw new CustomError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const expiryMinutes = 1440; // 24 hours

  await pool.query(
    `INSERT INTO otp_tokens(email, first_name, last_name, token_hash, otp_code, expires_at)
     VALUES($1, $2, $3, $4, $5, NOW() + ($6 || ' minutes')::INTERVAL)`,
    [user.email, user.first_name, user.last_name, confirmationToken, confirmationToken, expiryMinutes]
  );

  await EmailService.sendDeletionConfirmationEmail(user.email, user.first_name, confirmationToken);

  await pool.query(
    `INSERT INTO audit_logs(user_id, action, metadata) VALUES($1, $2, $3)`,
    [userId, 'deletion_requested', JSON.stringify({ email: user.email })]
  );

  logger.info('Account deletion requested', { userId, email: user.email });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Deletion confirmation email sent. Check your inbox and confirm within 24 hours.',
      email: user.email,
    }),
  };
};

export default deleteUserHandler;
