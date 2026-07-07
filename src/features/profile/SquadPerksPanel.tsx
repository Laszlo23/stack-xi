import { Copy, Gift, Target } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useSquadPerks } from "@/hooks/use-squad-perks";
import { formatBoostPercent } from "@/lib/squad/perk-tiers";
import { merchStoreUrl } from "@/lib/squad/merch-codes";

export function SquadPerksPanel() {
  const { t } = useTranslation();
  const { address } = useWalletSession();
  const { perks, merchCode, jokerBalance, isLoading } = useSquadPerks(address);
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  if (isLoading) {
    return (
      <section className="glass rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">{t("squad.perksLoading")}</p>
      </section>
    );
  }

  if (perks.tierId === "none") {
    return (
      <section className="glass rounded-2xl p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">{t("squad.perksTitle")}</div>
        <p className="mt-2 text-sm text-muted-foreground">{t("squad.perksEmpty")}</p>
      </section>
    );
  }

  async function copyMerchCode() {
    if (!merchCode) return;
    await navigator.clipboard.writeText(merchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-5">
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Gift className="h-4 w-4" />
          {t("squad.perksActive")}
        </div>
        <h3 className="mt-1 font-display text-xl font-bold">{perks.tierLabel}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 p-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Predictions
          </div>
          <div className="mt-1 font-display text-lg font-bold text-primary">
            {formatBoostPercent(perks.predictionBoostBps)}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Applied when you claim winnings</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">Merch</div>
          <div className="mt-1 font-display text-lg font-bold text-primary">
            {perks.merchDiscountPercent}% off
          </div>
          {merchCode ? (
            <button
              type="button"
              onClick={() => void copyMerchCode()}
              className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : merchCode}
            </button>
          ) : null}
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">Culture XP</div>
          <div className="mt-1 font-display text-lg font-bold text-primary">
            ×{perks.cultureXpMultiplier.toFixed(2)}
          </div>
          {jokerBalance > 0n ? (
            <p className="mt-1 text-[11px] text-primary">🃏 {jokerBalance.toString()} joker(s)</p>
          ) : null}
        </div>
      </div>

      <ul className="space-y-1 text-xs text-muted-foreground">
        {perks.activePerks.map((perk) => (
          <li key={perk}>· {perk}</li>
        ))}
      </ul>

      <a
        href={merchStoreUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
      >
        Open merch store →
      </a>
    </section>
  );
}
