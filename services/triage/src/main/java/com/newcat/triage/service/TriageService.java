package com.newcat.triage.service;

/**
 * Core triage logic: selects a prompt template based on concern type and symptom answers,
 * calls Claude via Bedrock, determines severity, and inserts into acute_events.
 * See TDD Section 3.5, 4.1, 4.2 for full specification.
 */

import com.newcat.triage.dto.TriageRequest;
import com.newcat.triage.dto.TriageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TriageService {

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private TemplateService templateService;

    @Autowired
    private SQSService sqsService;

    /**
     * TODO: Implement flagConcern (TDD Section 2.5.1)
     * Steps:
     *   1. Validate request (concern_type enum, followup_answers)
     *   2. Select template via TemplateService.selectTemplate
     *   3. Build prompt via TemplateService.buildPrompt
     *   4. Call Claude via ClaudeService.callClaude (async via SQS or inline)
     *   5. Determine severity (manage_at_home | watch | call_vet_now)
     *   6. Insert into acute_events table
     *   7. Queue 24h follow-up message via SQSService
     *   8. Log audit entry: "concern_flagged"
     *   9. Return TriageResponse with severity and response_text
     */
    public TriageResponse flagConcern(String userId, TriageRequest request) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.5.1");
    }

    /**
     * TODO: Implement getConcern (TDD Section 2.5.2)
     */
    public TriageResponse getConcern(String concernId, String userId) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.5.2");
    }

    /**
     * TODO: Implement resolveConcern (TDD Section 2.5.3)
     * Updates acute_events.followup_resolution and followup_resolved_at
     */
    public TriageResponse resolveConcern(String concernId, String userId, String resolution) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.5.3");
    }

    /**
     * TODO: Implement determineSeverity (TDD Section 2.5.1 — Template Selection Algorithm)
     * Rule-based: respiratory/limping → call_vet_now; not_eating < 24h with adoption → manage_at_home; etc.
     */
    private String determineSeverity(TriageRequest request) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.5.1");
    }
}
