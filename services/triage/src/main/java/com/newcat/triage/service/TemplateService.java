package com.newcat.triage.service;

/**
 * Manages the 9 concern types and their 27 prompt templates (benign/concerning/urgent per type).
 * Applies rule-based selection logic to choose the appropriate template.
 * See TDD Section 4.2 for system prompt, template selection algorithm, and prompt examples.
 */

import com.newcat.triage.dto.TriageRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TemplateService {

    /**
     * Selects a template identifier (benign | concerning | urgent | conservative_default)
     * based on the concern type and follow-up answers.
     * TODO: Implement (TDD Section 4.2 — Template Selection Algorithm)
     *
     * Concern types: not_eating, vomiting, litter_problems, respiratory,
     *                limping, hiding, eye_ear, skin, other
     * Templates per type: benign, concerning, urgent (3 × 9 = 27 total)
     */
    public String selectTemplate(TriageRequest request) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.2");
    }

    /**
     * Builds the full user prompt string from the selected template and context data.
     * TODO: Implement (TDD Section 4.2 — Example Triage Prompt)
     */
    public String buildPrompt(String templateId, Map<String, Object> context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.2");
    }

    /**
     * Returns the system prompt used for all triage Claude calls.
     * TODO: Implement (TDD Section 4.2 — System Prompt)
     * The system prompt instructs Claude to act as a veterinary assistant with
     * empathic, evidence-based, actionable guidance in 150–250 words.
     */
    public String getSystemPrompt() {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.2");
    }
}
