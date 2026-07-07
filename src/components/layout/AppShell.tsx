import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  Code2,
  Home,
  MoreHorizontal,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingActionCTAs } from "@/components/layout/FloatingActionCTAs";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LiveMatchTicker } from "@/features/match/LiveMatchTicker";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PROTOCOL_NAME } from "@/domain/constants";
import { BaseWalletChip } from "@/features/wallet/BaseWalletChip";
import { useMatchResults } from "@/hooks/use-match-results";
import { getActiveMatchSlug } from "@/lib/story/match-slugs";

type NavRoute =
  | "/"
  | "/profile"
  | "/proof"
  | "/feed"
  | "/quest"
  | "/defi"
  | "/finals"
  | "/story"
  | "/squad"
  | "/leaderboard"
  | "/play";

type NavItemConfig = {
  hash?: string;
  route?: NavRoute;
  label: string;
  icon: typeof Home;
};

const NAV_ITEMS: readonly NavItemConfig[] = [
  { route: "/", label: "Home", icon: Home },
  { route: "/play", label: "Play", icon: Target },
  { route: "/story", label: "Story", icon: Sparkles },
  { route: "/squad", label: "Squad", icon: Users },
  { route: "/feed", label: "Community", icon: Radio },
] as const;

const MORE_NAV: readonly NavItemConfig[] = [
  { route: "/story/visual", label: "Full Pepe lore", icon: Sparkles },
  { route: "/world-cup", label: "World Cup", icon: Sparkles },
  { route: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { route: "/quest", label: "Quest", icon: Ticket },
  { route: "/profile", label: "Profile", icon: User },
  { route: "/proof", label: "Proof", icon: ShieldCheck },
] as const;

const BUILDERS_NAV: readonly NavItemConfig[] = [
  { route: "/defi", label: "DeFi hub", icon: Code2 },
  { route: "/finals", label: "Finals arc", icon: ShieldCheck },
  { route: "/proof", label: "Onchain proof", icon: ShieldCheck },
] as const;

const DESKTOP_PRIMARY_NAV = NAV_ITEMS;
const MOBILE_NAV_ITEMS = NAV_ITEMS;

function NavItem({
  hash,
  route,
  label,
  icon: Icon,
  mobile,
  activeHash,
  pathname,
}: NavItemConfig & {
  mobile?: boolean;
  activeHash: string;
  pathname: string;
}) {
  const isActive = route
    ? route === "/play"
      ? pathname.startsWith("/match/") || pathname === "/play" || (pathname === "/" && activeHash === "predict")
      : pathname === route || (route === "/" && pathname === "/" && !activeHash)
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

  const playSlug = getActiveMatchSlug();
  const to = route === "/play" ? ("/match/$slug" as const) : (route ?? "/");
  const params = route === "/play" ? { slug: playSlug } : undefined;

  return (
    <Link to={to} params={params} className={className}>
      <Icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
      {label}
    </Link>
  );
}

function MoreNavMenu({
  activeHash,
  pathname,
}: {
  activeHash: string;
  pathname: string;
}) {
  const isMoreActive = [...MORE_NAV, ...BUILDERS_NAV].some((item) =>
    item.route ? pathname === item.route : pathname === "/" && activeHash === item.hash,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`gap-1.5 px-3 ${
            isMoreActive
              ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          More
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {MORE_NAV.map((item) => {
          const Icon = item.icon;
          if (item.hash) {
            return (
              <DropdownMenuItem key={item.label} asChild>
                <Link to="/" hash={item.hash} className="flex cursor-pointer items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem key={item.label} asChild>
              <Link to={item.route ?? "/"} className="flex cursor-pointer items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Builders
        </DropdownMenuLabel>
        {BUILDERS_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.label} asChild>
              <Link to={item.route ?? "/"} className="flex cursor-pointer items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppNav() {
  const [activeHash, setActiveHash] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useMatchResults();

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
          <LiveMatchTicker />
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

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
            {DESKTOP_PRIMARY_NAV.map((item) => (
              <NavItem key={item.label} {...item} activeHash={activeHash} pathname={pathname} />
            ))}
            <MoreNavMenu activeHash={activeHash} pathname={pathname} />
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <BaseWalletChip />
          </div>
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
      <FloatingActionCTAs />
      <AppFooter />
    </div>
  );
}
