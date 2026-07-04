import type { TwitterApi } from "twitter-api-v2";

import type { LuckOutcome, LuckOutcomeMetrics } from "@/lib/server/luck-agent-storage";
import { listOutcomes, updateOutcomeMetrics } from "@/lib/server/luck-agent-storage";
import { fetchTweetMetrics } from "@/server/x/post-tweet";

export function computeRewardScore(metrics: LuckOutcomeMetrics): number {
  const impressions = metrics.impressions ?? 0;
  const engagement = metrics.likes * 3 + metrics.retweets * 5 + metrics.replies * 4;
  if (impressions > 0) {
    return Math.round((engagement / impressions) * 1000 + engagement);
  }
  return engagement;
}

export async function pollOutcomeMetrics(
  client: TwitterApi,
  outcomes: LuckOutcome[],
): Promise<number> {
  let updated = 0;
  const cutoff = Date.now() - 7 * 86400000;

  for (const outcome of outcomes) {
    if (new Date(outcome.publishedAt).getTime() < cutoff) continue;
    if (outcome.metrics && Date.now() - new Date(outcome.metrics.polledAt).getTime() < 3600000) {
      continue;
    }

    const metricsRaw = await fetchTweetMetrics(client, outcome.tweetId);
    if (!metricsRaw) continue;

    const metrics: LuckOutcomeMetrics = {
      ...metricsRaw,
      polledAt: new Date().toISOString(),
    };
    const rewardScore = computeRewardScore(metrics);
    await updateOutcomeMetrics(outcome.tweetId, metrics, rewardScore);
    updated += 1;
  }

  return updated;
}

export async function getAverageRewardScore7d(now = new Date()): Promise<number | null> {
  const since = new Date(now.getTime() - 7 * 86400000);
  const outcomes = await listOutcomes(since);
  const scores = outcomes
    .map((o) => o.rewardScore)
    .filter((s): s is number => s != null && Number.isFinite(s));
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export async function getTopHooks7d(limit = 3): Promise<{ hook: string; score: number }[]> {
  const since = new Date(Date.now() - 7 * 86400000);
  const outcomes = await listOutcomes(since);
  const byHook = new Map<string, number[]>();

  for (const outcome of outcomes) {
    if (outcome.rewardScore == null) continue;
    const list = byHook.get(outcome.hook) ?? [];
    list.push(outcome.rewardScore);
    byHook.set(outcome.hook, list);
  }

  return [...byHook.entries()]
    .map(([hook, scores]) => ({
      hook,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
