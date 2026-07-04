import { Download, Loader2 } from "lucide-react";
import { MemeShareCard } from "@/features/share/MemeShareCard";
import { useShareCardDownload } from "@/features/share/useShareCardDownload";
import { ShareActions } from "@/features/story/ShareActions";
import { buildWinnerMemeText } from "@/lib/predict/share-unlock";

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
