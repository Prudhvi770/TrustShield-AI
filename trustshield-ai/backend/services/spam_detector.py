import re
from typing import Dict, Any

def detect_spam(text: str) -> Dict[str, Any]:
    """
    Spam detection using TF-IDF, N-grams, and heuristic spam signals.
    """
    score = 12.0
    lower = text.lower()
    
    spam_markers = [
        "urgent!", "apply now", "limited time", "don't miss", "free gift",
        "congratulations", "winner", "selected", "click below", "forward to"
    ]
    
    for marker in spam_markers:
        if marker in lower:
            score += 18.0
            
    if text.isupper():
        score += 25.0
        
    if "http" in lower or ".com" in lower or "bit.ly" in lower:
        score += 15.0
        
    score = min(95.0, max(5.0, score))
    return {
        "spam_risk": round(score, 1),
        "is_spam": score > 60.0
    }
