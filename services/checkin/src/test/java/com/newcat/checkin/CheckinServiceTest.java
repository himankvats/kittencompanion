package com.newcat.checkin;

/**
 * Unit tests for CheckinService and FeedbackService.
 * See TDD Section 7.1 for test case specifications.
 */

import com.newcat.checkin.dto.CheckinRequest;
import com.newcat.checkin.dto.CheckinResponse;
import com.newcat.checkin.service.CheckinService;
import com.newcat.checkin.service.FeedbackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CheckinServiceTest {

    @InjectMocks
    private CheckinService checkinService;

    @Mock
    private FeedbackService feedbackService;

    private CheckinRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CheckinRequest();
        validRequest.setPetId("660e8400-e29b-41d4-a716-446655440001");
        validRequest.setEatingLevel("normal");
        validRequest.setLitterStatus("normal");
        validRequest.setActivityLevel("normal");
    }

    // TODO: Implement tests per TDD Section 7.1

    @Test
    void testCreateCheckin_success() {
        // TODO: Mock repository, assert feedback_text present in response
    }

    @Test
    void testCreateCheckin_duplicateForSameDay_throws() {
        // TODO: Mock unique constraint violation, assert UNIQUE_CONSTRAINT_VIOLATION
    }

    @Test
    void testFeedbackGeneration_day1() {
        // TODO: Assert Day 1 feedback includes welcome message (TDD Section 2.4.1)
    }

    @Test
    void testFeedbackGeneration_allNormal() {
        // TODO: Assert "All looks good" feedback for all-normal check-in
    }

    @Test
    void testFeedbackGeneration_abnormalEating() {
        // TODO: Assert feedback mentions eating deviation
    }
}
