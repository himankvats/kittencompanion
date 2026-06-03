package com.newcat.pattern;

/**
 * AWS Lambda entry point for the Pattern Detection service.
 * Accepts both EventBridge (ScheduledEvent) and SQS event shapes.
 * Dispatches to the appropriate handler method based on the "Records" key.
 * See TDD Section 4.3 for handler specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.pattern.handler.PatternDetectionHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

import java.util.Map;
import java.util.logging.Logger;

public class PatternDetectionLambda implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private static final Logger log = Logger.getLogger(PatternDetectionLambda.class.getName());
    private static final ObjectMapper mapper = new ObjectMapper();

    private static ApplicationContext springContext;

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
        if (springContext == null) {
            springContext = SpringApplication.run(PatternDetectionApplication.class);
        }

        PatternDetectionHandler handler = springContext.getBean(PatternDetectionHandler.class);

        try {
            if (event.containsKey("Records")) {
                // SQS event shape
                SQSEvent sqsEvent = mapper.convertValue(event, SQSEvent.class);
                handler.handleSQSEvent(sqsEvent);
            } else {
                // Treat as EventBridge / ScheduledEvent
                ScheduledEvent scheduledEvent = mapper.convertValue(event, ScheduledEvent.class);
                handler.handleScheduledEvent(scheduledEvent);
            }
        } catch (Exception e) {
            log.severe("Error processing Lambda event: " + e.getMessage());
            return Map.of("statusCode", 500, "body", "Internal server error: " + e.getMessage());
        }

        return Map.of("statusCode", 200, "body", "Pattern detection complete");
    }
}
