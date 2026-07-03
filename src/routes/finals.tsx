import { createFileRoute } from "@tanstack/react-router";
import { FinalsPage } from "@/features/finals/StacksFinalsTeaser";

export const Route = createFileRoute("/finals")({
  component: FinalsPage,
});
