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
import com.newcat.checkin.dto.CheckinRequest;
import com.newcat.checkin.dto.CheckinResponse;
import com.newcat.checkin.service.CheckinService;
import com.newcat.checkin.util.JWTValidator;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Component
public class CheckinController {

    @Autowired
    private CheckinService checkinService;

    @Autowired
    private JWTValidator jwtValidator;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules()
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    /**
     * Routes:
     *   POST /checkins                → createCheckin (TDD Section 2.4.1)
     *   GET  /pets/{petId}/checkins   → getCheckinHistory (TDD Section 2.4.2)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        String path = input.getPath();
        String method = input.getHttpMethod();

        // Resolve Authorization header (API Gateway may lowercase header names)
        String authHeader = null;
        if (input.getHeaders() != null) {
            authHeader = input.getHeaders().get("Authorization");
            if (authHeader == null) {
                authHeader = input.getHeaders().get("authorization");
            }
        }

        String requestId = (input.getRequestContext() != null
                && input.getRequestContext().getRequestId() != null)
                ? input.getRequestContext().getRequestId()
                : "unknown";

        try {
            Claims claims = jwtValidator.validateToken(authHeader);
            String userId = claims.getSubject();

            // POST /checkins
            if ("POST".equals(method) && "/checkins".equals(path)) {
                CheckinRequest req = objectMapper.readValue(input.getBody(), CheckinRequest.class);
                CheckinResponse resp = checkinService.createCheckin(userId, req);
                return response(201, objectMapper.writeValueAsString(resp));
            }

            // GET /pets/{petId}/checkins
            if ("GET".equals(method) && path != null && path.matches("/pets/[^/]+/checkins")) {
                String[] parts = path.split("/");
                String petId = parts[2];

                int limit = 30;
                int offset = 0;
                if (input.getQueryStringParameters() != null) {
                    String limitParam = input.getQueryStringParameters().get("limit");
                    String offsetParam = input.getQueryStringParameters().get("offset");
                    if (limitParam != null) limit = Integer.parseInt(limitParam);
                    if (offsetParam != null) offset = Integer.parseInt(offsetParam);
                }

                Object result = checkinService.getCheckinHistory(petId, userId, limit, offset);
                return response(200, objectMapper.writeValueAsString(result));
            }

            return response(404, errorBody("NOT_FOUND", "Route not found", requestId));

        } catch (ResponseStatusException e) {
            return response(e.getStatusCode().value(),
                    errorBody("ERROR", e.getReason(), requestId));
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CheckinController.class)
                    .error("Unhandled exception [{}]: {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return response(500, errorBody("INTERNAL_SERVER_ERROR", "Internal server error", requestId));
        }
    }

    // ---- helpers ----

    private APIGatewayProxyResponseEvent response(int status, String body) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(status)
                .withHeaders(Map.of("Content-Type", "application/json"))
                .withBody(body);
    }

    private String errorBody(String error, String message, String requestId) {
        // Escape message to avoid breaking JSON
        String safeMessage = message == null ? "" : message.replace("\"", "'");
        return String.format(
                "{\"error\":\"%s\",\"message\":\"%s\",\"request_id\":\"%s\"}",
                error, safeMessage, requestId);
    }
}
