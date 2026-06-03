package com.newcat.pattern.service;

/**
 * Generates and formats weekly behavioral digests from pattern analysis results.
 * Rule-based digest generation with optional Claude enrichment.
 * Inserts the result into digest_logs. See TDD Section 4.3.
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.logging.Logger;

@Service
public class DigestService {

    private static final Logger log = Logger.getLogger(DigestService.class.getName());

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PatternAnalysisService patternAnalysisService;

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Fetches the last 7 days of check-ins for the given pet, runs all pattern
     * analyses, formats a digest, and persists it to digest_logs.
     * Skips pets with fewer than 3 check-ins in the window.
     */
    public void generateWeeklyDigest(String petId) {
        List<Map<String, Object>> checkins = jdbcTemplate.queryForList(
            "SELECT * FROM checkins WHERE pet_id = ?::uuid AND date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY date DESC",
            petId
        );

        if (checkins.size() < 3) {
            log.info("Not enough check-ins for pet " + petId
                + " to generate digest (found " + checkins.size() + ")");
            return;
        }

        // Fetch pet name for human-readable digest text
        String petName = jdbcTemplate.queryForObject(
            "SELECT name FROM pets WHERE id = ?::uuid", String.class, petId
        );

        Map<String, Object> eating = patternAnalysisService.analyzeEating(checkins);
        Map<String, Object> litter = patternAnalysisService.analyzeLitter(checkins);
        Map<String, Object> activity = patternAnalysisService.analyzeActivity(checkins);
        Map<String, Object> treats = patternAnalysisService.detectTreatAbuse(checkins);

        Map<String, Object> patterns = new LinkedHashMap<>();
        patterns.put("eating", eating);
        patterns.put("litter", litter);
        patterns.put("activity", activity);
        patterns.put("treats", treats);

        String digestText = formatDigest(patterns, petName);

        String dataRangeStart = checkins.isEmpty()
            ? null : String.valueOf(checkins.get(checkins.size() - 1).get("date"));
        String dataRangeEnd = checkins.isEmpty()
            ? null : String.valueOf(checkins.get(0).get("date"));

        String patternsJson;
        try {
            patternsJson = mapper.writeValueAsString(patterns);
        } catch (Exception e) {
            patternsJson = "{}";
        }

        jdbcTemplate.update(
            "INSERT INTO digest_logs(pet_id, digest_text, patterns, data_range_start, data_range_end)"
            + " VALUES(?::uuid, ?, ?::jsonb, ?::date, ?::date)",
            petId, digestText, patternsJson, dataRangeStart, dataRangeEnd
        );

        log.info("Digest generated and stored for pet " + petId);
    }

    /**
     * Produces a concise rule-based summary sentence from analyzed patterns.
     *
     * @param patterns  map containing eating, litter, activity sub-maps
     * @param petName   display name of the pet
     * @return          formatted digest string
     */
    public String formatDigest(Map<String, Object> patterns, String petName) {
        @SuppressWarnings("unchecked")
        Map<String, Object> eating = (Map<String, Object>) patterns.get("eating");
        @SuppressWarnings("unchecked")
        Map<String, Object> litter = (Map<String, Object>) patterns.get("litter");
        @SuppressWarnings("unchecked")
        Map<String, Object> activity = (Map<String, Object>) patterns.get("activity");

        int eatingPct = eating != null
            ? (int) eating.getOrDefault("consistency_percentage", 100) : 100;
        int litterNormal = litter != null
            ? (int) litter.getOrDefault("normal_days", 7) : 7;
        String actTrend = activity != null
            ? (String) activity.getOrDefault("trend", "stable") : "stable";

        return String.format(
            "Week in review for %s: eating %d%% consistent, litter normal %d/7 days, activity %s.",
            petName, eatingPct, litterNormal, actTrend
        );
    }
}
