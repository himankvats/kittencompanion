package com.newcat.pet.dto;

/**
 * Response DTO returned from all pet endpoints. Maps entity fields to the
 * API response format specified in TDD Section 2.3.
 */

import com.newcat.pet.entity.Pet;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PetResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private Integer ageMonths;
    private String gender;
    private String neuteredSpayed;
    private String breed;
    private LocalDate adoptionDate;
    private String source;
    private String siblingBonded;

    // TODO: Replace String with typed JSONB response objects (TDD Section 2.3.1)
    private String medicalHistory;
    private String householdContext;
    private String currentConcerns;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // TODO: Implement constructor from entity (TDD Section 3.3)
    public PetResponse(Pet pet) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 3.3");
    }
}
