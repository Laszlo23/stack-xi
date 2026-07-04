import { Link } from "@tanstack/react-router";
import { Gift, Sparkles } from "lucide-react";
import { ShareActions } from "@/features/story/ShareActions";
import { useSponsoredPrediction } from "@/hooks/use-sponsored-prediction";
import { useSocialConnections } from "@/hooks/use-social-connections";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { getCampaignPostById } from "@/lib/growth/campaign-posts";
import {
  formatBcc,
  SPONSORED_PREDICTION_MAX,
  SPONSORED_STAKE_BCC,
} from "@/lib/base/config";

const CAMPAIGN = getCampaignPostById("founding-sponsor");

export function SponsoredPredictionCampaignBanner({ compact }: { compact?: boolean }) {
  const { address } = useBaseWallet();
  const sponsor = useSponsoredPrediction();
  const social = useSocialConnections(address);

  if (!sponsor.isConfigured || sponsor.remainingSlots <= 0 || !CAMPAIGN) {
    return null;
  }

  const needsSocial = Boolean(address && !sponsor.socialGate.socialEligible);

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-accent/40 bg-accent/5 p-4"
          : "relative overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-primary/5 to-background p-6 sm:p-8"
      }
    >
      {!compact && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
      )}
      <div className="relative space-y-4">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
          <Gift className="h-3.5 w-3.5" />
          Founding sponsor · {sponsor.remainingSlots}/{SPONSORED_PREDICTION_MAX} left
        </div>
        <h3 className="font-display text-2xl font-bold sm:text-3xl">
          {formatBcc(SPONSORED_STAKE_BCC)} prediction — on us
        </h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Verified Farcaster FID or linked X required. One free treasury stake per wallet — BCC goes
          into the prediction pool, not your pocket. Cast, pick, lock onchain.
        </p>

        {needsSocial && (
          <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            Connect socials first:{" "}
            {!social.status.farcaster && !social.status.x && "Farcaster or X"}
            {!social.status.farcaster && social.status.x && "Farcaster (or keep X linked)"}
            {social.status.farcaster && !social.status.x && "you're set via Farcaster"}
            .{" "}
            <Link to="/profile" className="font-semibold text-primary hover:underline">
              Profile → Social connections
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            hash="predict"
            className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
          >
            {sponsor.isEligible ? "Claim sponsored stake →" : "Start predict flow →"}
          </Link>
          {!compact && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Share the campaign below
            </div>
          )}
        </div>

        {!compact && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Campaign copy · {CAMPAIGN.title}
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{CAMPAIGN.text}</p>
            <ShareActions text={CAMPAIGN.text} compact />
          </div>
        )}
      </div>
    </section>
  );
}
