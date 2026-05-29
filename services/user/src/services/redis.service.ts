/**
 * RedisService — cache get/set/invalidate operations for the user service.
 * Uses ioredis. Keys follow the pattern "user:{userId}" with 5-minute TTL.
 * See TDD Section 5.1 for caching strategy.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  lazyConnect: true,
});

const DEFAULT_TTL_SECONDS = 300; // 5 minutes per TDD Section 5.1

export class RedisService {
  // TODO: Implement get (TDD Section 5.1)
  // Returns parsed JSON or null on cache miss
  static async get<T>(key: string): Promise<T | null> {
    throw new Error('Not implemented - see TDD Section 5.1');
  }

  // TODO: Implement set (TDD Section 5.1)
  // Stores JSON-serialised value with TTL
  static async set(key: string, value: unknown, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    throw new Error('Not implemented - see TDD Section 5.1');
  }

  // TODO: Implement invalidate (TDD Section 5.1)
  // Deletes one or more cache keys
  static async invalidate(...keys: string[]): Promise<void> {
    throw new Error('Not implemented - see TDD Section 5.1');
  }
}

export { redis };
export default RedisService;
