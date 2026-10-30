from fastapi import APIRouter, HTTPException
from models.schemas import WellnessGenerateRequest, WellnessGenerateResponse, PredictiveWellnessRequest, PredictiveWellnessResponse
from services.ai_provider import generate_json
from typing import List

router = APIRouter()

@router.post("/generate", response_model=WellnessGenerateResponse)
async def generate_wellness(request: WellnessGenerateRequest):
    try:
        req_data = request.model_dump()
        stress = req_data.get("stress_level") or "Moderate"
        sleep_q = req_data.get("sleep_quality") or "Average"
        lifestyle = req_data.get("lifestyle") or "Moderate"
        goals = req_data.get("goals") or "Restorative balance"

        prompt = (
            f"Generate a holistic, evidence-based wellness & circadian recovery plan:\n"
            f"- Stress Level: {stress}\n"
            f"- Sleep Quality: {sleep_q}\n"
            f"- Lifestyle: {lifestyle}\n"
            f"- Primary Goals: {goals}\n\n"
            f"Guidelines:\n"
            f"1. Sleep recommendations must be complete, cohesive behavioral guidelines (e.g. consistent circadian sleep/wake window, digital wind-down routine 45 mins before bed, caffeine curfew after 2 PM, optimal cool dark sleep environment).\n"
            f"2. Stress management should include somatic practices (box breathing, NSDR/progressive muscle relaxation, nature walks).\n"
            f"3. Daily habits should focus on hydration, morning sunlight exposure within 30 mins of waking, and active recovery intervals."
        )

        system_prompt = (
            "You are an expert integrative wellness and sleep medicine AI. Output strictly valid JSON matching this exact schema:\n"
            "{\n"
            "  \"sleep_recommendations\": [\n"
            "    \"Maintain a consistent sleep window: asleep by 10:30 PM and awake by 6:30 AM to stabilize circadian rhythm.\",\n"
            "    \"Implement a 45-minute digital sunset: switch devices to night mode and stop screen exposure before sleep.\",\n"
            "    \"Set a caffeine curfew: avoid tea, coffee, and energy drinks at least 8 hours prior to your bedtime.\"\n"
            "  ],\n"
            "  \"stress_management\": [\n"
            "    \"Practice 5 minutes of 4-7-8 or Box Breathing during mid-day transition periods to downregulate cortisol.\",\n"
            "    \"Take a 15-minute screen-free decompression walk after work to separate work cognitive load from evening rest.\"\n"
            "  ],\n"
            "  \"daily_habits\": [\n"
            "    \"Get 10 to 15 minutes of direct natural sunlight into your eyes within 30 minutes of waking.\",\n"
            "    \"Drink a large glass of water with electrolytes or lemon upon waking before any caffeine.\",\n"
            "    \"Incorporate 5-minute micro-breaks every 90 minutes of focused sedentary work.\"\n"
            "  ]\n"
            "}"
        )
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="wellness")
        return WellnessGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict", response_model=List[PredictiveWellnessResponse])
async def predict_wellness(request: PredictiveWellnessRequest):
    try:
        prompt = f"Predict wellness trends based on history: {request.model_dump()}"
        system_prompt = (
            "You are a predictive wellness AI. Output strictly valid JSON matching this exact schema:\n"
            "{\n"
            "  \"predictions\": [\n"
            "    {\n"
            "      \"area\": \"Circadian Rhythm & Sleep Quality\",\n"
            "      \"trend\": \"Improving\",\n"
            "      \"reason\": \"Consistent recovery intervals and steady biometric vitals indicate healthy circadian synchronization.\",\n"
            "      \"recommendation\": \"Maintain your regular 10:30 PM wind-down routine and sustain optimal hydration.\",\n"
            "      \"confidence\": \"High\",\n"
            "      \"contributing_factors\": [\"Regular sleep duration\", \"Active daily exercise\", \"Balanced hydration\"],\n"
            "      \"evidence\": [\"Average sleep duration stabilized at 7.5 hours\", \"Daily physical activity logged\"]\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="predictive_wellness")
        
        predictions = result.get("predictions", [])
        if isinstance(result, dict) and not predictions:
            predictions = [result]
            
        return [PredictiveWellnessResponse(**r) for r in predictions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
