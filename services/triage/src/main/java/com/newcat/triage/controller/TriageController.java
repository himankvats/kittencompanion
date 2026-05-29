package com.newcat.triage.controller;

/**
 * Routes API Gateway events to triage operations (flag concern, get concern, resolve).
 * See TDD Section 2.5 for full API contracts.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.triage.service.TriageService;
import com.newcat.triage.util.JWTValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TriageController {

    @Autowired
    private TriageService triageService;

    @Autowired
    private JWTValidator jwtValidator;

    /**
     * TODO: Implement routing (TDD Section 2.5)
     * Routes:
     *   POST /concerns                         → flagConcern (TDD Section 2.5.1)
     *   GET  /concerns/{concernId}             → getConcern (TDD Section 2.5.2)
     *   POST /concerns/{concernId}/resolve     → resolveConcern (TDD Section 2.5.3)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.5");
    }
}
