import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { analyses, evidence } from "@/db/schema";

export const Route = createFileRoute("/api/evidence")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId)
          return Response.json({ success: false, error: "Missing session" }, { status: 400 });

        const db = getDb();
        if (!db) return Response.json({ success: true, items: [] });

        // Evidence rows don't carry a session_id of their own — they belong
        // to an analysis, which does. Join through analyses to keep this
        // scoped to the caller's session (Postgres RLS used to do this for
        // us automatically; here we do it explicitly).
        const rows = await db
          .select({
            id: evidence.id,
            analysisId: evidence.analysisId,
            title: evidence.title,
            organization: evidence.organization,
            sourceUrl: evidence.sourceUrl,
            pageNumber: evidence.pageNumber,
            textChunk: evidence.textChunk,
            similarityScore: evidence.similarityScore,
            bm25Score: evidence.bm25Score,
            createdAt: evidence.createdAt,
          })
          .from(evidence)
          .innerJoin(analyses, eq(analyses.id, evidence.analysisId))
          .where(eq(analyses.sessionId, sessionId))
          .orderBy(desc(evidence.createdAt))
          .limit(100);

        return Response.json({ success: true, items: rows });
      },
    },
  },
});
