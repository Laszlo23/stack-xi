import { ExternalLink, Loader2, Check, Ticket } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { SocialConnectionsPanel } from "@/features/profile/SocialConnectionsPanel";
import { RaffleTransparencyPanel } from "@/features/quest/RaffleTransparencyPanel";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useQuestMutations, useQuestProgress } from "@/hooks/use-quest-progress";
import { useRaffleTicket } from "@/hooks/use-raffle-ticket";
import { RAFFLE_PRIZE_BCC } from "@/lib/quest/quest-config";
import { SOCIAL_TARGETS } from "@/lib/growth/social-targets";
import { SOCIAL_LINKS, xReplyUrl, xRetweetUrl } from "@/lib/profile/social-links";
import type { QuestVerifyStep } from "@/lib/growth/social-targets";
import { BASESCAN_URL } from "@/lib/base/config";

type StepKey = "connect" | "follow_x" | "engage_x" | "engage_fc" | "mint";

function stepDone(
  key: StepKey,
  steps: { connect: boolean; followX: boolean; engageX: boolean; engageFc: boolean },
  hasTicket: boolean,
): boolean {
  switch (key) {
    case "connect":
      return steps.connect;
    case "follow_x":
      return steps.followX;
    case "engage_x":
      return steps.engageX;
    case "engage_fc":
      return steps.engageFc;
    case "mint":
      return hasTicket;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function QuestPage() {
  const { t } = useTranslation();
  const { address, hasWalletSession, isWalletSyncing, connectWallet, isConnecting } = useWalletSession();
  const { data, isLoading, refetch } = useQuestProgress(address);
  const { verifyStep, approveMint } = useQuestMutations(address);
  const { mintTicket, isMinting, hasMinted, allowed } = useRaffleTicket(address);
  const [busyStep, setBusyStep] = useState<QuestVerifyStep | "mint" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const steps = data?.progress.steps ?? {
    connect: false,
    followX: false,
    engageX: false,
    engageFc: false,
  };
  const hasTicket = hasMinted || (data?.onchain.ticketBalance ?? 0) > 0;

  async function handleVerify(step: QuestVerifyStep) {
    setBusyStep(step);
    setMessage(null);
    try {
      const result = await verifyStep(step);
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusyStep(null);
    }
  }

  async function handleMint() {
    if (!address) return;
    setBusyStep("mint");
    setMessage(null);
    try {
      if (!data?.mintApproved && !allowed) {
        await approveMint();
      }
      const txHash = await mintTicket();
      setMessage(t("quest.mintSuccess", { tx: txHash.slice(0, 12) }));
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setBusyStep(null);
    }
  }

  const checklist: { key: StepKey; title: string; description: string; actions?: React.ReactNode }[] = [
    {
      key: "connect",
      title: t("quest.steps.connect.title"),
      description: t("quest.steps.connect.description"),
      actions: !hasWalletSession ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          {isConnecting ? t("predict.connecting") : t("quest.steps.connect.cta")}
        </button>
      ) : isWalletSyncing ? (
        <p className="text-sm text-muted-foreground">Restoring wallet session…</p>
      ) : (
        <SocialConnectionsPanel />
      ),
    },
    {
      key: "follow_x",
      title: t("quest.steps.followX.title"),
      description: t("quest.steps.followX.description"),
      actions: (
        <div className="flex flex-wrap gap-2">
          <a
            href={SOCIAL_LINKS.communityX}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50"
          >
            @buildingcultu3 <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            disabled={!steps.connect || busyStep === "follow_x"}
            onClick={() => void handleVerify("follow_x")}
            className="rounded-lg bg-primary/15 px-3 py-2 text-xs font-bold text-primary disabled:opacity-50"
          >
            {busyStep === "follow_x" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("quest.verify")}
          </button>
        </div>
      ),
    },
    {
      key: "engage_x",
      title: t("quest.steps.engageX.title"),
      description: t("quest.steps.engageX.description"),
      actions: (
        <div className="flex flex-wrap gap-2">
          <a
            href={SOCIAL_TARGETS.xMatchdayPost}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            {t("quest.openPost")}
          </a>
          <a
            href={xRetweetUrl(SOCIAL_TARGETS.xTweetId)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            {t("quest.repost")}
          </a>
          <a
            href={xReplyUrl(SOCIAL_TARGETS.xTweetId, "STACK XI culture quest 🐸⚽")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            {t("quest.comment")}
          </a>
          <button
            type="button"
            disabled={!steps.followX || busyStep === "engage_x"}
            onClick={() => void handleVerify("engage_x")}
            className="rounded-lg bg-primary/15 px-3 py-2 text-xs font-bold text-primary disabled:opacity-50"
          >
            {busyStep === "engage_x" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("quest.verify")}
          </button>
        </div>
      ),
    },
    {
      key: "engage_fc",
      title: t("quest.steps.engageFc.title"),
      description: t("quest.steps.engageFc.description"),
      actions: (
        <div className="flex flex-wrap gap-2">
          <a
            href={SOCIAL_TARGETS.farcasterMatchdayCast}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            {t("quest.openCast")}
          </a>
          <button
            type="button"
            disabled={!steps.engageX || busyStep === "engage_fc"}
            onClick={() => void handleVerify("engage_fc")}
            className="rounded-lg bg-primary/15 px-3 py-2 text-xs font-bold text-primary disabled:opacity-50"
          >
            {busyStep === "engage_fc" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("quest.verify")}
          </button>
        </div>
      ),
    },
    {
      key: "mint",
      title: t("quest.steps.mint.title"),
      description: t("quest.steps.mint.description"),
      actions: (
        <button
          type="button"
          disabled={
            !steps.engageFc ||
            hasTicket ||
            busyStep === "mint" ||
            isMinting
          }
          onClick={() => void handleMint()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {busyStep === "mint" || isMinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Ticket className="h-4 w-4" />
          )}
          {hasTicket ? t("quest.ticketMinted") : t("quest.mintTicket")}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {t("quest.eyebrow")}
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold">{t("quest.title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("quest.subtitle", { prize: RAFFLE_PRIZE_BCC.toLocaleString() })}</p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}

      <ol className="space-y-4">
        {checklist.map((item, index) => {
          const done = stepDone(item.key, steps, hasTicket);
          return (
            <li
              key={item.key}
              className={`glass rounded-2xl p-5 ${done ? "border border-primary/30" : "border border-border/50"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${
                    done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  {item.actions && <div className="mt-4">{item.actions}</div>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {message && (
        <p className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {hasTicket && data?.progress.ticketTxHash && (
        <p className="text-sm text-primary">
          <a
            href={`${BASESCAN_URL}/tx/${data.progress.ticketTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {t("quest.viewTicketTx")} →
          </a>
        </p>
      )}

      <RaffleTransparencyPanel />

      <p className="text-sm text-muted-foreground">
        <Link to="/profile" className="text-primary hover:underline">
          {t("quest.profileLink")}
        </Link>
      </p>
    </div>
  );
}
