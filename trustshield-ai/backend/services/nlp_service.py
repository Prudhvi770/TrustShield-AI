import re
from collections import Counter
from typing import List, Dict, Any

# POS Tagging dictionary and rules
POS_MAP = {
    "rbi": ("PROPN", "RBI"),
    "sebi": ("PROPN", "SEBI"),
    "india": ("GPE", "India"),
    "announced": ("VERB", "announce"),
    "announces": ("VERB", "announce"),
    "announcement": ("NOUN", "announcement"),
    "scholarship": ("NOUN", "scholarship"),
    "scholarships": ("NOUN", "scholarship"),
    "student": ("NOUN", "student"),
    "students": ("NOUN", "student"),
    "college": ("NOUN", "college"),
    "apply": ("VERB", "apply"),
    "applied": ("VERB", "apply"),
    "submit": ("VERB", "submit"),
    "submitted": ("VERB", "submit"),
    "aadhaar": ("NOUN", "Aadhaar"),
    "pan": ("NOUN", "PAN"),
    "details": ("NOUN", "detail"),
    "kyc": ("NOUN", "KYC"),
    "urgent": ("ADJ", "urgent"),
    "free": ("ADJ", "free"),
    "guaranteed": ("ADJ", "guaranteed"),
    "every": ("DET", "every"),
    "for": ("ADP", "for"),
    "at": ("ADP", "at"),
    "and": ("CCONJ", "and"),
    "a": ("DET", "a"),
    "an": ("DET", "an"),
    "the": ("DET", "the"),
    "has": ("AUX", "have"),
    "is": ("AUX", "be"),
    "are": ("AUX", "be"),
    "now": ("ADV", "now")
}

def extract_pos_tags(tokens: List[str]) -> List[Dict[str, str]]:
    tags = []
    for token in tokens:
        lower = token.lower()
        if re.match(r'^[a-zA-Z0-9\u20B9$??]?\d+(?:,\d+)*(?:\.\d+)?%?$', token):
            tags.append({"word": token, "pos": "NUM", "lemma": token})
        elif lower in POS_MAP:
            pos, lemma = POS_MAP[lower]
            tags.append({"word": token, "pos": pos, "lemma": lemma})
        elif token.isupper() and len(token) > 1:
            tags.append({"word": token, "pos": "PROPN", "lemma": token})
        elif token.endswith("ly"):
            tags.append({"word": token, "pos": "ADV", "lemma": token[:-2]})
        elif token.endswith("ed") or token.endswith("ing"):
            tags.append({"word": token, "pos": "VERB", "lemma": token.rstrip("ed").rstrip("ing")})
        elif token.endswith("tion") or token.endswith("ment") or token.endswith("er") or token.endswith("or"):
            tags.append({"word": token, "pos": "NOUN", "lemma": token})
        else:
            tags.append({"word": token, "pos": "NOUN", "lemma": token.lower()})
    return tags

def compute_ngrams(tokens: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    # Clean words only
    words = [t for t in tokens if re.search(r'[a-zA-Z0-9\u20B9$]', t)]
    
    unigrams = Counter(words)
    bigrams = Counter([f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]) if len(words) > 1 else Counter()
    trigrams = Counter([f"{words[i]} {words[i+1]} {words[i+2]}" for i in range(len(words)-2)]) if len(words) > 2 else Counter()
    
    return {
        "unigrams": [{"phrase": k, "frequency": v, "ngram_type": "unigram"} for k, v in unigrams.most_common(10)],
        "bigrams": [{"phrase": k, "frequency": v, "ngram_type": "bigram"} for k, v in bigrams.most_common(10)],
        "trigrams": [{"phrase": k, "frequency": v, "ngram_type": "trigram"} for k, v in trigrams.most_common(10)]
    }

def extract_named_entities(text: str) -> List[Dict[str, Any]]:
    entities = []
    
    # 1. MONEY: ?50,000 / Rs 50000 / 
    for m in re.finditer(r'(?:\u20B9|Rs\.?|INR|\$)\s?\d+(?:,\d+)*(?:\.\d+)?(?:\s?(?:lakh|crore|thousand|k))?', text, re.IGNORECASE):
        entities.append({"entity": m.group(), "label": "MONEY", "start": m.start(), "end": m.end()})
    
    # 2. ORGANIZATION: RBI, SEBI, SBI, Government of India, NPCI, UIDAI
    org_pattern = r'(RBI|Reserve Bank of India|SEBI|Securities and Exchange Board of India|SBI|State Bank of India|NPCI|UIDAI|Govt|Government|Ministry of Finance|PIB)'
    for m in re.finditer(org_pattern, text, re.IGNORECASE):
        entities.append({"entity": m.group(), "label": "ORGANIZATION", "start": m.start(), "end": m.end()})
    
    # 3. GPE / LOCATION: India, Delhi, Mumbai
    gpe_pattern = r'(India|Bharat|Delhi|Mumbai|Bangalore|Hyderabad|Chennai)'
    for m in re.finditer(gpe_pattern, text, re.IGNORECASE):
        entities.append({"entity": m.group(), "label": "GPE", "start": m.start(), "end": m.end()})
    
    # 4. PRODUCT / IDENTITY / SCHEME: Aadhaar, PAN card, PM Kisan, UPI
    prod_pattern = r'(Aadhaar|PAN|UPI|PM Kisan|PM-Kisan|Scholarship Scheme|DigiLocker)'
    for m in re.finditer(prod_pattern, text, re.IGNORECASE):
        entities.append({"entity": m.group(), "label": "PRODUCT", "start": m.start(), "end": m.end()})
        
    # 5. DATE: today, 2024, 2025, 2026, 31st March, urgently
    date_pattern = r'(today|tomorrow|yesterday|2024|2025|2026|March \d{1,2}|\d{1,2}(?:st|nd|rd|th)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)'
    for m in re.finditer(date_pattern, text, re.IGNORECASE):
        entities.append({"entity": m.group(), "label": "DATE", "start": m.start(), "end": m.end()})
        
    return entities

def extract_dependency_and_svo(text: str) -> Dict[str, Any]:
    # Identifies Subject-Action-Object relationships
    edges = []
    svo_triples = []
    
    # Example patterns: [Subject] [Aux] [Verb] [Object/Amount] [Target]
    # "RBI has announced a ?50,000 scholarship for every college student."
    # Subject: RBI -> announced -> scholarship
    
    m = re.search(r'([A-Z][a-zA-Z\s]+?)\s+(?:has\s+|is\s+|was\s+)?(announced|offered|launched|issued|mandated|started)\s+([^,.]+)', text, re.IGNORECASE)
    if m:
        subj = m.group(1).strip()
        verb = m.group(2).strip()
        obj_full = m.group(3).strip()
        
        edges.append({"source": subj, "target": verb, "relation": "nsubj"})
        edges.append({"source": verb, "target": obj_full.split()[0] if obj_full else "benefit", "relation": "dobj"})
        
        svo_triples.append({
            "subject": subj,
            "action": verb,
            "object": obj_full
        })
    else:
        # Fallback default syntactic parsing
        words = text.split()
        if len(words) >= 3:
            edges.append({"source": words[0], "target": words[1], "relation": "nsubj"})
            edges.append({"source": words[1], "target": words[2], "relation": "dobj"})
            svo_triples.append({
                "subject": words[0],
                "action": words[1],
                "object": " ".join(words[2:5])
            })
            
    return {"edges": edges, "svo_triples": svo_triples}

def run_nlp_pipeline(text: str, tokens: List[str]) -> Dict[str, Any]:
    pos_tags = extract_pos_tags(tokens)
    ngrams = compute_ngrams(tokens)
    entities = extract_named_entities(text)
    dep_data = extract_dependency_and_svo(text)
    
    return {
        "pos_tags": pos_tags,
        "ngrams": ngrams,
        "entities": entities,
        "dependency_edges": dep_data["edges"],
        "svo_triples": dep_data["svo_triples"]
    }
