import os
import re
from typing import Dict, Any

_SPAM_MODEL = None

def _get_spam_model():
    global _SPAM_MODEL
    if _SPAM_MODEL is None:
        try:
            import joblib
            model_path = os.path.join(os.path.dirname(__file__), "..", "data", "spam_model.joblib")
            if os.path.exists(model_path):
                _SPAM_MODEL = joblib.load(model_path)
        except Exception:
            _SPAM_MODEL = False
    return _SPAM_MODEL if _SPAM_MODEL is not False else None

def detect_spam(text: str) -> Dict[str, Any]:
    """
    Spam detection using TF-IDF, N-grams, trained SMS Spam dataset classifier,
    and heuristic spam signals.
    """
    lower = text.lower()
    model = _get_spam_model()
    
    if model is not None:
        try:
            prob = float(model.predict_proba([text])[0][1]) * 100.0
            score = prob
        except Exception:
            score = 15.0
    else:
        score = 12.0
        spam_markers = [
            "urgent!", "apply now", "limited time", "don't miss", "free gift",
            "congratulations", "winner", "selected", "click below", "forward to"
        ]
        for marker in spam_markers:
            if marker in lower:
                score += 18.0

    # Heuristic adjustment for formatting
    if text.isupper() and len(text) > 10:
        score += 15.0
        
    if "http" in lower or ".com" in lower or "bit.ly" in lower:
        score += 10.0
        
    score = min(99.0, max(1.0, score))
    return {
        "spam_risk": round(score, 1),
        "is_spam": score > 55.0,
        "model_source": "SMS Spam Dataset TF-IDF Pipeline" if model else "Heuristic Rule Engine"
    }

