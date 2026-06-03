/**
 * Handles PUT /users/{user_id}. Updates the user's profile fields and clears the Redis cache.
 * Only the authenticated user may update their own profile.
 * See TDD Section 2.2.2 for full API contract, validations, and side effects.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UserService } from '../services/user.service';
import { RedisService } from '../services/redis.service';
import { validateJWT, verifyOwnership } from '../middleware/auth';
import { validateName, validateReminderTime } from '../utils/validation';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { pool } from '../config/database';
import type { UpdateUserRequest, NotificationPreferences } from '../types/user.types';

export const updateUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.user_id;
  if (!userId) {
    throw new CustomError(400, 'MISSING_USER_ID', 'user_id path parameter is required');
  }

  const claims = await validateJWT(event);
  verifyOwnership(claims.sub, userId);

  let body: UpdateUserRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as UpdateUserRequest;
  } catch {
    throw new CustomError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const { first_name, last_name, notification_preferences } = body;

  if (first_name !== undefined) {
    if (!first_name || !validateName(first_name)) {
      throw new CustomError(400, 'INVALID_FIRST_NAME', 'first_name must be 1-100 characters, letters only');
    }
  }
  if (last_name !== undefined) {
    if (!last_name || !validateName(last_name)) {
      throw new CustomError(400, 'INVALID_LAST_NAME', 'last_name must be 1-100 characters, letters only');
    }
  }
  if (notification_preferences?.reminder_time !== undefined) {
    if (!validateReminderTime(notification_preferences.reminder_time)) {
      throw new CustomError(400, 'INVALID_REMINDER_TIME', 'reminder_time must be in HH:MM 24-hour format (e.g. "19:00")');
    }
  }

  const updates: UpdateUserRequest = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (notification_preferences !== undefined) updates.notification_preferences = notification_preferences as Partial<NotificationPreferences>;

  const updatedUser = await UserService.updateUser(userId, updates);

  await RedisService.invalidate(`user:${userId}`);

  await pool.query(
    `INSERT INTO audit_logs(user_id, action, metadata) VALUES($1, $2, $3)`,
    [userId, 'user_updated', JSON.stringify({ fields: Object.keys(updates) })]
  );

  logger.info('User updated', { userId });

  const { deleted_at: _deleted, ...userWithoutDeleted } = updatedUser;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userWithoutDeleted),
  };
};

export default updateUserHandler;
