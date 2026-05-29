package com.newcat.pet.dto;

/**
 * Standard error response DTO for all pet service endpoints.
 * Matches the error format defined in TDD Section 2.7.
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String error;          // error code (e.g., "VALIDATION_ERROR")
    private String message;        // human-readable description
    private Map<String, String> details;   // optional field-level details
    private String requestId;
    private String timestamp;

    public ErrorResponse(String error, String message, String requestId) {
        this.error = error;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = Instant.now().toString();
    }
}
