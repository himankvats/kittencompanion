package com.newcat.pattern.handler;

/**
 * Handler component for pattern detection triggers.
 * Supports both SQS-driven per-pet requests and EventBridge scheduled sweeps
 * over all active pets. See TDD Section 4.3.
 */

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.newcat.pattern.service.DigestService;
import com.newcat.pattern.service.PatternAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Component
public class PatternDetectionHandler {

    private static final Logger log = Logger.getLogger(PatternDetectionHandler.class.getName());

    @Autowired
    private PatternAnalysisService patternAnalysisService;

    @Autowired
    private DigestService digestService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Handles an SQS event carrying one or more per-pet digest requests.
     * Each message body is expected to contain a "petId" field.
     */
    public void handleSQSEvent(SQSEvent event) {
        for (SQSEvent.SQSMessage record : event.getRecords()) {
            try {
                JsonNode body = mapper.readTree(record.getBody());
                String petId = body.get("petId").asText();
                log.info("Processing pattern detection for pet " + petId);
                digestService.generateWeeklyDigest(petId);
            } catch (Exception e) {
                log.warning("Failed to process SQS record: " + e.getMessage());
            }
        }
    }

    /**
     * Handles an EventBridge scheduled trigger by running digest generation
     * for every pet that has had at least one check-in in the last 7 days.
     */
    public void handleScheduledEvent(ScheduledEvent event) {
        log.info("Running scheduled weekly digest for all active pets");
        List<Map<String, Object>> pets = jdbcTemplate.queryForList(
            "SELECT DISTINCT pet_id::text FROM checkins WHERE date > NOW() - INTERVAL '7 days'"
        );
        for (Map<String, Object> row : pets) {
            String petId = (String) row.get("pet_id");
            try {
                digestService.generateWeeklyDigest(petId);
            } catch (Exception e) {
                log.warning("Failed to generate digest for pet " + petId + ": " + e.getMessage());
            }
        }
        log.info("Scheduled digest run complete. Processed " + pets.size() + " pets.");
    }

    /**
     * Legacy entry point called by PatternDetectionLambda for ScheduledEvent.
     * Delegates to handleScheduledEvent.
     */
    public void run(ScheduledEvent event, Context context) {
        handleScheduledEvent(event);
    }
}
