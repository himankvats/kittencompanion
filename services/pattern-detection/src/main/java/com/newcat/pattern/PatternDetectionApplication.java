package com.newcat.pattern;

/**
 * Spring Boot entry point for the Pattern Detection service.
 * See TDD Section 4.3 for service architecture.
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PatternDetectionApplication {
    public static void main(String[] args) {
        SpringApplication.run(PatternDetectionApplication.class, args);
    }
}
