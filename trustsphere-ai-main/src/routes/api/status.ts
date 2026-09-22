import { createFileRoute } from "@tanstack/react-router";
import { isDatabaseConfigured } from "@/db/client";
import { isQwenConfigured } from "@/lib/qwen";
import { isLlamaConfigured } from "@/lib/llama";

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          success: true,
          cloudDatabase: isDatabaseConfigured(),
          qwen: isQwenConfigured(),
          qwenModel: process.env["QWEN_MODEL"] || "qwen3-8b",
          llama: isLlamaConfigured(),
          llamaModel: process.env["LLAMA_MODEL"] || "llama-3.1-8b",
        });
      },
    },
  },
});
