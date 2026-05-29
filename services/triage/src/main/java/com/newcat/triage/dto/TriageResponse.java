package com.newcat.triage.dto;

/**
 * Response DTO for triage endpoints. See TDD Section 2.5.1 for full response contract.
 */

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
public class TriageResponse {

    private UUID id;
    private UUID petId;
    private String concernType;
    private String severity;          // manage_at_home | watch | call_vet_now
    private String severityLabel;     // human-readable label

    // Claude-generated guidance text
    private String responseText;

    // Escalation guidance — TDD Section 2.5.1
    private Map<String, Object> escalationMarkers;

    private LocalDateTime followupPromptAt;
    private String followupResolution;
    private LocalDateTime followupResolvedAt;
    private LocalDateTime createdAt;
}
