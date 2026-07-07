import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

/** Quick path: 1 pick → 2 stake → 3 confirm → 4 success */
export type PredictionStep = 1 | 2 | 3 | 4;

const SESSION_STORAGE_KEY = "stackxi:prediction-session";

type StoredSession = {
  matchId: string;
  pick: PredictionPick;
  stakeBcc: string;
  sponsored?: boolean;
  txId?: string;
  status: "draft" | "submitted";
  shareUnlocked?: boolean;
  step: PredictionStep;
};

function loadStoredSession(): { session: PredictionSession | null; step: PredictionStep } {
  if (typeof window === "undefined") return { session: null, step: 1 };
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { session: null, step: 1 };
    const parsed = JSON.parse(raw) as StoredSession;
    return {
      session: {
        matchId: parsed.matchId,
        pick: parsed.pick,
        stakeBcc: BigInt(parsed.stakeBcc || "0"),
        sponsored: parsed.sponsored,
        txId: parsed.txId,
        status: parsed.status,
        shareUnlocked: parsed.shareUnlocked ?? true,
      },
      step: parsed.step ?? 1,
    };
  } catch {
    return { session: null, step: 1 };
  }
}

function persistSession(session: PredictionSession | null, step: PredictionStep): void {
  if (typeof window === "undefined") return;
  if (!session) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  const stored: StoredSession = {
    matchId: session.matchId,
    pick: session.pick,
    stakeBcc: session.stakeBcc.toString(),
    sponsored: session.sponsored,
    txId: session.txId,
    status: session.status,
    shareUnlocked: session.shareUnlocked,
    step,
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
}

type PredictionSessionContextValue = {
  session: PredictionSession | null;
  step: PredictionStep;
  setStep: (step: PredictionStep) => void;
  setPick: (matchId: string, pick: PredictionPick) => void;
  selectMarket: (matchId: string) => void;
  setStake: (stakeBcc: bigint, sponsored?: boolean) => void;
  applyShareUnlock: (advanceToConfirm?: boolean) => void;
  markShareUnlocked: () => void;
  markSubmitted: (txId: string) => void;
  reset: () => void;
};

const PredictionSessionContext = createContext<PredictionSessionContextValue | null>(null);

export function PredictionSessionProvider({ children }: { children: ReactNode }) {
  const initial = loadStoredSession();
  const [session, setSession] = useState<PredictionSession | null>(initial.session);
  const [step, setStep] = useState<PredictionStep>(initial.step);

  useEffect(() => {
    persistSession(session, step);
  }, [session, step]);

  const setPick = useCallback((matchId: string, pick: PredictionPick) => {
    setSession({
      matchId,
      pick,
      stakeBcc: 0n,
      sponsored: false,
      status: "draft",
      shareUnlocked: true,
    });
    setStep(2);
  }, []);

  const selectMarket = useCallback((matchId: string) => {
    setSession((prev) => ({
      matchId,
      pick: prev?.matchId === matchId ? (prev.pick ?? "home") : "home",
      stakeBcc: prev?.matchId === matchId ? prev.stakeBcc : 0n,
      sponsored: prev?.matchId === matchId ? prev.sponsored : false,
      status: "draft" as const,
      shareUnlocked: true,
    }));
    setStep(1);
  }, []);

  const setStake = useCallback((stakeBcc: bigint, sponsored = false) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, stakeBcc, sponsored, shareUnlocked: true };
    });
    setStep(3);
  }, []);

  const applyShareUnlock = useCallback((advanceToConfirm = true) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, shareUnlocked: true };
      if (advanceToConfirm && prev.stakeBcc > 0n) {
        setStep(3);
      }
      return next;
    });
  }, []);

  const markShareUnlocked = useCallback(() => {
    applyShareUnlock(true);
  }, [applyShareUnlock]);

  const markSubmitted = useCallback((txId: string) => {
    setSession((prev) => (prev ? { ...prev, txId, status: "submitted", shareUnlocked: true } : prev));
    setStep(4);
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setStep(1);
    persistSession(null, 1);
  }, []);

  const value = useMemo(
    () => ({
      session,
      step,
      setStep,
      setPick,
      selectMarket,
      setStake,
      applyShareUnlock,
      markShareUnlocked,
      markSubmitted,
      reset,
    }),
    [session, step, setPick, selectMarket, setStake, applyShareUnlock, markShareUnlocked, markSubmitted, reset],
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
