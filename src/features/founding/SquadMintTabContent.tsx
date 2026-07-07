import { useState } from "react";
import { Loader2, Package } from "lucide-react";
import { useConfig, usePublicClient, useReadContract } from "wagmi";
import { decodeEventLog } from "viem";
import { BccAcquireGate } from "@/features/swap/BccAcquireGate";
import { SquadSoldOutPanel } from "@/features/founding/SquadSoldOutPanel";
import { GenesisXiPanel } from "@/features/founding/GenesisXiPanel";
import { PackOpenCeremony } from "@/features/founding/PackOpenCeremony";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useSquadMintStatus } from "@/hooks/use-squad-mint-status";
import { useSquadV2Packs } from "@/hooks/use-squad-v2-packs";
import { useWalletSession } from "@/hooks/use-wallet-session";
import {
  BASE_CHAIN_ID,
  BCC_SYMBOL,
  BCC_TOKEN_ADDRESS,
  ERC20_ABI,
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  SQUAD_V2_MAX_SUPPLY,
  formatBcc,
  isSquadV2Configured,
} from "@/lib/base/config";
import { ensureWalletReadyForTx } from "@/lib/base/ensure-wallet-ready";
import {
  MINT_PERKS,
  SQUAD_V2_EARLY_BELIEVER_LIMIT,
  v2CurrentMintPrice,
  v2NextMintPrice,
} from "@/lib/squad/mint-game";
import { MintArenaHeader, type MintCelebrationData } from "./MintCelebration";

export function SquadMintTabContent() {
  const wagmiConfig = useConfig();
  const { isSoldOut, mintCount, isConfigured } = useSquadMintStatus();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const wallet = useWalletSession();
  const {
    connectWallet,
    isConnecting,
    ensureBccAllowance,
    writeContractAsync,
    bccBalance,
    refetchBccBalance,
  } = useConnectBaseWallet();
  const { sealedPacks, jokerBalance, refetch } = useSquadV2Packs(wallet.address);
  const [mintPending, setMintPending] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [openingPackId, setOpeningPackId] = useState<bigint | null>(null);

  const { data: onChainCurrentPrice } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "currentMintPrice",
    chainId: BASE_CHAIN_ID,
    query: { enabled: isSquadV2Configured() },
  });

  const { data: onChainNextPrice } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "nextMintPrice",
    chainId: BASE_CHAIN_ID,
    query: { enabled: isSquadV2Configured() },
  });

  const currentPrice = onChainCurrentPrice ?? v2CurrentMintPrice(mintCount);
  const nextPrice = onChainNextPrice ?? v2NextMintPrice(mintCount);
  const remaining = BigInt(SQUAD_V2_MAX_SUPPLY) - mintCount;
  const hasEnoughBcc = bccBalance >= currentPrice;
  const canMint = wallet.canSign && hasEnoughBcc && Boolean(publicClient);
  const earlySlotsLeft = Math.max(0, SQUAD_V2_EARLY_BELIEVER_LIMIT - Number(mintCount));

  const mintBlockers: string[] = [];
  if (wallet.isWalletSyncing) {
    mintBlockers.push("Wallet syncing — wait a moment before minting");
  } else if (!wallet.canSign) {
    mintBlockers.push("Connect your Base wallet to mint");
  }
  if (wallet.canSign && !hasEnoughBcc) {
    mintBlockers.push(
      `Need ${formatBcc(currentPrice)} — you have ${formatBcc(bccBalance)}`,
    );
  }
  if (!publicClient) {
    mintBlockers.push("Base RPC not ready — refresh and try again");
  }

  async function handleMintPack() {
    if (!SQUAD_NFT_V2_ADDRESS) {
      setMintError("Squad v2 contract not configured");
      return;
    }
    if (!publicClient) {
      setMintError("Base RPC not ready — refresh and try again");
      return;
    }

    setMintPending(true);
    setMintError(null);

    try {
      if (!wallet.canSign) {
        await connectWallet();
      }

      const owner = await ensureWalletReadyForTx(wagmiConfig);

      const [freshPrice, freshBalance] = await Promise.all([
        publicClient.readContract({
          address: SQUAD_NFT_V2_ADDRESS,
          abi: SQUAD_NFT_V2_ABI,
          functionName: "currentMintPrice",
        }),
        publicClient.readContract({
          address: BCC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [owner],
        }),
      ]);

      if (freshBalance < freshPrice) {
        throw new Error(
          `Insufficient ${BCC_SYMBOL}. Need ${formatBcc(freshPrice)}, you have ${formatBcc(freshBalance)}.`,
        );
      }

      await ensureBccAllowance(SQUAD_NFT_V2_ADDRESS, freshPrice);

      const hash = await writeContractAsync({
        address: SQUAD_NFT_V2_ADDRESS,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "mintPack",
        chainId: BASE_CHAIN_ID,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await refetch();
      await refetchBccBalance();
    } catch (err) {
      setMintError(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setMintPending(false);
    }
  }

  async function openPackTx(
    tokenId: bigint,
    mode: "random" | "joker",
    playerId?: number,
  ): Promise<MintCelebrationData> {
    if (!SQUAD_NFT_V2_ADDRESS || !publicClient) {
      throw new Error("Contract not configured");
    }

    await ensureWalletReadyForTx(wagmiConfig);

    const hash = await writeContractAsync({
      address: SQUAD_NFT_V2_ADDRESS,
      abi: SQUAD_NFT_V2_ABI,
      functionName: mode === "joker" ? "openPackWithJoker" : "openPack",
      args: mode === "joker" && playerId ? [tokenId, BigInt(playerId)] : [tokenId],
      chainId: BASE_CHAIN_ID,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    let playerIdResult = playerId ?? 0;
    let edition = 0;
    let mintOrder = 0;
    let usedJoker = mode === "joker";

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: SQUAD_NFT_V2_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "PackOpened") {
          const args = decoded.args as {
            playerId: bigint;
            edition: bigint;
            mintOrder: bigint;
            usedJoker: boolean;
          };
          playerIdResult = Number(args.playerId);
          edition = Number(args.edition);
          mintOrder = Number(args.mintOrder);
          usedJoker = args.usedJoker;
        }
      } catch {
        // unrelated log
      }
    }

    await refetch();

    return {
      playerId: playerIdResult,
      mintOrder,
      edition,
      usedJoker,
      pricePaid: 0n,
      nextPrice: 0n,
      txHash: hash,
    };
  }

  if (!isConfigured) {
    return (
      <div className="space-y-8">
        <GenesisXiPanel />
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Squad v2 not configured. Deploy StackXISquadV2 and set VITE_SQUAD_NFT_V2_ADDRESS.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <GenesisXiPanel />

      {isSoldOut ? (
        <SquadSoldOutPanel totalSupply={SQUAD_V2_MAX_SUPPLY} />
      ) : (
        <>
          <MintArenaHeader
            mintCount={mintCount}
            currentPrice={currentPrice}
            nextPrice={nextPrice}
            remaining={remaining}
            maxSupply={SQUAD_V2_MAX_SUPPLY}
            priceIncrementLabel="7 BCC"
            earlySlotsLeft={earlySlotsLeft}
          />

          {wallet.canSign && !hasEnoughBcc && (
            <BccAcquireGate
              requiredAmount={currentPrice}
              actionLabel="Mint sealed pack"
              intent="mint"
              compact
            />
          )}

          {wallet.isWalletSyncing && (
            <p className="text-sm text-muted-foreground">
              Wallet syncing — mint unlocks once your wallet is ready to sign on Base.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!wallet.canSign ? (
              <button
                type="button"
                onClick={() => void connectWallet()}
                disabled={isConnecting || wallet.isWalletSyncing}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {isConnecting || wallet.isWalletSyncing
                  ? "Connecting wallet…"
                  : "Connect Base wallet to mint"}
              </button>
            ) : (
              <button
                type="button"
                disabled={mintPending || !canMint}
                onClick={() => void handleMintPack()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {mintPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                Mint sealed pack · {formatBcc(currentPrice)}
              </button>
            )}
            {jokerBalance > 0n && (
              <span className="font-mono text-xs text-primary">
                🃏 {jokerBalance.toString()} joker{jokerBalance === 1n ? "" : "s"} available
              </span>
            )}
          </div>

          {!canMint && !mintPending && mintBlockers.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              {mintBlockers.map((blocker) => (
                <li key={blocker}>• {blocker}</li>
              ))}
            </ul>
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

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Blind pack · 770 + 7 BCC × mints · 77 editions per player · {SQUAD_V2_MAX_SUPPLY} total
          </p>
        </>
      )}

      {sealedPacks.length > 0 && (
        <section className="glass rounded-2xl p-5">
          <h3 className="font-display text-lg font-bold">My sealed packs</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open on-chain to reveal your player and unlock perks.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sealedPacks.map((pack) => (
              <button
                key={pack.tokenId.toString()}
                type="button"
                onClick={() => setOpeningPackId(pack.tokenId)}
                className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left transition hover:bg-primary/20"
              >
                <div className="text-lg">🎁</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  Pack #{pack.mintOrder.toString()}
                </div>
                <div className="text-xs font-semibold text-primary">Open →</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {mintError && <p className="text-center text-sm text-destructive">{mintError}</p>}

      {openingPackId != null && (
        <PackOpenCeremony
          tokenId={openingPackId}
          mintOrder={sealedPacks.find((p) => p.tokenId === openingPackId)?.mintOrder ?? 0n}
          jokerBalance={jokerBalance}
          onOpenRandom={(id) => openPackTx(id, "random")}
          onOpenWithJoker={(id, playerId) => openPackTx(id, "joker", playerId)}
          onClose={() => {
            setOpeningPackId(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
