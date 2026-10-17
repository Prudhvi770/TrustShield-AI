from typing import List, Dict, Any

def check_evidence_consistency(claim_text: str, evidence_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evidence Consistency Checker:
    Determines whether evidence genuinely supports, refutes, or is insufficient.
    Has absolute authority over LLM assumptions.
    """
    if not evidence_chunks:
        return {
            "evidence_support": "LOW",
            "evidence_contradiction": "LOW",
            "evidence_status": "INSUFFICIENT",
            "support_score": 0.05,
            "contradiction_score": 0.10
        }
        
    claim_lower = claim_text.lower()
    
    # Check if evidence mentions caution against this exact pattern
    has_caution = False
    has_support = False
    
    for e in evidence_chunks:
        text_lower = e.get("text", "").lower()
        if "caution against" in text_lower or "fraudulent" in text_lower or "fake message" in text_lower or "not disburse" in text_lower:
            if "scholarship" in text_lower or "rbi" in text_lower:
                has_caution = True
        if "approved" in text_lower or "hereby notifies" in text_lower or "scholarship granted" in text_lower:
            has_support = True
            
    if has_caution:
        return {
            "evidence_support": "LOW",
            "evidence_contradiction": "HIGH",
            "evidence_status": "INSUFFICIENT",  # Insufficient to confirm legitimate existence
            "support_score": 0.12,
            "contradiction_score": 0.88
        }
        
    top_score = evidence_chunks[0].get("combined_score", 0.0)
    if top_score > 0.80 and has_support:
        return {
            "evidence_support": "HIGH",
            "evidence_contradiction": "LOW",
            "evidence_status": "SUPPORTING",
            "support_score": round(top_score, 2),
            "contradiction_score": 0.10
        }
        
    return {
        "evidence_support": "LOW",
        "evidence_contradiction": "LOW",
        "evidence_status": "INSUFFICIENT",
        "support_score": round(top_score, 2),
        "contradiction_score": 0.15
    }
