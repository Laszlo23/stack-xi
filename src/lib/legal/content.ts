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
    body: "Match predictions are recorded on-chain. Settlement for Dallas events may be manual during MVP — payouts are not guaranteed by smart contract oracle in v1. Read pool contract behavior before staking. Promotional sponsored stakes (first 77 unique wallets, 1,000 BCC each) are funded by the operator treasury while slots remain.",
  },
  {
    title: "NFT mints",
    body: "Founding squad packs are ERC-721 on Base: mint sealed, open on-chain to reveal your player (77 editions per character, 847 total). Genesis v1 cards remain legend tier. Prediction claim boosts and merch codes apply automatically in-app based on holdings; video shout-outs and lounge access may still be fulfilled manually.",
  },
  {
    title: "Social missions",
    body: "Culture tasks use API verification when X or Farcaster accounts are connected, with honor-system fallback when API checks are unavailable. False claims do not create on-chain rights. We may adjust XP or perks at any time during beta.",
  },
  {
    title: "Automated culture agents",
    body: "Luck (X) and Pepe (Farcaster) are disclosed automated accounts operated by the project for builder support and matchday culture — not impersonated users. Protocol Pepe treasury activity shown in the culture feed is labeled protocol activity on Base. Automated posts are subject to daily caps and human approval for originals where configured.",
  },
  {
    title: "Culture airdrop",
    body: "Promotional messaging about a BCC participant airdrop (including pool size and XP weight tiers) is not a guarantee of allocation, value, or claim timing. Final tokenomics, eligibility, and claim mechanics will be announced separately and may change.",
  },
  {
    title: "Limitation of liability",
    body: "The app is provided as-is. We are not liable for wallet bugs, chain congestion, lost funds, or third-party service outages.",
  },
] as const;

export const BUILDING_CULTURE_TEAM_URL = "https://app.buildingcultureid.space/team";

export const IMPRINT_SECTIONS = [
  {
    title: "Operator",
    body: `STACK XI is operated by Building Culture — a trust layer where people, communities, and builders earn reputation on Base. Product lead: Laszlo Bihary (Co-founder). Team: https://app.buildingcultureid.space/team`,
  },
  {
    title: "Responsible persons",
    body: "Laszlo Bihary — Co-founder & product (Vienna, Austria). Reinhard Stix — Co-founder & real estate. Roman Horvath — Accountant. See the Building Culture team page for full bios and links.",
  },
  {
    title: "Contact",
    body: `Email: ${LEGAL_CONTACT_EMAIL} · Team: ${BUILDING_CULTURE_TEAM_URL}`,
  },
  {
    title: "On-chain contracts",
    body: "Smart contracts are deployed on Base mainnet. Verify addresses in-app and on BaseScan before interacting. Founding squad mints and BCC predictions are user-initiated wallet transactions.",
  },
  {
    title: "Sponsored predictions",
    body: "Promotional sponsored prediction stakes (first 77 unique wallets, 1,000 BCC each) are funded by the operator treasury via a dedicated sponsor contract. One sponsored slot per wallet while slots remain. Not a guarantee of winnings or future sponsorship.",
  },
  {
    title: "Dispute resolution",
    body: "For support regarding mints, predictions, sponsored stakes, or perks, contact us via email with your wallet address and transaction hash.",
  },
] as const;
