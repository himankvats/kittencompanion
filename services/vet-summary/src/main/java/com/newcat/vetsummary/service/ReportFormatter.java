package com.newcat.vetsummary.service;

/**
 * Formats assembled vet summary data into HTML and plain text representations.
 * The HTML template structure is defined in TDD Section 2.6.1.
 */

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ReportFormatter {

    /**
     * TODO: Implement formatAsHTML (TDD Section 2.6.1)
     * Renders the full HTML report using the template from TDD Section 2.6.1.
     * Includes: Cat Basics, Eating Patterns, Litter Habits, Activity, Acute Events sections.
     */
    public String formatAsHTML(Map<String, Object> reportData) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6.1");
    }

    /**
     * TODO: Implement formatAsText (TDD Section 2.6.1)
     * Generates a plain-text version suitable for email delivery.
     */
    public String formatAsText(Map<String, Object> reportData) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.6.1");
    }
}
