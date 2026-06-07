package com.newcat.pet.dto;

public class PetRequest {

    private String name;
    private Integer ageMonths;
    private String gender;
    private String neuteredSpayed;
    private String breed;
    private String adoptionDate;
    private String source;
    private String siblingBonded;
    private String medicalHistory;
    private String householdContext;
    private String currentConcerns;

    public PetRequest() {}

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

    public String getAdoptionDate() { return adoptionDate; }
    public void setAdoptionDate(String adoptionDate) { this.adoptionDate = adoptionDate; }

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
}
