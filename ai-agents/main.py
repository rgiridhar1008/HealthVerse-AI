import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST, before any other imports
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from api import health, report, diet, fitness, wellness, planning, chat_direct, twin

app = FastAPI(title="HealthVerse AI Agent Service", version="1.0.0")

# CORS middleware for local frontend and backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "HealthVerse AI Agent Service",
        "provider": settings.AI_PROVIDER,
        "model": settings.OLLAMA_MODEL,
        "ollama_url": settings.OLLAMA_BASE_URL
    }

# Core routers
app.include_router(health.router, prefix="/api/v1/agents/health", tags=["Health Agent"])
app.include_router(report.router, prefix="/api/v1/agents/report", tags=["Report Agent"])
app.include_router(diet.router, prefix="/api/v1/agents/diet", tags=["Diet Agent"])
app.include_router(fitness.router, prefix="/api/v1/agents/fitness", tags=["Fitness Agent"])
app.include_router(wellness.router, prefix="/api/v1/agents/wellness", tags=["Wellness Agent"])
app.include_router(planning.router, prefix="/api/v1/agents/planning", tags=["Planning Agent"])
app.include_router(twin.router, prefix="/api/v1/agents/twin", tags=["Digital Twin Agent"])

# Chat endpoint
app.include_router(chat_direct.router, prefix="/api/v1/agents", tags=["Direct Chat"])
app.include_router(chat_direct.router, prefix="/ai", tags=["Fast Chat Alias"])

# Spring Boot integration aliases
app.include_router(health.router, prefix="/ai/symptoms", tags=["Health Analyzer Alias"])
app.include_router(report.router, prefix="/ai/report", tags=["Report Analyzer Alias"])
app.include_router(planning.router, prefix="/ai/wellness-plan", tags=["Planning Agent Alias"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
