# TrustSphere AI

## Implementation status (read this first)

This repo is a TanStack Start + React + MySQL app, not the FastAPI/React
split described in the master prompt below — the master prompt was used as
the product spec, and this codebase is the actual implementation against
that spec within what's realistically buildable without GPU-hosted
transformer models.

The project originally ran on Supabase/Postgres and was migrated to plain
MySQL via Drizzle ORM — see `src/db/schema.ts` and `src/db/client.ts`.
Postgres Row Level Security doesn't have a MySQL equivalent, so session
scoping is now done explicitly in each API route (filtering by
`session_id`) instead of by the database.

**What's real and running:**
- Full pipeline UI: input → preprocessing → NLP (tokens/POS/n-grams/NER/dependencies) → claim extraction → risk detection → retrieval → verification → dashboard/history/reports (`src/routes/api/analyze.ts`, `src/components/TrustShieldApp.tsx`)
- Deterministic risk heuristics for fake-news/financial-scam/spam/phishing/URL signals (clearly labeled "demo" heuristics, not BERT/FinBERT — see below)
- A real trusted-document knowledge base: upload → text extraction (TXT, DOCX via `mammoth`) → chunking → storage (`src/routes/api/upload-document.ts`, `src/lib/document-extract.ts`)
- Real hybrid-ish retrieval: BM25 + a bounded token-overlap proxy over your indexed chunks — no vector DB/embeddings model, so nothing here is presented as Sentence-BERT (`src/lib/retrieval.ts`)
- Evidence is only ever shown if it was actually retrieved from your indexed documents — never fabricated
- Optional Qwen3-8B integration via any OpenAI-compatible `/chat/completions` endpoint, only active when configured, with a hard guard that forces `UNVERIFIABLE` if the model doesn't cite retrieved evidence ids (`src/lib/qwen.ts`)
- Optional Llama 3.1 8B integration as an independent reviewer of Qwen3-8B's verdict (same OpenAI-compatible endpoint shape, only called once Qwen has produced a verdict), with the same evidence-citation guard rail (`src/lib/llama.ts`)
- A decision engine that reconciles the two verdicts — agree-and-evidence-backed → that verdict; disagree → an evidence-consistency check decides, or `UNVERIFIABLE` if evidence is ambiguous; evidence always outranks either model (`src/lib/decision-engine.ts`)
- History (view + delete), Evidence ledger, Knowledge Base admin (list + delete), and a live Settings page reporting actual Qwen/Llama/database configuration (`GET /api/status`)

**What's intentionally not implemented** (would require GPU-hosted models / paid APIs this environment can't run): real BERT/RoBERTa/FinBERT classifiers, Sentence-BERT embeddings, FAISS/ChromaDB, SHAP/LIME. The UI is honest about this — model panels show "demo heuristic" instead of claiming a real classifier ran.

**Environment variables** (`.env`, see MODULE 36 below for the full list):
```
DATABASE_URL=mysql://user:password@host:3306/trustsphere
QWEN_API_URL=      # any OpenAI-compatible /chat/completions endpoint
QWEN_API_KEY=
QWEN_MODEL=qwen3-8b
LLAMA_API_URL=     # independent reviewer, same OpenAI-compatible shape
LLAMA_API_KEY=
LLAMA_MODEL=llama-3.1-8b
```
Without `DATABASE_URL` (or the discrete `MYSQL_HOST`/`MYSQL_USER`/`MYSQL_PASSWORD`/`MYSQL_DATABASE` vars), the app still runs in Demo Mode (results aren't persisted). Without `QWEN_API_URL`/`QWEN_API_KEY`, claims stay `UNVERIFIABLE` and the UI says so — this is the "never fake AI outputs" rule from the spec, not a bug. `LLAMA_API_URL`/`LLAMA_API_KEY` are independent of that: Llama only runs once Qwen has produced a verdict, and without it the decision engine falls back to Qwen's verdict alone (still subject to the evidence-consistency check), with the UI clearly showing the reviewer as unavailable.

**Database setup:** run `drizzle/0000_init.sql` against your MySQL database, or run `npm run db:push` once `DATABASE_URL` is set to let Drizzle create the tables for you.

**Setup note:** dependencies changed (Supabase client swapped for `drizzle-orm` + `mysql2`), so `bun.lock` was removed rather than left stale — run `bun install` (or `npm install`) once after pulling this to generate a fresh lockfile.

---

MASTER PROMPT — DEVELOP TRUSTSHIELD AI

Build a complete full-stack AI application called TrustShield AI.

TrustShield AI is an AI-powered claim verification and digital-risk detection platform. The application accepts news, SMS, WhatsApp messages, emails, Telegram/social-media text, and URLs. It analyzes the content using NLP techniques, extracts factual claims, detects multiple types of risk, retrieves evidence from trusted sources using hybrid search and RAG, and uses Qwen3-8B as the main LLM to generate an evidence-grounded verification result.

The application must be functional, modular, responsive, professional, and suitable for an academic project demonstration.

1. CORE OBJECTIVE

The application must NOT simply classify content as "Fake" or "Real".

Instead, it must follow this pipeline:

USER INPUT
→ TEXT PREPROCESSING
→ NLP ANALYSIS
→ CLAIM EXTRACTION
→ RISK DETECTION
→ TRUSTED EVIDENCE RETRIEVAL
→ HYBRID SEARCH
→ RAG
→ QWEN3-8B
→ CLAIM VERIFICATION
→ EXPLAINABLE AI
→ RISK SUMMARY
→ DASHBOARD

The final result should contain:

Extracted claim

Claim type

Verification verdict

Evidence

Trusted sources

Fake-news risk

Financial-scam risk

Spam risk

Phishing risk

URL risk

Overall risk

Explanation

Model confidence

Retrieved documents

Reasoning summary

Downloadable verification report

Use three possible verification outcomes:

SUPPORTED

REFUTED

UNVERIFIABLE

Do NOT force every claim into TRUE/FALSE.

2. IMPORTANT MODEL ARCHITECTURE

Use Qwen3-8B as the primary LLM.

Qwen3-8B is responsible for:

Evidence-grounded reasoning

Claim verification

Explanation generation

Risk explanation

Result summarization

Natural-language responses

Do NOT use Qwen3-8B as the only model for the entire system.

Use specialized NLP/model components for their appropriate tasks.

Recommended architecture:

NLP:

spaCy

NLTK

Classification:

BERT/RoBERTa for fake-news classification

FinBERT for financial-risk detection

TF-IDF + Logistic Regression/SVM for spam detection

Semantic retrieval:

Sentence-BERT

Keyword retrieval:

BM25

Vector database:

FAISS or ChromaDB

Generation/reasoning:

Qwen3-8B

Explainability:

SHAP/LIME

Backend:

Python

FastAPI

Frontend:

React

TypeScript

Tailwind CSS

Deployment:

Docker

3. COMPLETE MODULES

Implement the application using these modules.

MODULE 1 — INPUT & DATA COLLECTION

Create an input interface supporting:

News

SMS

WhatsApp

Email

Telegram

Social media

URL

The user should be able to paste text into a large input box.

Also provide a separate URL input.

Example:

"URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details."

Buttons:

[Analyze Content]
[Clear]

When Analyze Content is clicked, send the data to the backend.

MODULE 2 — TEXT PREPROCESSING

Implement:

Text cleaning

Sentence segmentation

Tokenization

Stopword handling

Lemmatization

Regex processing

Normalization

IMPORTANT:

Do not remove suspicious words such as:

urgent

click

verify

OTP

free

guaranteed

reward

investment

These words may be useful for risk detection.

Display preprocessing results in the UI.

Example:

RAW TEXT:
"URGENT!!! RBI has announced ₹50,000..."

TOKENS:
["urgent", "RBI", "has", "announced", "₹50,000", ...]

LEMMATIZED:
["urgent", "RBI", "have", "announce", "₹50,000", ...]

MODULE 3 — NLP ANALYSIS

Implement the following NLP techniques.

3.1 Tokenization

Show the generated tokens.

3.2 POS TAGGING

Use spaCy POS tagging.

Display:

Word | POS

Example:

RBI → PROPN
announced → VERB
₹50,000 → NUM
scholarship → NOUN
student → NOUN

3.3 N-GRAM ANALYSIS

Generate:

Unigrams

Bigrams

Trigrams

Display frequent/suspicious n-grams.

Example:

"RBI announced"
"₹50,000 scholarship"
"apply now"
"submit Aadhaar"

3.4 NAMED ENTITY RECOGNITION

Use spaCy NER.

Extract:

PERSON

ORGANIZATION

LOCATION

MONEY

DATE

PRODUCT

GPE

Display entities in a table.

3.5 DEPENDENCY PARSING

Extract grammatical relationships.

Example:

RBI → announced → scholarship

Display subject/action/object relationships.

3.6 SEMANTIC ANALYSIS

Use Sentence-BERT embeddings to calculate semantic similarity between the extracted claim and retrieved evidence.

MODULE 4 — CLAIM EXTRACTION

This is a critical module.

Use the NLP outputs:

POS
+
NER
+
Dependency Parsing
+
Semantic Analysis

to identify factual/verifiable claims.

Example:

INPUT:

"RBI has announced a ₹50,000 scholarship for every college student."

EXTRACT:

Organization:
RBI

Action:
announced

Amount:
₹50,000

Target:
college students

Claim:

"RBI announced a ₹50,000 scholarship for college students."

Also distinguish claims from opinions.

Example claim:

"RBI announced a new scholarship."

→ VERIFIABLE CLAIM

Example non-claim:

"I think this scholarship is excellent."

→ OPINION / NON-CLAIM

Show extracted claims in the UI.

If multiple claims exist, create Claim 1, Claim 2, Claim 3, etc.

Each claim must be independently processed.

MODULE 5 — FAKE NEWS DETECTION

Create a fake-news classification service.

Preferred model:

BERT or RoBERTa.

Input:
Extracted claim / relevant text.

Output:

fake_probability
real_probability

Example:

Fake News Risk:
87%

Real:
13%

Do NOT treat this classifier as the final truth decision.

It is only one risk signal.

MODULE 6 — FINANCIAL SCAM DETECTION

Use FinBERT for financial-related content.

Detect:

Investment scams

Banking scams

Fake government financial schemes

Guaranteed-return schemes

Fake rewards

KYC scams

Financial misinformation

Output:

Financial Scam Risk:
93%

Also show important detected terms.

Example:

"₹50,000"
"guaranteed"
"apply now"
"submit Aadhaar"

MODULE 7 — SPAM DETECTION

Implement:

TF-IDF
+
N-grams
+
Logistic Regression or SVM

Detect:

Excessive urgency

Promotional messages

Repeated phrases

Suspicious calls to action

Reward/scam patterns

Output:

Spam Risk:
82%

MODULE 8 — PHISHING DETECTION

Analyze:

Urgency

Login requests

Credential requests

OTP requests

Aadhaar/PAN requests

Suspicious instructions

Social-engineering language

Example:

"Your account will be blocked. Verify immediately."

→ HIGH PHISHING RISK

Output:

Phishing Risk:
91%

MODULE 9 — URL RISK ANALYSIS

If a URL exists, analyze it independently.

Features may include:

URL length

HTTPS availability

Domain structure

Number of subdomains

Special characters

IP-based URL

Suspicious domain patterns

Domain reputation if an external reputation API is configured

IMPORTANT:

Do not declare a URL malicious merely because it contains words like "RBI".

Use actual measurable URL/reputation signals.

Output:

URL Risk:
LOW / MEDIUM / HIGH

Also display:

URL:
https://example.com

MODULE 10 — TRUSTED KNOWLEDGE BASE

Create a document ingestion system.

The knowledge base should support trusted documents such as:

RBI circulars

RBI notifications

SEBI documents

Government notifications

Government scheme documents

Official announcements

Do NOT fabricate trusted evidence.

Allow administrators to upload trusted PDF/text documents.

Document ingestion pipeline:

DOCUMENT
→ TEXT EXTRACTION
→ CLEANING
→ CHUNKING
→ METADATA EXTRACTION
→ SENTENCE-BERT EMBEDDINGS
→ VECTOR DATABASE

Store metadata:

document_id

title

organization

date

source

URL

page_number

text_chunk

MODULE 11 — SENTENCE-BERT EMBEDDINGS

Use Sentence-BERT to convert:

Claims

Evidence chunks

into embeddings.

Example:

Claim:
"RBI announced a student scholarship."

→ embedding vector

Evidence:
"Reserve Bank of India notification..."

→ embedding vector

Calculate semantic similarity.

Return:

Similarity:
0.89

MODULE 12 — BM25 RETRIEVAL

Implement BM25 keyword-based retrieval.

Search using important claim terms:

RBI

scholarship

₹50,000

students

Return the most relevant documents.

Use BM25 together with Sentence-BERT.

MODULE 13 — HYBRID RETRIEVAL

Combine:

BM25
+
Sentence-BERT semantic similarity

Create a ranking system.

Example:

BM25 Score:
0.82

Semantic Score:
0.91

Combined Score:
0.87

Return Top-K evidence documents.

Default Top-K:
5

Make Top-K configurable.

MODULE 14 — VECTOR DATABASE

Use FAISS or ChromaDB.

Recommended:

ChromaDB for easier development and metadata filtering.

Store:

embedding
+
document text
+
metadata

Metadata should include:

source organization
document title
date
URL
page number

Allow filtering by:

RBI

SEBI

Government

Date

Document type

MODULE 15 — RAG

Implement a proper Retrieval-Augmented Generation pipeline.

RAG flow:

USER CLAIM
↓
BM25 SEARCH
+
SENTENCE-BERT SEARCH
↓
TOP-K EVIDENCE
↓
CONTEXT CONSTRUCTION
↓
QWEN3-8B
↓
VERIFICATION

The retrieved evidence MUST be included in the Qwen3-8B prompt.

Do not allow Qwen3-8B to independently invent evidence.

MODULE 16 — QWEN3-8B

Use Qwen3-8B as the main LLM.

The model must receive structured information:

CLAIM

NLP RESULTS

RISK DETECTION RESULTS

RETRIEVED EVIDENCE

SOURCE METADATA

SEMANTIC SIMILARITY

Then ask the model to return structured JSON.

Required output schema:

{
"verdict": "SUPPORTED | REFUTED | UNVERIFIABLE",
"confidence": 0-100,
"claim": "...",
"reasoning": "...",
"evidence_summary": "...",
"risk_level": "LOW | MEDIUM | HIGH",
"warnings": [],
"recommended_action": "..."
}

IMPORTANT:

The LLM must cite the retrieved evidence IDs/source metadata used for its conclusion.

If evidence is insufficient:

verdict = "UNVERIFIABLE"

Never hallucinate a source.

MODULE 17 — CLAIM VERIFICATION

Create a verification engine combining:

Retrieved evidence

Semantic similarity

Fake-news classifier

Financial-scam classifier

Spam classifier

Phishing classifier

URL analysis

Qwen3-8B reasoning

Final verdict:

SUPPORTED
REFUTED
UNVERIFIABLE

The LLM should be the primary reasoning component for evidence-grounded verification, while the other models provide supporting risk signals.

MODULE 18 — EXPLAINABLE AI

Implement SHAP/LIME for supported classification models.

Show:

Top contributing features

Example:

"urgent" → high influence
"₹50,000" → high influence
"apply now" → medium influence
"submit Aadhaar" → high influence

Create a visual explanation.

IMPORTANT:

Clearly distinguish classifier explanations from Qwen3-8B reasoning.

Do not claim that SHAP explains Qwen3-8B unless a proper explanation method is actually implemented.

MODULE 19 — RISK AGGREGATION

Create an overall risk engine.

Inputs:

fake_news_score
financial_scam_score
spam_score
phishing_score
url_risk
evidence_support
verification_verdict

Output:

LOW
MEDIUM
HIGH

Make the scoring formula configurable in the backend.

Do not use arbitrary averaging without documenting the formula.

Display individual scores separately.

MODULE 20 — FINAL SUMMARY

Use Qwen3-8B to generate a concise human-readable summary from the verified results.

Example:

"This message is highly suspicious. The claimed ₹50,000 RBI scholarship could not be verified using the retrieved trusted evidence. The message also requests Aadhaar information and contains a potentially suspicious URL."

MODULE 21 — DASHBOARD

Create a modern professional dashboard.

Design style:

Clean

Professional

Security/AI themed

Responsive

Suitable for academic demonstration

Desktop and mobile compatible

Dashboard sections:

Header

TrustShield AI

Subtitle:

"AI-Powered Claim Verification & Digital Risk Detection"

Navigation:

Dashboard

Analyze

History

Evidence

Knowledge Base

Reports

Settings

22. ANALYSIS PAGE

Create a large text input box.

Fields:

Input Type:
[News ▼]

Text:

[Large Text Area]

URL:

[Optional URL field]

Button:

[Analyze Content]

After analysis, show:

Risk Overview

Fake News
Financial Scam
Spam
Phishing
URL

Use progress bars/cards.

23. CLAIM PANEL

Show:

CLAIM 1

"RBI announced a ₹50,000 scholarship for college students."

Claim Type:
Government/Financial

Entities:
RBI
₹50,000
College Students

24. VERIFICATION PANEL

Large verdict card:

SUPPORTED
or
REFUTED
or
UNVERIFIABLE

Show:

Confidence: 87%

Risk:
HIGH

Reasoning:

Qwen3-8B generated evidence-grounded explanation.

25. EVIDENCE PANEL

For each retrieved document display:

Document title
Organization
Date
Similarity score
BM25 score
Source
Page number
Relevant text chunk

Example:

RBI Notification

Similarity:
0.89

Source:
RBI

Page:
3

[View Evidence]

Do not invent source URLs.

26. NLP ANALYSIS PANEL

Create tabs:

Tokens

POS Tags

N-Grams

NER

Dependency Parsing

Claims

Semantic Similarity

This is important for demonstrating the NLP concepts in the academic project.

27. MODEL RESULTS PANEL

Display:

BERT/RoBERTa:
Fake News Risk — 87%

FinBERT:
Financial Scam Risk — 93%

Spam Model:
Spam Risk — 82%

Phishing:
91%

URL:
HIGH

Sentence-BERT:
Semantic Similarity — 89%

Qwen3-8B:
Verification — UNVERIFIABLE

28. EXPLAINABLE AI PANEL

Show:

SHAP/LIME feature importance.

Include a bar chart for top features.

Also include a text explanation.

29. REPORT GENERATION

Create a downloadable verification report.

Report must contain:

Input

Extracted claims

NLP analysis

POS tags

NER

N-grams

Risk scores

Retrieved evidence

Source information

Qwen3-8B verdict

Explanation

SHAP/LIME results

Final risk

Timestamp

Generate PDF.

30. HISTORY

Store previous analyses.

Each history item should contain:

Analysis ID

Date/time

Input type

Short claim

Verdict

Risk level

Allow:

[View]
[Delete]

31. KNOWLEDGE BASE ADMIN PAGE

Create an admin page to upload trusted documents.

Supported:

PDF
TXT
DOCX

Upload flow:

Upload
↓
Extract
↓
Chunk
↓
Embed
↓
Store in ChromaDB

Show:

Document name
Organization
Date
Number of chunks
Embedding status

Example:

RBI_Circular_2026.pdf
Organization: RBI
Chunks: 125
Status: Indexed

32. BACKEND API

Use FastAPI.

Create APIs:

POST /api/analyze

POST /api/preprocess

POST /api/nlp

POST /api/claims

POST /api/detect

POST /api/retrieve

POST /api/rag

POST /api/verify

POST /api/upload-document

GET /api/history

GET /api/evidence

GET /api/analysis/{id}

DELETE /api/history/{id}

GET /api/report/{id}

33. RECOMMENDED BACKEND STRUCTURE

Use modular architecture:

backend/

app/

main.py

api/

analysis.py
claims.py
retrieval.py
rag.py
documents.py
reports.py


services/

preprocessing.py
nlp_service.py
claim_extractor.py
fake_news.py
financial_scam.py
spam_detector.py
phishing_detector.py
url_analyzer.py
embeddings.py
bm25.py
vector_store.py
rag_service.py
qwen_service.py
explainability.py
risk_engine.py


models/

schemas.py


database/

database.py


utils/

pdf_parser.py
text_cleaner.py


34. FRONTEND STRUCTURE

Use React + TypeScript.

Structure:

src/

components/

Dashboard.tsx
InputPanel.tsx
RiskCards.tsx
ClaimPanel.tsx
EvidencePanel.tsx
NLPPanel.tsx
ModelResults.tsx
ExplainabilityPanel.tsx
VerificationPanel.tsx


pages/

Dashboard.tsx
Analyze.tsx
History.tsx
Evidence.tsx
KnowledgeBase.tsx
Reports.tsx
Settings.tsx


services/

api.ts


35. DATABASE

Use PostgreSQL.

Tables:

users
analyses
claims
risk_scores
evidence
documents
document_chunks
model_results

Example analysis record:

analysis_id
input_text
input_type
timestamp
overall_risk
verdict
confidence

Claims table:

claim_id
analysis_id
claim_text
claim_type
entities

Evidence table:

evidence_id
claim_id
document_id
similarity_score
bm25_score
text_chunk
page_number

36. CONFIGURATION

Create .env configuration.

Example variables:

QWEN_MODEL=qwen3-8b

QWEN_API_KEY=

VECTOR_DB=chroma

DATABASE_URL=

EMBEDDING_MODEL=

HF_TOKEN=

Make API keys configurable.

Never hard-code secrets.

37. IMPORTANT IMPLEMENTATION RULE

Do NOT fake AI outputs in the final implementation.

If a model/API is not configured, clearly show:

"Model unavailable — configure Qwen3-8B/API to enable this module."

Do not generate fake evidence.

Do not invent RBI/SEBI documents.

Do not invent URLs.

Do not claim that an external website was checked unless the system actually checked it.

38. DEVELOPMENT FALLBACK

The application should still run in development mode if large models are unavailable.

Create a clearly marked:

DEMO MODE

In Demo Mode:

Use lightweight/local models where possible.

Use sample trusted documents supplied by the developer.

Clearly label results as DEMO.

Keep the architecture ready for Qwen3-8B integration.

Do NOT mix demo results with real verification results.

39. SAMPLE END-TO-END TEST

Use this test input:

"URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details."

Expected processing:

INPUT
↓
PREPROCESSING
↓
TOKENS
↓
POS TAGGING
↓
N-GRAMS
↓
NER
↓
DEPENDENCY PARSING
↓
CLAIM EXTRACTION

Claim:

"RBI announced a ₹50,000 scholarship for college students."

Then:

BERT/RoBERTa
→ Fake News Risk

FinBERT
→ Financial Scam Risk

Spam Classifier
→ Spam Risk

Phishing Detector
→ Phishing Risk

URL Analyzer
→ URL Risk

Sentence-BERT
→ Claim Embedding

BM25
→ Keyword Evidence

ChromaDB
→ Relevant Documents

RAG
→ Evidence Context

Qwen3-8B
→ Supported / Refuted / Unverifiable

SHAP/LIME
→ Classification Explanation

Risk Engine
→ Overall Risk

Dashboard
→ Final Result

40. UI RESULT FOR THE TEST

Display something similar to:

OVERALL RISK
HIGH

CLAIM

"RBI announced a ₹50,000 scholarship for college students."

VERDICT

UNVERIFIABLE

CONFIDENCE

87%

RISK SCORES

Fake News: 87%
Financial Scam: 93%
Spam: 82%
Phishing: 91%
URL: HIGH

EXPLANATION

"The retrieved trusted evidence does not provide sufficient support for the claimed RBI scholarship. The message also contains urgency, a financial incentive, a request for Aadhaar information, and a potentially suspicious URL."

EVIDENCE

Display only actual retrieved documents.

41. SECURITY

Implement:

Input validation

Rate limiting

API authentication

Secure environment variables

File upload validation

File size limits

Safe PDF processing

URL validation

SQL injection protection

XSS protection

Do not execute uploaded files.

42. ERROR HANDLING

Every API should return meaningful errors.

Example:

{
"success": false,
"error": "Qwen3-8B model is not configured",
"module": "qwen_service"
}

Frontend should show user-friendly error messages.

43. LOADING STATES

When analysis is running, show a pipeline progress indicator:

Input
✓

Preprocessing
✓

NLP Analysis
✓

Claim Extraction
✓

Risk Detection
✓

Evidence Retrieval
⟳

RAG
○

Qwen3-8B
○

Verification
○

Report
○

This makes the processing flow visually clear.

44. DO NOT OVERCOMPLICATE THE UI

The dashboard should prioritize:

Final verdict

Overall risk

Extracted claim

Evidence

Explanation

Advanced information such as:

POS
NER
N-grams
Dependency Parsing
SHAP
Model probabilities

should be placed under expandable sections/tabs.

45. FINAL ARCHITECTURE

Implement this exact conceptual architecture:

USER INPUT
↓
TEXT PREPROCESSING
↓
NLP ANALYSIS
├── Tokenization
├── POS Tagging
├── N-Grams
├── NER
├── Dependency Parsing
└── Semantic Analysis
↓
CLAIM EXTRACTION
↓
RISK DETECTION
├── BERT/RoBERTa
├── FinBERT
├── Spam Classifier
├── Phishing Detector
└── URL Analyzer
↓
HYBRID RETRIEVAL
├── BM25
└── Sentence-BERT
↓
FAISS / CHROMADB
↓
TRUSTED EVIDENCE
↓
RAG
↓
🔥 QWEN3-8B
↓
CLAIM VERIFICATION
├── SUPPORTED
├── REFUTED
└── UNVERIFIABLE
↓
SHAP/LIME
↓
RISK AGGREGATION
↓
SUMMARY
↓
DASHBOARD
↓
PDF REPORT

46. IMPORTANT PRIORITY

Build the application incrementally.

Priority 1:
Frontend + backend connection

Priority 2:
Input + preprocessing

Priority 3:
POS + NER + N-grams + dependency parsing

Priority 4:
Claim extraction

Priority 5:
Risk detection

Priority 6:
Trusted document ingestion

Priority 7:
Sentence-BERT + BM25 retrieval

Priority 8:
ChromaDB

Priority 9:
RAG

Priority 10:
Qwen3-8B

Priority 11:
SHAP/LIME

Priority 12:
Dashboard + reports

Do not build only a static frontend.

Every major UI component must connect to a backend API.

47. FINAL REQUIREMENT

Generate the complete working project with:

Frontend

Backend

Database

API endpoints

NLP pipeline

Claim extraction

Risk detection

Hybrid retrieval

Vector database

RAG

Qwen3-8B integration

Explainability

Dashboard

History

Knowledge-base ingestion

PDF report generation

Error handling

Environment configuration

README

Setup instructions

requirements.txt

package.json

Docker configuration

The final application must be modular so that individual AI models can be replaced without rewriting the whole system.

Most importantly, Qwen3-8B must be the central LLM for evidence-grounded reasoning and final claim verification, while RAG supplies trusted evidence to Qwen3-8B.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/59fbcec1-42b1-470a-8ef2-86f8a3dcac81).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
