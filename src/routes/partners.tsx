import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PartnersPage } from "@/features/partners/PartnersPage";
import { buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/partners")({
  head: () =>
    buildPageSeo({
      title: "Partners",
      description:
        "Partner with STACK XI and Building Culture — culture distribution, matchday activations, BCC ecosystem exposure, and co-branded viral loops on Base.",
      path: "/partners",
      keywords: ["partners", "culture distribution", "BCC", "Farcaster", "Base"],
    }),
  component: PartnersRoute,
});

function PartnersRoute() {
  return (
    <PageShell>
      <PartnersPage />
    </PageShell>
  );
}
