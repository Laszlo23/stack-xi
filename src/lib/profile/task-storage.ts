import type { MemberProgress, MemberTaskId } from "@/domain/types";
import { publishLeaderboardEntry } from "@/lib/profile/leaderboard-storage";
import { MEMBER_TASKS } from "@/lib/profile/member-tasks";

const STORAGE_PREFIX = "stackxi:member-tasks:";

function storageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

function emptyProgress(): MemberProgress {
  return {
    completedTaskIds: [],
    loginStreak: 0,
    totalXp: 0,
    lastLoginDate: "",
    predictionTxIds: [],
    mintTxIds: [],
  };
}

function computeXp(completedIds: MemberTaskId[]): number {
  return MEMBER_TASKS.filter((t) => completedIds.includes(t.id)).reduce(
    (sum, t) => sum + t.points,
    0,
  );
}

export function loadMemberProgress(address: string): MemberProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as MemberProgress;
    return {
      ...emptyProgress(),
      ...parsed,
      completedTaskIds: parsed.completedTaskIds ?? [],
      predictionTxIds: parsed.predictionTxIds ?? [],
      mintTxIds: parsed.mintTxIds ?? [],
      totalXp: computeXp(parsed.completedTaskIds ?? []),
    };
  } catch {
    return emptyProgress();
  }
}

export function saveMemberProgress(address: string, progress: MemberProgress): void {
  if (typeof window === "undefined") return;
  const normalized: MemberProgress = {
    ...progress,
    totalXp: computeXp(progress.completedTaskIds),
  };
  localStorage.setItem(storageKey(address), JSON.stringify(normalized));
  publishLeaderboardEntry(address, normalized.totalXp);
}

export function completeMemberTask(address: string, taskId: MemberTaskId): MemberProgress {
  const progress = loadMemberProgress(address);
  if (progress.completedTaskIds.includes(taskId)) return progress;
  const completedTaskIds = [...progress.completedTaskIds, taskId];
  const next = { ...progress, completedTaskIds, totalXp: computeXp(completedTaskIds) };
  saveMemberProgress(address, next);
  return next;
}

export function recordMintTx(address: string, txId: string, playerId: number): MemberProgress {
  const progress = loadMemberProgress(address);
  const exists = progress.mintTxIds.some((m) => m.txId === txId);
  const mintTxIds = exists
    ? progress.mintTxIds
    : [...progress.mintTxIds, { txId, playerId, at: new Date().toISOString() }];
  let completedTaskIds = progress.completedTaskIds;
  if (!completedTaskIds.includes("mint_squad")) {
    completedTaskIds = [...completedTaskIds, "mint_squad"];
  }
  const next = {
    ...progress,
    mintTxIds,
    completedTaskIds,
    totalXp: computeXp(completedTaskIds),
  };
  saveMemberProgress(address, next);
  return next;
}

export function recordPredictionTx(address: string, txId: string): MemberProgress {
  const progress = loadMemberProgress(address);
  const predictionTxIds = progress.predictionTxIds.includes(txId)
    ? progress.predictionTxIds
    : [...progress.predictionTxIds, txId];
  let completedTaskIds = progress.completedTaskIds;
  if (!completedTaskIds.includes("submit_prediction")) {
    completedTaskIds = [...completedTaskIds, "submit_prediction"];
  }
  const next = {
    ...progress,
    predictionTxIds,
    completedTaskIds,
    totalXp: computeXp(completedTaskIds),
  };
  saveMemberProgress(address, next);
  return next;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function processDailyLogin(address: string): MemberProgress {
  const progress = loadMemberProgress(address);
  const today = todayKey();
  if (progress.lastLoginDate === today) {
    if (!progress.completedTaskIds.includes("daily_login")) {
      return completeMemberTask(address, "daily_login");
    }
    return progress;
  }

  const streak = progress.lastLoginDate === yesterdayKey() ? progress.loginStreak + 1 : 1;
  let completedTaskIds = progress.completedTaskIds;
  if (!completedTaskIds.includes("daily_login")) {
    completedTaskIds = [...completedTaskIds, "daily_login"];
  }
  const next: MemberProgress = {
    ...progress,
    lastLoginDate: today,
    loginStreak: streak,
    completedTaskIds,
    totalXp: computeXp(completedTaskIds),
  };
  saveMemberProgress(address, next);
  return next;
}

export function syncAutoTasks(
  address: string,
  options: { ownsSquadNft: boolean; hasPrediction: boolean },
): MemberProgress {
  let progress = loadMemberProgress(address);
  if (options.ownsSquadNft && !progress.completedTaskIds.includes("mint_squad")) {
    progress = completeMemberTask(address, "mint_squad");
  }
  if (options.hasPrediction && !progress.completedTaskIds.includes("submit_prediction")) {
    progress = completeMemberTask(address, "submit_prediction");
  }
  return progress;
}
