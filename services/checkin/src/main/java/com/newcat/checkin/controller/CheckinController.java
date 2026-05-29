package com.newcat.checkin.controller;

/**
 * Routes API Gateway events to check-in operations (create, get history).
 * Validates the JWT on every request before delegating to CheckinService.
 * See TDD Section 2.4 for API contracts.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.checkin.service.CheckinService;
import com.newcat.checkin.util.JWTValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CheckinController {

    @Autowired
    private CheckinService checkinService;

    @Autowired
    private JWTValidator jwtValidator;

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * TODO: Implement routing (TDD Section 2.4)
     * Routes:
     *   POST /checkins                   → createCheckin (TDD Section 2.4.1)
     *   GET  /pets/{petId}/checkins      → getCheckinHistory (TDD Section 2.4.2)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.4");
    }
}
