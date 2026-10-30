package com.healthverse.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalHealthTwinDto {

    private List<WeightTrendDto> weightTrend;
    private List<ActivitySleepTrendDto> activitySleepTrend;
    private Integer nutritionAdherence;
    private Integer medicationAdherence;
    private Integer overallWellnessScore;
    private String status;
    private List<RadarDataDto> radarData;
    private List<JourneyEventDto> journeyEvents;

    // AI Generated Insights
    private String weightTrendString;
    private String activityTrendString;
    private String sleepTrendString;
    private Integer energyScore;
    private Integer recoveryScore;
    private List<String> insights;
    private List<String> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeightTrendDto {
        private String date;
        private Double weight;
        private Double bmi;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivitySleepTrendDto {
        private String date;
        private Integer activity;
        private Double sleep;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarDataDto {
        private String subject;

        @JsonProperty("A")
        private Integer A;

        private Integer fullMark;

        @JsonProperty("a")
        public Integer getA_lowercase() {
            return this.A;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JourneyEventDto {
        private String date;
        private String event;
        private String type;
    }
}
