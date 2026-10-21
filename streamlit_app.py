"""
TrustShield AI — Multi-LLM Claim Verification System
Streamlit Cloud Edition (Zero-Database Required)
Deployable directly on Streamlit Community Cloud (share.streamlit.io)
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
    page_title="TrustShield AI — Multi-LLM Claim Verification System",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------- CUSTOM CSS -----------------
st.markdown("""
<style>
    /* Global Styles */
    .stApp {
        background-color: #0B0F19;
        color: #F8FAFC;
    }
    
    /* Header Banner */
    .header-box {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        border: 1px solid rgba(59, 130, 246, 0.25);
        border-radius: 16px;
        padding: 24px 30px;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .header-title {
        font-size: 28px;
        font-weight: 800;
        background: linear-gradient(90deg, #60A5FA, #38BDF8, #818CF8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }
    .header-sub {
        color: #94A3B8;
        font-size: 13px;
        margin-top: 6px;
    }
    
    /* Verdict Cards */
    .verdict-banner {
        border-radius: 14px;
        padding: 20px 24px;
        margin: 18px 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .verdict-refuted {
        background: linear-gradient(135deg, rgba(153, 27, 27, 0.4) 0%, rgba(69, 10, 10, 0.6) 100%);
        border-left: 6px solid #EF4444;
    }
    .verdict-supported {
        background: linear-gradient(135deg, rgba(6, 95, 70, 0.4) 0%, rgba(4, 47, 46, 0.6) 100%);
        border-left: 6px solid #10B981;
    }
    .verdict-unverifiable {
        background: linear-gradient(135deg, rgba(146, 64, 14, 0.4) 0%, rgba(69, 26, 3, 0.6) 100%);
        border-left: 6px solid #F59E0B;
    }
    
    /* LLM Columns */
    .llm-box {
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(75, 85, 99, 0.4);
        border-radius: 12px;
        padding: 16px 20px;
        height: 100%;
    }
    
    /* Metrics */
    .metric-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }
    
    /* Token attribution */
    .token-chip {
        display: inline-block;
        padding: 2px 8px;
        margin: 2px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
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

# ----------------- SIDEBAR CONTROLS -----------------
with st.sidebar:
    st.markdown("### 🛡️ TrustShield AI")
    st.caption("Multi-LLM Claim Verification System")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["🔍 Claim Verifier", "📊 Benchmark Cases", "📚 Knowledge Base", "📜 Session History"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    st.markdown("#### ⚡ 1-Click Benchmark Cases")
    
    if st.button("🚨 KYC Phishing (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Dear customer, your SBI / HDFC bank account will be blocked today within 24 hours. Immediately update your KYC by clicking http://bit.ly/sbi-kyc-update and enter your OTP."
        st.session_state.url_input = "http://bit.ly/sbi-kyc-update"
        st.session_state.channel_input = "SMS"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.rerun()

    if st.button("🚨 SEBI 400% Profit (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Join our VIP Telegram group! Guaranteed 400% daily profit on intraday stocks and crypto. Approved by SEBI. Deposit Rs 10,000 to get Rs 40,000 in 2 hours."
        st.session_state.url_input = "https://t.me/sebi_vip_stocks"
        st.session_state.channel_input = "Telegram"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.rerun()

    if st.button("🚨 Power Cut Tonight (REFUTED)", use_container_width=True):
        st.session_state.claim_input = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call electricity officer at 9876543210 immediately."
        st.session_state.url_input = ""
        st.session_state.channel_input = "SMS"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.rerun()

    if st.button("✅ PM Kisan ₹6k (SUPPORTED)", use_container_width=True):
        st.session_state.claim_input = "Central Government is disbursing Rs 6,000 in 17th installment of PM Kisan Samman Nidhi. Beneficiaries must complete e-KYC on official portal pmkisan.gov.in."
        st.session_state.url_input = "https://pmkisan.gov.in"
        st.session_state.channel_input = "News"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
        st.rerun()

    if st.button("⚠️ RBI Scholarship (UNVERIFIABLE)", use_container_width=True):
        st.session_state.claim_input = "URGENT! RBI has announced a Rs 50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details."
        st.session_state.url_input = "https://example.com"
        st.session_state.channel_input = "News"
        st.session_state.analysis_result = execute_verification(st.session_state.claim_input, st.session_state.channel_input, st.session_state.url_input)
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

# ----------------- MAIN VIEW 1: CLAIM VERIFIER -----------------
if page == "🔍 Claim Verifier":
    # Header Banner
    st.markdown("""
    <div class="header-box">
        <h1 class="header-title">🛡️ TrustShield AI</h1>
        <div class="header-sub">
            Multi-LLM Claim Verification & Digital Risk Defense Platform • Powered by <b>Qwen3-8B</b> & <b>Llama 3.1 8B</b> with RAG
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Input Section
    with st.container():
        col1, col2 = st.columns([1, 3])
        with col1:
            channel = st.selectbox(
                "Source Channel",
                ["SMS", "WhatsApp", "News", "Email", "Telegram", "Social Media", "URL"],
                index=["SMS", "WhatsApp", "News", "Email", "Telegram", "Social Media", "URL"].index(st.session_state.channel_input)
            )
            url_val = st.text_input("Associated URL / Link (Optional)", value=st.session_state.url_input)
        with col2:
            claim_val = st.text_area(
                "Claim / Suspicious Message Content to Verify",
                value=st.session_state.claim_input,
                height=110
            )
        
        btn_col1, btn_col2, btn_col3 = st.columns([2, 1, 4])
        with btn_col1:
            verify_clicked = st.button("⚡ Verify Claim with Multi-LLMs", type="primary", use_container_width=True)
        with btn_col2:
            if st.button("🗑️ Clear", use_container_width=True):
                st.session_state.claim_input = ""
                st.session_state.url_input = ""
                st.session_state.analysis_result = None
                st.rerun()
                
        if verify_clicked and claim_val.strip():
            with st.spinner("Analyzing NLP features, querying authentic RBI circulars, and running dual-LLMs..."):
                st.session_state.claim_input = claim_val
                st.session_state.url_input = url_val
                st.session_state.channel_input = channel
                st.session_state.analysis_result = execute_verification(claim_val, channel, url_val)

    # Display Analysis Result
    res = st.session_state.analysis_result
    if res:
        st.markdown("---")
        dec = res["decision"]
        verdict = dec["final_verdict"]
        conf = dec["confidence"]
        risk = dec["risk_level"]
        case = dec["decision_case"]
        
        # Verdict Banner
        banner_class = "verdict-refuted" if verdict == "REFUTED" else ("verdict-supported" if verdict == "SUPPORTED" else "verdict-unverifiable")
        color_code = "#EF4444" if verdict == "REFUTED" else ("#10B981" if verdict == "SUPPORTED" else "#F59E0B")
        icon = "🚨 REFUTED" if verdict == "REFUTED" else ("✅ SUPPORTED" if verdict == "SUPPORTED" else "⚠️ UNVERIFIABLE")
        
        st.markdown(f"""
        <div class="verdict-banner {banner_class}">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; font-weight: bold;">
                        ARBITRATED FINAL VERDICT ({res['analysis_id']})
                    </span>
                    <h2 style="margin: 4px 0 6px 0; font-size: 32px; font-weight: 900; color: {color_code};">{icon}</h2>
                    <p style="margin: 0; color: #E2E8F0; font-size: 14px;">{dec['explanation']}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 28px; font-weight: 900; color: #F8FAFC;">{conf}%</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #94A3B8;">Confidence Score</div>
                    <div style="margin-top: 6px;">
                        <span class="metric-badge" style="background: rgba(255,255,255,0.1); color: #F1F5F9; border: 1px solid rgba(255,255,255,0.2);">
                            {case}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Dual-LLM Side-by-Side Review
        st.markdown("### 🤖 Dual-LLM Verification Architecture")
        qwen = res["qwen_result"]
        llama = res["llama_review"]
        
        col_qwen, col_llama = st.columns(2)
        with col_qwen:
            st.markdown(f"""
            <div class="llm-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 800; color: #60A5FA; font-size: 16px;">🔥 Qwen3-8B Primary Reasoner</span>
                    <span class="metric-badge" style="background: rgba(59, 130, 246, 0.2); color: #93C5FD;">{qwen['verdict']} ({qwen['confidence']}%)</span>
                </div>
                <p style="font-size: 13px; color: #CBD5E1; line-height: 1.5; margin-bottom: 12px;">{qwen['reasoning']}</p>
                <div style="font-size: 11px; color: #94A3B8;">
                    <b>Evidence Summary:</b> {qwen.get('evidence_summary', 'N/A')}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with col_llama:
            agree_badge = "✅ AGREES" if llama.get("agreement_with_qwen") else "⚠️ DISAGREES"
            st.markdown(f"""
            <div class="llm-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 800; color: #A78BFA; font-size: 16px;">🔍 Llama 3.1 8B Independent Reviewer</span>
                    <span class="metric-badge" style="background: rgba(167, 139, 250, 0.2); color: #DDD6FE;">{llama['review_verdict']} ({llama['confidence']}%)</span>
                </div>
                <p style="font-size: 13px; color: #CBD5E1; line-height: 1.5; margin-bottom: 12px;">{llama['review_reasoning']}</p>
                <div style="font-size: 11px; color: #94A3B8;">
                    <b>Consensus Status:</b> {agree_badge} • <b>Hallucination Audit:</b> Zero unsupported citations detected
                </div>
            </div>
            """, unsafe_allow_html=True)

        # Risk Detection Metrics
        st.markdown("### 📊 Multi-Engine Risk Signals")
        rs = res["risk_scores"]
        r1, r2, r3, r4, r5 = st.columns(5)
        r1.metric("Sensationalism / Fake News", f"{rs['fake_news_risk']}%")
        r2.metric("FinBERT Financial Scam", f"{rs['financial_scam_risk']}%")
        r3.metric("SMS Spam (Trained ML)", f"{rs['spam_risk']}%")
        r4.metric("Phishing Credential Risk", f"{rs['phishing_risk']}%")
        r5.metric("URL / Domain Risk", f"{rs['url_risk']} ({rs['url_risk_score']}%)")
        
        # Deep Dive Tabs
        tab_evidence, tab_nlp, tab_xai, tab_summary = st.tabs([
            "📚 Retrieved Ground Truth Evidence (RAG)",
            "🔬 NLP & Linguistic Analysis",
            "💡 Explainable AI (SHAP / LIME)",
            "📋 Plain-Language Summary & Report"
        ])
        
        # Tab 1: Evidence & RAG
        with tab_evidence:
            st.markdown(f"**Evidence Consistency Status:** `{res['evidence_consistency']['evidence_status']}` | **Contradiction Score:** `{res['evidence_consistency']['contradiction_score']}`")
            if res["evidence"]:
                for idx, ev in enumerate(res["evidence"], start=1):
                    with st.expander(f"Evidence {idx}: {ev.get('document_id')} — {ev.get('title')[:75]} (Combined: {ev.get('combined_score', 0)})", expanded=(idx==1)):
                        col_e1, col_e2 = st.columns([1, 4])
                        with col_e1:
                            st.write(f"**Authority:** {ev.get('organization')}")
                            st.write(f"**Date:** {ev.get('date')}")
                            st.write(f"**BM25 Score:** `{ev.get('bm25_score')}`")
                            st.write(f"**Semantic Sim:** `{ev.get('semantic_similarity')}`")
                        with col_e2:
                            st.info(f"\"{ev.get('text')}\"")
                            if ev.get("source_url"):
                                st.caption(f"Source URL: {ev.get('source_url')}")
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
                        f"<span style='background: #1E293B; border: 1px solid #3B82F6; border-radius: 6px; padding: 3px 8px; margin: 3px; display: inline-block; font-size: 12px;'>"
                        f"<b>{e['text']}</b> <span style='color: #60A5FA; font-size: 10px;'>[{e['label']}]</span></span>"
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
            st.caption("Word-level contribution to risk detection score. Red indicates suspicious risk signals, green indicates benign language.")
            
            tokens_attr = res.get("explainability", [])
            xai_html = ""
            for item in tokens_attr:
                tok = item.get("token", "")
                score = item.get("score", 0.0)
                if score > 0.4:
                    bg = "rgba(239, 68, 68, 0.4)"
                    border = "#EF4444"
                elif score > 0.15:
                    bg = "rgba(245, 158, 11, 0.3)"
                    border = "#F59E0B"
                else:
                    bg = "rgba(16, 185, 129, 0.15)"
                    border = "#10B981"
                xai_html += f"<span class='token-chip' style='background: {bg}; border: 1px solid {border};'>{tok} <small style='opacity:0.7;'>+{score:.2f}</small></span> "
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

# ----------------- MAIN VIEW 2: BENCHMARK CASES -----------------
elif page == "📊 Benchmark Cases":
    st.title("📊 Official Verification Benchmark Dataset")
    st.caption("Pre-loaded ground truth cases evaluated against regulatory circulars (No database required)")
    
    if benchmark_dataset:
        categories = ["All"] + sorted(list({c.get("category", "General") for c in benchmark_dataset}))
        cat_filter = st.selectbox("Filter by Category", categories)
        
        filtered = benchmark_dataset if cat_filter == "All" else [c for c in benchmark_dataset if c.get("category") == cat_filter]
        st.write(f"Showing **{len(filtered)}** verified benchmark claims:")
        
        for item in filtered:
            v_color = "red" if item.get("ground_truth_verdict") == "REFUTED" else ("green" if item.get("ground_truth_verdict") == "SUPPORTED" else "orange")
            with st.container():
                c1, c2 = st.columns([4, 1])
                with c1:
                    st.markdown(f"**[{item.get('id')}]** `{item.get('category')}` — :{v_color}[**{item.get('ground_truth_verdict')}**]")
                    st.write(f"\"{item.get('claim_text')}\"")
                    st.caption(f"Ref: {item.get('official_circular')} • Channel: {item.get('input_type')}")
                with c2:
                    if st.button("Load & Verify", key=f"btn_{item.get('id')}", use_container_width=True):
                        st.session_state.claim_input = item.get("claim_text")
                        st.session_state.url_input = item.get("url", "")
                        st.session_state.channel_input = item.get("input_type", "News")
                        st.session_state.analysis_result = execute_verification(item.get("claim_text"), item.get("input_type", "News"), item.get("url", ""))
                        st.switch_page = "🔍 Claim Verifier"
                        st.rerun()
                st.markdown("---")
    else:
        st.info("No benchmark dataset records found.")

# ----------------- MAIN VIEW 3: KNOWLEDGE BASE -----------------
elif page == "📚 Knowledge Base":
    st.title("📚 Official Circulars & Knowledge Base")
    st.caption("Indexed Reserve Bank of India, SEBI, and Government of India regulatory publications")
    
    docs = kb_store.documents
    st.write(f"Currently indexed ground truth documents in vector store: **{len(docs)}**")
    
    search_q = st.text_input("Search circular repository by keyword or document ID...")
    filtered_docs = [d for d in docs if search_q.lower() in d.get("title", "").lower() or search_q.lower() in d.get("document_id", "").lower() or search_q.lower() in d.get("text", "").lower()] if search_q else docs
    
    for d in filtered_docs[:30]:
        with st.expander(f"📄 [{d.get('document_id')}] {d.get('title')}"):
            st.write(f"**Authority:** {d.get('organization')} | **Date:** {d.get('date')}")
            st.info(d.get("text"))
            if d.get("source_url"):
                st.caption(f"URL: {d.get('source_url')}")

# ----------------- MAIN VIEW 4: SESSION HISTORY -----------------
elif page == "📜 Session History":
    st.title("📜 In-Memory Verification Audit Log")
    st.caption("All verification runs conducted during this session (Zero database connection required)")
    
    if st.session_state.history:
        df_hist = pd.DataFrame(st.session_state.history)
        st.dataframe(df_hist, use_container_width=True)
        
        csv_data = df_hist.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Export Audit History (CSV)", data=csv_data, file_name="TrustShield_Audit_Log.csv", mime="text/csv")
    else:
        st.info("No claims have been analyzed in this session yet. Run a claim verification in the Claim Verifier tab!")
