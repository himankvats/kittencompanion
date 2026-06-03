package com.newcat.checkin.util;

/**
 * JWT validator for the check-in service. Same logic as pet/util/JWTValidator.
 * See TDD Section 11.2 for specification.
 * TODO: Extract to a shared library once multiple services are implemented.
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;

@Component
public class JWTValidator {

    /**
     * Validates the Authorization header and returns JWT claims.
     * Expects header in the form "Bearer <token>".
     * Throws 401 if missing, malformed, or expired.
     */
    public Claims validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Missing or invalid Authorization header");
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
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid or expired token");
        }
    }

    /**
     * Asserts that the JWT subject matches the resource owner.
     * Throws 403 if they do not match.
     */
    public void verifyOwnership(String jwtUserId, String resourceOwnerId) {
        if (!jwtUserId.equals(resourceOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to access this resource");
        }
    }
}
