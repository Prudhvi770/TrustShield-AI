from typing import Dict, Any

def generate_plain_language_summary(
    claim_text: str,
    final_verdict: str,
    overall_risk: str,
    risk_scores: Dict[str, Any]
) -> Dict[str, str]:
    """
    Generates plain-language user-friendly explanation and recommended action.
    """
    if final_verdict == "UNVERIFIABLE" and overall_risk == "HIGH":
        summary = (
            f"This message is highly suspicious and carries high digital risk. "
            f"The claimed announcement of '{claim_text}' could not be verified in any authentic "
            f"Reserve Bank of India or Government circulars. Crucially, the message combines urgency "
            f"with requests for sensitive identity credentials (such as Aadhaar details) and external links, "
            f"which are hallmarks of financial phishing fraud."
        )
        recommendation = (
            "DO NOT CLICK links, provide Aadhaar numbers, or forward this message. "
            "Report the sender to the National Cyber Crime Reporting Portal (cybercrime.gov.in) "
            "or RBI's Sachet portal."
        )
    elif final_verdict == "REFUTED":
        summary = (
            f"This claim has been directly REFUTED by regulatory documentation. "
            f"Official regulatory notifications contradict the assertion and indicate this is a fabricated message."
        )
        recommendation = "Warn contacts not to participate or share this fraudulent communication."
    elif final_verdict == "SUPPORTED":
        summary = (
            f"This claim is SUPPORTED by verified official circulars and government releases. "
            f"The details match documented policy guidelines."
        )
        recommendation = "You may safely verify details directly on the official government portal."
    else:
        summary = (
            f"This claim is UNVERIFIABLE due to insufficient matching evidence from trusted regulatory repositories."
        )
        recommendation = "Exercise caution and do not disclose credentials until officially confirmed."
        
    return {
        "summary": summary,
        "recommended_action": recommendation
    }
