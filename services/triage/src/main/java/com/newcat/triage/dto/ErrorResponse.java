package com.newcat.triage.dto;

/**
 * Standard error response for the triage service. See TDD Section 2.7.
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    private String requestId;
    private String timestamp;

    public ErrorResponse(String error, String message, String requestId) {
        this.error = error;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = Instant.now().toString();
    }
}
