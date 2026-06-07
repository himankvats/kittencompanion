/**
 * Unit tests for updateUserHandler. Verifies field validation, cache invalidation,
 * and correct DB update behaviour. See TDD Section 7.1.
 */

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { updateUserHandler } from '../../src/handlers/updateUser';
import { CustomError } from '../../src/utils/errors';

jest.mock('../../src/config/database', () => ({
  pool: { query: jest.fn() },
}));
jest.mock('../../src/services/redis.service');
jest.mock('../../src/services/user.service');
jest.mock('../../src/middleware/auth');

import { pool } from '../../src/config/database';
import { RedisService } from '../../src/services/redis.service';
import { UserService } from '../../src/services/user.service';
import { validateJWT, verifyOwnership } from '../../src/middleware/auth';

const mockValidateJWT = validateJWT as jest.MockedFunction<typeof validateJWT>;
const mockVerifyOwnership = verifyOwnership as jest.MockedFunction<typeof verifyOwnership>;
const mockRedisInvalidate = RedisService.invalidate as jest.MockedFunction<typeof RedisService.invalidate>;
const mockUpdateUser = UserService.updateUser as jest.MockedFunction<typeof UserService.updateUser>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPoolQuery = pool.query as jest.MockedFunction<any>;

const mockContext: Context = { awsRequestId: 'test-id' } as Context;

const mockUpdatedUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Jane',
  last_name: 'Smith',
  notification_preferences: {
    reminder_time: '20:00',
    reminder_channel: 'email' as const,
    reminder_frequency: 'daily' as const,
    enabled: true,
  },
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-05-31'),
  deleted_at: null,
};

function makeEvent(userId: string, body: unknown): APIGatewayProxyEvent {
  return {
    path: `/users/${userId}`,
    httpMethod: 'PUT',
    pathParameters: { user_id: userId },
    headers: { Authorization: 'Bearer mock-token' },
    body: JSON.stringify(body),
  } as unknown as APIGatewayProxyEvent;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockValidateJWT.mockResolvedValue({ sub: 'user-123', email: 'test@example.com', iat: 0, exp: 9999999999, type: 'user' });
  mockVerifyOwnership.mockReturnValue(undefined);
  mockRedisInvalidate.mockResolvedValue(undefined);
  mockUpdateUser.mockResolvedValue(mockUpdatedUser);
  mockPoolQuery.mockResolvedValue({ rows: [] });
});

describe('updateUserHandler', () => {
  it('should return 200 with updated profile on valid request', async () => {
    const result = await updateUserHandler(makeEvent('user-123', { last_name: 'Smith' }), mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.last_name).toBe('Smith');
    expect(body.deleted_at).toBeUndefined();
  });

  it('should invalidate Redis cache after successful update', async () => {
    await updateUserHandler(makeEvent('user-123', { first_name: 'Jane' }), mockContext);

    expect(mockRedisInvalidate).toHaveBeenCalledWith('user:user-123');
  });

  it('should return 400 for invalid reminder_time format (not HH:MM)', async () => {
    await expect(
      updateUserHandler(
        makeEvent('user-123', { notification_preferences: { reminder_time: '25:00' } }),
        mockContext
      )
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_REMINDER_TIME' });
  });

  it('should return 400 when first_name exceeds 100 characters', async () => {
    await expect(
      updateUserHandler(makeEvent('user-123', { first_name: 'A'.repeat(101) }), mockContext)
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_FIRST_NAME' });
  });

  it("should return 403 when updating another user's profile", async () => {
    mockVerifyOwnership.mockImplementation(() => {
      throw new CustomError(403, 'FORBIDDEN', 'You are not authorized to access this resource');
    });

    await expect(
      updateUserHandler(makeEvent('other-user', { first_name: 'Jane' }), mockContext)
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  it('should log audit entry "user_updated" on success', async () => {
    await updateUserHandler(makeEvent('user-123', { first_name: 'Jane' }), mockContext);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO audit_logs'),
      expect.arrayContaining(['user-123', 'user_updated'])
    );
  });
});
