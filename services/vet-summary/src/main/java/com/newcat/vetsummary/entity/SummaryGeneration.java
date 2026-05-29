package com.newcat.vetsummary.entity;

/**
 * JPA entity for a row in the summary_generations table.
 * Records audit metadata only — the actual HTML/text is not persisted.
 * Fields match TDD Section 1.7.
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "summary_generations")
@Data
@NoArgsConstructor
public class SummaryGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "data_range_start", nullable = false)
    private LocalDate dataRangeStart;

    @Column(name = "data_range_end", nullable = false)
    private LocalDate dataRangeEnd;

    @Column(name = "checkins_included")
    private Integer checkinsIncluded;

    @Column(name = "acute_events_included")
    private Integer acuteEventsIncluded;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
