import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";
import { mintTierLabel } from "@/lib/squad/mint-game";
import { MintCelebration, type MintCelebrationData } from "./MintCelebration";

type PackOpenCeremonyProps = {
  tokenId: bigint;
  mintOrder: bigint;
  jokerBalance: bigint;
  onOpenRandom: (tokenId: bigint) => Promise<MintCelebrationData>;
  onOpenWithJoker: (tokenId: bigint, playerId: number) => Promise<MintCelebrationData>;
  onClose: () => void;
};

export function PackOpenCeremony({
  tokenId,
  mintOrder,
  jokerBalance,
  onOpenRandom,
  onOpenWithJoker,
  onClose,
}: PackOpenCeremonyProps) {
  const [phase, setPhase] = useState<"choose" | "opening" | "done">("choose");
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<MintCelebrationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasJoker = jokerBalance > 0n;
  const tier = mintTierLabel(Number(mintOrder));

  async function handleOpen(useJoker: boolean) {
    setPhase("opening");
    setError(null);
    try {
      const result = useJoker && selectedPlayer
        ? await onOpenWithJoker(tokenId, selectedPlayer)
        : await onOpenRandom(tokenId);
      setCelebration(result);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Open failed");
      setPhase("choose");
    }
  }

  if (phase === "done" && celebration) {
    return <MintCelebration data={celebration} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
      <div className="glass-neon max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Sparkles className="h-4 w-4" />
          Sealed pack #{mintOrder.toString()} · {tier}
        </div>

        <div className="mt-6 flex justify-center">
          <div
            className={`relative h-48 w-36 rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/20 to-background shadow-[0_0_40px_var(--neon)] ${
              phase === "opening" ? "animate-pulse" : ""
            }`}
          >
            <div className="absolute inset-0 grid place-items-center text-5xl">🎁</div>
            <div className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase text-primary">
              STACK XI
            </div>
          </div>
        </div>

        {phase === "choose" && (
          <>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {hasJoker
                ? "Use a joker to pick your player, or rip it random."
                : "Rip the pack to reveal your squad player on-chain."}
            </p>

            {hasJoker && (
              <div className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
                  Joker pick ({jokerBalance.toString()} left)
                </p>
                <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto sm:grid-cols-3">
                  {FOUNDING_SQUAD.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition ${
                        selectedPlayer === player.id
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {hasJoker && selectedPlayer ? (
                <button
                  type="button"
                  onClick={() => void handleOpen(true)}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)]"
                >
                  Open with joker → {FOUNDING_SQUAD.find((p) => p.id === selectedPlayer)?.name}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void handleOpen(false)}
                className="w-full rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-bold text-primary hover:bg-primary/20"
              >
                {hasJoker ? "Open random instead" : "Open pack"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Save for later
              </button>
            </div>
          </>
        )}

        {phase === "opening" && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-display text-lg font-bold">Revealing on Base…</p>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
