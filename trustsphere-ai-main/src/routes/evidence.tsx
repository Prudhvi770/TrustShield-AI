import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";
export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | Evidence" },
      {
        name: "description",
        content: "Inspect trusted evidence retrieved for claim verification.",
      },
      { property: "og:title", content: "TrustShield AI | Evidence" },
      {
        property: "og:description",
        content: "Inspect trusted evidence retrieved for claim verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TrustShieldApp view="evidence" />,
});
