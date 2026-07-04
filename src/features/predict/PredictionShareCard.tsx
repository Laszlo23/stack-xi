import { useState } from "react";
import { Download, Loader2, Send } from "lucide-react";
import { MemeShareCard } from "@/features/share/MemeShareCard";
import { useShareCardDownload } from "@/features/share/useShareCardDownload";
import { ShareActions } from "@/features/story/ShareActions";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { useTelegramSessionOptional } from "@/hooks/use-telegram-session";
import { buildWinnerMemeText } from "@/lib/predict/share-unlock";
import { shareViaTelegram } from "@/lib/telegram/share";

export function PredictionShareCard({
  home,
  away,
  pick,
  stakeLabel,
  pepeSrc = "/pepeheadball.jpg",
  onPngDownloaded,
}: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
  pepeSrc?: string;
  onPngDownloaded?: () => void;
}) {
  const shareText = buildWinnerMemeText({ home, away, pick, stakeLabel });
  const { cardRef, download, exporting, error } = useShareCardDownload();
  const telegram = useTelegramSessionOptional();
  const memberTasks = useMemberTasksOptional();
  const [sharing, setSharing] = useState(false);

  async function shareToTelegram() {
    if (!telegram?.initData) return;
    setSharing(true);
    try {
      const sent = await shareViaTelegram({
        initData: telegram.initData,
        shareType: "prediction",
        text: shareText,
      });
      if (sent) {
        memberTasks?.completeTask("share_telegram_matchday");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="prediction-meme-card relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-1 shadow-[0_0_48px_oklch(0.88_0.28_145/0.2)]">
        <div className="relative overflow-hidden rounded-xl bg-background/80 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />

          <MemeShareCard
            ref={cardRef}
            home={home}
            away={away}
            pick={pick}
            stakeLabel={stakeLabel}
            pepeSrc={pepeSrc}
          />

          <div className="mt-4 border-t border-border/40 pt-4">
            <ShareActions text={shareText} />
            {telegram?.isTelegram && (
              <button
                type="button"
                disabled={sharing}
                onClick={() => void shareToTelegram()}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300 disabled:opacity-60"
              >
                {sharing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Share on Telegram
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void download(`prediction-${pick}`, onPngDownloaded)}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Rendering PNG…" : "Download PNG for X"}
        </button>
        <span className="text-xs text-muted-foreground">
          Screenshot-free meme card · attach when posting on X
        </span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
