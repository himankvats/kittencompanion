package com.newcat.checkin.util;

/**
 * JWT validator for the check-in service. Same logic as pet/util/JWTValidator.
 * See TDD Section 11.2 for specification.
 * TODO: Extract to a shared library once multiple services are implemented.
 */

import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

@Component
public class JWTValidator {

    /**
     * TODO: Implement validateToken (TDD Section 11.2)
     */
    public Claims validateToken(String token) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }

    /**
     * TODO: Implement verifyOwnership (TDD Section 11.2)
     */
    public void verifyOwnership(String jwtUserId, String resourceOwnerId) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 11.2");
    }
}
