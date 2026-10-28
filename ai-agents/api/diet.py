from fastapi import APIRouter, HTTPException
from models.schemas import DietGenerateRequest, DietGenerateResponse
from services.ai_provider import generate_json

router = APIRouter()

@router.post("/generate", response_model=DietGenerateResponse)
async def generate_diet(request: DietGenerateRequest):
    try:
        prompt = f"Generate a diet plan for: {request.model_dump()}"
        system_prompt = "You are an expert nutritionist AI. Output strictly valid JSON matching this exact schema: {\"meal_suggestions\": [\"Breakfast: ...\", \"Lunch: ...\", \"Dinner: ...\", \"Snacks: ...\"], \"hydration_guidance\": \"...\", \"practical_recommendations\": [\"...\"]}"
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="diet")
        return DietGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
