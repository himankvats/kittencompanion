package com.newcat.triage.service;

/**
 * Calls Claude claude-3-5-sonnet-20241022 via AWS Bedrock Runtime.
 * Builds JSON request payload, invokes model, and parses response text.
 * See TDD Section 4.1 for client specification and prompt format.
 */

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

@Service
public class ClaudeService {

    // Model ID per TDD Section 4.1
    private static final String MODEL_ID = "claude-3-5-sonnet-20241022";
    private final ObjectMapper mapper = new ObjectMapper();

    // TODO: Inject BedrockRuntimeClient via Spring config (TDD Section 4.1)
    private BedrockRuntimeClient client;

    /**
     * TODO: Implement callClaude (TDD Section 4.1)
     * Builds Bedrock InvokeModelRequest with:
     *   - model: claude-3-5-sonnet-20241022
     *   - system prompt
     *   - user prompt
     *   - max_tokens
     * Returns the plain text from the first content block.
     */
    public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.1");
    }

    // TODO: Implement buildRequestPayload (TDD Section 4.1)
    private String buildRequestPayload(String systemPrompt, String userPrompt, int maxTokens) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.1");
    }

    // TODO: Implement parseResponse (TDD Section 4.1)
    private String parseResponse(InvokeModelResponse response) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.1");
    }
}
