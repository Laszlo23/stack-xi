import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type XSocialLink = {
  userId: string;
  username: string;
  accessToken: string;
  refreshToken?: string;
  linkedAt: string;
};

export type FarcasterSocialLink = {
  fid: number;
  username?: string;
  linkedAt: string;
};

export type TelegramSocialLink = {
  userId: number;
  username?: string;
  linkedAt: string;
};

export type TelegramUserRecord = {
  userId: number;
  username?: string;
  wallet?: string;
  linkedAt: string;
};

export type WalletSocialLinks = {
  x?: XSocialLink;
  farcaster?: FarcasterSocialLink;
  telegram?: TelegramSocialLink;
};

export type OAuthPendingSession = {
  wallet: string;
  codeVerifier: string;
  expiresAt: number;
};

export type SocialStorageData = {
  links: Record<string, WalletSocialLinks>;
  telegramUsers: Record<string, TelegramUserRecord>;
  oauthPending: Record<string, OAuthPendingSession>;
};

const DEFAULT_DATA: SocialStorageData = {
  links: {},
  telegramUsers: {},
  oauthPending: {},
};

function dataFilePath(): string {
  return process.env.SOCIAL_STORAGE_PATH ?? join(process.cwd(), "data", "social-links.json");
}

async function ensureDataFile(): Promise<void> {
  const path = dataFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(path, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
  }
}

async function readStorage(): Promise<SocialStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as Partial<SocialStorageData>;
  return {
    links: parsed.links ?? {},
    telegramUsers: parsed.telegramUsers ?? {},
    oauthPending: parsed.oauthPending ?? {},
  };
}

async function writeStorage(data: SocialStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function getWalletSocialLinks(wallet: string): Promise<WalletSocialLinks | null> {
  const data = await readStorage();
  return data.links[wallet.toLowerCase()] ?? null;
}

export async function getTelegramUserRecord(userId: number): Promise<TelegramUserRecord | null> {
  const data = await readStorage();
  return data.telegramUsers[String(userId)] ?? null;
}

export async function saveWalletSocialLinks(
  wallet: string,
  links: WalletSocialLinks,
): Promise<void> {
  const data = await readStorage();
  data.links[wallet.toLowerCase()] = links;
  await writeStorage(data);
}

export async function upsertTelegramUser(record: TelegramUserRecord): Promise<TelegramUserRecord> {
  const data = await readStorage();
  const key = String(record.userId);
  const existing = data.telegramUsers[key];
  const next: TelegramUserRecord = {
    userId: record.userId,
    username: record.username ?? existing?.username,
    wallet: record.wallet ?? existing?.wallet,
    linkedAt: record.linkedAt,
  };
  data.telegramUsers[key] = next;
  await writeStorage(data);
  return next;
}

export async function linkTelegramUserToWallet(
  userId: number,
  wallet: string,
  username?: string,
): Promise<{ telegram: TelegramUserRecord; walletLinks: WalletSocialLinks }> {
  const normalizedWallet = wallet.toLowerCase();
  const telegram = await upsertTelegramUser({
    userId,
    username,
    wallet: normalizedWallet,
    linkedAt: new Date().toISOString(),
  });
  const walletLinks = await linkTelegramAccount(normalizedWallet, {
    userId,
    username,
    linkedAt: telegram.linkedAt,
  });
  return { telegram, walletLinks };
}

export async function saveOAuthPending(state: string, session: OAuthPendingSession): Promise<void> {
  const data = await readStorage();
  data.oauthPending[state] = session;
  await writeStorage(data);
}

export async function consumeOAuthPending(state: string): Promise<OAuthPendingSession | null> {
  const data = await readStorage();
  const session = data.oauthPending[state];
  if (!session) return null;
  delete data.oauthPending[state];
  await writeStorage(data);
  if (session.expiresAt < Date.now()) return null;
  return session;
}

export async function linkXAccount(
  wallet: string,
  xLink: XSocialLink,
): Promise<WalletSocialLinks> {
  const existing = (await getWalletSocialLinks(wallet)) ?? {};
  const next = { ...existing, x: xLink };
  await saveWalletSocialLinks(wallet, next);
  return next;
}

export async function linkFarcasterAccount(
  wallet: string,
  fcLink: FarcasterSocialLink,
): Promise<WalletSocialLinks> {
  const existing = (await getWalletSocialLinks(wallet)) ?? {};
  const next = { ...existing, farcaster: fcLink };
  await saveWalletSocialLinks(wallet, next);
  return next;
}

export async function linkTelegramAccount(
  wallet: string,
  tgLink: TelegramSocialLink,
): Promise<WalletSocialLinks> {
  const existing = (await getWalletSocialLinks(wallet)) ?? {};
  const next = { ...existing, telegram: tgLink };
  await saveWalletSocialLinks(wallet, next);
  await upsertTelegramUser({
    userId: tgLink.userId,
    username: tgLink.username,
    wallet: wallet.toLowerCase(),
    linkedAt: tgLink.linkedAt,
  });
  return next;
}

export function publicSocialStatus(links: WalletSocialLinks | null) {
  return {
    x: links?.x ? { username: links.x.username, userId: links.x.userId } : null,
    farcaster: links?.farcaster
      ? { fid: links.farcaster.fid, username: links.farcaster.username ?? null }
      : null,
    telegram: links?.telegram
      ? { userId: links.telegram.userId, username: links.telegram.username ?? null }
      : null,
  };
}

export function publicTelegramSession(record: TelegramUserRecord | null) {
  if (!record) return null;
  return {
    userId: record.userId,
    username: record.username ?? null,
    linkedWallet: record.wallet ?? null,
  };
}
