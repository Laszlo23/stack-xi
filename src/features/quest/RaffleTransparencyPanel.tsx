import { ExternalLink, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRaffleStatus } from "@/hooks/use-raffle-status";
import { BASESCAN_URL } from "@/lib/base/config";
import { formatUnits } from "viem";

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function RaffleTransparencyPanel() {
  const { t } = useTranslation();
  const { data, isLoading } = useRaffleStatus();

  if (isLoading && !data) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  const raffle = data?.raffle;
  const entries = data?.entries ?? [];
  const prizeBcc = data?.prizeBcc ?? 7_777_777;
  const poolBcc = raffle?.prizePoolWei
    ? Number(formatUnits(BigInt(raffle.prizePoolWei), 18))
    : 0;

  return (
    <section className="glass-neon rounded-2xl border border-primary/25 p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
        <Trophy className="h-3.5 w-3.5" />
        {t("quest.raffle.eyebrow")}
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold">{t("quest.raffle.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("quest.raffle.howItWorks")}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <dt className="text-xs uppercase text-muted-foreground">{t("quest.raffle.prize")}</dt>
          <dd className="mt-1 font-display text-2xl font-bold text-primary">
            {prizeBcc.toLocaleString()} BCC
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            {t("quest.raffle.poolFunded")}: {poolBcc.toLocaleString(undefined, { maximumFractionDigits: 0 })} BCC
          </dd>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <dt className="text-xs uppercase text-muted-foreground">{t("quest.raffle.tickets")}</dt>
          <dd className="mt-1 font-display text-2xl font-bold">{raffle?.totalMinted ?? 0}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            {t("quest.raffle.deadline")}: {data?.drawDeadline ? formatDeadline(data.drawDeadline) : "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <dt className="text-xs uppercase text-muted-foreground">{t("quest.raffle.phase")}</dt>
          <dd className="mt-1 font-mono text-sm uppercase text-primary">{raffle?.phase ?? "unconfigured"}</dd>
        </div>
        {raffle?.winner && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
            <dt className="text-xs uppercase text-muted-foreground">{t("quest.raffle.winner")}</dt>
            <dd className="mt-1 font-mono text-sm break-all">{raffle.winner}</dd>
            {raffle.winnerTokenId != null && (
              <dd className="mt-1 text-xs text-muted-foreground">
                {t("quest.raffle.ticketId")} #{raffle.winnerTokenId}
              </dd>
            )}
          </div>
        )}
      </dl>

      {raffle?.drawCommit && (
        <p className="mt-4 break-all font-mono text-[10px] text-muted-foreground">
          {t("quest.raffle.commit")}: {raffle.drawCommit}
        </p>
      )}

      {raffle?.closeBlock && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          {t("quest.raffle.closeBlock")}: {raffle.closeBlock}
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{t("quest.raffle.formula")}</p>

      {raffle?.contractAddress && (
        <a
          href={`${BASESCAN_URL}/address/${raffle.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {t("quest.raffle.contract")} <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {entries.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display font-bold">{t("quest.raffle.entryList")}</h3>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto font-mono text-[10px] text-muted-foreground">
            {entries.map((e) => (
              <li key={e.tokenId}>
                #{e.tokenId} · {e.holder.slice(0, 8)}… ·{" "}
                <a
                  href={`${BASESCAN_URL}/tx/${e.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  tx
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
