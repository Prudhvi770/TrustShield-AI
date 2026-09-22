import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { documents } from "@/db/schema";

export const Route = createFileRoute("/api/documents/$id")({
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

        // Scope the delete to this session so one session can't remove
        // another session's document by guessing its id.
        await db
          .delete(documents)
          .where(and(eq(documents.id, params.id), eq(documents.sessionId, sessionId)));

        return Response.json({ success: true });
      },
    },
  },
});
