package com.healthverse.nutritionfitness.service;

import com.healthverse.nutritionfitness.dto.FitnessPlanRequest;
import com.healthverse.nutritionfitness.dto.FitnessPlanResponse;
import com.healthverse.nutritionfitness.dto.HealthProfileDto;
import com.healthverse.nutritionfitness.entity.FitnessPlan;
import com.healthverse.nutritionfitness.exception.BadRequestException;
import com.healthverse.nutritionfitness.exception.ResourceNotFoundException;
import com.healthverse.nutritionfitness.repository.FitnessPlanRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.util.List;
import java.util.stream.Collectors;
import com.healthverse.nutritionfitness.dto.FitnessGenerateRequest;
import com.healthverse.nutritionfitness.dto.FitnessGenerateResponse;

@Service
public class FitnessService {

    private final FitnessPlanRepository fitnessPlanRepository;
    private final RestTemplate restTemplate;

    public FitnessService(FitnessPlanRepository fitnessPlanRepository, RestTemplate restTemplate) {
        this.fitnessPlanRepository = fitnessPlanRepository;
        this.restTemplate = restTemplate;
    }

    private HealthProfileDto getHealthProfile(Long userId) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new BadRequestException("Request attributes not found");
        }
        
        String authHeader = attributes.getRequest().getHeader("Authorization");
        if (authHeader == null) {
            throw new BadRequestException("Authorization header missing");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<HealthProfileDto> response = restTemplate.exchange(
                    "http://user-service/api/health/profile/" + userId,
                    HttpMethod.GET,
                    entity,
                    HealthProfileDto.class
            );
            return response.getBody();
        } catch (org.springframework.web.client.HttpStatusCodeException e) { throw new org.springframework.web.server.ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString(), e); } catch (Exception e) {
            throw new BadRequestException("Failed to fetch health profile: " + e.getMessage());
        }
    }

    public FitnessPlanResponse generateFitnessPlan(Long userId, FitnessPlanRequest request) {
        HealthProfileDto profile = getHealthProfile(userId);
        
        if (profile == null) {
            throw new BadRequestException("Health profile not found for the user.");
        }

        String goal = request.getGoal() != null ? request.getGoal() : (profile.getGoals() != null ? profile.getGoals() : "General Fitness");
        String fitnessLevel = request.getFitnessLevel() != null ? request.getFitnessLevel() : "Beginner";
        Integer weeklyFreq = request.getWeeklyFrequency() != null ? request.getWeeklyFrequency() : 3;
        Integer sessionDuration = request.getSessionDurationMinutes() != null ? request.getSessionDurationMinutes() : 45;
        Integer durationDays = request.getDurationDays() != null ? request.getDurationDays() : 30;

        int burnTarget = sessionDuration * 8; // dummy calc
        
        String workoutPlan = "";
        try {
            FitnessGenerateRequest aiRequest = new FitnessGenerateRequest();
            aiRequest.setGoal(goal);
            aiRequest.setFitness_level(fitnessLevel);
            aiRequest.setAge(profile.getAge());
            aiRequest.setWeight(profile.getWeight());
            aiRequest.setHeight(profile.getHeight());
            aiRequest.setLifestyle(profile.getLifestyle());
            if (profile.getConditions() != null && !profile.getConditions().isBlank() && !profile.getConditions().equalsIgnoreCase("none")) {
                aiRequest.setLimitations(profile.getConditions());
            }
            
            String aiAgentUrl = System.getenv("AI_AGENT_URL");
            if (aiAgentUrl == null || aiAgentUrl.isBlank()) {
                aiAgentUrl = "http://localhost:8000";
            }
            
            long aiStart = System.currentTimeMillis();
            
            ObjectMapper mapper = new ObjectMapper();
            String requestBody = mapper.writeValueAsString(aiRequest);
            
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(aiAgentUrl + "/api/v1/agents/fitness/generate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
                
            HttpResponse<String> aiResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            long aiEnd = System.currentTimeMillis();
            System.out.println("[FITNESS-TIMING] ai-agent-request=" + (aiEnd - aiStart) + "ms");

            if (aiResponse.statusCode() >= 200 && aiResponse.statusCode() < 300 && aiResponse.body() != null) {
                FitnessGenerateResponse res = mapper.readValue(aiResponse.body(), FitnessGenerateResponse.class);
                workoutPlan = String.join("\n", res.getExercise_plan()) + "\n\n" + String.join("\n", res.getRecovery_suggestions());
            } else {
                throw new BadRequestException("AI Agent Service returned an error.");
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            System.err.println("[AI-ERROR] HttpStatusCodeException: " + e.getResponseBodyAsString());
            throw new org.springframework.web.server.ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("[AI-ERROR] Generic Exception: " + e.getMessage());
            throw new BadRequestException("Error connecting to AI Agent Service: " + e.getMessage());
        }

        FitnessPlan plan = FitnessPlan.builder()
                .userId(userId)
                .planName("Personalized " + fitnessLevel + " Plan")
                .goal(goal)
                .fitnessLevel(fitnessLevel)
                .weeklyFrequency(weeklyFreq)
                .sessionDurationMinutes(sessionDuration)
                .workoutPlan(workoutPlan)
                .calorieBurnTarget(burnTarget)
                .durationDays(durationDays)
                .active(true)
                .build();

        plan = fitnessPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    public List<FitnessPlanResponse> getAllFitnessPlansForUser(Long userId) {
        return fitnessPlanRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FitnessPlanResponse getFitnessPlanByIdForUser(Long id, Long userId) {
        FitnessPlan plan = fitnessPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fitness plan not found or you don't have access"));
        return mapToResponse(plan);
    }

    public FitnessPlanResponse updateFitnessPlan(Long id, Long userId, FitnessPlanRequest request) {
        FitnessPlan plan = fitnessPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fitness plan not found or you don't have access"));

        if (request.getGoal() != null) plan.setGoal(request.getGoal());
        if (request.getFitnessLevel() != null) plan.setFitnessLevel(request.getFitnessLevel());
        if (request.getWeeklyFrequency() != null) plan.setWeeklyFrequency(request.getWeeklyFrequency());
        if (request.getSessionDurationMinutes() != null) plan.setSessionDurationMinutes(request.getSessionDurationMinutes());
        if (request.getDurationDays() != null) plan.setDurationDays(request.getDurationDays());

        plan = fitnessPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    public void deleteFitnessPlan(Long id, Long userId) {
        FitnessPlan plan = fitnessPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fitness plan not found or you don't have access"));
        fitnessPlanRepository.delete(plan);
    }

    private FitnessPlanResponse mapToResponse(FitnessPlan plan) {
        return FitnessPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUserId())
                .planName(plan.getPlanName())
                .goal(plan.getGoal())
                .fitnessLevel(plan.getFitnessLevel())
                .weeklyFrequency(plan.getWeeklyFrequency())
                .sessionDurationMinutes(plan.getSessionDurationMinutes())
                .workoutPlan(plan.getWorkoutPlan())
                .calorieBurnTarget(plan.getCalorieBurnTarget())
                .durationDays(plan.getDurationDays())
                .active(plan.getActive())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}

