import { Check, Copy, ExternalLink, Send } from "lucide-react";
import { useState } from "react";
import { warpcastComposeUrl } from "@/lib/farcaster/cast-templates";

type FarcasterCastAssistantProps = {
  castText: string;
  title?: string;
  txHash?: string;
  enableAutoPost?: boolean;
};

export function FarcasterCastAssistant({
  castText,
  title = "Farcaster cast assistant",
  txHash,
  enableAutoPost = false,
}: FarcasterCastAssistantProps) {
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  async function copyCast() {
    await navigator.clipboard.writeText(castText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function tryAutoPost() {
    if (!enableAutoPost) return;
    setPosting(true);
    setPostError(null);
    try {
      const response = await fetch("/api/farcaster/cast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: castText }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Post failed");
      }
      setPosted(true);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Auto-post unavailable");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {castText}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyCast()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy cast"}
        </button>
        <a
          href={warpcastComposeUrl(castText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:text-primary"
        >
          Open Warpcast
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {enableAutoPost && (
          <button
            type="button"
            onClick={() => void tryAutoPost()}
            disabled={posting || posted}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {posted ? "Posted" : posting ? "Posting…" : "Auto-post (Neynar)"}
          </button>
        )}
      </div>
      {postError && <p className="mt-2 text-xs text-destructive">{postError}</p>}
      {txHash && <p className="mt-2 font-mono text-[10px] text-muted-foreground">tx: {txHash}</p>}
    </div>
  );
}
