import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { analyses } from "@/db/schema";

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId)
          return Response.json({ success: false, error: "Missing session" }, { status: 400 });

        const db = getDb();
        if (!db) return Response.json({ success: true, items: [] });

        const items = await db
          .select({
            id: analyses.id,
            createdAt: analyses.createdAt,
            inputType: analyses.inputType,
            inputText: analyses.inputText,
            verdict: analyses.verdict,
            overallRisk: analyses.overallRisk,
            confidence: analyses.confidence,
            summary: analyses.summary,
          })
          .from(analyses)
          .where(eq(analyses.sessionId, sessionId))
          .orderBy(desc(analyses.createdAt))
          .limit(50);

        return Response.json({ success: true, items });
      },
    },
  },
});
