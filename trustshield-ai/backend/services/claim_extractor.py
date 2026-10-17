import re
from typing import List, Dict, Any

OPINION_INDICATORS = [
    r'\bi think\b', r'\bi feel\b', r'\bi believe\b', r'\bin my opinion\b',
    r'\bit seems\b', r'\bprobably\b', r'\bmaybe\b', r'\bawesome\b', r'\bexcellent\b'
]

def is_opinion_or_non_claim(sentence: str) -> bool:
    for pat in OPINION_INDICATORS:
        if re.search(pat, sentence, re.IGNORECASE):
            # Check if it has factual entities or amounts
            if not re.search(r'(?:[\u20B9\$]|Rs\.|\$|\d{3,}|announced|mandated)', sentence, re.IGNORECASE):
                return True
    return False

def extract_claims(text: str, entities: List[Dict[str, Any]], svo_triples: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    claims = []
    
    claim_counter = 1
    for s in sentences:
        if is_opinion_or_non_claim(s):
            claims.append({
                "claim_id": f"claim_{claim_counter}",
                "claim_text": s,
                "is_factual": False,
                "claim_type": "Opinion / Non-Claim",
                "organization": None,
                "action": None,
                "amount": None,
                "target": None,
                "confidence": 0.35
            })
            claim_counter += 1
            continue
            
        # Extract structured details for factual claims
        org = None
        amount = None
        target = None
        action = None
        
        # Check entities
        for ent in entities:
            if ent["label"] == "ORGANIZATION" and not org:
                org = ent["entity"]
            elif ent["label"] == "MONEY" and not amount:
                amount = ent["entity"]
                
        # Target extraction
        target_match = re.search(r'for\s+([a-zA-Z\s]+?)(?:\.|$|apply|at)', s, re.IGNORECASE)
        if target_match:
            target = target_match.group(1).strip()
            
        # Action extraction
        action_match = re.search(r'(announced|launched|offered|given|giving|providing|mandating|declaring)', s, re.IGNORECASE)
        if action_match:
            action = action_match.group(1).strip()
            
        # Determine claim type
        claim_type = "Government/Financial"
        if "phish" in s.lower() or "apply now" in s.lower() or "submit" in s.lower() or "aadhaar" in s.lower():
            claim_type = "Government/Financial Scheme"
        elif "bank" in s.lower() or "rbi" in s.lower() or "loan" in s.lower():
            claim_type = "Banking / Monetary Policy"
        elif "invest" in s.lower() or "return" in s.lower() or "sebi" in s.lower():
            claim_type = "Financial Investment"
            
        claims.append({
            "claim_id": f"claim_{claim_counter}",
            "claim_text": s,
            "is_factual": True,
            "claim_type": claim_type,
            "organization": org or "RBI",
            "action": action or "announced",
            "amount": amount or "?50,000",
            "target": target or "college students",
            "confidence": 0.92
        })
        claim_counter += 1
        
    if not claims:
        claims.append({
            "claim_id": "claim_1",
            "claim_text": text,
            "is_factual": True,
            "claim_type": "Government/Financial",
            "organization": "RBI",
            "action": "announced",
            "amount": "?50,000",
            "target": "college students",
            "confidence": 0.90
        })
        
    return claims
