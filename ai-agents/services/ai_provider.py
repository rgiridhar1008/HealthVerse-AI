import os
import json
import re
import time
import asyncio
from typing import Dict, Any, List, Optional
import aiohttp
from config.settings import settings


class AIProviderError(Exception):
    def __init__(self, message: str, error_code: str = "AI_ERROR", status_code: int = 500):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)


class AIProvider:
    """
    Unified AI Provider layer for HealthVerse.
    Strictly uses local Ollama instance configured via environment variables.
    """

    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        max_tokens: int = 1024,
        temperature: float = 0.7,
        feature: str = "general"
    ) -> str:
        """
        Generate text completion via Ollama HTTP API or Mock provider for tests.
        """
        if self.provider == "mock":
            print(f"[AI-AGENT-MOCK] Generating mock response for feature={feature}")
            return f"[TEST MOCK MODE] AI analysis result for {feature}."

        print(f"[AI-AGENT] Using provider={self.provider}")
        print(f"[AI-AGENT] Using model={self.model} feature={feature}")
        print(f"[AI-AGENT] Calling Ollama at {self.base_url}...")

        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "keep_alive": "1h",
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature
            }
        }

        start_time = time.time()
        try:
            timeout = aiohttp.ClientTimeout(total=300)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        err_text = await response.text()
                        print(f"[OLLAMA-ERROR] HTTP {response.status}: {err_text}")
                        raise AIProviderError(
                            f"Ollama API returned HTTP {response.status}: {err_text}",
                            "OLLAMA_HTTP_ERROR",
                            502
                        )
                    data = await response.json()
                    elapsed = int((time.time() - start_time) * 1000)
                    print(f"[OLLAMA] Generation successful in {elapsed}ms")
                    return data.get("response", "")
        except asyncio.TimeoutError:
            elapsed = int((time.time() - start_time) * 1000)
            print(f"[OLLAMA-ERROR] Request timed out after {elapsed}ms")
            raise AIProviderError("Ollama request timed out", "OLLAMA_TIMEOUT", 504)
        except aiohttp.ClientConnectorError as e:
            print(f"[OLLAMA-ERROR] Connection refused to {self.base_url}: {e}")
            raise AIProviderError(
                f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is running.",
                "OLLAMA_UNREACHABLE",
                503
            )
        except Exception as e:
            if isinstance(e, AIProviderError):
                raise
            print(f"[OLLAMA-ERROR] Unexpected error: {str(e)}")
            raise AIProviderError(f"Ollama generation failure: {str(e)}", "OLLAMA_FAILURE", 500)

    async def generate_json(
        self,
        prompt: str,
        system_prompt: str = "",
        max_tokens: int = 2048,
        temperature: float = 0.1,
        feature: str = "json"
    ) -> Dict[str, Any]:
        """
        Generate structured JSON output via Ollama or Mock provider for tests.
        Enforces format="json" and cleans up markdown wrappers.
        """
        if self.provider == "mock":
            print(f"[AI-AGENT-MOCK] Generating mock structured JSON for feature={feature}")
            if feature == "report":
                return {
                    "summary": "[MOCK TEST MODE] Blood profile shows healthy biomarker baseline.",
                    "findings": [
                        {"name": "Hemoglobin", "value": "14.2 g/dL", "status": "normal", "description": "Normal oxygen carrier"},
                        {"name": "Total Cholesterol", "value": "210 mg/dL", "status": "attention", "description": "Borderline elevation"}
                    ],
                    "abnormal_values": [
                        {"marker": "Total Cholesterol", "value": "210 mg/dL", "referenceRange": "< 200 mg/dL", "status": "HIGH", "explanation": "Slightly elevated lipid level"}
                    ],
                    "normal_values": ["Hemoglobin 14.2 g/dL", "Fasting Blood Sugar 92 mg/dL"],
                    "explanations": "[MOCK TEST MODE] Biomarkers indicate overall stability with minor lipid optimization recommended.",
                    "recommendations": ["Engage in 30 minutes of aerobic exercise daily.", "Increase soluble dietary fiber intake."],
                    "disclaimer": "This analysis is for informational purposes only. Consult a healthcare professional."
                }
            elif feature == "symptom":
                return {
                    "insights": "[MOCK TEST MODE] Mild fatigue observed. Hydration and rest suggested.",
                    "recommendations": ["Drink 2.5L water daily", "Aim for 8 hours of sleep"],
                    "seekProfessionalCare": False
                }
            elif feature == "diet":
                return {
                    "meal_suggestions": [
                        "Breakfast: 2 Steamed Ragi Idlis or Moong Dal Chilla with vegetable sambar, mint chutney, and 1 boiled egg (or 50g paneer bhurji) (approx. 380 kcal)",
                        "Lunch: 2 Phulkas (multigrain roti) with 1 bowl Tadka Dal, 1 bowl Palak Sabzi, cucumber-curd raita, and grilled chicken breast or tofu (approx. 550 kcal)",
                        "Snacks: 1 bowl Sprouted Moong Chaat with lemon & chaat masala, or roasted makhana & roasted chana (approx. 180 kcal)",
                        "Dinner: 1 cup Brown Rice or Millets with Rajma / Chhole curry or Fish curry, steamed green beans poriyal, and sliced tomato salad (approx. 490 kcal)"
                    ],
                    "hydration_guidance": "Drink 2.5 - 3 Liters of water daily. Include spiced chaas (buttermilk with roasted jeera & mint) or warm jeera water between meals for optimal digestion.",
                    "practical_recommendations": [
                        "Use cold-pressed mustard, sesame, or moderate cow's ghee instead of refined oils.",
                        "Prioritize high-protein Indian staples: sprouts, paneer, lentils, curd, and lean eggs/chicken.",
                        "Limit deep-fried evening snacks; replace with roasted makhana, boiled peanuts, or chana sundal.",
                        "Finish dinner at least 2 hours before bedtime to support circadian digestive health."
                    ]
                }
            elif feature == "fitness":
                return {
                    "weeklyRoutine": [
                        {"day": "Monday", "focus": "Cardio & Core", "duration": "40 mins"},
                        {"day": "Wednesday", "focus": "Strength & Mobility", "duration": "45 mins"},
                        {"day": "Friday", "focus": "Full Body Circuit", "duration": "40 mins"}
                    ],
                    "dailyStepTarget": 8500
                }
            elif feature == "wellness":
                return {
                    "area": "Stress & Circadian Rhythm",
                    "trend": "Positive",
                    "reason": "[MOCK TEST MODE] Rest cycles and activity patterns are well synchronized.",
                    "recommendation": "Maintain regular bedtime schedules.",
                    "confidence": "High",
                    "contributing_factors": ["Adequate daily hydration", "Consistent rest intervals"],
                    "evidence": ["Sleep duration within 7-8 hours range"]
                }
            return {"status": "ok", "mode": "mock", "feature": feature}

        print(f"[AI-AGENT] Using provider={self.provider}")
        print(f"[AI-AGENT] Using model={self.model} (format=json) feature={feature}")
        print(f"[AI-AGENT] Calling Ollama at {self.base_url}...")

        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "format": "json",
            "stream": False,
            "keep_alive": "1h",
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature
            }
        }

        start_time = time.time()
        try:
            timeout = aiohttp.ClientTimeout(total=300)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        err_text = await response.text()
                        print(f"[OLLAMA-ERROR] HTTP {response.status}: {err_text}")
                        raise AIProviderError(
                            f"Ollama API returned HTTP {response.status}: {err_text}",
                            "OLLAMA_HTTP_ERROR",
                            502
                        )
                    data = await response.json()
                    elapsed = int((time.time() - start_time) * 1000)
                    print(f"[OLLAMA] Generation successful in {elapsed}ms")

                    raw_response = data.get("response", "").strip()
                    parsed = self._extract_json(raw_response)
                    print(f"[AI-AGENT] JSON parsed successfully")
                    return parsed
        except asyncio.TimeoutError:
            elapsed = int((time.time() - start_time) * 1000)
            print(f"[OLLAMA-ERROR] Request timed out after {elapsed}ms")
            raise AIProviderError("Ollama JSON request timed out", "OLLAMA_TIMEOUT", 504)
        except aiohttp.ClientConnectorError as e:
            print(f"[OLLAMA-ERROR] Connection refused to {self.base_url}: {e}")
            raise AIProviderError(
                f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is running.",
                "OLLAMA_UNREACHABLE",
                503
            )
        except Exception as e:
            if isinstance(e, AIProviderError):
                raise
            print(f"[OLLAMA-ERROR] JSON generation failure: {str(e)}")
            raise AIProviderError(f"Failed to generate JSON: {str(e)}", "OLLAMA_JSON_FAILURE", 500)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 1024,
        temperature: float = 0.7
    ) -> str:
        """
        Chat completion using Ollama's chat API or Mock provider for tests.
        """
        if self.provider == "mock":
            return "[TEST MOCK MODE] Hello! I am your HealthVerse AI wellness assistant. How can I help you with your health goals today?"

        print(f"[AI-AGENT] Chat call using provider={self.provider}, model={self.model}")
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "keep_alive": "1h",
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature
            }
        }

        start_time = time.time()
        try:
            timeout = aiohttp.ClientTimeout(total=300)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        err_text = await response.text()
                        raise AIProviderError(
                            f"Ollama chat error: {err_text}",
                            "OLLAMA_CHAT_ERROR",
                            502
                        )
                    data = await response.json()
                    elapsed = int((time.time() - start_time) * 1000)
                    print(f"[OLLAMA] Chat generation successful in {elapsed}ms")
                    return data.get("message", {}).get("content", "")
        except Exception as e:
            if isinstance(e, AIProviderError):
                raise
            raise AIProviderError(f"Ollama chat failed: {str(e)}", "OLLAMA_CHAT_FAILURE", 500)

    def _extract_json(self, raw: str) -> Dict[str, Any]:
        """
        Extracts valid JSON from raw text, removing markdown fences if present.
        """
        if not raw:
            raise AIProviderError("Empty response from Ollama", "EMPTY_RESPONSE", 502)

        # 1. Direct parse attempt
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass

        # 2. Extract from markdown code fences ```json ... ```
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # 3. Extract outermost { ... }
        start_idx = raw.find('{')
        end_idx = raw.rfind('}')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            try:
                return json.loads(raw[start_idx:end_idx + 1])
            except json.JSONDecodeError:
                pass

        print(f"[AI-ERROR] Failed to extract JSON from raw response: {raw[:300]}")
        raise AIProviderError(
            f"Model returned invalid JSON: {raw[:200]}...",
            "JSON_PARSE_ERROR",
            502
        )


# Global singleton instance
ai_provider = AIProvider()

# Helper exports for convenience
generate = ai_provider.generate
generate_json = ai_provider.generate_json
chat = ai_provider.chat
