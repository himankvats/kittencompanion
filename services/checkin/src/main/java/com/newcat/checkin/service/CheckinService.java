package com.newcat.checkin.service;

/**
 * Business logic for daily check-in operations. Validates input, persists to PostgreSQL,
 * generates feedback text, and queues async pattern detection via SQS.
 * See TDD Section 3.4 and API contract TDD Section 2.4.1.
 */

import com.newcat.checkin.dto.CheckinRequest;
import com.newcat.checkin.dto.CheckinResponse;
import com.newcat.checkin.entity.CheckIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CheckinService {

    @Autowired
    private FeedbackService feedbackService;

    /**
     * TODO: Implement createCheckin (TDD Section 2.4.1)
     * Steps:
     *   1. Validate enums (eating_level, litter_status, activity_level)
     *   2. Validate confidence_score (only Day 1 / Month 4, else null)
     *   3. Insert into checkins table (enforce unique_checkin_per_day constraint)
     *   4. Generate feedback text via FeedbackService.generateFeedback
     *   5. Queue SQS message for async pattern detection
     *   6. Log audit entry: "checkin_submitted"
     *   7. Return CheckinResponse with feedback_text
     */
    public CheckinResponse createCheckin(String userId, CheckinRequest request) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.4.1");
    }

    /**
     * TODO: Implement getCheckinHistory (TDD Section 2.4.2)
     * Returns paginated check-ins for a pet ordered by date DESC.
     * Supports limit (max 100, default 30) and offset pagination.
     */
    public List<CheckinResponse> getCheckinHistory(String petId, String userId, int limit, int offset) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 2.4.2");
    }
}
