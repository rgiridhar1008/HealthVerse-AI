from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ==========================================
# HEALTH / SYMPTOM ANALYZER
# ==========================================

class HealthAnalyzeRequest(BaseModel):
    symptoms: str
    duration: Optional[str] = None
    severity: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None

class HealthAnalyzeResponse(BaseModel):
    insights: str = Field(default="", description="A detailed string containing the AI analysis, understood symptoms, possible causes, and risk level.")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations and self-care guidance based on the analysis.")
    seekProfessionalCare: bool = Field(default=False, description="True if the user should seek professional medical help immediately based on the symptoms.")

# ==========================================
# MEDICAL REPORT ANALYZER
# ==========================================

class ReportAnalyzeRequest(BaseModel):
    report_text: str

class AbnormalValue(BaseModel):
    marker: str = Field(default="", description="Name of the abnormal test or biomarker")
    value: str = Field(default="", description="The measured value with units")
    referenceRange: str = Field(default="", description="The normal reference range")
    status: str = Field(default="HIGH", description="Must be 'HIGH', 'LOW', 'POSITIVE', or 'NEGATIVE'")
    explanation: str = Field(default="", description="Brief explanation of what this abnormal value means")

class ReportObservation(BaseModel):
    name: str = Field(default="", description="Name of the test or biomarker")
    value: str = Field(default="", description="The measured value with units")
    status: str = Field(default="normal", description="Must be 'normal', 'attention', or 'critical'")
    description: Optional[str] = Field(default="", description="Short description of what this marker is")

class ReportAnalyzeResponse(BaseModel):
    summary: str = Field(default="Medical report processed.", description="A simple, easily understandable summary of the medical report")
    findings: List[ReportObservation] = Field(default_factory=list, description="List of all extracted test values")
    abnormal_values: List[AbnormalValue] = Field(default_factory=list, description="List of structured abnormal values that are outside the normal range")
    normal_values: List[str] = Field(default_factory=list, description="List of values that are within the normal range")
    explanations: str = Field(default="", description="A simple explanation of what the overall results mean")
    recommendations: List[str] = Field(default_factory=list, description="Wellness recommendations based on the findings")
    disclaimer: str = Field(default="This analysis is for informational purposes only. Consult a healthcare professional.", description="Clear warning that this is not a medical diagnosis and user should consult a doctor")

# ==========================================
# NUTRITION / DIET AGENT
# ==========================================

class DietGenerateRequest(BaseModel):
    goal: str
    diet_type: str
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    lifestyle: Optional[str] = None
    dietary_preference: Optional[str] = None
    additional_preferences: Optional[str] = None

class DietGenerateResponse(BaseModel):
    meal_suggestions: List[str] = Field(default_factory=list, description="Personalized meal suggestions")
    hydration_guidance: str = Field(default="Drink adequate water daily.", description="Specific guidance on water intake")
    practical_recommendations: List[str] = Field(default_factory=list, description="Practical dietary habits and recommendations")

# ==========================================
# FITNESS / WELLNESS AGENT
# ==========================================

class FitnessGenerateRequest(BaseModel):
    goal: str
    fitness_level: str = "beginner"
    limitations: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    lifestyle: Optional[str] = None

class FitnessGenerateResponse(BaseModel):
    exercise_plan: List[str] = Field(default_factory=list, description="Recommended exercises and activity plan")
    recovery_suggestions: List[str] = Field(default_factory=list, description="Suggestions for rest and recovery")
    general_advice: List[str] = Field(default_factory=list, description="General fitness guidance")

class WellnessGenerateRequest(BaseModel):
    sleep_quality: str
    stress_level: str
    daily_activity: str
    goals: Optional[str] = None
    conditions: Optional[str] = None
    lifestyle: Optional[str] = None

class WellnessGenerateResponse(BaseModel):
    sleep_recommendations: List[str] = Field(default_factory=list, description="Tips for improving sleep")
    stress_management: List[str] = Field(default_factory=list, description="Tips for managing stress")
    daily_habits: List[str] = Field(default_factory=list, description="Recommended daily wellness habits")

# ==========================================
# HEALTH CONVERSATIONAL AGENT
# ==========================================

class ChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str = Field(default="", description="The conversational response to the user's query")
    disclaimer: str = Field(default="This analysis is for informational purposes only. Consult a healthcare professional.", description="A standard disclaimer about not being a medical professional")
    recommend_professional: bool = Field(default=False, description="True if the user's query suggests they need real medical help")

# ==========================================
# PLANNING / ORCHESTRATOR AGENT
# ==========================================

class WellnessPlanRequest(BaseModel):
    goal: str
    context: Optional[Dict[str, Any]] = None

class WellnessPlanResponse(BaseModel):
    executive_summary: str = Field(default="", description="A brief summary of the holistic wellness plan")
    nutrition_plan: List[str] = Field(default_factory=list, description="Dietary and nutrition recommendations")
    fitness_plan: List[str] = Field(default_factory=list, description="Exercise and activity recommendations")
    health_guidance: List[str] = Field(default_factory=list, description="General health and wellness tips")
    daily_schedule: List[str] = Field(default_factory=list, description="A suggested daily routine combining all aspects")

class OrchestrateRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class OrchestrateResponse(BaseModel):
    response: str
    agents_involved: List[str]

class PredictiveWellnessRequest(BaseModel):
    history: List[Dict[str, Any]]

class PredictiveWellnessResponse(BaseModel):
    area: str = Field(default="Overall", description="Area of wellness, e.g., Sleep, Activity")
    trend: str = Field(default="Stable", description="Trend status, e.g., Needs Attention, Improving")
    reason: str = Field(default="", description="Reason for the trend based on data")
    recommendation: str = Field(default="", description="Actionable recommendation")
    confidence: str = Field(default="Moderate", description="Confidence level based on available data size")
    contributing_factors: List[str] = Field(default_factory=list, description="Factors contributing to this trend")
    evidence: List[str] = Field(default_factory=list, description="Data points used as evidence")
