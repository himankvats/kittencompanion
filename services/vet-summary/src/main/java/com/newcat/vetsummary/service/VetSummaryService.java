package com.newcat.vetsummary.service;

/**
 * Orchestrates vet summary generation: fetches check-ins and acute events,
 * calls Claude three times (eating/litter/activity), and assembles HTML/text report.
 * See TDD Section 2.6.1, 4.4 for full specification.
 */

import com.newcat.vetsummary.dto.SummaryRequest;
import com.newcat.vetsummary.dto.SummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VetSummaryService {

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private ReportFormatter reportFormatter;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generates a vet summary report for the given pet.
     * Steps:
     *   1. Fetch pet record and verify ownership
     *   2. Fetch all check-ins for the pet
     *   3. Optionally fetch acute events
     *   4. Compute eating and litter stats
     *   5. Call Claude three times for eating/litter/activity summaries
     *   6. Assemble HTML and text reports via ReportFormatter
     *   7. Log audit row to summary_generations
     *   8. Return SummaryResponse
     */
    public SummaryResponse generateSummary(String petId, String userId, SummaryRequest request) {
        // 1. Fetch pet
        Map<String, Object> pet = jdbcTemplate.queryForMap(
            "SELECT id::text, user_id::text, name, " +
            "DATE_PART('month', AGE(CURRENT_DATE, adoption_date))::int as age_months, " +
            "adoption_date::text FROM pets WHERE id = CAST(? AS UUID)",
            petId
        );

        // 2. Verify ownership
        String petOwnerId = (String) pet.get("user_id");
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
        }

        String petName = (String) pet.get("name");
        String adoptionDate = (String) pet.get("adoption_date");
        int ageMonths = toInt(pet.get("age_months"));

        // 3. Fetch check-ins
        List<Map<String, Object>> checkins = jdbcTemplate.queryForList(
            "SELECT * FROM checkins WHERE pet_id = CAST(? AS UUID) ORDER BY date DESC",
            petId
        );

        // 4. Fetch acute events if requested
        List<Map<String, Object>> acuteEvents = new ArrayList<>();
        if (request.isIncludeAcuteEvents()) {
            acuteEvents = jdbcTemplate.queryForList(
                "SELECT id::text, concern_type, severity, " +
                "followup_resolution as resolution, created_at::text as date " +
                "FROM acute_events WHERE pet_id = CAST(? AS UUID) ORDER BY created_at DESC",
                petId
            );
        }

        // 5. Compute stats
        int eatingTotal = checkins.size();
        int eatingNormal = 0;
        int litterNormal = 0;
        Map<String, Integer> activityCounts = new HashMap<>();

        for (Map<String, Object> ci : checkins) {
            String eatingLevel = (String) ci.get("eating_level");
            String litterStatus = (String) ci.get("litter_status");
            String activityLevel = (String) ci.get("activity_level");

            if ("normal".equalsIgnoreCase(eatingLevel)) eatingNormal++;
            if ("normal".equalsIgnoreCase(litterStatus)) litterNormal++;
            if (activityLevel != null) {
                activityCounts.merge(activityLevel, 1, Integer::sum);
            }
        }

        int eatingConsistencyPct = eatingTotal > 0 ? (eatingNormal * 100 / eatingTotal) : 0;

        Map<String, Object> eatingStats = new HashMap<>();
        eatingStats.put("total", eatingTotal);
        eatingStats.put("normal_days", eatingNormal);
        eatingStats.put("consistency_pct", eatingConsistencyPct);

        Map<String, Object> litterStats = new HashMap<>();
        litterStats.put("total", eatingTotal);
        litterStats.put("normal_days", litterNormal);

        // Dominant activity level
        String dominantActivity = activityCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("unknown");

        // 6. Call Claude three times
        String systemPrompt = claudeService.getVetSummarySystemPrompt();

        String eatingPrompt = String.format(
            "Eating data for %s: %d observations, %d normal days (%d%% consistent). " +
            "Write a 2-3 sentence clinical eating summary.",
            petName, eatingTotal, eatingNormal, eatingConsistencyPct
        );
        String eatingSummary = claudeService.callClaude(systemPrompt, eatingPrompt, 200);

        String litterPrompt = String.format(
            "Litter data for %s: %d observations, %d normal days. " +
            "Write a 2-3 sentence clinical litter habits summary.",
            petName, eatingTotal, litterNormal
        );
        String litterSummary = claudeService.callClaude(systemPrompt, litterPrompt, 200);

        String activityPrompt = String.format(
            "Activity data for %s: dominant activity level is '%s' across %d observations. " +
            "Write a 2-3 sentence clinical activity and behavior summary.",
            petName, dominantActivity, eatingTotal
        );
        String activitySummary = claudeService.callClaude(systemPrompt, activityPrompt, 200);

        // 7. Determine date range
        LocalDate now = LocalDate.now();
        LocalDate rangeStart = checkins.isEmpty() ? now : now.minusDays(checkins.size());
        String dataRangeStart = rangeStart.toString();
        String dataRangeEnd = now.toString();
        LocalDateTime generatedAt = LocalDateTime.now();

        // 8. Assemble data map for formatters
        Map<String, Object> reportData = new HashMap<>();
        reportData.put("pet_name", petName);
        reportData.put("adoption_date", adoptionDate);
        reportData.put("generated_at", generatedAt.toString());
        reportData.put("data_range_start", dataRangeStart);
        reportData.put("data_range_end", dataRangeEnd);
        reportData.put("days_since_adoption", ageMonths * 30);
        reportData.put("age_months", ageMonths);
        reportData.put("eating_summary", eatingSummary);
        reportData.put("litter_summary", litterSummary);
        reportData.put("activity_summary", activitySummary);
        reportData.put("eating_stats", eatingStats);
        reportData.put("litter_stats", litterStats);
        reportData.put("acute_events", acuteEvents);

        String htmlReport = reportFormatter.formatAsHTML(reportData);
        String textReport = reportFormatter.formatAsText(reportData);

        // 9. Insert audit row into summary_generations
        jdbcTemplate.update(
            "INSERT INTO summary_generations(pet_id, user_id, data_range_start, data_range_end, " +
            "checkins_included, acute_events_included) VALUES(CAST(? AS UUID), CAST(? AS UUID), CAST(? AS DATE), CAST(? AS DATE), ?, ?)",
            petId, userId, dataRangeStart, dataRangeEnd, checkins.size(), acuteEvents.size()
        );

        // 10. Build and return SummaryResponse
        SummaryResponse response = new SummaryResponse();
        response.setHtmlReport(htmlReport);
        response.setTextReport(textReport);
        response.setGeneratedAt(generatedAt);

        Map<String, Object> dataRange = new HashMap<>();
        dataRange.put("start", dataRangeStart);
        dataRange.put("end", dataRangeEnd);
        dataRange.put("days_since_adoption", ageMonths * 30);
        response.setDataRange(dataRange);

        Map<String, Object> summary = new HashMap<>();
        summary.put("pet_name", petName);
        summary.put("adoption_date", adoptionDate);
        summary.put("eating_summary", eatingSummary);
        summary.put("litter_summary", litterSummary);
        summary.put("activity_summary", activitySummary);
        response.setSummary(summary);

        return response;
    }

    private int toInt(Object val) {
        if (val instanceof Number n) return n.intValue();
        return 0;
    }
}
