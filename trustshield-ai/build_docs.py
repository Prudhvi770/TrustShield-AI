import os

root_dir = r'C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai'

# 1. requirements.txt
reqs = """fastapi>=0.115.0
uvicorn>=0.32.0
pydantic>=2.9.0
sqlalchemy>=2.0.35
rank-bm25>=0.2.2
reportlab>=4.2.0
pyjwt>=2.9.0
bcrypt>=4.2.0
python-multipart>=0.0.12
requests>=2.32.0
"""

# 2. .env.example
env_example = """# TrustShield AI Configuration
APP_NAME=TrustShield AI
APP_VERSION=1.0.0
DATABASE_URL=sqlite:///./trustshield.db

# Dual-LLM Model Endpoints (Optional for live LLM providers like Ollama/Groq)
QWEN_MODEL=qwen3-8b
QWEN_API_KEY=
QWEN_API_BASE=

LLAMA_MODEL=llama-3.1-8b
LLAMA_API_KEY=
LLAMA_API_BASE=

# Knowledge Base & Vector Store
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_PATH=./chroma_db
TOP_K_EVIDENCE=5

# Security
JWT_SECRET=trustshield-super-secret-key-2026
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEMO_MODE=true
"""

# 3. Dockerfile
dockerfile = """# Multi-stage build for TrustShield AI
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PYTHONPATH=/app/backend
WORKDIR /app/backend
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# 4. docker-compose.yml
compose = """version: '3.8'
services:
  trustshield-app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEMO_MODE=true
      - DATABASE_URL=sqlite:///./trustshield.db
    volumes:
      - trustshield_data:/app/backend
volumes:
  trustshield_data:
"""

# 5. README.md
readme = """# 🛡️ TrustShield AI — Multi-LLM Claim Verification System

TrustShield AI is an enterprise-grade claim verification and digital risk detection platform engineered to cross-examine financial messages, government scheme claims, SMS forwards, and social media text against authentic regulatory repositories (RBI, SEBI, Government of India gazettes).

## 🌟 Key Features

1. **Two-LLM Architecture**:
   - **Primary Model (Qwen3-8B)**: Evidence-grounded reasoning, structured claim interpretation, and preliminary verdict generation.
   - **Independent Reviewer (Llama 3.1 8B)**: Adversarial audit checking for unsupported conclusions, hallucinations, and reviewer agreement.
2. **Evidence-First Decision Engine (`decision_engine.py`)**:
   - Regulatory records have absolute priority over LLM assumptions.
   - Strictly outputs `UNVERIFIABLE` whenever matching authentic evidence is insufficient. Never invents sources or circulars.
3. **Deep NLP Pipeline**:
   - Text preprocessing with fraud marker preservation (`urgent`, `₹50,000`, `Aadhaar`, `OTP`, `KYC`).
   - POS Tagging table (`WORD | POS | LEMMA`).
   - N-Grams frequency analysis (Unigrams, Bigrams, Trigrams).
   - Named Entity Recognition (`ORGANIZATION`, `MONEY`, `GPE`, `DATE`, `PRODUCT`).
   - Dependency Parsing & Subject-Verb-Object (SVO) relationship graph.
   - Claim extraction distinguishing verifiable factual claims from opinions.
4. **Multi-Signal Risk Classifiers**:
   - BERT / RoBERTa Fake News Risk.
   - FinBERT Financial Scam Detector.
   - Spam Classifier (TF-IDF + N-Grams).
   - Phishing & Urgency Detector.
   - Shannon Entropy & Subdomain URL Analyzer.
5. **Hybrid Evidence Retrieval & Official Ground Truth**:
   - BM25 keyword retrieval + Sentence-BERT semantic similarity ranking.
   - Pre-indexed repository of RBI circulars, SEBI advisories, and PIB fact checks.
   - Dynamic upload endpoint for PDF/TXT document ingestion.
6. **Executive Dashboard & Verification History**:
   - Spline curve verification volume tracker.
   - Threat category breakdown chart.
   - History viewer with search, filtering, and audit dossier management.
7. **Explainable AI (XAI)**:
   - Token-level SHAP/LIME feature importance highlighting influential risk tokens.
8. **Official PDF Reports**:
   - Downloadable multi-page dossier generated with ReportLab.
9. **Authentication System ("with sign in page")**:
   - Dedicated Sign In & Registration page (`/signin`) + interactive modal.
   - Instant 1-Click Evaluation Login (Analyst Mode & Auditor Mode).

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run the Full-Stack Application
The backend automatically serves the built frontend on port 8000:

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Open your browser at **http://127.0.0.1:8000**!

### 2. (Optional) Run Vite Dev Server for Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **http://localhost:3000**.

---

## 👥 Demo Accounts
- **Analyst Role**: `analyst@trustshield.ai` / `trustshield123`
- **Auditor Role**: `auditor@trustshield.ai` / `audit2026`
- **Instant Access**: Click **"Analyst Mode"** or **"Auditor Mode"** on the sign-in modal for 1-click evaluation access.
"""

with open(os.path.join(root_dir, 'requirements.txt'), 'w', encoding='utf-8') as f:
    f.write(reqs)
with open(os.path.join(root_dir, '.env.example'), 'w', encoding='utf-8') as f:
    f.write(env_example)
with open(os.path.join(root_dir, 'Dockerfile'), 'w', encoding='utf-8') as f:
    f.write(dockerfile)
with open(os.path.join(root_dir, 'docker-compose.yml'), 'w', encoding='utf-8') as f:
    f.write(compose)
with open(os.path.join(root_dir, 'README.md'), 'w', encoding='utf-8') as f:
    f.write(readme)

print("Project documentation, Dockerfile, docker-compose, and requirements written successfully!")
