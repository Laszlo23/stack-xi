import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeBubble } from "@/features/story/PepeBubble";
import { StacksWalletChip } from "@/features/wallet/StacksWalletChip";

const FINALS_BEATS = [
  {
    id: "bridge",
    line: "You minted on Base. You predicted in BCC. France is the arc now — Leonardo's pick to win Jul 19 before the Bitcoin finals on Stacks.",
    sub: "Semifinal + Final mint lands on Stacks — sBTC, culture, chaos.",
  },
  {
    id: "og",
    line: "Base OGs get first access. Pepe doesn't chase whitelist spots. Luck forwards the email.",
  },
];

export function StacksFinalsTeaser() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-16 sm:px-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Reserved path · Finals only
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Bitcoin finals on Stacks
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dallas matchdays run on Base. When the semifinal hits Dallas, the story bridges to Stacks
          and sBTC for the Bitcoin finals mint.
        </p>
      </div>

      {FINALS_BEATS.map((beat) => (
        <PepeBubble key={beat.id} beat={beat} large={beat.id === "bridge"} luckMeter={78} />
      ))}

      <div className="glass-neon rounded-2xl p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Connect for finals waitlist
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Stacks wallet required for the finals mint path. Base squad minters with early believer
          flags get priority.
        </p>
        <div className="mt-4">
          <StacksWalletChip />
        </div>
      </div>

      <Link
        to="/"
        className="inline-flex rounded-xl border border-primary/40 px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/10"
      >
        ← Back to Base matchdays
      </Link>
    </div>
  );
}

export function FinalsPage() {
  return (
    <PageShell>
      <StacksFinalsTeaser />
    </PageShell>
  );
}
