// Llama 3.1 8B independent reviewer integration (MODULE 20).
//
// TrustShield's second LLM. Where Qwen3-8B (see ./qwen.ts) is the primary
// verification/reasoning model, Llama 3.1 8B is an independent reviewer:
// it re-examines the same claim and the same retrieved evidence, then
// checks whether Qwen's verdict and reasoning are actually supported by
// that evidence. It is a check on Qwen, not a second vote cast blindly —
// the prompt explicitly tells it not to agree by default.
//
// Called through any OpenAI-compatible `/chat/completions` endpoint, same
// as Qwen. Only exercised when LLAMA_API_URL/LLAMA_API_KEY are configured;
// otherwise callers fall back to using Qwen's verdict alone and the UI
// clearly labels the reviewer as unavailable, per the "never fake AI
// outputs" rule.
import { z } from "zod";
import type { RetrievedChunk } from "./retrieval";
import type { QwenVerdict } from "./qwen";

const LlamaReviewSchema = z.object({
  review_verdict: z.enum(["SUPPORTED", "REFUTED", "UNVERIFIABLE"]),
  confidence: z.number().min(0).max(100),
  agreement_with_qwen: z.boolean(),
  review_reasoning: z.string(),
  issues_found: z.array(z.string()).default([]),
  evidence_ids_used: z.array(z.string()).default([]),
});

export type LlamaReview = z.infer<typeof LlamaReviewSchema>;

export type LlamaInput = {
  claim: string;
  allClaims: string[];
  nlpSummary: { entities: string[]; ngrams: string[] };
  riskSignals: {
    fakeNews: number;
    financialScam: number;
    spam: number;
    phishing: number;
    urlRisk: string;
  };
  evidence: RetrievedChunk[];
  qwenVerdict: QwenVerdict;
};

export function isLlamaConfigured(): boolean {
  return Boolean(process.env["LLAMA_API_URL"] && process.env["LLAMA_API_KEY"]);
}

const SYSTEM_PROMPT = `You are the independent verification reviewer for TrustShield AI, a claim-verification and digital-risk platform. A primary model (Qwen3-8B) has already produced an initial verdict for a claim, grounded in a set of retrieved evidence chunks from a trusted document knowledge base (RBI/SEBI/government sources). Your job is to independently review that work, not repeat it.

Rules you must follow exactly:
- Independently evaluate the claim against ONLY the retrieved evidence provided below. Never invent, assume, or recall an outside source or URL.
- Do not blindly agree with Qwen3-8B. Check whether its verdict and reasoning are actually supported by the evidence supplied.
- Identify any unsupported conclusions or possible hallucinations in Qwen3-8B's reasoning and list them in issues_found. If you find none, return an empty array.
- If the retrieved evidence is empty or does not clearly support/refute the claim, you MUST return review_verdict "UNVERIFIABLE", regardless of what Qwen3-8B concluded.
- Return review_verdict "SUPPORTED" only if evidence chunks directly corroborate the claim. Return "REFUTED" only if evidence chunks directly contradict the claim.
- Set agreement_with_qwen to true only if your review_verdict matches Qwen3-8B's verdict AND you found no material issues with its reasoning.
- Cite the evidence chunk ids you actually used in evidence_ids_used. If you used none, return an empty array.
- Respond with ONLY a single JSON object matching the required schema — no prose, no markdown fences.`;

function buildUserPrompt(input: LlamaInput): string {
  const evidenceBlock = input.evidence.length
    ? input.evidence
        .map(
          (chunk, index) =>
            `[EVIDENCE ${index + 1} | id=${chunk.chunkId} | source=${chunk.title} (${chunk.organization ?? "unknown org"}) | bm25=${chunk.bm25Score.toFixed(2)} | overlap=${chunk.semanticScore.toFixed(2)}]\n${chunk.text}`,
        )
        .join("\n\n")
    : "(no evidence retrieved — the knowledge base returned no matching trusted documents)";

  return `CLAIM TO REVIEW:\n"${input.claim}"\n\nALL CLAIMS EXTRACTED FROM THE INPUT:\n${input.allClaims.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nNLP SIGNALS:\nEntities: ${input.nlpSummary.entities.join(", ") || "none"}\nNotable n-grams: ${input.nlpSummary.ngrams.join(", ") || "none"}\n\nRISK CLASSIFIER SIGNALS (0-100, independent heuristic signals, not a verdict):\nFake news: ${input.riskSignals.fakeNews}\nFinancial scam: ${input.riskSignals.financialScam}\nSpam: ${input.riskSignals.spam}\nPhishing: ${input.riskSignals.phishing}\nURL risk: ${input.riskSignals.urlRisk}\n\nRETRIEVED TRUSTED EVIDENCE (top-${input.evidence.length}):\n${evidenceBlock}\n\nQWEN3-8B (PRIMARY MODEL) OUTPUT TO REVIEW:\nVerdict: ${input.qwenVerdict.verdict}\nConfidence: ${input.qwenVerdict.confidence}\nReasoning: ${input.qwenVerdict.reasoning}\nEvidence ids Qwen cited: ${input.qwenVerdict.evidence_ids_used.join(", ") || "none"}\n\nReturn the JSON object now.`;
}

/**
 * Calls the configured Llama 3.1 8B endpoint as an independent reviewer of
 * Qwen3-8B's verdict. Returns null (never throws to the caller) when
 * unconfigured, unreachable, or when the response cannot be parsed into
 * the required schema — callers must fall back to Qwen's verdict alone
 * and surface the failure via model_results.
 */
export async function callLlamaReview(
  input: LlamaInput,
): Promise<{ ok: true; review: LlamaReview } | { ok: false; error: string }> {
  const apiUrl = process.env["LLAMA_API_URL"];
  const apiKey = process.env["LLAMA_API_KEY"];
  const model = process.env["LLAMA_MODEL"] || "llama-3.1-8b";
  if (!apiUrl || !apiKey)
    return {
      ok: false,
      error: "Llama 3.1 8B is not configured (LLAMA_API_URL / LLAMA_API_KEY missing).",
    };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return { ok: false, error: `Llama 3.1 8B endpoint returned HTTP ${response.status}` };
    }
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = payload.choices?.[0]?.message?.content?.trim();
    if (!raw) return { ok: false, error: "Llama 3.1 8B returned an empty response." };
    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");
    const parsed = LlamaReviewSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success)
      return { ok: false, error: "Llama 3.1 8B response did not match the required schema." };
    // Guard rail: never let the reviewer claim SUPPORTED/REFUTED with zero cited evidence.
    if (
      parsed.data.review_verdict !== "UNVERIFIABLE" &&
      parsed.data.evidence_ids_used.length === 0
    ) {
      return {
        ok: true,
        review: {
          ...parsed.data,
          review_verdict: "UNVERIFIABLE",
          agreement_with_qwen: parsed.data.review_verdict === input.qwenVerdict.verdict,
          review_reasoning: `${parsed.data.review_reasoning} (Downgraded to UNVERIFIABLE: no evidence ids were cited.)`,
        },
      };
    }
    return { ok: true, review: parsed.data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Llama 3.1 8B call failed",
    };
  }
}
