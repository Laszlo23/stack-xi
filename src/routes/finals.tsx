import { createFileRoute } from "@tanstack/react-router";
import { FinalsPage } from "@/features/finals/StacksFinalsTeaser";
import { buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/finals")({
  head: () =>
    buildPageSeo({
      title: "Finals — Stacks & Bitcoin",
      description:
        "STACK XI finals arc on Stacks and Bitcoin — sBTC predictions and championship culture for Base believers. Coming after Dallas matchdays.",
      path: "/finals",
      keywords: ["Stacks", "Bitcoin", "sBTC", "World Cup finals", "Base believers"],
    }),
  component: FinalsPage,
});
