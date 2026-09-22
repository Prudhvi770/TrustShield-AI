// MySQL table definitions for TrustSphere, written with Drizzle ORM.
//
// This mirrors the old Supabase/Postgres schema (see the removed
// supabase/migrations folder in project history) with a few deliberate
// changes for MySQL:
//   - uuid columns become varchar(36); we generate the id in application
//     code with crypto.randomUUID() rather than relying on a DB default,
//     since that works the same on MySQL 5.7, 8.x, and MariaDB.
//   - jsonb becomes json (MySQL's native JSON type).
//   - Postgres Row Level Security is gone. MySQL has no equivalent, so
//     every query in src/routes/api now filters by session_id itself —
//     see src/db/client.ts and the route handlers for how that's done.
import { relations, sql } from "drizzle-orm";
import {
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

const id = () => varchar("id", { length: 36 }).primaryKey();
const createdAt = () =>
  timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow();

export const analyses = mysqlTable(
  "analyses",
  {
    id: id(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    inputType: varchar("input_type", { length: 64 }).notNull(),
    inputText: text("input_text").notNull(),
    inputUrl: text("input_url"),
    overallRisk: varchar("overall_risk", { length: 32 }).notNull().default("UNVERIFIABLE"),
    verdict: varchar("verdict", { length: 32 }).notNull().default("UNVERIFIABLE"),
    confidence: int("confidence").notNull().default(0),
    summary: text("summary"),
    preprocessing: json("preprocessing").notNull(),
    nlpResults: json("nlp_results").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("analyses_session_idx").on(table.sessionId)],
);

export const claims = mysqlTable(
  "claims",
  {
    id: id(),
    analysisId: varchar("analysis_id", { length: 36 }).notNull(),
    claimText: text("claim_text").notNull(),
    claimType: varchar("claim_type", { length: 64 }).notNull().default("VERIFIABLE CLAIM"),
    entities: json("entities").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("claims_analysis_idx").on(table.analysisId)],
);

export const riskScores = mysqlTable(
  "risk_scores",
  {
    id: id(),
    analysisId: varchar("analysis_id", { length: 36 }).notNull(),
    fakeNewsScore: int("fake_news_score").notNull().default(0),
    financialScamScore: int("financial_scam_score").notNull().default(0),
    spamScore: int("spam_score").notNull().default(0),
    phishingScore: int("phishing_score").notNull().default(0),
    urlRisk: varchar("url_risk", { length: 16 }).notNull().default("LOW"),
    overallRisk: varchar("overall_risk", { length: 16 }).notNull().default("LOW"),
    contributingFeatures: json("contributing_features").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("risk_scores_analysis_idx").on(table.analysisId)],
);

export const evidence = mysqlTable(
  "evidence",
  {
    id: id(),
    analysisId: varchar("analysis_id", { length: 36 }).notNull(),
    claimId: varchar("claim_id", { length: 36 }),
    documentId: varchar("document_id", { length: 36 }),
    title: varchar("title", { length: 500 }).notNull(),
    organization: varchar("organization", { length: 255 }),
    sourceUrl: text("source_url"),
    pageNumber: int("page_number"),
    textChunk: text("text_chunk").notNull(),
    similarityScore: decimal("similarity_score", { precision: 5, scale: 4 }),
    bm25Score: decimal("bm25_score", { precision: 5, scale: 4 }),
    createdAt: createdAt(),
  },
  (table) => [index("evidence_analysis_idx").on(table.analysisId)],
);

export const modelResults = mysqlTable(
  "model_results",
  {
    id: id(),
    analysisId: varchar("analysis_id", { length: 36 }).notNull(),
    modelName: varchar("model_name", { length: 128 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("unavailable"),
    result: json("result").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("model_results_analysis_idx").on(table.analysisId)],
);

export const llmReviews = mysqlTable(
  "llm_reviews",
  {
    id: id(),
    analysisId: varchar("analysis_id", { length: 36 }).notNull(),
    modelName: varchar("model_name", { length: 128 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().default("reviewer"), // "primary" | "reviewer"
    verdict: varchar("verdict", { length: 32 }).notNull().default("UNVERIFIABLE"),
    confidence: int("confidence").notNull().default(0),
    reasoning: text("reasoning"),
    agreement: varchar("agreement", { length: 8 }), // "true" | "false" | null (no reviewer to compare)
    issuesFound: json("issues_found").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("llm_reviews_analysis_idx").on(table.analysisId)],
);

export const documents = mysqlTable(
  "documents",
  {
    id: id(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    organization: varchar("organization", { length: 255 }),
    documentDate: datetime("document_date"),
    sourceUrl: text("source_url"),
    documentType: varchar("document_type", { length: 64 }).notNull().default("trusted_document"),
    fileName: varchar("file_name", { length: 500 }),
    chunkCount: int("chunk_count").notNull().default(0),
    embeddingStatus: varchar("embedding_status", { length: 32 }).notNull().default("pending"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("documents_session_idx").on(table.sessionId)],
);

export const documentChunks = mysqlTable(
  "document_chunks",
  {
    id: id(),
    documentId: varchar("document_id", { length: 36 }).notNull(),
    chunkIndex: int("chunk_index").notNull(),
    pageNumber: int("page_number"),
    textChunk: text("text_chunk").notNull(),
    embedding: json("embedding"),
    metadata: json("metadata").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("document_chunks_document_idx").on(table.documentId)],
);

// Relations are only used to power the `with: {...}` join helpers in the
// route handlers (e.g. pulling a chunk's parent document in one query).
export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const documentsRelations = relations(documents, ({ many }) => ({
  chunks: many(documentChunks),
}));
