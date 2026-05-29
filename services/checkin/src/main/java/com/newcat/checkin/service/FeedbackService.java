package com.newcat.checkin.service;

/**
 * Generates human-readable feedback text for each check-in based on the day number
 * and the health levels observed. No LLM calls — rule-based only.
 * See TDD Section 2.4.1 (Feedback Generation Logic) for the full decision tree.
 */

import com.newcat.checkin.dto.CheckinRequest;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    /**
     * Generates feedback text for the given check-in.
     * TODO: Implement (TDD Section 2.4.1)
     *
     * Decision tree:
     *   IF dayNumber == 1:
     *     → "Welcome! You're off to a great start. Track daily observations to spot patterns."
     *   ELSE IF dayNumber == 120 (Month 4):
     *     → "Congratulations! 4 months of consistent tracking. Here's {petName}'s baseline report."
     *   ELSE IF all levels == "normal":
     *     → "All looks good with {petName} today!"
     *   ELSE IF any level is abnormal:
     *     → "Notice {abnormal_items}. Monitor for the next 24h. Escalate if worsens."
     *   ELSE:
     *     → "Thanks for the daily check-in!"
     *
     * @param request     The submitted check-in data
     * @param dayNumber   The number of days since adoption (1-indexed)
     * @param petName     The pet's display name
     */
    public String generateFeedback(CheckinRequest request, int dayNumber, String petName) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.4.1");
    }
}
