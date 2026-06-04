package com.newcat.checkin.dto;

/**
 * Request DTO for POST /checkins. See TDD Section 2.4.1 for required/optional fields.
 */

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckinRequest {

    @JsonProperty("pet_id")
    @NotNull(message = "pet_id is required")
    private String petId;

    @JsonProperty("eating_level")
    @NotBlank(message = "eating_level is required")
    @Pattern(regexp = "less_than_normal|normal|more_than_normal", message = "Invalid eating_level")
    private String eatingLevel;

    @JsonProperty("litter_status")
    @NotBlank(message = "litter_status is required")
    @Pattern(regexp = "normal|diarrhea|constipation|mixed|not_used|unknown", message = "Invalid litter_status")
    private String litterStatus;

    @JsonProperty("activity_level")
    @NotBlank(message = "activity_level is required")
    @Pattern(regexp = "very_active|normal|calm|sleeping_most_of_day", message = "Invalid activity_level")
    private String activityLevel;

    @JsonProperty("owner_notes")
    @Size(max = 1000, message = "owner_notes must not exceed 1000 characters")
    private String ownerNotes;

    @JsonProperty("confidence_score")
    @Min(1) @Max(5)
    private Integer confidenceScore;
}
