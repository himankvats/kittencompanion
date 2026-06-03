package com.newcat.checkin.service;

/**
 * Generates human-readable feedback text for each check-in based on the day number
 * and the health levels observed. No LLM calls — rule-based only.
 * See TDD Section 2.4.1 (Feedback Generation Logic) for the full decision tree.
 */

import com.newcat.checkin.dto.CheckinRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class FeedbackService {

    /**
     * Computes the 1-indexed day number since adoption.
     * Day 1 = the adoption date itself.
     */
    public int computeDayNumber(LocalDate adoptionDate) {
        return (int) ChronoUnit.DAYS.between(adoptionDate, LocalDate.now()) + 1;
    }

    /**
     * Generates feedback text for the given check-in.
     *
     * Decision tree (TDD Section 2.4.1):
     *   IF dayNumber == 1:
     *     → "Welcome! You're off to a great start. Track daily observations to spot patterns."
     *   ELSE IF dayNumber == 120 (Month 4):
     *     → "Congratulations! You've been consistent for 4 months. Here's {petName}'s behavioral baseline report for your vet visit."
     *   ELSE IF all levels == "normal":
     *     → "All looks good with {petName} today!"
     *   ELSE IF any level is abnormal:
     *     → "Notice {abnormal_items}. Monitor for the next 24h. Escalate if it worsens."
     *   ELSE:
     *     → "Thanks for the daily check-in!"
     *
     * @param request     The submitted check-in data
     * @param dayNumber   The number of days since adoption (1-indexed)
     * @param petName     The pet's display name
     */
    public String generateFeedback(CheckinRequest request, int dayNumber, String petName) {
        if (dayNumber == 1) {
            return "Welcome! You're off to a great start. Track daily observations to spot patterns.";
        }

        if (dayNumber == 120) {
            return "Congratulations! You've been consistent for 4 months. Here's " + petName
                    + "'s behavioral baseline report for your vet visit.";
        }

        List<String> abnormalItems = buildAbnormalItems(request);

        if (abnormalItems.isEmpty()) {
            return "All looks good with " + petName + " today!";
        }

        String abnormalSummary = String.join(", ", abnormalItems);
        return "Notice " + abnormalSummary + ". Monitor for the next 24h. Escalate if it worsens.";
    }

    /**
     * Builds the list of abnormal field descriptions, e.g.
     * ["eating (less_than_normal)", "activity (calm)"].
     */
    private List<String> buildAbnormalItems(CheckinRequest request) {
        List<String> items = new ArrayList<>();

        String eating = request.getEatingLevel();
        if (eating != null && !eating.equals("normal")) {
            items.add("eating (" + eating + ")");
        }

        String litter = request.getLitterStatus();
        if (litter != null && !litter.equals("normal")) {
            items.add("litter (" + litter + ")");
        }

        String activity = request.getActivityLevel();
        if (activity != null && !activity.equals("normal")) {
            items.add("activity (" + activity + ")");
        }

        return items;
    }
}
