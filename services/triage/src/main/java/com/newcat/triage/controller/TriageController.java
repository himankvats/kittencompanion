package com.newcat.triage.controller;

/**
 * Routes API Gateway events to triage operations (flag concern, get concern, resolve).
 * See TDD Section 2.5 for full API contracts.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.triage.dto.ErrorResponse;
import com.newcat.triage.dto.TriageRequest;
import com.newcat.triage.dto.TriageResponse;
import com.newcat.triage.service.TriageService;
import com.newcat.triage.util.JWTValidator;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TriageController {

    private static final ObjectMapper mapper = new ObjectMapper()
            .findAndRegisterModules()
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final Pattern CONCERN_PATTERN = Pattern.compile("^/concerns/([^/]+)$");
    private static final Pattern RESOLVE_PATTERN = Pattern.compile("^/concerns/([^/]+)/resolve$");

    @Autowired
    private TriageService triageService;

    @Autowired
    private JWTValidator jwtValidator;

    /**
     * Routes incoming API Gateway events to the correct triage operation.
     *   POST /concerns                         → flagConcern (TDD Section 2.5.1)
     *   GET  /concerns/{concernId}             → getConcern (TDD Section 2.5.2)
     *   POST /concerns/{concernId}/resolve     → resolveConcern (TDD Section 2.5.3)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        String requestId = context != null ? context.getAwsRequestId() : "local";
        try {
            // Validate JWT and extract userId
            String authHeader = getHeader(input, "Authorization");
            Claims claims = jwtValidator.validateToken(authHeader);
            String userId = claims.getSubject();

            String path = input.getPath();
            String method = input.getHttpMethod();

            // POST /concerns → flagConcern
            if ("POST".equalsIgnoreCase(method) && "/concerns".equals(path)) {
                TriageRequest req = mapper.readValue(input.getBody(), TriageRequest.class);
                TriageResponse response = triageService.flagConcern(userId, req);
                return ok(mapper.writeValueAsString(response));
            }

            // GET /concerns/{concernId} → getConcern
            Matcher getConcernMatcher = CONCERN_PATTERN.matcher(path);
            if ("GET".equalsIgnoreCase(method) && getConcernMatcher.matches()) {
                String concernId = getConcernMatcher.group(1);
                TriageResponse response = triageService.getConcern(concernId, userId);
                return ok(mapper.writeValueAsString(response));
            }

            // POST /concerns/{concernId}/resolve → resolveConcern
            Matcher resolveMatcher = RESOLVE_PATTERN.matcher(path);
            if ("POST".equalsIgnoreCase(method) && resolveMatcher.matches()) {
                String concernId = resolveMatcher.group(1);
                @SuppressWarnings("unchecked")
                Map<String, String> body = mapper.readValue(input.getBody(), Map.class);
                String resolution = body.get("resolution");
                if (resolution == null || resolution.isBlank()) {
                    return error(400, "MISSING_FIELD", "resolution is required", requestId);
                }
                TriageResponse response = triageService.resolveConcern(concernId, userId, resolution);
                return ok(mapper.writeValueAsString(response));
            }

            return error(404, "NOT_FOUND", "Route not found: " + method + " " + path, requestId);

        } catch (ResponseStatusException rse) {
            return error(rse.getStatusCode().value(), "REQUEST_ERROR", rse.getReason(), requestId);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TriageController.class)
                    .error("Unhandled [{}]: {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return error(500, "INTERNAL_ERROR", "An unexpected error occurred", requestId);
        }
    }

    // --- Helpers ---

    private String getHeader(APIGatewayProxyRequestEvent input, String name) {
        if (input.getHeaders() == null) return null;
        // Headers can be case-insensitive in HTTP
        for (Map.Entry<String, String> entry : input.getHeaders().entrySet()) {
            if (entry.getKey().equalsIgnoreCase(name)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private APIGatewayProxyResponseEvent ok(String body) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withHeaders(jsonHeaders())
                .withBody(body);
    }

    private APIGatewayProxyResponseEvent error(int status, String code, String message, String requestId) {
        try {
            ErrorResponse err = new ErrorResponse(code, message, requestId,
                    Instant.now().toString());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(status)
                    .withHeaders(jsonHeaders())
                    .withBody(mapper.writeValueAsString(err));
        } catch (Exception e) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody("{\"error\":\"SERIALIZATION_ERROR\"}");
        }
    }

    private Map<String, String> jsonHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        return headers;
    }
}
