package com.healthverse.aianalysis.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "symptom_history")
public class SymptomHistory {
    
    @Id
    private String id;
    
    private Long userId;
    
    private String symptoms;
    private String duration;
    private String severity;
    
    private String insights;
    private List<String> recommendations;
    private boolean seekProfessionalCare;
    
    private LocalDateTime createdAt;
}
