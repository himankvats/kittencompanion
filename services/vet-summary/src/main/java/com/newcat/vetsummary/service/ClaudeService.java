package com.newcat.vetsummary.service;

/**
 * Calls Claude via AWS Bedrock for each section of the vet summary report.
 * Uses the vet summary system prompt from TDD Section 4.4.
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
     * Returns the system prompt that instructs Claude to write clinical, objective behavioral summaries.
     * See TDD Section 4.4.
     */
    public String getVetSummarySystemPrompt() {
        return """
            You are writing a one-page behavioral baseline report for a kitten's veterinarian.

            Your role:
            - Provide clinical observations in plain language
            - Summarize patterns over the kitten's first months
            - Help the vet understand the owner's baseline observations
            - Organize information clearly and concisely

            Tone: clinical but accessible, factual and objective, professional.

            Format:
            - 2-3 sentences per section
            - Use data and observations, not opinions
            - Include key metrics (consistency %, days observed, etc.)
            """;
    }

    /**
     * Calls Bedrock with the given system and user prompts, returning the text response.
     * See TDD Section 4.4.
     */
    public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
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

            InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(MODEL_ID)
                .body(SdkBytes.fromUtf8String(payload.toString()))
                .build();
            InvokeModelResponse response = getClient().invokeModel(request);
            JsonNode json = mapper.readTree(response.body().asByteArray());
            return json.get("content").get(0).get("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Claude call failed: " + e.getMessage(), e);
        }
    }
}
