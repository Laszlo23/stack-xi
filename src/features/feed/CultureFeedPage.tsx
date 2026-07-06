import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SectionHead } from "@/components/layout/SectionHead";
import type { FeedItem, FeedResponse } from "@/lib/feed/feed-types";

const LANE_LABELS: Record<FeedItem["lane"], string> = {
  agent: "Agent",
  builder: "Builder",
  culture: "Culture",
  user: "Community",
};

const PLATFORM_LABELS: Record<FeedItem["platform"], string> = {
  x: "X",
  farcaster: "Farcaster",
  base: "Base",
  world: "World",
};

function FeedRow({ item }: { item: FeedItem }) {
  return (
    <article className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background/60 font-mono text-xs uppercase">
        {item.platform === "x" ? "X" : item.platform === "farcaster" ? "FC" : "⛓"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time>
          <span className="rounded border border-border px-1.5 py-0.5">{LANE_LABELS[item.lane]}</span>
          <span className="rounded border border-primary/30 px-1.5 py-0.5 text-primary">
            {PLATFORM_LABELS[item.platform]}
          </span>
          {item.badge && (
            <span className="rounded border border-accent/40 px-1.5 py-0.5 text-accent">
              {item.badge}
            </span>
          )}
        </div>
        <p className="mt-1 font-semibold text-sm">
          {item.author}
          {item.authorHandle && (
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {item.authorHandle}
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{item.text}</p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}

export function CultureFeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed?limit=40");
      if (!res.ok) throw new Error(`Feed unavailable (${res.status})`);
      const data = (await res.json()) as FeedResponse;
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHead
        eyebrow="Culture Feed"
        title={
          <>
            The feed <span className="text-gradient">Pepe watches.</span>
          </>
        }
        sub="Luck on X, Pepe on Farcaster, builder casts, and disclosed protocol activity — one timeline for STACK XI culture."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-primary">
          <Radio className="h-3.5 w-3.5" />
          Live aggregation
        </span>
        {feed && (
          <>
            <span>Luck outcomes: {feed.agents.luck.outcomes}</span>
            <span>Pepe outcomes: {feed.agents.pepe.outcomes}</span>
            <span>Protocol events: {feed.agents.cultureOps.events}</span>
          </>
        )}
        <button
          type="button"
          onClick={() => void loadFeed()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        Luck and Pepe are automated culture accounts. Protocol activity is treasury-labeled demo
        activity on Base — not impersonated user wallets.
      </p>

      <div className="mt-8 glass-neon rounded-2xl p-4 sm:p-6">
        {loading && !feed && (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading culture feed…</p>
        )}
        {error && (
          <p className="py-8 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {feed && feed.items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Feed is warming up — agents will populate this after their first tick.
          </p>
        )}
        {feed && feed.items.length > 0 && (
          <div className="divide-y divide-border/40">
            {feed.items.map((item) => (
              <FeedRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
