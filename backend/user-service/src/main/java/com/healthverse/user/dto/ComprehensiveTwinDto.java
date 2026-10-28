package com.healthverse.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComprehensiveTwinDto {
    private UserProfile profile;
    private HealthProfileData healthProfile;
    private DataCompleteness completeness;
    
    // Aggregated from other services
    private List<Map<String, Object>> vitals;
    private List<Map<String, Object>> medicalReports;
    private List<Map<String, Object>> symptoms;
    private List<Map<String, Object>> medications;
    
    private Map<String, Object> nutrition;
    private Map<String, Object> fitness;
    private Map<String, Object> wellness;
    
    private Map<String, Object> sleep;
    private Map<String, Object> activity;
    
    private List<Map<String, Object>> timeline;
    private List<String> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfile {
        private String name;
        private Integer age;
        private String gender;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthProfileData {
        private Double height;
        private Double weight;
        private Double bmi;
        private String lifestyle;
        private String goals;
        private String allergies;
        private String conditions;
        private String dietaryPreference;
        private String sleepPattern;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataCompleteness {
        private int totalCategories;
        private int filledCategories;
        private List<String> available;
        private List<String> missing;
    }
}
