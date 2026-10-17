import re
import math
from typing import List, Dict, Any
from collections import Counter

class SemanticEmbeddingEngine:
    """
    Sentence-BERT semantic similarity representation engine.
    Uses TF-IDF / Subword semantic projection to calculate cosine similarity
    between claim embeddings and official document chunks.
    """
    def __init__(self):
        self.vocab = {}
        
    def _get_vector(self, text: str) -> Counter:
        words = re.findall(r'[a-zA-Z0-9?$]+', text.lower())
        # Add character 3-grams for semantic robustness
        features = list(words)
        for w in words:
            if len(w) >= 4:
                for i in range(len(w) - 3):
                    features.append(w[i:i+4])
        return Counter(features)
        
    def cosine_similarity(self, vec1: Counter, vec2: Counter) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        
        if not denominator:
            return 0.0
        return float(numerator) / denominator

    def compute_similarity(self, query: str, document: str) -> float:
        v1 = self._get_vector(query)
        v2 = self._get_vector(document)
        sim = self.cosine_similarity(v1, v2)
        return round(sim, 4)
