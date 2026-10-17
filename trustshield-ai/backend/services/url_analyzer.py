import re
import math
from urllib.parse import urlparse
from typing import Dict, Any

def shannon_entropy(string: str) -> float:
    """Calculate Shannon entropy to detect randomized phishing domain names."""
    if not string:
        return 0.0
    prob = [float(string.count(c)) / len(string) for c in dict.fromkeys(list(string))]
    entropy = - sum([p * math.log(p) / math.log(2.0) for p in prob])
    return entropy

def analyze_url(url_or_text: str) -> Dict[str, Any]:
    # Extract URL from text if needed
    url_match = re.search(r'https?://[^\s]+', url_or_text)
    if not url_match and not url_or_text.startswith("http"):
        return {
            "has_url": False,
            "url": None,
            "url_risk": "LOW",
            "risk_score": 10.0,
            "issues": []
        }
        
    url = url_match.group(0) if url_match else url_or_text
    url = url.strip(' .,!?"\'()[]{}')
    issues = []
    risk_score = 20.0
    
    # Check protocol
    if not url.startswith("https://"):
        risk_score += 25.0
        issues.append("Insecure connection (HTTP or no SSL)")
        
    parsed = urlparse(url if "://" in url else f"http://{url}")
    netloc = parsed.netloc.lower()
    
    # Check IP host
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', netloc):
        risk_score += 40.0
        issues.append("Direct IP address used instead of reputable domain")
        
    # Check length & entropy
    if len(url) > 60:
        risk_score += 15.0
        issues.append("Unusually long URL structure")
        
    entropy = shannon_entropy(netloc)
    if entropy > 3.8:
        risk_score += 20.0
        issues.append(f"High domain entropy ({entropy:.2f}), possible algorithmically generated domain")
        
    # Subdomain count
    subdomains = netloc.split(".")
    if len(subdomains) > 3:
        risk_score += 20.0
        issues.append(f"Excessive subdomains ({len(subdomains)-2})")
        
    # Suspicious domain keywords
    suspicious_patterns = ["login", "verify", "secure", "claim", "free", "rbi-portal", "sbi-kyc", "scholarship-gov"]
    for pat in suspicious_patterns:
        if pat in netloc and not netloc.endswith(".gov.in") and not netloc.endswith(".nic.in") and not netloc.endswith(".rbi.org.in"):
            risk_score += 25.0
            issues.append(f"Potential spoofing pattern: '{pat}'")
            
    # Shortener check
    if any(s in netloc for s in ["bit.ly", "tinyurl.com", "t.co", "is.gd", "rb.gy"]):
        risk_score += 25.0
        issues.append("URL shortening service masks actual destination")
        
    risk_score = min(98.0, max(10.0, risk_score))
    
    risk_level = "LOW"
    if risk_score >= 70.0:
        risk_level = "HIGH"
    elif risk_score >= 40.0:
        risk_level = "MEDIUM"
        
    return {
        "has_url": True,
        "url": url,
        "url_risk": risk_level,
        "risk_score": round(risk_score, 1),
        "entropy": round(entropy, 2),
        "issues": issues
    }
