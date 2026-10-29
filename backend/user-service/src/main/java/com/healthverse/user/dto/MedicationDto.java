package com.healthverse.user.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDto {
    private Long id;
    private Long userId;
    private String name;
    private String dosage;
    private String frequency;
    private String timeOfDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private String instructions;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
