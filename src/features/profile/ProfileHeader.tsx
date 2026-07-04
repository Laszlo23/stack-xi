import { Check, Copy, Flame, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";
import { getCultureLevel } from "@/lib/profile/member-tasks";
import { TOTAL_MEMBER_XP } from "@/lib/profile/member-tasks";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ProfileHeader() {
  const { address, bccBalanceLabel, disconnectWallet } = useBaseWallet();
  const { progress } = useMemberTasks();
  const { holdings, isEarlyBeliever } = useUserSquadHoldings(address);
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const level = getCultureLevel(progress.totalXp);
  const xpPercent = Math.min(100, Math.round((progress.totalXp / TOTAL_MEMBER_XP) * 100));
  const avatarSrc = holdings[0]?.player.img ?? "/pepecard.jpg";

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl glass-neon">
      <div className="absolute inset-0 opacity-20">
        <img src={avatarSrc} alt="" className="h-full w-full object-cover" aria-hidden />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />

      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-primary/40 shadow-[0_0_32px_var(--neon)]">
          <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Member profile · Base
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void copyAddress()}
                className="inline-flex items-center gap-2 font-mono text-lg font-bold text-foreground"
              >
                {truncateAddress(address)}
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isEarlyBeliever && (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                  Early believer
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pepe doesn&apos;t chase clout — but he respects members who show up daily.{" "}
              {bccBalanceLabel} BCC in wallet.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                Culture XP
              </div>
              <div className="font-display text-2xl font-bold text-primary">{progress.totalXp}</div>
              <div className="text-xs text-muted-foreground">{level.label}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                <Flame className="h-3 w-3 text-primary" />
                Streak
              </div>
              <div className="font-display text-2xl font-bold">{progress.loginStreak}</div>
              <div className="text-xs text-muted-foreground">days in a row</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                Squad NFTs
              </div>
              <div className="font-display text-2xl font-bold">{holdings.length}</div>
              <div className="text-xs text-muted-foreground">owned on Base</div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
              <span>Mission progress</span>
              <span>{xpPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => disconnectWallet()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Disconnect wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileConnectPrompt() {
  const { connectWallet, isConnecting } = useBaseWallet();

  return (
    <div className="glass-neon rounded-3xl p-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-3xl">
        🐸
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold">Connect to view your profile</h2>
      <p className="mt-2 text-muted-foreground">
        Squad NFTs, culture XP, daily streaks, and social missions unlock with your Base wallet.
      </p>
      <button
        type="button"
        onClick={() => void connectWallet()}
        disabled={isConnecting}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110 disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting…" : "Connect Base wallet"}
      </button>
    </div>
  );
}
