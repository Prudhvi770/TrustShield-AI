import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { analyses, claims, evidence, llmReviews, modelResults, riskScores } from "@/db/schema";

export const Route = createFileRoute("/api/analysis/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId)
          return Response.json({ success: false, error: "Missing session" }, { status: 400 });

        const db = getDb();
        if (!db)
          return Response.json(
            { success: false, error: "Cloud database unavailable" },
            { status: 503 },
          );

        const [analysisRow] = await db
          .select()
          .from(analyses)
          .where(and(eq(analyses.id, params.id), eq(analyses.sessionId, sessionId)))
          .limit(1);

        if (!analysisRow)
          return Response.json({ success: false, error: "Analysis not found" }, { status: 404 });

        const [claimRows, riskRows, evidenceRows, modelRows, reviewRows] = await Promise.all([
          db.select().from(claims).where(eq(claims.analysisId, params.id)),
          db.select().from(riskScores).where(eq(riskScores.analysisId, params.id)).limit(1),
          db.select().from(evidence).where(eq(evidence.analysisId, params.id)),
          db.select().from(modelResults).where(eq(modelResults.analysisId, params.id)),
          db.select().from(llmReviews).where(eq(llmReviews.analysisId, params.id)),
        ]);

        return Response.json({
          success: true,
          analysis: analysisRow,
          claims: claimRows,
          risks: riskRows[0] ?? null,
          evidence: evidenceRows,
          models: modelRows,
          llmReviews: reviewRows,
        });
      },
    },
  },
});
