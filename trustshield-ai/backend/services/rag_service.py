from typing import List, Dict, Any
from services.vector_store import kb_store

def retrieve_rag_evidence(claim_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Hybrid retrieval combining BM25 keyword matching and Sentence-BERT semantic similarity.
    Queries the official Knowledge Base for relevant verified circulars.
    """
    return kb_store.hybrid_search(claim_text, top_k=top_k)

def build_rag_prompt(claim_text: str, evidence_chunks: List[Dict[str, Any]], risk_summary: Dict[str, Any]) -> str:
    """
    Builds the constrained RAG prompt ensuring models do NOT hallucinate evidence.
    """
    evidence_text = ""
    for idx, e in enumerate(evidence_chunks, start=1):
        evidence_text += f"\n[Evidence {idx}]\n"
        evidence_text += f"Title: {e.get('title')}\n"
        evidence_text += f"Organization: {e.get('organization')}\n"
        evidence_text += f"Date: {e.get('date')}\n"
        evidence_text += f"Source URL: {e.get('source_url')}\n"
        evidence_text += f"Content: {e.get('text')}\n"
        
    prompt = f"""You are Qwen3-8B, the primary claim verification model in TrustShield AI.
Your sole mission is to verify the extracted claim against the trusted evidence provided below.

CRITICAL INSTRUCTIONS:
1. Determine whether the claim is SUPPORTED, REFUTED, or UNVERIFIABLE.
2. Use ONLY the supplied evidence. Do not invent sources, circulars, or facts.
3. If the retrieved evidence is insufficient to prove or disprove the claim, return UNVERIFIABLE.
4. The trusted evidence layer has absolute authority.

CLAIM TO VERIFY:
"{claim_text}"

RETRIEVED TRUSTED EVIDENCE:
{evidence_text}

RISK SIGNALS DETECTED:
- Fake News Risk: {risk_summary.get('fake_news_risk')}%
- Financial Scam Risk: {risk_summary.get('financial_scam_risk')}%
- Phishing Risk: {risk_summary.get('phishing_risk')}%
- URL Risk: {risk_summary.get('url_risk')}

Output valid JSON only:
{{
  "verdict": "SUPPORTED | REFUTED | UNVERIFIABLE",
  "confidence": <integer between 0 and 100>,
  "reasoning": "<concise explanation based strictly on evidence>",
  "evidence_ids": ["<list of matching document_ids>"],
  "evidence_summary": "<summary of what the evidence confirms or lacks>",
  "warnings": ["<any warning flags>"]
}}
"""
    return prompt
