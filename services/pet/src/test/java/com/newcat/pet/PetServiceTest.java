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

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private RedisService redisService;

    @InjectMocks
    private PetService petService;

    private PetRequest validRequest;
    private final String userId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        validRequest = new PetRequest();
        validRequest.setName("Scooter");
        validRequest.setAgeMonths(2);
        validRequest.setGender("male");
        validRequest.setNeuteredSpayed("unknown");
    }

    @Test
    void testCreatePetSuccess() {
        Pet saved = new Pet();
        saved.setId(UUID.randomUUID());
        saved.setUserId(UUID.fromString(userId));
        saved.setName("Scooter");
        saved.setAgeMonths(2);
        saved.setGender("male");
        saved.setNeuteredSpayed("unknown");

        when(petRepository.save(any(Pet.class))).thenReturn(saved);
        when(redisService.setWithTTL(anyString(), any(), anyInt())).thenReturn(true);

        PetResponse response = petService.createPet(userId, validRequest);

        assertNotNull(response);
        assertEquals("Scooter", response.getName());
        assertEquals(2, response.getAgeMonths());
        verify(petRepository, times(1)).save(any(Pet.class));
        verify(redisService, times(1)).setWithTTL(eq("pet:" + saved.getId()), any(), eq(300));
    }

    @Test
    void testCreatePetValidationFailure_emptyName() {
        validRequest.setName("");
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> petService.createPet(userId, validRequest)
        );
        assertTrue(ex.getMessage().contains("name"));
    }

    @Test
    void testCreatePetValidationFailure_invalidAgeMonths() {
        validRequest.setAgeMonths(400);
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> petService.createPet(userId, validRequest)
        );
        assertTrue(ex.getMessage().contains("age_months"));
    }

    @Test
    void testGetPetCacheHit() {
        String petId = UUID.randomUUID().toString();
        Pet pet = new Pet();
        pet.setId(UUID.fromString(petId));
        pet.setUserId(UUID.fromString(userId));
        pet.setName("Scooter");
        pet.setAgeMonths(2);

        when(redisService.get("pet:" + petId, Pet.class)).thenReturn(Optional.of(pet));

        PetResponse response = petService.getPet(petId, userId);

        assertNotNull(response);
        assertEquals("Scooter", response.getName());
        verify(petRepository, never()).findById(any(UUID.class));
    }

    @Test
    void testGetPetCacheMiss_queriesDB() {
        String petId = UUID.randomUUID().toString();
        Pet pet = new Pet();
        pet.setId(UUID.fromString(petId));
        pet.setUserId(UUID.fromString(userId));
        pet.setName("Scooter");
        pet.setAgeMonths(2);

        when(redisService.get("pet:" + petId, Pet.class)).thenReturn(Optional.empty());
        when(petRepository.findById(UUID.fromString(petId))).thenReturn(Optional.of(pet));
        when(redisService.setWithTTL(anyString(), any(), anyInt())).thenReturn(true);

        PetResponse response = petService.getPet(petId, userId);

        assertNotNull(response);
        verify(petRepository, times(1)).findById(UUID.fromString(petId));
        verify(redisService, times(1)).setWithTTL(eq("pet:" + petId), any(), eq(300));
    }

    @Test
    void testGetPetForbidden_wrongUser() {
        String petId = UUID.randomUUID().toString();
        String otherUserId = UUID.randomUUID().toString();
        Pet pet = new Pet();
        pet.setId(UUID.fromString(petId));
        pet.setUserId(UUID.fromString(otherUserId));

        when(redisService.get("pet:" + petId, Pet.class)).thenReturn(Optional.empty());
        when(petRepository.findById(UUID.fromString(petId))).thenReturn(Optional.of(pet));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> petService.getPet(petId, userId)
        );
        assertEquals("FORBIDDEN", ex.getMessage());
    }
}
