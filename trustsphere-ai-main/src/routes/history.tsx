import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";
export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | History" },
      { name: "description", content: "Review previous TrustShield AI claim analyses." },
      { property: "og:title", content: "TrustShield AI | History" },
      { property: "og:description", content: "Review previous TrustShield AI claim analyses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TrustShieldApp view="history" />,
});
