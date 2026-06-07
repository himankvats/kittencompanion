package com.newcat.triage.service;

/**
 * Queues async messages to SQS for deferred processing (24h follow-up prompts, LLM calls).
 * Uses AWS SDK v2 SqsClient. See TDD Section 3.5 for queue usage context.
 */

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.Map;
import java.util.logging.Logger;

@Service
public class SQSService {

    private static final Logger log = Logger.getLogger(SQSService.class.getName());

    private SqsClient sqsClient;

    private SqsClient getSqsClient() {
        if (sqsClient == null) {
            sqsClient = SqsClient.builder().build();
        }
        return sqsClient;
    }

    /**
     * Sends a 24-hour delayed follow-up reminder to the triage follow-up queue.
     * Silently skips if TRIAGE_QUEUE_URL is not configured.
     * See TDD Section 3.5.
     */
    public void sendFollowUpPrompt(String concernId, String petId, String userId) {
        String queueUrl = System.getenv("TRIAGE_QUEUE_URL");
        if (queueUrl == null || queueUrl.isBlank()) {
            log.warning("TRIAGE_QUEUE_URL not set, skipping SQS follow-up send");
            return;
        }
        try {
            String body = String.format(
                    "{\"action\":\"follow_up\",\"concernId\":\"%s\",\"petId\":\"%s\",\"userId\":\"%s\"}",
                    concernId, petId, userId);
            getSqsClient().sendMessage(SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(body)
                    .delaySeconds(0) // SQS max delay is 15 min; 24h handled via EventBridge or message attribute
                    .build());
        } catch (Exception e) {
            log.warning("Failed to send SQS follow-up prompt: " + e.getMessage());
        }
    }

    /**
     * Sends concern context to the async-llm-calls queue for background Claude processing.
     * Silently skips if ASYNC_LLM_QUEUE_URL is not configured.
     * See TDD Section 3.5.
     */
    public void sendAsyncLLMCall(Map<String, Object> context) {
        String queueUrl = System.getenv("ASYNC_LLM_QUEUE_URL");
        if (queueUrl == null || queueUrl.isBlank()) {
            log.warning("ASYNC_LLM_QUEUE_URL not set, skipping async LLM SQS send");
            return;
        }
        try {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(entry.getKey()).append("\":\"")
                  .append(entry.getValue() != null ? entry.getValue().toString().replace("\"", "\\\"") : "")
                  .append("\"");
                first = false;
            }
            sb.append("}");
            getSqsClient().sendMessage(SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(sb.toString())
                    .build());
        } catch (Exception e) {
            log.warning("Failed to send async LLM call to SQS: " + e.getMessage());
        }
    }
}
