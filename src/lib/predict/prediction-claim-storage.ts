const CLAIMS_KEY = "stackxi:prediction-claims";

export type PredictionClaimRecord = {
  txHash: string;
  matchId: string;
  requestedAt: string;
  status: "requested" | "paid";
};

type ClaimStore = Record<string, PredictionClaimRecord>;

function loadStore(): ClaimStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ClaimStore;
  } catch {
    return {};
  }
}

function saveStore(store: ClaimStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(store));
}

export function getClaimState(txHash: string): "none" | "requested" | "paid" {
  const record = loadStore()[txHash];
  if (!record) return "none";
  return record.status;
}

export function requestPredictionClaim(txHash: string, matchId: string): PredictionClaimRecord {
  const store = loadStore();
  const record: PredictionClaimRecord = {
    txHash,
    matchId,
    requestedAt: new Date().toISOString(),
    status: "requested",
  };
  store[txHash] = record;
  saveStore(store);
  return record;
}

export function listPredictionClaims(): PredictionClaimRecord[] {
  return Object.values(loadStore()).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

export function markClaimPaid(txHash: string): void {
  const store = loadStore();
  const existing = store[txHash];
  if (!existing) return;
  store[txHash] = { ...existing, status: "paid" };
  saveStore(store);
}
