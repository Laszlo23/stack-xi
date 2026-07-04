import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Check,
  ExternalLink,
  Link2,
  Loader2,
  MessageCircle,
  Send,
  Share2,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import type { MemberTaskId } from "@/domain/types";
import { CampaignSharePanel } from "@/features/growth/CampaignSharePanel";
import { AirdropAnnouncementBanner } from "@/features/growth/AirdropAnnouncementBanner";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { MEMBER_TASKS, useMemberTasks } from "@/hooks/use-member-tasks";
import { verifySocialTaskApi } from "@/hooks/use-social-connections";
import { getDailyCampaignPost } from "@/lib/growth/campaign-posts";
import { SOCIAL_TARGETS } from "@/lib/growth/social-targets";
import { telegramBotUrl, telegramReferralUrl } from "@/lib/telegram/bot-config";
import { TOTAL_MEMBER_XP } from "@/lib/profile/member-tasks";
import {
  DEFAULT_POST_COPY,
  SOCIAL_LINKS,
  farcasterComposeUrl,
  xComposeUrl,
  xReplyUrl,
  xRetweetUrl,
} from "@/lib/profile/social-links";

const TASK_ICONS: Record<MemberTaskId, typeof CalendarCheck> = {
  daily_login: CalendarCheck,
  connect_x: Link2,
  connect_farcaster: Link2,
  connect_telegram: Send,
  open_telegram_game: Send,
  invite_telegram_friend: Send,
  share_telegram_matchday: Share2,
  engage_x_post: Share2,
  comment_x_post: MessageCircle,
  engage_farcaster_cast: Share2,
  comment_farcaster_cast: MessageCircle,
  share_campaign: Share2,
  like_share_x: Share2,
  make_post: MessageCircle,
  follow_farcaster: UserPlus,
  mint_squad: Trophy,
  submit_prediction: Target,
};

type TaskAction =
  | { kind: "hash"; hash: string; label: string }
  | { kind: "route"; to: "/profile" | "/"; label: string; search?: { tab?: string } }
  | { kind: "external"; url: string; label: string }
  | { kind: "compose"; url: string; label: string };

function getTaskActions(taskId: MemberTaskId, address?: string): TaskAction[] {
  const campaignText = getDailyCampaignPost().text;

  switch (taskId) {
    case "connect_x":
    case "connect_farcaster":
      return [{ kind: "route", to: "/profile", label: "Connect in profile" }];
    case "connect_telegram":
      return telegramBotUrl("play")
        ? [{ kind: "external", url: telegramBotUrl("play")!, label: "Open in Telegram" }]
        : [];
    case "share_telegram_matchday":
      return telegramBotUrl("play")
        ? [{ kind: "external", url: telegramBotUrl("play")!, label: "Share in Telegram" }]
        : [];
    case "engage_x_post":
      return [
        { kind: "external", url: SOCIAL_LINKS.xTargetPost, label: "Open post" },
        { kind: "external", url: xRetweetUrl(SOCIAL_TARGETS.xTweetId), label: "Repost" },
        {
          kind: "compose",
          url: xReplyUrl(SOCIAL_TARGETS.xTweetId, "Let Luck decide 🐸⚽"),
          label: "Reply",
        },
      ];
    case "comment_x_post":
      return [
        { kind: "external", url: SOCIAL_LINKS.xTargetPost, label: "Open post" },
        {
          kind: "compose",
          url: xReplyUrl(SOCIAL_TARGETS.xTweetId, "Locked in on STACK XI 🐸"),
          label: "Comment",
        },
      ];
    case "engage_farcaster_cast":
      return [
        { kind: "external", url: SOCIAL_LINKS.farcasterTargetCast, label: "Open cast" },
        {
          kind: "compose",
          url: farcasterComposeUrl("Recasting matchday energy 🐸⚽"),
          label: "Recast reply",
        },
      ];
    case "comment_farcaster_cast":
      return [
        { kind: "external", url: SOCIAL_LINKS.farcasterTargetCast, label: "Open cast" },
        {
          kind: "compose",
          url: farcasterComposeUrl("Let Luck decide on STACK XI 🐸"),
          label: "Comment",
        },
      ];
    case "share_campaign":
      return [
        { kind: "compose", url: xComposeUrl(campaignText), label: "Post on X" },
        { kind: "compose", url: farcasterComposeUrl(campaignText), label: "Cast it" },
      ];
    case "like_share_x":
      return [
        { kind: "external", url: SOCIAL_LINKS.xTargetPost, label: "Open post" },
        { kind: "external", url: xRetweetUrl(SOCIAL_TARGETS.xTweetId), label: "Repost" },
      ];
    case "make_post":
      return [
        { kind: "compose", url: xComposeUrl(DEFAULT_POST_COPY), label: "Post on X" },
        { kind: "compose", url: farcasterComposeUrl(DEFAULT_POST_COPY), label: "Cast it" },
      ];
    case "follow_farcaster":
      return [{ kind: "external", url: SOCIAL_LINKS.farcasterFollow, label: "Follow" }];
    case "open_telegram_game":
      return telegramBotUrl("play")
        ? [{ kind: "external", url: telegramBotUrl("play")!, label: "Open in Telegram" }]
        : [];
    case "invite_telegram_friend":
      return address && telegramReferralUrl(address)
        ? [{ kind: "external", url: telegramReferralUrl(address), label: "Open invite link" }]
        : telegramBotUrl("play")
          ? [{ kind: "external", url: telegramBotUrl("play")!, label: "Open bot" }]
          : [];
    case "mint_squad":
      return [{ kind: "hash", hash: "squad", label: "Open mint" }];
    case "submit_prediction":
      return [{ kind: "hash", hash: "predict", label: "Open predict" }];
    default:
      return [];
  }
}

function verificationLabel(mode: (typeof MEMBER_TASKS)[number]["verification"]): string {
  switch (mode) {
    case "auto":
      return "Auto-verified";
    case "honor":
      return "Honor system";
    case "social":
      return "API + honor fallback";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function TaskCard({ taskId, locked }: { taskId: MemberTaskId; locked?: boolean }) {
  const task = MEMBER_TASKS.find((t) => t.id === taskId)!;
  const { address } = useBaseWallet();
  const { isTaskComplete, completeTask } = useMemberTasks();
  const done = isTaskComplete(taskId);
  const Icon = TASK_ICONS[taskId];
  const actions = getTaskActions(taskId, address);
  const [verifying, setVerifying] = useState(false);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  async function handleVerify() {
    if (!address) return;
    setVerifying(true);
    setVerifyNote(null);
    try {
      const result = await verifySocialTaskApi(address, taskId);
      setVerifyNote(result.message);
      if (result.verified) completeTask(taskId);
    } catch (err) {
      setVerifyNote(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        done
          ? "border-primary/40 bg-primary/5"
          : locked
            ? "border-border/40 bg-muted/20 opacity-70"
            : "glass border-border/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          <div>
            <div className="font-display font-bold">{task.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
            <div className="mt-2 font-mono text-[10px] uppercase text-primary">
              +{task.points} XP · {verificationLabel(task.verification)}
            </div>
          </div>
        </div>
        {done && (
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
            Done
          </span>
        )}
      </div>

      {!locked && !done && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {actions.map((action) =>
              action.kind === "hash" ? (
                <Link
                  key={action.hash}
                  to="/"
                  hash={action.hash}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : action.kind === "route" ? (
                <Link
                  key={action.label}
                  to={action.to}
                  search={action.search}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <a
                  key={action.url}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ),
            )}
            {task.verification === "social" && (
              <button
                type="button"
                disabled={verifying || !address}
                onClick={() => void handleVerify()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50 hover:text-primary disabled:opacity-60"
              >
                {verifying && <Loader2 className="h-3 w-3 animate-spin" />}
                Verify
              </button>
            )}
            {(task.verification === "honor" || task.verification === "social") && (
              <button
                type="button"
                onClick={() => completeTask(taskId)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                Mark done
              </button>
            )}
          </div>
          {verifyNote && <p className="text-xs text-muted-foreground">{verifyNote}</p>}
        </div>
      )}
    </div>
  );
}

export function MemberTasksPanel({ locked }: { locked?: boolean }) {
  const { progress } = useMemberTasks();
  const xpPercent = Math.min(100, Math.round((progress.totalXp / TOTAL_MEMBER_XP) * 100));

  return (
    <section className="space-y-6">
      <AirdropAnnouncementBanner compact />

      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Social missions
        </div>
        <h2 className="font-display text-2xl font-bold">Culture tasks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete missions for XP and airdrop weight. Connect X + Farcaster for API verification.
        </p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex justify-between font-mono text-xs">
          <span className="text-muted-foreground">
            {progress.completedTaskIds.length}/{MEMBER_TASKS.length} complete
          </span>
          <span className="text-primary">
            {progress.totalXp}/{TOTAL_MEMBER_XP} XP
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      <CampaignSharePanel compact />

      <div className="space-y-3">
        {MEMBER_TASKS.map((task) => (
          <TaskCard key={task.id} taskId={task.id} locked={locked} />
        ))}
      </div>

      {!locked && progress.predictionTxIds.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">
            Recent predictions
          </div>
          <ul className="mt-2 space-y-1 font-mono text-xs text-primary">
            {progress.predictionTxIds
              .slice(-3)
              .reverse()
              .map((tx) => (
                <li key={tx}>
                  <a
                    href={`https://basescan.org/tx/${tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {tx.slice(0, 10)}…{tx.slice(-8)}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function MemberTasksPreview() {
  return (
    <section className="space-y-4 opacity-80">
      <AirdropAnnouncementBanner compact />
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Preview · locked
        </div>
        <h2 className="font-display text-2xl font-bold">Culture tasks</h2>
      </div>
      <div className="space-y-3">
        {MEMBER_TASKS.map((task) => (
          <div key={task.id} className="rounded-2xl border border-border/40 bg-muted/10 p-4">
            <div className="font-display font-bold">{task.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
            <div className="mt-2 font-mono text-[10px] text-primary">+{task.points} XP</div>
          </div>
        ))}
      </div>
    </section>
  );
}
