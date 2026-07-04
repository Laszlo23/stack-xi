import { Link } from "@tanstack/react-router";
import { Lock, Unlock } from "lucide-react";
import { PepeBubble } from "@/features/story/PepeBubble";
import {
  buildPredictionCastText,
  markShareUnlock,
  openCastShare,
  openXShare,
} from "@/lib/predict/share-unlock";

const UNLOCK_BEAT = {
  id: "unlock",
  line: "Full odds stay blurred until the feed knows your pick. Cast it — tag a builder — unlock the window.",
  sub: "Every prediction is a social post. That's the loop.",
};

export function ShareUnlockStep({
  home,
  away,
  pick,
  stakeLabel,
  stage,
  address,
  matchId,
  unlocked,
  onUnlocked,
}: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
  stage: string;
  address: string | undefined;
  matchId: string;
  unlocked: boolean;
  onUnlocked: () => void;
}) {
  const castText = buildPredictionCastText({ home, away, pick, stakeLabel, stage });

  function unlockAfterShare(opener: () => void) {
    opener();
    if (address) markShareUnlock(address, matchId);
    onUnlocked();
  }

  return (
    <div className="space-y-8">
      <PepeBubble beat={UNLOCK_BEAT} luckMeter={unlocked ? 88 : 42} />

      <div
        className={`glass-neon rounded-2xl p-6 transition ${unlocked ? "border-primary/50" : "border-border/60"}`}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
          {unlocked ? (
            <>
              <Unlock className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary">Full odds unlocked</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Cast-to-predict gate</span>
            </>
          )}
        </div>

        <h3 className="mt-3 font-display text-xl font-bold">
          {unlocked ? "You're cleared to lock onchain" : "Unlock full odds by sharing your pick"}
        </h3>

        <div
          className={`mt-4 rounded-xl p-4 transition ${unlocked ? "opacity-100" : "opacity-50 blur-[2px]"}`}
        >
          <div className="font-mono text-xs text-muted-foreground">Your call</div>
          <div className="mt-1 font-display text-2xl font-bold text-primary">{pick}</div>
          <div className="mt-2 font-mono text-sm">
            {stakeLabel} BCC · {home} vs {away}
          </div>
        </div>

        {!unlocked && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => unlockAfterShare(() => openCastShare(castText))}
              className="defi-energy-btn w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
            >
              Cast on Farcaster to unlock
            </button>
            <button
              type="button"
              onClick={() => unlockAfterShare(() => openXShare(castText))}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-bold text-foreground hover:border-primary/50 hover:text-primary"
            >
              Post on X to unlock
            </button>
            <p className="text-center font-mono text-[10px] text-muted-foreground">
              Share opens in a new tab · unlock confirms when you return
            </p>
            <Link to="/calendar" className="block text-center text-xs text-primary hover:underline">
              Need cast copy? Post calendar →
            </Link>
          </div>
        )}

        {unlocked && (
          <button
            type="button"
            onClick={onUnlocked}
            className="defi-energy-btn mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
          >
            Continue to lock onchain →
          </button>
        )}
      </div>
    </div>
  );
}
