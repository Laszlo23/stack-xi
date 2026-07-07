import { getActiveMarket } from "@/lib/story/match-markets";
import { getMatchResult, upsertMatchResult } from "@/lib/server/match-results-storage";
import { getLiveTicker, setLiveTicker } from "@/lib/server/live-ticker-storage";
import type { LiveTickerStatus } from "@/lib/server/live-ticker-storage";

export type MatchOpsTickResult = {
  ok: boolean;
  dryRun: boolean;
  matchId: string;
  updated: boolean;
  tickerUpdated: boolean;
  slack?: string;
  message?: string;
};

function pepeSlackWebhookUrl(): string | null {
  return process.env.PEPE_SLACK_WEBHOOK_URL?.trim() || process.env.SLACK_WEBHOOK_URL?.trim() || null;
}

async function postSlack(text: string): Promise<string> {
  const hook = pepeSlackWebhookUrl();
  if (!hook) return "skipped_no_webhook";
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok ? "posted" : `http_${res.status}`;
  } catch (e) {
    return `error:${e instanceof Error ? e.message : String(e)}`;
  }
}

type ExternalScoreFeed = {
  matchId?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number | null;
  status?: LiveTickerStatus;
  lastEvent?: string;
  winner?: "home" | "away";
  result?: string;
};

async function fetchExternalFeed(): Promise<ExternalScoreFeed | null> {
  const url = process.env.MATCH_SCORE_FEED_URL?.trim();
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    return (await res.json()) as ExternalScoreFeed;
  } catch {
    return null;
  }
}

function matchAutoSettleEnabled(): boolean {
  return process.env.MATCH_AUTO_SETTLE?.trim() === "1";
}

export async function runMatchOpsTick(opts: { dryRun?: boolean } = {}): Promise<MatchOpsTickResult> {
  const dryRun = Boolean(opts.dryRun);
  const active = getActiveMarket();
  const matchId = active.id;
  const feed = await fetchExternalFeed();
  const currentTicker = await getLiveTicker();
  let tickerUpdated = false;
  let updated = false;

  if (feed && feed.matchId === matchId) {
    const nextTicker = {
      matchId,
      homeTeam: active.home,
      awayTeam: active.away,
      homeScore: feed.homeScore ?? currentTicker?.homeScore ?? 0,
      awayScore: feed.awayScore ?? currentTicker?.awayScore ?? 0,
      minute: feed.minute ?? currentTicker?.minute ?? null,
      status: feed.status ?? currentTicker?.status ?? "scheduled",
      lastEvent: feed.lastEvent ?? currentTicker?.lastEvent,
      updatedAt: new Date().toISOString(),
    };
    if (!dryRun) {
      await setLiveTicker(nextTicker);
    }
    tickerUpdated = true;

    if (feed.status === "ft" && feed.winner && feed.result && matchAutoSettleEnabled()) {
      const existing = await getMatchResult(matchId);
      if (!existing) {
        if (!dryRun) {
          await upsertMatchResult({
            matchId,
            winner: feed.winner,
            result: feed.result,
            payoutsOpen: true,
          });
        }
        updated = true;
        const slack = await postSlack(
          `🏁 Match settled: ${active.home} vs ${active.away} · ${feed.result} — open claims for ${matchId}`,
        );
        return {
          ok: true,
          dryRun,
          matchId,
          updated,
          tickerUpdated,
          slack,
          message: "match_settled",
        };
      }
    }
  }

  if (!currentTicker || currentTicker.matchId !== matchId) {
    const seed = {
      matchId,
      homeTeam: active.home,
      awayTeam: active.away,
      homeScore: 0,
      awayScore: 0,
      minute: null,
      status: "scheduled" as const,
      lastEvent: `${active.kickoffLabel}`,
      updatedAt: new Date().toISOString(),
    };
    if (!dryRun) {
      await setLiveTicker(seed);
    }
    tickerUpdated = true;
  }

  return {
    ok: true,
    dryRun,
    matchId,
    updated,
    tickerUpdated,
    message: tickerUpdated ? "ticker_synced" : "no_changes",
  };
}
