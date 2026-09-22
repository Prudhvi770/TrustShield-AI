import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";
export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | Reports" },
      { name: "description", content: "Download TrustShield AI verification reports." },
      { property: "og:title", content: "TrustShield AI | Reports" },
      { property: "og:description", content: "Download TrustShield AI verification reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TrustShieldApp view="reports" />,
});
