package com.newcat.checkin.dto;

/**
 * Response DTO for check-in operations. Includes the generated feedback_text field.
 * See TDD Section 2.4.1 for the full response contract.
 */

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class CheckinResponse {

    private UUID id;

    @JsonProperty("pet_id")
    private UUID petId;

    private LocalDate date;

    @JsonProperty("eating_level")
    private String eatingLevel;

    @JsonProperty("litter_status")
    private String litterStatus;

    @JsonProperty("activity_level")
    private String activityLevel;

    @JsonProperty("owner_notes")
    private String ownerNotes;

    @JsonProperty("confidence_score")
    private Integer confidenceScore;

    @JsonProperty("feedback_text")
    private String feedbackText;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
