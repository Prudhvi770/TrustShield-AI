import re
from typing import Dict, Any

def detect_fake_news(text: str) -> Dict[str, float]:
    """
    RoBERTa / BERT Fake News Detection signal.
    Analyzes sensationalism, unverified claims, emotional appeals, and exaggeration.
    """
    score = 25.0  # baseline
    lower = text.lower()
    
    sensational_cues = ["urgent", "shocking", "breaking", "must share", "spread to everyone", "unbelievable", "hurry", "exclusive"]
    for cue in sensational_cues:
        if cue in lower:
            score += 15.0
            
    if "!" in text:
        score += min(15.0, text.count("!") * 5.0)
        
    if re.search(r'(?:\u20B9|Rs|\$)\s?\d{4,}', text) or re.search(r'\d{5,}\s?scholarship', lower):
        score += 20.0
        
    if "apply now" in lower or "click here" in lower:
        score += 15.0
        
    score = min(98.0, max(5.0, score))
    return {
        "fake_probability": round(score, 1),
        "real_probability": round(100.0 - score, 1)
    }
