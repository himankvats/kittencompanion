package com.newcat.pet;

/**
 * Integration tests for PetController using @SpringBootTest.
 * Tests full request/response handling including JWT validation.
 * See TDD Section 7.2 for integration test specifications.
 */

import com.newcat.pet.controller.PetController;
import com.newcat.pet.service.PetService;
import com.newcat.pet.util.JWTValidator;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/newcat_test",
    "spring.datasource.username=devuser",
    "spring.datasource.password=devpassword"
})
class PetControllerTest {

    @MockBean
    private PetService petService;

    @MockBean
    private JWTValidator jwtValidator;

    // TODO: Implement integration tests (TDD Section 7.2)

    @Test
    void testCreatePet_returnsCreated() {
        // TODO: Build APIGatewayProxyRequestEvent with valid body and JWT header
        // Assert: response statusCode == 201
    }

    @Test
    void testCreatePet_missingJWT_returnsUnauthorized() {
        // TODO: Request without Authorization header
        // Assert: response statusCode == 401
    }

    @Test
    void testGetPet_notFound_returns404() {
        // TODO: Mock PetService.getPet throws RuntimeException("NOT_FOUND")
        // Assert: response statusCode == 404
    }
}
