import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";
export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | Settings" },
      { name: "description", content: "Review TrustShield AI model and pipeline configuration." },
      { property: "og:title", content: "TrustShield AI | Settings" },
      {
        property: "og:description",
        content: "Review TrustShield AI model and pipeline configuration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TrustShieldApp view="settings" />,
});
