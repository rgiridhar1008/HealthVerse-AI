from fastapi import APIRouter, HTTPException
from models.schemas import DietGenerateRequest, DietGenerateResponse
from services.ai_provider import generate_json

router = APIRouter()

@router.post("/generate", response_model=DietGenerateResponse)
async def generate_diet(request: DietGenerateRequest):
    try:
        req_data = request.model_dump()
        goal = req_data.get("goal") or "Healthy Living & Energy"
        diet_type = req_data.get("diet_type") or "Indian Balanced"
        dietary_pref = req_data.get("dietary_preference") or "Indian Regional"
        allergies = req_data.get("allergies") or []
        conditions = req_data.get("chronic_conditions") or []
        lifestyle = req_data.get("lifestyle") or "Moderate"
        additional = req_data.get("additional_preferences") or ""

        prompt = (
            f"Generate a personalized, culturally authentic Indian diet plan for this individual:\n"
            f"- Primary Goal: {goal}\n"
            f"- Dietary Type / Cuisine: {diet_type} ({dietary_pref})\n"
            f"- Age: {req_data.get('age', 28)}, Weight: {req_data.get('weight', 70)}kg, Height: {req_data.get('height', 172)}cm\n"
            f"- Lifestyle: {lifestyle}\n"
            f"- Known Allergies / Intolerances: {', '.join(allergies) if allergies else 'None'}\n"
            f"- Chronic Conditions: {', '.join(conditions) if conditions else 'None'}\n"
            f"- Additional Preferences: {additional}\n\n"
            f"Requirements:\n"
            f"1. Prioritize authentic Indian meals (South Indian items like idli, sambar, ragi dosa, rasam, curd rice, vegetable poriyal; North Indian items like multigrain phulka, dal tadka, rajma, chana, paneer, seasonal sabzi; and lean egg bhurji / homestyle chicken curry if non-vegetarian).\n"
            f"2. Maximize high-protein staples (sprouts, paneer, dal, curd, eggs, tofu).\n"
            f"3. Strictly avoid any ingredients related to user allergies.\n"
            f"4. Provide 4 distinct meal suggestions: Breakfast, Lunch, Snacks, Dinner with practical portions.\n"
            f"5. Include hydration guidance (water, spiced chaas/buttermilk, jeera water) and 3-4 practical Indian dietary lifestyle recommendations."
        )

        system_prompt = (
            "You are an expert clinical nutritionist specializing in authentic Indian diets and metabolic health. "
            "Output strictly valid JSON matching this exact schema:\n"
            "{\n"
            "  \"meal_suggestions\": [\n"
            "    \"Breakfast: 2 Steamed Ragi Idlis or Besan Chilla with vegetable sambar, mint chutney, and 1 boiled egg (or 50g paneer bhurji) (approx. 380 kcal)\",\n"
            "    \"Lunch: 2 Multigrain Phulkas with 1 bowl Tadka Dal, 1 bowl Palak Sabzi, cucumber-curd raita, and grilled chicken breast or tofu (approx. 550 kcal)\",\n"
            "    \"Snacks: 1 bowl Sprouted Moong Chaat with lemon & chaat masala, or handful of roasted makhana & roasted chana (approx. 180 kcal)\",\n"
            "    \"Dinner: 1 cup Brown Rice or Millets with Rajma / Chhole curry or Fish curry, steamed beans poriyal, and sliced tomato salad (approx. 490 kcal)\"\n"
            "  ],\n"
            "  \"hydration_guidance\": \"Drink 2.5 - 3 Liters of water daily. Include spiced chaas (buttermilk with roasted jeera & mint) or warm jeera water between meals for optimal digestion.\",\n"
            "  \"practical_recommendations\": [\n"
            "    \"Use cold-pressed mustard, sesame, or moderate cow's ghee instead of refined oils.\",\n"
            "    \"Prioritize high-protein Indian staples: sprouts, paneer, lentils, curd, and lean eggs/chicken.\",\n"
            "    \"Limit deep-fried evening snacks; replace with roasted makhana, boiled peanuts, or chana sundal.\",\n"
            "    \"Finish dinner at least 2 hours before bedtime to support circadian digestive health.\"\n"
            "  ]\n"
            "}"
        )

        result = await generate_json(prompt=prompt, system_prompt=system_prompt, feature="diet")
        return DietGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
