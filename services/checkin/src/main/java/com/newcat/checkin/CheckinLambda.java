package com.newcat.checkin;

/**
 * AWS Lambda entry point for the Check-in service. Bootstraps the Spring context
 * on first invocation and delegates to CheckinController.
 * See TDD Section 3.4 for handler specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.checkin.controller.CheckinController;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

public class CheckinLambda implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ApplicationContext springContext;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        // Bootstrap Spring on first cold start; reuse the context on warm invocations.
        if (CheckinLambda.springContext == null) {
            CheckinLambda.springContext = SpringApplication.run(CheckinApplication.class);
        }
        CheckinController controller = CheckinLambda.springContext.getBean(CheckinController.class);
        return controller.handleRequest(input, context);
    }
}
