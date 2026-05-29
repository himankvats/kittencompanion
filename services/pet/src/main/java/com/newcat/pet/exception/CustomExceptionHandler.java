package com.newcat.pet.exception;

/**
 * Global exception handler for the Pet service. Maps common exceptions to
 * structured HTTP error responses per the format in TDD Section 2.7.
 */

import com.newcat.pet.dto.ErrorResponse;
import com.newcat.pet.util.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class CustomExceptionHandler {

    private static final Logger logger = new Logger(CustomExceptionHandler.class);

    /**
     * TODO: Implement handleValidationException (TDD Section 6.1)
     * Maps MethodArgumentNotValidException to 400 VALIDATION_ERROR with field details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }

    /**
     * TODO: Implement handleConstraintViolation (TDD Section 6.1)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }

    /**
     * TODO: Implement handleIllegalArgument (TDD Section 6.1)
     * Maps IllegalArgumentException to 400 Bad Request
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }

    /**
     * TODO: Implement handleUnexpected (TDD Section 6.1)
     * Catch-all handler returning 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 6.1");
    }
}
