package com.newcat.pet.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "age_months", nullable = false)
    private Integer ageMonths;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "neutered_spayed", length = 20)
    private String neuteredSpayed;

    @Column(name = "breed", length = 100)
    private String breed;

    @Column(name = "adoption_date")
    private LocalDate adoptionDate;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "sibling_bonded", length = 20)
    private String siblingBonded;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "medical_history", columnDefinition = "jsonb")
    private String medicalHistory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "household_context", columnDefinition = "jsonb")
    private String householdContext;

    @Column(name = "current_concerns", columnDefinition = "TEXT")
    private String currentConcerns;

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

    public Pet() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAgeMonths() { return ageMonths; }
    public void setAgeMonths(Integer ageMonths) { this.ageMonths = ageMonths; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNeuteredSpayed() { return neuteredSpayed; }
    public void setNeuteredSpayed(String neuteredSpayed) { this.neuteredSpayed = neuteredSpayed; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public LocalDate getAdoptionDate() { return adoptionDate; }
    public void setAdoptionDate(LocalDate adoptionDate) { this.adoptionDate = adoptionDate; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSiblingBonded() { return siblingBonded; }
    public void setSiblingBonded(String siblingBonded) { this.siblingBonded = siblingBonded; }

    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }

    public String getHouseholdContext() { return householdContext; }
    public void setHouseholdContext(String householdContext) { this.householdContext = householdContext; }

    public String getCurrentConcerns() { return currentConcerns; }
    public void setCurrentConcerns(String currentConcerns) { this.currentConcerns = currentConcerns; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
