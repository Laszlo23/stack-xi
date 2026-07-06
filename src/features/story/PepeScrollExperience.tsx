import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PROTOCOL_ONE_LINER, PROTOCOL_TAGLINE } from "@/domain/constants";
import { AirdropAnnouncementBanner } from "@/features/growth/AirdropAnnouncementBanner";
import { SponsoredPredictionCampaignBanner } from "@/features/growth/SponsoredPredictionCampaignBanner";
import { DecentralandEventSection } from "@/features/community/DecentralandEventSection";
import { DeFiLayerTeaser } from "@/features/defi/DeFiLayerTeaser";
import { SquadMintSection } from "@/features/founding/SquadMintSection";
import { GuidedPredictionFlow } from "@/features/predict/GuidedPredictionFlow";
import { TelegramConnectWallet } from "@/features/telegram/TelegramConnectWallet";
import { useSquadMintStatus } from "@/hooks/use-squad-mint-status";
import { TelegramGamePanel } from "@/features/telegram/TelegramGamePanel";
import { MatchdayStorySection } from "@/features/story/MatchdayStorySection";
import { PepeVisualScroll } from "@/features/story/PepeVisualScroll";
import { WorldCupSnapshotSection } from "@/features/story/WorldCupSnapshotSection";
import {
  getActiveMarket,
  getActiveMarketKind,
  getLastCompletedMarket,
} from "@/lib/story/match-markets";
import { AUSTRIAN_LEAGUE_TAGLINE } from "@/lib/story/austrian-bundesliga-schedule";
import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";

export function PepeScrollExperience() {
  const activeMatch = getActiveMarket();
  const lastResult = getLastCompletedMarket();
  const isAustrianMarket = getActiveMarketKind() === "austrian_bundesliga";
  const { isSoldOut } = useSquadMintStatus();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("stackxi:tg-deeplink") === "predict") {
      sessionStorage.removeItem("stackxi:tg-deeplink");
      window.location.hash = "predict";
    }
  }, []);

  return (
    <div className="scroll-smooth">
      <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "var(--gradient-hero)" }}
        />

        {/* Hero Pepe — floating cinematic backdrop */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden opacity-30 sm:items-center sm:justify-end sm:pr-[5%] sm:opacity-50">
          <img
            src="/pepeheadball.jpg"
            alt=""
            aria-hidden
            className="pepe-hero-float max-h-[55vh] w-auto max-w-[min(100%,520px)] object-contain sm:max-h-[78vh]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20 sm:via-background/70 sm:to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28">
          <div className="mb-8 max-w-3xl">
            <AirdropAnnouncementBanner compact />
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full glass-neon px-3 py-1 font-mono text-xs uppercase tracking-widest">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {PROTOCOL_TAGLINE}
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-6xl">
              {isAustrianMarket ? (
                <>
                  Austrian Bundesliga on <span className="text-gradient">Base</span>
                </>
              ) : (
                <>
                  Dallas Matchdays on <span className="text-gradient">Base</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{PROTOCOL_ONE_LINER}</p>
            <p className="mt-3 font-mono text-sm text-primary">
              Next: {activeMatch.home} vs {activeMatch.away} · {activeMatch.kickoffLabel}
              {activeMatch.isProjected ? " · projected" : ""}
            </p>
            {lastResult?.result && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Last in Dallas: {lastResult.home} vs {lastResult.away} · {lastResult.result}
              </p>
            )}
            {!isAustrianMarket && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                QF so far: Morocco · France · Norway · England
              </p>
            )}
            {!isAustrianMarket && (
              <p className="mt-2 font-mono text-xs text-accent">
                Leonardo&apos;s pick to win it all: {WORLD_CUP_WINNER_PICK} · Final Jul 19
              </p>
            )}
            {isAustrianMarket && (
              <p className="mt-2 font-mono text-xs text-accent">{AUSTRIAN_LEAGUE_TAGLINE}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#predict"
                className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] transition hover:brightness-110"
              >
                Predict with BCC
              </a>
              {isSoldOut ? (
                <a
                  href="#squad"
                  className="inline-flex rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/20"
                >
                  View founding squad →
                </a>
              ) : (
                <a
                  href="#squad"
                  className="inline-flex rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/20"
                >
                  Mint founding squad →
                </a>
              )}
              <a
                href="#visual-story"
                className="inline-flex rounded-xl border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Pepe lore
              </a>
            </div>
          </div>
        </div>
      </section>

      {!isAustrianMarket && <WorldCupSnapshotSection />}
      <PepeVisualScroll />
      <MatchdayStorySection />
      <SquadMintSection />
      <DeFiLayerTeaser />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-4">
        <SponsoredPredictionCampaignBanner />
        <TelegramConnectWallet />
        <TelegramGamePanel />
      </div>
      <GuidedPredictionFlow />
      <DecentralandEventSection />

      <section className="border-t border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Finals only · Bitcoin path
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Semifinal + Final mint on Stacks
          </h2>
          <p className="mt-3 text-muted-foreground">
            Base believers get first access when the tournament reaches the Bitcoin finals arc.
          </p>
          <Link
            to="/finals"
            className="mt-6 inline-flex rounded-xl border border-primary/40 px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/10"
          >
            Finals teaser →
          </Link>
        </div>
      </section>
    </div>
  );
}
