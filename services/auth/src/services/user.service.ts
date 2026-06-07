/**
 * UserService — database operations for user records used within the auth flow.
 * Handles lookup-by-email and initial user creation after OTP verification.
 * See TDD Section 3.1 and the users table schema (TDD Section 1.2).
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';
import type { User } from '../types/auth.types';

export class UserService {
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    return result.rows[0] ?? null;
  }

  static async createUser(email: string, firstName: string, lastName: string): Promise<User> {
    const result = await pool.query<User>(
      'INSERT INTO users(email, first_name, last_name) VALUES($1, $2, $3) RETURNING *',
      [email.toLowerCase(), firstName, lastName]
    );
    logger.info('User created', { email });
    return result.rows[0];
  }
}

export default UserService;
