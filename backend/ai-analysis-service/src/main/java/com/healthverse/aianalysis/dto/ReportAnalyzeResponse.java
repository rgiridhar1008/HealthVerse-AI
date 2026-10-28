package com.healthverse.aianalysis.dto;

import java.util.List;
import java.util.Map;

public class ReportAnalyzeResponse {
    private String summary;
    private List<FindingDto> findings;
    private List<AbnormalValueDto> abnormal_values;
    private List<String> normal_values;
    private String explanations;
    private List<String> recommendations;
    private String disclaimer;

    public static class FindingDto {
        private String name;
        private String value;
        private String status;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class AbnormalValueDto {
        private String marker;
        private String value;
        private String referenceRange;
        private String status;
        private String explanation;

        public String getMarker() { return marker; }
        public void setMarker(String marker) { this.marker = marker; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public String getReferenceRange() { return referenceRange; }
        public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<FindingDto> getFindings() { return findings; }
    public void setFindings(List<FindingDto> findings) { this.findings = findings; }

    public List<AbnormalValueDto> getAbnormal_values() { return abnormal_values; }
    public void setAbnormal_values(List<AbnormalValueDto> abnormal_values) { this.abnormal_values = abnormal_values; }

    public List<String> getNormal_values() { return normal_values; }
    public void setNormal_values(List<String> normal_values) { this.normal_values = normal_values; }

    public String getExplanations() { return explanations; }
    public void setExplanations(String explanations) { this.explanations = explanations; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
