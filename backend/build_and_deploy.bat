@echo off
echo ========================================================
echo Compiling Java Services using Docker Maven Container...
echo ========================================================
docker run --rm -v "%CD%:/app" -w /app maven:3.9.6-eclipse-temurin-21 mvn clean package -DskipTests

echo.
echo ========================================================
echo Rebuilding and Starting Docker Containers...
echo ========================================================
docker compose up -d --build
echo.
echo Done! All services should now be updated and running.
