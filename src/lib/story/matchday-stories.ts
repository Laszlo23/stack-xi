import type { PepeBeat } from "@/lib/story/pepe-script";
import type { DallasMatch } from "@/lib/story/dallas-schedule";
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
    line: "This isn't a protocol pitch. It's a group chat that accidentally became a World Cup watch party with USDC and heart.",
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
      "Japan vs Sweden matchday story is live. Pepe stays rational. Luck stays chaotic. Predict with USDC on Base 🐸",
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
    title: "Knockout Logic",
    beats: [
      {
        id: "m6-1",
        line: "Côte d'Ivoire vs Norway. First knockout in Dallas. Pepe upgraded from lurker to 'actually replies sometimes'.",
      },
      {
        id: "m6-2",
        line: "Winter warriors meet African flair. Luck brought popcorn. Coopa probably brought the playlist.",
      },
    ],
    sharePost: "Round of 32: Côte d'Ivoire vs Norway. Knockout Pepe energy activated. STACK XI 🐸",
  },
  m7: {
    title: "Desert Meets Discipline · Farcaster Edition",
    beats: [
      {
        id: "m7-1",
        line: "Australia brought discipline. Egypt brought history. Pepe brought a folding chair, zero expectations, and a draft cast thanking every builder who ever replied to a nervous first post.",
      },
      {
        id: "m7-2",
        line: "Jessy — Jesse — ships Base so the rest of us can ship vibes. @dwr made a place where a frog can narrate football without irony poisoning. Linda, Varun, horsefacts, Coopa: y'all are why this feels like a team, not a pitch deck.",
        sub: "If you've ever minted something at 2am and prayed someone would care — this one's for you.",
      },
      {
        id: "m7-3",
        line: "Mint from $0.77. Each mint raises the price $0.07. Leonardo records a personal video for every minter — your name, your handle, posted and tagged. Not marketing. Gratitude.",
      },
      {
        id: "m7-4",
        line: "Pick a side. Lock USDC on Base. Cast your pick. Watch in Decentraland. Pepe will be there — emotionally available for once.",
      },
    ],
    sharePost:
      "🇦🇺 vs 🇪🇬 · Dallas. Pepe wrote a love letter to Farcaster builders. Mint the founding squad from $0.77 (+$0.07 each mint). Every minter gets a personal video shout-out from @0xleonardo — tagged and posted. @jessepollak @dwr this is team culture 🐸⚽💜",
  },
  m8: {
    title: "Winners Only",
    beats: [
      {
        id: "m8-1",
        line: "Round of 16. Two winners, one channel. Pepe has seen this movie. Luck has executive-produced it.",
      },
      {
        id: "m8-2",
        line: "Nobody knows who's playing yet. Pepe finds that peaceful — like a Farcaster feed before the US wakes up.",
      },
    ],
    sharePost: "Round of 16 in Dallas. Unknown teams, known vibes. STACK XI Pepe story 🐸",
  },
  m9: {
    title: "Semifinal Serenity",
    beats: [
      {
        id: "m9-1",
        line: "Semifinal in Dallas. The stakes are high. Pepe's heart rate is not — he's learned that from watching builders stay calm during outages.",
      },
      {
        id: "m9-2",
        line: "Soon the finals move to Bitcoin on Stacks. For now, Base believers play where the story started — in public, with heart.",
        sub: "Early squad minters get the bridge pass and the director's cut.",
      },
    ],
    sharePost:
      "Semifinal matchday. Pepe is zen. Luck is loud. Finals mint on Bitcoin coming for Base OGs. Cast if you're still here 🐸",
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
