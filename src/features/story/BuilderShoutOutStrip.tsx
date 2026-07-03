import { FC_BUILDERS } from "@/lib/story/farcaster-builders";

export function BuilderShoutOutStrip() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
        Builder love · Farcaster edition
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        This story exists because people shipped in public and replied with heart. Shout-out roll
        call:
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {FC_BUILDERS.map((b) => (
          <span
            key={b.handle}
            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs text-primary"
            title={b.note}
          >
            {b.handle}
          </span>
        ))}
      </div>
    </div>
  );
}
