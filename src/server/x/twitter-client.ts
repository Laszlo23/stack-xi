import { TwitterApi } from "twitter-api-v2";

import { readOfficialXOAuthEnv } from "@/server/x/x-env";

/** OAuth 1.0a user-context client for X API v2 (read + manage tweets). */
export function getTwitterUserClient(): TwitterApi | null {
  const creds = readOfficialXOAuthEnv();
  if (!creds) return null;
  return new TwitterApi({
    appKey: creds.appKey,
    appSecret: creds.appSecret,
    accessToken: creds.accessToken,
    accessSecret: creds.accessSecret,
  });
}

export async function getAuthenticatedUserId(client: TwitterApi): Promise<string | null> {
  try {
    const me = await client.v2.me();
    return me.data.id ?? null;
  } catch {
    return null;
  }
}
