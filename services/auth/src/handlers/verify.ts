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
import type { VerifyRequest } from '../types/auth.types';

// TODO: Implement verifyHandler (TDD Section 2.1.2)
// Steps:
//   1. Parse otp_token from request body
//   2. Look up otp_tokens row by token_hash
//   3. Verify token is not expired and not already used (OTPService.verifyOTP)
//   4. Mark token as used (used_at = NOW())
//   5. Create or fetch user record (UserService.createUser / getUserByEmail)
//   6. Generate JWT via JWTService.generateJWT (HS256, 7 day expiry)
//   7. Store JWT in Redis for validation
//   8. Log audit entry: "signup" or "login_attempt"
//   9. Return 200 with { jwt_token, user, expires_in: 604800 }
export const verifyHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error('Not implemented - see TDD Section 2.1.2');
};

export default verifyHandler;
