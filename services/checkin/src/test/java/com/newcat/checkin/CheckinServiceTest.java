package com.newcat.checkin;

/**
 * Unit tests for CheckinService and FeedbackService.
 * See TDD Section 7.1 for test case specifications.
 *
 * Tests 1-2: test CheckinService with mocked JdbcTemplate + FeedbackService.
 * Tests 3-5: test FeedbackService directly with a real instance (no mocking needed).
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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CheckinServiceTest {

    @InjectMocks
    private CheckinService checkinService;

    @Mock
    private FeedbackService feedbackService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    // Real FeedbackService for direct unit tests (tests 3-5)
    private FeedbackService realFeedbackService;

    private CheckinRequest validRequest;

    private static final String PET_ID   = "660e8400-e29b-41d4-a716-446655440001";
    private static final String USER_ID  = "770e8400-e29b-41d4-a716-446655440002";
    private static final String PET_NAME = "Scooter";

    @BeforeEach
    void setUp() {
        validRequest = new CheckinRequest();
        validRequest.setPetId(PET_ID);
        validRequest.setEatingLevel("normal");
        validRequest.setLitterStatus("normal");
        validRequest.setActivityLevel("normal");

        realFeedbackService = new FeedbackService();
    }

    // -------------------------------------------------------------------------
    // Test 1: createCheckin — happy path
    // Uses Answer-based stubbing to avoid vararg matcher pitfalls.
    // -------------------------------------------------------------------------
    @Test
    void testCreateCheckin_success() {
        // Arrange — pet lookup: queryForList(String, Object...) varargs
        Map<String, Object> petRow = new HashMap<>();
        petRow.put("id",            UUID.fromString(PET_ID));
        petRow.put("user_id",       USER_ID);
        petRow.put("name",          PET_NAME);
        petRow.put("adoption_date", Date.valueOf(LocalDate.now()));

        // Use Answer to match any call to queryForList returning our pet row
        doAnswer(invocation -> List.of(petRow))
                .when(jdbcTemplate).queryForList(anyString(), (Object[]) any(Object[].class));

        // queryForMap Answer — returns our insert result for any call
        UUID newId = UUID.randomUUID();
        Map<String, Object> insertedRow = new HashMap<>();
        insertedRow.put("id",         newId);
        insertedRow.put("date",       Date.valueOf(LocalDate.now()));
        insertedRow.put("created_at", Timestamp.valueOf(LocalDateTime.now()));

        doAnswer(invocation -> insertedRow)
                .when(jdbcTemplate).queryForMap(anyString(), (Object[]) any(Object[].class));

        // update() for audit log — use Object... overload explicitly
        doAnswer(invocation -> 1)
                .when(jdbcTemplate).update(anyString(), (Object[]) any(Object[].class));

        // FeedbackService mocks
        doReturn(1).when(feedbackService).computeDayNumber(any(LocalDate.class));
        doReturn("Welcome! You're off to a great start. Track daily observations to spot patterns.")
                .when(feedbackService).generateFeedback(any(), eq(1), eq(PET_NAME));

        // Act
        CheckinResponse resp = checkinService.createCheckin(USER_ID, validRequest);

        // Assert
        assertNotNull(resp);
        assertNotNull(resp.getFeedbackText(), "feedbackText should be populated");
        assertEquals(newId, resp.getId());
        assertTrue(resp.getFeedbackText().contains("Welcome"));
    }

    // -------------------------------------------------------------------------
    // Test 2: createCheckin — duplicate check-in for same day throws 409
    // -------------------------------------------------------------------------
    @Test
    void testCreateCheckin_duplicateForSameDay_throws() {
        // Arrange — pet lookup succeeds
        Map<String, Object> petRow = new HashMap<>();
        petRow.put("id",            UUID.fromString(PET_ID));
        petRow.put("user_id",       USER_ID);
        petRow.put("name",          PET_NAME);
        petRow.put("adoption_date", Date.valueOf(LocalDate.now().minusDays(4)));

        doAnswer(invocation -> List.of(petRow))
                .when(jdbcTemplate).queryForList(anyString(), (Object[]) any(Object[].class));

        doReturn(5).when(feedbackService).computeDayNumber(any(LocalDate.class));

        // Insert throws unique constraint violation
        doThrow(new DataIntegrityViolationException("duplicate key value"))
                .when(jdbcTemplate).queryForMap(anyString(), (Object[]) any(Object[].class));

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> checkinService.createCheckin(USER_ID, validRequest));

        assertEquals(409, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("already exists today"));
    }

    // -------------------------------------------------------------------------
    // Test 3: FeedbackService — Day 1 returns welcome message
    // -------------------------------------------------------------------------
    @Test
    void testFeedbackGeneration_day1() {
        String feedback = realFeedbackService.generateFeedback(validRequest, 1, PET_NAME);

        assertNotNull(feedback);
        assertTrue(feedback.contains("Welcome"),
                "Day-1 feedback should contain 'Welcome', got: " + feedback);
    }

    // -------------------------------------------------------------------------
    // Test 4: FeedbackService — all normal levels returns "All looks good"
    // -------------------------------------------------------------------------
    @Test
    void testFeedbackGeneration_allNormal() {
        // validRequest already has all-normal levels, day != 1 or 120
        String feedback = realFeedbackService.generateFeedback(validRequest, 5, PET_NAME);

        assertNotNull(feedback);
        assertTrue(feedback.contains("All looks good"),
                "All-normal feedback should contain 'All looks good', got: " + feedback);
        assertTrue(feedback.contains(PET_NAME));
    }

    // -------------------------------------------------------------------------
    // Test 5: FeedbackService — abnormal eating triggers "Notice" message
    // -------------------------------------------------------------------------
    @Test
    void testFeedbackGeneration_abnormalEating() {
        CheckinRequest req = new CheckinRequest();
        req.setPetId(PET_ID);
        req.setEatingLevel("less_than_normal");
        req.setLitterStatus("normal");
        req.setActivityLevel("normal");

        String feedback = realFeedbackService.generateFeedback(req, 5, PET_NAME);

        assertNotNull(feedback);
        assertTrue(feedback.contains("Notice"),
                "Abnormal eating feedback should contain 'Notice', got: " + feedback);
        assertTrue(feedback.contains("eating"),
                "Abnormal eating feedback should mention 'eating', got: " + feedback);
    }
}
