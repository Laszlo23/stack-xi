export const LEGAL_LAST_UPDATED = "July 3, 2026";

export const LEGAL_CONTACT_EMAIL = "hello@buildingcultureid.space";

export const PRIVACY_SECTIONS = [
  {
    title: "What we collect",
    body: "When you connect a wallet, we read your public on-chain address and contract interactions (NFT mints, BCC predictions). Culture task progress (XP, streaks) is stored locally in your browser keyed to your wallet address — not on our servers in v1.",
  },
  {
    title: "What we do not collect",
    body: "We never ask for your private keys or seed phrase. Private keys stay in your wallet. We do not sell personal data.",
  },
  {
    title: "Third parties",
    body: "Blockchain transactions are public on Base. Wallet providers (e.g. Coinbase Wallet, browser extensions) and RPC providers (e.g. Alchemy) process requests under their own policies. Social task links open X and Farcaster on their platforms.",
  },
  {
    title: "Local storage",
    body: "You can clear culture mission progress by clearing site data in your browser. On-chain NFT ownership and prediction history remain on Base.",
  },
  {
    title: "Contact",
    body: `Questions: ${LEGAL_CONTACT_EMAIL}`,
  },
] as const;

export const TERMS_SECTIONS = [
  {
    title: "Overview",
    body: "STACK XI is a Building Culture matchday experience on Base: Pepe storytelling, founding squad NFT mints paid in BCC, and optional BCC predictions for Dallas World Cup matchdays. By using the app you agree to these terms.",
  },
  {
    title: "Not financial advice",
    body: "Nothing on this site is investment, legal, or tax advice. BCC predictions and NFT mints involve financial risk. Only use funds you can afford to lose.",
  },
  {
    title: "Predictions & settlement",
    body: "Match predictions are recorded on-chain. Settlement for Dallas events may be manual during MVP — payouts are not guaranteed by smart contract oracle in v1. Read pool contract behavior before staking.",
  },
  {
    title: "NFT mints",
    body: "Founding squad NFTs are ERC-721 on Base with bonding-curve pricing. Metadata may move to IPFS. Perks (video shout-outs, lounge access) are promotional and fulfilled manually unless stated on-chain.",
  },
  {
    title: "Social missions",
    body: "Culture tasks use an honor system for social actions. False claims do not create on-chain rights. We may adjust XP or perks at any time during beta.",
  },
  {
    title: "Limitation of liability",
    body: "The app is provided as-is. We are not liable for wallet bugs, chain congestion, lost funds, or third-party service outages.",
  },
] as const;

export const IMPRINT_SECTIONS = [
  {
    title: "Operator",
    body: "STACK XI — Building Culture ID / Leonardo (0xleonardo). World Cup matchday culture project on Base.",
  },
  {
    title: "Contact",
    body: `Email: ${LEGAL_CONTACT_EMAIL}`,
  },
  {
    title: "On-chain contracts",
    body: "Smart contracts are deployed on Base mainnet. Verify addresses in-app and on BaseScan before interacting.",
  },
  {
    title: "Dispute resolution",
    body: "For support regarding mints, predictions, or perks, contact us via email with your wallet address and transaction hash.",
  },
] as const;
