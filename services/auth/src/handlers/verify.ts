/**
 * Handles POST /auth/verify. Validates the OTP token, creates the user record if first signup,
 * generates a JWT, stores it in Redis, and returns it to the caller.
 * See TDD Section 2.1.2 for full API contract and JWT payload specification.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { OTPService } from '../services/otp.service';
import { JWTService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import type { VerifyRequest } from '../types/auth.types';

export const verifyHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let body: VerifyRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as VerifyRequest;
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { otp_token } = body;
  if (!otp_token) {
    throw new CustomError(400, 'MISSING_TOKEN', 'otp_token is required');
  }

  // Look up the most recent unused OTP for this code
  const tokenResult = await pool.query<{
    id: string; email: string; first_name: string; last_name: string;
    token_hash: string; expires_at: Date; used_at: Date | null;
  }>(
    `SELECT id, email, first_name, last_name, token_hash, expires_at, used_at
     FROM otp_tokens WHERE otp_code = $1 AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [otp_token]
  );

  if (tokenResult.rows.length === 0) {
    throw new CustomError(401, 'INVALID_OTP', 'OTP is invalid or expired. Request a new code.');
  }

  const tokenRow = tokenResult.rows[0];

  if (OTPService.isOTPExpired(tokenRow.expires_at)) {
    throw new CustomError(401, 'OTP_EXPIRED', 'OTP is invalid or expired. Request a new code.');
  }

  if (!OTPService.verifyOTP(tokenRow.token_hash, otp_token)) {
    throw new CustomError(401, 'INVALID_OTP', 'OTP is invalid or expired. Request a new code.');
  }

  await pool.query('UPDATE otp_tokens SET used_at = NOW() WHERE id = $1', [tokenRow.id]);

  let user = await UserService.getUserByEmail(tokenRow.email);
  const isNewUser = !user;
  if (!user) {
    user = await UserService.createUser(tokenRow.email, tokenRow.first_name, tokenRow.last_name);
  }

  const jwtToken = await JWTService.generateJWT(user.id, user.email);
  const expiresIn = parseInt(process.env.JWT_EXPIRY ?? '604800', 10);

  // Store token in Redis so logout can revoke it
  await redis.set(`jwt:active:${jwtToken}`, user.id, 'EX', expiresIn);

  logger.info('OTP verified, JWT issued', {
    userId: user.id,
    email: user.email,
    isNewUser,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jwt_token: jwtToken,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      expires_in: expiresIn,
    }),
  };
};

export default verifyHandler;
