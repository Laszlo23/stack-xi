import { useState } from "react";
import { Check, Copy } from "lucide-react";

function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M5.27 2.55h13.46c.67 0 1.22.55 1.22 1.22v16.46c0 .67-.55 1.22-1.22 1.22H5.27c-.67 0-1.22-.55-1.22-1.22V3.77c0-.67.55-1.22 1.22-1.22zm2.1 3.42v9.86l3.15-2.72 3.15 2.72V5.97H7.37zm9.01 0h-2.1v9.86l2.1 1.81V5.97z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareActions({ text, compact }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copyPost() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareX() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareFarcaster() {
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}>
      <button
        type="button"
        onClick={() => void copyPost()}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={shareX}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
      >
        <XIcon className="h-3.5 w-3.5" />
        Post on X
      </button>
      <button
        type="button"
        onClick={shareFarcaster}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
      >
        <FarcasterIcon className="h-3.5 w-3.5" />
        Cast it
      </button>
    </div>
  );
}

export function SharePostCard({ text, matchLabel }: { text: string; matchLabel: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Share · {matchLabel}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      <ShareActions text={text} />
    </div>
  );
}
