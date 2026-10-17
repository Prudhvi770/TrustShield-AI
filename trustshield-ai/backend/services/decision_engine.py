from typing import Dict, Any

def execute_decision_engine(
    qwen_verdict: str,
    qwen_confidence: float,
    llama_verdict: str,
    llama_confidence: float,
    evidence_support_score: float,
    evidence_contradiction_score: float,
    evidence_status: str,
    fake_news_risk: float,
    financial_scam_risk: float,
    spam_risk: float,
    phishing_risk: float,
    url_risk: str
) -> Dict[str, Any]:
    """
    DECISION ENGINE (decision_engine.py)
    Transparent rule-based multi-LLM fusion and evidence arbitration:
    
    Case 1 : Both models agree SUPPORTED and evidence strongly supports -> SUPPORTED
    Case 2 : Both models agree REFUTED and trusted evidence contradicts -> REFUTED
    Case 3 : Both models agree UNVERIFIABLE and evidence is insufficient -> UNVERIFIABLE
    Case 4 : Models disagree (e.g. Qwen SUPPORTED, Llama REFUTED) -> Evidence consistency priority check.
             If ambiguous -> UNVERIFIABLE, agreement: false.
    """
    # Calculate overall risk level
    high_risks = [fake_news_risk > 70, financial_scam_risk > 70, phishing_risk > 70, url_risk == "HIGH"]
    risk_level = "HIGH" if sum(high_risks) >= 2 else ("MEDIUM" if sum(high_risks) == 1 else "LOW")
    
    # Case 1: Both models agree SUPPORTED
    if qwen_verdict == "SUPPORTED" and llama_verdict == "SUPPORTED":
        if evidence_support_score >= 0.70 and evidence_status == "SUPPORTING":
            avg_conf = round((qwen_confidence + llama_confidence) / 2.0, 1)
            return {
                "final_verdict": "SUPPORTED",
                "confidence": avg_conf,
                "agreement": True,
                "risk_level": "LOW",
                "decision_case": "Case 1 : Unanimous Agreement Supported by Verified Evidence",
                "explanation": "Both Qwen3-8B and Llama 3.1 8B agree that the claim is verified and directly supported by official publications."
            }
            
    # Case 2: Both models agree REFUTED
    if qwen_verdict == "REFUTED" and llama_verdict == "REFUTED":
        if evidence_contradiction_score >= 0.65 or evidence_status == "CONTRADICTING":
            avg_conf = round((qwen_confidence + llama_confidence) / 2.0, 1)
            return {
                "final_verdict": "REFUTED",
                "confidence": avg_conf,
                "agreement": True,
                "risk_level": risk_level,
                "decision_case": "Case 2 : Unanimous Refutation with Direct Official Contradiction",
                "explanation": "Both models and official records explicitly refute the validity of this claim."
            }
            
    # Case 3: Both models agree UNVERIFIABLE
    if qwen_verdict == "UNVERIFIABLE" and llama_verdict == "UNVERIFIABLE":
        avg_conf = round((qwen_confidence + llama_confidence) / 2.0, 1)
        return {
            "final_verdict": "UNVERIFIABLE",
            "confidence": avg_conf,
            "agreement": True,
            "risk_level": risk_level,
            "decision_case": "Case 3 : Unanimous Unverifiable with Insufficient Evidence",
            "explanation": "Both Qwen3-8B and Llama 3.1 8B independently concluded that the claim cannot be verified from authentic official sources."
        }
        
    # Case 4: Models disagree
    # Arbitrate using the Evidence Consistency Checker
    if evidence_support_score > 0.80:
        return {
            "final_verdict": "SUPPORTED",
            "confidence": round(evidence_support_score * 100, 1),
            "agreement": False,
            "risk_level": "LOW",
            "decision_case": "Case 4 : Model Disagreement Resolved by High Evidence Support",
            "explanation": "Models diverged, but verified official evidence conclusively confirms the claim."
        }
    elif evidence_contradiction_score > 0.80:
        return {
            "final_verdict": "REFUTED",
            "confidence": round(evidence_contradiction_score * 100, 1),
            "agreement": False,
            "risk_level": "HIGH",
            "decision_case": "Case 4 : Model Disagreement Resolved by Explicit Official Contradiction",
            "explanation": "Models diverged, but official regulatory advisories contradict the claim."
        }
    else:
        return {
            "final_verdict": "UNVERIFIABLE",
            "confidence": 85.0,
            "agreement": False,
            "risk_level": risk_level,
            "decision_case": "Case 4 : Model Disagreement with Ambiguous Evidence Fallback",
            "explanation": "Models disagreed and evidence was insufficient to substantiate either position. Defaulting to UNVERIFIABLE per safe evidence principle."
        }
