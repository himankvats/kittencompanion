package com.newcat.triage.exception;

/**
 * Global exception handler for the triage service. See TDD Section 2.7 for error format.
 */

import com.newcat.triage.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@ControllerAdvice
public class CustomExceptionHandler {

    /**
     * Handles ResponseStatusException — forwards its HTTP status and message directly.
     * Used for 401, 403, 404, etc.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        ErrorResponse body = new ErrorResponse(
                "REQUEST_ERROR",
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                null,
                Instant.now().toString());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    /**
     * Handles Bean Validation failures (e.g., @NotBlank on TriageRequest fields) → 400.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        ErrorResponse body = new ErrorResponse(
                "VALIDATION_ERROR",
                message,
                null,
                Instant.now().toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Catch-all handler for unhandled exceptions → 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        ErrorResponse body = new ErrorResponse(
                "INTERNAL_ERROR",
                "An unexpected error occurred",
                null,
                Instant.now().toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
