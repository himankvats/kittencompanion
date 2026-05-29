package com.newcat.checkin.entity;

/**
 * JPA entity for a row in the checkins table.
 * Fields and constraints match TDD Section 1.4.
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "checkins")
@Data
@NoArgsConstructor
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    // Eating — TDD Section 1.4
    @Column(name = "eating_level", length = 30)
    private String eatingLevel;     // less_than_normal | normal | more_than_normal

    @Column(name = "eating_notes", columnDefinition = "TEXT")
    private String eatingNotes;

    // Litter — TDD Section 1.4
    @Column(name = "litter_status", length = 30)
    private String litterStatus;    // normal | diarrhea | constipation | mixed | not_used | unknown

    @Column(name = "litter_notes", columnDefinition = "TEXT")
    private String litterNotes;

    // Activity — TDD Section 1.4
    @Column(name = "activity_level", length = 30)
    private String activityLevel;   // very_active | normal | calm | sleeping_most_of_day

    @Column(name = "activity_notes", columnDefinition = "TEXT")
    private String activityNotes;

    @Column(name = "owner_notes", columnDefinition = "TEXT")
    private String ownerNotes;

    // Confidence score (1–5): only Day 1 and Month 4 (TDD Section 1.4)
    @Column(name = "confidence_score")
    private Integer confidenceScore;

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
