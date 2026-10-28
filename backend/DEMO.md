# HealthVerse-AI Presentation Demo Guide

This document provides a simple, repeatable sequence for demonstrating the HealthVerse-AI backend during a presentation or architectural review.

## Prerequisites
Ensure Docker Desktop is running and ports `8080-8089` and `8761` are available on your machine.

---

## Demo Sequence

### 1. Boot up the Environment
Open a terminal in the root `backend` directory and execute:
```bash
docker compose up -d
```
*Narrative*: "We are spinning up the entire microservices architecture. This brings up PostgreSQL, MongoDB, Redis, Netflix Eureka, our Spring Cloud Gateway, and all distinct business microservices."

### 2. Verify Containers
Run:
```bash
docker compose ps
```
*Narrative*: "All containers are healthy and running. You can see the databases running alongside our Java applications."

### 3. Open Eureka Dashboard
Open your browser and navigate to:
`http://localhost:8761`
*Narrative*: "This is the Eureka Service Registry. As you can see, all microservices have successfully dynamically registered themselves here, enabling the API Gateway to route traffic without hardcoded IP addresses."

### 4. Authenticate User (Auth Service)
Open Postman (or cURL) and POST to `http://localhost:8080/api/auth/login`.
```json
{
  "email": "pranathi@gmail.com",
  "password": "Password123"
}
```
*Narrative*: "We authenticate through the API Gateway, which forwards to the Auth Service. We receive a cryptographically signed JWT. From now on, all requests use this Bearer token, ensuring stateless, CSRF-proof security."

### 5. View User Profile (User Service)
Make a GET request to `http://localhost:8080/users/profile` with the JWT in the `Authorization` header.
*Narrative*: "The User Service validates the JWT directly, extracting the User ID. Notice we didn't pass the ID in the URL, strictly preventing Insecure Direct Object Reference (IDOR) attacks."

### 6. Log Daily Health Data (User Service)
POST to `http://localhost:8080/users/daily-data`:
```json
{
  "steps": 10500,
  "sleepHours": 7.5,
  "hydrationLiters": 2.5
}
```
*Narrative*: "We securely log health data into the PostgreSQL database. This data forms the baseline for our AI and analytics."



### 7. Upload Medical Report (Report Service -> MongoDB)
POST `http://localhost:8080/api/reports/upload` with a dummy PDF file attached as `file`.
*Narrative*: "This PDF is stored securely in MongoDB, as document databases are better suited for binary metadata storage than relational databases."

### 8. Request AI Analysis (AI Analysis Service)
POST `http://localhost:8080/api/analysis/reports/{reportId}/analyze` (Requires an existing reportId).
*Narrative*: "The AI service extracts text from the uploaded medical report and passes it to the AI Agent Service, translating complex medical jargon into easy-to-understand wellness advice using local Ollama."

### 9. Generate Nutrition & Fitness Plans
POST `http://localhost:8080/api/nutrition/plans/generate`
POST `http://localhost:8080/api/fitness/plans/generate`
*Narrative*: "These services generate actionable lifestyle plans based on the user's recorded health profile using AI."

### 10. View Wellness Summary (Wellness Service)
POST `http://localhost:8080/api/wellness/plans/generate`
*Narrative*: "This aggregates multiple facets of the user's health to give a holistic view."

### 11. Demonstrate Security & Hardening (Phase 19)
Make a GET request to `http://localhost:8081/actuator/env`.
*Narrative*: "If an attacker bypasses the gateway, they still cannot access sensitive actuator endpoints on the internal services, as they correctly return 403 Forbidden."

### 12. Show Comprehensive Test Results
In the terminal, execute:
```powershell
python test_all_features.py
```
*Narrative*: "Finally, we have a fully automated Python test script that validates the entire business flow end-to-end via the API Gateway."

---
*End of Demo.*
