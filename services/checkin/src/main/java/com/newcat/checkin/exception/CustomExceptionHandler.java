package com.newcat.checkin.exception;

/**
 * Global exception handler for the check-in service. See TDD Section 2.7 for error format.
 */

import com.newcat.checkin.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class CustomExceptionHandler {

    // TODO: Implement exception handlers (TDD Section 6.1)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }
}
