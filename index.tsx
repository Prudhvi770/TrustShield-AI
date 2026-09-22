import { createFileRoute } from "@tanstack/react-router";
import { TrustShieldApp } from "@/components/TrustShieldApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustShield AI | Claim Verification" },
      {
        name: "description",
        content: "Evidence-grounded claim verification and digital-risk analysis.",
      },
      { property: "og:title", content: "TrustShield AI | Claim Verification" },
      {
        property: "og:description",
        content: "Analyze claims, surface risk signals, and keep verification evidence visible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <TrustShieldApp view="dashboard" />;
}
