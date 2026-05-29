package com.newcat.vetsummary.dto;

/**
 * Response DTO for GET /pets/{petId}/summaries.
 * See TDD Section 2.6.1 for the full response contract including HTML report structure.
 */

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class SummaryResponse {

    private String htmlReport;      // Full HTML report (TDD Section 2.6.1 HTML template)
    private String textReport;      // Plain text equivalent
    private LocalDateTime generatedAt;

    // Date range metadata
    private Map<String, Object> dataRange;  // { start, end, days_since_adoption }

    // Summary narrative sections
    private Map<String, Object> summary;    // { pet_name, adoption_date, eating_summary, ... }
}
