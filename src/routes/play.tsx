import { createFileRoute, redirect } from "@tanstack/react-router";
import { getActiveMatchSlug } from "@/lib/story/match-slugs";

export const Route = createFileRoute("/play")({
  beforeLoad: () => {
    const slug = getActiveMatchSlug();
    throw redirect({ to: "/match/$slug", params: { slug } });
  },
});
