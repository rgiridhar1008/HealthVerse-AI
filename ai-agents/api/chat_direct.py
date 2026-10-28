"""
Fast direct local chat endpoint — bypasses the heavy CrewAI multi-agent
framework and calls the Ollama API directly for near-instant responses.
"""
import os
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from config.settings import settings
from services.ai_provider import generate

router = APIRouter()

class DirectChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class DirectChatResponse(BaseModel):
    response: str
    disclaimer: str
    recommend_professional: bool

SYSTEM_PROMPT = (
    "You are the HealthVerse AI wellness assistant. "
    "You provide clear, empathetic, evidence-based health and wellness guidance. "
    "You NEVER diagnose medical conditions or prescribe medications. "
    "Always recommend consulting a healthcare professional for serious concerns. "
    "Keep responses concise but helpful (2-4 paragraphs max). "
    "If the user describes severe or emergency symptoms, strongly recommend seeking immediate medical attention."
)

SEVERE_KEYWORDS = [
    "chest pain", "heart attack", "stroke", "can't breathe", "suicide",
    "overdose", "bleeding heavily", "unconscious", "seizure", "severe pain",
    "emergency", "dying", "anaphylaxis", "poison"
]

@router.post("/chat", response_model=DirectChatResponse)
async def direct_chat(request: DirectChatRequest):
    """Fast chat endpoint using direct local LLM (Ollama) call."""
    try:
        recommend_professional = _should_recommend_professional(request.query)

        # Call the central AI provider abstraction
        response_text = await generate(
            prompt=request.query,
            system_prompt=SYSTEM_PROMPT,
            feature="chat",
            max_tokens=768
        )

        return DirectChatResponse(
            response=response_text,
            disclaimer="This AI provides wellness guidance and does not replace professional medical diagnosis.",
            recommend_professional=recommend_professional
        )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Direct chat error: {error_details}")
        raise HTTPException(status_code=getattr(e, 'status_code', 500), detail=str(e))





def _should_recommend_professional(query: str) -> bool:
    query_lower = query.lower()
    return any(kw in query_lower for kw in SEVERE_KEYWORDS)
