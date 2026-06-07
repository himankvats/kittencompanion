/**
 * Unit tests for getUserHandler. Mocks database and Redis to test routing
 * and response shaping in isolation. See TDD Section 7.1.
 */

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { getUserHandler } from '../../src/handlers/getUser';
import { CustomError } from '../../src/utils/errors';

jest.mock('../../src/config/database');
jest.mock('../../src/services/redis.service');
jest.mock('../../src/services/user.service');
jest.mock('../../src/middleware/auth');

import { RedisService } from '../../src/services/redis.service';
import { UserService } from '../../src/services/user.service';
import { validateJWT, verifyOwnership } from '../../src/middleware/auth';

const mockValidateJWT = validateJWT as jest.MockedFunction<typeof validateJWT>;
const mockVerifyOwnership = verifyOwnership as jest.MockedFunction<typeof verifyOwnership>;
const mockRedisGet = RedisService.get as jest.MockedFunction<typeof RedisService.get>;
const mockRedisSet = RedisService.set as jest.MockedFunction<typeof RedisService.set>;
const mockGetUserById = UserService.getUserById as jest.MockedFunction<typeof UserService.getUserById>;

const mockContext: Context = { awsRequestId: 'test-id' } as Context;

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  notification_preferences: {
    reminder_time: '19:00',
    reminder_channel: 'email' as const,
    reminder_frequency: 'daily' as const,
    enabled: true,
  },
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  deleted_at: null,
};

function makeEvent(userId: string): APIGatewayProxyEvent {
  return {
    path: `/users/${userId}`,
    httpMethod: 'GET',
    pathParameters: { user_id: userId },
    headers: { Authorization: 'Bearer mock-token' },
    body: null,
  } as unknown as APIGatewayProxyEvent;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockValidateJWT.mockResolvedValue({ sub: 'user-123', email: 'test@example.com', iat: 0, exp: 9999999999, type: 'user' });
  mockVerifyOwnership.mockReturnValue(undefined);
  mockRedisSet.mockResolvedValue(undefined);
});

describe('getUserHandler', () => {
  it('should return 200 with user profile on cache hit', async () => {
    mockRedisGet.mockResolvedValue(mockUser);

    const result = await getUserHandler(makeEvent('user-123'), mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.id).toBe('user-123');
    expect(body.email).toBe('test@example.com');
    expect(body.deleted_at).toBeUndefined();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should return 200 with user profile on cache miss (queries DB and caches result)', async () => {
    mockRedisGet.mockResolvedValue(null);
    mockGetUserById.mockResolvedValue(mockUser);

    const result = await getUserHandler(makeEvent('user-123'), mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.id).toBe('user-123');
    expect(mockGetUserById).toHaveBeenCalledWith('user-123');
    expect(mockRedisSet).toHaveBeenCalledWith('user:user-123', mockUser, 300);
  });

  it('should return 401 when JWT is missing or invalid', async () => {
    mockValidateJWT.mockRejectedValue(new CustomError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header'));

    await expect(getUserHandler(makeEvent('user-123'), mockContext)).rejects.toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it("should return 403 when requesting another user's profile", async () => {
    mockVerifyOwnership.mockImplementation(() => {
      throw new CustomError(403, 'FORBIDDEN', 'You are not authorized to access this resource');
    });

    await expect(getUserHandler(makeEvent('other-user'), mockContext)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  it('should return 404 when user does not exist or is soft-deleted', async () => {
    mockRedisGet.mockResolvedValue(null);
    mockGetUserById.mockResolvedValue(null);

    await expect(getUserHandler(makeEvent('user-123'), mockContext)).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  });
});
