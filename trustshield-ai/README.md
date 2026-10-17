# 🛡️ TrustShield AI — Multi-LLM Claim Verification System

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
