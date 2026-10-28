@echo off
echo ========================================================
echo Rebuilding AI Agent Service with new Configuration...
echo ========================================================
cd /d "%~dp0\backend"
docker compose up -d --build ai-agent-service
echo.
echo ========================================================
echo Done! Please refresh your browser and test the AI features.
echo ========================================================
pause
