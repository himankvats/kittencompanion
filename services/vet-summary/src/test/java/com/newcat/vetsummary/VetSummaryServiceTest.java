package com.newcat.vetsummary;

/**
 * Unit tests for VetSummaryService.
 * See TDD Section 7.1 for test case specifications.
 */

import com.newcat.vetsummary.dto.SummaryRequest;
import com.newcat.vetsummary.dto.SummaryResponse;
import com.newcat.vetsummary.service.ClaudeService;
import com.newcat.vetsummary.service.ReportFormatter;
import com.newcat.vetsummary.service.VetSummaryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VetSummaryServiceTest {

    @Mock
    private ClaudeService claudeService;

    @Mock
    private ReportFormatter reportFormatter;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private VetSummaryService vetSummaryService;

    private static final String PET_ID = "pet-uuid-001";
    private static final String USER_ID = "user-uuid-001";

    /** Builds a standard pet row map for mock returns. */
    private Map<String, Object> petRow(String userId) {
        return Map.of(
            "id", PET_ID,
            "user_id", userId,
            "name", "Whiskers",
            "age_months", 3,
            "adoption_date", "2026-03-01"
        );
    }

    /** Builds a standard checkin row. */
    private Map<String, Object> checkinRow(String eatingLevel, String litterStatus, String activityLevel) {
        return Map.of(
            "id", "ci-001",
            "pet_id", PET_ID,
            "eating_level", eatingLevel,
            "litter_status", litterStatus,
            "activity_level", activityLevel,
            "date", "2026-05-01"
        );
    }

    private SummaryRequest defaultRequest() {
        SummaryRequest req = new SummaryRequest();
        req.setFormat("html");
        req.setIncludeAcuteEvents(true);
        return req;
    }

    /**
     * Test 1: Basic success — mock pet, checkins, Claude, formatter; assert htmlReport is non-null.
     */
    @Test
    void testGenerateSummary_basicSuccess() {
        when(jdbcTemplate.queryForMap(anyString(), ArgumentMatchers.<Object>any()))
            .thenReturn(petRow(USER_ID));
        when(jdbcTemplate.queryForList(contains("checkins"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of(checkinRow("normal", "normal", "active")));
        when(jdbcTemplate.queryForList(contains("acute_events"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of());

        when(claudeService.getVetSummarySystemPrompt()).thenReturn("system prompt");
        when(claudeService.callClaude(anyString(), contains("Eating"), anyInt())).thenReturn("eating summary");
        when(claudeService.callClaude(anyString(), contains("Litter"), anyInt())).thenReturn("litter summary");
        when(claudeService.callClaude(anyString(), contains("Activity"), anyInt())).thenReturn("activity summary");

        when(reportFormatter.formatAsHTML(anyMap())).thenReturn("<html>report</html>");
        when(reportFormatter.formatAsText(anyMap())).thenReturn("text report");

        SummaryResponse result = vetSummaryService.generateSummary(PET_ID, USER_ID, defaultRequest());

        assertNotNull(result);
        assertNotNull(result.getHtmlReport());
        assertEquals("<html>report</html>", result.getHtmlReport());
        assertEquals("text report", result.getTextReport());
    }

    /**
     * Test 2: When includeAcuteEvents=false, the acute_events query is not called.
     */
    @Test
    void testGenerateSummary_excludesAcuteEvents() {
        when(jdbcTemplate.queryForMap(anyString(), ArgumentMatchers.<Object>any()))
            .thenReturn(petRow(USER_ID));
        when(jdbcTemplate.queryForList(contains("checkins"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of(checkinRow("normal", "normal", "active")));

        when(claudeService.getVetSummarySystemPrompt()).thenReturn("system prompt");
        when(claudeService.callClaude(anyString(), anyString(), anyInt())).thenReturn("summary");

        when(reportFormatter.formatAsHTML(anyMap())).thenReturn("<html/>");
        when(reportFormatter.formatAsText(anyMap())).thenReturn("text");

        SummaryRequest req = new SummaryRequest();
        req.setFormat("html");
        req.setIncludeAcuteEvents(false);

        vetSummaryService.generateSummary(PET_ID, USER_ID, req);

        // Verify acute_events table was never queried
        verify(jdbcTemplate, never()).queryForList(contains("acute_events"), ArgumentMatchers.<Object>any());
    }

    /**
     * Test 3: Claude is called exactly 3 times (eating, litter, activity).
     */
    @Test
    void testGenerateSummary_claudeCalledThreeTimes() {
        when(jdbcTemplate.queryForMap(anyString(), ArgumentMatchers.<Object>any()))
            .thenReturn(petRow(USER_ID));
        when(jdbcTemplate.queryForList(contains("checkins"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of(checkinRow("normal", "normal", "active")));
        when(jdbcTemplate.queryForList(contains("acute_events"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of());

        when(claudeService.getVetSummarySystemPrompt()).thenReturn("system prompt");
        when(claudeService.callClaude(anyString(), anyString(), anyInt())).thenReturn("summary");

        when(reportFormatter.formatAsHTML(anyMap())).thenReturn("<html/>");
        when(reportFormatter.formatAsText(anyMap())).thenReturn("text");

        vetSummaryService.generateSummary(PET_ID, USER_ID, defaultRequest());

        verify(claudeService, times(3)).callClaude(anyString(), anyString(), anyInt());
    }

    /**
     * Test 4: Audit log row is inserted into summary_generations after generation.
     */
    @Test
    void testGenerateSummary_auditLogInserted() {
        when(jdbcTemplate.queryForMap(anyString(), ArgumentMatchers.<Object>any()))
            .thenReturn(petRow(USER_ID));
        when(jdbcTemplate.queryForList(contains("checkins"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of(checkinRow("normal", "normal", "active")));
        when(jdbcTemplate.queryForList(contains("acute_events"), ArgumentMatchers.<Object>any()))
            .thenReturn(List.of());

        when(claudeService.getVetSummarySystemPrompt()).thenReturn("system prompt");
        when(claudeService.callClaude(anyString(), anyString(), anyInt())).thenReturn("summary");

        when(reportFormatter.formatAsHTML(anyMap())).thenReturn("<html/>");
        when(reportFormatter.formatAsText(anyMap())).thenReturn("text");

        vetSummaryService.generateSummary(PET_ID, USER_ID, defaultRequest());

        // Verify that jdbcTemplate.update was called with the INSERT INTO summary_generations SQL
        verify(jdbcTemplate, atLeastOnce()).update(
            contains("INSERT INTO summary_generations"),
            any(Object[].class)
        );
    }

    /**
     * Test 5: When the pet's user_id does not match the requesting userId, a 403 is thrown.
     */
    @Test
    void testGenerateSummary_petNotOwnedByUser() {
        String differentUserId = "other-user-uuid";
        when(jdbcTemplate.queryForMap(anyString(), ArgumentMatchers.<Object>any()))
            .thenReturn(petRow(differentUserId)); // pet owned by a different user

        SummaryRequest req = defaultRequest();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> vetSummaryService.generateSummary(PET_ID, USER_ID, req)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
