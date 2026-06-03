package com.newcat.triage;

/**
 * Unit tests for TriageService and TemplateService.
 * See TDD Section 7.1 for test case specifications.
 *
 * Tests 1, 2, 5: exercise TemplateService directly (pure rule logic — no DB/Claude needed).
 * Tests 3, 4: exercise TriageService with mocked JdbcTemplate, ClaudeService, SQSService.
 */

import com.newcat.triage.dto.TriageRequest;
import com.newcat.triage.dto.TriageResponse;
import com.newcat.triage.service.ClaudeService;
import com.newcat.triage.service.SQSService;
import com.newcat.triage.service.TemplateService;
import com.newcat.triage.service.TriageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TriageServiceTest {

    // --- TriageService under test (with mocked dependencies) ---
    @InjectMocks
    private TriageService triageService;

    @Mock
    private ClaudeService claudeService;

    @Mock
    private TemplateService templateService;

    @Mock
    private SQSService sqsService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    // A real TemplateService for pure-logic tests (tests 1, 2, 5)
    private final TemplateService realTemplateService = new TemplateService();

    // -----------------------------------------------------------------------
    // Test 1: respiratory concern type always maps to template "urgent"
    // -----------------------------------------------------------------------
    @Test
    void testFlagConcern_respiratory_alwaysCallVetNow() {
        TriageRequest req = new TriageRequest();
        req.setConcernType("respiratory");
        req.setPetId("some-pet-id");
        req.setFollowupAnswers(Map.of());

        String template = realTemplateService.selectTemplate(req);
        String severity = realTemplateService.determineSeverity(template);

        assertEquals("urgent", template, "respiratory should always select the 'urgent' template");
        assertEquals("call_vet_now", severity, "urgent template should map to call_vet_now severity");
    }

    // -----------------------------------------------------------------------
    // Test 2: not_eating + recent adoption + short duration + no other symptoms → benign
    // -----------------------------------------------------------------------
    @Test
    void testFlagConcern_notEating_recentAdoption_manageAtHome() {
        TriageRequest req = new TriageRequest();
        req.setConcernType("not_eating");
        req.setPetId("some-pet-id");

        Map<String, Object> answers = new HashMap<>();
        answers.put("was_separated", true);
        answers.put("duration", "24h");
        answers.put("other_symptoms", Collections.emptyList());
        req.setFollowupAnswers(answers);

        String template = realTemplateService.selectTemplate(req);
        String severity = realTemplateService.determineSeverity(template);

        assertEquals("benign", template,
                "not_eating + was_separated + short duration + no other symptoms should be 'benign'");
        assertEquals("manage_at_home", severity,
                "benign template should map to manage_at_home severity");
    }

    // -----------------------------------------------------------------------
    // Test 3: getConcern with no matching row → 404 ResponseStatusException
    // -----------------------------------------------------------------------
    @Test
    void testGetConcern_notFound() {
        when(jdbcTemplate.queryForList(anyString(), any(Object[].class)))
                .thenReturn(Collections.emptyList());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> triageService.getConcern("non-existent-id", "user-123"));

        assertEquals(404, ex.getStatusCode().value(), "Should throw 404 when concern is not found");
    }

    // -----------------------------------------------------------------------
    // Test 4: resolveConcern calls UPDATE and returns updated TriageResponse
    // -----------------------------------------------------------------------
    @Test
    void testResolveConcern_success() {
        String concernId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        String petId     = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
        String userId    = "cccccccc-cccc-cccc-cccc-cccccccccccc";
        String resolution = "resolved";

        // Row returned for getConcern (ownership check + final fetch after update)
        Map<String, Object> row = new HashMap<>();
        row.put("id", concernId);
        row.put("pet_id", petId);
        row.put("concern_type", "not_eating");
        row.put("severity", "watch");
        row.put("response_text", "Monitor your cat.");
        row.put("followup_resolution", resolution);
        row.put("followup_resolved_at", LocalDateTime.now());
        row.put("created_at", LocalDateTime.now());
        row.put("pet_owner_id", userId);

        when(jdbcTemplate.queryForList(anyString(), any(Object[].class)))
                .thenReturn(List.of(row));
        when(jdbcTemplate.update(anyString(), any(Object[].class)))
                .thenReturn(1);

        TriageResponse response = triageService.resolveConcern(concernId, userId, resolution);

        assertNotNull(response, "Response should not be null");
        assertEquals(resolution, response.getFollowupResolution(),
                "followup_resolution should match the provided resolution");

        // Verify UPDATE was called
        verify(jdbcTemplate, atLeastOnce()).update(contains("SET followup_resolution"), any(Object[].class));
    }

    // -----------------------------------------------------------------------
    // Test 5: any concern with blood_present == true → template "urgent"
    // -----------------------------------------------------------------------
    @Test
    void testTemplateSelection_bloodPresent() {
        TriageRequest req = new TriageRequest();
        req.setConcernType("vomiting");
        req.setPetId("some-pet-id");
        req.setFollowupAnswers(Map.of("blood_present", Boolean.TRUE));

        String template = realTemplateService.selectTemplate(req);
        String severity = realTemplateService.determineSeverity(template);

        assertEquals("urgent", template,
                "Any concern with blood_present=true should select the 'urgent' template");
        assertEquals("call_vet_now", severity,
                "urgent template should map to call_vet_now severity");
    }
}
