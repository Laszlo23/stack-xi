import type { TwitterApi } from "twitter-api-v2";

import {
  generateLuckCopy,
  generateSupportCopy,
  selectOutcomeDrivenPillar,
  voiceCheck,
  type LuckCopy,
} from "@/lib/agents/luck-voice";
import {
  addDraft,
  addOutcome,
  countActionsToday,
  listPendingDrafts,
  type LuckActionType,
} from "@/lib/server/luck-agent-storage";
import {
  luckAutoSupportEnabled,
  luckDailyCap,
  luckPostCooldownMinutes,
  luckPublishingPaused,
  luckSlackWebhookUrl,
} from "@/server/agents/luck/env";
import { getAverageRewardScore7d, pollOutcomeMetrics } from "@/server/agents/luck/outcomes";
import { findSupportCandidate, pickSupportAction } from "@/server/agents/luck/radar";
import { postTweet, retweetTweet } from "@/server/x/post-tweet";

export type LuckTickResult = {
  ok: boolean;
  dryRun: boolean;
  autoSupport: boolean;
  pillar: string;
  rewardScore7d: number | null;
  metricsPolled: number;
  support?: { ok: boolean; action?: LuckActionType; url?: string; error?: string; skipped?: string };
  draft?: { id: string; text: string; hook: string };
  pendingDrafts: number;
  capsToday: Record<LuckActionType, number>;
  slack?: string;
};

async function postSlack(text: string): Promise<string> {
  const hook = luckSlackWebhookUrl();
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
  const minutes = luckPostCooldownMinutes();
  if (minutes <= 0) return false;
  const { listOutcomes } = await import("@/lib/server/luck-agent-storage");
  const since = new Date(now.getTime() - minutes * 60 * 1000);
  const recent = await listOutcomes(since);
  return recent.length > 0;
}

async function publishSupport(
  client: TwitterApi,
  action: "quote" | "reply" | "retweet",
  copy: LuckCopy,
  targetTweetId: string,
  targetHandle: string,
): Promise<{ ok: boolean; url?: string; error?: string; tweetId?: string }> {
  if (action === "retweet") {
    const res = await retweetTweet(client, targetTweetId);
    if (!res.ok) return res;
    return { ok: true, url: res.url, tweetId: res.tweetId };
  }

  const res = await postTweet(client, copy.text, {
    quoteTweetId: action === "quote" ? targetTweetId : undefined,
    replyToTweetId: action === "reply" ? targetTweetId : undefined,
  });
  if (!res.ok) return res;
  return { ok: true, url: res.url, tweetId: res.tweetId };
}

export async function runLuckTick(
  client: TwitterApi | null,
  opts?: { dryRun?: boolean },
): Promise<LuckTickResult> {
  const dryRun = opts?.dryRun ?? !luckAutoSupportEnabled();
  const autoSupport = luckAutoSupportEnabled() && !dryRun;
  const capsToday = await countActionsToday();
  const rewardScore7d = await getAverageRewardScore7d();
  const pillar = selectOutcomeDrivenPillar(rewardScore7d);

  const result: LuckTickResult = {
    ok: true,
    dryRun,
    autoSupport,
    pillar,
    rewardScore7d,
    metricsPolled: 0,
    pendingDrafts: (await listPendingDrafts()).length,
    capsToday,
  };

  if (client) {
    const { listOutcomes } = await import("@/lib/server/luck-agent-storage");
    const outcomes = await listOutcomes(new Date(Date.now() - 7 * 86400000));
    result.metricsPolled = await pollOutcomeMetrics(client, outcomes);
  }

  if (luckPublishingPaused() && autoSupport) {
    result.ok = false;
    result.support = { ok: false, skipped: "publishing_paused" };
    result.slack = await postSlack("*[Luck]* publishing paused by kill switch.");
    return result;
  }

  if (await inCooldown()) {
    result.support = { ok: false, skipped: "cooldown_active" };
    return result;
  }

  const caps = {
    quote: luckDailyCap("quote"),
    reply: luckDailyCap("reply"),
    retweet: luckDailyCap("retweet"),
    original: luckDailyCap("original"),
    matchday: luckDailyCap("matchday"),
  };

  const supportAction = pickSupportAction(capsToday, caps);

  if (client && supportAction && autoSupport) {
    const candidate = await findSupportCandidate(client);
    if (candidate) {
      if (supportAction === "retweet") {
        if (dryRun) {
          result.support = { ok: true, action: supportAction, skipped: "dry_run" };
        } else {
          const published = await retweetTweet(client, candidate.tweetId);
          if (published.ok) {
            await addOutcome({
              tweetId: published.tweetId,
              actionType: "retweet",
              pillar: "support_og",
              hook: `support-retweet-${candidate.username}`,
              targetTweetId: candidate.tweetId,
              targetHandle: candidate.handle,
              publishedAt: new Date().toISOString(),
              text: `Retweet ${candidate.handle}`,
              url: published.url,
            });
            result.support = { ok: true, action: "retweet", url: published.url };
            result.slack = await postSlack(
              `*[Luck]* auto retweet for ${candidate.handle}\n${published.url}`,
            );
          } else {
            result.support = { ok: false, error: published.error ?? "publish_failed" };
            result.ok = false;
          }
        }
      } else {
        const copy = generateSupportCopy(supportAction, candidate.handle, candidate.note);
        const check = voiceCheck(copy.text);
        if (!check.ok) {
          result.support = { ok: false, error: check.reason };
        } else if (dryRun) {
          result.support = { ok: true, action: supportAction, skipped: "dry_run" };
        } else {
          const published = await publishSupport(
            client,
            supportAction,
            copy,
            candidate.tweetId,
            candidate.handle,
          );
          if (published.ok && published.tweetId) {
            await addOutcome({
              tweetId: published.tweetId,
              actionType: supportAction,
              pillar: copy.pillar,
              hook: copy.hook,
              targetTweetId: candidate.tweetId,
              targetHandle: candidate.handle,
              publishedAt: new Date().toISOString(),
              text: copy.text,
              url: published.url,
            });
            result.support = { ok: true, action: supportAction, url: published.url };
            result.slack = await postSlack(
              `*[Luck]* auto ${supportAction} for ${candidate.handle}\n${published.url}`,
            );
          } else {
            result.support = { ok: false, error: published.error ?? "publish_failed" };
            result.ok = false;
          }
        }
      }
    } else {
      result.support = { ok: false, skipped: "no_radar_candidate" };
    }
  } else if (!supportAction) {
    result.support = { ok: false, skipped: "daily_cap_reached" };
  } else if (!client) {
    result.support = { ok: false, error: "x_client_unconfigured" };
    result.ok = false;
  } else {
    result.support = { ok: false, skipped: "dry_run" };
  }

  const originalCopy = generateLuckCopy(pillar);
  const originalCheck = voiceCheck(originalCopy.text);
  if (originalCheck.ok && originalCopy.requiresApproval) {
    const actionType = pillar === "matchday" ? "matchday" : "original";
    const originalCap = caps[actionType];
    const originalCount =
      actionType === "matchday" ? capsToday.matchday : capsToday.original;

    if (originalCount < originalCap) {
      const existingPending = (await listPendingDrafts()).some(
        (d) => d.hook === originalCopy.hook && d.pillar === originalCopy.pillar,
      );
      if (!existingPending) {
        const draft = await addDraft({
          text: originalCopy.text,
          actionType,
          pillar: originalCopy.pillar,
          hook: originalCopy.hook,
        });
        result.draft = { id: draft.id, text: draft.text, hook: draft.hook };
        result.pendingDrafts += 1;
        const approveHint = `${process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space"}/api/agents/luck/approve`;
        result.slack = await postSlack(
          `*[Luck]* draft queued (${originalCopy.pillar})\n\`\`\`${draft.text}\`\`\`\nApprove: POST ${approveHint} {"draftId":"${draft.id}"}`,
        );
      }
    }
  }

  return result;
}

export async function approveLuckDraft(
  client: TwitterApi,
  draftId: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const { getDraftById, updateDraft } = await import("@/lib/server/luck-agent-storage");
  const draft = await getDraftById(draftId);
  if (!draft) return { ok: false, error: "draft_not_found" };
  if (draft.status !== "pending" && draft.status !== "approved") {
    return { ok: false, error: `draft_${draft.status}` };
  }

  const check = voiceCheck(draft.text);
  if (!check.ok) return { ok: false, error: check.reason };

  const posted = await postTweet(client, draft.text);
  if (!posted.ok) return posted;

  await updateDraft(draftId, {
    status: "published",
    approvedAt: new Date().toISOString(),
    tweetId: posted.tweetId,
    url: posted.url,
  });

  await addOutcome({
    tweetId: posted.tweetId,
    actionType: draft.actionType,
    pillar: draft.pillar,
    hook: draft.hook,
    publishedAt: new Date().toISOString(),
    text: draft.text,
    url: posted.url,
  });

  return { ok: true, url: posted.url };
}

export async function getLuckAgentStatus(client: TwitterApi | null) {
  const capsToday = await countActionsToday();
  const rewardScore7d = await getAverageRewardScore7d();
  const pendingDrafts = await listPendingDrafts();
  const { getTopHooks7d } = await import("@/server/agents/luck/outcomes");

  return {
    ok: true,
    agent: "luck-agent",
    autoSupport: luckAutoSupportEnabled(),
    publishingPaused: luckPublishingPaused(),
    xConfigured: Boolean(client),
    adminSecretConfigured: Boolean(
      process.env.LUCK_AGENT_ADMIN_SECRET?.trim() || process.env.X_MARKETING_ADMIN_SECRET?.trim(),
    ),
    rewardScore7d,
    capsToday,
    caps: {
      quote: luckDailyCap("quote"),
      reply: luckDailyCap("reply"),
      retweet: luckDailyCap("retweet"),
      original: luckDailyCap("original"),
      matchday: luckDailyCap("matchday"),
    },
    pendingDrafts: pendingDrafts.map((d) => ({
      id: d.id,
      hook: d.hook,
      pillar: d.pillar,
      preview: d.text.slice(0, 120),
      createdAt: d.createdAt,
    })),
    topHooks7d: await getTopHooks7d(3),
  };
}
