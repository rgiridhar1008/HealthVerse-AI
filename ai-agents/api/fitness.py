from fastapi import APIRouter, HTTPException
from models.schemas import FitnessGenerateRequest, FitnessGenerateResponse
from services.ai_provider import generate_json

router = APIRouter()

@router.post("/generate", response_model=FitnessGenerateResponse)
async def generate_fitness(request: FitnessGenerateRequest):
    try:
        prompt = f"Generate a fitness plan for: {request.model_dump()}"
        system_prompt = "You are an expert fitness coach AI. Output strictly valid JSON matching this exact schema: {\"exercise_plan\": [\"...\"], \"recovery_suggestions\": [\"...\"], \"general_advice\": [\"...\"]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="fitness")
        return FitnessGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
