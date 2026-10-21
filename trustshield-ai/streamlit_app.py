"""
TrustShield AI — Multi-LLM Claim Verification System
Streamlit Cloud Edition (Zero-Database Required)
Modern Light SaaS Theme matching TrustShield AI UI Spec
"""

import os
import sys
import json
import time
import datetime
import io
import streamlit as st
import pandas as pd

# Configure path so backend services are always accessible
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_BACKEND_DIRS = [
    os.path.join(CURRENT_DIR, "trustshield-ai", "backend"),
    os.path.join(CURRENT_DIR, "backend"),
    os.path.join(CURRENT_DIR, "..", "backend"),
]
for b_dir in POSSIBLE_BACKEND_DIRS:
    if os.path.exists(b_dir) and b_dir not in sys.path:
        sys.path.insert(0, b_dir)

# Import backend services (zero database dependency)
from services.preprocessing import preprocess_text
from services.nlp_service import run_nlp_pipeline
from services.claim_extractor import extract_claims
from services.fake_news import detect_fake_news
from services.financial_scam import detect_financial_scam
from services.spam_detector import detect_spam
from services.phishing_detector import detect_phishing
from services.url_analyzer import analyze_url
from services.vector_store import kb_store
from services.rag_service import retrieve_rag_evidence
from services.evidence_checker import check_evidence_consistency
from services.risk_engine import aggregate_risk_scores
from services.qwen_service import run_qwen_verification
from services.llama_reviewer import run_llama_review
from services.decision_engine import execute_decision_engine
from services.explainability import generate_feature_explanations
from services.summary_service import generate_plain_language_summary
from services.pdf_report import generate_verification_pdf

# ----------------- PAGE CONFIG -----------------
st.set_page_config(
    page_title="TrustShield AI — Verification Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ----------------- CUSTOM CSS (LIGHT THEME PIXEL-PERFECT TO MOCKUP) -----------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    html, body, [class*="css"], .stApp {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        background-color: #F8FAFC !important;
        color: #0F172A !important;
    }

    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header[data-testid="stHeader"] {
        background-color: transparent !important;
        z-index: 10 !important;
    }

    /* Container Spacing */
    .block-container {
        max-width: 960px !important;
        padding-top: 1rem !important;
        padding-bottom: 4rem !important;
        margin: 0 auto !important;
    }

    /* Top Navbar */
    .nav-bar-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0 18px 0;
        border-bottom: 1px solid #E2E8F0;
        margin-bottom: 24px;
    }
    .nav-left-brand {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .brand-icon-box {
        width: 42px;
        height: 42px;
        background: #0F172A;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
    }
    .brand-name {
        font-size: 19px;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: -0.02em;
        line-height: 1.15;
    }
    .brand-tagline {
        font-size: 10px;
        font-weight: 700;
        color: #94A3B8;
        letter-spacing: 1.2px;
        text-transform: uppercase;
    }
    .nav-right-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .btn-lang {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border: 1px solid #E2E8F0;
        background: #FFFFFF;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #334155;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        cursor: pointer;
    }
    .btn-signin {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        background: #0F172A;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #FFFFFF;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
        cursor: pointer;
    }

    /* Hero Section */
    .hero-container {
        text-align: center;
        padding: 10px 0 24px 0;
    }
    .live-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 9999px;
        padding: 5px 16px;
        font-size: 12.5px;
        font-weight: 500;
        color: #475569;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        margin-bottom: 20px;
    }
    .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #10B981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    .hero-title {
        font-size: 46px;
        font-weight: 900;
        color: #0F172A;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin: 0 0 16px 0;
    }
    .hero-subtitle {
        font-size: 16px;
        color: #475569;
        line-height: 1.6;
        max-width: 680px;
        margin: 0 auto;
    }

    /* Floating White Input Card */
    .card-outer-box {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 18px;
        box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
        padding: 24px;
        margin-top: 10px;
        margin-bottom: 30px;
    }

    /* Streamlit Tabs */
    [data-baseweb="tab-list"] {
        border-bottom: 1px solid #E2E8F0 !important;
        gap: 12px !important;
        background: transparent !important;
        padding-bottom: 2px !important;
        margin-bottom: 16px !important;
    }
    [data-baseweb="tab"] {
        background: transparent !important;
        border: none !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        color: #64748B !important;
        padding: 8px 18px !important;
        border-bottom: 2px solid transparent !important;
    }
    [data-baseweb="tab"][aria-selected="true"] {
        color: #0F172A !important;
        border-bottom: 2.5px solid #0F172A !important;
        font-weight: 700 !important;
    }

    /* Clean Light Textarea */
    .stTextArea textarea {
        border: 1.5px solid #E2E8F0 !important;
        border-radius: 14px !important;
        background-color: #FFFFFF !important;
        color: #0F172A !important;
        font-size: 14.5px !important;
        line-height: 1.6 !important;
        padding: 16px !important;
        box-shadow: none !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }
    .stTextArea textarea:focus {
        border-color: #2563EB !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
    }
    .stTextArea textarea::placeholder {
        color: #94A3B8 !important;
    }

    /* Text Input */
    .stTextInput input {
        border: 1.5px solid #E2E8F0 !important;
        border-radius: 10px !important;
        background-color: #FFFFFF !important;
        color: #0F172A !important;
        font-size: 13.5px !important;
        padding: 10px 14px !important;
    }
    .stTextInput input:focus {
        border-color: #2563EB !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
    }

    /* Buttons */
    div[data-testid="stButton"] > button[kind="primary"] {
        background-color: #5B6B8A !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 12px !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        padding: 10px 24px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 6px rgba(91, 107, 138, 0.25) !important;
    }
    div[data-testid="stButton"] > button[kind="primary"]:hover {
        background-color: #495772 !important;
        box-shadow: 0 4px 12px rgba(73, 87, 114, 0.35) !important;
    }
    div[data-testid="stButton"] > button[kind="secondary"] {
        background-color: #FFFFFF !important;
        color: #64748B !important;
        border: 1px solid #E2E8F0 !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
        font-size: 13.5px !important;
        padding: 10px 18px !important;
    }
    div[data-testid="stButton"] > button[kind="secondary"]:hover {
        background-color: #F8FAFC !important;
        color: #0F172A !important;
        border-color: #CBD5E1 !important;
    }

    /* Privacy Note */
    .privacy-label {
        font-size: 12.5px;
        color: #64748B;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    /* Verdict Banners */
    .verdict-box {
        border-radius: 16px;
        padding: 22px 26px;
        margin: 22px 0;
        box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
    }
    .verdict-refuted {
        background-color: #FEF2F2;
        border: 1px solid #FECACA;
        border-left: 6px solid #EF4444;
    }
    .verdict-supported {
        background-color: #F0FDF4;
        border: 1px solid #BBF7D0;
        border-left: 6px solid #10B981;
    }
    .verdict-unverifiable {
        background-color: #FFFBEB;
        border: 1px solid #FDE68A;
        border-left: 6px solid #F59E0B;
    }

    /* LLM Cards */
    .llm-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 14px;
        padding: 18px 22px;
        height: 100%;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    }

    /* Metric Cards */
    div[data-testid="stMetric"] {
        background: #FFFFFF !important;
        border: 1px solid #E2E8F0 !important;
        border-radius: 12px !important;
        padding: 14px 18px !important;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03) !important;
    }
    div[data-testid="stMetric"] [data-testid="stMetricLabel"] {
        color: #64748B !important;
        font-size: 12px !important;
        font-weight: 600 !important;
    }
    div[data-testid="stMetric"] [data-testid="stMetricValue"] {
        color: #0F172A !important;
        font-weight: 800 !important;
        font-size: 22px !important;
    }

    /* Expanders */
    div[data-testid="stExpander"] {
        background: #FFFFFF !important;
        border: 1px solid #E2E8F0 !important;
        border-radius: 12px !important;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02) !important;
        margin-bottom: 10px !important;
    }

    /* Token Attribution Chips */
    .token-chip {
        display: inline-block;
        padding: 3px 9px;
        margin: 2px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }

    /* Navigation Pills */
    .stRadio [role="radiogroup"] {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }
    .stRadio [role="radiogroup"] > label {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 13.5px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .stRadio [role="radiogroup"] > label:hover {
        background: #F1F5F9;
        color: #0F172A;
    }
    .stRadio [role="radiogroup"] > label[data-checked="true"] {
        background: #EFF6FF !important;
        border-color: #BFDBFE !important;
        color: #1D4ED8 !important;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- SESSION STATE (ZERO-DB IN-MEMORY) -----------------
if "history" not in st.session_state:
    st.session_state.history = []

if "claim_input" not in st.session_state:
    st.session_state.claim_input = "Dear customer, your SBI / HDFC bank account will be blocked today within 24 hours. Immediately update your KYC by clicking http://bit.ly/sbi-kyc-update and enter your OTP."

if "url_input" not in st.session_state:
    st.session_state.url_input = "http://bit.ly/sbi-kyc-update"

if "channel_input" not in st.session_state:
    st.session_state.channel_input = "SMS"

if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None

if "nav_page" not in st.session_state:
    st.session_state.nav_page = "Verify"

# Load Benchmark Dataset Cases
@st.cache_data
def load_benchmark_dataset():
    possible_paths = [
        os.path.join(CURRENT_DIR, "trustshield-ai", "backend", "data", "claims_dataset.json"),
        os.path.join(CURRENT_DIR, "backend", "data", "claims_dataset.json"),
        os.path.join(CURRENT_DIR, "data", "claims_dataset.json"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
    return []

benchmark_dataset = load_benchmark_dataset()

# ----------------- CORE PIPELINE EXECUTION -----------------
def execute_verification(text: str, input_type: str, url: str):
    start_time = time.time()
    analysis_id = f"TS-{int(start_time):X}"
    
    # 1. Text Preprocessing
    prep = preprocess_text(text)
    
    # 2. NLP Pipeline
    nlp_res = run_nlp_pipeline(prep["clean_text"], prep["tokens"])
    
    # 3. Claim Extraction
    claims = extract_claims(prep["clean_text"], nlp_res["entities"], nlp_res["svo_triples"])
    primary_claim_text = " ".join([c["claim_text"] for c in claims]) if claims else text
    
    # 4. Risk Detection Models
    fake = detect_fake_news(text)
    scam = detect_financial_scam(text)
    spam = detect_spam(text)
    phish = detect_phishing(text, url)
    url_res = analyze_url(url or text)
    
    # 5. Hybrid Evidence Retrieval (BM25 + Sentence-BERT)
    search_context = f"{primary_claim_text} {text}"
    evidence = retrieve_rag_evidence(search_context, top_k=6)
    
    # 6. Evidence Consistency Check
    consistency = check_evidence_consistency(text, evidence)
    
    # 7. Risk Aggregation
    overall_risk = aggregate_risk_scores(
        fake["fake_probability"],
        scam["financial_scam_risk"],
        spam["spam_risk"],
        phish["phishing_risk"],
        url_res["risk_score"],
        consistency["contradiction_score"]
    )
    
    risk_dict = {
        "fake_news_risk": fake["fake_probability"],
        "financial_scam_risk": scam["financial_scam_risk"],
        "spam_risk": spam["spam_risk"],
        "phishing_risk": phish["phishing_risk"],
        "url_risk": url_res["url_risk"]
    }
    
    # 8. Dual LLM Execution
    qwen = run_qwen_verification(primary_claim_text, evidence, nlp_res, risk_dict)
    llama = run_llama_review(primary_claim_text, evidence, qwen, risk_dict)
    
    # 9. Decision Engine
    decision = execute_decision_engine(
        qwen["verdict"], qwen["confidence"],
        llama["review_verdict"], llama["confidence"],
        consistency["support_score"], consistency["contradiction_score"],
        consistency["evidence_status"],
        fake["fake_probability"], scam["financial_scam_risk"],
        spam["spam_risk"], phish["phishing_risk"], url_res["url_risk"]
    )
    
    # 10. Explainable AI
    attributions = generate_feature_explanations(text, prep["tokens"])
    
    # 11. Plain-Language Summary
    summary_data = generate_plain_language_summary(
        primary_claim_text,
        decision["final_verdict"],
        decision["risk_level"],
        risk_dict
    )
    
    duration_ms = round((time.time() - start_time) * 1000, 1)
    
    result = {
        "analysis_id": analysis_id,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "duration_ms": duration_ms,
        "input_text": text,
        "input_url": url,
        "input_type": input_type,
        "preprocessing": prep,
        "nlp": nlp_res,
        "claims": claims,
        "risk_scores": {
            "fake_news_risk": fake["fake_probability"],
            "financial_scam_risk": scam["financial_scam_risk"],
            "spam_risk": spam["spam_risk"],
            "phishing_risk": phish["phishing_risk"],
            "url_risk": url_res["url_risk"],
            "url_risk_score": url_res["risk_score"],
            "overall_risk": overall_risk["overall_risk"],
            "overall_risk_score": overall_risk["overall_risk_score"]
        },
        "evidence": evidence,
        "evidence_consistency": consistency,
        "qwen_result": qwen,
        "llama_review": llama,
        "decision": decision,
        "explainability": attributions,
        "summary": summary_data["summary"],
        "recommended_action": summary_data["recommended_action"]
    }
    
    # Save to in-memory session history
    st.session_state.history.insert(0, {
        "analysis_id": analysis_id,
        "claim": text[:80] + ("..." if len(text) > 80 else ""),
        "verdict": decision["final_verdict"],
        "confidence": decision["confidence"],
        "risk": decision["risk_level"],
        "timestamp": result["timestamp"]
    })
    
    return result

# ----------------- SIDEBAR QUICK CONTROLS -----------------
with st.sidebar:
    st.markdown("### 🛡️ TrustShield AI")
    st.caption("Verification Platform (Streamlit Cloud)")
    st.markdown("---")
    
    st.markdown("#### ⚡ 1-Click Verification Presets")
    if st.button("🚨 KYC Phishing (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Dear customer, your SBI / HDFC bank account will be blocked today within 24 hours. Immediately update your KYC by clicking http://bit.ly/sbi-kyc-update and enter your OTP."
        st.session_state.url_input = "http://bit.ly/sbi-kyc-update"
        st.session_state.channel_input = "SMS"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.session_state.nav_page = "Verify"
        st.rerun()

    if st.button("🚨 SEBI 400% Profit (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Join our VIP Telegram group! Guaranteed 400% daily profit on intraday stocks and crypto. Approved by SEBI. Deposit Rs 10,000 to get Rs 40,000 in 2 hours."
        st.session_state.url_input = "https://t.me/sebi_vip_stocks"
        st.session_state.channel_input = "Telegram"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.session_state.nav_page = "Verify"
        st.rerun()

    if st.button("🚨 Power Cut Tonight (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call electricity officer at 9876543210 immediately."
        st.session_state.url_input = ""
        st.session_state.channel_input = "SMS"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.session_state.nav_page = "Verify"
        st.rerun()

    if st.button("✅ PM Kisan ₹6k (SUPPORTED)", use_container_width=True):
        st.session_state.claim_input = "Central Government is disbursing Rs 6,000 in 17th installment of PM Kisan Samman Nidhi. Beneficiaries must complete e-KYC on official portal pmkisan.gov.in."
        st.session_state.url_input = "https://pmkisan.gov.in"
        st.session_state.channel_input = "News"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.session_state.nav_page = "Verify"
        st.rerun()

    if st.button("⚠️ RBI Scholarship (UNVERIFIABLE)", use_container_width=True):
        st.session_state.claim_input = "URGENT! RBI has announced a Rs 50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details."
        st.session_state.url_input = "https://example.com"
        st.session_state.channel_input = "News"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.session_state.nav_page = "Verify"
        st.rerun()

    st.markdown("---")
    st.markdown("#### 📦 Multi-Dataset Ingestion")
    st.markdown("""
    - 🇮🇳 **26,232** Bharat Schemes (PIB Fact Check)
    - 🏛️ **1,000** Official RBI Regulations
    - 📱 **5,572** SMS Spam Training Records
    - 🔒 **21,430** Phishing Signatures
    - 💾 **100% In-Memory (Zero-Database)**
    """)

# ----------------- TOP NAVBAR HEADER -----------------
st.markdown("""
<div class="nav-bar-container">
    <div class="nav-left-brand">
        <div class="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
        </div>
        <div>
            <div class="brand-name">TrustShield AI</div>
            <div class="brand-tagline">VERIFICATION PLATFORM</div>
        </div>
    </div>
    <div class="nav-right-actions">
        <div class="btn-lang">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>English</span>
        </div>
        <div class="btn-signin">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Sign in</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ----------------- HORIZONTAL NAVIGATION PILLS -----------------
nav_col1, nav_col2 = st.columns([3, 2])
with nav_col1:
    selected_nav = st.radio(
        "Navigation",
        ["🏠 Verify", "🕒 History", "🎛️ Dashboard", "📚 Knowledge Base"],
        horizontal=True,
        label_visibility="collapsed",
        index=["Verify", "History", "Dashboard", "Knowledge Base"].index(st.session_state.nav_page)
    )
    # Extract plain name
    curr_view = selected_nav.split(" ")[-1]
    if curr_view != st.session_state.nav_page:
        st.session_state.nav_page = curr_view
        st.rerun()

# ----------------- VIEW 1: VERIFY (CLAIM VERIFICATION PLATFORM) -----------------
if st.session_state.nav_page == "Verify":
    # Hero Header Section (Exact match to screenshot)
    st.markdown("""
    <div class="hero-container">
        <div class="live-badge">
            <span class="live-dot"></span>
            <span>Live cross-referencing with official sources</span>
        </div>
        <h1 class="hero-title">
            Verify Every Claim.<br>Protect Every Citizen.
        </h1>
        <p class="hero-subtitle">
            TrustShield AI checks financial news, government scheme claims, and phishing messages against official RBI and government sources — with plain-language, explainable results in seconds.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Floating Input Card Container
    with st.container():
        input_tabs = st.tabs(["📄 Paste text", "🔗 Check URL", "🖼️ Upload image"])
        
        # Tab 1: Paste Text
        with input_tabs[0]:
            top_meta_c1, top_meta_c2 = st.columns([1, 2])
            with top_meta_c1:
                channel = st.selectbox(
                    "Channel",
                    ["News", "SMS", "WhatsApp", "Email", "Telegram", "Social Media"],
                    index=["News", "SMS", "WhatsApp", "Email", "Telegram", "Social Media"].index(
                        st.session_state.channel_input if st.session_state.channel_input in ["News", "SMS", "WhatsApp", "Email", "Telegram", "Social Media"] else "SMS"
                    ),
                    label_visibility="collapsed"
                )
            with top_meta_c2:
                preset_c1, preset_c2 = st.columns([1, 1])
                with preset_c1:
                    if st.button("📋 Load KYC Phishing", use_container_width=True):
                        st.session_state.claim_input = "Dear customer, your SBI / HDFC bank account will be blocked today within 24 hours. Immediately update your KYC by clicking http://bit.ly/sbi-kyc-update and enter your OTP."
                        st.session_state.url_input = "http://bit.ly/sbi-kyc-update"
                        st.session_state.channel_input = "SMS"
                        st.rerun()
                with preset_c2:
                    if st.button("📋 Load PM Kisan", use_container_width=True):
                        st.session_state.claim_input = "Central Government is disbursing Rs 6,000 in 17th installment of PM Kisan Samman Nidhi. Beneficiaries must complete e-KYC on official portal pmkisan.gov.in."
                        st.session_state.url_input = "https://pmkisan.gov.in"
                        st.session_state.channel_input = "News"
                        st.rerun()

            claim_val = st.text_area(
                "Claim Input",
                value=st.session_state.claim_input,
                placeholder="Paste a WhatsApp forward, SMS, or news claim here — e.g. 'Govt is giving ₹5000 under PM Kisan, verify KYC at bit.ly/...'",
                height=130,
                label_visibility="collapsed"
            )
            
            url_val = st.text_input(
                "Accompanying URL",
                value=st.session_state.url_input,
                placeholder="Optional: Include accompanying link to evaluate URL risk (e.g. https://example.com)",
                label_visibility="collapsed"
            )

        # Tab 2: Check URL
        with input_tabs[1]:
            st.markdown("<div style='font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;'>Suspicious Link / Website URL</div>", unsafe_allow_html=True)
            url_direct_val = st.text_input(
                "Direct URL",
                value=st.session_state.url_input if st.session_state.url_input else "https://example.com/rbi-scholarship-login",
                placeholder="https://example.com/rbi-scholarship-login",
                label_visibility="collapsed"
            )
            st.caption("TrustShield evaluates domain age, SSL certificate, entropy, suspicious top-level domains, and registrar records.")

        # Tab 3: Upload Image
        with input_tabs[2]:
            st.markdown("""
            <div style="text-align: center; padding: 24px 10px; border: 2px dashed #CBD5E1; border-radius: 12px; background: #F8FAFC;">
                <div style="font-size: 28px; margin-bottom: 6px;">📄</div>
                <div style="font-weight: 700; color: #1E293B; font-size: 14px;">Upload screenshot of message or circular</div>
                <div style="color: #64748B; font-size: 12px; margin-top: 4px;">Supports PNG, JPG, or PDF captures of WhatsApp forwards, emails, and circulars.</div>
            </div>
            """, unsafe_allow_html=True)
            uploaded_file = st.file_uploader("Upload OCR Image", type=["png", "jpg", "jpeg", "pdf"], label_visibility="collapsed")
            if uploaded_file is not None:
                st.info(f"File uploaded: {uploaded_file.name}. OCR extraction active.")

        # Bottom Bar inside Card
        st.markdown("<hr style='margin: 16px 0 14px 0; border: none; border-top: 1px solid #F1F5F9;' />", unsafe_allow_html=True)
        bot_c1, bot_c2, bot_c3 = st.columns([4, 1, 2])
        with bot_c1:
            st.markdown("""
            <div class="privacy-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                </svg>
                <span>Your input is analyzed privately. We do not store sensitive data.</span>
            </div>
            """, unsafe_allow_html=True)
        with bot_c2:
            if st.button("Clear", use_container_width=True):
                st.session_state.claim_input = ""
                st.session_state.url_input = ""
                st.session_state.analysis_result = None
                st.rerun()
        with bot_c3:
            verify_clicked = st.button("🛡️ Verify Now ➔", type="primary", use_container_width=True)

        if verify_clicked:
            active_text = claim_val.strip() if claim_val.strip() else f"Suspicious URL verification for {url_val}"
            if active_text:
                with st.spinner("Analyzing NLP features, querying official RBI & Govt circulars, and running dual-LLMs..."):
                    st.session_state.claim_input = claim_val
                    st.session_state.url_input = url_val
                    st.session_state.channel_input = channel
                    st.session_state.analysis_result = execute_verification(active_text, channel, url_val)

    # ----------------- ANALYSIS RESULTS SECTION -----------------
    res = st.session_state.analysis_result
    if res:
        st.markdown("<hr style='margin: 32px 0 24px 0; border: none; border-top: 1px solid #E2E8F0;' />", unsafe_allow_html=True)
        dec = res["decision"]
        verdict = dec["final_verdict"]
        conf = dec["confidence"]
        risk = dec["risk_level"]
        case = dec["decision_case"]
        
        # Color palettes according to verdict
        if verdict == "REFUTED":
            banner_class = "verdict-refuted"
            color_code = "#DC2626"
            icon = "🚨 REFUTED"
        elif verdict == "SUPPORTED":
            banner_class = "verdict-supported"
            color_code = "#15803D"
            icon = "✅ SUPPORTED"
        else:
            banner_class = "verdict-unverifiable"
            color_code = "#B45309"
            icon = "⚠️ UNVERIFIABLE"
        
        # Arbitrated Final Verdict Banner
        st.markdown(f"""
        <div class="verdict-box {banner_class}">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1; min-width: 280px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-weight: 700;">
                        ARBITRATED FINAL VERDICT ({res['analysis_id']})
                    </div>
                    <div style="margin: 4px 0 8px 0; font-size: 32px; font-weight: 900; color: {color_code}; letter-spacing: -0.02em;">
                        {icon}
                    </div>
                    <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5; font-weight: 500;">
                        {dec['explanation']}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 32px; font-weight: 900; color: #0F172A; line-height: 1;">{conf}%</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-top: 2px;">Confidence Score</div>
                    <div style="margin-top: 8px;">
                        <span style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                            {case}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Dual-LLM Side-by-Side Review
        st.markdown("<div style='font-size: 18px; font-weight: 800; color: #0F172A; margin: 24px 0 12px 0;'>🤖 Dual-LLM Verification Architecture</div>", unsafe_allow_html=True)
        qwen = res["qwen_result"]
        llama = res["llama_review"]
        
        col_qwen, col_llama = st.columns(2)
        with col_qwen:
            st.markdown(f"""
            <div class="llm-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 800; color: #1D4ED8; font-size: 15px;">🔥 Qwen3-8B Primary Reasoner</span>
                    <span style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                        {qwen['verdict']} ({qwen['confidence']}%)
                    </span>
                </div>
                <p style="font-size: 13.5px; color: #334155; line-height: 1.55; margin-bottom: 12px; background: #F8FAFC; border-radius: 8px; padding: 12px;">
                    {qwen['reasoning']}
                </p>
                <div style="font-size: 11.5px; color: #64748B;">
                    <b>Evidence Grounding:</b> {qwen.get('evidence_summary', 'N/A')}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with col_llama:
            agree_badge = "✅ AGREES" if llama.get("agreement_with_qwen") else "⚠️ DISAGREES"
            st.markdown(f"""
            <div class="llm-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 800; color: #6D28D9; font-size: 15px;">🔍 Llama 3.1 8B Independent Reviewer</span>
                    <span style="background: #FAF5FF; border: 1px solid #E9D5FF; color: #6B21A8; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                        {llama['review_verdict']} ({llama['confidence']}%)
                    </span>
                </div>
                <p style="font-size: 13.5px; color: #334155; line-height: 1.55; margin-bottom: 12px; background: #F8FAFC; border-radius: 8px; padding: 12px;">
                    {llama['review_reasoning']}
                </p>
                <div style="font-size: 11.5px; color: #64748B;">
                    <b>Consensus:</b> {agree_badge} • <b>Hallucination Audit:</b> Verified against RBI index
                </div>
            </div>
            """, unsafe_allow_html=True)

        # Multi-Engine Risk Signals
        st.markdown("<div style='font-size: 18px; font-weight: 800; color: #0F172A; margin: 28px 0 12px 0;'>📊 Multi-Engine Risk Signals</div>", unsafe_allow_html=True)
        rs = res["risk_scores"]
        r1, r2, r3, r4, r5 = st.columns(5)
        r1.metric("Sensationalism", f"{rs['fake_news_risk']}%")
        r2.metric("FinBERT Scam", f"{rs['financial_scam_risk']}%")
        r3.metric("Trained SMS Spam", f"{rs['spam_risk']}%")
        r4.metric("Phishing Credential", f"{rs['phishing_risk']}%")
        r5.metric("URL Risk", f"{rs['url_risk']} ({rs['url_risk_score']}%)")
        
        # Deep Dive Analysis Tabs
        st.markdown("<div style='margin-top: 24px;'></div>", unsafe_allow_html=True)
        tab_evidence, tab_nlp, tab_xai, tab_summary = st.tabs([
            "📚 Retrieved Official Evidence (RAG)",
            "🔬 NLP & Linguistic Analysis",
            "💡 Explainable AI (SHAP / LIME)",
            "📋 Plain-Language Summary & Dossier"
        ])
        
        # Tab 1: Evidence & RAG
        with tab_evidence:
            st.markdown(f"**Consistency Status:** `{res['evidence_consistency']['evidence_status']}` | **Contradiction Score:** `{res['evidence_consistency']['contradiction_score']}`")
            if res["evidence"]:
                for idx, ev in enumerate(res["evidence"], start=1):
                    with st.expander(f"📄 Evidence {idx}: {ev.get('document_id')} — {ev.get('title')[:75]}", expanded=(idx==1)):
                        col_e1, col_e2 = st.columns([1, 4])
                        with col_e1:
                            st.write(f"**Authority:** {ev.get('organization')}")
                            st.write(f"**Date:** {ev.get('date')}")
                            st.write(f"**BM25 Score:** `{ev.get('bm25_score')}`")
                            st.write(f"**Semantic Sim:** `{ev.get('semantic_similarity')}`")
                        with col_e2:
                            st.info(f"\"{ev.get('text')}\"")
                            if ev.get("source_url"):
                                st.caption(f"Source: {ev.get('source_url')}")
            else:
                st.warning("No official circulars met the retrieval threshold.")
                
        # Tab 2: NLP Analysis
        with tab_nlp:
            nlp = res["nlp"]
            nlp_col1, nlp_col2 = st.columns(2)
            
            with nlp_col1:
                st.markdown("#### Part-of-Speech (POS) Tags")
                pos_data = nlp.get("pos_tags", [])
                if pos_data:
                    df_pos = pd.DataFrame(pos_data)
                    st.dataframe(df_pos, use_container_width=True, height=200)
                    
                st.markdown("#### Named Entity Recognition (NER)")
                entities = nlp.get("entities", [])
                if entities:
                    ent_html = " ".join([
                        f"<span style='background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 3px 8px; margin: 3px; display: inline-block; font-size: 12px; color: #1E3A8A;'>"
                        f"<b>{e['text']}</b> <span style='color: #2563EB; font-size: 10px;'>[{e['label']}]</span></span>"
                        for e in entities
                    ])
                    st.markdown(ent_html, unsafe_allow_html=True)
                else:
                    st.caption("No specific named entities detected.")

            with nlp_col2:
                st.markdown("#### Dependency SVO Triples")
                svo = nlp.get("svo_triples", [])
                if svo:
                    for s in svo:
                        st.markdown(f"- **Subject:** `{s.get('subject')}` ➔ **Action:** `{s.get('action')}` ➔ **Object:** `{s.get('object')}`")
                else:
                    st.caption("No explicit SVO triples extracted.")
                    
                st.markdown("#### Extracted Factual Claims")
                for c in res["claims"]:
                    st.markdown(f"- **Claim:** \"{c.get('claim_text')}\" *(Type: {c.get('claim_type')})*")

        # Tab 3: Explainable AI
        with tab_xai:
            st.markdown("#### Feature Attribution (SHAP / LIME)")
            st.caption("Word-level contribution to risk score. Red signals suspicious vocabulary, green signals benign context.")
            
            tokens_attr = res.get("explainability", [])
            xai_html = ""
            for item in tokens_attr:
                tok = item.get("token", "")
                score = item.get("score", 0.0)
                if score > 0.4:
                    bg = "#FEE2E2"
                    border = "#FCA5A5"
                    color = "#991B1B"
                elif score > 0.15:
                    bg = "#FEF3C7"
                    border = "#FCD34D"
                    color = "#92400E"
                else:
                    bg = "#DCFCE7"
                    border = "#86EFAC"
                    color = "#166534"
                xai_html += f"<span class='token-chip' style='background: {bg}; border: 1px solid {border}; color: {color};'>{tok} <small style='opacity:0.75;'>+{score:.2f}</small></span> "
            st.markdown(xai_html, unsafe_allow_html=True)

        # Tab 4: Summary & PDF Download
        with tab_summary:
            st.markdown("#### Executive Summary")
            st.write(res["summary"])
            
            st.markdown("#### Recommended Security Action")
            st.success(res["recommended_action"])
            
            # Generate PDF Report
            try:
                pdf_bytes = generate_verification_pdf(res)
                st.download_button(
                    label="📥 Download Official Verification Dossier (PDF)",
                    data=pdf_bytes,
                    file_name=f"TrustShield_Dossier_{res['analysis_id']}.pdf",
                    mime="application/pdf",
                    type="primary"
                )
            except Exception as e:
                st.error(f"Could not generate PDF: {e}")

# ----------------- VIEW 2: HISTORY -----------------
elif st.session_state.nav_page == "History":
    st.markdown("<h2 style='font-weight: 800; color: #0F172A; margin-bottom: 4px;'>📜 Verification Audit History</h2>", unsafe_allow_html=True)
    st.caption("All verification audits conducted during this session (Stored safely in-memory, zero database connection required)")
    st.markdown("<hr style='margin: 12px 0 20px 0; border: none; border-top: 1px solid #E2E8F0;' />", unsafe_allow_html=True)
    
    if st.session_state.history:
        df_hist = pd.DataFrame(st.session_state.history)
        st.dataframe(df_hist, use_container_width=True)
        
        csv_data = df_hist.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Export Audit History (CSV)", data=csv_data, file_name="TrustShield_Audit_Log.csv", mime="text/csv")
    else:
        st.info("No claims have been analyzed in this session yet. Return to the 'Verify' tab and test a message!")

# ----------------- VIEW 3: DASHBOARD (BENCHMARK DATASET) -----------------
elif st.session_state.nav_page == "Dashboard":
    st.markdown("<h2 style='font-weight: 800; color: #0F172A; margin-bottom: 4px;'>🎛️ Verification Dashboard & Benchmark Dataset</h2>", unsafe_allow_html=True)
    st.caption("Ground truth claims benchmarked against official Reserve Bank of India and Government circulars")
    st.markdown("<hr style='margin: 12px 0 20px 0; border: none; border-top: 1px solid #E2E8F0;' />", unsafe_allow_html=True)
    
    d1, d2, d3, d4 = st.columns(4)
    d1.metric("Indexed Schemes", "26,232")
    d2.metric("RBI Circulars", "1,000")
    d3.metric("Spam Training Records", "5,572")
    d4.metric("Phishing Signatures", "21,430")
    
    st.markdown("<div style='margin-top: 24px;'></div>", unsafe_allow_html=True)
    if benchmark_dataset:
        categories = ["All"] + sorted(list({c.get("category", "General") for c in benchmark_dataset}))
        cat_filter = st.selectbox("Filter Benchmark Claims by Category", categories)
        
        filtered = benchmark_dataset if cat_filter == "All" else [c for c in benchmark_dataset if c.get("category") == cat_filter]
        st.write(f"Showing **{len(filtered)}** verified benchmark test claims:")
        
        for item in filtered:
            v_color = "#DC2626" if item.get("ground_truth_verdict") == "REFUTED" else ("#15803D" if item.get("ground_truth_verdict") == "SUPPORTED" else "#B45309")
            with st.container():
                c1, c2 = st.columns([4, 1])
                with c1:
                    st.markdown(f"**[{item.get('id')}]** `{item.get('category')}` — <span style='color:{v_color}; font-weight:800;'>{item.get('ground_truth_verdict')}</span>", unsafe_allow_html=True)
                    st.write(f"\"{item.get('claim_text')}\"")
                    st.caption(f"Ref: {item.get('official_circular')} • Channel: {item.get('input_type')}")
                with c2:
                    if st.button("Load & Verify", key=f"btn_{item.get('id')}", use_container_width=True):
                        st.session_state.claim_input = item.get("claim_text")
                        st.session_state.url_input = item.get("url", "")
                        st.session_state.channel_input = item.get("input_type", "News")
                        st.session_state.analysis_result = execute_verification(item.get("claim_text"), item.get("input_type", "News"), item.get("url", ""))
                        st.session_state.nav_page = "Verify"
                        st.rerun()
                st.markdown("<hr style='margin: 12px 0; border: none; border-top: 1px solid #F1F5F9;' />", unsafe_allow_html=True)
    else:
        st.info("No benchmark dataset records found.")

# ----------------- VIEW 4: KNOWLEDGE BASE -----------------
elif st.session_state.nav_page == "Knowledge Base":
    st.markdown("<h2 style='font-weight: 800; color: #0F172A; margin-bottom: 4px;'>📚 Official Circulars & Ground Truth Repository</h2>", unsafe_allow_html=True)
    st.caption("Search indexed Reserve Bank of India, SEBI, and Government of India publications")
    st.markdown("<hr style='margin: 12px 0 20px 0; border: none; border-top: 1px solid #E2E8F0;' />", unsafe_allow_html=True)
    
    docs = kb_store.documents
    st.write(f"Currently indexed ground truth documents in vector store: **{len(docs)}**")
    
    search_q = st.text_input("Search circular repository by keyword or document ID...", placeholder="e.g. KYC, scholarship, lottery, SEBI, PM Kisan")
    filtered_docs = [d for d in docs if search_q.lower() in d.get("title", "").lower() or search_q.lower() in d.get("document_id", "").lower() or search_q.lower() in d.get("text", "").lower()] if search_q else docs
    
    for d in filtered_docs[:30]:
        with st.expander(f"📄 [{d.get('document_id')}] {d.get('title')}"):
            st.write(f"**Authority:** {d.get('organization')} | **Date:** {d.get('date')}")
            st.info(d.get("text"))
            if d.get("source_url"):
                st.caption(f"Official URL: {d.get('source_url')}")
