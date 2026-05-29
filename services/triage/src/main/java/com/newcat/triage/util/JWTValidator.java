package com.newcat.triage.util;

/**
 * JWT validator for the triage service. See TDD Section 11.2.
 */

import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

@Component
public class JWTValidator {

    /** TODO: Implement validateToken (TDD Section 11.2) */
    public Claims validateToken(String token) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }

    /** TODO: Implement verifyOwnership (TDD Section 11.2) */
    public void verifyOwnership(String jwtUserId, String resourceOwnerId) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }
}
