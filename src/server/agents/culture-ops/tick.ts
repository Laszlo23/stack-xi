import { privateKeyToAccount } from "viem/accounts";

import { addCultureOpsEvent } from "@/lib/server/feed-storage";

export type CultureOpsTickResult = {
  ok: boolean;
  dryRun: boolean;
  configured: boolean;
  address?: `0x${string}`;
  event?: { id: string; label: string };
  skipped?: string;
  error?: string;
};

function cultureOpsKey(): `0x${string}` | null {
  const raw = process.env.CULTURE_OPS_PRIVATE_KEY?.trim();
  if (!raw?.startsWith("0x")) return null;
  try {
    return privateKeyToAccount(raw as `0x${string}`).address;
  } catch {
    return null;
  }
}

function cultureOpsPaused(): boolean {
  const v = process.env.CULTURE_OPS_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function maxEventsPerDay(): number {
  const raw = process.env.CULTURE_OPS_MAX_EVENTS_DAY?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 3;
  return Number.isFinite(n) && n >= 0 ? n : 3;
}

async function countEventsToday(): Promise<number> {
  const { listCultureOpsEvents } = await import("@/lib/server/feed-storage");
  const events = await listCultureOpsEvents(100);
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return events.filter((e) => new Date(e.publishedAt).getTime() >= start.getTime()).length;
}

export async function runCultureOpsTick(opts?: { dryRun?: boolean }): Promise<CultureOpsTickResult> {
  const address = cultureOpsKey();
  const configured = Boolean(address);
  const dryRun = opts?.dryRun ?? !configured;

  if (!configured) {
    return { ok: false, dryRun: true, configured: false, error: "culture_ops_unconfigured" };
  }

  if (cultureOpsPaused()) {
    return { ok: false, dryRun, configured: true, address, skipped: "paused" };
  }

  const todayCount = await countEventsToday();
  if (todayCount >= maxEventsPerDay()) {
    return { ok: true, dryRun, configured: true, address, skipped: "daily_cap" };
  }

  const label = "Protocol Pepe checked matchday culture ops on Base";
  if (dryRun) {
    return { ok: true, dryRun: true, configured: true, address, skipped: "dry_run" };
  }

  const event = await addCultureOpsEvent({
    kind: "note",
    label,
    amountLabel: "Treasury heartbeat",
  });

  return {
    ok: true,
    dryRun: false,
    configured: true,
    address,
    event: { id: event.id, label: event.label },
  };
}

export function getCultureOpsStatus() {
  const address = cultureOpsKey();
  return {
    ok: true,
    configured: Boolean(address),
    address,
    paused: cultureOpsPaused(),
    maxEventsPerDay: maxEventsPerDay(),
  };
}
