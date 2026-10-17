from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Authentication
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "analyst"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# NLP Preprocessing & Pipeline
class PreprocessResponse(BaseModel):
    raw_text: str
    clean_text: str
    tokens: List[str]
    lemmatized_tokens: List[str]
    sentences: List[str]

class POSTagItem(BaseModel):
    word: str
    pos: str
    lemma: str

class NGramItem(BaseModel):
    phrase: str
    frequency: int
    ngram_type: str  # unigram, bigram, trigram

class NERItem(BaseModel):
    entity: str
    label: str  # PERSON, ORGANIZATION, LOCATION, MONEY, DATE, GPE, PRODUCT
    start: int
    end: int

class DependencyEdge(BaseModel):
    source: str
    target: str
    relation: str

class NLPResponse(BaseModel):
    pos_tags: List[POSTagItem]
    ngrams: Dict[str, List[NGramItem]]
    entities: List[NERItem]
    dependency_edges: List[DependencyEdge]
    svo_triples: List[Dict[str, str]]

# Claim Extraction
class ExtractedClaim(BaseModel):
    claim_id: str
    claim_text: str
    is_factual: bool
    claim_type: str  # Government/Financial, Banking, Policy, Phishing, Opinion
    organization: Optional[str] = None
    action: Optional[str] = None
    amount: Optional[str] = None
    target: Optional[str] = None
    confidence: float

# Risk Detection
class RiskScores(BaseModel):
    fake_news_risk: float = Field(..., ge=0, le=100)
    financial_scam_risk: float = Field(..., ge=0, le=100)
    spam_risk: float = Field(..., ge=0, le=100)
    phishing_risk: float = Field(..., ge=0, le=100)
    url_risk: str  # LOW, MEDIUM, HIGH
    url_risk_score: float = Field(..., ge=0, le=100)
    overall_risk: str  # LOW, MEDIUM, HIGH
    overall_risk_score: float = Field(..., ge=0, le=100)

# Evidence & Retrieval
class EvidenceChunk(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    organization: str
    date: str
    source_url: Optional[str] = None
    page_number: Optional[int] = 1
    text: str
    bm25_score: float
    semantic_similarity: float
    combined_score: float

class EvidenceConsistencyResult(BaseModel):
    evidence_support: str  # LOW, MEDIUM, HIGH
    evidence_contradiction: str  # LOW, MEDIUM, HIGH
    evidence_status: str  # SUPPORTING, CONTRADICTING, INSUFFICIENT
    support_score: float
    contradiction_score: float

# LLM Outputs
class QwenVerdict(BaseModel):
    model_name: str = "Qwen3-8B"
    verdict: str  # SUPPORTED, REFUTED, UNVERIFIABLE
    confidence: float
    reasoning: str
    evidence_ids: List[str]
    evidence_summary: str
    warnings: List[str] = []

class LlamaReview(BaseModel):
    model_name: str = "Llama 3.1 8B"
    review_verdict: str  # SUPPORTED, REFUTED, UNVERIFIABLE
    confidence: float
    agreement_with_qwen: bool
    review_reasoning: str
    issues_found: List[str] = []
    evidence_ids: List[str] = []

# Decision Engine Output
class DecisionEngineOutput(BaseModel):
    final_verdict: str  # SUPPORTED, REFUTED, UNVERIFIABLE
    confidence: float
    agreement: bool
    risk_level: str  # LOW, MEDIUM, HIGH
    decision_case: str  # Case 1, Case 2, Case 3, Case 4
    explanation: str

# Explainable AI (SHAP/LIME style token attribution)
class FeatureAttribution(BaseModel):
    token: str
    importance: float
    impact: str  # HIGH, MEDIUM, LOW
    category: str

# Full Verification Request & Response
class VerificationRequest(BaseModel):
    text: str
    url: Optional[str] = None
    input_type: Optional[str] = "News"  # News, SMS, WhatsApp, Email, Telegram, Social Media, URL

class VerificationResponse(BaseModel):
    analysis_id: str
    input_text: str
    input_url: Optional[str] = None
    input_type: str
    timestamp: str
    
    preprocessing: PreprocessResponse
    nlp: NLPResponse
    claims: List[ExtractedClaim]
    risk_scores: RiskScores
    evidence: List[EvidenceChunk]
    evidence_consistency: EvidenceConsistencyResult
    
    qwen_result: QwenVerdict
    llama_review: LlamaReview
    decision: DecisionEngineOutput
    
    explainability: List[FeatureAttribution]
    summary: str
    recommended_action: str
    is_demo: bool = False

# Document Ingestion
class DocumentUploadResponse(BaseModel):
    document_id: str
    title: str
    organization: str
    chunks_indexed: int
    status: str
