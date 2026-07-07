import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/admin")({
  head: () =>
    buildPageSeo({
      title: "Admin",
      description: "STACK XI operations dashboard",
      path: "/admin",
    }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <AdminDashboard />
      </main>
    </PageShell>
  );
}
