package com.healthverse.nutritionfitness.service;

import com.healthverse.nutritionfitness.dto.HealthProfileDto;
import com.healthverse.nutritionfitness.dto.NutritionPlanRequest;
import com.healthverse.nutritionfitness.dto.NutritionPlanResponse;
import com.healthverse.nutritionfitness.entity.NutritionPlan;
import com.healthverse.nutritionfitness.exception.BadRequestException;
import com.healthverse.nutritionfitness.exception.ResourceNotFoundException;
import com.healthverse.nutritionfitness.repository.NutritionPlanRepository;
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
import com.healthverse.nutritionfitness.dto.DietGenerateRequest;
import com.healthverse.nutritionfitness.dto.DietGenerateResponse;

@Service
public class NutritionService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final RestTemplate restTemplate;

    public NutritionService(NutritionPlanRepository nutritionPlanRepository, RestTemplate restTemplate) {
        this.nutritionPlanRepository = nutritionPlanRepository;
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

    public NutritionPlanResponse generateNutritionPlan(Long userId, NutritionPlanRequest request) {
        System.out.println("[NUTRITION] generation started");
        System.out.println("[NUTRITION] userId=" + userId);
        HealthProfileDto profile = getHealthProfile(userId);
        
        if (profile == null) {
            throw new BadRequestException("Health profile not found for the user.");
        }
        System.out.println("[NUTRITION] health profile loaded");

        String dietType = request.getDietType() != null ? request.getDietType() : "Standard";
        Integer duration = request.getDurationDays() != null ? request.getDurationDays() : 30;
        System.out.println("[NUTRITION] preferences loaded: dietType=" + dietType + ", duration=" + duration);
        
        String mealPlan = "";
        try {
            DietGenerateRequest aiRequest = new DietGenerateRequest();
            aiRequest.setGoal(profile.getGoals() != null ? profile.getGoals() : "Healthy Eating");
            aiRequest.setDiet_type(dietType);
            aiRequest.setAge(profile.getAge());
            aiRequest.setWeight(profile.getWeight());
            aiRequest.setHeight(profile.getHeight());
            aiRequest.setLifestyle(profile.getLifestyle());
            if (profile.getAllergies() != null && !profile.getAllergies().isBlank()) {
                aiRequest.setAllergies(java.util.List.of(profile.getAllergies().split("\\s*,\\s*")));
            }
            if (request.getAdditionalPreferences() != null) {
                aiRequest.setAdditional_preferences(request.getAdditionalPreferences());
            }

            String aiAgentUrl = System.getenv("AI_AGENT_URL");
            if (aiAgentUrl == null || aiAgentUrl.isBlank()) {
                aiAgentUrl = "http://localhost:8000";
            }
            
            System.out.println("[NUTRITION] sending request to ai-agent-service");
            long aiStart = System.currentTimeMillis();
            
            ObjectMapper mapper = new ObjectMapper();
            String requestBody = mapper.writeValueAsString(aiRequest);
            
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(aiAgentUrl + "/api/v1/agents/diet/generate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
                
            HttpResponse<String> aiResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            long aiEnd = System.currentTimeMillis();
            System.out.println("[NUTRITION-TIMING] ai-agent-request=" + (aiEnd - aiStart) + "ms");
            System.out.println("[NUTRITION] AI response received");

            if (aiResponse.statusCode() >= 200 && aiResponse.statusCode() < 300 && aiResponse.body() != null) {
                DietGenerateResponse res = mapper.readValue(aiResponse.body(), DietGenerateResponse.class);
                mealPlan = String.join("\n", res.getMeal_suggestions()) + "\n\n" + res.getHydration_guidance();
                System.out.println("[NUTRITION] response parsed");
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

        // Basic Macros
        int baseCalories = 2000;
        int proteinGrams = 150;
        int fatGrams = 60;
        int carbsGrams = 200;
        double waterLiters = 2.5;

        NutritionPlan plan = NutritionPlan.builder()
                .userId(userId)
                .planName("Personalized Nutrition Plan - " + dietType)
                .dailyCalories(baseCalories)
                .proteinGrams(proteinGrams)
                .carbsGrams(carbsGrams)
                .fatGrams(fatGrams)
                .waterLiters(Math.round(waterLiters * 10.0) / 10.0)
                .mealPlan(mealPlan)
                .dietType(dietType)
                .allergyRestrictions(profile.getAllergies() != null ? profile.getAllergies() : "None")
                .durationDays(duration)
                .active(true)
                .build();

        plan = nutritionPlanRepository.save(plan);
        System.out.println("[NUTRITION] plan persisted");
        System.out.println("[NUTRITION] generation completed");
        return mapToResponse(plan);
    }

    public List<NutritionPlanResponse> getAllNutritionPlansForUser(Long userId) {
        return nutritionPlanRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public NutritionPlanResponse getNutritionPlanByIdForUser(Long id, Long userId) {
        NutritionPlan plan = nutritionPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition plan not found or you don't have access"));
        return mapToResponse(plan);
    }

    public NutritionPlanResponse updateNutritionPlan(Long id, Long userId, NutritionPlanRequest request) {
        NutritionPlan plan = nutritionPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition plan not found or you don't have access"));

        if (request.getDietType() != null) {
            plan.setDietType(request.getDietType());
        }
        if (request.getDurationDays() != null) {
            plan.setDurationDays(request.getDurationDays());
        }

        plan = nutritionPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    public void deleteNutritionPlan(Long id, Long userId) {
        NutritionPlan plan = nutritionPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition plan not found or you don't have access"));
        nutritionPlanRepository.delete(plan);
    }

    private NutritionPlanResponse mapToResponse(NutritionPlan plan) {
        return NutritionPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUserId())
                .planName(plan.getPlanName())
                .dailyCalories(plan.getDailyCalories())
                .proteinGrams(plan.getProteinGrams())
                .carbsGrams(plan.getCarbsGrams())
                .fatGrams(plan.getFatGrams())
                .waterLiters(plan.getWaterLiters())
                .mealPlan(plan.getMealPlan())
                .dietType(plan.getDietType())
                .allergyRestrictions(plan.getAllergyRestrictions())
                .durationDays(plan.getDurationDays())
                .active(plan.getActive())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}

