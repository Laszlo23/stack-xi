import {
  generatePepeCopy,
  generatePepeSupportCopy,
  pepeVoiceCheck,
  selectPepePillar,
} from "@/lib/agents/pepe-voice";
import {
  addPepeDraft,
  addPepeOutcome,
  countPepeActionsToday,
  listPendingPepeDrafts,
  type PepeActionType,
} from "@/lib/server/pepe-agent-storage";
import {
  pepeAutoSupportEnabled,
  pepeDailyCap,
  pepeNeynarConfigured,
  pepePostCooldownMinutes,
  pepePublishingPaused,
  pepeSlackWebhookUrl,
} from "@/server/agents/pepe/env";
import { findPepeSupportCandidate, pickPepeSupportAction } from "@/server/agents/pepe/radar";

export type PepeTickResult = {
  ok: boolean;
  dryRun: boolean;
  autoSupport: boolean;
  pillar: string;
  neynarConfigured: boolean;
  support?: { ok: boolean; action?: PepeActionType; url?: string; error?: string; skipped?: string };
  draft?: { id: string; text: string; hook: string };
  pendingDrafts: number;
  capsToday: Record<PepeActionType, number>;
  slack?: string;
};

async function postSlack(text: string): Promise<string> {
  const hook = pepeSlackWebhookUrl();
  if (!hook) return "skipped_no_webhook";
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok ? "posted" : `http_${res.status}`;
  } catch (e) {
    return `error:${e instanceof Error ? e.message : String(e)}`;
  }
}

async function inCooldown(now = new Date()): Promise<boolean> {
  const minutes = pepePostCooldownMinutes();
  if (minutes <= 0) return false;
  const { listOutcomes } = await import("@/lib/server/pepe-agent-storage");
  const since = new Date(now.getTime() - minutes * 60 * 1000);
  const recent = await listOutcomes(since);
  return recent.length > 0;
}

async function publishNeynarCast(
  text: string,
  parent?: string,
): Promise<{ ok: boolean; castHash?: string; url?: string; error?: string }> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  const signerUuid =
    process.env.NEYNAR_SIGNER_UUID?.trim() || process.env.GROVE_NEYNAR_SIGNER_UUID?.trim();
  if (!apiKey || !signerUuid) {
    return { ok: false, error: "neynar_unconfigured" };
  }

  const body: Record<string, string> = { signer_uuid: signerUuid, text };
  if (parent) body.parent = parent;

  const res = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return { ok: false, error: errBody.slice(0, 200) };
  }

  const data = (await res.json()) as {
    cast?: { hash?: string; author?: { username?: string } };
  };
  const hash = data.cast?.hash;
  const username = data.cast?.author?.username ?? "0xleonardo";
  if (!hash) return { ok: false, error: "missing_cast_hash" };

  return {
    ok: true,
    castHash: hash,
    url: `https://warpcast.com/${username}/${hash.slice(0, 10)}`,
  };
}

async function publishRecast(castHash: string): Promise<{ ok: boolean; castHash?: string; url?: string; error?: string }> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  const signerUuid =
    process.env.NEYNAR_SIGNER_UUID?.trim() || process.env.GROVE_NEYNAR_SIGNER_UUID?.trim();
  if (!apiKey || !signerUuid) {
    return { ok: false, error: "neynar_unconfigured" };
  }

  const res = await fetch("https://api.neynar.com/v2/farcaster/reaction", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      signer_uuid: signerUuid,
      reaction_type: "recast",
      target: castHash,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return { ok: false, error: errBody.slice(0, 200) };
  }

  return { ok: true, castHash, url: `https://warpcast.com/~/conversations/${castHash}` };
}

export async function runPepeTick(opts?: { dryRun?: boolean }): Promise<PepeTickResult> {
  const dryRun = opts?.dryRun ?? !pepeAutoSupportEnabled();
  const autoSupport = pepeAutoSupportEnabled() && !dryRun;
  const capsToday = await countPepeActionsToday();
  const pillar = selectPepePillar();
  const neynarConfigured = pepeNeynarConfigured();

  const result: PepeTickResult = {
    ok: true,
    dryRun,
    autoSupport,
    pillar,
    neynarConfigured,
    pendingDrafts: (await listPendingPepeDrafts()).length,
    capsToday,
  };

  if (pepePublishingPaused() && autoSupport) {
    result.ok = false;
    result.support = { ok: false, skipped: "publishing_paused" };
    result.slack = await postSlack("*[Pepe]* publishing paused by kill switch.");
    return result;
  }

  if (await inCooldown()) {
    result.support = { ok: false, skipped: "cooldown_active" };
    return result;
  }

  const caps = {
    reply: pepeDailyCap("reply"),
    recast: pepeDailyCap("recast"),
    original: pepeDailyCap("original"),
    matchday: pepeDailyCap("matchday"),
  };

  const supportAction = pickPepeSupportAction(capsToday, caps);

  if (neynarConfigured && supportAction && autoSupport) {
    const candidate = await findPepeSupportCandidate();
    if (candidate) {
      if (supportAction === "recast") {
        if (dryRun) {
          result.support = { ok: true, action: supportAction, skipped: "dry_run" };
        } else {
          const published = await publishRecast(candidate.castHash);
          if (published.ok) {
            await addPepeOutcome({
              castHash: published.castHash ?? candidate.castHash,
              actionType: "recast",
              pillar: "builder_feed",
              hook: `support-recast-${candidate.username}`,
              targetCastHash: candidate.castHash,
              targetHandle: candidate.handle,
              publishedAt: new Date().toISOString(),
              url: published.url,
              text: `Recast ${candidate.handle}`,
            });
            result.support = { ok: true, action: "recast", url: published.url };
            result.slack = await postSlack(
              `*[Pepe]* auto recast for ${candidate.handle}\n${published.url}`,
            );
          } else {
            result.support = { ok: false, error: published.error ?? "publish_failed" };
          }
        }
      } else {
        const copy = generatePepeSupportCopy("reply", candidate.handle, candidate.note);
        const check = pepeVoiceCheck(copy.text);
        if (!check.ok) {
          result.support = { ok: false, error: check.reason };
        } else if (dryRun) {
          result.support = { ok: true, action: supportAction, skipped: "dry_run" };
        } else {
          const published = await publishNeynarCast(copy.text, candidate.castHash);
          if (published.ok && published.castHash) {
            await addPepeOutcome({
              castHash: published.castHash,
              actionType: "reply",
              pillar: copy.pillar,
              hook: copy.hook,
              targetCastHash: candidate.castHash,
              targetHandle: candidate.handle,
              publishedAt: new Date().toISOString(),
              url: published.url,
              text: copy.text,
            });
            result.support = { ok: true, action: "reply", url: published.url };
            result.slack = await postSlack(
              `*[Pepe]* auto reply for ${candidate.handle}\n${published.url}`,
            );
          } else {
            result.support = { ok: false, error: published.error ?? "publish_failed" };
          }
        }
      }
    } else {
      result.support = { ok: false, skipped: "no_radar_candidate" };
    }
  } else if (!supportAction) {
    result.support = { ok: false, skipped: "daily_cap_reached" };
  } else if (!neynarConfigured) {
    result.support = { ok: false, error: "neynar_unconfigured" };
    result.ok = false;
  } else {
    result.support = { ok: false, skipped: "dry_run" };
  }

  const originalCopy = generatePepeCopy(pillar);
  const originalCheck = pepeVoiceCheck(originalCopy.text);
  if (originalCheck.ok && originalCopy.requiresApproval) {
    const actionType = pillar === "matchday" ? "matchday" : "original";
    const originalCap = caps[actionType];
    const originalCount =
      actionType === "matchday" ? capsToday.matchday : capsToday.original;

    if (originalCount < originalCap) {
      const existingPending = (await listPendingPepeDrafts()).some(
        (d) => d.hook === originalCopy.hook && d.pillar === originalCopy.pillar,
      );
      if (!existingPending) {
        const draft = await addPepeDraft({
          text: originalCopy.text,
          actionType,
          pillar: originalCopy.pillar,
          hook: originalCopy.hook,
        });
        result.draft = { id: draft.id, text: draft.text, hook: draft.hook };
        result.pendingDrafts += 1;
        const approveHint = `${process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space"}/api/agents/pepe/approve`;
        result.slack = await postSlack(
          `*[Pepe]* draft queued (${originalCopy.pillar})\n\`\`\`${draft.text}\`\`\`\nApprove: POST ${approveHint} {"draftId":"${draft.id}"}`,
        );
      }
    }
  }

  return result;
}

export async function approvePepeDraft(
  draftId: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const { getPepeDraftById, updatePepeDraft } = await import("@/lib/server/pepe-agent-storage");
  const draft = await getPepeDraftById(draftId);
  if (!draft) return { ok: false, error: "draft_not_found" };
  if (draft.status !== "pending" && draft.status !== "approved") {
    return { ok: false, error: `draft_${draft.status}` };
  }

  const check = pepeVoiceCheck(draft.text);
  if (!check.ok) return { ok: false, error: check.reason };

  const posted = await publishNeynarCast(draft.text);
  if (!posted.ok || !posted.castHash) return { ok: false, error: posted.error ?? "publish_failed" };

  await updatePepeDraft(draftId, {
    status: "published",
    approvedAt: new Date().toISOString(),
    castHash: posted.castHash,
    url: posted.url,
  });

  await addPepeOutcome({
    castHash: posted.castHash,
    actionType: draft.actionType,
    pillar: draft.pillar,
    hook: draft.hook,
    publishedAt: new Date().toISOString(),
    url: posted.url,
    text: draft.text,
  });

  return { ok: true, url: posted.url };
}

export async function getPepeAgentStatus() {
  const capsToday = await countPepeActionsToday();
  const pendingDrafts = await listPendingPepeDrafts();

  return {
    ok: true,
    agent: "pepe-agent",
    autoSupport: pepeAutoSupportEnabled(),
    publishingPaused: pepePublishingPaused(),
    neynarConfigured: pepeNeynarConfigured(),
    adminSecretConfigured: Boolean(
      process.env.PEPE_AGENT_ADMIN_SECRET?.trim() || process.env.LUCK_AGENT_ADMIN_SECRET?.trim(),
    ),
    capsToday,
    caps: {
      reply: pepeDailyCap("reply"),
      recast: pepeDailyCap("recast"),
      original: pepeDailyCap("original"),
      matchday: pepeDailyCap("matchday"),
    },
    pendingDrafts: pendingDrafts.map((d) => ({
      id: d.id,
      hook: d.hook,
      pillar: d.pillar,
      preview: d.text.slice(0, 120),
      createdAt: d.createdAt,
    })),
  };
}
