import re
import string
from typing import List, Dict, Any

# Preserve critical financial/scam markers from standard stopword pruning
CRITICAL_MARKERS = {
    "urgent", "urgently", "click", "verify", "verification", "otp", "free",
    "guaranteed", "guarantee", "reward", "rewards", "investment", "invest",
    "aadhaar", "pan", "kyc", "scholarship", "loan", "bonus", "winner",
    "claim", "apply", "submit", "account", "bank", "rbi", "sebi", "gov", "official"
}

STANDARD_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
} - CRITICAL_MARKERS

def clean_text(text: str) -> str:
    # Normalize whitespaces and special characters while preserving currency symbols
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return cleaned

def segment_sentences(text: str) -> List[str]:
    # Split by standard sentence delimiters (.!?) while respecting abbreviations like RBI, etc.
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

def tokenize_text(text: str) -> List[str]:
    # Tokenize preserving currency ?, $, %, and alphanumeric tokens
    tokens = re.findall(r'[?$??]?\d+(?:,\d+)*(?:\.\d+)?%?|[a-zA-Z0-9_-]+|[.,!?]', text)
    return tokens

def lemmatize_word(word: str) -> str:
    # Simple lemmatization heuristic
    w = word.lower()
    if w.endswith("ies") and len(w) > 4:
        return w[:-3] + "y"
    elif w.endswith("ing") and len(w) > 4:
        return w[:-3]
    elif w.endswith("ed") and len(w) > 3:
        return w[:-2]
    elif w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        return w[:-1]
    return w

def preprocess_text(text: str) -> Dict[str, Any]:
    cleaned = clean_text(text)
    sentences = segment_sentences(cleaned)
    raw_tokens = tokenize_text(cleaned)
    
    # Filter non-punctuation tokens
    word_tokens = [t for t in raw_tokens if any(c.isalnum() for c in t)]
    lemmatized = [lemmatize_word(t) for t in word_tokens]
    
    return {
        "raw_text": text,
        "clean_text": cleaned,
        "tokens": word_tokens,
        "lemmatized_tokens": lemmatized,
        "sentences": sentences
    }
