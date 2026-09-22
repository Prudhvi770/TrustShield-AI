// Qwen3-8B integration (MODULE 16).
//
// TrustShield's central LLM is Qwen3-8B, called here through any
// OpenAI-compatible `/chat/completions` endpoint (e.g. a self-hosted vLLM/TGI
// server, or a hosted Qwen3-8B deployment). This module is only exercised
// when QWEN_API_URL is configured; otherwise callers fall back to the
// deterministic Demo Mode result and the UI clearly labels the model as
// unavailable, per the "never fake AI outputs" rule.
//
// The model is given the claim, NLP results, risk signals, and ONLY the
// retrieved evidence chunks actually indexed from trusted documents. It is
// instructed to cite evidence by id and to return UNVERIFIABLE when evidence
// is insufficient — it must never invent a source.
import { z } from "zod";
import type { RetrievedChunk } from "./retrieval";

const QwenVerdictSchema = z.object({
  verdict: z.enum(["SUPPORTED", "REFUTED", "UNVERIFIABLE"]),
  confidence: z.number().min(0).max(100),
  claim: z.string(),
  reasoning: z.string(),
  evidence_summary: z.string(),
  evidence_ids_used: z.array(z.string()).default([]),
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  warnings: z.array(z.string()).default([]),
  recommended_action: z.string(),
});

export type QwenVerdict = z.infer<typeof QwenVerdictSchema>;

export type QwenInput = {
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
};

export function isQwenConfigured(): boolean {
  return Boolean(process.env["QWEN_API_URL"] && process.env["QWEN_API_KEY"]);
}

const SYSTEM_PROMPT = `You are the verification-reasoning component of TrustShield AI, a claim-verification and digital-risk platform. You are given a factual claim extracted from user-submitted content, supporting NLP/risk signals, and a set of retrieved evidence chunks from a trusted document knowledge base (RBI/SEBI/government sources).

Rules you must follow exactly:
- Base your verdict ONLY on the retrieved evidence provided below. Never invent, assume, or recall an outside source or URL.
- If the retrieved evidence is empty or does not clearly support/refute the claim, you MUST return verdict "UNVERIFIABLE".
- Return verdict "SUPPORTED" only if evidence chunks directly corroborate the claim.
- Return verdict "REFUTED" only if evidence chunks directly contradict the claim.
- Cite the evidence chunk ids you actually used in evidence_ids_used. If you used none, return an empty array.
- risk_level should reflect the combined digital-risk picture (fake news / financial scam / spam / phishing / URL signals), not just the verdict.
- Respond with ONLY a single JSON object matching the required schema — no prose, no markdown fences.`;

function buildUserPrompt(input: QwenInput): string {
  const evidenceBlock = input.evidence.length
    ? input.evidence
        .map(
          (chunk, index) =>
            `[EVIDENCE ${index + 1} | id=${chunk.chunkId} | source=${chunk.title} (${chunk.organization ?? "unknown org"}) | bm25=${chunk.bm25Score.toFixed(2)} | overlap=${chunk.semanticScore.toFixed(2)}]\n${chunk.text}`,
        )
        .join("\n\n")
    : "(no evidence retrieved — the knowledge base returned no matching trusted documents)";

  return `CLAIM TO VERIFY:\n"${input.claim}"\n\nALL CLAIMS EXTRACTED FROM THE INPUT:\n${input.allClaims.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nNLP SIGNALS:\nEntities: ${input.nlpSummary.entities.join(", ") || "none"}\nNotable n-grams: ${input.nlpSummary.ngrams.join(", ") || "none"}\n\nRISK CLASSIFIER SIGNALS (0-100, independent heuristic signals, not a verdict):\nFake news: ${input.riskSignals.fakeNews}\nFinancial scam: ${input.riskSignals.financialScam}\nSpam: ${input.riskSignals.spam}\nPhishing: ${input.riskSignals.phishing}\nURL risk: ${input.riskSignals.urlRisk}\n\nRETRIEVED TRUSTED EVIDENCE (top-${input.evidence.length}):\n${evidenceBlock}\n\nReturn the JSON object now.`;
}

/**
 * Calls the configured Qwen3-8B endpoint. Returns null (never throws to the
 * caller) when unconfigured, unreachable, or when the response cannot be
 * parsed into the required schema — callers must fall back to the
 * deterministic demo result and surface the failure via model_results.
 */
export async function callQwenVerification(
  input: QwenInput,
): Promise<{ ok: true; verdict: QwenVerdict } | { ok: false; error: string }> {
  const apiUrl = process.env["QWEN_API_URL"];
  const apiKey = process.env["QWEN_API_KEY"];
  const model = process.env["QWEN_MODEL"] || "qwen3-8b";
  if (!apiUrl || !apiKey)
    return {
      ok: false,
      error: "Qwen3-8B is not configured (QWEN_API_URL / QWEN_API_KEY missing).",
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
      return { ok: false, error: `Qwen3-8B endpoint returned HTTP ${response.status}` };
    }
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = payload.choices?.[0]?.message?.content?.trim();
    if (!raw) return { ok: false, error: "Qwen3-8B returned an empty response." };
    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");
    const parsed = QwenVerdictSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success)
      return { ok: false, error: "Qwen3-8B response did not match the required schema." };
    // Guard rail: never let the model claim SUPPORTED/REFUTED with zero cited evidence.
    if (parsed.data.verdict !== "UNVERIFIABLE" && parsed.data.evidence_ids_used.length === 0) {
      return {
        ok: true,
        verdict: {
          ...parsed.data,
          verdict: "UNVERIFIABLE",
          reasoning: `${parsed.data.reasoning} (Downgraded to UNVERIFIABLE: no evidence ids were cited.)`,
        },
      };
    }
    return { ok: true, verdict: parsed.data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Qwen3-8B call failed" };
  }
}
