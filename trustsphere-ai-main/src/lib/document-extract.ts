// Document text extraction for the trusted-knowledge-base ingestion pipeline
// (MODULE 10). Only extracts what can be done reliably in this environment:
//
//   - text/plain            -> read directly
//   - .docx                 -> mammoth (pure-JS, no native deps)
//   - application/pdf       -> NOT extracted here (no safe, dependency-light
//                              PDF parser is wired up). The document is still
//                              stored with embedding_status "pdf_pending" so
//                              nothing is silently dropped, and the UI is
//                              honest that PDF text extraction isn't live yet
//                              rather than fabricating chunks.
export type ExtractionResult = { ok: true; text: string } | { ok: false; reason: string };

export async function extractDocumentText(file: File): Promise<ExtractionResult> {
  if (file.type === "text/plain") {
    const text = await file.text();
    return text.trim() ? { ok: true, text } : { ok: false, reason: "The text file was empty." };
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    try {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim()
        ? { ok: true, text: result.value }
        : { ok: false, reason: "No extractable text found in the DOCX file." };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "DOCX extraction failed.",
      };
    }
  }

  if (file.type === "application/pdf") {
    return {
      ok: false,
      reason:
        "PDF text extraction is not wired up yet — the document is staged with metadata only. Re-run indexing once a PDF parser is configured.",
    };
  }

  return { ok: false, reason: "Unsupported file type." };
}
