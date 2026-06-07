/**
 * UserService — database CRUD operations for user profiles.
 * Includes soft-delete and hard-delete flows.
 * See TDD Section 3.2 and users table schema (TDD Section 1.2).
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';
import type { User, UpdateUserRequest } from '../types/user.types';

export class UserService {
  static async getUserById(userId: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    return result.rows[0] ?? null;
  }

  static async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (updates.first_name !== undefined) {
      setClauses.push(`first_name = $${idx++}`);
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      setClauses.push(`last_name = $${idx++}`);
      values.push(updates.last_name);
    }
    if (updates.notification_preferences !== undefined) {
      // Merge into existing JSONB rather than replacing it entirely
      setClauses.push(`notification_preferences = notification_preferences || $${idx++}::jsonb`);
      values.push(JSON.stringify(updates.notification_preferences));
    }

    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query<User>(query, values);

    if (result.rows.length === 0) {
      const { CustomError } = await import('../utils/errors');
      throw new CustomError(404, 'USER_NOT_FOUND', 'User not found');
    }

    logger.info('User updated', { userId });
    return result.rows[0];
  }

  static async deleteUser(userId: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    logger.info('User hard-deleted', { userId });
  }
}

// Internal re-export for use across the service
export const pool_ = pool;
export default UserService;
