import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Glasses, Home, ShieldCheck, Sparkles, Target, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchdayTicker } from "@/components/layout/MatchdayTicker";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PROTOCOL_NAME } from "@/domain/constants";
import { BaseWalletChip } from "@/features/wallet/BaseWalletChip";

const NAV_ITEMS = [
  { hash: undefined, route: "/" as const, label: "Home", icon: Home },
  { hash: "visual-story", route: undefined, label: "Lore", icon: Sparkles },
  { hash: "story", route: undefined, label: "Story", icon: BookOpen },
  { hash: "squad", route: undefined, label: "Squad", icon: Users },
  { hash: "predict", route: undefined, label: "Predict", icon: Target },
  { hash: "decentraland", route: undefined, label: "Metaverse", icon: Glasses },
  { hash: undefined, route: "/proof" as const, label: "Proof", icon: ShieldCheck },
  { hash: undefined, route: "/profile" as const, label: "Profile", icon: User },
] as const;

/** Primary destinations on small screens — wallet stays in the header. */
const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0],
  NAV_ITEMS[6],
  NAV_ITEMS[4],
  NAV_ITEMS[3],
  NAV_ITEMS[7],
] as const;

function NavItem({
  hash,
  route,
  label,
  icon: Icon,
  mobile,
  activeHash,
  pathname,
}: {
  hash?: string;
  route?: "/" | "/profile" | "/proof";
  label: string;
  icon: typeof Home;
  mobile?: boolean;
  activeHash: string;
  pathname: string;
}) {
  const isActive = route
    ? pathname === route
    : hash === undefined
      ? pathname === "/" && activeHash === ""
      : pathname === "/" && activeHash === hash;

  const className = mobile
    ? `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium uppercase tracking-wide ${isActive ? "text-primary" : "text-muted-foreground"}`
    : `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-primary"}`;

  if (hash) {
    return (
      <Link to="/" hash={hash} className={className}>
        <Icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        {label}
      </Link>
    );
  }

  return (
    <Link to={route ?? "/"} className={className}>
      <Icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
      {label}
    </Link>
  );
}

export function AppNav() {
  const [activeHash, setActiveHash] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash.replace("#", ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="border-b border-primary/20 bg-primary/5 px-4 py-1.5">
          <MatchdayTicker />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary font-black text-primary-foreground shadow-[0_0_20px_var(--neon)]">
              XI
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="font-display text-sm font-bold tracking-wide">{PROTOCOL_NAME}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} {...item} activeHash={activeHash} pathname={pathname} />
            ))}
          </nav>

          <BaseWalletChip />
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} mobile activeHash={activeHash} pathname={pathname} />
        ))}
      </nav>
    </>
  );
}

export function AppFooter() {
  return <SiteFooter />;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      {children}
      <AppFooter />
    </div>
  );
}
