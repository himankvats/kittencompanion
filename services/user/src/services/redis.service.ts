/**
 * RedisService — cache get/set/invalidate operations for the user service.
 * Uses ioredis. Keys follow the pattern "user:{userId}" with 5-minute TTL.
 * See TDD Section 5.1 for caching strategy.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  lazyConnect: true,
});

const DEFAULT_TTL_SECONDS = 300; // 5 minutes per TDD Section 5.1

export class RedisService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.warn('Redis get failed', { key, error: String(err) });
      return null;
    }
  }

  static async set(key: string, value: unknown, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn('Redis set failed', { key, error: String(err) });
    }
  }

  static async invalidate(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.warn('Redis invalidate failed', { keys, error: String(err) });
    }
  }
}

export default RedisService;
