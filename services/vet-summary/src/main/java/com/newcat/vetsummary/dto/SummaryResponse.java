package com.newcat.vetsummary.dto;

/**
 * Response DTO for GET /pets/{petId}/summaries.
 * See TDD Section 2.6.1 for the full response contract including HTML report structure.
 */

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class SummaryResponse {

    @JsonProperty("html_report")
    private String htmlReport;

    @JsonProperty("text_report")
    private String textReport;

    @JsonProperty("generated_at")
    private LocalDateTime generatedAt;

    @JsonProperty("data_range")
    private Map<String, Object> dataRange;

    private Map<String, Object> summary;
}
