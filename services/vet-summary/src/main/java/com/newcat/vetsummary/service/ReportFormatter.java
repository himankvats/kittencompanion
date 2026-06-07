package com.newcat.vetsummary.service;

/**
 * Formats assembled vet summary data into HTML and plain text representations.
 * The HTML template structure is defined in TDD Section 2.6.1.
 */

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReportFormatter {

    /**
     * Renders the full HTML report using the template from TDD Section 2.6.1.
     * Includes: Cat Basics, Eating Patterns, Litter Habits, Activity, Acute Events sections.
     */
    @SuppressWarnings("unchecked")
    public String formatAsHTML(Map<String, Object> data) {
        String petName = (String) data.getOrDefault("pet_name", "Unknown");
        String adoptionDate = (String) data.getOrDefault("adoption_date", "");
        String generatedAt = (String) data.getOrDefault("generated_at", "");
        String startDate = (String) data.getOrDefault("data_range_start", "");
        String endDate = (String) data.getOrDefault("data_range_end", "");
        int daysSince = toInt(data.getOrDefault("days_since_adoption", 0));
        int ageMonths = toInt(data.getOrDefault("age_months", 0));

        String eatingSummary = (String) data.getOrDefault("eating_summary", "");
        String litterSummary = (String) data.getOrDefault("litter_summary", "");
        String activitySummary = (String) data.getOrDefault("activity_summary", "");

        Map<String, Object> eatingStats = (Map<String, Object>) data.getOrDefault("eating_stats", Map.of());
        Map<String, Object> litterStats = (Map<String, Object>) data.getOrDefault("litter_stats", Map.of());
        List<Map<String, Object>> acuteEvents = (List<Map<String, Object>>) data.getOrDefault("acute_events", List.of());

        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>");
        html.append("body{font-family:Arial,sans-serif;margin:40px;color:#333;}");
        html.append(".section{margin:20px 0;page-break-inside:avoid;}");
        html.append(".heading{font-size:18px;font-weight:bold;margin-bottom:8px;color:#1a1a2e;}");
        html.append("table{width:100%;border-collapse:collapse;margin-top:8px;}");
        html.append("th,td{border:1px solid #ccc;padding:8px;text-align:left;}");
        html.append("th{background:#f0f0f0;}");
        html.append("</style></head><body>");

        html.append("<h1>Behavioral Baseline Report: ").append(escapeHtml(petName)).append("</h1>");
        html.append("<p>Generated: ").append(generatedAt)
            .append(" | Period: ").append(startDate).append(" to ").append(endDate).append("</p>");

        // Cat Basics section
        html.append("<div class='section'><div class='heading'>Cat Basics</div><table>");
        html.append("<tr><td>Name</td><td>").append(escapeHtml(petName)).append("</td></tr>");
        html.append("<tr><td>Age at Report</td><td>").append(ageMonths).append(" months</td></tr>");
        html.append("<tr><td>Adoption Date</td><td>").append(adoptionDate).append("</td></tr>");
        html.append("<tr><td>Days Since Adoption</td><td>").append(daysSince).append("</td></tr>");
        html.append("</table></div>");

        // Eating Patterns section
        html.append("<div class='section'><div class='heading'>Eating Patterns</div>");
        html.append("<p>").append(escapeHtml(eatingSummary)).append("</p>");
        html.append("<table><tr><th>Metric</th><th>Value</th></tr>");
        html.append("<tr><td>Total observations</td><td>").append(eatingStats.getOrDefault("total", 0)).append("</td></tr>");
        html.append("<tr><td>Normal days</td><td>").append(eatingStats.getOrDefault("normal_days", 0)).append("</td></tr>");
        html.append("<tr><td>Consistency</td><td>").append(eatingStats.getOrDefault("consistency_pct", 0)).append("%</td></tr>");
        html.append("</table></div>");

        // Litter Habits section
        html.append("<div class='section'><div class='heading'>Litter Habits</div>");
        html.append("<p>").append(escapeHtml(litterSummary)).append("</p>");
        html.append("<table><tr><th>Metric</th><th>Value</th></tr>");
        html.append("<tr><td>Total observations</td><td>").append(litterStats.getOrDefault("total", 0)).append("</td></tr>");
        html.append("<tr><td>Normal days</td><td>").append(litterStats.getOrDefault("normal_days", 0)).append("</td></tr>");
        html.append("</table></div>");

        // Activity & Behavior section
        html.append("<div class='section'><div class='heading'>Activity &amp; Behavior</div>");
        html.append("<p>").append(escapeHtml(activitySummary)).append("</p></div>");

        // Acute Events section
        html.append("<div class='section'><div class='heading'>Acute Events / Concerns</div>");
        if (acuteEvents.isEmpty()) {
            html.append("<p>No acute concerns reported during this period.</p>");
        } else {
            html.append("<table><tr><th>Date</th><th>Concern</th><th>Severity</th><th>Outcome</th></tr>");
            for (Map<String, Object> ev : acuteEvents) {
                html.append("<tr><td>").append(ev.getOrDefault("date", "")).append("</td>");
                html.append("<td>").append(escapeHtml((String) ev.getOrDefault("concern_type", ""))).append("</td>");
                html.append("<td>").append(ev.getOrDefault("severity", "")).append("</td>");
                html.append("<td>").append(escapeHtml((String) ev.getOrDefault("resolution", "Pending"))).append("</td></tr>");
            }
            html.append("</table>");
        }
        html.append("</div>");
        html.append("</body></html>");
        return html.toString();
    }

    /**
     * Generates a plain-text version suitable for email delivery.
     * See TDD Section 2.6.1.
     */
    @SuppressWarnings("unchecked")
    public String formatAsText(Map<String, Object> data) {
        String petName = (String) data.getOrDefault("pet_name", "Unknown");
        String startDate = (String) data.getOrDefault("data_range_start", "");
        String endDate = (String) data.getOrDefault("data_range_end", "");
        String eatingSummary = (String) data.getOrDefault("eating_summary", "");
        String litterSummary = (String) data.getOrDefault("litter_summary", "");
        String activitySummary = (String) data.getOrDefault("activity_summary", "");
        List<Map<String, Object>> acuteEvents = (List<Map<String, Object>>) data.getOrDefault("acute_events", List.of());

        StringBuilder sb = new StringBuilder();
        sb.append("BEHAVIORAL BASELINE REPORT: ").append(petName.toUpperCase()).append("\n");
        sb.append("Period: ").append(startDate).append(" to ").append(endDate).append("\n\n");
        sb.append("EATING PATTERNS\n").append(eatingSummary).append("\n\n");
        sb.append("LITTER HABITS\n").append(litterSummary).append("\n\n");
        sb.append("ACTIVITY & BEHAVIOR\n").append(activitySummary).append("\n\n");
        sb.append("ACUTE EVENTS\n");
        if (acuteEvents.isEmpty()) {
            sb.append("No acute concerns reported.\n");
        } else {
            for (Map<String, Object> ev : acuteEvents) {
                sb.append("- ").append(ev.getOrDefault("date", "")).append(": ")
                  .append(ev.getOrDefault("concern_type", "")).append(" (")
                  .append(ev.getOrDefault("resolution", "Pending")).append(")\n");
            }
        }
        return sb.toString();
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private int toInt(Object val) {
        if (val instanceof Number n) return n.intValue();
        return 0;
    }
}
