import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { SectionHead } from "@/components/layout/SectionHead";
import { DeFiLayerBackground } from "./DeFiLayerBackground";
import { PredictToEarnBlock } from "./PredictToEarnBlock";
import { BondingCurveBlock } from "./BondingCurveBlock";
import { SquadPositionsBlock } from "./SquadPositionsBlock";
import { LuckRewardsBlock } from "./LuckRewardsBlock";
import { TreasuryFlowBlock } from "./TreasuryFlowBlock";
import { DeFiFinalCta } from "./DeFiFinalCta";

export function DeFiLayerPage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-border/40 py-16 sm:py-24">
        <DeFiLayerBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Onchain game layer"
            title={
              <>
                STACK XI <span className="text-gradient">DeFi Layer</span>
              </>
            }
            sub="Where prediction, liquidity, and BCC culture merge onchain."
          />
          <div className="mt-6">
            <BccTokenChip />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 sm:py-24">
        <PredictToEarnBlock />
        <BondingCurveBlock />
        <SquadPositionsBlock />
        <LuckRewardsBlock />
        <TreasuryFlowBlock />
      </div>

      <DeFiFinalCta />
    </div>
  );
}
