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

    @JsonProperty("eating_notes")
    @Size(max = 500, message = "eating_notes must not exceed 500 characters")
    private String eatingNotes;

    @JsonProperty("litter_status")
    @NotBlank(message = "litter_status is required")
    @Pattern(regexp = "normal|diarrhea|constipation|mixed|not_used|unknown", message = "Invalid litter_status")
    private String litterStatus;

    @JsonProperty("litter_notes")
    @Size(max = 500)
    private String litterNotes;

    @JsonProperty("activity_level")
    @NotBlank(message = "activity_level is required")
    @Pattern(regexp = "very_active|normal|calm|sleeping_most_of_day", message = "Invalid activity_level")
    private String activityLevel;

    @JsonProperty("activity_notes")
    @Size(max = 500)
    private String activityNotes;

    @JsonProperty("owner_notes")
    @Size(max = 500)
    private String ownerNotes;

    @JsonProperty("confidence_score")
    @Min(1) @Max(5)
    private Integer confidenceScore;
}
