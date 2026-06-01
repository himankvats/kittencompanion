/**
 * Handles POST /auth/login. Sends an OTP to an existing user's email.
 * Returns 404 if the email is not registered, directing them to /auth/signup.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { UserService } from '../services/user.service';
import { validateEmail } from '../utils/validation';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export const loginHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let body: { email: string };
  try {
    body = JSON.parse(event.body ?? '{}') as { email: string };
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { email } = body;

  if (!email || !validateEmail(email)) {
    throw new CustomError(400, 'INVALID_EMAIL', 'Email format is invalid');
  }

  const user = await UserService.getUserByEmail(email);
  if (!user) {
    throw new CustomError(404, 'EMAIL_NOT_FOUND', 'No account found for this email. Please sign up first.');
  }

  const otp = OTPService.generateOTP();
  const tokenHash = OTPService.hashOTP(otp);
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES ?? '1440', 10);

  await pool.query(
    `INSERT INTO otp_tokens(email, first_name, last_name, token_hash, otp_code, expires_at)
     VALUES($1, $2, $3, $4, $5, NOW() + ($6 || ' minutes')::INTERVAL)`,
    [email, user.first_name, user.last_name, tokenHash, otp, expiryMinutes]
  );

  await EmailService.sendOTPEmail(email, user.first_name, otp);

  logger.info('Login OTP sent', { email });

  const expirySeconds = expiryMinutes * 60;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'OTP sent to email. Valid for 24 hours.',
      email,
      expires_in_seconds: expirySeconds,
    }),
  };
};

export default loginHandler;
