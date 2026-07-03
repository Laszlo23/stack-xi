import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Check,
  ExternalLink,
  MessageCircle,
  Share2,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";
import type { MemberTaskId } from "@/domain/types";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { MEMBER_TASKS, useMemberTasks } from "@/hooks/use-member-tasks";
import { TOTAL_MEMBER_XP } from "@/lib/profile/member-tasks";
import {
  DEFAULT_POST_COPY,
  SOCIAL_LINKS,
  farcasterComposeUrl,
  xComposeUrl,
} from "@/lib/profile/social-links";

const TASK_ICONS: Record<MemberTaskId, typeof CalendarCheck> = {
  daily_login: CalendarCheck,
  like_share_x: Share2,
  make_post: MessageCircle,
  follow_farcaster: UserPlus,
  mint_squad: Trophy,
  submit_prediction: Target,
};

function getTaskAction(
  taskId: MemberTaskId,
): { kind: "hash"; hash: string } | { kind: "external"; url: string } | null {
  switch (taskId) {
    case "like_share_x":
      return { kind: "external", url: SOCIAL_LINKS.xTargetPost };
    case "make_post":
      return { kind: "external", url: xComposeUrl(DEFAULT_POST_COPY) };
    case "follow_farcaster":
      return { kind: "external", url: SOCIAL_LINKS.farcasterFollow };
    case "mint_squad":
      return { kind: "hash", hash: "squad" };
    case "submit_prediction":
      return { kind: "hash", hash: "predict" };
    default:
      return null;
  }
}

function TaskCard({ taskId, locked }: { taskId: MemberTaskId; locked?: boolean }) {
  const task = MEMBER_TASKS.find((t) => t.id === taskId)!;
  const { isTaskComplete, completeTask } = useMemberTasks();
  const done = isTaskComplete(taskId);
  const Icon = TASK_ICONS[taskId];
  const action = getTaskAction(taskId);

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
              +{task.points} XP · {task.verification === "auto" ? "Auto-verified" : "Honor system"}
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
        <div className="mt-4 flex flex-wrap gap-2">
          {action?.kind === "hash" && (
            <Link
              to="/"
              hash={action.hash}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Open task
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          {action?.kind === "external" && (
            <a
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Open task
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {task.verification === "honor" && (
            <button
              type="button"
              onClick={() => completeTask(taskId)}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary"
            >
              Mark done
            </button>
          )}
          {taskId === "make_post" && (
            <a
              href={farcasterComposeUrl(DEFAULT_POST_COPY)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Cast it
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function MemberTasksPanel({ locked }: { locked?: boolean }) {
  const { progress } = useMemberTasks();
  const xpPercent = Math.round((progress.totalXp / TOTAL_MEMBER_XP) * 100);

  return (
    <section className="space-y-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Social missions
        </div>
        <h2 className="font-display text-2xl font-bold">Culture tasks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete missions for XP. Social tasks use honor system — we trust you, fam.
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
