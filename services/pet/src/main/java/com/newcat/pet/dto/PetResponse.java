package com.newcat.pet.dto;

import com.newcat.pet.entity.Pet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PetResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private Integer ageMonths;
    private String gender;
    private String neuteredSpayed;
    private String breed;
    private LocalDate adoptionDate;
    private String source;
    private String siblingBonded;
    private String medicalHistory;
    private String householdContext;
    private String currentConcerns;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PetResponse() {}

    public PetResponse(Pet pet) {
        this.id = pet.getId();
        this.userId = pet.getUserId();
        this.name = pet.getName();
        this.ageMonths = pet.getAgeMonths();
        this.gender = pet.getGender();
        this.neuteredSpayed = pet.getNeuteredSpayed();
        this.breed = pet.getBreed();
        this.adoptionDate = pet.getAdoptionDate();
        this.source = pet.getSource();
        this.siblingBonded = pet.getSiblingBonded();
        this.medicalHistory = pet.getMedicalHistory();
        this.householdContext = pet.getHouseholdContext();
        this.currentConcerns = pet.getCurrentConcerns();
        this.createdAt = pet.getCreatedAt();
        this.updatedAt = pet.getUpdatedAt();
    }

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
}
