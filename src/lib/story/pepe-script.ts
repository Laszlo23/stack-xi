export type PepeBeat = {
  id: string;
  line: string;
  sub?: string;
};

export const PEPE_PREDICT_INTRO: PepeBeat = {
  id: "pick",
  line: "Pick a winner. I'm not asking for your origin story. Left team or right team.",
  sub: "Two buttons. Real BCC on Base. Cast your pick on Farcaster after — Luck handles the rest.",
};

export const PEPE_STAKE_INTRO: PepeBeat = {
  id: "stake",
  line: "How much conviction? Pick a tier. Jesse ships Base. Dan ships Farcaster. You ship a prediction.",
};

export const PEPE_CONFIRM_INTRO: PepeBeat = {
  id: "confirm",
  line: "Connect your Base wallet. Lock it in. Then go touch grass until kickoff like a healthy builder.",
};

export const PEPE_SUCCESS: PepeBeat = {
  id: "success",
  line: "You didn't join a protocol. You joined a watch party with financial consequences — and a Farcaster cast waiting.",
  sub: "Luck is pleased. Pepe is seated. Leonardo starts the show.",
};

export const PEPE_RETURN_HOOK: PepeBeat = {
  id: "return",
  line: "New matchday, new story. Come back tomorrow — the feed doesn't sleep, but I do.",
};

export const DCL_EVENT = {
  title: "World Cup Watch Party · Decentraland",
  venue: "STACK XI Metaverse Lounge · Dallas energy",
  coordinates: "(-100, -100)",
  dclUrl: "https://play.decentraland.org/?position=-100,-100",
  predictionsNote:
    "Live watch party + predictions open during the match · Base BCC · Farcaster recap casts",
};

export const EARLY_BELIEVER_PERKS = [
  "Personal video shout-out — recorded, posted, you're tagged",
  "Farcaster cast + X post with your handle",
  "Priority Decentraland lounge access",
  "Finals Bitcoin/Stacks whitelist",
  "Matchday director's cut Pepe stories",
  "Prediction fee-share multiplier (display; MVP settlement)",
];

export const MINT_SUCCESS_MESSAGE: PepeBeat = {
  id: "minted",
  line: "You're in the squad. Leonardo will record a personal shout-out, tag you, and post it. This is a team effort — and you just made the starting lineup.",
  sub: "Next mint costs a little more. Early believers win twice: price + perks.",
};
