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

    /**
     * TODO: Implement get (TDD Section 5.1)
     * Fetches JSON-serialised value from Redis; returns empty Optional on miss.
     */
    public <T> Optional<T> get(String key, Class<T> type) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 5.1");
    }

    /**
     * TODO: Implement setWithTTL (TDD Section 5.1)
     * Serialises value to JSON and stores with given TTL in seconds.
     */
    public boolean setWithTTL(String key, Object value, int ttlSeconds) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 5.1");
    }

    /**
     * TODO: Implement delete (TDD Section 5.1)
     * Removes the key from Redis (cache invalidation).
     */
    public void delete(String key) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 5.1");
    }
}
