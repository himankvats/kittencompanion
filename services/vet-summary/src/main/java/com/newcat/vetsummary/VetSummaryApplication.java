package com.newcat.vetsummary;

/**
 * Spring Boot entry point for the Vet Summary service.
 * See TDD Section 2.6 for service architecture.
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VetSummaryApplication {
    public static void main(String[] args) {
        SpringApplication.run(VetSummaryApplication.class, args);
    }
}
