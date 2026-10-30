package com.healthverse.user.controller;

import com.healthverse.user.dto.CreateMedicationRequest;
import com.healthverse.user.dto.MedicationDto;
import com.healthverse.user.exception.BadRequestException;
import com.healthverse.user.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication == null) {
            throw new BadRequestException("User is not authenticated");
        }
        if (authentication.getCredentials() instanceof Long userId) {
            return userId;
        }
        throw new BadRequestException("Unable to extract userId from authentication token");
    }

    @GetMapping
    public ResponseEntity<List<MedicationDto>> getMedications(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        Long userId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(medicationService.getMedications(userId, activeOnly));
    }

    @PostMapping
    public ResponseEntity<MedicationDto> addMedication(
            Authentication authentication,
            @Valid @RequestBody CreateMedicationRequest request) {
        Long userId = extractUserIdFromAuth(authentication);
        MedicationDto dto = medicationService.addMedication(userId, request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationDto> updateMedication(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CreateMedicationRequest request) {
        Long userId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(medicationService.updateMedication(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = extractUserIdFromAuth(authentication);
        medicationService.deleteMedication(userId, id);
        return ResponseEntity.noContent().build();
    }
}

