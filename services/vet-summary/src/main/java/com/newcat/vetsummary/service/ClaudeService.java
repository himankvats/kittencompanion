package com.newcat.vetsummary.service;

/**
 * Calls Claude via AWS Bedrock for each section of the vet summary report.
 * Uses the vet summary system prompt from TDD Section 4.4.
 */

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

@Service
public class ClaudeService {

    private static final String MODEL_ID = "claude-3-5-sonnet-20241022";

    // TODO: Inject BedrockRuntimeClient (TDD Section 4.1)
    private BedrockRuntimeClient client;

    /**
     * TODO: Implement callClaude (TDD Section 4.4)
     * Calls Bedrock with the vet summary system prompt and a section-specific user prompt.
     */
    public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.4");
    }

    /**
     * TODO: Implement getVetSummarySystemPrompt (TDD Section 4.4)
     * Returns the system prompt that instructs Claude to write clinical, objective behavioral summaries.
     */
    public String getVetSummarySystemPrompt() {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.4");
    }
}
