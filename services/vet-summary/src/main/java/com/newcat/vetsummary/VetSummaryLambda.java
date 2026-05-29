package com.newcat.vetsummary;

/**
 * AWS Lambda entry point for the Vet Summary service.
 * Bootstraps Spring context and delegates to VetSummaryController.
 * See TDD Section 2.6 for service specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.vetsummary.controller.VetSummaryController;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

public class VetSummaryLambda implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ApplicationContext springContext;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        // TODO: Implement Spring bootstrap and delegation (TDD Section 2.6)
        if (VetSummaryLambda.springContext == null) {
            VetSummaryLambda.springContext = SpringApplication.run(VetSummaryApplication.class);
        }
        return springContext.getBean(VetSummaryController.class).handleRequest(input, context);
    }
}
