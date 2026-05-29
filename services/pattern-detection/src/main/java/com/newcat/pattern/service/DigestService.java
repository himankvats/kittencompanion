package com.newcat.pattern.service;

/**
 * Generates and formats weekly behavioral digests from pattern analysis results.
 * Uses the digest system prompt (TDD Section 4.3) and inserts into digest_logs table.
 */

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DigestService {

    /**
     * TODO: Implement generateWeeklyDigest (TDD Section 4.3)
     * Steps:
     *   1. Combine eating/litter/activity/treat patterns into digest context
     *   2. Build digest prompt per TDD Section 4.3 (Digest Prompt Design)
     *   3. Call Claude (optional for weekly digest; can be rule-based first)
     *   4. Insert into digest_logs with patterns JSONB and digest_text
     */
    public String generateWeeklyDigest(String petId, Map<String, Object> patterns) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }

    /**
     * TODO: Implement formatDigest (TDD Section 4.3)
     * Formats the raw digest text for owner display (email or in-app).
     */
    public String formatDigest(String rawDigest, String petName) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }
}
