package com.newcat.checkin.controller;

import com.amazonaws.services.lambda.runtime.ClientContext;
import com.amazonaws.services.lambda.runtime.CognitoIdentity;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", methods = {org.springframework.web.bind.annotation.RequestMethod.GET, org.springframework.web.bind.annotation.RequestMethod.POST, org.springframework.web.bind.annotation.RequestMethod.PUT, org.springframework.web.bind.annotation.RequestMethod.DELETE, org.springframework.web.bind.annotation.RequestMethod.OPTIONS})
public class CheckinWebController {

    @Autowired
    private CheckinController checkinController;

    @RequestMapping(value = {"/checkins", "/pets/{petId}/checkins"})
    public ResponseEntity<String> handle(HttpServletRequest req) throws IOException {
        APIGatewayProxyRequestEvent event = buildEvent(req);
        APIGatewayProxyResponseEvent response = checkinController.handleRequest(event, localContext());
        return ResponseEntity.status(response.getStatusCode())
                .header("Content-Type", "application/json")
                .body(response.getBody());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\",\"service\":\"checkin\"}");
    }

    private APIGatewayProxyRequestEvent buildEvent(HttpServletRequest req) throws IOException {
        APIGatewayProxyRequestEvent event = new APIGatewayProxyRequestEvent();
        event.setPath(req.getRequestURI());
        event.setHttpMethod(req.getMethod());
        Map<String, String> headers = new HashMap<>();
        Collections.list(req.getHeaderNames()).forEach(h -> { String normalized = "authorization".equalsIgnoreCase(h) ? "Authorization" : h; headers.put(normalized, req.getHeader(h)); });
        event.setHeaders(headers);
        Map<String, String> qp = new HashMap<>();
        if (req.getQueryString() != null) {
            for (String pair : req.getQueryString().split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) qp.put(kv[0], java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        event.setQueryStringParameters(qp);
        String body = req.getReader().lines().collect(Collectors.joining());
        event.setBody(body.isEmpty() ? null : body);
        return event;
    }

    private com.amazonaws.services.lambda.runtime.Context localContext() {
        return new com.amazonaws.services.lambda.runtime.Context() {
            public String getAwsRequestId() { return "local-" + System.currentTimeMillis(); }
            public String getLogGroupName() { return "/local/checkin"; }
            public String getLogStreamName() { return "local"; }
            public String getFunctionName() { return "checkin-local"; }
            public String getFunctionVersion() { return "$LATEST"; }
            public String getInvokedFunctionArn() { return "arn:aws:lambda:local:0:function:checkin-local"; }
            public CognitoIdentity getIdentity() { return null; }
            public ClientContext getClientContext() { return null; }
            public int getRemainingTimeInMillis() { return 30000; }
            public int getMemoryLimitInMB() { return 512; }
            public LambdaLogger getLogger() { return new LambdaLogger() {
                public void log(String msg) { System.out.println(msg); }
                public void log(byte[] msg) { System.out.println(new String(msg)); }
            }; }
        };
    }
}
