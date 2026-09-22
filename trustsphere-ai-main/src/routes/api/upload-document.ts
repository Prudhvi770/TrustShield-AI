import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { documentChunks, documents } from "@/db/schema";
import { extractDocumentText } from "@/lib/document-extract";
import { chunkText } from "@/lib/retrieval";

export const Route = createFileRoute("/api/upload-document")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const file = form.get("file");
        const sessionId = String(form.get("sessionId") ?? "");
        const organization = String(form.get("organization") ?? "").trim() || null;
        const titleOverride = String(form.get("title") ?? "").trim();
        const sourceUrl = String(form.get("sourceUrl") ?? "").trim() || null;

        if (!(file instanceof File) || !sessionId) {
          return Response.json(
            { success: false, error: "A file and session are required", module: "documents" },
            { status: 400 },
          );
        }
        if (file.size > 10 * 1024 * 1024) {
          return Response.json(
            { success: false, error: "Files must be smaller than 10 MB", module: "documents" },
            { status: 413 },
          );
        }
        const supported = [
          "text/plain",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!supported.includes(file.type)) {
          return Response.json(
            {
              success: false,
              error: "Only TXT, PDF, and DOCX files are supported",
              module: "documents",
            },
            { status: 415 },
          );
        }

        const title = titleOverride || file.name.replace(/\.[^.]+$/, "");
        const db = getDb();
        if (!db) {
          return Response.json({
            success: true,
            demo: true,
            status: "pending",
            message: "Cloud database unavailable — document staged in Demo Mode.",
          });
        }

        const docId = crypto.randomUUID();
        await db.insert(documents).values({
          id: docId,
          sessionId,
          title,
          organization,
          sourceUrl,
          documentType: "trusted_document",
          fileName: file.name,
          embeddingStatus: "pending",
        });
        const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1);
        if (!doc)
          return Response.json(
            { success: false, error: "Could not save the document record", module: "documents" },
            { status: 500 },
          );

        const extraction = await extractDocumentText(file);
        if (!extraction.ok) {
          const status = file.type === "application/pdf" ? "pdf_pending" : "extraction_failed";
          await db
            .update(documents)
            .set({ embeddingStatus: status })
            .where(eq(documents.id, docId));
          return Response.json({
            success: true,
            document: { ...doc, embeddingStatus: status },
            message: `Document metadata saved. ${extraction.reason}`,
          });
        }

        const chunks = chunkText(extraction.text);
        if (chunks.length === 0) {
          await db
            .update(documents)
            .set({ embeddingStatus: "extraction_failed" })
            .where(eq(documents.id, docId));
          return Response.json({
            success: true,
            document: { ...doc, embeddingStatus: "extraction_failed" },
            message: "No usable text could be chunked from this document.",
          });
        }

        await db.insert(documentChunks).values(
          chunks.map((text, index) => ({
            id: crypto.randomUUID(),
            documentId: docId,
            chunkIndex: index,
            textChunk: text,
            metadata: { char_length: text.length },
          })),
        );

        await db
          .update(documents)
          .set({ chunkCount: chunks.length, embeddingStatus: "chunked" })
          .where(eq(documents.id, docId));
        const [updated] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1);

        return Response.json({
          success: true,
          document: updated,
          message: `Indexed ${chunks.length} chunk(s) for keyword/BM25 retrieval. Vector embeddings require Sentence-BERT to be configured.`,
        });
      },
    },
  },
});
