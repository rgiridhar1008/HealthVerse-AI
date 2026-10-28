from fastapi import APIRouter, HTTPException
from models.schemas import HealthAnalyzeRequest, HealthAnalyzeResponse
from services.ai_provider import generate_json

router = APIRouter()

@router.post("/analyze", response_model=HealthAnalyzeResponse)
async def analyze_health(request: HealthAnalyzeRequest):
    try:
        prompt = f"Analyze these symptoms safely: {request.model_dump()}"
        system_prompt = "You are a wellness AI assistant. Analyze symptoms only for general wellness guidance. Do NOT diagnose diseases or prescribe medication. Output strictly valid JSON matching this exact schema: {\"insights\": \"...\", \"recommendations\": [\"...\"], \"seekProfessionalCare\": false}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="symptom")
        return HealthAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
