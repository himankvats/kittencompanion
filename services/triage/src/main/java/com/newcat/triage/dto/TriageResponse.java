package com.newcat.triage.dto;

/**
 * Response DTO for triage endpoints. See TDD Section 2.5.1 for full response contract.
 */

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class TriageResponse {

    private UUID id;

    @JsonProperty("pet_id")
    private UUID petId;

    @JsonProperty("concern_type")
    private String concernType;

    private String severity;

    @JsonProperty("severity_label")
    private String severityLabel;

    @JsonProperty("response_text")
    private String responseText;

    @JsonProperty("followup_resolution")
    private String followupResolution;

    @JsonProperty("followup_resolved_at")
    private LocalDateTime followupResolvedAt;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
