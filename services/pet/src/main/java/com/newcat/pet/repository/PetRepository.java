package com.newcat.pet.repository;

/**
 * JPA repository for the Pet entity. Extends JpaRepository to provide standard
 * CRUD operations; adds custom query for listing pets by user.
 * See TDD Section 3.3 and pets table schema (TDD Section 1.3).
 */

import com.newcat.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    // TODO: Implement findByUserId (TDD Section 2.3.4)
    // Should filter WHERE deleted_at IS NULL
    @Query("SELECT p FROM Pet p WHERE p.userId = :userId AND p.deletedAt IS NULL")
    List<Pet> findByUserId(@Param("userId") UUID userId);
}
