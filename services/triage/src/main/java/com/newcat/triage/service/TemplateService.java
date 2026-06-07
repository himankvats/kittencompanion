package com.newcat.triage.service;

/**
 * Manages the 9 concern types and their 27 prompt templates (benign/concerning/urgent per type).
 * Applies rule-based selection logic to choose the appropriate template.
 * See TDD Section 4.2 for system prompt, template selection algorithm, and prompt examples.
 */

import com.newcat.triage.dto.TriageRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TemplateService {

    /**
     * Selects a template identifier (benign | concerning | urgent | conservative_default)
     * based on the concern type and follow-up answers.
     * See TDD Section 4.2 — Template Selection Algorithm.
     *
     * Concern types: not_eating, vomiting, litter_problems, respiratory,
     *                limping, hiding, eye_ear, skin, other
     */
    public String selectTemplate(TriageRequest request) {
        String concernType = request.getConcernType();
        Map<String, Object> answers = request.getFollowupAnswers();
        if (answers == null) {
            answers = Map.of();
        }

        // Urgent conditions — always escalate regardless of other answers
        if ("respiratory".equals(concernType) || "limping".equals(concernType)) {
            return "urgent";
        }
        if (Boolean.TRUE.equals(answers.get("blood_present"))) {
            return "urgent";
        }
        String duration = (String) answers.get("duration");
        if (duration != null && duration.contains("72h+")) {
            return "urgent";
        }

        // Benign: new adoption / separation, short duration, no other symptoms → manage at home
        if ("not_eating".equals(concernType)) {
            String recentChange = (String) answers.getOrDefault("recent_change", "");
            boolean recentAdoption = recentChange != null && recentChange.toLowerCase().contains("adoption");
            boolean wasSeparated = Boolean.TRUE.equals(answers.get("was_separated"));
            Object otherSymptomsRaw = answers.get("other_symptoms");
            boolean noOtherSymptoms = otherSymptomsRaw == null
                    || (otherSymptomsRaw instanceof String s && s.isBlank())
                    || (otherSymptomsRaw instanceof java.util.Collection<?> c && c.isEmpty());
            boolean shortDuration = duration == null
                    || duration.startsWith("24h")
                    || duration.startsWith("12h")
                    || duration.startsWith("less");
            if ((recentAdoption || wasSeparated) && noOtherSymptoms && shortDuration) {
                return "benign";
            }
        }

        // Concerning: litter problems with food change and short duration
        if ("litter_problems".equals(concernType)) {
            boolean foodChange = Boolean.TRUE.equals(answers.get("recent_food_change"));
            boolean shortDur = duration != null
                    && (duration.startsWith("24h") || duration.startsWith("12h") || duration.startsWith("less"));
            if (foodChange && shortDur) {
                return "concerning";
            }
        }

        return "conservative_default";
    }

    /**
     * Maps a template identifier to a severity code.
     * urgent → call_vet_now, benign → manage_at_home, all others → watch
     */
    public String determineSeverity(String template) {
        return switch (template) {
            case "urgent" -> "call_vet_now";
            case "benign" -> "manage_at_home";
            default -> "watch";
        };
    }

    /**
     * Builds the full user prompt string from the selected template and context data.
     * See TDD Section 4.2 — Example Triage Prompt.
     *
     * @param templateId the selected template (benign/concerning/urgent/conservative_default)
     * @param context    map containing keys: petName, ageMonths, adoptionDate, concernType, followupAnswers
     */
    public String buildPrompt(String templateId, Map<String, Object> context) {
        String petName = (String) context.getOrDefault("petName", "Unknown");
        Object ageMonthsObj = context.getOrDefault("ageMonths", 0);
        int ageMonths = ageMonthsObj instanceof Number ? ((Number) ageMonthsObj).intValue() : 0;
        String adoptionDate = (String) context.getOrDefault("adoptionDate", "unknown");
        String concernType = (String) context.getOrDefault("concernType", "other");

        @SuppressWarnings("unchecked")
        Map<String, Object> answers = (Map<String, Object>) context.getOrDefault("followupAnswers", Map.of());

        StringBuilder sb = new StringBuilder();
        sb.append("User's situation:\n");
        sb.append("- Kitten: ").append(petName).append(", ").append(ageMonths).append(" months old\n");
        sb.append("- Adopted: ").append(adoptionDate).append("\n");
        sb.append("- Concern: ").append(concernType.replace("_", " ")).append("\n");

        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            sb.append("- ").append(entry.getKey().replace("_", " "))
              .append(": ").append(entry.getValue()).append("\n");
        }

        sb.append("\nTemplate guidance: ").append(templateId).append("\n");
        sb.append("\nProvide guidance for this owner based on the situation above.");
        return sb.toString();
    }

    /**
     * Returns the system prompt used for all triage Claude calls.
     * See TDD Section 4.2 — System Prompt.
     */
    public String getSystemPrompt() {
        return """
                You are a helpful veterinary assistant supporting first-time cat owners during their cat's first 4 months at home.

                Your role:
                - Acknowledge the owner's concern with empathy
                - Provide evidence-based guidance grounded in feline behavior research
                - Give clear, actionable steps the owner can take at home
                - Identify symptoms that warrant veterinary attention
                - Never diagnose medical conditions or prescribe treatments

                Tone:
                - Reassuring but honest
                - Professional but conversational
                - Avoid medical jargon; explain clearly
                - Acknowledge uncertainty where appropriate

                Format:
                - 2-3 sentences of acknowledgment
                - Bulleted steps or guidance (max 5 items)
                - Clear escalation marker if needed

                Response length: 150-250 words
                """;
    }
}
