from fastapi import APIRouter, HTTPException
from models.schemas import WellnessPlanRequest, WellnessPlanResponse, OrchestrateRequest, OrchestrateResponse
from services.ai_provider import generate_json

router = APIRouter()

@router.post("/generate", response_model=WellnessPlanResponse)
async def generate_wellness_plan(request: WellnessPlanRequest):
    try:
        context = request.context or {}
        prompt = f"Goal: {request.goal}\nContext: {context}\nGenerate a holistic wellness plan combining nutrition, fitness, and general health guidance."
        system_prompt = "You are a holistic wellness planner AI. You must output JSON strictly matching this exact schema and keys: {\"executive_summary\": \"...\", \"nutrition_plan\": [\"...\"], \"fitness_plan\": [\"...\"], \"health_guidance\": [\"...\"], \"daily_schedule\": [\"...\"]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="planning")
        return WellnessPlanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate_request(request: OrchestrateRequest):
    try:
        context = request.context or {}
        prompt = f"Query: {request.query}\nContext: {context}\nDetermine how to respond and which agents should be involved."
        system_prompt = "You are an AI orchestrator. Output JSON strictly matching this exact schema and keys: {\"response\": \"...\", \"agents_involved\": [\"nutrition\", \"fitness\"]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="orchestration")
        return OrchestrateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
