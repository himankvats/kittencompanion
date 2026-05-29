package com.newcat.checkin;

/**
 * Spring Boot application entry point for the Check-in service.
 * See TDD Section 3.4 for service architecture.
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CheckinApplication {
    public static void main(String[] args) {
        SpringApplication.run(CheckinApplication.class, args);
    }
}
