import type { PepeBeat } from "@/lib/story/pepe-script";

export function PepeBubble({
  beat,
  large,
  luckMeter,
}: {
  beat: PepeBeat;
  large?: boolean;
  luckMeter?: number;
}) {
  const meter = luckMeter ?? (beat.id === "switch" || beat.id === "after" ? 88 : 62);

  return (
    <div className="flex gap-4">
      <div
        className={`grid shrink-0 place-items-center rounded-2xl bg-primary/15 font-display ${large ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl"}`}
        aria-hidden
      >
        🐸
      </div>
      <div className="glass-neon min-w-0 flex-1 rounded-2xl rounded-tl-sm px-5 py-4">
        <p className={`leading-relaxed ${large ? "text-lg sm:text-xl" : "text-base"}`}>
          {beat.line}
        </p>
        {beat.sub && <p className="mt-2 text-sm text-muted-foreground italic">{beat.sub}</p>}
        {luckMeter !== undefined || beat.id === "switch" || beat.id === "after" ? (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Luck meter</span>
              <span className="text-primary">{meter}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
                style={{ width: `${meter}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
