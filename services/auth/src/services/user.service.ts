/**
 * UserService — database operations for user records used within the auth flow.
 * Handles lookup-by-email and initial user creation after OTP verification.
 * See TDD Section 3.1 and the users table schema (TDD Section 1.2).
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';
import type { User } from '../types/auth.types';

export class UserService {
  // TODO: Implement getUserByEmail (TDD Section 3.1)
  // Query: SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL
  // Returns null if user does not exist
  static async getUserByEmail(email: string): Promise<User | null> {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement createUser (TDD Section 2.1.2)
  // Inserts a new row into users table with default notification_preferences
  // Returns the created User object
  static async createUser(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<User> {
    throw new Error('Not implemented - see TDD Section 2.1.2');
  }
}

export default UserService;
