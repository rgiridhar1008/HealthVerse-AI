@echo off
echo Copying test_layer_3.py into the running container...
docker cp test_layer_3.py healthverse-ai-agent-service:/app/test_layer_3.py

echo.
echo Running TEST 3 inside the container...
docker exec healthverse-ai-agent-service python test_layer_3.py

echo.
pause
