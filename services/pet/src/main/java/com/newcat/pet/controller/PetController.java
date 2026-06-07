package com.newcat.pet.controller;

/**
 * Routes API Gateway requests to the correct pet operation (create, get, update, list).
 * Validates the JWT on every request before delegating to PetService.
 * See TDD Section 3.3 and API contracts in TDD Section 2.3.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.pet.dto.PetRequest;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.service.PetService;
import com.newcat.pet.util.JWTValidator;
import com.newcat.pet.util.Logger;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PetController {

    @Autowired
    private PetService petService;

    @Autowired
    private JWTValidator jwtValidator;

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule()).disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    private static final Logger logger = new Logger(PetController.class);

    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        String path = input.getPath();
        String method = input.getHttpMethod();
        String requestId = context.getAwsRequestId();

        try {
            String token = extractToken(input.getHeaders());
            Claims claims = jwtValidator.validateToken(token);
            String userId = claims.getSubject();

            if ("/pets".equals(path) && "POST".equals(method)) {
                return createPet(input, userId, requestId);
            } else if (path != null && path.matches("/pets/[a-fA-F0-9\\-]+") && "GET".equals(method)) {
                String petId = path.split("/")[2];
                return getPet(petId, userId, requestId);
            } else if (path != null && path.matches("/pets/[a-fA-F0-9\\-]+") && "PUT".equals(method)) {
                String petId = path.split("/")[2];
                return updatePet(input, petId, userId, requestId);
            } else if (path != null && path.matches("/users/[a-fA-F0-9\\-]+/pets") && "GET".equals(method)) {
                String requestedUserId = path.split("/")[2];
                return listPets(requestedUserId, userId, requestId);
            } else {
                return buildErrorResponse(404, "NOT_FOUND", requestId);
            }

        } catch (RuntimeException e) {
            return handleRuntimeException(e, requestId);
        } catch (Exception e) {
            logger.error("Unexpected error in PetController", e);
            return buildErrorResponse(500, "INTERNAL_SERVER_ERROR", requestId);
        }
    }

    private APIGatewayProxyResponseEvent createPet(APIGatewayProxyRequestEvent input, String userId, String requestId) throws Exception {
        PetRequest request = mapper.readValue(input.getBody(), PetRequest.class);
        PetResponse response = petService.createPet(userId, request);
        return buildResponse(201, response);
    }

    private APIGatewayProxyResponseEvent getPet(String petId, String userId, String requestId) throws Exception {
        PetResponse response = petService.getPet(petId, userId);
        return buildResponse(200, response);
    }

    private APIGatewayProxyResponseEvent updatePet(APIGatewayProxyRequestEvent input, String petId, String userId, String requestId) throws Exception {
        PetRequest request = mapper.readValue(input.getBody(), PetRequest.class);
        PetResponse response = petService.updatePet(petId, userId, request);
        return buildResponse(200, response);
    }

    private APIGatewayProxyResponseEvent listPets(String requestedUserId, String jwtUserId, String requestId) throws Exception {
        if (!requestedUserId.equals(jwtUserId)) {
            return buildErrorResponse(403, "FORBIDDEN", requestId);
        }
        List<PetResponse> pets = petService.listPets(requestedUserId);
        Map<String, Object> body = new HashMap<>();
        body.put("pets", pets);
        body.put("count", pets.size());
        return buildResponse(200, body);
    }

    private String extractToken(Map<String, String> headers) {
        if (headers == null || !headers.containsKey("Authorization")) {
            throw new RuntimeException("MISSING_TOKEN");
        }
        String authHeader = headers.get("Authorization");
        if (!authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("INVALID_TOKEN_FORMAT");
        }
        return authHeader.substring(7);
    }

    private APIGatewayProxyResponseEvent buildResponse(int statusCode, Object body) throws Exception {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
        headers.put("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setHeaders(headers);
        response.setBody(mapper.writeValueAsString(body));
        return response;
    }

    private APIGatewayProxyResponseEvent buildErrorResponse(int statusCode, String errorCode, String requestId) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
        headers.put("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setHeaders(headers);
        response.setBody(String.format("{\"error\":\"%s\",\"request_id\":\"%s\"}", errorCode, requestId));
        return response;
    }

    private APIGatewayProxyResponseEvent handleRuntimeException(RuntimeException e, String requestId) {
        String msg = e.getMessage();
        if ("MISSING_TOKEN".equals(msg) || "INVALID_TOKEN_FORMAT".equals(msg)
                || "TOKEN_EXPIRED".equals(msg) || "INVALID_TOKEN".equals(msg)) {
            return buildErrorResponse(401, msg, requestId);
        }
        if ("FORBIDDEN".equals(msg)) {
            return buildErrorResponse(403, "FORBIDDEN", requestId);
        }
        if ("NOT_FOUND".equals(msg)) {
            return buildErrorResponse(404, "NOT_FOUND", requestId);
        }
        if (e instanceof IllegalArgumentException) {
            return buildErrorResponse(400, "VALIDATION_ERROR: " + msg, requestId);
        }
        logger.error("Unhandled RuntimeException", e);
        return buildErrorResponse(500, "INTERNAL_SERVER_ERROR", requestId);
    }
}
