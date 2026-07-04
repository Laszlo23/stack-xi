const STORAGE_PREFIX = "stackxi:distribution:";

export type DistributionStatus = {
  farcasterPosted: boolean;
  xPosted: boolean;
  pngDownloaded: boolean;
  updatedAt: string;
};

function storageKey(date: string): string {
  return `${STORAGE_PREFIX}${date}`;
}

function emptyStatus(): DistributionStatus {
  return {
    farcasterPosted: false,
    xPosted: false,
    pngDownloaded: false,
    updatedAt: "",
  };
}

export function loadDistributionStatus(date: string): DistributionStatus {
  if (typeof window === "undefined") return emptyStatus();
  try {
    const raw = localStorage.getItem(storageKey(date));
    if (!raw) return emptyStatus();
    return { ...emptyStatus(), ...(JSON.parse(raw) as DistributionStatus) };
  } catch {
    return emptyStatus();
  }
}

export function saveDistributionStatus(date: string, status: DistributionStatus): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(date), JSON.stringify(status));
}

export function patchDistributionStatus(
  date: string,
  patch: Partial<DistributionStatus>,
): DistributionStatus {
  const next = {
    ...loadDistributionStatus(date),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveDistributionStatus(date, next);
  return next;
}

export function isDistributionComplete(status: DistributionStatus): boolean {
  return status.farcasterPosted && status.xPosted;
}
