package com.newcat.vetsummary.controller;

/**
 * Routes API Gateway events to vet summary operations (generate, list).
 * See TDD Section 2.6 for full API contracts.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.vetsummary.dto.ErrorResponse;
import com.newcat.vetsummary.dto.SummaryRequest;
import com.newcat.vetsummary.dto.SummaryResponse;
import com.newcat.vetsummary.service.VetSummaryService;
import com.newcat.vetsummary.util.JWTValidator;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class VetSummaryController {

    private static final Pattern PET_SUMMARIES_PATH = Pattern.compile("^/pets/([^/]+)/summaries$");
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private VetSummaryService vetSummaryService;

    @Autowired
    private JWTValidator jwtValidator;

    /**
     * Routes:
     *   GET  /pets/{petId}/summaries  → generateSummary (TDD Section 2.6.1)
     *   POST /pets/{petId}/summaries  → generateSummary (alternative trigger)
     */
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        String requestId = context != null ? context.getAwsRequestId() : "local";
        try {
            String path = input.getPath();
            String method = input.getHttpMethod();

            Matcher matcher = PET_SUMMARIES_PATH.matcher(path);
            if (matcher.matches() && ("GET".equals(method) || "POST".equals(method))) {
                String petId = matcher.group(1);

                // Extract and validate JWT
                Map<String, String> headers = input.getHeaders();
                String authHeader = headers != null ? headers.get("Authorization") : null;
                Claims claims = jwtValidator.validateToken(authHeader);
                String userId = claims.getSubject();

                // Parse query parameters
                Map<String, String> params = input.getQueryStringParameters();
                String format = params != null ? params.getOrDefault("format", "html") : "html";
                boolean includeAcuteEvents = params == null
                    || !"false".equalsIgnoreCase(params.get("include_acute_events"));

                SummaryRequest summaryRequest = new SummaryRequest();
                summaryRequest.setFormat(format);
                summaryRequest.setIncludeAcuteEvents(includeAcuteEvents);

                SummaryResponse response = vetSummaryService.generateSummary(petId, userId, summaryRequest);

                // If text format requested, return text report body
                if ("text".equalsIgnoreCase(format)) {
                    return response(200, response.getTextReport(), "text/plain");
                }
                return response(200, mapper.writeValueAsString(response), "application/json");
            }

            return errorResponse(404, "NOT_FOUND", "Route not found", requestId);
        } catch (ResponseStatusException rse) {
            int status = rse.getStatusCode().value();
            String code = rse.getStatusCode().toString();
            return errorResponse(status, code, rse.getReason(), requestId);
        } catch (Exception e) {
            return errorResponse(500, "INTERNAL_ERROR", "An unexpected error occurred", requestId);
        }
    }

    private APIGatewayProxyResponseEvent response(int statusCode, String body, String contentType) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setBody(body);
        response.setHeaders(Map.of("Content-Type", contentType));
        return response;
    }

    private APIGatewayProxyResponseEvent errorResponse(int statusCode, String code, String message, String requestId) {
        try {
            ErrorResponse err = new ErrorResponse(code, message, requestId);
            return response(statusCode, mapper.writeValueAsString(err), "application/json");
        } catch (Exception e) {
            APIGatewayProxyResponseEvent r = new APIGatewayProxyResponseEvent();
            r.setStatusCode(500);
            r.setBody("{\"error\":\"INTERNAL_ERROR\"}");
            return r;
        }
    }
}
