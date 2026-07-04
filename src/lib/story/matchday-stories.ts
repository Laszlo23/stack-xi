import type { PepeBeat } from "@/lib/story/pepe-script";
import type { DallasMatch } from "@/lib/story/dallas-schedule";
import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";
import { FC_CAST_HOOK } from "@/lib/story/farcaster-builders";

export type MatchdayStory = {
  matchId: string;
  title: string;
  beats: PepeBeat[];
  sharePost: string;
};

export const PEPE_ORIGIN_STORY: PepeBeat[] = [
  {
    id: "before",
    line: "I used to scroll Farcaster like it was homework. Rational. Detached. Life mildly fucked, but at least the feed was chronological.",
    sub: "Then someone like Jesse would ship another thing on Base and I'd feel… something. Annoying.",
  },
  {
    id: "switch",
    line: "Then Luck started chasing me. Not metaphorically. Like @dwr replying to your cast with genuine warmth while you're still in pajama mode.",
  },
  {
    id: "after",
    line: "I stopped running from good vibes. Builders like Linda, Coopa, horsefacts — they weren't flexing. They were inviting. Now I have no energy left to gatekeep — and somehow that's the whole strategy.",
    sub: "Pepe doesn't chase. Luck does. The squad mints anyway.",
  },
  {
    id: "fc",
    line: "This isn't a protocol pitch. It's a group chat that accidentally became a World Cup watch party with BCC and heart.",
    sub: FC_CAST_HOOK,
  },
];

const STORY_BY_MATCH: Record<string, Omit<MatchdayStory, "matchId">> = {
  m1: {
    title: "Cast Before Kickoff",
    beats: [
      {
        id: "m1-1",
        line: "Netherlands brought geometry. Japan brought precision. Pepe brought a draft cast and deleted it three times.",
      },
      {
        id: "m1-2",
        line: "Jesse would say: just ship the pick. Dan would say: the feed is the match. Pepe says: both, but with snacks.",
      },
    ],
    sharePost:
      "🇳🇱 vs 🇯🇵 · Dallas matchday 1. Pepe finally posted the cast. Predict on Base. Mint the squad from $0.77. @jessepollak this one's for the builders who ship with heart 🐸⚽",
  },
  m2: {
    title: "Three Lions, One Frame",
    beats: [
      {
        id: "m2-1",
        line: "England brought hope. Croatia brought experience. Pepe brought the wisdom of someone who stopped quote-casting losses in 2018.",
      },
      {
        id: "m2-2",
        line: "It's coming home, they typed in all caps. Pepe replied with a single 🐸. Sometimes that's enough engagement.",
      },
    ],
    sharePost:
      "England vs Croatia. Pepe observes from a safe emotional distance. Luck bets on drama. STACK XI matchday — link in frame 🐸",
  },
  m3: {
    title: "Messi Energy, Builder Energy",
    beats: [
      {
        id: "m3-1",
        line: "Argentina brought legacy. Austria brought structure. Pepe brought a /stack-xi channel invite nobody asked for — and everyone joined.",
      },
      {
        id: "m3-2",
        line: "Luck whispered: this one feels cinematic. Pepe whispered back: everything feels cinematic when builders show up for each other.",
      },
    ],
    sharePost:
      "Argentina vs Austria in Dallas. Pepe's luck arc continues. Mint a founding player — price goes up $0.07 each mint. STACK XI 🐸✨",
  },
  m4: {
    title: "Rematch Season",
    beats: [
      {
        id: "m4-1",
        line: "Japan vs Sweden. Two teams that play like spreadsheets with feelings. Pepe respects that — it's how Farcaster devs watch football.",
      },
      {
        id: "m4-2",
        line: "Luck loves a rematch. Pepe loves not having opinions until the channel goes live.",
      },
    ],
    sharePost:
      "Japan vs Sweden matchday story is live. Pepe stays rational. Luck stays chaotic. Predict with BCC on Base 🐸",
  },
  m5: {
    title: "Underdog Hour",
    beats: [
      {
        id: "m5-1",
        line: "Jordan vs Argentina. David vs Goliath, but Goliath has better hair and a World Cup.",
      },
      {
        id: "m5-2",
        line: "Pepe doesn't pick underdogs. Luck picks underdogs and tags you in the cast when you're right.",
      },
    ],
    sharePost:
      "Jordan vs Argentina. The plot thickens. Pepe narrates. You predict on Base. Tag a builder who believed early 🐸⚽",
  },
  m6: {
    title: "Winter Warriors Advance",
    beats: [
      {
        id: "m6-1",
        line: "Côte d'Ivoire vs Norway. First knockout in Dallas. Norway won 2-1 — winter warriors through to face Brazil in New Jersey.",
      },
      {
        id: "m6-2",
        line: "Pepe watched from the channel. Luck had already moved on — Egypt and Portugal were writing louder scripts.",
      },
    ],
    sharePost:
      "Round of 32 in Dallas: Norway 2-1 Côte d'Ivoire. Knockout receipts posted. Next Dallas stop: Portugal vs Spain Jul 6 🐸⚽ STACK XI",
  },
  m7: {
    title: "Pharaohs on Pens · History in Texas",
    beats: [
      {
        id: "m7-1",
        line: "Australia brought discipline. Egypt brought history — and for the first time ever, a men's World Cup knockout win. 1-1 after 120 minutes. Egypt 4-2 on pens.",
      },
      {
        id: "m7-2",
        line: "Salah stayed calm when it mattered. Pepe stayed seated — this was bigger than a meme. Builders on Farcaster felt it in the group chat.",
        sub: "Egypt face Argentina in Atlanta on Jul 7. Messi vs Salah. Luck is already scheduling the cast.",
      },
      {
        id: "m7-3",
        line: "Mint from 770 BCC. Each mint raises the curve. Leonardo records a personal video for every minter — your name, your handle, posted and tagged.",
      },
      {
        id: "m7-4",
        line: "Next Dallas matchday: Portugal vs Spain. Iberian derby. Ronaldo vs Yamal energy. Lock BCC before Jul 6 kickoff.",
      },
    ],
    sharePost:
      "🇪🇬 Egypt beat Australia 4-2 on pens in Dallas — first WC knockout win ever. Next: Argentina in Atlanta. Dallas R16: Portugal vs Spain Jul 6. Predict on Base 🐸⚽",
  },
  m8: {
    title: "Iberian Derby · Dallas Round of 16",
    beats: [
      {
        id: "m8-1",
        line: "Portugal 2-1 Croatia in Toronto — Ramos in the 93rd. Spain 3-0 Austria in LA — first knockout win since South Africa 2010. Now they collide in Dallas.",
      },
      {
        id: "m8-2",
        line: "Ronaldo dedicated the win to Diogo Jota. Yamal and Oyarzabal are in form. Pepe brought neutral vibes and a BCC stake — Luck brought popcorn.",
        sub: "Jul 6 · 2:00 PM CT · AT&T Stadium. Predictions open 90 minutes before kickoff.",
      },
      {
        id: "m8-3",
        line: `While Dallas hosts the Iberian storm, ${WORLD_CUP_WINNER_PICK} face Paraguay in Philadelphia tonight — Leonardo's bracket says Les Bleus lift the trophy Jul 19.`,
      },
    ],
    sharePost:
      "🇵🇹 vs 🇪🇸 · Dallas Round of 16 · Jul 6. Portugal vs Spain after dramatic R32 wins. Lock BCC on STACK XI. Pepe picks vibes — Leonardo picks France to win it all 🐸⚽",
  },
  m9: {
    title: "Semifinal Dream · France Path",
    beats: [
      {
        id: "m9-1",
        line: `Semifinal projection at Dallas: ${WORLD_CUP_WINNER_PICK} vs Portugal — if the bracket holds and Leonardo's luck arc pays off.`,
        sub: "Projected fixture · Jul 14 · subject to knockout results",
      },
      {
        id: "m9-2",
        line: "Mbappé in form. France beat Sweden 3-0 in the R32. Paraguay stunned Germany on pens — but the crowd on Base is backing blue.",
      },
      {
        id: "m9-3",
        line: "Early squad minters get the bridge pass to Bitcoin finals on Stacks. For now, Base believers play where the story started — in public, with heart.",
      },
    ],
    sharePost: `Semifinal horizon in Dallas · Jul 14. Leonardo's pick: ${WORLD_CUP_WINNER_PICK} win the World Cup Jul 19. Mint squad · predict with BCC · prove onchain 🐸`,
  },
};

export function getMatchdayStory(match: DallasMatch): MatchdayStory {
  const custom = STORY_BY_MATCH[match.id];
  if (custom) {
    return { matchId: match.id, ...custom };
  }

  return {
    matchId: match.id,
    title: `${match.home} vs ${match.away}`,
    beats: [
      {
        id: "default",
        line: `${match.home} vs ${match.away}. Pepe observes. Luck invests. You predict on Base and cast the recap.`,
      },
    ],
    sharePost: `${match.home} vs ${match.away} — new STACK XI Pepe matchday story. Predict on Base. Mint the squad. 🐸`,
  };
}
