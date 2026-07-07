const SIWF_SESSION_KEY = "stackxi:fc-siwf-session";

export type StoredSiwfSession = {
  fid: number;
  username?: string | null;
  message: string;
  signature: `0x${string}`;
  nonce: string;
};

export function readStoredSiwfSession(): StoredSiwfSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SIWF_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSiwfSession;
  } catch {
    return null;
  }
}

export function storeSiwfSession(session: StoredSiwfSession): void {
  sessionStorage.setItem(SIWF_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSiwfSession(): void {
  sessionStorage.removeItem(SIWF_SESSION_KEY);
}
