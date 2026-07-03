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
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";
import { MEMBER_TASKS } from "@/lib/profile/member-tasks";
import { completeMemberTask, loadMemberProgress, syncAutoTasks } from "@/lib/profile/task-storage";

type MemberTasksContextValue = {
  progress: MemberProgress;
  completeTask: (taskId: MemberTaskId) => void;
  refreshProgress: () => void;
  isTaskComplete: (taskId: MemberTaskId) => boolean;
};

const MemberTasksContext = createContext<MemberTasksContextValue | null>(null);

export function MemberTasksProvider({ children }: { children: ReactNode }) {
  const { address } = useBaseWallet();
  const { ownedCount } = useUserSquadHoldings(address);
  const [progress, setProgress] = useState<MemberProgress>(() =>
    address ? loadMemberProgress(address) : loadMemberProgress(""),
  );

  const refreshProgress = useCallback(() => {
    if (!address) {
      setProgress(loadMemberProgress(""));
      return;
    }
    const stored = loadMemberProgress(address);
    const next = syncAutoTasks(address, {
      ownsSquadNft: ownedCount > 0,
      hasPrediction: stored.predictionTxIds.length > 0,
    });
    setProgress(next);
  }, [address, ownedCount]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const completeTask = useCallback(
    (taskId: MemberTaskId) => {
      if (!address) return;
      const next = completeMemberTask(address, taskId);
      setProgress(next);
    },
    [address],
  );

  const isTaskComplete = useCallback(
    (taskId: MemberTaskId) => progress.completedTaskIds.includes(taskId),
    [progress.completedTaskIds],
  );

  const value = useMemo(
    () => ({ progress, completeTask, refreshProgress, isTaskComplete }),
    [progress, completeTask, refreshProgress, isTaskComplete],
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
