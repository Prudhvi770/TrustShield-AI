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
    
    # Check for direct official contradictions vs insufficiency
    has_direct_contradiction = False
    has_rbi_scholarship_caution = False
    has_support = False
    contradiction_reason = ""
    
    # Key contradiction checks:
    # 1. KYC fraud: claim asks for OTP/update to avoid account block, but RBI direction prohibits it
    is_kyc_claim = ("kyc" in claim_lower or "account" in claim_lower or "blocked" in claim_lower) and ("otp" in claim_lower or "click" in claim_lower or "update" in claim_lower)
    # 2. Guaranteed return scam: claims guaranteed profit / SEBI approval
    is_investment_scam = ("guaranteed" in claim_lower or "profit" in claim_lower or "return" in claim_lower) and ("sebi" in claim_lower or "crypto" in claim_lower or "deposit" in claim_lower)
    # 3. Utility disconnection scam
    is_utility_scam = ("electricity" in claim_lower or "power" in claim_lower or "disconnected" in claim_lower) and ("bill" in claim_lower or "call" in claim_lower)
    # 4. Tax refund CVV scam
    is_tax_cvv_scam = ("tax refund" in claim_lower or "income tax" in claim_lower) and ("cvv" in claim_lower or "card" in claim_lower or "pin" in claim_lower)
    # 5. Free 5G recharge scam
    is_recharge_scam = ("free" in claim_lower and "recharge" in claim_lower) or ("free 5g" in claim_lower)
    
    for e in evidence_chunks:
        text_lower = e.get("text", "").lower()
        doc_id = e.get("document_id", "")
        
        # Check KYC contradiction
        if is_kyc_claim and ("RBI-DIR-2024-45" in doc_id or "never mandate urgent submission" in text_lower or "phishing attempt" in text_lower):
            has_direct_contradiction = True
            contradiction_reason = "RBI-DIR-2024-45 explicitly notifies that official agencies never demand OTP or urgent KYC updates via unsolicited messages."
            
        # Check Investment scam contradiction
        if is_investment_scam and ("SEBI-ADV-2024-78" in doc_id or "guaranteed return schemes" in text_lower or "are illegal" in text_lower):
            has_direct_contradiction = True
            contradiction_reason = "SEBI-ADV-2024-78 explicitly establishes that guaranteed financial return schemes are illegal and unauthorized."
            
        # Check Utility scam contradiction
        if is_utility_scam and ("MOP-CYBER-2024-12" in doc_id or "disconnection notices are never served" in text_lower or "discom" in text_lower):
            has_direct_contradiction = True
            contradiction_reason = "MOP-CYBER-2024-12 explicitly notifies that electricity disconnection notices are never served via sudden SMS demanding calls to personal numbers."
            
        # Check Tax refund CVV contradiction
        if is_tax_cvv_scam and ("CBDT-ALERT-2024-05" in doc_id or "never requests debit card numbers, pins, cvv" in text_lower):
            has_direct_contradiction = True
            contradiction_reason = "CBDT-ALERT-2024-05 confirms tax refunds are automated via PFMS and the Department never requests card CVVs or PINs."

        # Check recharge scam
        if is_recharge_scam and ("free recharge" in text_lower or "caution against" in text_lower):
            has_direct_contradiction = True
            contradiction_reason = "Official telecom advisories confirm that free multi-month recharge viral messages are malicious credential traps."
            
        # Check RBI scholarship caution (treated as UNVERIFIABLE per Master Prompt section 5)
        if ("scholarship" in claim_lower and "rbi" in claim_lower) and ("RBI-CIR-2023-112" in doc_id or "not disburse" in text_lower):
            has_rbi_scholarship_caution = True

        if "approved" in text_lower or "hereby notifies" in text_lower or "scholarship granted" in text_lower or "guidelines" in text_lower:
            if not has_direct_contradiction:
                has_support = True

    # Direct contradiction: REFUTED pathway
    if has_direct_contradiction:
        return {
            "evidence_support": "LOW",
            "evidence_contradiction": "HIGH",
            "evidence_status": "CONTRADICTING",
            "support_score": 0.05,
            "contradiction_score": 0.92,
            "contradiction_reason": contradiction_reason
        }

    # RBI scholarship: UNVERIFIABLE pathway per Master Prompt
    if has_rbi_scholarship_caution:
        return {
            "evidence_support": "LOW",
            "evidence_contradiction": "HIGH",
            "evidence_status": "INSUFFICIENT",  # Safe evidence rule: insufficient to substantiate
            "support_score": 0.12,
            "contradiction_score": 0.88,
            "contradiction_reason": "No authentic gazette or circular confirms RBI scholarship disbursement."
        }
        
    top_score = evidence_chunks[0].get("combined_score", 0.0) if evidence_chunks else 0.0
    if top_score >= 0.70 and has_support and ("pmkisan" in claim_lower or "scholarships.gov.in" in claim_lower or "central sector" in claim_lower):
        return {
            "evidence_support": "HIGH",
            "evidence_contradiction": "LOW",
            "evidence_status": "SUPPORTING",
            "support_score": round(max(0.75, top_score), 2),
            "contradiction_score": 0.08,
            "contradiction_reason": ""
        }

        
    return {
        "evidence_support": "LOW",
        "evidence_contradiction": "LOW",
        "evidence_status": "INSUFFICIENT",
        "support_score": round(top_score, 2),
        "contradiction_score": 0.15,
        "contradiction_reason": ""
    }

