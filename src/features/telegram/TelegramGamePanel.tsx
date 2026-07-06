import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Share2, Users } from "lucide-react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useTelegramSession } from "@/hooks/use-telegram-session";
import { getDailyCampaignPost } from "@/lib/growth/campaign-posts";
import { telegramBotUrl, telegramReferralUrl } from "@/lib/telegram/bot-config";
import { shareViaTelegram } from "@/lib/telegram/share";

export function TelegramGamePanel() {
  const { user, initData, startParam, isTelegram, error } = useTelegramSession();
  const { address } = useBaseWallet();
  const { completeTask, isTaskComplete } = useMemberTasks();
  const [shareNote, setShareNote] = useState<string | null>(null);

  const referralUrl = useMemo(
    () => (address ? telegramReferralUrl(address) : telegramBotUrl("play")),
    [address],
  );

  const campaignText = useMemo(() => getDailyCampaignPost().text, []);

  useEffect(() => {
    if (startParam?.startsWith("ref_") && typeof window !== "undefined") {
      sessionStorage.setItem("stackxi:tg-ref", startParam);
    }
  }, [startParam]);

  if (!isTelegram) return null;

  const username = user?.username;

  async function shareInvite() {
    if (!initData) return;
    const text = `🐸 STACK XI matchday on Base — predict with BCC, mint the squad, 77M BCC airdrop for culture players.\n${referralUrl}`;
    try {
      const sent = await shareViaTelegram({
        initData,
        shareType: "invite",
        text,
        buttonUrl: referralUrl,
      });
      if (sent) {
        setShareNote("Invite shared — pick a chat to send.");
        completeTask("invite_telegram_friend");
        completeTask("share_telegram_matchday");
      } else {
        setShareNote("Share opened — confirm in Telegram.");
      }
    } catch {
      setShareNote("Share cancelled.");
    }
  }

  async function shareCampaign() {
    if (!initData) return;
    try {
      const sent = await shareViaTelegram({
        initData,
        shareType: "campaign",
        text: campaignText,
      });
      if (sent) {
        setShareNote("Campaign shared to Telegram.");
        completeTask("share_telegram_matchday");
      }
    } catch {
      setShareNote("Share cancelled.");
    }
  }

  return (
    <section className="glass rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 space-y-4">
      <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-sky-400">
        <Send className="h-3.5 w-3.5" />
        Telegram matchday
      </div>
      <h3 className="font-display text-xl font-bold">
        {username ? `@${username}, Luck loaded` : "Pepe loaded in Telegram"}
      </h3>
      <p className="text-sm text-muted-foreground">
        Viral loop: open → predict → share your pick → invite friends. Referrals boost airdrop
        weight.
      </p>
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Session error: {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          to="/"
          hash="predict"
          className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
        >
          Lock today&apos;s pick
        </Link>
        <button
          type="button"
          onClick={() => void shareInvite()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300"
        >
          <Users className="h-3.5 w-3.5" />
          Invite friends
        </button>
        <button
          type="button"
          onClick={() => void shareCampaign()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share campaign
        </button>
      </div>

      {shareNote && <p className="text-xs text-muted-foreground">{shareNote}</p>}
      {isTaskComplete("invite_telegram_friend") && (
        <p className="text-xs text-primary">Invite mission complete — +25 XP</p>
      )}
    </section>
  );
}
