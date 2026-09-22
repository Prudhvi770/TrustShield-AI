// Decision engine (MODULE 21).
//
// Reconciles Qwen3-8B's initial verdict with Llama 3.1 8B's independent
// review into one final verdict. Trusted evidence has higher authority
// than either model: the engine never lets agreement between two LLMs
// manufacture a SUPPORTED/REFUTED verdict out of evidence that doesn't
// actually back it, and it never forces a verdict when evidence is
// ambiguous — it returns UNVERIFIABLE instead.
import type { RetrievedChunk } from "./retrieval";
import type { QwenVerdict } from "./qwen";
import type { LlamaReview } from "./llama";

export type FinalVerdict = "SUPPORTED" | "REFUTED" | "UNVERIFIABLE";
export type EvidenceStatus = "SUPPORTING" | "CONTRADICTING" | "INSUFFICIENT";

export type DecisionInput = {
  qwen: QwenVerdict;
  llama: LlamaReview | null; // null when the reviewer is unconfigured/unavailable
  evidence: RetrievedChunk[];
};

export type DecisionOutput = {
  finalVerdict: FinalVerdict;
  confidence: number;
  agreement: boolean | null; // null when there is no reviewer to agree/disagree with
  evidenceStatus: EvidenceStatus;
  explanation: string;
};

/**
 * Evidence-consistency check (MODULE 22). This has priority over
 * unsupported LLM assumptions: it looks only at how strongly the chunks
 * actually cited by either model support (vs. weakly match) the claim.
 */
function evidenceStrength(
  evidence: RetrievedChunk[],
  citedIds: string[],
): { status: EvidenceStatus; score: number } {
  const cited = evidence.filter((chunk) => citedIds.includes(chunk.chunkId));
  if (cited.length === 0) return { status: "INSUFFICIENT", score: 0 };
  const score =
    cited.reduce((sum, chunk) => sum + chunk.semanticScore * 0.5 + chunk.bm25Score * 0.5, 0) /
    cited.length;
  return { status: score >= 0.35 ? "SUPPORTING" : "INSUFFICIENT", score };
}

export function decide(input: DecisionInput): DecisionOutput {
  const { qwen, llama, evidence } = input;

  // No reviewer configured: fall back to Qwen alone, but still run the
  // evidence-consistency check rather than trusting Qwen unconditionally.
  if (!llama) {
    const strength = evidenceStrength(evidence, qwen.evidence_ids_used);
    const verdict: FinalVerdict =
      qwen.verdict !== "UNVERIFIABLE" && strength.status !== "SUPPORTING"
        ? "UNVERIFIABLE"
        : qwen.verdict;
    return {
      finalVerdict: verdict,
      confidence: verdict === qwen.verdict ? qwen.confidence : Math.min(qwen.confidence, 60),
      agreement: null,
      evidenceStatus: strength.status,
      explanation:
        verdict === qwen.verdict
          ? "Independent reviewer unavailable — final verdict reflects Qwen3-8B alone, checked against the evidence-consistency rule."
          : "Independent reviewer unavailable, and Qwen3-8B's verdict was not backed by strongly matching cited evidence, so the decision engine downgraded it to UNVERIFIABLE.",
    };
  }

  const qwenIssues = evidenceStrength(evidence, qwen.evidence_ids_used);
  const llamaIssues = evidenceStrength(evidence, llama.evidence_ids_used);
  const bothCitedIds = Array.from(new Set([...qwen.evidence_ids_used, ...llama.evidence_ids_used]));
  const combined = evidenceStrength(evidence, bothCitedIds);

  const agree = qwen.verdict === llama.review_verdict;

  // Case 1 & 2 — both models agree on SUPPORTED or REFUTED, and the
  // evidence they cited actually backs that verdict.
  if (agree && qwen.verdict !== "UNVERIFIABLE") {
    if (combined.status === "SUPPORTING") {
      return {
        finalVerdict: qwen.verdict,
        confidence: Math.round((qwen.confidence + llama.confidence) / 2),
        agreement: true,
        evidenceStatus: qwen.verdict === "REFUTED" ? "CONTRADICTING" : "SUPPORTING",
        explanation: `Qwen3-8B and Llama 3.1 8B both returned ${qwen.verdict}, and the evidence they cited backs that conclusion.`,
      };
    }
    // Both models agree, but neither actually grounded that agreement in
    // strongly-matching cited evidence — evidence authority overrides the
    // model agreement.
    return {
      finalVerdict: "UNVERIFIABLE",
      confidence: Math.min(qwen.confidence, llama.confidence, 55),
      agreement: true,
      evidenceStatus: "INSUFFICIENT",
      explanation: `Qwen3-8B and Llama 3.1 8B both returned ${qwen.verdict}, but the decision engine downgraded this to UNVERIFIABLE because the cited evidence does not strongly back either model's conclusion.`,
    };
  }

  // Case 3 — both models agree the claim is UNVERIFIABLE.
  if (agree && qwen.verdict === "UNVERIFIABLE") {
    return {
      finalVerdict: "UNVERIFIABLE",
      confidence: Math.round((qwen.confidence + llama.confidence) / 2),
      agreement: true,
      evidenceStatus: "INSUFFICIENT",
      explanation:
        "Qwen3-8B and Llama 3.1 8B both returned UNVERIFIABLE — the retrieved evidence is insufficient to confirm or refute the claim.",
    };
  }

  // Case 4 — the models disagree. Do not automatically pick one; run the
  // evidence-consistency check and only resolve to SUPPORTED/REFUTED if
  // the evidence clearly favors one side over the other.
  const qwenSupported = qwen.verdict !== "UNVERIFIABLE" && qwenIssues.status === "SUPPORTING";
  const llamaSupported =
    llama.review_verdict !== "UNVERIFIABLE" && llamaIssues.status === "SUPPORTING";

  if (qwenSupported && !llamaSupported) {
    return {
      finalVerdict: qwen.verdict,
      confidence: Math.min(qwen.confidence, 75),
      agreement: false,
      evidenceStatus: qwen.verdict === "REFUTED" ? "CONTRADICTING" : "SUPPORTING",
      explanation: `Qwen3-8B (${qwen.verdict}) and Llama 3.1 8B (${llama.review_verdict}) disagreed. The evidence-consistency check favors Qwen3-8B's conclusion, so the decision engine adopted it — Llama's disagreement is preserved in the record.`,
    };
  }
  if (llamaSupported && !qwenSupported) {
    return {
      finalVerdict: llama.review_verdict,
      confidence: Math.min(llama.confidence, 75),
      agreement: false,
      evidenceStatus: llama.review_verdict === "REFUTED" ? "CONTRADICTING" : "SUPPORTING",
      explanation: `Qwen3-8B (${qwen.verdict}) and Llama 3.1 8B (${llama.review_verdict}) disagreed. The evidence-consistency check favors Llama 3.1 8B's independent review, so the decision engine adopted it over the primary model.`,
    };
  }

  // Evidence is ambiguous (both, neither, or conflicting support) — do not
  // force a verdict.
  return {
    finalVerdict: "UNVERIFIABLE",
    confidence: Math.min(qwen.confidence, llama.confidence, 60),
    agreement: false,
    evidenceStatus: "INSUFFICIENT",
    explanation: `Qwen3-8B (${qwen.verdict}) and Llama 3.1 8B (${llama.review_verdict}) disagreed, and the evidence-consistency check could not clearly favor either side, so the decision engine returned UNVERIFIABLE rather than force a verdict.`,
  };
}
