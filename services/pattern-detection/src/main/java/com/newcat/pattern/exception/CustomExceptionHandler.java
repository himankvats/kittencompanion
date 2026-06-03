package com.newcat.pattern.exception;

/**
 * Global exception handler for the pattern detection service.
 * Returns a JSON error envelope for any unhandled exception. See TDD Section 6.1.
 */

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

@ControllerAdvice
public class CustomExceptionHandler {

    private static final Logger log = Logger.getLogger(CustomExceptionHandler.class.getName());

    /**
     * Catches all unhandled exceptions and returns a structured JSON error body
     * with HTTP 500, plus a timestamp and message for diagnostics.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        log.severe("Unhandled exception in pattern-detection service: " + ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "INTERNAL_SERVER_ERROR");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        body.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * Catches IllegalArgumentException and returns HTTP 400 with a structured error body.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warning("Validation error in pattern-detection service: " + ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "VALIDATION_ERROR");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid input");
        body.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
