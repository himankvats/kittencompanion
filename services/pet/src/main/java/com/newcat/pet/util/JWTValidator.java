package com.newcat.pet.util;

/**
 * Validates HS256 JWT tokens extracted from the Authorization header.
 * Fetches the signing key from AWS Secrets Manager at startup.
 * See TDD Section 11.2 for full authentication and authorization specification.
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

@Component
public class JWTValidator {

    // TODO: Inject signing key from AWS Secrets Manager on startup (TDD Section 11.2)
    private SecretKey key;

    /**
     * Validates the JWT and returns its Claims.
     * TODO: Implement (TDD Section 11.2)
     * - Parse with JJWT Jwts.parserBuilder()
     * - Throw RuntimeException("TOKEN_EXPIRED") on expiry
     * - Throw RuntimeException("INVALID_TOKEN") on any other failure
     */
    public Claims validateToken(String token) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }

    /**
     * Verifies that the JWT subject matches the resource owner.
     * TODO: Implement (TDD Section 11.2)
     * - Throws RuntimeException("FORBIDDEN") if userId != resourceOwnerId
     */
    public void verifyOwnership(String userId, String resourceOwnerId) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }
}
