import { BccExchangePanel } from "@/features/swap/BccExchangePanel";

/** @deprecated Use BccExchangePanel */
export function BccSwapPanel(props: { compact?: boolean }) {
  return <BccExchangePanel compact={props.compact} />;
}
