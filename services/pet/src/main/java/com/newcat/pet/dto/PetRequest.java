package com.newcat.pet.dto;

/**
 * Request DTO for creating or updating a pet profile.
 * Validation annotations enforce constraints from TDD Section 2.3.1.
 */

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PetRequest {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must not exceed 100 characters")
    private String name;

    @NotNull(message = "age_months is required")
    @Min(value = 0, message = "age_months must be >= 0")
    @Max(value = 360, message = "age_months must be <= 360")
    private Integer ageMonths;

    @Pattern(regexp = "male|female|unknown", message = "gender must be male, female, or unknown")
    private String gender;

    @Pattern(regexp = "yes|no|unknown", message = "neutered_spayed must be yes, no, or unknown")
    private String neuteredSpayed;

    // Optional fields
    private String breed;
    private String adoptionDate;   // ISO date string: YYYY-MM-DD
    private String source;         // shelter | breeder | friend_family | stray | other
    private String siblingBonded;  // yes | no | unsure

    // TODO: Replace String with typed JSONB DTOs (TDD Section 1.3)
    private String medicalHistory;
    private String householdContext;
    private String currentConcerns;
}
