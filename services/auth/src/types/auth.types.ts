/**
 * TypeScript type definitions for the auth service. Mirrors the database schema
 * (TDD Section 1.2, 1.9) and API contracts (TDD Section 2.1).
 */

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  notification_preferences: NotificationPreferences;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface NotificationPreferences {
  reminder_time: string;          // HH:MM 24h format
  reminder_channel: 'email';      // MVP: email only
  reminder_frequency: 'daily' | 'every_other_day' | 'weekly';
  enabled: boolean;
}

export interface OTPToken {
  id: string;
  email: string;
  token_hash: string;
  otp_code: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

// POST /auth/signup request body — TDD Section 2.1.1
export interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
}

// POST /auth/verify request body — TDD Section 2.1.2
export interface VerifyRequest {
  otp_token: string;
}

// POST /auth/refresh request body — TDD Section 2.1.3
export interface RefreshRequest {
  jwt_token: string;
}

// POST /auth/logout request body — TDD Section 2.1.4
export interface LogoutRequest {
  jwt_token: string;
}

// JWT payload as stored in the signed token — TDD Section 2.1.2
export interface JWTPayload {
  sub: string;        // user UUID
  email: string;
  iat: number;        // issued at (Unix timestamp)
  exp: number;        // expiry (Unix timestamp)
  type: 'user';
}

// Successful auth response — TDD Section 2.1.2
export interface AuthResponse {
  jwt_token: string;
  user: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;
  expires_in: number;  // seconds
}
