import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePublicClient, useReadContract } from "wagmi";
import { decodeEventLog } from "viem";
import type { FoundingPlayer } from "@/domain/types";
import { BccAcquireGate } from "@/features/swap/BccAcquireGate";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import {
  BCC_SYMBOL,
  MINT_BASE_PRICE_BCC,
  MINT_PRICE_INCREMENT_BCC,
  SQUAD_NFT_ABI,
  SQUAD_NFT_ADDRESS,
  formatBcc,
  isSquadContractConfigured,
} from "@/lib/base/config";
import { MINT_PERKS, nextMintPrice, currentMintPrice } from "@/lib/squad/mint-game";
import { recordMintTx } from "@/lib/profile/task-storage";
import { getAccount } from "wagmi/actions";
import { wagmiConfig } from "@/lib/base/wagmi-config";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";
import { MintArenaHeader, MintCelebration, type MintCelebrationData } from "./MintCelebration";

function PlayerMintCard({
  player,
  onMint,
  minting,
  alreadyMinted,
  currentPrice,
  canMint,
}: {
  player: FoundingPlayer;
  onMint: (playerId: number) => void;
  minting: boolean;
  alreadyMinted: boolean;
  currentPrice: bigint;
  canMint: boolean;
}) {
  const accentColor =
    player.accent === "neon"
      ? "var(--neon)"
      : player.accent === "electric"
        ? "var(--electric)"
        : "var(--magenta)";
  const rarityBg =
    player.rarity === "Mythic"
      ? "bg-[oklch(0.72_0.28_340)]/20 text-[oklch(0.85_0.2_340)] border-[oklch(0.72_0.28_340)]/50"
      : player.rarity === "Legendary"
        ? "bg-primary/15 text-primary border-primary/40"
        : player.rarity === "Rare"
          ? "bg-accent/15 text-accent border-accent/40"
          : "bg-muted text-muted-foreground border-border";

  return (
    <div className="group relative overflow-hidden rounded-2xl glass transition hover:-translate-y-1 hover:shadow-[0_0_40px_oklch(0.88_0.28_145/0.35)]">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
      <div className="flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-muted-foreground">#{String(player.id).padStart(2, "0")}</span>
        <span className={`rounded border px-1.5 py-0.5 ${rarityBg}`}>{player.rarity}</span>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden">
        {player.img ? (
          <img
            src={player.img}
            alt={player.name}
            width={640}
            height={800}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${accentColor} / 0.25, transparent 70%), linear-gradient(180deg, oklch(0.18 0.03 240), oklch(0.12 0.02 240))`,
            }}
          >
            <div className="text-6xl opacity-30" style={{ color: accentColor }}>
              ⚽
            </div>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 55%, oklch(0.12 0.02 240 / 0.95))",
          }}
        />
        {alreadyMinted && (
          <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
            IN SQUAD
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="font-display text-sm font-bold leading-tight sm:text-base">
            {player.name}
          </div>
          <div className="text-xs text-muted-foreground">{player.role}</div>
        </div>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-mono text-[10px] text-muted-foreground">
            {alreadyMinted ? "Minted" : formatBcc(currentPrice)}
          </div>
          <button
            type="button"
            disabled={!isSquadContractConfigured() || minting || alreadyMinted || !canMint}
            onClick={() => onMint(player.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
          >
            {minting && <Loader2 className="h-3 w-3 animate-spin" />}
            {alreadyMinted ? "Taken" : canMint ? "Mint →" : "Need BCC"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerMintCardWithStatus({
  player,
  onMint,
  minting,
  currentPrice,
  canMint,
}: {
  player: FoundingPlayer;
  onMint: (playerId: number) => void;
  minting: boolean;
  currentPrice: bigint;
  canMint: boolean;
}) {
  const { data: alreadyMinted = false } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "minted",
    args: [BigInt(player.id)],
    query: { enabled: isSquadContractConfigured() },
  });

  return (
    <PlayerMintCard
      player={player}
      onMint={onMint}
      minting={minting}
      alreadyMinted={alreadyMinted}
      currentPrice={currentPrice}
      canMint={canMint}
    />
  );
}

export function SquadMintTabContent() {
  const publicClient = usePublicClient();
  const {
    isConnected,
    connectWallet,
    isConnecting,
    address,
    ensureBccAllowance,
    writeContractAsync,
    bccBalance,
  } = useBaseWallet();
  const [mintingId, setMintingId] = useState<number | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<MintCelebrationData | null>(null);

  const { data: mintCount = 0n, refetch: refetchCount } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "mintCount",
    query: { enabled: isSquadContractConfigured() },
  });

  const { data: onChainCurrentPrice } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "currentMintPrice",
    query: { enabled: isSquadContractConfigured() },
  });

  const { data: onChainNextPrice } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "nextMintPrice",
    query: { enabled: isSquadContractConfigured() },
  });

  const { data: isEarlyBeliever } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "earlyBeliever",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isSquadContractConfigured()) },
  });

  const currentPrice = onChainCurrentPrice ?? currentMintPrice(mintCount);
  const nextPrice = onChainNextPrice ?? nextMintPrice(mintCount);
  const remaining = 11n - mintCount;
  const canMint = isConnected && bccBalance >= currentPrice;

  async function handleMint(playerId: number) {
    if (!SQUAD_NFT_ADDRESS || !publicClient) return;

    setMintingId(playerId);
    setMintError(null);

    try {
      if (!isConnected) {
        await connectWallet();
      }

      const freshPrice = await publicClient.readContract({
        address: SQUAD_NFT_ADDRESS,
        abi: SQUAD_NFT_ABI,
        functionName: "currentMintPrice",
      });

      if (bccBalance < freshPrice) {
        throw new Error(`Insufficient ${BCC_SYMBOL}. Buy BCC first, then mint.`);
      }

      await ensureBccAllowance(SQUAD_NFT_ADDRESS, freshPrice);

      const hash = await writeContractAsync({
        address: SQUAD_NFT_ADDRESS,
        abi: SQUAD_NFT_ABI,
        functionName: "mint",
        args: [BigInt(playerId)],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let mintOrder = Number(mintCount) + 1;
      let pricePaid = freshPrice;
      let nextAfter = nextPrice;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: SQUAD_NFT_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "SquadMinted") {
            const args = decoded.args as {
              mintOrder: bigint;
              pricePaid: bigint;
              nextPrice: bigint;
            };
            mintOrder = Number(args.mintOrder);
            pricePaid = args.pricePaid;
            nextAfter = args.nextPrice;
          }
        } catch {
          // unrelated log
        }
      }

      const wallet = getAccount(wagmiConfig).address ?? address;
      if (wallet) {
        recordMintTx(wallet, hash, playerId);
      }

      setCelebration({
        playerId,
        mintOrder,
        pricePaid,
        nextPrice: nextAfter,
        txHash: hash,
      });
      void refetchCount();
    } catch (err) {
      setMintError(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setMintingId(null);
    }
  }

  return (
    <div>
      {isSquadContractConfigured() && (
        <MintArenaHeader
          mintCount={mintCount}
          currentPrice={currentPrice}
          nextPrice={nextPrice}
          remaining={remaining}
        />
      )}

      {isConnected && !canMint && isSquadContractConfigured() && (
        <div className="mt-6">
          <BccAcquireGate
            requiredAmount={currentPrice}
            actionLabel="Mint squad NFT"
            intent="mint"
            compact
          />
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MINT_PERKS.map((perk) => (
          <div key={perk.id} className="glass rounded-xl p-4">
            <div className="text-lg">{perk.emoji}</div>
            <div className="mt-1 font-display text-sm font-bold">{perk.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{perk.detail}</p>
          </div>
        ))}
      </div>

      {isEarlyBeliever && (
        <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 font-mono text-sm text-primary">
          Early believer flag active on-chain — director&apos;s cut + finals whitelist unlocked.
        </p>
      )}

      {!isSquadContractConfigured() && (
        <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Squad contract not configured. Deploy StackXISquad and set VITE_SQUAD_NFT_ADDRESS.
        </p>
      )}

      {!isConnected && isSquadContractConfigured() && (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110 disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect Base wallet to mint"}
        </button>
      )}

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {FOUNDING_SQUAD.map((player) => (
          <PlayerMintCardWithStatus
            key={player.id}
            player={player}
            onMint={handleMint}
            minting={mintingId === player.id}
            currentPrice={currentPrice}
            canMint={canMint}
          />
        ))}
      </div>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Bonding curve · {formatBcc(MINT_BASE_PRICE_BCC)} + {formatBcc(MINT_PRICE_INCREMENT_BCC)} ×
        mints · Paid in {BCC_SYMBOL}
      </p>

      {mintError && <p className="mt-4 text-center text-sm text-destructive">{mintError}</p>}

      {celebration && <MintCelebration data={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
}
