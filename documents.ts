import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { documents } from "@/db/schema";

export const Route = createFileRoute("/api/documents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId)
          return Response.json({ success: false, error: "Missing session" }, { status: 400 });

        const db = getDb();
        if (!db) return Response.json({ success: true, items: [] });

        // There's no row-level security here (MySQL doesn't have Postgres's
        // RLS), so every query in this file filters by session_id itself.
        const items = await db
          .select({
            id: documents.id,
            title: documents.title,
            organization: documents.organization,
            documentDate: documents.documentDate,
            sourceUrl: documents.sourceUrl,
            documentType: documents.documentType,
            fileName: documents.fileName,
            chunkCount: documents.chunkCount,
            embeddingStatus: documents.embeddingStatus,
            createdAt: documents.createdAt,
          })
          .from(documents)
          .where(eq(documents.sessionId, sessionId))
          .orderBy(desc(documents.createdAt))
          .limit(100);

        return Response.json({ success: true, items });
      },
    },
  },
});
