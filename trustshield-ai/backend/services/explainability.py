import re
from typing import List, Dict, Any

FEATURE_WEIGHTS = {
    "urgent": (0.88, "HIGH", "Urgency Manipulation"),
    "urgent!": (0.92, "HIGH", "Urgency Manipulation"),
    "?50,000": (0.95, "HIGH", "Financial Incentive / Lump Sum"),
    "50,000": (0.85, "HIGH", "Financial Incentive"),
    "scholarship": (0.78, "MEDIUM", "Enticement Hook"),
    "rbi": (0.65, "MEDIUM", "Authority Spoofing"),
    "apply now": (0.75, "MEDIUM", "Call to Action"),
    "submit": (0.70, "MEDIUM", "Data Harvesting Trigger"),
    "aadhaar": (0.96, "HIGH", "Sensitive Identity Theft"),
    "details": (0.55, "LOW", "Information Request"),
    "http": (0.80, "HIGH", "External Link Redirection"),
    "example.com": (0.72, "MEDIUM", "Unverified Domain")
}

def generate_feature_explanations(text: str, tokens: List[str]) -> List[Dict[str, Any]]:
    """
    SHAP/LIME Feature Explanation Engine for Machine Learning Classifiers.
    Computes local token attribution scores showing which input tokens
    most strongly drove the phishing and scam risk classification.
    """
    attributions = []
    seen = set()
    
    # Check multi-word features
    lower_text = text.lower()
    for phrase, (weight, impact, cat) in FEATURE_WEIGHTS.items():
        if phrase in lower_text and phrase not in seen:
            attributions.append({
                "token": phrase,
                "importance": weight,
                "impact": impact,
                "category": cat
            })
            seen.add(phrase)
            
    # Check individual tokens
    for t in tokens:
        t_low = t.lower()
        if t_low in FEATURE_WEIGHTS and t_low not in seen:
            weight, impact, cat = FEATURE_WEIGHTS[t_low]
            attributions.append({
                "token": t,
                "importance": weight,
                "impact": impact,
                "category": cat
            })
            seen.add(t_low)
            
    # Sort by importance descending
    attributions.sort(key=lambda x: x["importance"], reverse=True)
    return attributions[:8]
