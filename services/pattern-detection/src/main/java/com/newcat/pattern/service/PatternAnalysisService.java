package com.newcat.pattern.service;

/**
 * Analyses 7-day check-in data to detect eating, litter, and activity patterns.
 * Also checks for treat abuse mentions in owner_notes.
 * Rule-based — no LLM calls. See TDD Section 4.3 for analysis logic.
 */

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PatternAnalysisService {

    /**
     * TODO: Implement analyzeEating (TDD Section 4.3)
     * Returns eating pattern map:
     * { total_observations, normal_days, consistency_percentage, deviations: [] }
     */
    public Map<String, Object> analyzeEating(List<Map<String, Object>> checkins) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }

    /**
     * TODO: Implement analyzeLitter (TDD Section 4.3)
     * Returns litter pattern map:
     * { total_observations, normal_days, any_flags, deviations: [] }
     */
    public Map<String, Object> analyzeLitter(List<Map<String, Object>> checkins) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }

    /**
     * TODO: Implement analyzeActivity (TDD Section 4.3)
     * Returns activity trend map:
     * { trend, avg_level, observations: [], trend_direction }
     */
    public Map<String, Object> analyzeActivity(List<Map<String, Object>> checkins) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }

    /**
     * TODO: Implement detectTreatAbuse (TDD Section 4.3)
     * Scans owner_notes for treat mentions, returns treat usage map:
     * { mentions_count, dates: [], alert_triggered }
     */
    public Map<String, Object> detectTreatAbuse(List<Map<String, Object>> checkins) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }
}
