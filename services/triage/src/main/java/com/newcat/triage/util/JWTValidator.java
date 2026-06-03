package com.newcat.triage.util;

/**
 * JWT validator for the triage service. See TDD Section 11.2.
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;

@Component
public class JWTValidator {

    /**
     * Validates a Bearer token from the Authorization header.
     * Returns the JWT Claims payload on success.
     * Throws 401 if header is missing/malformed or token is invalid/expired.
     */
    public Claims validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            String jwtSecret = System.getenv("JWT_SECRET");
            if (jwtSecret == null) {
                jwtSecret = "dev-secret-change-in-production-must-be-32chars";
            }
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            SecretKey key = Keys.hmacShaKeyFor(keyBytes);
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    /**
     * Asserts that the JWT user matches the resource owner.
     * Throws 403 Forbidden if they differ.
     */
    public void verifyOwnership(String jwtUserId, String resourceOwnerId) {
        if (!jwtUserId.equals(resourceOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
        }
    }
}
