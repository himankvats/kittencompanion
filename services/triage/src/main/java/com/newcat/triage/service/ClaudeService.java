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
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

@Service
public class ClaudeService {

    // Model ID per TDD Section 4.1
    private static final String MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    private final ObjectMapper mapper = new ObjectMapper();

    private BedrockRuntimeClient client;

    private BedrockRuntimeClient getClient() {
        if (client == null) {
            client = BedrockRuntimeClient.builder().build();
        }
        return client;
    }

    /**
     * Calls the Claude model via Bedrock with the given system and user prompts.
     * Returns the plain text from the first content block of the response.
     * See TDD Section 4.1.
     */
    public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
        SdkBytes payload = buildRequestPayload(systemPrompt, userPrompt, maxTokens);
        InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(MODEL_ID)
                .body(payload)
                .build();
        InvokeModelResponse response = getClient().invokeModel(request);
        return parseResponse(response);
    }

    /**
     * Builds the Bedrock request payload JSON as SdkBytes.
     * Format: anthropic_version, max_tokens, optional system, messages array.
     */
    SdkBytes buildRequestPayload(String systemPrompt, String userPrompt, int maxTokens) {
        try {
            ObjectNode payload = mapper.createObjectNode();
            payload.put("anthropic_version", "bedrock-2023-05-31");
            payload.put("max_tokens", maxTokens);
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                payload.put("system", systemPrompt);
            }
            ArrayNode messages = mapper.createArrayNode();
            ObjectNode msg = mapper.createObjectNode();
            msg.put("role", "user");
            msg.put("content", userPrompt);
            messages.add(msg);
            payload.set("messages", messages);
            return SdkBytes.fromUtf8String(payload.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Claude request payload", e);
        }
    }

    /**
     * Parses the text from the first content block of the Bedrock response.
     */
    String parseResponse(InvokeModelResponse response) {
        try {
            JsonNode json = mapper.readTree(response.body().asByteArray());
            return json.get("content").get(0).get("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Claude response", e);
        }
    }
}
