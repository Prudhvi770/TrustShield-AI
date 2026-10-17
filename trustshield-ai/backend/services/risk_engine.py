from typing import Dict, Any

def aggregate_risk_scores(
    fake_news_risk: float,
    financial_scam_risk: float,
    spam_risk: float,
    phishing_risk: float,
    url_risk_score: float,
    evidence_contradiction: float
) -> Dict[str, Any]:
    """
    Configurable Risk Aggregation Engine:
    Weighted composite score:
    - Phishing: 25%
    - Financial Scam: 25%
    - URL Risk: 20%
    - Fake News: 15%
    - Spam: 15%
    """
    weights = {
        "phishing": 0.25,
        "scam": 0.25,
        "url": 0.20,
        "fake_news": 0.15,
        "spam": 0.15
    }
    
    composite = (
        (phishing_risk * weights["phishing"]) +
        (financial_scam_risk * weights["scam"]) +
        (url_risk_score * weights["url"]) +
        (fake_news_risk * weights["fake_news"]) +
        (spam_risk * weights["spam"])
    )
    
    composite = round(min(99.0, max(5.0, composite)), 1)
    
    if composite >= 70.0:
        overall_level = "HIGH"
    elif composite >= 40.0:
        overall_level = "MEDIUM"
    else:
        overall_level = "LOW"
        
    return {
        "overall_risk_score": composite,
        "overall_risk": overall_level
    }
