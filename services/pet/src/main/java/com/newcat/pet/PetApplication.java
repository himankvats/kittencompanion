package com.newcat.pet;

/**
 * Spring Boot application entry point for the Pet service.
 * Used to bootstrap the ApplicationContext for Lambda warm-start reuse.
 * See TDD Section 3.3 for service architecture.
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PetApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetApplication.class, args);
    }
}
