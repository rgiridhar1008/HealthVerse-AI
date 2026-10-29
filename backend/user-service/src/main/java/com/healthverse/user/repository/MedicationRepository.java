package com.healthverse.user.repository;

import com.healthverse.user.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Medication> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
    Optional<Medication> findByIdAndUserId(Long id, Long userId);
}

