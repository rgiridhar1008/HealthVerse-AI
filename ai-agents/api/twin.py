from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.ai_provider import generate_json

router = APIRouter()

class TwinAnalyzeRequest(BaseModel):
    history: Dict[str, Any]

class JourneyEvent(BaseModel):
    date: str
    event: str
    type: str

class TwinAnalyzeResponse(BaseModel):
    overallWellnessScore: int
    adherenceScore: int
    status: str
    weightTrend: str
    activityTrend: str
    sleepTrend: str
    energyScore: int
    recoveryScore: int
    insights: List[str]
    recommendations: List[str]
    journeyEvents: List[JourneyEvent]

@router.post("/analyze", response_model=TwinAnalyzeResponse)
async def analyze_twin(request: TwinAnalyzeRequest):
    try:
        prompt = f"Analyze this health history and provide a digital twin wellness summary: {request.history}"
        system_prompt = "You are a Digital Twin AI analyzing health metrics over time. Output strictly valid JSON matching this schema exact keys: {\"overallWellnessScore\": 85, \"adherenceScore\": 90, \"status\": \"Good\", \"weightTrend\": \"Stable\", \"activityTrend\": \"Improving\", \"sleepTrend\": \"Stable\", \"energyScore\": 80, \"recoveryScore\": 75, \"insights\": [\"...\"], \"recommendations\": [\"...\"], \"journeyEvents\": [{\"date\": \"2023-10-01\", \"event\": \"Started\", \"type\": \"Milestone\"}]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="twin")
        return TwinAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
