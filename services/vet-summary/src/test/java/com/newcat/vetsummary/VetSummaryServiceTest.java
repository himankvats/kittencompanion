package com.newcat.vetsummary;

/**
 * Unit tests for VetSummaryService, ClaudeService, and ReportFormatter.
 * See TDD Section 7.1 for test case specifications.
 */

import com.newcat.vetsummary.dto.SummaryRequest;
import com.newcat.vetsummary.dto.SummaryResponse;
import com.newcat.vetsummary.service.ClaudeService;
import com.newcat.vetsummary.service.ReportFormatter;
import com.newcat.vetsummary.service.VetSummaryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VetSummaryServiceTest {

    @InjectMocks
    private VetSummaryService vetSummaryService;

    @Mock
    private ClaudeService claudeService;

    @Mock
    private ReportFormatter reportFormatter;

    // TODO: Implement tests per TDD Section 7.1

    @Test
    void testGenerateSummary_callsClaudeThreeTimes() {
        // TODO: Verify Claude called for eating, litter, and activity sections (TDD Section 4.4)
    }

    @Test
    void testGenerateSummary_returnsHtmlAndText() {
        // TODO: Mock formatAsHTML and formatAsText, assert both present in response (TDD Section 2.6.1)
    }

    @Test
    void testGenerateSummary_logsToSummaryGenerations() {
        // TODO: Verify summary_generations row inserted with correct metadata (TDD Section 1.7)
    }

    @Test
    void testGenerateSummary_noPetsData_returnsEmptyReport() {
        // TODO: No check-ins → empty sections, no Claude calls
    }
}
