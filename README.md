# 🏥 HealthVerse AI
### *An Agentic Digital Healthcare Ecosystem for Predictive Health Monitoring, AI Clinical Triage, and Personalized Wellness*

---

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM%20(qwen2.5%3A7b)-black.svg?logo=ollama&logoColor=white)](https://ollama.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![Architecture](https://img.shields.io/badge/Architecture-SOA%20%2F%20Microservices-informational.svg)]()

---

## 📌 Executive Summary

**HealthVerse AI** is an enterprise-grade, service-oriented digital healthcare ecosystem that bridges the gap between conventional health tracking and intelligent, proactive medical assistance. By synthesizing **Service-Oriented Architecture (SOA)**, **polyglot persistence**, distributed **Spring Boot 3.x microservices**, and an **asynchronous Agentic AI layer powered by local LLMs (Ollama `qwen2.5:7b`)**, HealthVerse AI delivers a continuous cycle of:

$$\text{Continuous Monitoring} \longrightarrow \text{Predictive Analysis} \longrightarrow \text{Clinical Triage} \longrightarrow \text{Personalized Intervention}$$

Unlike fragmented fitness trackers or isolated symptom questionnaires, HealthVerse AI aggregates longitudinal vitals, daily lifestyle habits, clinical lab reports (PDFs), and self-reported symptoms into a unified **Digital Health Twin**, empowering users with actionable, evidence-based wellness guidance while upholding strict data sovereignty and zero-trust security.

---

## 🎓 Academic & Institutional Context

| Parameter | Details |
| :--- | :--- |
| **Course** | **SOA Programming and Microservices (24SDCS03)** |
| **Department** | Department of Computer Science & Engineering (CSE) |
| **Institution** | **KL University (KLH)** |
| **Academic Year** | 2026 – 2027 |
| **Project Guide** | **Dr. Srikanth Cherukuvada** |
| **Project Team** | **P. Pranathi** (ID: `2420030043`)<br>**R. L. S. Giridhar** (ID: `2420030171`)<br>**D. Krishna Chaitanya** (ID: `2420090077`) |
| **Submission Artifacts** | `SOA_PROJECT_ABSTRACT.pdf`, Review Presentations, Skill Evaluations (Exp-1, Exp-2) |

---

## 📑 Table of Contents

- [Core Value Proposition & Features](#-core-value-proposition--features)
  - [1. Digital Health Twin Engine](#1-digital-health-twin-engine)
  - [2. Intelligent Symptom Analyzer & Triage](#2-intelligent-symptom-analyzer--triage)
  - [3. AI Medical Report & Biomarker Extractor](#3-ai-medical-report--biomarker-extractor)
  - [4. Dynamic Nutrition & Caloric Planner](#4-dynamic-nutrition--caloric-planner)
  - [5. Personalized Fitness & Workout Engine](#5-personalized-fitness--workout-engine)
  - [6. Predictive Wellness & Mental Health Suite](#6-predictive-wellness--mental-health-suite)
  - [7. Empathetic Conversational Health Assistant](#7-empathetic-conversational-health-assistant)
- [System Architecture & SOA Principles](#-system-architecture--soa-principles)
  - [High-Level Architecture Diagram](#high-level-architecture-diagram)
  - [SOA Design Principles Applied](#soa-design-principles-applied)
  - [Microservices Catalog & Port Allocation](#microservices-catalog--port-allocation)
- [Agentic AI Layer Architecture](#-agentic-ai-layer-architecture)
  - [Unified Local-First Inference Pipeline](#unified-local-first-inference-pipeline)
  - [Agent Delegation Topology](#agent-delegation-topology)
- [Technology Stack Matrix](#-technology-stack-matrix)
- [Database Schema & Polyglot Persistence](#-database-schema--polyglot-persistence)
- [End-to-End API Documentation](#-end-to-end-api-documentation)
- [Repository Structure](#-repository-structure)
- [Installation & Quickstart Guide](#-installation--quickstart-guide)
  - [Option A: One-Click Docker Compose (Recommended)](#option-a-one-click-docker-compose-recommended)
  - [Option B: Bare-Metal Local Development Setup](#option-b-bare-metal-local-development-setup)
- [Database & Demo Seeding](#-database--demo-seeding)
- [Automated Verification & Testing](#-automated-verification--testing)
- [Security, Privacy & Ethical Compliance](#-security-privacy--ethical-compliance)
- [Future Roadmap](#-future-roadmap)
- [License & Disclaimer](#-license--disclaimer)

---

## 🌟 Core Value Proposition & Features

### 1. Digital Health Twin Engine
- **Holistic Biometric Modeling**: Continuously constructs a virtual physiological representation of the user based on age, gender, BMI, resting heart rate, blood pressure, blood glucose, sleep architecture, and historical lab reports.
- **Dynamic 0–100 Health Score**: Evaluates health across four weighted sub-domains:
  - *Cardiovascular Health*: Heart rate stability, systolic/diastolic ratios.
  - *Metabolic Fitness*: BMI, blood glucose ranges, daily caloric equilibrium.
  - *Lifestyle & Activity*: Step volume (10k step threshold), hydration index.
  - *Sleep & Recovery*: Deep sleep duration, regularity, and sleep hygiene.
- **Longitudinal Trend Forecasting**: Identifies upward or deteriorating health trajectories over 7, 30, and 90-day intervals.

### 2. Intelligent Symptom Analyzer & Triage
- **Conversational & Structured Symptom Ingestion**: Accepts multi-symptom descriptions (e.g., *"Persistent dull headache for 3 days with light sensitivity and mild nausea"*).
- **Clinical Urgency Classification**: Categorizes encounters into `EMERGENCY`, `HIGH_PRIORITY`, `MEDIUM_PRIORITY`, or `MILD_CARE`.
- **Differential Possibilities & Action Plan**: Returns ranked clinical possibilities, red-flag warnings, non-pharmacological self-care strategies, and recommended medical specialties (e.g., *Neurologist*, *Cardiologist*).
- **Persistent Symptom Journaling**: Records all triage encounters into MongoDB/PostgreSQL for longitudinal doctor consultations.

### 3. AI Medical Report & Biomarker Extractor
- **Direct PDF Upload & Ingestion**: Users can upload blood panels, lipid profiles, metabolic tests, and diagnostic summaries (PDF format).
- **Automated Text & Table Extraction**: Uses native PDF extraction pipelines to isolate quantitative biomarkers (`HbA1c`, `Total Cholesterol`, `HDL/LDL`, `TSH`, `Creatinine`, `WBC`).
- **Clinical vs. Patient Explanations**: Converts complex laboratory nomenclature into clear, patient-friendly explanations.
- **Color-Coded Risk Flags**: Automatically classifies each biomarker into `OPTIMAL`, `BORDERLINE`, or `CRITICAL` with follow-up inquiry suggestions for physicians.

### 4. Dynamic Nutrition & Caloric Planner
- **Targeted Macronutrient Profiles**: Calculates daily caloric targets (BMR + TDEE) and splits into Protein, Carbohydrates, and Healthy Fats.
- **Dietary Restriction Filters**: Fully customizable for *Vegetarian*, *Vegan*, *Keto*, *Paleo*, *Halal*, *Low-FODMAP*, *Gluten-Free*, and allergy exclusion lists (Peanuts, Dairy, Shellfish, etc.).
- **Meal-by-Meal Schedules**: Generates detailed breakfasts, lunches, dinners, and healthy snacks with ingredients, portion sizes, preparation notes, and nutritional benefits.

### 5. Personalized Fitness & Workout Engine
- **Goal-Adaptive Regimens**: Calibrated for *Weight Loss*, *Hypertrophy (Muscle Gain)*, *Cardiovascular Endurance*, *Functional Mobility*, or *Stress Reduction*.
- **Multi-Level Progression**: Accommodates *Beginner*, *Intermediate*, and *Advanced* fitness levels with customizable weekly split frequencies (3 to 6 days/week).
- **Safety First**: Incorporates warmup protocols, active recovery days, hydration guidance, and biomechanical posture cues to prevent musculoskeletal injuries.

### 6. Predictive Wellness & Mental Health Suite
- **Stress & Burnout Index**: Integrates resting physiological strain with logged sleep metrics and lifestyle stress indicators.
- **Interactive Breathing Guide**: Real-time animated **4-7-8 Box Breathing** exercise widget for parasympathetic nervous system activation.
- **Habit Tracking & Streaks**: Monitors daily hydration goals, movement milestones, sleep targets, and mindfulness minutes.

### 7. Empathetic Conversational Health Assistant
- **24/7 Context-Aware AI Chat**: Direct conversational interface powered by local AI.
- **Profile-Grounded Advice**: The agent maintains awareness of the patient's age, conditions, active medications, and logged vitals without requiring repeated prompts.
- **Strict Safety Boundaries**: Rigorously tuned to never hallucinate prescriptive medication dosages and always display triage disclaimers when red flags appear.

---

## 🏗️ System Architecture & SOA Principles

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Presentation_Layer [Presentation Layer (Frontend)]
        WebClient["React 18 + Vite + TypeScript Client<br/>Tailwind CSS & Lucide Icons (:5173)"]
    end

    subgraph Edge_Routing [Edge Ingress & Governance]
        Gateway["Spring Cloud Gateway (:8080)<br/>• Unified Reverse Proxy<br/>• Global CORS & Secure Headers<br/>• Path-Based Dynamic Routing<br/>• Client Decoupling"]
        Eureka["Netflix Eureka Service Registry (:8761)<br/>• Dynamic Heartbeat & Discovery<br/>• Client-Side Load Balancing"]
    end

    subgraph Core_Microservices [Business Microservice Cluster]
        AuthSvc["Auth Service (:8081)<br/>• BCrypt Password Hashing<br/>• Stateless JWT Issuer (HS384)"]
        UserSvc["User & Twin Service (:8082)<br/>• Profile & Biometric Ledger<br/>• Digital Health Twin Aggregator"]
        ReportSvc["Report Service (:8084)<br/>• PDF Document Storage<br/>• Binary Metadata Repository"]
        AISvc["AI Analysis Service (:8085)<br/>• PDF Parsing & Extraction<br/>• Symptom Triage Management"]
        NutFitSvc["Nutrition & Fitness (:8086)<br/>• Diet Plan Generation<br/>• Workout Routine Planner"]
        WellSvc["Wellness Service (:8087)<br/>• Predictive Wellness Scoring<br/>• Habit & Mindfulness Tracker"]
    end

    subgraph AI_Intelligence [Agentic AI Layer]
        AIAgent["Python FastAPI AI Service (:8000)<br/>• Modular Domain Agents<br/>• Structured JSON Synthesizer<br/>• Multi-turn Memory Engine"]
        OllamaEngine["Local Ollama LLM (:11434)<br/>• Model: qwen2.5:7b<br/>• Zero Cloud Quota & 100% Privacy"]
        GeminiEngine["Google Gemini Flash<br/>(Optional Cloud Fallback)"]
    end

    subgraph Polyglot_Data [Polyglot Persistence Layer]
        PostgresDB[("PostgreSQL 15<br/>(Relational ACID)<br/>Users, Plans, Daily Metrics")]
        MongoDB[("MongoDB 6.0<br/>(Document Store)<br/>Medical Reports & History")]
        RedisDB[("Redis 7.0<br/>(In-Memory Cache)<br/>User Twin Profile State")]
    end

    %% Routing
    WebClient -->|HTTP / REST / JWT| Gateway
    Gateway <-->|Service Lookup| Eureka
    
    Gateway -->|/api/auth/**| AuthSvc
    Gateway -->|/users/**, /api/health/**| UserSvc
    Gateway -->|/api/reports/**| ReportSvc
    Gateway -->|/api/analysis/**| AISvc
    Gateway -->|/api/nutrition/**, /api/fitness/**| NutFitSvc
    Gateway -->|/api/wellness/**| WellSvc

    %% Service to Eureka
    AuthSvc -.->|Heartbeat| Eureka
    UserSvc -.->|Heartbeat| Eureka
    ReportSvc -.->|Heartbeat| Eureka
    AISvc -.->|Heartbeat| Eureka
    NutFitSvc -.->|Heartbeat| Eureka
    WellSvc -.->|Heartbeat| Eureka

    %% Inter-service / AI
    UserSvc -->|Digital Twin Aggregation| AIAgent
    AISvc -->|Symptom & Report Analysis| AIAgent
    NutFitSvc -->|Diet & Fitness Generation| AIAgent
    WellSvc -->|Wellness Insights| AIAgent

    AIAgent -->|Default Provider| OllamaEngine
    AIAgent -.->|Fallback Provider| GeminiEngine

    %% Persistence mappings
    AuthSvc --> PostgresDB
    UserSvc --> PostgresDB
    UserSvc --> RedisDB
    NutFitSvc --> PostgresDB
    WellSvc --> PostgresDB
    ReportSvc --> MongoDB
    AISvc --> MongoDB
```

---

### SOA Design Principles Applied

HealthVerse AI is rigorously architected around foundational Service-Oriented Architecture and microservice design patterns:

1. **Standardized Service Contracts**: All microservices interact via uniform RESTful HTTP/JSON interfaces documented with explicit DTO request/response schemas.
2. **Service Loose Coupling**: Microservices maintain zero compile-time dependencies on one another. Inter-service coordination occurs dynamically through Spring Cloud Gateway and Eureka Discovery or via asynchronous REST integrations.
3. **Service Abstraction & Encapsulation**: Internal business logic, persistence entities, and database dialects are entirely encapsulated behind microservice boundaries.
4. **Service Autonomy & Independent Deployability**: Each microservice runs in its own lightweight Docker container with isolated runtime dependencies, lifecycle management, and horizontal scalability.
5. **Polyglot Persistence**: Storage engines are matched to the specific data domain:
   - Relational structured data (identities, daily metrics, structured plans) in **PostgreSQL**.
   - Flexible, schema-less medical records and clinical reports in **MongoDB**.
   - Ultra-low latency transient twin calculations in **Redis**.
6. **Stateless Service Operations**: Microservices do not store server-side HTTP sessions. Authentication state is transferred per-request using cryptographically verified JSON Web Tokens (JWT).

---

### Microservices Catalog & Port Allocation

| Service Identifier | Technology | Local Port | Container Name | Storage & Downstream Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **`eureka-server`** | Spring Boot / Eureka | `8761` | `healthverse-discovery-server` | None (In-memory Service Registry) |
| **`api-gateway`** | Spring Cloud Gateway | `8080` | `healthverse-api-gateway` | Eureka (`:8761`) |
| **`auth-service`** | Spring Boot 3.3.4 | `8081` | `healthverse-auth-service` | PostgreSQL (`:5432`) |
| **`user-service`** | Spring Boot 3.3.4 | `8082` | `healthverse-user-service` | PostgreSQL (`:5432`), Redis (`:6379`), AI Agent (`:8000`) |
| **`report-service`** | Spring Boot 3.3.4 | `8084` | `healthverse-report-service` | MongoDB (`:27017`) |
| **`ai-analysis-service`** | Spring Boot 3.3.4 | `8085` | `healthverse-ai-analysis-service` | MongoDB (`:27017`), AI Agent (`:8000`) |
| **`nutrition-fitness-service`** | Spring Boot 3.3.4 | `8086` | `healthverse-nutrition-fitness-service`| PostgreSQL (`:5432`), AI Agent (`:8000`) |
| **`wellness-service`** | Spring Boot 3.3.4 | `8087` | `healthverse-wellness-service` | PostgreSQL (`:5432`), AI Agent (`:8000`) |
| **`ai-agent-service`** | Python 3.11 / FastAPI | `8000` | `healthverse-ai-agent-service` | Local Ollama (`:11434`) / Gemini API |
| **`frontend`** | React 18 / Vite / TS | `5173` | (Host / Dev Server) | API Gateway (`:8080`) |
| **PostgreSQL Database** | PostgreSQL 15 Alpine | `5432` | `healthverse-postgresql` | Persistent Volume `postgres_data` |
| **MongoDB Database** | MongoDB 6.0 | `27017` | `healthverse-mongodb` | Persistent Volume `mongodb_data` |
| **Redis Cache** | Redis 7.0 Alpine | `6379` | `healthverse-redis` | Persistent Volume `redis_data` |
| **Ollama LLM Engine** | Ollama Engine | `11434` | (Host Native / Docker Internal) | Local Model Weights (`qwen2.5:7b`) |

---

## 🧠 Agentic AI Layer Architecture

### Unified Local-First Inference Pipeline

HealthVerse AI introduces a centralized, high-efficiency AI abstraction layer (`ai-agents/services/ai_provider.py`) engineered to eliminate cloud API bottlenecks, latency variability, and privacy risks.

```
       [ Microservice Request (JSON Payload) ]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │  AIProvider (FastAPI Core :8000) │
        └──────────────────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        ▼                                  ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│  PRIMARY: Ollama (Local)      │  │  FALLBACK: Google Gemini API  │
│  Model: qwen2.5:7b            │  │  Model: gemini-1.5-flash      │
│  • Zero API Cost              │  │  • Cloud Resilience           │
│  • Complete Patient Privacy   │  │  • High-throughput burst     │
│  • Deterministic JSON Mode    │  │  • Off-host failover          │
└───────────────────────────────┘  └───────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │  Schema Validation & Sanitizer   │
        │  • Regex JSON Extractor          │
        │  • Pydantic Schema Enforcement   │
        │  • Graceful Domain Fallback      │
        └──────────────────────────────────┘
                         │
                         ▼
      [ Structured Domain Response to Backend ]
```

### Agent Delegation Topology

1. **Symptom Triage Agent (`/api/v1/agents/health/analyze`)**:
   - Analyzes raw textual symptom descriptions.
   - Evaluates vital signs and known medical history.
   - Determines clinical urgency, differential categories, and safe triage advice.
2. **Medical Report Agent (`/api/v1/agents/report/analyze`)**:
   - Parses OCR/extracted lab text.
   - Maps biomarkers against standard reference intervals (Wintrobe hematology, CDC metabolic guidelines).
   - Generates layman summaries and clinical validation bullet points.
3. **Nutritional Synthesis Agent (`/api/v1/agents/diet/generate`)**:
   - Calculates macronutrient splits from physical characteristics.
   - Synthesizes 7-day meal plans matching micro-preferences and allergen restrictions.
4. **Physical Training Agent (`/api/v1/agents/fitness/generate`)**:
   - Builds progressive overload routines structured by muscle groups.
   - Embeds warm-up, cool-down, and injury mitigation cues.
5. **Wellness & Cognitive Recovery Agent (`/api/v1/agents/wellness/generate`)**:
   - Aggregates stress factors, sleep efficiency, and physical strain.
   - Suggests mindfulness exercises, circadian realignment, and recovery protocols.
6. **Digital Health Twin Agent (`/api/v1/agents/twin/analyze`)**:
   - Performs composite multi-domain scoring (0–100 scale).
   - Generates personalized health trajectories, risk alerts, and top actionable recommendations.
7. **Conversational Assistant Agent (`/api/v1/agents/chat`)**:
   - Real-time multi-turn conversational agent with user context memory.

---

## 💻 Technology Stack Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ React 18.2        │ TypeScript 5.2    │ Vite 5.2          │ Tailwind CSS 3.4│
│ Lucide React      │ Recharts (Charts) │ Axios 1.6         │ Framer Motion   │
├───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│                             BACKEND SERVICES                                │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Spring Boot 3.3.4 │ Java 21 LTS       │ Spring Cloud GW   │ Netflix Eureka  │
│ Spring Security   │ Spring Data JPA   │ Spring Data Mongo │ JJWT 0.12.6     │
├───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│                             INTELLIGENCE & AI                               │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Python 3.11+      │ FastAPI 0.110+    │ Pydantic v2       │ Aiohttp / Async │
│ Ollama (qwen2.5)  │ Google Gemini API │ PyPDF / PDFBox    │ Uvicorn ASGI    │
├───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│                         INFRASTRUCTURE & STORAGE                            │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ PostgreSQL 15     │ MongoDB 6.0       │ Redis 7.0 Alpine  │ Docker & Compose│
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

---

## 🗄️ Database Schema & Polyglot Persistence

### PostgreSQL Relational Entities (Auth, User, Nutrition, Fitness, Wellness)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│          users          │       │     health_profiles     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK, BIGSERIAL)      │◄──┐   │ id (PK, BIGSERIAL)      │
│ email (VARCHAR, UNIQUE) │   └───┤ user_id (FK, UNIQUE)    │
│ password (VARCHAR)      │       │ age, gender             │
│ name (VARCHAR)          │       │ height, weight          │
│ role (VARCHAR)          │       │ lifestyle, goals        │
│ created_at (TIMESTAMP)  │       │ allergies, conditions   │
└─────────────────────────┘       │ sleep_pattern           │
                                  │ dietary_preference      │
                                  └─────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│     daily_health_data   │       │     nutrition_plans     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK, BIGSERIAL)      │       │ id (PK, BIGSERIAL)      │
│ user_id (FK)            │       │ user_id (FK)            │
│ date (DATE)             │       │ daily_calories          │
│ steps (INT)             │       │ protein_g, carbs_g      │
│ sleep_hours (FLOAT)     │       │ fat_g                   │
│ hydration_liters (FLOAT)│       │ meals (JSONB/TEXT)      │
│ heart_rate (INT)        │       │ created_at (TIMESTAMP)  │
│ weight (FLOAT)          │       └─────────────────────────┘
└─────────────────────────┘
```

### MongoDB Document Collections (Reports & Clinical AI)

```javascript
// medical_reports Collection
{
  "_id": ObjectId("65e4f..."),
  "userId": 4,
  "fileName": "HealthVerse_AI_Sample_Medical_Report.pdf",
  "fileType": "application/pdf",
  "reportType": "GENERAL_BLOOD_TEST",
  "reportDate": "2026-10-28",
  "uploadDate": ISODate("2026-10-28T18:00:00Z"),
  "description": "Routine annual comprehensive metabolic panel",
  "fileData": BinData(0, "..."), // Raw PDF binary
  "status": "ANALYZED"
}

// analysis_reports Collection
{
  "_id": ObjectId("65e5a..."),
  "reportId": "65e4f...",
  "userId": 4,
  "summary": "Comprehensive panel reveals optimal lipid balance with mildly elevated fasting glucose.",
  "keyFindings": [
    "Fasting Blood Sugar: 104 mg/dL (Borderline High)",
    "Hemoglobin: 14.8 g/dL (Normal)",
    "Total Cholesterol: 182 mg/dL (Optimal)"
  ],
  "biomarkers": [
    {"name": "Fasting Glucose", "value": "104", "unit": "mg/dL", "status": "ELEVATED", "referenceRange": "70-99"},
    {"name": "Total Cholesterol", "value": "182", "unit": "mg/dL", "status": "NORMAL", "referenceRange": "<200"}
  ],
  "recommendations": [
    "Reduce refined carbohydrate intake during evening meals.",
    "Schedule a fasting insulin and HbA1c re-test in 90 days."
  ],
  "consultSpecialist": "Endocrinologist / General Physician",
  "analyzedAt": ISODate("2026-10-28T18:05:00Z")
}
```

---

## 📡 End-to-End API Documentation

All client communications route through the **API Gateway** on port `8080`.

### 1. Authentication Service (`/api/auth`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user and receive signed JWT | No |
| `GET` | `/api/auth/validate` | Cryptographically validate active JWT | Yes (Bearer) |

<details>
<summary>👉 View Register & Login Payloads</summary>

```json
// POST /api/auth/register
{
  "email": "rgiridhar@gmail.com",
  "password": "giridhar@1234",
  "name": "R Giridhar"
}

// Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "rgiridhar@gmail.com",
    "name": "R Giridhar",
    "role": "USER"
  }
}
```
</details>

---

### 2. User & Digital Health Twin Service (`/users`, `/api/health`, `/api/health-twin`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | Retrieve personal demographic profile | Yes (Bearer) |
| `GET` | `/api/health/profile` | Retrieve detailed medical baseline | Yes (Bearer) |
| `PUT` | `/api/health/profile` | Upsert health profile & biometrics | Yes (Bearer) |
| `POST` | `/users/daily-data` | Log daily health telemetry (steps, sleep, etc.) | Yes (Bearer) |
| `GET` | `/users/daily-data/range` | Fetch metrics over a date range | Yes (Bearer) |
| `GET` | `/api/health-twin/comprehensive`| **Fetch Full Digital Health Twin State** | Yes (Bearer) |

<details>
<summary>👉 View Comprehensive Digital Twin Response</summary>

```json
// GET /api/health-twin/comprehensive
{
  "userId": 1,
  "name": "R Giridhar",
  "healthScore": 84,
  "healthScoreBreakdown": {
    "cardiovascular": 88,
    "metabolic": 82,
    "lifestyle": 85,
    "recovery": 81
  },
  "vitalMetrics": {
    "weight": 82.0,
    "bmi": 28.3,
    "heartRate": 72,
    "bloodPressure": "120/80"
  },
  "predictiveInsights": [
    "Cardiovascular endurance has improved by 6% over the last 14 days.",
    "Sleep irregularity detected mid-week; recommend fixing circadian sleep window."
  ],
  "adherenceRate": 91.5,
  "lastUpdated": "2026-10-28T23:55:00Z"
}
```
</details>

---

### 3. Medical Report Service (`/api/reports`)
| HTTP Method | Route | Description | Content-Type |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports/upload` | Upload PDF medical lab report | `multipart/form-data` |
| `GET` | `/api/reports` | List all uploaded reports for user | `application/json` |
| `GET` | `/api/reports/{id}` | Retrieve report metadata | `application/json` |
| `GET` | `/api/reports/{id}/file` | Download original PDF binary | `application/pdf` |
| `DELETE`| `/api/reports/{id}` | Remove medical report | `application/json` |

---

### 4. AI Analysis Service (`/api/analysis`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analysis/reports/{reportId}/analyze` | Trigger AI extraction on uploaded report | Yes (Bearer) |
| `GET` | `/api/analysis/reports/{reportId}` | Get structured analysis report & biomarkers | Yes (Bearer) |
| `POST` | `/api/analysis/symptoms/analyze` | Perform clinical symptom triage | Yes (Bearer) |
| `GET` | `/api/analysis/symptoms/history` | Retrieve user's logged symptom history | Yes (Bearer) |

---

### 5. Nutrition & Fitness Service (`/api/nutrition`, `/api/fitness`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/nutrition/plans/generate` | Generate custom nutrition plan via AI | Yes (Bearer) |
| `GET` | `/api/nutrition/plans/latest` | Retrieve current active nutrition plan | Yes (Bearer) |
| `POST` | `/api/fitness/plans/generate` | Generate customized workout plan via AI | Yes (Bearer) |
| `GET` | `/api/fitness/plans/latest` | Retrieve current active workout plan | Yes (Bearer) |

---

### 6. Wellness Service (`/api/wellness`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/wellness/plans/generate` | Generate holistic wellness plan | Yes (Bearer) |
| `GET` | `/api/wellness/plans/latest` | Retrieve latest wellness recommendations | Yes (Bearer) |
| `GET` | `/api/wellness/insights` | Retrieve real-time predictive wellness insights | Yes (Bearer) |

---

### 7. AI Agent Direct Engine (`:8000`)
| HTTP Method | Route | Functionality |
| :--- | :--- | :--- |
| `GET` | `/health` | Service status, active provider, model info |
| `POST` | `/api/v1/agents/chat` | Multi-turn contextual health conversation |
| `POST` | `/api/v1/agents/health/analyze`| Raw symptom analysis & urgency triage |
| `POST` | `/api/v1/agents/report/analyze`| Raw PDF text biomarker extraction |
| `POST` | `/api/v1/agents/diet/generate` | Custom macro and meal plan generator |
| `POST` | `/api/v1/agents/fitness/generate`| Exercise routine and progression generator |
| `POST` | `/api/v1/agents/twin/analyze` | Multi-source digital twin scoring |

---

## 📂 Repository Structure

```
HealthVerse-AI/
├── .github/                              # CI/CD Workflows & GitHub configurations
├── Review Presentations/                 # University Review PPTs & Milestone Slides
│   ├── README                            # Presentation directory info
│   └── SOA Project REVIEW-1.pptx         # Academic Review-1 Presentation Deck
├── SOA-Skill Evaluation/                 # Coursework Lab Implementations
│   ├── Experiment-1/                     # Restaurant & Order Microservices
│   └── Experiment-2/                     # API Gateway, Cart & Product Microservices
├── SOA_PROJECT_ABSTRACT.pdf              # Official University Project Abstract (KLH)
├── HealthVerse_AI_Sample_Medical_Report.pdf # Clinical lab sample PDF for testing
│
├── ai-agents/                            # Python FastAPI AI Agent Subsystem
│   ├── api/                              # Route endpoints
│   │   ├── chat_direct.py                # Conversational AI assistant endpoint
│   │   ├── diet.py                       # Nutrition & diet generation agent
│   │   ├── fitness.py                    # Workout & exercise generation agent
│   │   ├── health.py                     # Symptom analyzer & triage agent
│   │   ├── planning.py                   # Integrated wellness planning agent
│   │   ├── report.py                     # Medical PDF biomarker agent
│   │   ├── twin.py                       # Digital Health Twin scoring agent
│   │   └── wellness.py                   # Recovery & mental wellness agent
│   ├── config/                           # Environment & provider settings
│   ├── models/                           # Pydantic schemas (Request/Response DTOs)
│   ├── services/                         # Core execution services
│   │   └── ai_provider.py                # Unified Ollama / Gemini AI layer
│   ├── Dockerfile                        # Container recipe for AI Agent
│   ├── requirements.txt                  # Python runtime dependencies
│   ├── main.py                           # FastAPI application entrypoint
│   └── .env.example                      # Template for AI environment configuration
│
├── backend/                              # Spring Boot Multi-Module Microservices
│   ├── discovery-server/                 # Netflix Eureka Service Registry (:8761)
│   ├── api-gateway/                      # Spring Cloud Gateway (:8080)
│   ├── auth-service/                     # Identity, RBAC, JWT tokens (:8081)
│   ├── user-service/                     # Profiles, Daily Metrics & Twin (:8082)
│   ├── report-service/                   # Medical Report PDF Storage (:8084)
│   ├── ai-analysis-service/              # Clinical Triage & Report Analysis (:8085)
│   ├── nutrition-fitness-service/        # Diet & Fitness Planning Engine (:8086)
│   ├── wellness-service/                 # Predictive Insights & Habits (:8087)
│   ├── docker-compose.yml                # Master Docker orchestration file
│   ├── pom.xml                           # Root Maven Multi-Module build descriptor
│   ├── DEMO.md                           # Step-by-step presentation demonstration guide
│   └── .env.example                      # Master backend environment template
│
├── frontend/                             # React 18 + TypeScript Web Application
│   ├── public/                           # Static assets & favicon
│   ├── src/
│   │   ├── assets/                       # Branding logos and vector graphics
│   │   ├── components/                   # Reusable UI components & modals
│   │   │   ├── NutritionPreferencesModal.tsx # Diet customizer dialog
│   │   │   └── WellnessPreferencesModal.tsx  # Wellness preferences dialog
│   │   ├── context/                      # React Context providers (AuthContext)
│   │   ├── layouts/                      # App Shell (DashboardLayout, AuthLayout)
│   │   ├── pages/                        # Screen views
│   │   │   ├── Landing.tsx               # Product landing page & feature showcase
│   │   │   ├── Login.tsx                 # User authentication
│   │   │   ├── Register.tsx              # Account registration
│   │   │   ├── Dashboard.tsx             # Main biometric cockpit
│   │   │   ├── DigitalHealthTwin.tsx     # 3D/Interactive Digital Health Twin view
│   │   │   ├── SymptomAnalyzer.tsx       # Symptom checker & triage screen
│   │   │   ├── Reports.tsx               # PDF Report upload & biomarker inspector
│   │   │   ├── Nutrition.tsx             # AI meal planning & macro tracker
│   │   │   ├── Fitness.tsx               # Workout routines & exercise schedule
│   │   │   ├── Wellness.tsx              # Mental recovery, habits & breathing tool
│   │   │   ├── AIChat.tsx                # Conversational AI assistant chat
│   │   │   ├── HealthProfile.tsx         # Baseline medical profile management
│   │   │   └── Settings.tsx              # App preferences & account management
│   │   ├── services/                     # Axios API clients for each microservice
│   │   ├── types/                        # TypeScript type definitions & interfaces
│   │   ├── App.tsx                       # Main router configuration
│   │   └── main.tsx                      # Vite React DOM entrypoint
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── tailwind.config.js                # Tailwind styling configurations
│   ├── vite.config.ts                    # Vite build configuration
│   └── .env.example                      # Frontend environment template
│
├── seed_demo_user.py                     # Realistic 30-day health telemetry seeder
├── test_all_features.py                  # End-to-end automated API test suite
├── test_ai.py                            # Standalone AI provider connectivity test
├── deploy_ai.bat                         # Windows batch launch script for AI agents
├── .gitignore                            # Git exclusion rules
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 Installation & Quickstart Guide

### Option A: One-Click Docker Compose (Recommended)

This single command starts the entire system (Databases, Discovery Server, API Gateway, 6 Spring Microservices, and the Python AI Agent Service).

#### 1. Prerequisites
- **Docker Desktop** installed with Docker Compose enabled.
- **Ollama** installed on your host machine ([ollama.com/download](https://ollama.com/download)).

#### 2. Start Local Ollama Model
In a standard host terminal, pull the recommended model:
```bash
ollama run qwen2.5:7b
```
*(Ollama will run in the background on port `11434`)*.

#### 3. Configure Environment Variables
Copy the template files:
```bash
# In backend/
cp backend/.env.example backend/.env

# In ai-agents/
cp ai-agents/.env.example ai-agents/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

#### 4. Spin Up All Microservices
From the project root:
```bash
cd backend
docker compose up -d --build
```
*Verification*: Check container status with `docker compose ps`. Within 60–90 seconds, all microservices will be healthy and registered with Eureka.

#### 5. Launch the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

### Option B: Bare-Metal Local Development Setup

If developing individual services locally without full Docker containerization:

#### Step 1: Infrastructure Services
Spin up only the databases and cache via Docker:
```bash
docker run -d --name healthverse-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=healthverse postgres:15-alpine
docker run -d --name healthverse-mongo -p 27017:27017 mongo:6
docker run -d --name healthverse-redis -p 6379:6379 redis:7-alpine
```

#### Step 2: Launch Eureka Discovery Server
```bash
cd backend/discovery-server
./mvnw spring-boot:run
```
*(Available at `http://localhost:8761`)*

#### Step 3: Launch Spring Cloud API Gateway
```bash
cd backend/api-gateway
./mvnw spring-boot:run
```
*(Listening on `http://localhost:8080`)*

#### Step 4: Launch Core Spring Boot Microservices
Open separate terminals for each service:
```bash
# Terminal 1: Auth Service (Port 8081)
cd backend/auth-service && ./mvnw spring-boot:run

# Terminal 2: User Service (Port 8082)
cd backend/user-service && ./mvnw spring-boot:run

# Terminal 3: Report Service (Port 8084)
cd backend/report-service && ./mvnw spring-boot:run

# Terminal 4: AI Analysis Service (Port 8085)
cd backend/ai-analysis-service && ./mvnw spring-boot:run

# Terminal 5: Nutrition & Fitness Service (Port 8086)
cd backend/nutrition-fitness-service && ./mvnw spring-boot:run

# Terminal 6: Wellness Service (Port 8087)
cd backend/wellness-service && ./mvnw spring-boot:run
```

#### Step 5: Launch Python AI Agent Service
```bash
cd ai-agents
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*(Listening on `http://localhost:8000`)*

#### Step 6: Launch React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Database & Demo Seeding

To experience the full power of the **Digital Health Twin** with realistic 30-day biometrics, historical blood pressures, steps, and caloric trends, execute the automated seeding script:

```bash
python seed_demo_user.py
```

### Seeded Demo Credentials:
- **Email**: `rgiridhar@gmail.com`
- **Password**: `giridhar@1234`
- **Name**: `R Giridhar`
- **Generated Data**:
  - Demographics: Age 20, Male, 170 cm, 82 kg.
  - 30 consecutive days of dynamic telemetry (steps fluctuating between 6,000–12,500, sleep logs between 6.5–8.5 hours, hydration between 2.0–3.5 L, resting heart rates).
  - Pre-seeded health goals and dietary preferences.

---

## 🔬 Automated Verification & Testing

HealthVerse AI includes automated end-to-end integration test suites to validate that all services communicate through the Gateway correctly:

### 1. Full Features Automated Suite
```bash
python test_all_features.py
```
*What this validates*:
1. Authenticates against `/api/auth/login`.
2. Generates a personalized wellness plan via `/api/wellness/plans/generate`.
3. Synthesizes a structured workout routine via `/api/fitness/plans/generate`.
4. Creates a macronutrient nutrition regimen via `/api/nutrition/plans/generate`.
5. Uploads a sample PDF report to `/api/reports/upload` and triggers AI biomarker extraction via `/api/analysis/reports/{id}/analyze`.

### 2. Standalone AI Agent Service Test
```bash
python test_ai.py
```
*Validates*: Direct HTTP connectivity to the local Ollama LLM / Gemini provider and verifies JSON completion schemas.

---

## 🔒 Security, Privacy & Ethical Compliance

### 1. Data Sovereignty & Local AI Execution
- Traditional healthcare applications transmit sensitive Protected Health Information (PHI) to public cloud APIs, risking unauthorized third-party telemetry and regulatory non-compliance.
- HealthVerse AI routes all clinical reasoning and biomarker extraction through a **local Ollama container (`qwen2.5:7b`)**. Patient health parameters and medical PDF text **never leave the user's host infrastructure**.

### 2. Stateless Token-Based Security
- Cryptographic JWT tokens signed with SHA-384/256 algorithms.
- Custom `JwtAuthenticationFilter` on all resource services extracts authenticated identities directly from claims, mitigating Insecure Direct Object Reference (IDOR) vulnerabilities.
- Password hashes are computed with multi-round BCrypt salt derivation.

### 3. OWASP Hardening & Network Isolation
- Spring Cloud Gateway acts as a reverse-proxy shield, preventing direct external access to internal microservice ports (`8081–8087`).
- Sensitive Spring Boot Actuator endpoints (`/actuator/env`, `/actuator/heapdump`) are strictly restricted.
- Granular Cross-Origin Resource Sharing (CORS) configurations safeguard against cross-site script request tampering.

### 4. Medical Ethics & Disclaimer
> [!IMPORTANT]
> **HealthVerse AI is an academic and demonstrative decision-support ecosystem. It does NOT provide formal medical diagnoses, clinical treatment prescriptions, or emergency healthcare dispatch.**
> All AI-generated outputs—including the Symptom Analyzer, Biomarker Extractor, and Nutrition Plans—are provided solely for informational and wellness awareness purposes. Users must always seek professional counsel from licensed healthcare practitioners before making clinical or medical decisions.

---

## 🗺️ Future Roadmap

- [ ] **Wearable IoT Stream Ingestion**: Direct MQTT/Bluetooth pairing with Apple HealthKit, Google Health Connect, and Garmin smartwatches.
- [ ] **DICOM Medical Imaging Agent**: Integration of lightweight vision models for chest X-ray and MRI preliminary anomaly detection.
- [ ] **Federated Learning for Risk Models**: Decentralized on-device training for early cardiovascular anomaly prediction without raw data pooling.
- [ ] **FHIR / HL7 Interoperability**: Exporting user Digital Health Twin records to international FHIR-compliant electronic health record (EHR) systems.
- [ ] **Voice-Activated Health Interface**: Hands-free conversational triage using local Whisper speech-to-text models.

---

## 👥 Authors & Acknowledgments

Developed as a flagship **Service-Oriented Architecture & Microservices** initiative at **KL University (KLH)**, Department of Computer Science & Engineering.

- **P. Pranathi** — *Architecture, Microservices, Core Backend Services* — ID: `2420030043`
- **R. L. S. Giridhar** — *Agentic AI Architecture, Gateway, Frontend & Full-Stack Integration* — ID: `2420030171`
- **D. Krishna Chaitanya** — *Data Persistence, Analytics & Quality Assurance* — ID: `2420090077`

Special gratitude to **Dr. Srikanth Cherukuvada** for his mentorship and guidance in Service-Oriented Architecture, enterprise patterns, and distributed system design.

---

<div align="center">
  <sub>HealthVerse AI • Built with ❤️ for Predictive Health & Wellness • KL University 2026-2027</sub>
</div>
