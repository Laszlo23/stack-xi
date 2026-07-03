import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/content";

type LegalSection = { title: string; body: string };

export function LegalDocument({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: readonly LegalSection[];
}) {
  return (
    <PageShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Legal · Updated {LEGAL_LAST_UPDATED}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-bold">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 font-mono text-xs">
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-primary hover:underline">
            Terms
          </Link>
          <Link to="/imprint" className="text-primary hover:underline">
            Imprint
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-primary">
            ← Home
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
