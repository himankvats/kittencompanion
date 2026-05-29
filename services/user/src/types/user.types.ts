/**
 * TypeScript type definitions for the user service. Mirrors the users table schema
 * (TDD Section 1.2) and API contracts (TDD Section 2.2).
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
  reminder_time: string;
  reminder_channel: 'email';
  reminder_frequency: 'daily' | 'every_other_day' | 'weekly';
  enabled: boolean;
}

// PUT /users/{user_id} request body — TDD Section 2.2.2
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  notification_preferences?: Partial<NotificationPreferences>;
}

// Claims extracted from JWT — TDD Section 11.2
export interface JWTClaims {
  sub: string;    // user UUID
  email: string;
  iat: number;
  exp: number;
  type: 'user';
}
