package com.newcat.triage.entity;

/**
 * JPA entity for a row in the acute_events table.
 * Fields match TDD Section 1.5 including JSONB followup_answers column.
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "acute_events")
@Data
@NoArgsConstructor
public class AcuteEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    // 9 valid concern types — TDD Section 1.5
    @Column(name = "concern_type", nullable = false, length = 50)
    private String concernType;

    // Varies by concern type — see TDD Section 1.5 for JSONB schemas
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "followup_answers", nullable = false, columnDefinition = "jsonb")
    private String followupAnswers;

    @Column(name = "template_selected", length = 50)
    private String templateSelected;  // benign | concerning | urgent | conservative_default

    @Column(name = "severity", nullable = false, length = 50)
    private String severity;          // manage_at_home | watch | call_vet_now

    @Column(name = "response_text", nullable = false, columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "followup_resolution", length = 50)
    private String followupResolution; // resolved | better | worse | vet_visit | unknown

    @Column(name = "followup_resolved_at")
    private LocalDateTime followupResolvedAt;

    @Column(name = "followup_prompt_sent_at")
    private LocalDateTime followupPromptSentAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
