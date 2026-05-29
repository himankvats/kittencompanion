package com.newcat.triage.service;

/**
 * Queues async messages to SQS for deferred processing (24h follow-up prompts, LLM calls).
 * Uses AWS SDK v2 SqsClient. See TDD Section 3.5 for queue usage context.
 */

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.Map;

@Service
public class SQSService {

    // TODO: Inject SqsClient via Spring config, configured with LocalStack endpoint for dev
    private SqsClient sqsClient;

    /**
     * TODO: Implement sendFollowUpPrompt (TDD Section 3.5)
     * Sends a message to the follow-up SQS queue with concernId and scheduled delivery time.
     */
    public void sendFollowUpPrompt(String concernId, String petId, String userId) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 3.5");
    }

    /**
     * TODO: Implement sendAsyncLLMCall (TDD Section 3.5)
     * Sends concern context to the async-llm-calls queue for background Claude processing.
     */
    public void sendAsyncLLMCall(Map<String, Object> context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 3.5");
    }
}
