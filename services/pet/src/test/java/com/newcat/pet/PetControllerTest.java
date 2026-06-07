package com.newcat.pet;

/**
 * Integration tests for PetController using manually wired mocks.
 * Exercises full request/response handling including JWT validation without
 * requiring a live database or Redis connection.
 * See TDD Section 7.2 for integration test specifications.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.pet.controller.PetController;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.service.PetService;
import com.newcat.pet.util.JWTValidator;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class PetControllerTest {

    @Mock
    private PetService petService;

    @Mock
    private JWTValidator jwtValidator;

    @Mock
    private Context lambdaContext;

    @InjectMocks
    private PetController petController;

    private final String userId = UUID.randomUUID().toString();
    private final String petId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        when(lambdaContext.getAwsRequestId()).thenReturn("test-request-id");
    }

    @Test
    void testCreatePet_returnsCreated() throws Exception {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer test-token");

        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent();
        event.setPath("/pets");
        event.setHttpMethod("POST");
        event.setHeaders(headers);
        event.setBody("{\"name\":\"Scooter\",\"ageMonths\":2,\"gender\":\"male\",\"neuteredSpayed\":\"unknown\"}");

        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(userId);
        when(jwtValidator.validateToken("test-token")).thenReturn(claims);

        PetResponse petResponse = new PetResponse();
        petResponse.setId(UUID.fromString(petId));
        petResponse.setName("Scooter");
        petResponse.setAgeMonths(2);
        when(petService.createPet(eq(userId), any())).thenReturn(petResponse);

        APIGatewayProxyResponseEvent response = petController.handleRequest(event, lambdaContext);

        assertEquals(201, response.getStatusCode());
    }

    @Test
    void testCreatePet_missingJWT_returnsUnauthorized() {
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent();
        event.setPath("/pets");
        event.setHttpMethod("POST");
        event.setHeaders(new HashMap<>());
        event.setBody("{\"name\":\"Scooter\",\"ageMonths\":2}");

        APIGatewayProxyResponseEvent response = petController.handleRequest(event, lambdaContext);

        assertEquals(401, response.getStatusCode());
    }

    @Test
    void testGetPet_notFound_returns404() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer test-token");

        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent();
        event.setPath("/pets/" + petId);
        event.setHttpMethod("GET");
        event.setHeaders(headers);

        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(userId);
        when(jwtValidator.validateToken("test-token")).thenReturn(claims);
        when(petService.getPet(petId, userId)).thenThrow(new RuntimeException("NOT_FOUND"));

        APIGatewayProxyResponseEvent response = petController.handleRequest(event, lambdaContext);

        assertEquals(404, response.getStatusCode());
    }
}
