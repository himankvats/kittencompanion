package com.newcat.pet;

/**
 * Unit tests for PetService using Mockito to mock PetRepository and RedisService.
 * See TDD Section 7.1 for test case specifications and examples.
 */

import com.newcat.pet.dto.PetRequest;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.entity.Pet;
import com.newcat.pet.repository.PetRepository;
import com.newcat.pet.service.PetService;
import com.newcat.pet.service.RedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private RedisService redisService;

    @InjectMocks
    private PetService petService;

    // TODO: Add test fixtures (TDD Section 7.1)
    private PetRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new PetRequest();
        validRequest.setName("Scooter");
        validRequest.setAgeMonths(2);
        validRequest.setGender("male");
        validRequest.setNeuteredSpayed("unknown");
    }

    // TODO: Implement createPet tests (TDD Section 7.1)

    @Test
    void testCreatePetSuccess() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: mock petRepository.save, redisService.setWithTTL
        // Act: call petService.createPet
        // Assert: response fields, verify mock interactions
    }

    @Test
    void testCreatePetValidationFailure_emptyName() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: request with empty name
        // Assert: throws IllegalArgumentException
    }

    @Test
    void testCreatePetValidationFailure_invalidAgeMonths() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: request with age_months = 400
        // Assert: throws IllegalArgumentException
    }

    // TODO: Implement getPet tests

    @Test
    void testGetPetCacheHit() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: mock redisService.get returns Optional.of(pet)
        // Assert: petRepository.findById never called
    }

    @Test
    void testGetPetCacheMiss_queriesDB() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: mock redisService.get returns empty; mock petRepository.findById returns pet
        // Assert: redisService.setWithTTL called to cache result
    }

    @Test
    void testGetPetForbidden_wrongUser() {
        // TODO: Implement (TDD Section 7.1)
        // Arrange: pet exists but belongs to different user
        // Assert: throws RuntimeException("FORBIDDEN")
    }
}
