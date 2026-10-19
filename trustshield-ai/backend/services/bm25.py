import re
from typing import List, Dict, Any
from rank_bm25 import BM25Okapi

class BM25SearchEngine:
    def __init__(self, corpus_chunks: List[Dict[str, Any]]):
        self.chunks = corpus_chunks
        self.tokenized_corpus = [self._tokenize(c.get("title", "") + " " + c.get("text", "")) for c in corpus_chunks]
        if self.tokenized_corpus:
            self.bm25 = BM25Okapi(self.tokenized_corpus)
        else:
            self.bm25 = None

            
    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'[a-zA-Z0-9?$]+', text) if len(w) > 1]
        
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.bm25 or not self.chunks:
            return []
        tokenized_query = self._tokenize(query)
        if not tokenized_query:
            return []
            
        scores = self.bm25.get_scores(tokenized_query)
        # Normalize scores to 0-1
        max_score = max(scores) if len(scores) > 0 and max(scores) > 0 else 1.0
        
        indexed_scores = sorted(list(enumerate(scores)), key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in indexed_scores[:top_k]:
            if score > 0:
                normalized = round(float(score / max_score), 4)
                chunk = dict(self.chunks[idx])
                chunk["bm25_score"] = normalized
                results.append(chunk)
        return results
