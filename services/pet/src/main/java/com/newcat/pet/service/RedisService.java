package com.newcat.pet.service;

/**
 * Redis cache service for pet profiles. Uses Spring Data Redis (Lettuce client).
 * Cache keys follow the pattern "pet:{petId}" with 5-minute TTL.
 * See TDD Section 5.1 for caching strategy.
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.pet.util.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class RedisService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private final ObjectMapper mapper = new ObjectMapper();
    private static final Logger logger = new Logger(RedisService.class);
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(5);

    public <T> Optional<T> get(String key, Class<T> type) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return Optional.empty();
            }
            return Optional.of(mapper.readValue(value, type));
        } catch (Exception e) {
            logger.error("Redis get failed", e, "key", key);
            return Optional.empty();
        }
    }

    public boolean setWithTTL(String key, Object value, int ttlSeconds) {
        try {
            String json = mapper.writeValueAsString(value);
            redisTemplate.opsForValue().set(key, json, Duration.ofSeconds(ttlSeconds));
            return true;
        } catch (Exception e) {
            logger.error("Redis set failed", e, "key", key);
            return false;
        }
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            logger.error("Redis delete failed", e, "key", key);
        }
    }
}
