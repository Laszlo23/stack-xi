import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type PredictionPick = "home" | "away";

export type PredictionSession = {
  matchId: string;
  pick: PredictionPick;
  stakeBcc: bigint;
  sponsored?: boolean;
  txId?: string;
  status: "draft" | "submitted";
  shareUnlocked?: boolean;
};

export type PredictionStep = 1 | 2 | 3 | 4 | 5;

type PredictionSessionContextValue = {
  session: PredictionSession | null;
  step: PredictionStep;
  setStep: (step: PredictionStep) => void;
  setPick: (matchId: string, pick: PredictionPick) => void;
  setStake: (stakeBcc: bigint, sponsored?: boolean) => void;
  applyShareUnlock: (advanceToConfirm?: boolean) => void;
  markShareUnlocked: () => void;
  markSubmitted: (txId: string) => void;
  reset: () => void;
};

const PredictionSessionContext = createContext<PredictionSessionContextValue | null>(null);

export function PredictionSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PredictionSession | null>(null);
  const [step, setStep] = useState<PredictionStep>(1);

  const setPick = useCallback((matchId: string, pick: PredictionPick) => {
    setSession({ matchId, pick, stakeBcc: 0n, sponsored: false, status: "draft", shareUnlocked: false });
    setStep(2);
  }, []);

  const setStake = useCallback((stakeBcc: bigint, sponsored = false) => {
    setSession((prev) => {
      if (!prev) return prev;
      setStep(prev.shareUnlocked ? 4 : 3);
      return { ...prev, stakeBcc, sponsored };
    });
  }, []);

  /** Mark cast gate passed; only advances to confirm when a stake is already chosen. */
  const applyShareUnlock = useCallback((advanceToConfirm = true) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, shareUnlocked: true };
      if (advanceToConfirm && prev.stakeBcc > 0n) {
        setStep(4);
      }
      return next;
    });
  }, []);

  const markShareUnlocked = useCallback(() => {
    applyShareUnlock(true);
  }, [applyShareUnlock]);

  const markSubmitted = useCallback((txId: string) => {
    setSession((prev) => (prev ? { ...prev, txId, status: "submitted" } : prev));
    setStep(5);
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setStep(1);
  }, []);

  const value = useMemo(
    () => ({
      session,
      step,
      setStep,
      setPick,
      setStake,
      applyShareUnlock,
      markShareUnlocked,
      markSubmitted,
      reset,
    }),
    [session, step, setPick, setStake, applyShareUnlock, markShareUnlocked, markSubmitted, reset],
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
