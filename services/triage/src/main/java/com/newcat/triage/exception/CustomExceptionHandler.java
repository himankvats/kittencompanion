package com.newcat.triage.exception;

/**
 * Global exception handler for the triage service. See TDD Section 2.7 for error format.
 */

import com.newcat.triage.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class CustomExceptionHandler {

    /** TODO: Implement (TDD Section 6.1) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }
}
