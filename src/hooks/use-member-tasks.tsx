import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MemberProgress, MemberTaskId } from "@/domain/types";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useTelegramSessionOptional } from "@/hooks/use-telegram-session";
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";
import { MEMBER_TASKS } from "@/lib/profile/member-tasks";
import {
  completeMemberTaskForIdentity,
  loadMemberProgressForIdentity,
  resolveProgressIdentity,
  syncAutoTasksForIdentity,
} from "@/lib/profile/task-storage";

type MemberTasksContextValue = {
  progress: MemberProgress;
  completeTask: (taskId: MemberTaskId) => void;
  refreshProgress: () => void;
  isTaskComplete: (taskId: MemberTaskId) => boolean;
  hasIdentity: boolean;
};

const MemberTasksContext = createContext<MemberTasksContextValue | null>(null);

export function MemberTasksProvider({ children }: { children: ReactNode }) {
  const { address } = useBaseWallet();
  const telegram = useTelegramSessionOptional();
  const { ownedCount } = useUserSquadHoldings(address);

  const identity = useMemo(
    () =>
      resolveProgressIdentity({
        walletAddress: address,
        telegramUserId: telegram?.user?.userId,
      }),
    [address, telegram?.user?.userId],
  );

  const [progress, setProgress] = useState<MemberProgress>(() =>
    loadMemberProgressForIdentity(identity),
  );

  const refreshProgress = useCallback(() => {
    const stored = loadMemberProgressForIdentity(identity);
    const next = syncAutoTasksForIdentity(identity, {
      ownsSquadNft: ownedCount > 0,
      hasPrediction: stored.predictionTxIds.length > 0,
    });
    setProgress(next);
  }, [identity, ownedCount]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const completeTask = useCallback(
    (taskId: MemberTaskId) => {
      if (identity.kind === "none") return;
      const next = completeMemberTaskForIdentity(identity, taskId);
      setProgress(next);
    },
    [identity],
  );

  const isTaskComplete = useCallback(
    (taskId: MemberTaskId) => progress.completedTaskIds.includes(taskId),
    [progress.completedTaskIds],
  );

  const value = useMemo(
    () => ({
      progress,
      completeTask,
      refreshProgress,
      isTaskComplete,
      hasIdentity: identity.kind !== "none",
    }),
    [progress, completeTask, refreshProgress, isTaskComplete, identity.kind],
  );

  return <MemberTasksContext.Provider value={value}>{children}</MemberTasksContext.Provider>;
}

export function useMemberTasks() {
  const ctx = useContext(MemberTasksContext);
  if (!ctx) {
    throw new Error("useMemberTasks must be used within MemberTasksProvider");
  }
  return ctx;
}

export function useMemberTasksOptional() {
  return useContext(MemberTasksContext);
}

export { MEMBER_TASKS };
