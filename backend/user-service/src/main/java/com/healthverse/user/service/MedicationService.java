package com.healthverse.user.service;

import com.healthverse.user.dto.CreateMedicationRequest;
import com.healthverse.user.dto.MedicationDto;

import java.util.List;

public interface MedicationService {
    List<MedicationDto> getMedications(Long userId, boolean activeOnly);
    MedicationDto addMedication(Long userId, CreateMedicationRequest request);
    MedicationDto updateMedication(Long userId, Long medicationId, CreateMedicationRequest request);
    void deleteMedication(Long userId, Long medicationId);
}
