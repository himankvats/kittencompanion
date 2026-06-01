/**
 * Handles POST /auth/signup. Validates email and name fields, generates a one-time
 * passcode, stores the hashed OTP, and sends it to the user via SendGrid.
 * See TDD Section 2.1.1 for full API contract and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { UserService } from '../services/user.service';
import { validateEmail, validateName } from '../utils/validation';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';
import type { SignupRequest } from '../types/auth.types';

export const signupHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let body: SignupRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as SignupRequest;
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { email, first_name, last_name } = body;

  if (!email || !validateEmail(email)) {
    throw new CustomError(400, 'INVALID_EMAIL', 'Email format is invalid');
  }
  if (!first_name || !validateName(first_name)) {
    throw new CustomError(400, 'INVALID_NAME', 'first_name must be 1-100 chars, letters/hyphens/apostrophes only');
  }
  if (!last_name || !validateName(last_name)) {
    throw new CustomError(400, 'INVALID_NAME', 'last_name must be 1-100 chars, letters/hyphens/apostrophes only');
  }

  const existing = await UserService.getUserByEmail(email);
  if (existing) {
    throw new CustomError(409, 'EMAIL_ALREADY_REGISTERED', 'This email is already registered. Use /auth/login instead.');
  }

  const otp = OTPService.generateOTP();
  const tokenHash = OTPService.hashOTP(otp);
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES ?? '1440', 10);

  await pool.query(
    `INSERT INTO otp_tokens(email, first_name, last_name, token_hash, otp_code, expires_at)
     VALUES($1, $2, $3, $4, $5, NOW() + ($6 || ' minutes')::INTERVAL)`,
    [email, first_name, last_name, tokenHash, otp, expiryMinutes]
  );

  await EmailService.sendOTPEmail(email, first_name, otp);

  logger.info('Signup OTP sent', { email });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'OTP sent to email. Valid for 24 hours.',
      email,
      expires_in_seconds: expiryMinutes * 60,
    }),
  };
};

export default signupHandler;
