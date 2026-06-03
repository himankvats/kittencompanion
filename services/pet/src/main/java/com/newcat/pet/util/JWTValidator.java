package com.newcat.pet.util;

/**
 * Validates HS256 JWT tokens extracted from the Authorization header.
 * Fetches the signing key from the JWT_SECRET environment variable at startup.
 * See TDD Section 11.2 for full authentication and authorization specification.
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

@Component
public class JWTValidator {

    @Value("${JWT_SECRET:}")
    private String jwtSecretBase64;

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (jwtSecretBase64 == null || jwtSecretBase64.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is not set");
        }
        byte[] keyBytes = jwtSecretBase64.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("TOKEN_EXPIRED");
        } catch (JwtException e) {
            throw new RuntimeException("INVALID_TOKEN");
        }
    }

    public void verifyOwnership(String userId, String resourceOwnerId) {
        if (userId == null || !userId.equals(resourceOwnerId)) {
            throw new RuntimeException("FORBIDDEN");
        }
    }
}
