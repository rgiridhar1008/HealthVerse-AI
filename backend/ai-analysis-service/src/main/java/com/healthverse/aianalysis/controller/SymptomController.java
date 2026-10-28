package com.healthverse.aianalysis.controller;

import com.healthverse.aianalysis.dto.HealthAnalyzeRequest;
import com.healthverse.aianalysis.dto.HealthAnalyzeResponse;
import com.healthverse.aianalysis.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.Authentication;
import com.healthverse.aianalysis.entity.SymptomHistory;
import com.healthverse.aianalysis.repository.SymptomHistoryRepository;

@RestController
@RequestMapping("/api/analysis/symptoms")
public class SymptomController {

    private final RestTemplate restTemplate;
    private final SymptomHistoryRepository symptomHistoryRepository;

    public SymptomController(RestTemplate restTemplate, SymptomHistoryRepository symptomHistoryRepository) {
        this.restTemplate = restTemplate;
        this.symptomHistoryRepository = symptomHistoryRepository;
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication == null) {
            throw new BadRequestException("User is not authenticated");
        }
        if (authentication.getCredentials() instanceof Long userId) {
            return userId;
        }
        throw new BadRequestException("Unable to extract userId from authentication token");
    }

    @PostMapping({"", "/analyze"})
    public ResponseEntity<HealthAnalyzeResponse> analyzeSymptoms(
            Authentication authentication,
            @RequestBody HealthAnalyzeRequest request) {
        Long userId = extractUserIdFromAuth(authentication);

        try {
            String aiAgentUrl = System.getenv("AI_AGENT_URL");
            if (aiAgentUrl == null || aiAgentUrl.isBlank()) {
                aiAgentUrl = "http://localhost:8000";
            }
            ResponseEntity<HealthAnalyzeResponse> response = restTemplate.postForEntity(
                    aiAgentUrl + "/api/v1/agents/health/analyze",
                    request,
                    HealthAnalyzeResponse.class
            );
            
            HealthAnalyzeResponse analyzeResponse = response.getBody();
            if (analyzeResponse != null) {
                SymptomHistory history = SymptomHistory.builder()
                        .userId(userId)
                        .symptoms(request.getSymptoms())
                        .duration(request.getDuration())
                        .severity(request.getSeverity())
                        .insights(analyzeResponse.getInsights())
                        .recommendations(analyzeResponse.getRecommendations())
                        .seekProfessionalCare(analyzeResponse.isSeekProfessionalCare())
                        .build();
                symptomHistoryRepository.save(history);
            }
            
            return ResponseEntity.ok(analyzeResponse);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "AI Service communication failed: " + e.getMessage(), e);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<SymptomHistory>> getSymptomHistory(Authentication authentication) {
        Long userId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(symptomHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
