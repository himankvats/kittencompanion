package com.newcat.triage.service;

/**
 * Core triage logic: selects a prompt template based on concern type and symptom answers,
 * calls Claude via Bedrock, determines severity, and inserts into acute_events.
 * See TDD Section 3.5, 4.1, 4.2 for full specification.
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newcat.triage.dto.TriageRequest;
import com.newcat.triage.dto.TriageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class TriageService {

    private static final Logger log = Logger.getLogger(TriageService.class.getName());
    private static final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private TemplateService templateService;

    @Autowired
    private SQSService sqsService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Flags an acute concern for a pet owned by the given user.
     * Steps: fetch pet, verify ownership, select template, call Claude,
     * insert acute_event, queue follow-up, log audit. See TDD Section 2.5.1.
     */
    public TriageResponse flagConcern(String userId, TriageRequest request) {
        // 1. Fetch pet from DB
        String petQuery = "SELECT id::text, user_id::text, name, " +
                "DATE_PART('month', AGE(CURRENT_DATE, adoption_date))::int as age_months, " +
                "adoption_date::text FROM pets WHERE id = CAST(? AS UUID)";
        List<Map<String, Object>> pets = jdbcTemplate.queryForList(petQuery, request.getPetId());
        if (pets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        Map<String, Object> pet = pets.get(0);
        String petOwnerId = (String) pet.get("user_id");

        // 2. Verify ownership
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this pet");
        }

        String petId = (String) pet.get("id");
        String petName = (String) pet.get("name");
        int ageMonths = pet.get("age_months") instanceof Number
                ? ((Number) pet.get("age_months")).intValue() : 0;
        String adoptionDate = (String) pet.get("adoption_date");

        // 3. Select template
        String template = templateService.selectTemplate(request);

        // 4. Determine severity
        String severity = templateService.determineSeverity(template);

        // 5. Build prompts
        String systemPrompt = templateService.getSystemPrompt();
        Map<String, Object> promptContext = new HashMap<>();
        promptContext.put("petName", petName);
        promptContext.put("ageMonths", ageMonths);
        promptContext.put("adoptionDate", adoptionDate);
        promptContext.put("concernType", request.getConcernType());
        promptContext.put("followupAnswers", request.getFollowupAnswers() != null
                ? request.getFollowupAnswers() : Map.of());
        String userPrompt = templateService.buildPrompt(template, promptContext);

        // 6. Call Claude
        String responseText = claudeService.callClaude(systemPrompt, userPrompt, 500);

        // 7. Serialize followup_answers to JSON
        String followupAnswersJson;
        try {
            followupAnswersJson = mapper.writeValueAsString(
                    request.getFollowupAnswers() != null ? request.getFollowupAnswers() : Map.of());
        } catch (Exception e) {
            followupAnswersJson = "{}";
        }

        // 8. Insert into acute_events
        String insertSql = "INSERT INTO acute_events" +
                "(pet_id, concern_type, followup_answers, template_selected, severity, response_text) " +
                "VALUES (CAST(? AS UUID), ?, CAST(? AS JSONB), ?, ?, ?) RETURNING id::text, created_at";
        Map<String, Object> inserted = jdbcTemplate.queryForMap(insertSql,
                petId,
                request.getConcernType(),
                followupAnswersJson,
                template,
                severity,
                responseText);

        String concernId = (String) inserted.get("id");
        LocalDateTime createdAt = inserted.get("created_at") instanceof LocalDateTime
                ? (LocalDateTime) inserted.get("created_at")
                : LocalDateTime.now();

        // 9. Queue 24h follow-up (fire-and-forget)
        try {
            sqsService.sendFollowUpPrompt(concernId, petId, userId);
        } catch (Exception e) {
            log.warning("SQS follow-up send failed (non-fatal): " + e.getMessage());
        }

        // 10. Audit log (fire-and-forget)
        try {
            String auditSql = "INSERT INTO audit_logs (user_id, action, resource_type, resource_id) " +
                    "VALUES (CAST(? AS UUID), ?, ?, CAST(? AS UUID))";
            jdbcTemplate.update(auditSql, userId, "concern_flagged", "acute_events", concernId);
        } catch (Exception e) {
            log.warning("Audit log insert failed (non-fatal): " + e.getMessage());
        }

        // 11. Build response
        TriageResponse response = new TriageResponse();
        response.setId(UUID.fromString(concernId));
        response.setPetId(UUID.fromString(petId));
        response.setConcernType(request.getConcernType());
        response.setSeverity(severity);
        response.setSeverityLabel(toSeverityLabel(severity));
        response.setResponseText(responseText);
        response.setCreatedAt(createdAt);
        return response;
    }

    /**
     * Fetches an acute concern by ID, verifying the caller owns the associated pet.
     * See TDD Section 2.5.2.
     */
    public TriageResponse getConcern(String concernId, String userId) {
        String sql = "SELECT ae.id::text, ae.pet_id::text, ae.concern_type, ae.severity, " +
                "ae.response_text, ae.followup_resolution, ae.followup_resolved_at, ae.created_at, " +
                "ae.template_selected, p.user_id::text as pet_owner_id " +
                "FROM acute_events ae " +
                "JOIN pets p ON p.id = ae.pet_id " +
                "WHERE ae.id = CAST(? AS UUID)";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, concernId);
        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Concern not found");
        }
        Map<String, Object> row = rows.get(0);
        String petOwnerId = (String) row.get("pet_owner_id");
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
        }
        return mapToTriageResponse(row);
    }

    /**
     * Marks a concern as resolved with the given resolution code.
     * Updates followup_resolution and followup_resolved_at. See TDD Section 2.5.3.
     */
    public TriageResponse resolveConcern(String concernId, String userId, String resolution) {
        // Verify ownership first
        getConcern(concernId, userId);

        // Update resolution fields
        String updateSql = "UPDATE acute_events " +
                "SET followup_resolution = ?, followup_resolved_at = NOW() " +
                "WHERE id = CAST(? AS UUID)";
        int updated = jdbcTemplate.update(updateSql, resolution, concernId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Concern not found");
        }

        // Audit log (fire-and-forget)
        try {
            String auditSql = "INSERT INTO audit_logs (user_id, action, resource_type, resource_id) " +
                    "VALUES (CAST(? AS UUID), ?, ?, CAST(? AS UUID))";
            jdbcTemplate.update(auditSql, userId, "concern_resolved", "acute_events", concernId);
        } catch (Exception e) {
            log.warning("Audit log insert failed (non-fatal): " + e.getMessage());
        }

        // Return updated record
        return getConcern(concernId, userId);
    }

    /**
     * Returns all concerns for a pet, verifying the caller owns it.
     */
    public List<TriageResponse> listConcernsForPet(String petId, String userId) {
        // Verify pet ownership
        String ownerSql = "SELECT user_id::text FROM pets WHERE id = CAST(? AS UUID)";
        List<Map<String, Object>> petRows = jdbcTemplate.queryForList(ownerSql, petId);
        if (petRows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        String petOwnerId = (String) petRows.get(0).get("user_id");
        if (!userId.equals(petOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
        }

        String sql = "SELECT ae.id::text, ae.pet_id::text, ae.concern_type, ae.severity, " +
                "ae.response_text, ae.followup_resolution, ae.followup_resolved_at, ae.created_at, " +
                "ae.template_selected, p.user_id::text as pet_owner_id " +
                "FROM acute_events ae JOIN pets p ON p.id = ae.pet_id " +
                "WHERE ae.pet_id = CAST(? AS UUID) ORDER BY ae.created_at DESC";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, petId);
        return rows.stream().map(this::mapToTriageResponse).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Applies rule-based logic to determine severity from the request directly.
     * The canonical path is via TemplateService.selectTemplate + determineSeverity.
     */
    private String determineSeverity(TriageRequest request) {
        String template = templateService.selectTemplate(request);
        return templateService.determineSeverity(template);
    }

    // --- Helpers ---

    private TriageResponse mapToTriageResponse(Map<String, Object> row) {
        TriageResponse r = new TriageResponse();
        r.setId(UUID.fromString((String) row.get("id")));
        r.setPetId(UUID.fromString((String) row.get("pet_id")));
        r.setConcernType((String) row.get("concern_type"));
        r.setSeverity((String) row.get("severity"));
        r.setSeverityLabel(toSeverityLabel((String) row.get("severity")));
        r.setResponseText((String) row.get("response_text"));
        r.setFollowupResolution((String) row.get("followup_resolution"));
        Object resolvedAt = row.get("followup_resolved_at");
        if (resolvedAt instanceof LocalDateTime) {
            r.setFollowupResolvedAt((LocalDateTime) resolvedAt);
        }
        Object createdAt = row.get("created_at");
        if (createdAt instanceof LocalDateTime) {
            r.setCreatedAt((LocalDateTime) createdAt);
        }
        return r;
    }

    private String toSeverityLabel(String severity) {
        if (severity == null) return "Monitor at home";
        return switch (severity) {
            case "call_vet_now" -> "Call your vet now";
            case "manage_at_home" -> "Manage at home";
            default -> "Monitor at home";
        };
    }
}
