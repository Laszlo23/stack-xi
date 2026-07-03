import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PositionSide, UserPosition, VaultDeposit } from "@/domain/types";
import {
  MATCH_MARKETS,
  SEED_POSITIONS,
  TRAINING_CAMPS,
  entryProbForSide,
} from "@/lib/mock/protocol-data";

type ProtocolContextValue = {
  positions: UserPosition[];
  deposits: VaultDeposit[];
  totalDeposited: number;
  openPosition: (marketId: string, side: PositionSide, stake: number) => void;
  depositToCamp: (campId: string, amount: number) => void;
  camps: typeof TRAINING_CAMPS;
  markets: typeof MATCH_MARKETS;
};

const ProtocolContext = createContext<ProtocolContextValue | null>(null);

function exposureForStake(stake: number): UserPosition["exposure"] {
  if (stake >= 200) return "high";
  if (stake >= 75) return "medium";
  return "low";
}

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<UserPosition[]>(SEED_POSITIONS);
  const [deposits, setDeposits] = useState<VaultDeposit[]>([]);

  const openPosition = useCallback((marketId: string, side: PositionSide, stake: number) => {
    const market = MATCH_MARKETS.find((m) => m.id === marketId);
    if (!market || market.status === "settled" || stake <= 0) return;

    const entryProb = entryProbForSide(side, market);
    const position: UserPosition = {
      id: `pos-${Date.now()}`,
      marketId,
      marketLabel: `${market.home} vs ${market.away}`,
      side,
      stake,
      entryProb,
      pnl: 0,
      exposure: exposureForStake(stake),
      status: "open",
      openedAt: "Just now",
    };

    setPositions((prev) => [position, ...prev]);
  }, []);

  const depositToCamp = useCallback((campId: string, amount: number) => {
    if (amount <= 0 || !TRAINING_CAMPS.some((c) => c.id === campId)) return;

    const deposit: VaultDeposit = {
      campId,
      amount,
      lpShares: amount * 1.02,
      depositedAt: new Date().toISOString(),
    };

    setDeposits((prev) => [...prev, deposit]);
  }, []);

  const totalDeposited = useMemo(() => deposits.reduce((sum, d) => sum + d.amount, 0), [deposits]);

  const value = useMemo(
    () => ({
      positions,
      deposits,
      totalDeposited,
      openPosition,
      depositToCamp,
      camps: TRAINING_CAMPS,
      markets: MATCH_MARKETS,
    }),
    [positions, deposits, totalDeposited, openPosition, depositToCamp],
  );

  return <ProtocolContext.Provider value={value}>{children}</ProtocolContext.Provider>;
}

export function useProtocol() {
  const ctx = useContext(ProtocolContext);
  if (!ctx) {
    throw new Error("useProtocol must be used within ProtocolProvider");
  }
  return ctx;
}
