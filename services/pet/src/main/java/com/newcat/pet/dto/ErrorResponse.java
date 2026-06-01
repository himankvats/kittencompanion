package com.newcat.pet.dto;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {

    private String error;
    private String message;
    private Map<String, String> details;
    private String requestId;
    private String timestamp;

    public ErrorResponse() {}

    public ErrorResponse(String error, String message, String requestId) {
        this.error = error;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(String error, String message, Map<String, String> details, String requestId, String timestamp) {
        this.error = error;
        this.message = message;
        this.details = details;
        this.requestId = requestId;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, String> getDetails() { return details; }
    public void setDetails(Map<String, String> details) { this.details = details; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
