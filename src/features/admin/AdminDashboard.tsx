import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { LiveTickerState } from "@/lib/server/live-ticker-storage";
import type { StoredMatchResult } from "@/lib/server/match-results-storage";
import type { PredictionClaimRecord } from "@/lib/server/claim-storage";

type DashboardData = {
  claims: PredictionClaimRecord[];
  results: Record<string, StoredMatchResult>;
  ticker: LiveTickerState | null;
  pendingClaims: number;
};

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuth = useCallback(async () => {
    const res = await fetch("/api/admin/login");
    const json = (await res.json()) as { authenticated: boolean };
    setAuthenticated(json.authenticated);
  }, []);

  const loadDashboard = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard");
    if (!res.ok) {
      setAuthenticated(false);
      return;
    }
    setData((await res.json()) as DashboardData);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    void loadAuth().then(() => void loadDashboard());
  }, [loadAuth, loadDashboard]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) throw new Error("Invalid secret");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(claimId: string) {
    const payoutTxHash = window.prompt("Payout tx hash (optional)") ?? undefined;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/claims/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, payoutTxHash }),
      });
      if (!res.ok) throw new Error("Failed to mark paid");
      await loadDashboard();
    } finally {
      setBusy(false);
    }
  }

  async function setMatchResult() {
    const matchId = window.prompt("Match ID (e.g. m8)")?.trim();
    const result = window.prompt("Result line (e.g. Spain 1-0)")?.trim();
    const winner = window.prompt("Winner side: home or away")?.trim();
    if (!matchId || !result || (winner !== "home" && winner !== "away")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_match_result",
          matchId,
          result,
          winner,
          payoutsOpen: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to set result");
      await loadDashboard();
    } finally {
      setBusy(false);
    }
  }

  async function editTicker() {
    if (!data?.ticker) return;
    const homeScore = Number(window.prompt("Home score", String(data.ticker.homeScore)) ?? "0");
    const awayScore = Number(window.prompt("Away score", String(data.ticker.awayScore)) ?? "0");
    const minuteRaw = window.prompt("Minute (empty if N/A)", data.ticker.minute?.toString() ?? "");
    const status = window.prompt("Status: scheduled|live|ht|ft", data.ticker.status) as
      | LiveTickerState["status"]
      | null;
    const lastEvent = window.prompt("Last event line", data.ticker.lastEvent ?? "") ?? undefined;
    if (!status) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_ticker",
          ticker: {
            ...data.ticker,
            homeScore,
            awayScore,
            minute: minuteRaw ? Number(minuteRaw) : null,
            status,
            lastEvent,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update ticker");
      await loadDashboard();
    } finally {
      setBusy(false);
    }
  }

  async function triggerAgent(path: string, body?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      await loadDashboard();
    } finally {
      setBusy(false);
    }
  }

  if (authenticated === null) {
    return <p className="text-sm text-muted-foreground">Checking admin session…</p>;
  }

  if (!authenticated) {
    return (
      <form onSubmit={(e) => void handleLogin(e)} className="mx-auto max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-bold">Admin login</h1>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary py-2 font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    );
  }

  const pending = data?.claims.filter((c) => c.status === "requested") ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Ops dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Matches · claims · ticker · agents
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void loadDashboard()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Refresh
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="text-xs uppercase text-muted-foreground">Pending claims</div>
          <div className="font-display text-3xl font-bold">{data?.pendingClaims ?? 0}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs uppercase text-muted-foreground">Settled matches</div>
          <div className="font-display text-3xl font-bold">
            {Object.keys(data?.results ?? {}).length}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs uppercase text-muted-foreground">Ticker</div>
          <div className="font-mono text-sm">
            {data?.ticker
              ? `${data.ticker.homeTeam} ${data.ticker.homeScore}-${data.ticker.awayScore} ${data.ticker.awayTeam} · ${data.ticker.status}`
              : "—"}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void setMatchResult()} className="rounded-lg border px-3 py-2 text-sm">
            Set match result
          </button>
          <button type="button" onClick={() => void editTicker()} className="rounded-lg border px-3 py-2 text-sm">
            Edit live ticker
          </button>
          <button
            type="button"
            onClick={() => void triggerAgent("/api/agents/match-ops/tick")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Run match-ops tick
          </button>
          <button
            type="button"
            onClick={() => void triggerAgent("/api/agents/pepe/tick")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Run Pepe tick
          </button>
          <button
            type="button"
            onClick={() => void triggerAgent("/api/agents/luck/tick")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Run Luck tick
          </button>
        </div>
      </section>

      <PepeAgentSection
        busy={busy}
        setBusy={setBusy}
        onTriggerTick={() => void triggerAgent("/api/agents/pepe/tick")}
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Claims queue</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending claims.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((claim) => (
              <li key={claim.id} className="glass flex flex-wrap items-center justify-between gap-2 rounded-xl p-3">
                <div className="font-mono text-xs">
                  <div>
                    {claim.matchId} · {claim.pick} · {claim.address.slice(0, 10)}…
                  </div>
                  {(claim.boostBps ?? 0) > 0 && (
                    <div className="mt-1 text-primary">
                      Squad boost: +{(claim.boostBps! / 100).toFixed(0)}%
                      {claim.perkTier ? ` (${claim.perkTier})` : ""}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void markPaid(claim.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  Mark paid
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RaffleAdminSection busy={busy} setBusy={setBusy} onRefresh={() => void loadDashboard()} />
    </div>
  );
}

type PepeAgentDraft = {
  id: string;
  hook: string;
  pillar: string;
  preview: string;
  createdAt: string;
};

type PepeAgentStatus = {
  ok: boolean;
  autoSupport: boolean;
  publishingPaused: boolean;
  neynarConfigured: boolean;
  adminSecretConfigured: boolean;
  pendingDrafts: PepeAgentDraft[];
  capsToday: Record<string, number>;
};

function PepeAgentSection({
  busy,
  setBusy,
  onTriggerTick,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  onTriggerTick: () => void;
}) {
  const [status, setStatus] = useState<PepeAgentStatus | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/pepe/tick");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus((await res.json()) as PepeAgentStatus);
      setAgentError(null);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Failed to load Pepe agent");
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus, busy]);

  async function approveDraft(draftId: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/agents/pepe/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; url?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      await loadStatus();
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  }

  const pending = status?.pendingDrafts ?? [];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">Pepe agent (Farcaster)</h2>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadStatus()}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Refresh status
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onTriggerTick}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Run live tick
          </button>
        </div>
      </div>

      {agentError && <p className="text-sm text-destructive">{agentError}</p>}

      <div className="glass grid gap-3 rounded-xl p-4 sm:grid-cols-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">Auto support</div>
          <div className="font-mono text-sm">{status?.autoSupport ? "on" : "off"}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">Neynar</div>
          <div className="font-mono text-sm">{status?.neynarConfigured ? "ready" : "missing"}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">Paused</div>
          <div className="font-mono text-sm">{status?.publishingPaused ? "yes" : "no"}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">Pending drafts</div>
          <div className="font-display text-2xl font-bold">{pending.length}</div>
        </div>
      </div>

      {pending.length > 0 ? (
        <ul className="space-y-2">
          {pending.map((draft) => (
            <li key={draft.id} className="glass space-y-2 rounded-xl p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs text-primary">
                  {draft.pillar} · {draft.hook}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void approveDraft(draft.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
                >
                  Approve & cast
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{draft.preview}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No pending Pepe drafts.</p>
      )}
    </section>
  );
}

type RaffleAdminData = {
  raffle: {
    phase: string;
    totalMinted: number;
    entriesClosed: boolean;
    drawComplete: boolean;
    winner: string | null;
  };
  questStats: {
    completed: number;
    mintApproved: number;
    ticketsMinted: number;
  };
};

function RaffleAdminSection({
  busy,
  setBusy,
  onRefresh,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const [raffleData, setRaffleData] = useState<RaffleAdminData | null>(null);

  useEffect(() => {
    void fetch("/api/admin/raffle/")
      .then((r) => r.json())
      .then((d) => setRaffleData(d as RaffleAdminData))
      .catch(() => setRaffleData(null));
  }, [busy]);

  async function raffleAction(action: string, secretHex?: string) {
    setBusy(true);
    try {
      await fetch("/api/admin/raffle/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, secretHex }),
      });
      onRefresh();
      const res = await fetch("/api/admin/raffle/");
      setRaffleData((await res.json()) as RaffleAdminData);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold">Culture raffle</h2>
      <div className="glass grid gap-3 rounded-xl p-4 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase text-muted-foreground">Quest completed</div>
          <div className="font-display text-2xl font-bold">{raffleData?.questStats.completed ?? 0}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">Mint approved</div>
          <div className="font-display text-2xl font-bold">{raffleData?.questStats.mintApproved ?? 0}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground">On-chain tickets</div>
          <div className="font-display text-2xl font-bold">{raffleData?.raffle.totalMinted ?? 0}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Phase: {raffleData?.raffle.phase ?? "—"}
        {raffleData?.raffle.winner && ` · Winner: ${raffleData.raffle.winner.slice(0, 10)}…`}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void raffleAction("close_entries")}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Close entries early
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const bytes = crypto.getRandomValues(new Uint8Array(32));
            const hex = `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
            window.prompt("Save this secret for reveal:", hex);
            void raffleAction("commit_draw", hex);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Commit draw (generates secret)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const secretHex = window.prompt("Paste secret hex (0x…)")?.trim();
            if (secretHex?.startsWith("0x")) void raffleAction("reveal_draw", secretHex);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Reveal & draw
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Fund contract with 7,777,777 BCC before draw. Reveal within 256 blocks of close for blockhash entropy.
      </p>
    </section>
  );
}
