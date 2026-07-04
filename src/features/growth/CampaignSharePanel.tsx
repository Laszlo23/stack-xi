import { useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Send, Share2 } from "lucide-react";
import { ShareActions } from "@/features/story/ShareActions";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { useTelegramSessionOptional } from "@/hooks/use-telegram-session";
import {
  CAMPAIGN_POSTS,
  getDailyCampaignPost,
  type CampaignPost,
} from "@/lib/growth/campaign-posts";
import { shareViaTelegram } from "@/lib/telegram/share";

export function CampaignSharePanel({ compact }: { compact?: boolean }) {
  const dailyPost = useMemo(() => getDailyCampaignPost(), []);
  const [activePost, setActivePost] = useState<CampaignPost>(dailyPost);
  const [copied, setCopied] = useState(false);
  const [tgNote, setTgNote] = useState<string | null>(null);
  const telegram = useTelegramSessionOptional();
  const memberTasks = useMemberTasksOptional();

  function rotatePost() {
    const currentIndex = CAMPAIGN_POSTS.findIndex((p) => p.id === activePost.id);
    const next = CAMPAIGN_POSTS[(currentIndex + 1) % CAMPAIGN_POSTS.length]!;
    setActivePost(next);
  }

  async function copyPost() {
    await navigator.clipboard.writeText(activePost.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareToTelegram() {
    if (!telegram?.initData) return;
    try {
      const sent = await shareViaTelegram({
        initData: telegram.initData,
        shareType: "campaign",
        text: activePost.text,
        title: activePost.title,
      });
      if (sent) {
        setTgNote("Shared to Telegram");
        memberTasks?.completeTask("share_telegram_matchday");
      }
    } catch {
      setTgNote("Share cancelled");
    }
  }

  return (
    <section className={compact ? "space-y-4" : "glass rounded-2xl p-6 sm:p-8 space-y-5"}>
      {!compact && (
        <>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Share2 className="h-3.5 w-3.5" />
            Growth campaign
          </div>
          <h3 className="font-display text-2xl font-bold">Share the culture</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            Rotating Pepe posts with site URL + builder tags. Copy, cast, or post on X — every
            share grows the pool.
          </p>
        </>
      )}

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Today&apos;s campaign · {activePost.title}
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {activePost.text}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyPost()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50 hover:text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy post"}
        </button>
        <button
          type="button"
          onClick={rotatePost}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50 hover:text-primary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Next post
        </button>
        {telegram?.isTelegram && (
          <button
            type="button"
            onClick={() => void shareToTelegram()}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300"
          >
            <Send className="h-3.5 w-3.5" />
            Share on Telegram
          </button>
        )}
      </div>

      {tgNote && <p className="text-xs text-muted-foreground">{tgNote}</p>}

      <ShareActions text={activePost.text} compact />
    </section>
  );
}
