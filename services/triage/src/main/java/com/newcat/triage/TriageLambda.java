package com.newcat.triage;

/**
 * AWS Lambda entry point for the Triage service. Bootstraps Spring context and
 * delegates to TriageController. See TDD Section 3.5 for handler specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.triage.controller.TriageController;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

public class TriageLambda implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ApplicationContext springContext;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        // Bootstrap Spring context once per Lambda container (warm start after first invocation)
        if (TriageLambda.springContext == null) {
            TriageLambda.springContext = SpringApplication.run(TriageApplication.class);
        }
        return springContext.getBean(TriageController.class).handleRequest(input, context);
    }
}
