package com.newcat.checkin.service;

/**
 * Business logic for daily check-in operations. Validates input, persists to PostgreSQL,
 * generates feedback text, and queues async pattern detection via SQS.
 * See TDD Section 3.4 and API contract TDD Section 2.4.1.
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.checkin.dto.CheckinRequest;
import com.newcat.checkin.dto.CheckinResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CheckinService {

    private static final Logger log = LoggerFactory.getLogger(CheckinService.class);

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Creates a daily check-in for the specified pet after verifying ownership.
     * Steps:
     *   1. Query pet; 404 if not found
     *   2. Verify the JWT user owns the pet; 403 otherwise
     *   3. Compute day number; validate confidence_score usage
     *   4. Insert checkin row (unique constraint catches duplicates → 409)
     *   5. Generate feedback text
     *   6. Fire-and-forget SQS message for pattern detection
     *   7. Write audit log row
     *   8. Return CheckinResponse
     */
    public CheckinResponse createCheckin(String userId, CheckinRequest req) {
        // 1. Fetch pet
        List<Map<String, Object>> petRows = jdbcTemplate.queryForList(
                "SELECT id, user_id, name, adoption_date FROM pets WHERE id = CAST(? AS UUID)",
                req.getPetId()
        );
        if (petRows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        Map<String, Object> pet = petRows.get(0);
        String petOwnerId = pet.get("user_id").toString();
        String petName = pet.get("name").toString();

        // 2. Verify ownership
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to access this resource");
        }

        // 3. Day number + confidence_score validation
        Object adoptionDateObj = pet.get("adoption_date");
        LocalDate adoptionDate = adoptionDateObj != null
            ? ((java.sql.Date) adoptionDateObj).toLocalDate()
            : LocalDate.now();
        int dayNumber = feedbackService.computeDayNumber(adoptionDate);

        if (req.getConfidenceScore() != null && dayNumber != 1 && dayNumber != 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "confidence_score only allowed on day 1 and day 120");
        }

        // 4. Insert checkin
        Map<String, Object> inserted;
        try {
            inserted = jdbcTemplate.queryForMap(
                    "INSERT INTO checkins(pet_id, date, eating_level, eating_notes, " +
                    "litter_status, litter_notes, activity_level, activity_notes, " +
                    "owner_notes, confidence_score) " +
                    "VALUES(CAST(? AS UUID), CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "RETURNING id, date, created_at",
                    req.getPetId(),
                    req.getEatingLevel(),
                    req.getEatingNotes(),
                    req.getLitterStatus(),
                    req.getLitterNotes(),
                    req.getActivityLevel(),
                    req.getActivityNotes(),
                    req.getOwnerNotes(),
                    req.getConfidenceScore()
            );
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A check-in for this pet already exists today");
        }

        // 5. Generate feedback
        String feedbackText = feedbackService.generateFeedback(req, dayNumber, petName);

        // 6. Async SQS — fire and forget
        try {
            String queueUrl = System.getenv("PATTERN_DETECTION_QUEUE_URL");
            if (queueUrl != null && !queueUrl.isBlank()) {
                String msgBody = objectMapper.writeValueAsString(
                        Map.of("petId", req.getPetId(), "userId", userId)
                );
                SqsClient sqsClient = SqsClient.create();
                sqsClient.sendMessage(SendMessageRequest.builder()
                        .queueUrl(queueUrl)
                        .messageBody(msgBody)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to send SQS message for pattern detection: {}", e.getMessage());
        }

        // 7. Audit log
        try {
            String metadata = objectMapper.writeValueAsString(
                    Map.of("petId", req.getPetId(), "dayNumber", dayNumber)
            );
            jdbcTemplate.update(
                    "INSERT INTO audit_logs(user_id, action, metadata) VALUES(CAST(? AS UUID), ?, CAST(? AS JSONB))",
                    userId,
                    "checkin_submitted",
                    metadata
            );
        } catch (Exception e) {
            log.warn("Failed to write audit log: {}", e.getMessage());
        }

        // 8. Build and return response
        CheckinResponse resp = new CheckinResponse();
        resp.setId((UUID) inserted.get("id"));
        resp.setPetId(UUID.fromString(req.getPetId()));

        Object dateObj = inserted.get("date");
        if (dateObj instanceof java.sql.Date) {
            resp.setDate(((java.sql.Date) dateObj).toLocalDate());
        } else if (dateObj instanceof LocalDate) {
            resp.setDate((LocalDate) dateObj);
        }

        resp.setEatingLevel(req.getEatingLevel());
        resp.setEatingNotes(req.getEatingNotes());
        resp.setLitterStatus(req.getLitterStatus());
        resp.setLitterNotes(req.getLitterNotes());
        resp.setActivityLevel(req.getActivityLevel());
        resp.setActivityNotes(req.getActivityNotes());
        resp.setOwnerNotes(req.getOwnerNotes());
        resp.setConfidenceScore(req.getConfidenceScore());
        resp.setFeedbackText(feedbackText);

        Object createdAtObj = inserted.get("created_at");
        if (createdAtObj instanceof java.sql.Timestamp) {
            resp.setCreatedAt(((java.sql.Timestamp) createdAtObj).toLocalDateTime());
        } else if (createdAtObj instanceof LocalDateTime) {
            resp.setCreatedAt((LocalDateTime) createdAtObj);
        }

        return resp;
    }

    /**
     * Returns paginated check-in history for a pet ordered by date DESC.
     * Verifies the requesting user owns the pet.
     */
    public Map<String, Object> getCheckinHistory(String petId, String userId, int limit, int offset) {
        // Fetch pet and verify ownership
        List<Map<String, Object>> petRows = jdbcTemplate.queryForList(
                "SELECT id, user_id FROM pets WHERE id = CAST(? AS UUID)",
                petId
        );
        if (petRows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        String petOwnerId = petRows.get(0).get("user_id").toString();
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to access this resource");
        }

        // Clamp limit
        if (limit <= 0) limit = 30;
        limit = Math.min(limit, 100);

        // Query checkins
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id, pet_id, date, eating_level, eating_notes, litter_status, " +
                "litter_notes, activity_level, activity_notes, owner_notes, " +
                "confidence_score, created_at " +
                "FROM checkins WHERE pet_id = CAST(? AS UUID) " +
                "ORDER BY date DESC LIMIT ? OFFSET ?",
                petId, limit, offset
        );

        // Count total
        Integer total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM checkins WHERE pet_id = CAST(? AS UUID)",
                Integer.class,
                petId
        );

        List<CheckinResponse> checkins = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            CheckinResponse r = new CheckinResponse();
            r.setId((UUID) row.get("id"));
            r.setPetId((UUID) row.get("pet_id"));
            Object dateObj = row.get("date");
            if (dateObj instanceof java.sql.Date) {
                r.setDate(((java.sql.Date) dateObj).toLocalDate());
            } else if (dateObj instanceof LocalDate) {
                r.setDate((LocalDate) dateObj);
            }
            r.setEatingLevel((String) row.get("eating_level"));
            r.setEatingNotes((String) row.get("eating_notes"));
            r.setLitterStatus((String) row.get("litter_status"));
            r.setLitterNotes((String) row.get("litter_notes"));
            r.setActivityLevel((String) row.get("activity_level"));
            r.setActivityNotes((String) row.get("activity_notes"));
            r.setOwnerNotes((String) row.get("owner_notes"));
            r.setConfidenceScore((Integer) row.get("confidence_score"));
            Object createdAtObj = row.get("created_at");
            if (createdAtObj instanceof java.sql.Timestamp) {
                r.setCreatedAt(((java.sql.Timestamp) createdAtObj).toLocalDateTime());
            } else if (createdAtObj instanceof LocalDateTime) {
                r.setCreatedAt((LocalDateTime) createdAtObj);
            }
            checkins.add(r);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("checkins", checkins);
        result.put("total", total != null ? total : 0);
        result.put("limit", limit);
        result.put("offset", offset);
        return result;
    }
}
