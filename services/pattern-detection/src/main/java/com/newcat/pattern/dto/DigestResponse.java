package com.newcat.pattern.dto;

/**
 * Response DTO for digest generation results.
 * See TDD Section 4.3 for the generated content specification.
 */

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
public class DigestResponse {

    private UUID id;
    private UUID petId;
    private String digestText;
    private Map<String, Object> patterns;
    private LocalDate dataRangeStart;
    private LocalDate dataRangeEnd;
    private LocalDateTime generatedAt;
}
