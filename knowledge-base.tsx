import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";
export const Route = createFileRoute("/knowledge-base")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | Knowledge Base" },
      { name: "description", content: "Stage trusted sources for TrustShield AI retrieval." },
      { property: "og:title", content: "TrustShield AI | Knowledge Base" },
      {
        property: "og:description",
        content: "Stage trusted sources for TrustShield AI retrieval.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TrustShieldApp view="knowledge" />,
});
