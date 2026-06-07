package com.newcat.vetsummary.exception;

/**
 * Global exception handler for the vet summary service. See TDD Section 2.7.
 */

import com.newcat.vetsummary.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

@ControllerAdvice
public class CustomExceptionHandler {

    /**
     * Forwards ResponseStatusException with its HTTP status and reason.
     * Handles 401, 403, 404, etc. thrown by service/util layer.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        String code = ex.getStatusCode().toString();
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        ErrorResponse body = new ErrorResponse(code, message, null);
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    /**
     * Catch-all handler for any unhandled exception — returns 500.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        ErrorResponse body = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred",
            null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
