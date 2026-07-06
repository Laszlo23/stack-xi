export type WorldIdLink = {
  nullifier: string;
  protocolVersion: string;
  verifiedAt: string;
};

export function worldAppId(): `app_${string}` | null {
  const raw =
    process.env.VITE_WORLD_APP_ID?.trim() || process.env.WORLD_APP_ID?.trim();
  if (!raw) return null;
  return raw.startsWith("app_") ? (raw as `app_${string}`) : (`app_${raw}` as `app_${string}`);
}

export function worldVerifyAction(): string {
  return process.env.WORLD_APP_VERIFY_ACTION?.trim() || "predict-human";
}

export function worldRpSigningKey(): string | null {
  return process.env.WORLD_RP_SIGNING_KEY?.trim() || null;
}

export function worldRpId(): string | null {
  return process.env.WORLD_RP_ID?.trim() || null;
}

export function isWorldIdServerConfigured(): boolean {
  return Boolean(worldAppId() && worldRpSigningKey() && worldRpId());
}
