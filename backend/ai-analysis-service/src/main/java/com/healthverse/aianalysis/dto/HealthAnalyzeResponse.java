package com.healthverse.aianalysis.dto;

import java.util.List;

public class HealthAnalyzeResponse {
    private String insights;
    private List<String> recommendations;
    private boolean seekProfessionalCare;

    public String getInsights() { return insights; }
    public void setInsights(String insights) { this.insights = insights; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public boolean isSeekProfessionalCare() { return seekProfessionalCare; }
    public void setSeekProfessionalCare(boolean seekProfessionalCare) { this.seekProfessionalCare = seekProfessionalCare; }
}
