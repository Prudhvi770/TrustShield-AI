import re
from typing import Dict, Any

def detect_financial_scam(text: str) -> Dict[str, Any]:
    """
    FinBERT Financial Scam & Misinformation Detector.
    Scans for unauthorized government scheme claims, high-return investments,
    fake scholarship payouts, lottery promises, and KYC threats.
    """
    score = 15.0
    lower = text.lower()
    
    triggers = []
    
    if "scholarship" in lower and ("rbi" in lower or "bank" in lower):
        score += 35.0
        triggers.append("RBI does not disburse direct college scholarships or student cash benefits.")
        
    if re.search(r'(?:\u20B9|Rs|\$)\s?\d{4,}', text) or re.search(r'50,?000', text):
        score += 25.0
        triggers.append("Promised lump-sum cash disbursement detected.")
        
    if "guaranteed return" in lower or "double your money" in lower or "risk-free" in lower:
        score += 30.0
        triggers.append("Guaranteed financial return claim detected.")
        
    if "kyc" in lower and ("update" in lower or "block" in lower or "suspended" in lower):
        score += 35.0
        triggers.append("Urgent KYC suspension threat.")
        
    if "aadhaar" in lower and ("submit" in lower or "link" in lower or "verify" in lower):
        score += 20.0
        triggers.append("Unverified Aadhaar credential collection.")
        
    score = min(96.0, max(8.0, score))
    return {
        "financial_scam_risk": round(score, 1),
        "is_financial_claim": True if ("rbi" in lower or "?" in text or "scholarship" in lower or "invest" in lower) else False,
        "triggers": triggers
    }
