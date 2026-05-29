package com.newcat.vetsummary.service;

/**
 * Orchestrates vet summary generation: fetches check-ins and acute events,
 * calls Claude three times (eating/litter/activity), and assembles HTML/text report.
 * See TDD Section 2.6.1, 4.4 for full specification.
 */

import com.newcat.vetsummary.dto.SummaryRequest;
import com.newcat.vetsummary.dto.SummaryResponse;
import com.newcat.vetsummary.entity.SummaryGeneration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VetSummaryService {

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private ReportFormatter reportFormatter;

    /**
     * TODO: Implement generateSummary (TDD Section 2.6.1)
     * Steps:
     *   1. Fetch all check-ins for pet (full history)
     *   2. Fetch all acute events for pet
     *   3. Call Claude for eating summary (TDD Section 4.4)
     *   4. Call Claude for litter summary (TDD Section 4.4)
     *   5. Call Claude for activity summary (TDD Section 4.4)
     *   6. Assemble HTML report via ReportFormatter.formatAsHTML
     *   7. Assemble text report via ReportFormatter.formatAsText
     *   8. Log to summary_generations table (no content stored)
     *   9. Return SummaryResponse with html_report, text_report, generated_at, data_range
     */
    public SummaryResponse generateSummary(String petId, String userId, SummaryRequest request) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6.1");
    }

    /**
     * TODO: Implement buildHTMLReport (TDD Section 2.6.1)
     * Uses HTML template structure defined in TDD Section 2.6.1.
     */
    private String buildHTMLReport(Object data) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6.1");
    }

    /**
     * TODO: Implement buildTextReport (TDD Section 2.6.1)
     */
    private String buildTextReport(Object data) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6.1");
    }
}
