package com.newcat.vetsummary.util;

/**
 * JWT validator for the vet summary service. See TDD Section 11.2.
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
     * Validates the Authorization header and returns the JWT claims.
     * Throws 401 if missing, malformed, or expired.
     */
    public Claims validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            String jwtSecret = System.getenv("JWT_SECRET");
            if (jwtSecret == null) jwtSecret = "dev-secret-change-in-production-must-be-32chars";
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            SecretKey key = Keys.hmacShaKeyFor(keyBytes);
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    /**
     * Verifies that the JWT user owns the resource. Throws 403 if not.
     */
    public void verifyOwnership(String jwtUserId, String resourceOwnerId) {
        if (!jwtUserId.equals(resourceOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
        }
    }
}
