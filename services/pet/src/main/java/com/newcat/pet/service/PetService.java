package com.newcat.pet.service;

/**
 * Business logic for pet profile operations. Validates input, persists to PostgreSQL
 * via PetRepository, and manages Redis cache with 5-minute TTL.
 * See TDD Section 3.3 for implementation specification.
 */

import com.newcat.pet.dto.PetRequest;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.entity.Pet;
import com.newcat.pet.repository.PetRepository;
import com.newcat.pet.util.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private RedisService redisService;

    private static final Logger logger = new Logger(PetService.class);

    private static final List<String> VALID_GENDERS = Arrays.asList("male", "female", "unknown");
    private static final List<String> VALID_NEUTERED = Arrays.asList("yes", "no", "unknown");
    private static final List<String> VALID_SOURCES = Arrays.asList("shelter", "breeder", "friend_family", "stray", "other");
    private static final List<String> VALID_SIBLING_BONDED = Arrays.asList("yes", "no", "unsure");

    public PetResponse createPet(String userId, PetRequest request) {
        validatePetRequest(request);

        Pet pet = new Pet();
        pet.setUserId(UUID.fromString(userId));
        applyRequestFields(pet, request);

        Pet saved = petRepository.save(pet);
        redisService.setWithTTL("pet:" + saved.getId(), saved, 300);
        logger.info("pet_created", "petId", saved.getId().toString(), "userId", userId);

        return mapToResponse(saved);
    }

    public PetResponse getPet(String petId, String userId) {
        String cacheKey = "pet:" + petId;
        Optional<Pet> cached = redisService.get(cacheKey, Pet.class);

        if (cached.isPresent()) {
            Pet pet = cached.get();
            if (!pet.getUserId().toString().equals(userId)) {
                throw new RuntimeException("FORBIDDEN");
            }
            return mapToResponse(pet);
        }

        Pet pet = petRepository.findById(UUID.fromString(petId))
                .orElseThrow(() -> new RuntimeException("NOT_FOUND"));

        if (!pet.getUserId().toString().equals(userId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        redisService.setWithTTL(cacheKey, pet, 300);
        return mapToResponse(pet);
    }

    public PetResponse updatePet(String petId, String userId, PetRequest request) {
        String cacheKey = "pet:" + petId;

        Pet pet;
        Optional<Pet> cached = redisService.get(cacheKey, Pet.class);
        if (cached.isPresent()) {
            pet = cached.get();
            if (!pet.getUserId().toString().equals(userId)) {
                throw new RuntimeException("FORBIDDEN");
            }
            // Re-fetch from DB to get managed entity for save
            pet = petRepository.findById(UUID.fromString(petId))
                    .orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        } else {
            pet = petRepository.findById(UUID.fromString(petId))
                    .orElseThrow(() -> new RuntimeException("NOT_FOUND"));
            if (!pet.getUserId().toString().equals(userId)) {
                throw new RuntimeException("FORBIDDEN");
            }
        }

        applyNonNullFields(pet, request);

        Pet saved = petRepository.save(pet);
        redisService.delete(cacheKey);
        logger.info("pet_updated", "petId", petId, "userId", userId);

        return mapToResponse(saved);
    }

    public List<PetResponse> listPets(String userId) {
        List<Pet> pets = petRepository.findByUserId(UUID.fromString(userId));
        return pets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void validatePetRequest(PetRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getName().length() > 100) {
            throw new IllegalArgumentException("name must not exceed 100 characters");
        }
        if (request.getAgeMonths() == null) {
            throw new IllegalArgumentException("age_months is required");
        }
        if (request.getAgeMonths() < 0 || request.getAgeMonths() > 360) {
            throw new IllegalArgumentException("age_months must be 0-360");
        }
        if (request.getGender() != null && !VALID_GENDERS.contains(request.getGender())) {
            throw new IllegalArgumentException("gender must be male, female, or unknown");
        }
        if (request.getNeuteredSpayed() != null && !VALID_NEUTERED.contains(request.getNeuteredSpayed())) {
            throw new IllegalArgumentException("neutered_spayed must be yes, no, or unknown");
        }
        if (request.getSource() != null && !VALID_SOURCES.contains(request.getSource())) {
            throw new IllegalArgumentException("source must be shelter, breeder, friend_family, stray, or other");
        }
        if (request.getSiblingBonded() != null && !VALID_SIBLING_BONDED.contains(request.getSiblingBonded())) {
            throw new IllegalArgumentException("sibling_bonded must be yes, no, or unsure");
        }
        if (request.getAdoptionDate() != null) {
            LocalDate date;
            try {
                date = LocalDate.parse(request.getAdoptionDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("adoption_date must be a valid date in YYYY-MM-DD format");
            }
            if (date.isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("adoption_date cannot be in the future");
            }
        }
    }

    private void applyRequestFields(Pet pet, PetRequest request) {
        pet.setName(request.getName().trim());
        pet.setAgeMonths(request.getAgeMonths());
        pet.setGender(request.getGender());
        pet.setNeuteredSpayed(request.getNeuteredSpayed());
        pet.setBreed(request.getBreed());
        pet.setSource(request.getSource());
        pet.setSiblingBonded(request.getSiblingBonded());
        pet.setMedicalHistory(request.getMedicalHistory());
        pet.setHouseholdContext(request.getHouseholdContext());
        pet.setCurrentConcerns(request.getCurrentConcerns());
        if (request.getAdoptionDate() != null) {
            pet.setAdoptionDate(LocalDate.parse(request.getAdoptionDate()));
        }
    }

    private void applyNonNullFields(Pet pet, PetRequest request) {
        if (request.getName() != null) pet.setName(request.getName().trim());
        if (request.getAgeMonths() != null) pet.setAgeMonths(request.getAgeMonths());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getNeuteredSpayed() != null) pet.setNeuteredSpayed(request.getNeuteredSpayed());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getSource() != null) pet.setSource(request.getSource());
        if (request.getSiblingBonded() != null) pet.setSiblingBonded(request.getSiblingBonded());
        if (request.getMedicalHistory() != null) pet.setMedicalHistory(request.getMedicalHistory());
        if (request.getHouseholdContext() != null) pet.setHouseholdContext(request.getHouseholdContext());
        if (request.getCurrentConcerns() != null) pet.setCurrentConcerns(request.getCurrentConcerns());
        if (request.getAdoptionDate() != null) pet.setAdoptionDate(LocalDate.parse(request.getAdoptionDate()));
    }

    private PetResponse mapToResponse(Pet pet) {
        return new PetResponse(pet);
    }
}
