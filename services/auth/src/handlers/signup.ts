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

// TODO: Implement signupHandler (TDD Section 2.1.1)
// Steps:
//   1. Parse and validate request body (email, first_name, last_name)
//   2. Check if email is already registered via UserService.getUserByEmail
//   3. Generate 6-digit OTP via OTPService.generateOTP
//   4. Hash OTP via OTPService.hashOTP (never store plaintext)
//   5. Insert into otp_tokens table with 24h expiry
//   6. Send OTP email via EmailService.sendOTPEmail
//   7. Return 200 with { message, email, expires_in_seconds: 86400 }
export const signupHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.1.1');
};

export default signupHandler;
