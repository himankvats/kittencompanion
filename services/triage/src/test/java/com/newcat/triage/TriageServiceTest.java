package com.newcat.triage;

/**
 * Unit tests for TriageService and TemplateService.
 * See TDD Section 7.1 for test case specifications.
 */

import com.newcat.triage.dto.TriageRequest;
import com.newcat.triage.dto.TriageResponse;
import com.newcat.triage.service.ClaudeService;
import com.newcat.triage.service.SQSService;
import com.newcat.triage.service.TemplateService;
import com.newcat.triage.service.TriageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TriageServiceTest {

    @InjectMocks
    private TriageService triageService;

    @Mock
    private ClaudeService claudeService;

    @Mock
    private TemplateService templateService;

    @Mock
    private SQSService sqsService;

    // TODO: Implement tests per TDD Section 7.1

    @Test
    void testFlagConcern_respiratory_alwaysCallVetNow() {
        // TODO: respiratory concern type should always be severity=call_vet_now (TDD Section 2.5.1)
    }

    @Test
    void testFlagConcern_notEating_recentAdoption_manageAtHome() {
        // TODO: not_eating + < 24h + recent adoption + sibling bonded → manage_at_home (TDD Section 2.5.1)
    }

    @Test
    void testFlagConcern_bloodPresent_alwaysCallVetNow() {
        // TODO: any concern with blood_present == true → call_vet_now (TDD Section 2.5.1)
    }

    @Test
    void testFlagConcern_callsClaudeWithCorrectPrompt() {
        // TODO: Verify ClaudeService.callClaude called with system and user prompts (TDD Section 4.2)
    }

    @Test
    void testResolveConcern_updatesResolution() {
        // TODO: Verify followup_resolution and followup_resolved_at are set (TDD Section 2.5.3)
    }
}
