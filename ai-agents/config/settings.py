from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve the absolute path to the project root (ai-agents) and the .env file
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Explicitly load into os.environ for other libraries
load_dotenv(dotenv_path=ENV_PATH)

class Settings(BaseSettings):
    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
