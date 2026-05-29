package com.newcat.pet.entity;

/**
 * JPA entity representing a row in the pets table.
 * Field names match the database column names defined in TDD Section 1.3.
 * JSONB columns (medicalHistory, householdContext) are stored as String for simplicity;
 * TODO: convert to typed value objects in Phase 3 implementation.
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
@Table(name = "pets")
@Data
@NoArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // ------------------------------------------------------------------
    // Basic info — TDD Section 1.3
    // ------------------------------------------------------------------
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "age_months", nullable = false)
    private Integer ageMonths;

    @Column(name = "gender", length = 20)
    private String gender;           // 'male' | 'female' | 'unknown'

    @Column(name = "neutered_spayed", length = 20)
    private String neuteredSpayed;   // 'yes' | 'no' | 'unknown'

    // ------------------------------------------------------------------
    // Breed and background
    // ------------------------------------------------------------------
    @Column(name = "breed", length = 100)
    private String breed;

    @Column(name = "adoption_date")
    private LocalDate adoptionDate;

    @Column(name = "source", length = 50)
    private String source;           // 'shelter' | 'breeder' | 'friend_family' | 'stray' | 'other'

    @Column(name = "sibling_bonded", length = 20)
    private String siblingBonded;    // 'yes' | 'no' | 'unsure'

    // ------------------------------------------------------------------
    // JSONB columns — TDD Section 1.3
    // TODO: Replace String with strongly-typed classes (MedicalHistory, HouseholdContext)
    // ------------------------------------------------------------------
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "medical_history", columnDefinition = "jsonb")
    private String medicalHistory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "household_context", columnDefinition = "jsonb")
    private String householdContext;

    @Column(name = "current_concerns", columnDefinition = "TEXT")
    private String currentConcerns;

    // ------------------------------------------------------------------
    // Audit timestamps
    // ------------------------------------------------------------------
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
