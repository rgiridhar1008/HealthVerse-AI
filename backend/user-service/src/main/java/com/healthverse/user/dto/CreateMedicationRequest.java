package com.healthverse.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMedicationRequest {

    @NotBlank(message = "Medication name is required")
    private String name;

    private String dosage;

    private String frequency;

    private String timeOfDay;

    private LocalDate startDate;

    private LocalDate endDate;

    private String instructions;

    @Builder.Default
    private Boolean active = true;
}

