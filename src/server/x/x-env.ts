/** Read first non-empty env var (supports legacy key aliases). */
export function readXEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function readOfficialXOAuthEnv(): {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
} | null {
  const appKey = readXEnv("X_CONSUMER_KEY", "X_consumerKey");
  const appSecret = readXEnv("X_CONSUMER_SECRET", "X_consumerSecret");
  const accessToken = readXEnv("X_ACCESS_TOKEN", "X_accessToken");
  const accessSecret = readXEnv("X_ACCESS_TOKEN_SECRET", "X_accessTokenSecret");
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return { appKey, appSecret, accessToken, accessSecret };
}

export function readLuckAgentAdminSecret(): string | undefined {
  return readXEnv(
    "LUCK_AGENT_ADMIN_SECRET",
    "X_MARKETING_ADMIN_SECRET",
    "FEEDBACK_ADMIN_SECRET",
  );
}

export function serverSiteUrl(): string {
  return (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(/\/$/, "");
}
