import type { MemberProgress, MemberTaskId } from "@/domain/types";
import { publishLeaderboardEntry } from "@/lib/profile/leaderboard-storage";
import { MEMBER_TASKS } from "@/lib/profile/member-tasks";

const STORAGE_PREFIX = "stackxi:member-tasks:";

export type ProgressIdentity =
  | { kind: "wallet"; id: string }
  | { kind: "telegram"; id: string }
  | { kind: "none" };

export function resolveProgressIdentity(input: {
  walletAddress?: string;
  telegramUserId?: number;
}): ProgressIdentity {
  if (input.walletAddress) {
    return { kind: "wallet", id: input.walletAddress.toLowerCase() };
  }
  if (input.telegramUserId) {
    return { kind: "telegram", id: String(input.telegramUserId) };
  }
  return { kind: "none" };
}

function storageKeyForIdentity(identity: ProgressIdentity): string {
  if (identity.kind === "wallet") return `${STORAGE_PREFIX}${identity.id}`;
  if (identity.kind === "telegram") return `${STORAGE_PREFIX}tg:${identity.id}`;
  return `${STORAGE_PREFIX}anonymous`;
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

function normalizeProgress(parsed: Partial<MemberProgress>): MemberProgress {
  const completedTaskIds = parsed.completedTaskIds ?? [];
  return {
    ...emptyProgress(),
    ...parsed,
    completedTaskIds,
    predictionTxIds: parsed.predictionTxIds ?? [],
    mintTxIds: parsed.mintTxIds ?? [],
    totalXp: computeXp(completedTaskIds),
  };
}

export function loadMemberProgressForIdentity(identity: ProgressIdentity): MemberProgress {
  if (typeof window === "undefined" || identity.kind === "none") return emptyProgress();
  try {
    const raw = localStorage.getItem(storageKeyForIdentity(identity));
    if (!raw) return emptyProgress();
    return normalizeProgress(JSON.parse(raw) as MemberProgress);
  } catch {
    return emptyProgress();
  }
}

export function saveMemberProgressForIdentity(
  identity: ProgressIdentity,
  progress: MemberProgress,
): void {
  if (typeof window === "undefined" || identity.kind === "none") return;
  const normalized: MemberProgress = {
    ...progress,
    totalXp: computeXp(progress.completedTaskIds),
  };
  localStorage.setItem(storageKeyForIdentity(identity), JSON.stringify(normalized));
  if (identity.kind === "wallet") {
    publishLeaderboardEntry(identity.id, normalized.totalXp);
  }
}

/** @deprecated Use loadMemberProgressForIdentity */
export function loadMemberProgress(address: string): MemberProgress {
  return loadMemberProgressForIdentity(
    address ? { kind: "wallet", id: address.toLowerCase() } : { kind: "none" },
  );
}

/** @deprecated Use saveMemberProgressForIdentity */
export function saveMemberProgress(address: string, progress: MemberProgress): void {
  saveMemberProgressForIdentity({ kind: "wallet", id: address.toLowerCase() }, progress);
}

function unionTaskIds(a: MemberTaskId[], b: MemberTaskId[]): MemberTaskId[] {
  return [...new Set([...a, ...b])];
}

function mergeProgressRecords(primary: MemberProgress, secondary: MemberProgress): MemberProgress {
  const completedTaskIds = unionTaskIds(primary.completedTaskIds, secondary.completedTaskIds);
  const predictionTxIds = [...new Set([...primary.predictionTxIds, ...secondary.predictionTxIds])];
  const mintTxMap = new Map(primary.mintTxIds.map((m) => [m.txId, m]));
  for (const mint of secondary.mintTxIds) {
    mintTxMap.set(mint.txId, mint);
  }
  const loginStreak = Math.max(primary.loginStreak, secondary.loginStreak);
  const lastLoginDate =
    primary.lastLoginDate > secondary.lastLoginDate
      ? primary.lastLoginDate
      : secondary.lastLoginDate;

  return normalizeProgress({
    completedTaskIds,
    predictionTxIds,
    mintTxIds: [...mintTxMap.values()],
    loginStreak,
    lastLoginDate,
  });
}

export function mergeMemberProgress(wallet: string, telegramUserId: number): MemberProgress {
  const walletIdentity = { kind: "wallet" as const, id: wallet.toLowerCase() };
  const tgIdentity = { kind: "telegram" as const, id: String(telegramUserId) };
  const walletProgress = loadMemberProgressForIdentity(walletIdentity);
  const tgProgress = loadMemberProgressForIdentity(tgIdentity);
  const merged = mergeProgressRecords(walletProgress, tgProgress);
  saveMemberProgressForIdentity(walletIdentity, merged);
  if (typeof window !== "undefined") {
    localStorage.removeItem(storageKeyForIdentity(tgIdentity));
  }
  return merged;
}

export function completeMemberTaskForIdentity(
  identity: ProgressIdentity,
  taskId: MemberTaskId,
): MemberProgress {
  const progress = loadMemberProgressForIdentity(identity);
  if (progress.completedTaskIds.includes(taskId)) return progress;
  const completedTaskIds = [...progress.completedTaskIds, taskId];
  const next = { ...progress, completedTaskIds, totalXp: computeXp(completedTaskIds) };
  saveMemberProgressForIdentity(identity, next);
  return next;
}

export function completeMemberTask(address: string, taskId: MemberTaskId): MemberProgress {
  return completeMemberTaskForIdentity({ kind: "wallet", id: address.toLowerCase() }, taskId);
}

export function recordMintTxForIdentity(
  identity: ProgressIdentity,
  txId: string,
  playerId: number,
): MemberProgress {
  const progress = loadMemberProgressForIdentity(identity);
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
  saveMemberProgressForIdentity(identity, next);
  return next;
}

export function recordMintTx(address: string, txId: string, playerId: number): MemberProgress {
  return recordMintTxForIdentity({ kind: "wallet", id: address.toLowerCase() }, txId, playerId);
}

export function recordPredictionTxForIdentity(
  identity: ProgressIdentity,
  txId: string,
): MemberProgress {
  const progress = loadMemberProgressForIdentity(identity);
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
  saveMemberProgressForIdentity(identity, next);
  return next;
}

export function recordPredictionTx(address: string, txId: string): MemberProgress {
  return recordPredictionTxForIdentity({ kind: "wallet", id: address.toLowerCase() }, txId);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function processDailyLoginForIdentity(identity: ProgressIdentity): MemberProgress {
  const progress = loadMemberProgressForIdentity(identity);
  const today = todayKey();
  if (progress.lastLoginDate === today) {
    if (!progress.completedTaskIds.includes("daily_login")) {
      return completeMemberTaskForIdentity(identity, "daily_login");
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
  saveMemberProgressForIdentity(identity, next);
  return next;
}

export function processDailyLogin(address: string): MemberProgress {
  return processDailyLoginForIdentity({ kind: "wallet", id: address.toLowerCase() });
}

export function syncAutoTasksForIdentity(
  identity: ProgressIdentity,
  options: { ownsSquadNft: boolean; hasPrediction: boolean },
): MemberProgress {
  let progress = loadMemberProgressForIdentity(identity);
  if (options.ownsSquadNft && !progress.completedTaskIds.includes("mint_squad")) {
    progress = completeMemberTaskForIdentity(identity, "mint_squad");
  }
  if (options.hasPrediction && !progress.completedTaskIds.includes("submit_prediction")) {
    progress = completeMemberTaskForIdentity(identity, "submit_prediction");
  }
  return progress;
}

export function syncAutoTasks(
  address: string,
  options: { ownsSquadNft: boolean; hasPrediction: boolean },
): MemberProgress {
  return syncAutoTasksForIdentity({ kind: "wallet", id: address.toLowerCase() }, options);
}
