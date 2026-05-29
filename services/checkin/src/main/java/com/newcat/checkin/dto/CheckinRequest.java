package com.newcat.checkin.dto;

/**
 * Request DTO for POST /checkins. See TDD Section 2.4.1 for required/optional fields.
 */

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckinRequest {

    @NotNull(message = "pet_id is required")
    private String petId;

    @NotBlank(message = "eating_level is required")
    @Pattern(regexp = "less_than_normal|normal|more_than_normal", message = "Invalid eating_level")
    private String eatingLevel;

    @Size(max = 500, message = "eating_notes must not exceed 500 characters")
    private String eatingNotes;

    @NotBlank(message = "litter_status is required")
    @Pattern(regexp = "normal|diarrhea|constipation|mixed|not_used|unknown", message = "Invalid litter_status")
    private String litterStatus;

    @Size(max = 500)
    private String litterNotes;

    @NotBlank(message = "activity_level is required")
    @Pattern(regexp = "very_active|normal|calm|sleeping_most_of_day", message = "Invalid activity_level")
    private String activityLevel;

    @Size(max = 500)
    private String activityNotes;

    @Size(max = 500)
    private String ownerNotes;

    // Nullable — only provided on Day 1 and Month 4 (TDD Section 2.4.1)
    @Min(1) @Max(5)
    private Integer confidenceScore;
}
