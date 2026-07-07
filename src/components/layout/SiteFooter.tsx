import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PROTOCOL_NAME, PROTOCOL_TAGLINE } from "@/domain/constants";
import {
  FOOTER_BUILDER_LINKS,
  FOOTER_COMMUNITY_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_RESOURCE_LINKS,
  LEGAL_ROUTES,
} from "@/lib/legal/footer-links";

type FooterRoute = "/" | "/profile" | "/defi" | "/calendar" | "/partners" | "/blog" | "/finals" | "/faq" | "/story" | "/squad" | "/leaderboard" | "/feed" | "/quest" | "/play" | "/proof" | "/world-cup";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterExternalItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
      >
        {label}
        <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-60" aria-hidden />
      </a>
    </li>
  );
}

function FooterRouteItem({
  to,
  hash,
  label,
}: {
  to: FooterRoute;
  hash?: string;
  label: string;
}) {
  return (
    <li>
      {hash ? (
        <Link
          to={to}
          hash={hash}
          className="text-sm text-muted-foreground transition hover:text-primary"
        >
          {label}
        </Link>
      ) : (
        <Link to={to} className="text-sm text-muted-foreground transition hover:text-primary">
          {label}
        </Link>
      )}
    </li>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="relative border-t border-primary/20 bg-surface/40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 py-12 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:pb-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-black text-primary-foreground shadow-[0_0_24px_var(--neon)]">
                XI
              </div>
              <div>
                <div className="font-display text-lg font-bold tracking-wide">{PROTOCOL_NAME}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  The internet&apos;s football playground
                </div>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {PROTOCOL_TAGLINE} Predict. Compete. Share. Return tomorrow.
            </p>
          </div>

          <FooterColumn title="Play">
            {FOOTER_PRODUCT_LINKS.map((link) => (
              <FooterRouteItem
                key={`${link.to}${"hash" in link ? link.hash : ""}-${link.label}`}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                label={link.label}
              />
            ))}
          </FooterColumn>

          <FooterColumn title="Builders">
            {FOOTER_BUILDER_LINKS.map((link) =>
              "external" in link && link.external ? (
                <FooterExternalItem key={link.href} href={link.href} label={link.label} />
              ) : (
                <FooterRouteItem key={link.label} to={link.to} label={link.label} />
              ),
            )}
          </FooterColumn>

          <FooterColumn title="Learn">
            {FOOTER_RESOURCE_LINKS.map((link) => (
              <FooterRouteItem key={link.to} to={link.to} label={link.label} />
            ))}
          </FooterColumn>

          <FooterColumn title="Community">
            {FOOTER_COMMUNITY_LINKS.map((link) => (
              <FooterExternalItem key={link.href} href={link.href} label={link.label} />
            ))}
            {LEGAL_ROUTES.map((link) => (
              <FooterRouteItem key={link.to} to={link.to} label={link.label} />
            ))}
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Predictions involve financial risk. Not investment advice. Blockchain should feel invisible. Fun should be obvious.
          </p>
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {year} {PROTOCOL_NAME}
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none h-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:hidden"
        aria-hidden
      />
    </footer>
  );
}
