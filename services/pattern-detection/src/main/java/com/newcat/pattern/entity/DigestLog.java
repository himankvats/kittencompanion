package com.newcat.pattern.entity;

/**
 * JPA entity for a row in the digest_logs table.
 * Fields match TDD Section 1.6 including the patterns JSONB column.
 */

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "digest_logs")
@Data
@NoArgsConstructor
public class DigestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "digest_text", nullable = false, columnDefinition = "TEXT")
    private String digestText;

    // Captured pattern data at generation time — see TDD Section 1.6 for JSONB schema
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "patterns", nullable = false, columnDefinition = "jsonb")
    private String patterns;

    @Column(name = "data_range_start", nullable = false)
    private LocalDate dataRangeStart;

    @Column(name = "data_range_end", nullable = false)
    private LocalDate dataRangeEnd;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
