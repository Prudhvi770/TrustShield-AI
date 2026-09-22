// Hybrid-ish retrieval over trusted document chunks.
//
// TrustShield does not have a real embedding model or vector database wired up
// (Sentence-BERT / FAISS / ChromaDB are not available in this environment), so
// this module intentionally implements ONLY what can be done honestly without
// one: a BM25-style keyword ranking. The "semantic" score below is a bounded
// token-overlap proxy, clearly distinct from BM25, and both are combined into
// a transparent, documented formula. This is never presented as a transformer
// embedding similarity — see MODULE 11/13 caveats surfaced in the UI.
//
// Nothing here invents evidence: if no chunks are indexed, retrieval returns
// an empty list and the caller must leave the claim UNVERIFIABLE.

export type IndexedChunk = {
  chunkId: string;
  documentId: string;
  title: string;
  organization: string | null;
  sourceUrl: string | null;
  pageNumber: number | null;
  text: string;
};

export type RetrievedChunk = IndexedChunk & {
  bm25Score: number;
  semanticScore: number;
  combinedScore: number;
};

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "has",
  "have",
  "for",
  "every",
  "this",
  "that",
  "and",
  "or",
  "to",
  "of",
  "at",
  "in",
  "is",
  "are",
  "your",
  "will",
  "with",
  "on",
  "by",
  "be",
  "it",
  "as",
  "was",
  "were",
  "from",
  "you",
  "we",
  "they",
  "he",
  "she",
]);

export const wordTokens = (text: string): string[] =>
  (text.toLowerCase().match(/[\p{L}\p{N}₹]+/gu) ?? []).filter(
    (word) => word.length > 1 && !STOPWORDS.has(word),
  );

/**
 * Splits raw extracted document text into overlapping chunks suitable for
 * indexing. Chunking is sentence-aware where possible, falling back to a
 * fixed character window so very long unbroken text still gets chunked.
 */
export function chunkText(text: string, maxChars = 900, overlapChars = 120): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > maxChars && current) {
      chunks.push(current.trim());
      const overlap = current.slice(Math.max(0, current.length - overlapChars));
      current = `${overlap} ${sentence}`.trim();
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  // Fallback for pathological input (no sentence boundaries at all).
  if (chunks.length === 0) {
    for (let i = 0; i < clean.length; i += maxChars - overlapChars) {
      chunks.push(clean.slice(i, i + maxChars));
    }
  }
  return chunks;
}

/** BM25 over a small, in-memory chunk set (fine at the scale a demo/academic KB runs at). */
function bm25Rank(query: string[], chunks: IndexedChunk[]): Map<string, number> {
  const k1 = 1.5;
  const b = 0.75;
  const docTokens = chunks.map((chunk) => wordTokens(chunk.text));
  const avgLen =
    docTokens.reduce((sum, tokens) => sum + tokens.length, 0) / (docTokens.length || 1);
  const df = new Map<string, number>();
  for (const tokens of docTokens) {
    const seen = new Set(tokens);
    for (const term of seen) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const n = chunks.length;
  const scores = new Map<string, number>();
  chunks.forEach((chunk, index) => {
    const tokens = docTokens[index] ?? [];
    const len = tokens.length || 1;
    const freq = new Map<string, number>();
    for (const term of tokens) freq.set(term, (freq.get(term) ?? 0) + 1);
    let score = 0;
    for (const term of new Set(query)) {
      const f = freq.get(term) ?? 0;
      if (!f) continue;
      const docFreq = df.get(term) ?? 0;
      const idf = Math.log(1 + (n - docFreq + 0.5) / (docFreq + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (len / avgLen))));
    }
    scores.set(chunk.chunkId, score);
  });
  return scores;
}

/** Jaccard-style token overlap, standing in for a real embedding cosine similarity. */
function overlapScore(query: string[], text: string): number {
  const queryUnique = new Set(query);
  const docUnique = new Set(wordTokens(text));
  if (queryUnique.size === 0 || docUnique.size === 0) return 0;
  let intersection = 0;
  for (const term of queryUnique) if (docUnique.has(term)) intersection += 1;
  return intersection / new Set([...queryUnique, ...docUnique]).size;
}

export function retrieveTopK(
  claimText: string,
  chunks: IndexedChunk[],
  topK = 5,
): RetrievedChunk[] {
  if (chunks.length === 0) return [];
  const query = wordTokens(claimText);
  if (query.length === 0) return [];
  const bm25Scores = bm25Rank(query, chunks);
  const maxBm25 = Math.max(1e-6, ...Array.from(bm25Scores.values()));
  const ranked = chunks
    .map((chunk) => {
      const bm25Raw = bm25Scores.get(chunk.chunkId) ?? 0;
      const bm25Score = bm25Raw / maxBm25; // normalize to 0..1
      const semanticScore = overlapScore(query, chunk.text);
      // Documented, non-arbitrary blend (see MODULE 13): weight BM25 slightly
      // higher since it is the more reliable signal without real embeddings.
      const combinedScore = bm25Score * 0.6 + semanticScore * 0.4;
      return { ...chunk, bm25Score, semanticScore, combinedScore };
    })
    .filter((chunk) => chunk.combinedScore > 0)
    .sort((a, b) => b.combinedScore - a.combinedScore);
  return ranked.slice(0, topK);
}
