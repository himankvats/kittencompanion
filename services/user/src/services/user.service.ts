/**
 * UserService — database CRUD operations for user profiles.
 * Includes soft-delete and hard-delete flows.
 * See TDD Section 3.2 and users table schema (TDD Section 1.2).
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';
import type { User, UpdateUserRequest } from '../types/user.types';

export class UserService {
  // TODO: Implement getUserById (TDD Section 2.2.1)
  static async getUserById(userId: string): Promise<User | null> {
    throw new Error('Not implemented - see TDD Section 2.2.1');
  }

  // TODO: Implement updateUser (TDD Section 2.2.2)
  // Updates first_name, last_name, notification_preferences
  static async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    throw new Error('Not implemented - see TDD Section 2.2.2');
  }

  // TODO: Implement deleteUser (TDD Section 2.2.4)
  // Hard deletes user row; ON DELETE CASCADE handles pets, checkins, etc.
  static async deleteUser(userId: string): Promise<void> {
    throw new Error('Not implemented - see TDD Section 2.2.4');
  }
}

// Internal re-export for use across the service
export const pool_ = pool;
export default UserService;
