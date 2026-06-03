package com.newcat.pattern;

/**
 * Unit tests for PatternAnalysisService.
 * Exercises all four analysis methods with concrete check-in data.
 * See TDD Section 7.1 for test case specifications.
 */

import com.newcat.pattern.service.PatternAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class PatternAnalysisServiceTest {

    private PatternAnalysisService service;

    @BeforeEach
    void setUp() {
        service = new PatternAnalysisService();
    }

    // Helper: build a minimal check-in map
    private Map<String, Object> makeCheckin(String eating, String litter, String activity, String ownerNotes) {
        Map<String, Object> c = new HashMap<>();
        c.put("date", "2026-05-01");
        c.put("eating_level", eating);
        c.put("litter_status", litter);
        c.put("activity_level", activity);
        c.put("owner_notes", ownerNotes);
        c.put("eating_notes", null);
        c.put("litter_notes", null);
        return c;
    }

    @Test
    void testAnalyzeEating_allNormal_highConsistency() {
        List<Map<String, Object>> checkins = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            checkins.add(makeCheckin("normal", "normal", "normal", null));
        }

        Map<String, Object> result = service.analyzeEating(checkins);

        assertEquals(7, result.get("total_observations"));
        assertEquals(7, result.get("normal_days"));
        assertEquals(100, result.get("consistency_percentage"));
        assertTrue(((List<?>) result.get("deviations")).isEmpty());
    }

    @Test
    void testAnalyzeEating_oneDeviation_detectsIt() {
        List<Map<String, Object>> checkins = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            checkins.add(makeCheckin("normal", "normal", "normal", null));
        }
        checkins.add(makeCheckin("less_than_normal", "normal", "normal", null));

        Map<String, Object> result = service.analyzeEating(checkins);

        assertEquals(6, result.get("normal_days"));
        List<?> deviations = (List<?>) result.get("deviations");
        assertEquals(1, deviations.size());
    }

    @Test
    void testAnalyzeLitter_anyFlag_setsAnyFlagsTrue() {
        List<Map<String, Object>> checkins = new ArrayList<>();
        checkins.add(makeCheckin("normal", "diarrhea", "normal", null));
        checkins.add(makeCheckin("normal", "normal", "normal", null));

        Map<String, Object> result = service.analyzeLitter(checkins);

        assertTrue((Boolean) result.get("any_flags"));
        assertEquals(1, result.get("normal_days"));
    }

    @Test
    void testAnalyzeActivity_decliningTrend() {
        List<Map<String, Object>> checkins = new ArrayList<>();
        // First 4 days normal
        for (int i = 0; i < 4; i++) {
            checkins.add(makeCheckin("normal", "normal", "normal", null));
        }
        // Last 3 days declining
        checkins.add(makeCheckin("normal", "normal", "calm", null));
        checkins.add(makeCheckin("normal", "normal", "calm", null));
        checkins.add(makeCheckin("normal", "normal", "sleeping_most_of_day", null));

        Map<String, Object> result = service.analyzeActivity(checkins);

        assertEquals("declining", result.get("trend_direction"));
    }

    @Test
    void testDetectTreatAbuse_triggerAlert() {
        List<Map<String, Object>> checkins = new ArrayList<>();
        checkins.add(makeCheckin("normal", "normal", "normal", "gave treats today"));
        checkins.add(makeCheckin("normal", "normal", "normal", "more treats after play"));
        checkins.add(makeCheckin("normal", "normal", "normal", "snack time was fun"));
        checkins.add(makeCheckin("normal", "normal", "normal", "gave extra food and treats"));

        Map<String, Object> result = service.detectTreatAbuse(checkins);

        assertTrue((Boolean) result.get("alert_triggered"));
        assertEquals(4, result.get("mentions_count"));
    }
}
