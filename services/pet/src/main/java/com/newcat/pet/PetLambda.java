package com.newcat.pet;

/**
 * AWS Lambda handler for the Pet service. Receives API Gateway proxy events, initialises
 * the Spring application context on first invocation, and delegates to PetController.
 * See TDD Section 3.3 for full handler specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.newcat.pet.controller.PetController;
import com.newcat.pet.util.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

import java.util.HashMap;
import java.util.Map;

public class PetLambda implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    // Spring context is reused across warm invocations (singleton per Lambda instance)
    private static ApplicationContext springContext;
    private static final Logger logger = new Logger(PetLambda.class);

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        logger.info("Incoming request",
                "path", input.getPath(),
                "method", input.getHttpMethod(),
                "requestId", context.getAwsRequestId());

        try {
            // TODO: Initialise Spring context on cold start (TDD Section 3.3)
            if (PetLambda.springContext == null) {
                PetLambda.springContext = SpringApplication.run(PetApplication.class);
            }

            // TODO: Delegate to PetController.handleRequest (TDD Section 3.3)
            PetController controller = PetLambda.springContext.getBean(PetController.class);
            return controller.handleRequest(input, context);

        } catch (Exception e) {
            logger.error("Unexpected error in PetLambda", e);
            return createErrorResponse(500, "INTERNAL_SERVER_ERROR", context.getAwsRequestId());
        }
    }

    private APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String errorCode, String requestId) {
        // TODO: Implement proper error response formatting (TDD Section 2.7)
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setHeaders(headers);
        response.setBody(String.format("{\"error\":\"%s\",\"request_id\":\"%s\"}", errorCode, requestId));
        return response;
    }
}
