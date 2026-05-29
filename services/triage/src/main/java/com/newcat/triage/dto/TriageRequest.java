package com.newcat.triage.dto;

/**
 * Request DTO for POST /concerns. See TDD Section 2.5.1 for field specification.
 */

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
public class TriageRequest {

    @NotNull(message = "pet_id is required")
    private String petId;

    @NotBlank(message = "concern_type is required")
    @Pattern(
        regexp = "not_eating|vomiting|litter_problems|respiratory|limping|hiding|eye_ear|skin|other",
        message = "Invalid concern_type"
    )
    private String concernType;

    // Dynamic structure varies per concern_type — see TDD Section 1.5
    @NotNull(message = "followup_answers is required")
    private Map<String, Object> followupAnswers;
}
