import { useEffect, useState } from "react";
import { getCrowdSplit, type CrowdSplit } from "@/lib/predict/crowd-pressure";

export function CrowdPressureBar({ matchId }: { matchId: string }) {
  const [crowd, setCrowd] = useState<CrowdSplit>(() => getCrowdSplit(matchId));

  useEffect(() => {
    const interval = setInterval(() => {
      const jitter = Math.round(Math.sin(Date.now() / 4000) * 3);
      setCrowd(getCrowdSplit(matchId, jitter));
    }, 3200);
    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <div className="mt-6 rounded-xl border border-border/50 bg-background/40 p-4">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-muted-foreground">Crowd pressure</span>
        <span className="animate-pulse text-primary">Market moving in real time</span>
      </div>

      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
          style={{ width: `${crowd.home}%` }}
        />
        <div
          className="bg-gradient-to-r from-accent/60 to-accent transition-all duration-700"
          style={{ width: `${crowd.away}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between font-mono text-xs">
        <span className="text-primary">{crowd.home}% home side</span>
        <span className="text-accent">{crowd.away}% away side</span>
      </div>

      <p className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-center text-sm text-primary">
        Crowd is usually wrong. That&apos;s the edge.
      </p>
    </div>
  );
}
