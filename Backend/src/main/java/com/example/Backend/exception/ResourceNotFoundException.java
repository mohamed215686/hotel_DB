package com.example.Backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception to be thrown when a requested resource
 * (like a User or Role by ID) does not exist in the database.
 * * @ResponseStatus(value = HttpStatus.NOT_FOUND) ensures that when this
 * exception is thrown, Spring automatically returns an HTTP 404 status
 * code instead of the default HTTP 500.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    // SerialVersionUID is required for Serializable classes
    private static final long serialVersionUID = 1L;

    /**
     * Constructor that accepts a custom message.
     * * @param message The specific error message (e.g., "Utilisateur not found with ID: 5")
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}