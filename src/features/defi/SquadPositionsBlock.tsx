import type { FoundingPlayer } from "@/domain/types";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useBccBalance } from "@/hooks/use-bcc-balance";
import { BCC_SYMBOL } from "@/lib/base/config";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";

function rarityMultiplier(rarity: FoundingPlayer["rarity"]): string {
  switch (rarity) {
    case "Mythic":
      return "2.0×";
    case "Legendary":
      return "1.5×";
    case "Rare":
      return "1.2×";
    default:
      return "1.0×";
  }
}

function luckBoost(rarity: FoundingPlayer["rarity"]): string {
  switch (rarity) {
    case "Mythic":
      return "L12";
    case "Legendary":
      return "L8";
    case "Rare":
      return "L5";
    default:
      return "L2";
  }
}

function PositionTile({ player }: { player: FoundingPlayer }) {
  const accent =
    player.accent === "neon"
      ? "var(--neon)"
      : player.accent === "electric"
        ? "var(--electric)"
        : "var(--magenta)";

  return (
    <div className="defi-position-tile group relative overflow-hidden rounded-xl glass transition duration-300">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="aspect-[3/4] overflow-hidden">
        {player.img ? (
          <img
            src={player.img}
            alt={player.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-muted text-4xl opacity-30">⚽</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      <div className="p-3">
        <div className="font-mono text-[10px] uppercase text-muted-foreground">{player.role}</div>
        <div className="font-display text-sm font-bold">{player.name}</div>
        <div className="mt-1 font-mono text-[10px] text-primary">{player.rarity}</div>
      </div>
      <div className="defi-position-reveal absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
        <div className="font-mono text-[10px] uppercase text-muted-foreground">Fee share</div>
        <div className="font-display text-xl font-bold text-primary">
          {rarityMultiplier(player.rarity)}
        </div>
        <div className="font-mono text-[10px] uppercase text-accent">
          Luck boost {luckBoost(player.rarity)}
        </div>
      </div>
    </div>
  );
}

export function SquadPositionsBlock() {
  const { address, isConnected } = useBaseWallet();
  const { formatted } = useBccBalance(address);

  return (
    <article>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--magenta)]">
        Block 03
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Squad Token Positions</h3>
      <p className="mt-2 font-mono text-sm uppercase tracking-wide text-primary">
        BCC-weighted positions · own the culture layer
      </p>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Eleven founding roles on the pitch — each tile is a live culture position with BCC fee share
        and luck weighting.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <BccTokenChip compact />
        {isConnected && (
          <span className="font-mono text-xs text-muted-foreground">
            Wallet: {formatted} {BCC_SYMBOL}
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {FOUNDING_SQUAD.map((player) => (
          <PositionTile key={player.id} player={player} />
        ))}
      </div>
    </article>
  );
}
