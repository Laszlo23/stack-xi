import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { ViralPostCalendarPage } from "@/features/growth/ViralPostCalendarPage";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { CALENDAR_RANGE_LABEL } from "@/lib/growth/viral-calendar";

export const Route = createFileRoute("/calendar")({
  head: () =>
    buildPageSeo({
      title: "14-Day Viral Post Calendar",
      description: `STACK XI ${CALENDAR_RANGE_LABEL} — two weeks of Farcaster casts and X memes for Building Culture distribution: knockout push and semifinal arc for BCC prediction loops on Base.`,
      path: "/calendar",
      keywords: [
        "Building Culture",
        "Farcaster growth",
        "World Cup predictions",
        "BCC",
        "viral post calendar",
        "STACK XI distribution",
      ],
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Post Calendar", path: "/calendar" },
      ]),
    }),
  component: CalendarRoute,
});

function CalendarRoute() {
  return (
    <PageShell>
      <ViralPostCalendarPage />
    </PageShell>
  );
}
