package com.newcat.vetsummary.dto;

/**
 * Request DTO for GET/POST /pets/{petId}/summaries.
 * See TDD Section 2.6.1 for query parameter specification.
 */

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SummaryRequest {

    // ?format=html (default) or text
    private String format = "html";

    // ?include_acute_events=true (default)
    private boolean includeAcuteEvents = true;
}
