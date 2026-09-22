import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { analyses } from "@/db/schema";

export const Route = createFileRoute("/api/history/$id")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId)
          return Response.json({ success: false, error: "Missing session" }, { status: 400 });

        const db = getDb();
        if (!db)
          return Response.json(
            { success: false, error: "Cloud database unavailable" },
            { status: 503 },
          );

        // Deleting an analysis cascades to its claims/risk-scores/evidence/
        // model-results via the foreign keys' ON DELETE CASCADE.
        await db
          .delete(analyses)
          .where(and(eq(analyses.id, params.id), eq(analyses.sessionId, sessionId)));

        return Response.json({ success: true });
      },
    },
  },
});
