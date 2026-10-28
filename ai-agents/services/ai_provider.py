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
        Generate text completion via Ollama HTTP API.
        """
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
        Generate structured JSON output via Ollama.
        Enforces format="json" and cleans up markdown wrappers.
        """
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
        Chat completion using Ollama's chat API.
        """
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
