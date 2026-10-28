from fastapi import APIRouter, HTTPException
from models.schemas import WellnessGenerateRequest, WellnessGenerateResponse, PredictiveWellnessRequest, PredictiveWellnessResponse
from services.ai_provider import generate_json
from typing import List

router = APIRouter()

@router.post("/generate", response_model=WellnessGenerateResponse)
async def generate_wellness(request: WellnessGenerateRequest):
    try:
        prompt = f"Generate a wellness plan based on: {request.model_dump()}"
        system_prompt = "You are a holistic wellness AI. Output strictly valid JSON matching this exact schema: {\"sleep_recommendations\": [\"...\"], \"stress_management\": [\"...\"], \"daily_habits\": [\"...\"]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="wellness")
        return WellnessGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict", response_model=List[PredictiveWellnessResponse])
async def predict_wellness(request: PredictiveWellnessRequest):
    try:
        prompt = f"Predict wellness trends based on history: {request.model_dump()}"
        system_prompt = "You are a predictive wellness AI. Output strictly valid JSON matching this exact schema: {\"predictions\": [{\"area\": \"Overall\", \"trend\": \"Stable\", \"reason\": \"...\", \"recommendation\": \"...\", \"confidence\": \"Moderate\", \"contributing_factors\": [\"...\"], \"evidence\": [\"...\"]}]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="predictive_wellness")
        
        predictions = result.get("predictions", [])
        if isinstance(result, dict) and not predictions:
            # If AI didn't nest it under 'predictions', try to construct it directly
            predictions = [result]
            
        return [PredictiveWellnessResponse(**r) for r in predictions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
