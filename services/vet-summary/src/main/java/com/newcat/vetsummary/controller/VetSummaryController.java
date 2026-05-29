package com.newcat.vetsummary.controller;

/**
 * Routes API Gateway events to vet summary operations (generate, list).
 * See TDD Section 2.6 for full API contracts.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.vetsummary.service.VetSummaryService;
import com.newcat.vetsummary.util.JWTValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VetSummaryController {

    @Autowired
    private VetSummaryService vetSummaryService;

    @Autowired
    private JWTValidator jwtValidator;

    /**
     * TODO: Implement routing (TDD Section 2.6)
     * Routes:
     *   GET  /pets/{petId}/summaries   → generateSummary (TDD Section 2.6.1)
     *   POST /pets/{petId}/summaries   → generateSummary (alternative trigger)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6");
    }
}
