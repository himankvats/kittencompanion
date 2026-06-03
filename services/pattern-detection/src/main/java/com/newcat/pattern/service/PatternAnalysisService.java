package com.newcat.pattern.service;

/**
 * Analyses 7-day check-in data to detect eating, litter, and activity patterns.
 * Also checks for treat abuse mentions in owner_notes.
 * Rule-based — no LLM calls. See TDD Section 4.3 for analysis logic.
 */

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PatternAnalysisService {

    /**
     * Analyzes eating patterns from the past week's check-ins.
     * Returns: { total_observations, normal_days, consistency_percentage, deviations: [] }
     */
    public Map<String, Object> analyzeEating(List<Map<String, Object>> checkins) {
        int total = checkins.size();
        int normalDays = 0;
        List<Map<String, Object>> deviations = new ArrayList<>();

        for (Map<String, Object> c : checkins) {
            String level = (String) c.get("eating_level");
            if ("normal".equals(level)) {
                normalDays++;
            } else {
                Map<String, Object> dev = new LinkedHashMap<>();
                dev.put("date", String.valueOf(c.get("date")));
                dev.put("level", level);
                dev.put("context", c.get("eating_notes") != null ? c.get("eating_notes") : "");
                deviations.add(dev);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_observations", total);
        result.put("normal_days", normalDays);
        result.put("consistency_percentage", total == 0 ? 100 : (normalDays * 100) / total);
        result.put("deviations", deviations);
        return result;
    }

    /**
     * Analyzes litter box patterns from the past week's check-ins.
     * Returns: { total_observations, normal_days, any_flags, deviations: [] }
     */
    public Map<String, Object> analyzeLitter(List<Map<String, Object>> checkins) {
        int total = checkins.size();
        int normalDays = 0;
        List<Map<String, Object>> deviations = new ArrayList<>();
        boolean anyFlags = false;

        for (Map<String, Object> c : checkins) {
            String status = (String) c.get("litter_status");
            if ("normal".equals(status)) {
                normalDays++;
            } else {
                anyFlags = true;
                Map<String, Object> dev = new LinkedHashMap<>();
                dev.put("date", String.valueOf(c.get("date")));
                dev.put("status", status);
                dev.put("context", c.get("litter_notes") != null ? c.get("litter_notes") : "");
                deviations.add(dev);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_observations", total);
        result.put("normal_days", normalDays);
        result.put("any_flags", anyFlags);
        result.put("deviations", deviations);
        return result;
    }

    /**
     * Analyzes activity level trends from the past week's check-ins.
     * Returns: { trend, avg_level, observations: [], trend_direction }
     */
    public Map<String, Object> analyzeActivity(List<Map<String, Object>> checkins) {
        List<String> observations = new ArrayList<>();
        for (Map<String, Object> c : checkins) {
            observations.add((String) c.get("activity_level"));
        }

        // Find dominant (most-frequent) level
        Map<String, Long> freq = new HashMap<>();
        for (String obs : observations) {
            if (obs != null) freq.merge(obs, 1L, Long::sum);
        }
        String avgLevel = freq.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("normal");

        // Compute trend from last 3 days vs earlier days
        String trendDirection = "stable";
        if (observations.size() >= 3) {
            List<String> last3 = observations.subList(observations.size() - 3, observations.size());
            boolean allCalm = last3.stream().allMatch(l -> "calm".equals(l) || "sleeping_most_of_day".equals(l));
            boolean allActive = last3.stream().allMatch(l -> "very_active".equals(l) || "normal".equals(l));
            if (allCalm) {
                trendDirection = "declining";
            } else if (allActive && observations.size() > 3) {
                // Only call it improving if there were prior (calmer) days before the active last-3
                trendDirection = "improving";
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("trend", trendDirection);
        result.put("avg_level", avgLevel);
        result.put("observations", observations);
        result.put("trend_direction", trendDirection);
        return result;
    }

    /**
     * Scans owner_notes for treat/snack keyword mentions over the week.
     * Returns: { mentions_count, dates: [], alert_triggered }
     * Alert is triggered when mentions_count > 3.
     */
    public Map<String, Object> detectTreatAbuse(List<Map<String, Object>> checkins) {
        List<String> keywords = Arrays.asList("treat", "treats", "snack", "extra food");
        int mentionsCount = 0;
        List<String> dates = new ArrayList<>();

        for (Map<String, Object> c : checkins) {
            String notes = (String) c.get("owner_notes");
            if (notes == null) continue;
            String lower = notes.toLowerCase();
            boolean found = keywords.stream().anyMatch(lower::contains);
            if (found) {
                mentionsCount++;
                dates.add(String.valueOf(c.get("date")));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mentions_count", mentionsCount);
        result.put("dates", dates);
        result.put("alert_triggered", mentionsCount > 3);
        return result;
    }
}
