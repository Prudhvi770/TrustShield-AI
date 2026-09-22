import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, type Database } from "@/db/client";
import {
  analyses,
  claims,
  documentChunks,
  documents,
  evidence,
  llmReviews,
  modelResults,
  riskScores,
} from "@/db/schema";
import { retrieveTopK, wordTokens, type IndexedChunk, type RetrievedChunk } from "@/lib/retrieval";
import { callQwenVerification, isQwenConfigured, type QwenVerdict } from "@/lib/qwen";
import { callLlamaReview, isLlamaConfigured, type LlamaReview } from "@/lib/llama";
import { decide } from "@/lib/decision-engine";

const Body = z.object({
  sessionId: z.string().min(8).max(120),
  inputType: z.string().min(1).max(40),
  text: z.string().min(5).max(25000),
  url: z.string().url().max(2048).optional().or(z.literal("")),
});

const stopwords = new Set([
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
]);
const suspicious = [
  "urgent",
  "click",
  "verify",
  "otp",
  "free",
  "guaranteed",
  "reward",
  "investment",
  "apply now",
  "aadhaar",
  "pan",
  "password",
  "login",
];
const currency = /(?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d+)?/gi;

const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const tokenize = (text: string) =>
  clean(text).match(/https?:\/\/[^\s]+|₹\s?[\d,]+|[\p{L}\p{N}_'-]+/gu) ?? [];
const lemma = (token: string) => {
  const lower = token.toLowerCase();
  const map: Record<string, string> = {
    announced: "announce",
    announcing: "announce",
    students: "student",
    details: "detail",
    guaranteed: "guarantee",
    requests: "request",
  };
  return (
    map[lower] ??
    (lower.endsWith("ing") ? lower.slice(0, -3) : lower.endsWith("ed") ? lower.slice(0, -2) : lower)
  );
};
const grams = (tokens: string[], size: number) =>
  tokens
    .slice(0, 80)
    .reduce<string[]>(
      (all, _, i) =>
        i + size <= tokens.length ? [...all, tokens.slice(i, i + size).join(" ")] : all,
      [],
    );
const score = (text: string, words: string[], base: number, increment: number) =>
  Math.min(99, base + words.filter((word) => text.toLowerCase().includes(word)).length * increment);
const isOpinion = (claim: string) => /think|feel|believe|excellent|amazing/i.test(claim);

function analyzeText(text: string, inputUrl?: string) {
  const raw = clean(text);
  const tokens = tokenize(raw);
  const normalized = tokens.map((token) => token.toLowerCase());
  const lemmas = tokens.filter((token) => !stopwords.has(token.toLowerCase())).map(lemma);
  const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
  const pos = tokens.slice(0, 80).map((word) => {
    const lower = word.toLowerCase();
    const tag =
      currency.test(word) || /^\d/.test(word)
        ? "NUM"
        : /https?:/.test(word)
          ? "URL"
          : ["rbi", "sebi", "india", "government"].includes(lower)
            ? "PROPN"
            : /ing$|ed$|announce|apply|submit|verify|click/.test(lower)
              ? "VERB"
              : /ous$|ive$|ful$/.test(lower)
                ? "ADJ"
                : "NOUN";
    currency.lastIndex = 0;
    return { word, tag };
  });
  const entities: { text: string; type: string }[] = [];
  const addEntity = (match: string, type: string) => {
    if (!entities.some((item) => item.text === match && item.type === type))
      entities.push({ text: match, type });
  };
  (raw.match(currency) ?? []).forEach((match) => addEntity(match, "MONEY"));
  ["RBI", "SEBI", "Aadhaar", "WhatsApp", "Telegram"].forEach((name) => {
    if (new RegExp(`\\b${name}\\b`, "i").test(raw))
      addEntity(name, ["Aadhaar", "WhatsApp", "Telegram"].includes(name) ? "PRODUCT" : "ORG");
  });
  (raw.match(/https?:\/\/[^\s]+/g) ?? []).forEach((url) => addEntity(url, "URL"));
  const claimSentences = sentences.filter((sentence) =>
    /\b(announced|says|said|will|offers|provides|requires|launched|approved|apply|submit|verify)\b/i.test(
      sentence,
    ),
  );
  const claimTexts = (claimSentences.length ? claimSentences : [sentences[0] ?? raw])
    .map((sentence) => sentence.replace(/[.!?]+$/, "").trim())
    .filter(Boolean);
  const phishing = score(raw, ["verify", "otp", "aadhaar", "password", "login", "blocked"], 10, 13);
  const financial = score(
    raw,
    ["₹", "investment", "guaranteed", "reward", "scholarship", "bank", "kyc", "aadhaar"],
    8,
    12,
  );
  const spam = score(raw, ["urgent", "click", "free", "apply now", "reward", "guaranteed"], 8, 12);
  const fake = Math.min(99, Math.round(financial * 0.38 + spam * 0.3 + phishing * 0.2 + 10));
  const url = inputUrl || raw.match(/https?:\/\/[^\s]+/)?.[0];
  let urlRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (url) {
    try {
      const parsed = new URL(url);
      const risky =
        parsed.protocol !== "https:" ||
        parsed.hostname.split(".").length > 3 ||
        parsed.hostname.includes("@") ||
        parsed.hostname.length > 45;
      urlRisk = risky ? "HIGH" : parsed.hostname === "example.com" ? "MEDIUM" : "LOW";
    } catch {
      urlRisk = "HIGH";
    }
  }
  const overall: "LOW" | "MEDIUM" | "HIGH" =
    Math.max(
      fake,
      financial,
      spam,
      phishing,
      urlRisk === "HIGH" ? 85 : urlRisk === "MEDIUM" ? 52 : 0,
    ) >= 70
      ? "HIGH"
      : Math.max(fake, financial, spam, phishing) >= 40
        ? "MEDIUM"
        : "LOW";
  const features = suspicious
    .filter((term) => raw.toLowerCase().includes(term))
    .slice(0, 6)
    .map((term, index) => ({
      label: term,
      value: Math.min(98, 64 + (5 - index) * 5),
      tone: index < 3 ? "risk" : "amber",
    }));
  const dependency = claimTexts.map((claim) => {
    const words = claim.split(/\s+/);
    return {
      subject: entities.find((entity) => entity.type === "ORG")?.text ?? words[0] ?? "subject",
      action:
        words.find((word) => /announ|offer|require|apply|submit|verify/i.test(word)) ?? "states",
      object: words.slice(2, 7).join(" ") || "claim",
    };
  });
  return {
    raw,
    tokens,
    normalized,
    lemmas,
    sentences,
    pos,
    entities,
    claimTexts,
    phishing,
    financial,
    spam,
    fake,
    url,
    urlRisk,
    overall,
    features,
    dependency,
  };
}

type ModelResult = { name: string; status: string; value: string; detail: string };

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = Body.parse(await request.json());
          const data = analyzeText(body.text, body.url || undefined);

          const ngramSummary = {
            unigrams: data.tokens.slice(0, 12),
            bigrams: grams(data.tokens, 2).slice(0, 10),
            trigrams: grams(data.tokens, 3).slice(0, 8),
          };
          const claimRecords = data.claimTexts.map((claim) => ({
            text: claim,
            type: isOpinion(claim) ? "OPINION / NON-CLAIM" : "VERIFIABLE CLAIM",
          }));
          const primaryClaim =
            claimRecords.find((claim) => claim.type === "VERIFIABLE CLAIM")?.text ??
            claimRecords[0]?.text ??
            data.raw;

          const id: string = crypto.randomUUID();
          let claimIds: (string | null)[] = claimRecords.map(() => null);
          let retrieved: RetrievedChunk[] = [];
          const modelResultsOut: ModelResult[] = [
            {
              name: "BERT / RoBERTa",
              status: "demo",
              value: `${data.fake}%`,
              detail: "Lightweight risk heuristic (fake-news signal)",
            },
            {
              name: "FinBERT",
              status: "demo",
              value: `${data.financial}%`,
              detail: "Financial-risk heuristic",
            },
            {
              name: "TF-IDF + SVM",
              status: "demo",
              value: `${data.spam}%`,
              detail: "Spam-pattern heuristic",
            },
            {
              name: "Phishing detector",
              status: "demo",
              value: `${data.phishing}%`,
              detail: "Social-engineering signals",
            },
          ];

          // Defaults used when Qwen3-8B is unavailable or the database isn't configured.
          let verdict: "SUPPORTED" | "REFUTED" | "UNVERIFIABLE" = "UNVERIFIABLE";
          let confidence = Math.min(
            96,
            Math.max(58, Math.round((data.fake + data.financial + data.phishing) / 3)),
          );
          let overallRisk: "LOW" | "MEDIUM" | "HIGH" = data.overall;
          let summary =
            data.overall === "HIGH"
              ? "This content is highly suspicious. The message combines urgency, a financial incentive, sensitive-data requests, or other social-engineering signals. No trusted evidence was available to support the claim."
              : "This claim needs trusted evidence before it can be verified. Review the risk signals and add an official source to the knowledge base.";
          let reasoning =
            "Qwen3-8B is not configured. The deterministic demo engine will not generate a verdict from unsupported evidence; this claim remains UNVERIFIABLE until trusted documents are indexed and the model is connected.";
          let qwenVerdict: QwenVerdict | null = null;
          let llamaReview: LlamaReview | null = null;
          let agreement: boolean | null = null;
          let evidenceStatus: "SUPPORTING" | "CONTRADICTING" | "INSUFFICIENT" = "INSUFFICIENT";
          let decisionExplanation = "";

          const db = getDb();
          if (db) {
            await db.insert(analyses).values({
              id,
              sessionId: body.sessionId,
              inputType: body.inputType,
              inputText: body.text,
              inputUrl: body.url || null,
              overallRisk: data.overall,
              verdict,
              confidence,
              summary,
              preprocessing: {
                rawText: data.raw,
                sentences: data.sentences,
                tokens: data.tokens,
                normalized: data.normalized,
                lemmas: data.lemmas,
              },
              nlpResults: {
                pos: data.pos,
                ngrams: ngramSummary,
                entities: data.entities,
                dependencies: data.dependency,
              },
            });

            if (claimRecords.length) {
              const rows = claimRecords.map((claim) => ({
                id: crypto.randomUUID(),
                analysisId: id,
                claimText: claim.text,
                claimType: claim.type,
                entities: data.entities,
              }));
              await db.insert(claims).values(rows);
              claimIds = rows.map((row) => row.id);
            }

            await db.insert(riskScores).values({
              id: crypto.randomUUID(),
              analysisId: id,
              fakeNewsScore: data.fake,
              financialScamScore: data.financial,
              spamScore: data.spam,
              phishingScore: data.phishing,
              urlRisk: data.urlRisk,
              overallRisk: data.overall,
              contributingFeatures: data.features,
            });

            // Hybrid keyword retrieval over whatever trusted documents have
            // been indexed for this session.
            retrieved = await retrieveEvidenceForSession(db, body.sessionId, primaryClaim);
            if (retrieved.length) {
              const primaryClaimId =
                claimIds[claimRecords.findIndex((claim) => claim.text === primaryClaim)] ??
                claimIds[0] ??
                null;
              await db.insert(evidence).values(
                retrieved.map((chunk) => ({
                  id: crypto.randomUUID(),
                  analysisId: id,
                  claimId: primaryClaimId,
                  documentId: chunk.documentId,
                  title: chunk.title,
                  organization: chunk.organization,
                  sourceUrl: chunk.sourceUrl,
                  pageNumber: chunk.pageNumber,
                  textChunk: chunk.text,
                  similarityScore: chunk.semanticScore.toFixed(4),
                  bm25Score: chunk.bm25Score.toFixed(4),
                })),
              );
            }

            // Qwen3-8B evidence-grounded verification, only when configured.
            if (isQwenConfigured()) {
              const qwenResult = await callQwenVerification({
                claim: primaryClaim,
                allClaims: claimRecords.map((claim) => claim.text),
                nlpSummary: {
                  entities: data.entities.map((entity) => `${entity.text} (${entity.type})`),
                  ngrams: ngramSummary.bigrams,
                },
                riskSignals: {
                  fakeNews: data.fake,
                  financialScam: data.financial,
                  spam: data.spam,
                  phishing: data.phishing,
                  urlRisk: data.urlRisk,
                },
                evidence: retrieved,
              });
              if (qwenResult.ok) {
                qwenVerdict = qwenResult.verdict;
                modelResultsOut.push({
                  name: "Qwen3-8B",
                  status: "success",
                  value: qwenVerdict.verdict,
                  detail: qwenVerdict.recommended_action || "Evidence-grounded verification",
                });

                // Llama 3.1 8B independent review (MODULE 20) — only runs
                // once Qwen has actually produced something to review.
                if (isLlamaConfigured()) {
                  const llamaResult = await callLlamaReview({
                    claim: primaryClaim,
                    allClaims: claimRecords.map((claim) => claim.text),
                    nlpSummary: {
                      entities: data.entities.map((entity) => `${entity.text} (${entity.type})`),
                      ngrams: ngramSummary.bigrams,
                    },
                    riskSignals: {
                      fakeNews: data.fake,
                      financialScam: data.financial,
                      spam: data.spam,
                      phishing: data.phishing,
                      urlRisk: data.urlRisk,
                    },
                    evidence: retrieved,
                    qwenVerdict,
                  });
                  if (llamaResult.ok) {
                    llamaReview = llamaResult.review;
                    modelResultsOut.push({
                      name: "Llama 3.1 8B (reviewer)",
                      status: "success",
                      value: llamaReview.review_verdict,
                      detail: llamaReview.agreement_with_qwen
                        ? "Agrees with Qwen3-8B"
                        : `Disagrees with Qwen3-8B${llamaReview.issues_found.length ? `: ${llamaReview.issues_found[0]}` : ""}`,
                    });
                  } else {
                    modelResultsOut.push({
                      name: "Llama 3.1 8B (reviewer)",
                      status: "error",
                      value: "—",
                      detail: llamaResult.error,
                    });
                  }
                } else {
                  modelResultsOut.push({
                    name: "Llama 3.1 8B (reviewer)",
                    status: "unavailable",
                    value: "—",
                    detail:
                      "Independent reviewer unavailable — configure LLAMA_API_URL/LLAMA_API_KEY to enable the second-LLM review.",
                  });
                }

                // Decision engine (MODULE 21/22) reconciles Qwen's verdict
                // with Llama's independent review, with the evidence
                // layer having final authority over either model.
                const decision = decide({
                  qwen: qwenVerdict,
                  llama: llamaReview,
                  evidence: retrieved,
                });
                verdict = decision.finalVerdict;
                confidence = decision.confidence;
                agreement = decision.agreement;
                evidenceStatus = decision.evidenceStatus;
                decisionExplanation = decision.explanation;
                overallRisk = qwenVerdict.risk_level;
                summary = qwenVerdict.evidence_summary || summary;
                const warningsSuffix = qwenVerdict.warnings.length
                  ? ` Warnings: ${qwenVerdict.warnings.join("; ")}.`
                  : "";
                reasoning = `${decision.explanation}${warningsSuffix}`;
              } else {
                modelResultsOut.push({
                  name: "Qwen3-8B",
                  status: "error",
                  value: "—",
                  detail: qwenResult.error,
                });
                modelResultsOut.push({
                  name: "Llama 3.1 8B (reviewer)",
                  status: "unavailable",
                  value: "—",
                  detail: "Skipped — nothing to review, since Qwen3-8B did not return a verdict.",
                });
                reasoning = `Qwen3-8B call failed (${qwenResult.error}). Falling back to the deterministic demo engine; this claim remains UNVERIFIABLE.`;
              }
            } else {
              modelResultsOut.push({
                name: "Qwen3-8B",
                status: "unavailable",
                value: "—",
                detail: "Model unavailable — configure Qwen3-8B/API to enable this module.",
              });
              modelResultsOut.push({
                name: "Llama 3.1 8B (reviewer)",
                status: "unavailable",
                value: "—",
                detail: "Skipped — nothing to review, since Qwen3-8B did not return a verdict.",
              });
              if (retrieved.length)
                reasoning = `Qwen3-8B is not configured, so ${retrieved.length} retrieved evidence chunk(s) cannot be reasoned over yet. This claim remains UNVERIFIABLE until the model is connected.`;
            }

            if (qwenVerdict) {
              const reviewRows: (typeof llmReviews.$inferInsert)[] = [
                {
                  id: crypto.randomUUID(),
                  analysisId: id,
                  modelName: "Qwen3-8B",
                  role: "primary",
                  verdict: qwenVerdict.verdict,
                  confidence: qwenVerdict.confidence,
                  reasoning: qwenVerdict.reasoning,
                  agreement: null,
                  issuesFound: [],
                },
              ];
              if (llamaReview) {
                reviewRows.push({
                  id: crypto.randomUUID(),
                  analysisId: id,
                  modelName: "Llama 3.1 8B",
                  role: "reviewer",
                  verdict: llamaReview.review_verdict,
                  confidence: llamaReview.confidence,
                  reasoning: llamaReview.review_reasoning,
                  agreement: String(llamaReview.agreement_with_qwen),
                  issuesFound: llamaReview.issues_found,
                });
              }
              await db.insert(llmReviews).values(reviewRows);
            }

            await db.insert(modelResults).values(
              modelResultsOut.map((model) => ({
                id: crypto.randomUUID(),
                analysisId: id,
                modelName: model.name,
                status: model.status,
                result: { value: model.value, detail: model.detail },
              })),
            );
            await db
              .update(analyses)
              .set({ verdict, confidence, overallRisk, summary })
              .where(eq(analyses.id, id));
          } else {
            modelResultsOut.push({
              name: "Qwen3-8B",
              status: "unavailable",
              value: "—",
              detail: "Model unavailable — configure Qwen3-8B/API to enable this module.",
            });
            modelResultsOut.push({
              name: "Llama 3.1 8B (reviewer)",
              status: "unavailable",
              value: "—",
              detail: "Skipped — no database configured, and nothing to review.",
            });
          }

          return Response.json({
            success: true,
            result: {
              id,
              createdAt: new Date().toISOString(),
              inputType: body.inputType,
              inputText: body.text,
              inputUrl: data.url,
              preprocessing: {
                rawText: data.raw,
                sentences: data.sentences,
                tokens: data.tokens,
                normalized: data.normalized,
                lemmas: data.lemmas,
              },
              nlp: {
                pos: data.pos,
                ngrams: ngramSummary,
                entities: data.entities,
                dependencies: data.dependency,
              },
              claims: claimRecords.map((claim, index) => ({
                id: claimIds[index] ?? `${id}-claim-${index + 1}`,
                text: claim.text,
                type: claim.type,
                entities: data.entities.map((entity) => entity.text),
              })),
              risks: {
                fakeNews: data.fake,
                financialScam: data.financial,
                spam: data.spam,
                phishing: data.phishing,
                urlRisk: data.urlRisk,
                overall: overallRisk,
                features: data.features,
              },
              semanticSimilarity: retrieved[0]
                ? Number(retrieved[0].semanticScore.toFixed(2))
                : null,
              verdict,
              confidence,
              summary,
              reasoning,
              qwen: qwenVerdict
                ? {
                    verdict: qwenVerdict.verdict,
                    confidence: qwenVerdict.confidence,
                    reasoning: qwenVerdict.reasoning,
                  }
                : null,
              llama: llamaReview
                ? {
                    verdict: llamaReview.review_verdict,
                    confidence: llamaReview.confidence,
                    reasoning: llamaReview.review_reasoning,
                    agreementWithQwen: llamaReview.agreement_with_qwen,
                    issuesFound: llamaReview.issues_found,
                  }
                : null,
              decision: {
                agreement,
                evidenceStatus,
                explanation: decisionExplanation,
              },
              evidence: retrieved.map((chunk) => ({
                id: chunk.chunkId,
                title: chunk.title,
                organization: chunk.organization ?? "Unknown",
                sourceUrl: chunk.sourceUrl ?? undefined,
                pageNumber: chunk.pageNumber ?? undefined,
                textChunk: chunk.text,
                similarityScore: chunk.semanticScore,
                bm25Score: chunk.bm25Score,
              })),
              modelResults: modelResultsOut,
              demoMode: !isQwenConfigured(),
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Analysis failed";
          return Response.json(
            { success: false, error: message, module: "analysis" },
            { status: 400 },
          );
        }
      },
    },
  },
});

async function retrieveEvidenceForSession(
  db: Database,
  sessionId: string,
  claimText: string,
): Promise<RetrievedChunk[]> {
  const queryTokens = wordTokens(claimText);
  if (queryTokens.length === 0) return [];

  // Only pull chunks whose parent document belongs to this session — this
  // is the piece Postgres RLS used to handle for us.
  const rows = await db
    .select({
      chunkId: documentChunks.id,
      documentId: documentChunks.documentId,
      pageNumber: documentChunks.pageNumber,
      textChunk: documentChunks.textChunk,
      title: documents.title,
      organization: documents.organization,
      sourceUrl: documents.sourceUrl,
    })
    .from(documentChunks)
    .innerJoin(documents, eq(documents.id, documentChunks.documentId))
    .where(eq(documents.sessionId, sessionId))
    .limit(500);

  const indexed: IndexedChunk[] = rows.map((row) => ({
    chunkId: row.chunkId,
    documentId: row.documentId,
    title: row.title,
    organization: row.organization,
    sourceUrl: row.sourceUrl,
    pageNumber: row.pageNumber,
    text: row.textChunk,
  }));
  return retrieveTopK(claimText, indexed, 5);
}
