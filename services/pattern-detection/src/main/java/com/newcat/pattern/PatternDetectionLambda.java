package com.newcat.pattern;

/**
 * AWS Lambda entry point for the Pattern Detection service.
 * Triggered by EventBridge on a nightly schedule to analyse weekly patterns.
 * See TDD Section 4.3 for handler specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.newcat.pattern.handler.PatternDetectionHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

public class PatternDetectionLambda implements RequestHandler<ScheduledEvent, Void> {

    private static ApplicationContext springContext;

    @Override
    public Void handleRequest(ScheduledEvent event, Context context) {
        // TODO: Implement Spring bootstrap and delegation (TDD Section 4.3)
        if (PatternDetectionLambda.springContext == null) {
            PatternDetectionLambda.springContext = SpringApplication.run(PatternDetectionApplication.class);
        }
        PatternDetectionHandler handler = springContext.getBean(PatternDetectionHandler.class);
        handler.run(event, context);
        return null;
    }
}
