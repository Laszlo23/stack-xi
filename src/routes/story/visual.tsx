import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeVisualScroll } from "@/features/story/PepeVisualScroll";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/story/visual")({
  head: () =>
    buildPageSeo({
      title: "Pepe Visual Lore",
      description:
        "Six chapters of Pepe matchday cinema — beer, penguins, headers, goals, and the legend card. Scroll the visual lore on STACK XI.",
      path: "/story/visual",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Story", path: "/story" },
        { name: "Visual Lore", path: "/story/visual" },
      ]),
    }),
  component: StoryVisualPage,
});

function StoryVisualPage() {
  return (
    <PageShell>
      <PepeVisualScroll id="visual-story" />
    </PageShell>
  );
}
