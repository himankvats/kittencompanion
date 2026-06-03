/**
 * Handles POST /users/{user_id}/confirm-deletion. Validates the confirmation token
 * and hard-deletes the user and all associated data (pets, check-ins, events, digests).
 * See TDD Section 2.2.4 for full API contract and cascading delete specification.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UserService } from '../services/user.service';
import { RedisService } from '../services/redis.service';
import { validateJWT, verifyOwnership } from '../middleware/auth';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export const confirmDeletionHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.user_id;
  if (!userId) {
    throw new CustomError(400, 'MISSING_USER_ID', 'user_id path parameter is required');
  }

  const claims = await validateJWT(event);
  verifyOwnership(claims.sub, userId);

  let body: { confirmation_token?: string };
  try {
    body = JSON.parse(event.body ?? '{}') as { confirmation_token?: string };
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { confirmation_token } = body;
  if (!confirmation_token) {
    throw new CustomError(400, 'MISSING_TOKEN', 'confirmation_token is required');
  }

  // Reuse the otp_tokens table — token was stored as both otp_code and token_hash
  const tokenResult = await pool.query<{
    id: string; email: string; expires_at: Date; used_at: Date | null;
  }>(
    `SELECT id, email, expires_at, used_at
     FROM otp_tokens
     WHERE otp_code = $1 AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [confirmation_token]
  );

  if (tokenResult.rows.length === 0) {
    throw new CustomError(400, 'INVALID_TOKEN', 'Confirmation token is invalid or already used');
  }

  const tokenRow = tokenResult.rows[0];

  if (new Date() > tokenRow.expires_at) {
    throw new CustomError(400, 'TOKEN_EXPIRED', 'Confirmation token has expired. Please request a new deletion email.');
  }

  await pool.query('UPDATE otp_tokens SET used_at = NOW() WHERE id = $1', [tokenRow.id]);

  // Hard delete — ON DELETE CASCADE removes pets → checkins → acute_events → digest_logs
  await UserService.deleteUser(userId);

  await RedisService.invalidate(`user:${userId}`);

  await pool.query(
    `INSERT INTO audit_logs(user_id, action, metadata) VALUES($1, $2, $3)`,
    [userId, 'deletion_confirmed', JSON.stringify({ email: tokenRow.email })]
  );

  logger.info('Account deletion confirmed', { userId });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Account and all associated data permanently deleted',
    }),
  };
};

export default confirmDeletionHandler;
