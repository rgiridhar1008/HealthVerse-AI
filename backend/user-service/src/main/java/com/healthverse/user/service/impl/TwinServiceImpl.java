package com.healthverse.user.service.impl;

import com.healthverse.user.dto.ComprehensiveTwinDto;
import com.healthverse.user.dto.DigitalHealthTwinDto;
import com.healthverse.user.dto.TwinContextDto;
import com.healthverse.user.entity.DailyHealthData;
import com.healthverse.user.entity.HealthProfile;
import com.healthverse.user.entity.User;
import com.healthverse.user.repository.DailyHealthDataRepository;
import com.healthverse.user.repository.HealthProfileRepository;
import com.healthverse.user.repository.UserRepository;
import com.healthverse.user.service.TwinService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TwinServiceImpl implements TwinService {

    private final HealthProfileRepository healthProfileRepository;
    private final DailyHealthDataRepository dailyHealthDataRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Override
    public DigitalHealthTwinDto getTwinMetrics(Long userId) {
        List<DailyHealthData> history = dailyHealthDataRepository.findByUserIdOrderByDateDesc(userId);
        Optional<HealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);

        if (history.isEmpty()) {
            return getEmptyTwinDto(profileOpt);
        }

        List<DigitalHealthTwinDto.WeightTrendDto> weightTrend = new ArrayList<>();
        List<DigitalHealthTwinDto.ActivitySleepTrendDto> activitySleepTrend = new ArrayList<>();
        
        List<DailyHealthData> last7Days = history.stream().limit(7).collect(Collectors.toList());
        Collections.reverse(last7Days);
        

        double heightInMeters = profileOpt.map(p -> p.getHeight() != null ? p.getHeight() / 100.0 : 1.75).orElse(1.75);
        String conditions = profileOpt.map(HealthProfile::getConditions).orElse("none");
        
        double totalWater = 0;
        int totalSteps = 0;
        double totalSleep = 0;
        int mentalScoreSum = 0;
        int count = last7Days.size();

        for (DailyHealthData data : last7Days) {
            String dayName = data.getDate().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            double w = data.getWeight() != null ? data.getWeight() : 70.0;
            double bmi = w / (heightInMeters * heightInMeters);
            
            weightTrend.add(DigitalHealthTwinDto.WeightTrendDto.builder()
                    .date(dayName)
                    .weight(Math.round(w * 10.0) / 10.0)
                    .bmi(Math.round(bmi * 10.0) / 10.0)
                    .build());
                    
            activitySleepTrend.add(DigitalHealthTwinDto.ActivitySleepTrendDto.builder()
                    .date(dayName)
                    .activity(data.getSteps() != null ? data.getSteps() : 5000)
                    .sleep(data.getSleepHours() != null ? data.getSleepHours() : 6.0)
                    .build());

            totalWater += data.getWaterIntake() != null ? data.getWaterIntake() : 1.0;
            totalSteps += data.getSteps() != null ? data.getSteps() : 5000;
            totalSleep += data.getSleepHours() != null ? data.getSleepHours() : 6.0;

            String mood = data.getMood() != null ? data.getMood().toLowerCase() : "good";
            if (mood.contains("excellent") || mood.contains("great")) mentalScoreSum += 100;
            else if (mood.contains("good") || mood.contains("okay")) mentalScoreSum += 80;
            else if (mood.contains("average")) mentalScoreSum += 70;
            else mentalScoreSum += 50;
        }
        
        double avgWater = totalWater / count;
        double avgSteps = totalSteps / (double) count;
        double avgSleep = totalSleep / count;
        int avgMental = mentalScoreSum / count;

        int physical = (int) Math.min(100, (avgSteps / 10000.0) * 100);
        int sleepScore = (int) Math.min(100, (avgSleep / 8.0) * 100);
        int recovery = (sleepScore + (int) Math.min(100, (avgWater / 2.5) * 100)) / 2;
        int focus = (avgMental + sleepScore) / 2;

        List<DigitalHealthTwinDto.RadarDataDto> radarData = Arrays.asList(
            new DigitalHealthTwinDto.RadarDataDto("Physical", physical, 100),
            new DigitalHealthTwinDto.RadarDataDto("Mental", avgMental, 100),
            new DigitalHealthTwinDto.RadarDataDto("Recovery", recovery, 100),
            new DigitalHealthTwinDto.RadarDataDto("Sleep", sleepScore, 100),
            new DigitalHealthTwinDto.RadarDataDto("Nutrition", (int) Math.min(100, (avgWater / 2.5) * 100), 100),
            new DigitalHealthTwinDto.RadarDataDto("Focus", focus, 100)
        );

        int overallWellnessScore = 0;
        int nutritionAdherence = 0;
        int medicationAdherence = 0;
        String status = "insufficient data";
        List<DigitalHealthTwinDto.JourneyEventDto> journeyEvents = new ArrayList<>();
        
        String weightTrendString = "Unknown";
        String activityTrendString = "Unknown";
        String sleepTrendString = "Unknown";
        Integer energyScore = 0;
        Integer recoveryScore = 0;
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        overallWellnessScore = (physical + avgMental + recovery + sleepScore + (int) Math.min(100, (avgWater / 2.5) * 100) + focus) / 6;
        if (overallWellnessScore >= 80) status = "Optimal";
        else if (overallWellnessScore >= 60) status = "Moderate";
        else status = "Needs Attention";
        
        nutritionAdherence = (int) Math.min(100, (avgWater / 2.5) * 100);
        medicationAdherence = 100; // placeholder until medication tracking is implemented

        if (last7Days.size() > 1) {
            double firstWeight = last7Days.get(0).getWeight() != null ? last7Days.get(0).getWeight() : 0;
            double lastWeight = last7Days.get(last7Days.size() - 1).getWeight() != null ? last7Days.get(last7Days.size() - 1).getWeight() : 0;
            if (firstWeight > lastWeight) weightTrendString = "Decreasing";
            else if (firstWeight < lastWeight) weightTrendString = "Increasing";
            else weightTrendString = "Stable";

            int firstSteps = last7Days.get(0).getSteps() != null ? last7Days.get(0).getSteps() : 0;
            int lastSteps = last7Days.get(last7Days.size() - 1).getSteps() != null ? last7Days.get(last7Days.size() - 1).getSteps() : 0;
            if (lastSteps > firstSteps) activityTrendString = "Improving";
            else if (lastSteps < firstSteps) activityTrendString = "Decreasing";
            else activityTrendString = "Stable";

            double firstSleep = last7Days.get(0).getSleepHours() != null ? last7Days.get(0).getSleepHours() : 0;
            double lastSleep = last7Days.get(last7Days.size() - 1).getSleepHours() != null ? last7Days.get(last7Days.size() - 1).getSleepHours() : 0;
            if (lastSleep > firstSleep) sleepTrendString = "Improving";
            else if (lastSleep < firstSleep) sleepTrendString = "Decreasing";
            else sleepTrendString = "Stable";
        }
        
        energyScore = (physical + sleepScore) / 2;
        recoveryScore = recovery;
        
        insights.add("Based on your logged vitals, your overall wellness score is " + overallWellnessScore + ".");
        if (sleepScore < 70) recommendations.add("Try to get more consistent sleep to improve your recovery score.");
        if (physical < 70) recommendations.add("Increase your daily step count to improve your physical score.");

        return DigitalHealthTwinDto.builder()
                .weightTrend(weightTrend)
                .activitySleepTrend(activitySleepTrend)
                .nutritionAdherence(nutritionAdherence)
                .medicationAdherence(medicationAdherence)
                .overallWellnessScore(overallWellnessScore)
                .status(status)
                .radarData(radarData)
                .journeyEvents(journeyEvents)
                .weightTrendString(weightTrendString)
                .activityTrendString(activityTrendString)
                .sleepTrendString(sleepTrendString)
                .energyScore(energyScore)
                .recoveryScore(recoveryScore)
                .insights(insights)
                .recommendations(recommendations)
                .build();
    }

    private DigitalHealthTwinDto getEmptyTwinDto(Optional<HealthProfile> profileOpt) {
        String status = "insufficient data";
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        
        // Radar data: use zeros if no profile, or very rough baseline if profile exists
        int physical = 0;
        int mental = 0;
        int recovery = 0;
        int sleepScore = 0;
        int nutrition = 0;
        int focus = 0;
        
        if (profileOpt.isPresent()) {
            HealthProfile profile = profileOpt.get();
            // We have a health profile but no daily data — show baseline from profile only
            double height = profile.getHeight() != null ? profile.getHeight() / 100.0 : 0;
            double weight = profile.getWeight() != null ? profile.getWeight() : 0;
            
            if (height > 0 && weight > 0) {
                double bmi = weight / (height * height);
                if (bmi >= 18.5 && bmi <= 24.9) {
                    physical = 20;
                }
            }
            
            if (profile.getLifestyle() != null) {
                if (profile.getLifestyle().toLowerCase().contains("active")) {
                    physical += 10;
                }
            }
            
            insights.add("Your digital twin is initialized from your health profile only.");
            insights.add("Log daily health data (weight, steps, sleep, mood) to get accurate scores.");
            recommendations.add("Log your daily data to make your digital twin more accurate.");
            recommendations.add("Follow your prescribed wellness plans.");
            status = "Baseline";
        } else {
            insights.add("Please complete your health profile to initialize your digital twin.");
            recommendations.add("Set up your health profile first, then log daily data.");
            status = "Insufficient Data";
        }

        List<DigitalHealthTwinDto.RadarDataDto> radarData = Arrays.asList(
            new DigitalHealthTwinDto.RadarDataDto("Physical", physical, 100),
            new DigitalHealthTwinDto.RadarDataDto("Mental", mental, 100),
            new DigitalHealthTwinDto.RadarDataDto("Recovery", recovery, 100),
            new DigitalHealthTwinDto.RadarDataDto("Sleep", sleepScore, 100),
            new DigitalHealthTwinDto.RadarDataDto("Nutrition", nutrition, 100),
            new DigitalHealthTwinDto.RadarDataDto("Focus", focus, 100)
        );

        return DigitalHealthTwinDto.builder()
                .weightTrend(Collections.emptyList())
                .activitySleepTrend(Collections.emptyList())
                .nutritionAdherence(0)
                .medicationAdherence(0)
                .overallWellnessScore(0)
                .status(status)
                .radarData(radarData)
                .journeyEvents(Collections.emptyList())
                .weightTrendString("No data")
                .activityTrendString("No data")
                .sleepTrendString("No data")
                .energyScore(0)
                .recoveryScore(0)
                .insights(insights)
                .recommendations(recommendations)
                .build();
    }

    @Override
    public TwinContextDto getTwinContext(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        HealthProfile profile = healthProfileRepository.findByUserId(userId).orElse(new HealthProfile());
        
        Map<String, Object> recentMetrics = new HashMap<>();
        dailyHealthDataRepository.findByUserIdOrderByDateDesc(userId).stream().findFirst().ifPresent(data -> {
            recentMetrics.put("weight", data.getWeight());
            recentMetrics.put("sleepHours", data.getSleepHours());
            recentMetrics.put("steps", data.getSteps());
            recentMetrics.put("waterIntake", data.getWaterIntake());
            recentMetrics.put("exerciseMinutes", data.getExerciseMinutes());
            recentMetrics.put("mood", data.getMood());
            recentMetrics.put("date", data.getDate().toString());
        });
        
        return TwinContextDto.builder()
                .userId(userId)
                .name(user.getName())
                .age(profile.getAge())
                .gender(profile.getGender())
                .conditions(profile.getConditions())
                .allergies(profile.getAllergies())
                .lifestyle(profile.getLifestyle())
                .goals(profile.getGoals())
                .recentMetrics(recentMetrics)
                .build();
    }

    @Override
    public ComprehensiveTwinDto getComprehensiveTwin(Long userId) {
        ComprehensiveTwinDto dto = new ComprehensiveTwinDto();
        
        // 1. Basic Profile
        User user = userRepository.findById(userId).orElse(new User());
        HealthProfile profile = healthProfileRepository.findByUserId(userId).orElse(null);
        
        dto.setProfile(ComprehensiveTwinDto.UserProfile.builder()
                .name(user.getName())
                .email(user.getEmail())
                .age(profile != null ? profile.getAge() : null)
                .gender(profile != null ? profile.getGender() : null)
                .build());

        int totalCategories = 10;
        int filledCategories = 0;
        List<String> available = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        
        available.add("Basic Profile");
        filledCategories++;

        if (profile != null) {
            dto.setHealthProfile(ComprehensiveTwinDto.HealthProfileData.builder()
                    .height(profile.getHeight())
                    .weight(profile.getWeight())
                    .bmi(profile.getBmi())
                    .lifestyle(profile.getLifestyle())
                    .goals(profile.getGoals())
                    .allergies(profile.getAllergies())
                    .conditions(profile.getConditions())
                    .dietaryPreference(profile.getDietaryPreference())
                    .sleepPattern(profile.getSleepPattern())
                    .build());
            available.add("Health Profile");
            filledCategories++;
        } else {
            missing.add("Health Profile");
        }

        // Vitals
        List<DailyHealthData> vitals = dailyHealthDataRepository.findByUserIdOrderByDateDesc(userId);
        if (!vitals.isEmpty()) {
            List<Map<String, Object>> vitalsData = vitals.stream().map(v -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", v.getDate().toString());
                map.put("weight", v.getWeight());
                map.put("sleepHours", v.getSleepHours());
                map.put("steps", v.getSteps());
                map.put("waterIntake", v.getWaterIntake());
                map.put("mood", v.getMood());
                return map;
            }).collect(Collectors.toList());
            dto.setVitals(vitalsData);
            available.add("Vitals");
            filledCategories++;
        } else {
            dto.setVitals(new ArrayList<>());
            missing.add("Vitals");
        }

        HttpHeaders headers = getAuthHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Medical Reports
        try {
            ResponseEntity<List<Map<String, Object>>> reportsResponse = restTemplate.exchange(
                    "http://report-service/api/reports", HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            List<Map<String, Object>> reports = reportsResponse.getBody();
            dto.setMedicalReports(reports != null ? reports : new ArrayList<>());
            if (reports != null && !reports.isEmpty()) { available.add("Medical Reports"); filledCategories++; }
            else { missing.add("Medical Reports"); }
        } catch (Exception e) { dto.setMedicalReports(new ArrayList<>()); missing.add("Medical Reports"); }

        // Medications (Service Removed)
        dto.setMedications(new ArrayList<>());
        // Symptoms
        try {
            ResponseEntity<List<Map<String, Object>>> symptomsResponse = restTemplate.exchange(
                    "http://ai-analysis-service/api/analysis/symptoms/history", HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            List<Map<String, Object>> symptoms = symptomsResponse.getBody();
            dto.setSymptoms(symptoms != null ? symptoms : new ArrayList<>());
            if (symptoms != null && !symptoms.isEmpty()) { available.add("Symptoms"); filledCategories++; }
            else { missing.add("Symptoms"); }
        } catch (Exception e) { dto.setSymptoms(new ArrayList<>()); missing.add("Symptoms"); }

        // Nutrition & Fitness
        try {
            ResponseEntity<List<Map<String, Object>>> nutResponse = restTemplate.exchange(
                    "http://nutrition-fitness-service/api/nutrition/plans", HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            if (nutResponse.getBody() != null && !nutResponse.getBody().isEmpty()) {
                dto.setNutrition(nutResponse.getBody().get(0));
                available.add("Nutrition"); filledCategories++;
            } else { missing.add("Nutrition"); }
        } catch (Exception e) { missing.add("Nutrition"); }

        try {
            ResponseEntity<List<Map<String, Object>>> fitResponse = restTemplate.exchange(
                    "http://nutrition-fitness-service/api/fitness/plans", HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            if (fitResponse.getBody() != null && !fitResponse.getBody().isEmpty()) {
                dto.setFitness(fitResponse.getBody().get(0));
                available.add("Fitness"); filledCategories++;
            } else { missing.add("Fitness"); }
        } catch (Exception e) { missing.add("Fitness"); }

        // Wellness
        try {
            ResponseEntity<List<Map<String, Object>>> wellResponse = restTemplate.exchange(
                    "http://wellness-service/api/wellness/plans", HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            if (wellResponse.getBody() != null && !wellResponse.getBody().isEmpty()) {
                dto.setWellness(wellResponse.getBody().get(0));
                available.add("Wellness"); filledCategories++;
            } else { missing.add("Wellness"); }
        } catch (Exception e) { missing.add("Wellness"); }

        dto.setCompleteness(ComprehensiveTwinDto.DataCompleteness.builder()
                .totalCategories(totalCategories)
                .filledCategories(filledCategories)
                .available(available)
                .missing(missing)
                .build());

        // Timeline (aggregate from reports, symptoms, plans)
        List<Map<String, Object>> timeline = new ArrayList<>();
        if (dto.getMedicalReports() != null) {
            for (Map<String, Object> r : dto.getMedicalReports()) {
                Map<String, Object> event = new HashMap<>();
                event.put("date", r.get("reportDate") != null ? r.get("reportDate") : r.get("uploadDate"));
                event.put("event", "Uploaded Medical Report: " + (r.get("fileName") != null ? r.get("fileName") : r.get("reportType")));
                event.put("type", "report");
                timeline.add(event);
            }
        }
        if (dto.getSymptoms() != null) {
            for (Map<String, Object> s : dto.getSymptoms()) {
                Map<String, Object> event = new HashMap<>();
                event.put("date", s.get("createdAt"));
                event.put("event", "Symptom Analysis: " + s.get("symptoms"));
                event.put("type", "symptom");
                timeline.add(event);
            }
        }
        if (dto.getNutrition() != null) {
            Map<String, Object> event = new HashMap<>();
            event.put("date", dto.getNutrition().get("createdAt"));
            event.put("event", "Nutrition Plan Generated");
            event.put("type", "nutrition");
            timeline.add(event);
        }
        if (dto.getFitness() != null) {
            Map<String, Object> event = new HashMap<>();
            event.put("date", dto.getFitness().get("createdAt"));
            event.put("event", "Fitness Plan Generated");
            event.put("type", "fitness");
            timeline.add(event);
        }
        
        timeline.removeIf(e -> e.get("date") == null);
        timeline.sort((a, b) -> String.valueOf(b.get("date")).compareTo(String.valueOf(a.get("date"))));
        
        dto.setTimeline(timeline);
        
        // No AI insights as predictive models are not available yet.
        dto.setInsights(new ArrayList<>());

        return dto;
    }
    
    private HttpHeaders getAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader("Authorization");
                if (authHeader != null) {
                    headers.set("Authorization", authHeader);
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return headers;
    }
}

