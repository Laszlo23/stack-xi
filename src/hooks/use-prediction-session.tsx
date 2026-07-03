import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type PredictionPick = "home" | "away";

export type PredictionSession = {
  matchId: string;
  pick: PredictionPick;
  stakeUsdc: bigint;
  txId?: string;
  status: "draft" | "submitted";
};

type PredictionSessionContextValue = {
  session: PredictionSession | null;
  step: 1 | 2 | 3 | 4;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setPick: (matchId: string, pick: PredictionPick) => void;
  setStake: (stakeUsdc: bigint) => void;
  markSubmitted: (txId: string) => void;
  reset: () => void;
};

const PredictionSessionContext = createContext<PredictionSessionContextValue | null>(null);

export function PredictionSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PredictionSession | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const setPick = useCallback((matchId: string, pick: PredictionPick) => {
    setSession({ matchId, pick, stakeUsdc: 0n, status: "draft" });
    setStep(2);
  }, []);

  const setStake = useCallback((stakeUsdc: bigint) => {
    setSession((prev) => (prev ? { ...prev, stakeUsdc } : prev));
    setStep(3);
  }, []);

  const markSubmitted = useCallback((txId: string) => {
    setSession((prev) => (prev ? { ...prev, txId, status: "submitted" } : prev));
    setStep(4);
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setStep(1);
  }, []);

  const value = useMemo(
    () => ({ session, step, setStep, setPick, setStake, markSubmitted, reset }),
    [session, step, setPick, setStake, markSubmitted, reset],
  );

  return (
    <PredictionSessionContext.Provider value={value}>{children}</PredictionSessionContext.Provider>
  );
}

export function usePredictionSession() {
  const ctx = useContext(PredictionSessionContext);
  if (!ctx) {
    throw new Error("usePredictionSession must be used within PredictionSessionProvider");
  }
  return ctx;
}
