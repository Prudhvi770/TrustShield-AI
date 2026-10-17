import re
from typing import Dict, Any, List

def detect_phishing(text: str, url: str = None) -> Dict[str, Any]:
    """
    Phishing Detector:
    Analyzes urgency, credential requests, OTP requests, Aadhaar/PAN collection,
    and coercive social engineering.
    """
    score = 10.0
    indicators = []
    lower = text.lower()
    
    # 1. Urgency cues
    if "urgent" in lower or "immediately" in lower or "act now" in lower or "within 24 hours" in lower:
        score += 22.0
        indicators.append("Artificial high urgency cues present")
        
    # 2. Identity & Credential theft cues
    if "aadhaar" in lower:
        score += 25.0
        indicators.append("Aadhaar identification number requested")
        
    if "pan" in lower and ("card" in lower or "details" in lower):
        score += 20.0
        indicators.append("PAN card identity requested")
        
    if "otp" in lower or "password" in lower or "pin" in lower:
        score += 30.0
        indicators.append("Sensitive OTP/PIN/Password requested")
        
    # 3. Call to Action / Web link
    if "apply now" in lower or "click" in lower or "link" in lower:
        score += 15.0
        indicators.append("Call-to-action redirecting to external form")
        
    if url or "http" in lower or "bit.ly" in lower or ".com" in lower:
        score += 15.0
        indicators.append("External hyperlink included in unverified message")
        
    score = min(98.0, max(5.0, score))
    return {
        "phishing_risk": round(score, 1),
        "indicators": indicators,
        "is_phishing_suspect": score > 65.0
    }
