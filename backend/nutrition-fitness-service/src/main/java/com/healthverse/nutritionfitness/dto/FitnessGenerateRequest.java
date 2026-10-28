package com.healthverse.nutritionfitness.dto;

public class FitnessGenerateRequest {
    private String goal;
    private String fitness_level;
    private String limitations;
    private Integer age;
    private Double weight;
    private Double height;
    private String lifestyle;

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getFitness_level() { return fitness_level; }
    public void setFitness_level(String fitness_level) { this.fitness_level = fitness_level; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public String getLifestyle() { return lifestyle; }
    public void setLifestyle(String lifestyle) { this.lifestyle = lifestyle; }
}
