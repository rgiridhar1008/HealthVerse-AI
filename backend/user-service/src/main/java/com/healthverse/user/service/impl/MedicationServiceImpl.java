package com.healthverse.user.service.impl;

import com.healthverse.user.dto.CreateMedicationRequest;
import com.healthverse.user.dto.MedicationDto;
import com.healthverse.user.entity.Medication;
import com.healthverse.user.exception.ResourceNotFoundException;
import com.healthverse.user.repository.MedicationRepository;
import com.healthverse.user.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository medicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicationDto> getMedications(Long userId, boolean activeOnly) {
        List<Medication> list = activeOnly 
                ? medicationRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                : medicationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicationDto addMedication(Long userId, CreateMedicationRequest request) {
        Medication medication = Medication.builder()
                .userId(userId)
                .name(request.getName().trim())
                .dosage(request.getDosage() != null ? request.getDosage().trim() : null)
                .frequency(request.getFrequency() != null ? request.getFrequency().trim() : null)
                .timeOfDay(request.getTimeOfDay() != null ? request.getTimeOfDay().trim() : null)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .instructions(request.getInstructions() != null ? request.getInstructions().trim() : null)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Medication saved = medicationRepository.save(medication);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public MedicationDto updateMedication(Long userId, Long medicationId, CreateMedicationRequest request) {
        Medication medication = medicationRepository.findByIdAndUserId(medicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));

        medication.setName(request.getName().trim());
        if (request.getDosage() != null) medication.setDosage(request.getDosage().trim());
        if (request.getFrequency() != null) medication.setFrequency(request.getFrequency().trim());
        if (request.getTimeOfDay() != null) medication.setTimeOfDay(request.getTimeOfDay().trim());
        if (request.getStartDate() != null) medication.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) medication.setEndDate(request.getEndDate());
        if (request.getInstructions() != null) medication.setInstructions(request.getInstructions().trim());
        if (request.getActive() != null) medication.setActive(request.getActive());

        Medication saved = medicationRepository.save(medication);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteMedication(Long userId, Long medicationId) {
        Medication medication = medicationRepository.findByIdAndUserId(medicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));
        medicationRepository.delete(medication);
    }

    private MedicationDto mapToDto(Medication entity) {
        return MedicationDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .name(entity.getName())
                .dosage(entity.getDosage())
                .frequency(entity.getFrequency())
                .timeOfDay(entity.getTimeOfDay())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .instructions(entity.getInstructions())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

