package com.newcat.triage;

/**
 * Spring Boot application entry point for the Triage service.
 * See TDD Section 3.5 for service architecture.
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TriageApplication {
    public static void main(String[] args) {
        SpringApplication.run(TriageApplication.class, args);
    }
}
