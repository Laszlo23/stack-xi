import type { PepeBeat } from "@/lib/story/pepe-script";
import type { DallasMatch } from "@/lib/story/dallas-schedule";
import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";
import { FC_CAST_HOOK } from "@/lib/story/farcaster-builders";
import { ensureShareUrl } from "@/lib/growth/share-copy";

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
    title: "Merino Ends Ronaldo's Dream · Spain Through",
    beats: [
      {
        id: "m8-1",
        line: "Spain 1-0 Portugal in Dallas — Mikel Merino struck in the 91st minute. Ronaldo's World Cup farewell ended in tears. La Roja's first QF since 2010.",
      },
      {
        id: "m8-2",
        line: "Unai Simón extended Spain's clean-sheet run to six straight knockout games. Pepe had BCC on the line — Luck had popcorn for the stoppage-time chaos.",
        sub: "Final: Spain 1-0 · Merino 91' · AT&T Stadium Dallas",
      },
      {
        id: "m8-3",
        line: "Picked Spain? Head to your profile and claim pool rewards — treasury sends BCC to your wallet after you tap Claim. Argentina vs Egypt in Atlanta is the next live market.",
      },
    ],
    sharePost:
      "🇪🇸 Spain 1-0 Portugal · Merino 91' in Dallas. Ronaldo out. Claim your STACK XI winnings on profile if you called it 🐸⚽",
  },
  m9: {
    title: "Belgium Ends American Dream · Seattle",
    beats: [
      {
        id: "m9-1",
        line: "Belgium 4-1 USA in Seattle — Charles De Ketelaere scored twice, Hans Vanaken and Romelu Lukaku finished it. All three co-hosts eliminated in the Round of 16.",
      },
      {
        id: "m9-2",
        line: "Malik Tillman's free-kick briefly levelled it at 1-1. Belgium answered 52 seconds later. Lumen Field went silent — fourth R16 exit in five World Cups for the USMNT.",
        sub: "Final: Belgium 4-1 · Lumen Field Seattle",
      },
      {
        id: "m9-3",
        line: "Picked Belgium? Claim pool rewards on profile. Argentina vs Egypt is the live window in Atlanta — Messi vs Salah after the Pharaohs' pen heroics in Dallas.",
      },
    ],
    sharePost:
      "🇧🇪 Belgium 4-1 USA · Seattle. Co-hosts out. Spain await in LA Jul 10. Claim STACK XI winnings on profile if you called it 🐸⚽",
  },
  m10: {
    title: "Messi vs Salah · Atlanta",
    beats: [
      {
        id: "m10-1",
        line: "Argentina vs Egypt at Mercedes-Benz Stadium — Messi goal #20 energy meets Salah after the Pharaohs' first-ever knockout win on pens in Dallas.",
      },
      {
        id: "m10-2",
        line: "The biggest cultural collision left in the bracket. Pepe brought neutral vibes. Luck brought receipts.",
        sub: "Jul 7 · 12:00 PM ET · Atlanta",
      },
      {
        id: "m10-3",
        line: "Predict with BCC. Cast it. Winners claim on profile — treasury routes pool share to your Base wallet.",
      },
    ],
    sharePost:
      "Messi vs Salah · Atlanta Jul 7. STACK XI prediction window open. Claim Spain winners on profile 🐸⚽",
  },
  m12: {
    title: "Semifinal Dream · France Path",
    beats: [
      {
        id: "m12-1",
        line: `Semifinal projection at Dallas: ${WORLD_CUP_WINNER_PICK} vs Spain — if the bracket holds and Leonardo's luck arc pays off.`,
        sub: "Projected fixture · Jul 14 · subject to knockout results",
      },
      {
        id: "m12-2",
        line: "France vs Morocco in Boston Jul 9. Norway vs England in Miami Jul 11. Spain vs Belgium in LA Jul 10.",
      },
      {
        id: "m12-3",
        line: "Early squad minters get the bridge pass to Bitcoin finals on Stacks. For now, Base believers play where the story started — in public, with heart.",
      },
    ],
    sharePost: `QF week: France vs Morocco Jul 9 · Norway vs England Jul 11. Leonardo's pick: ${WORLD_CUP_WINNER_PICK} win the World Cup Jul 19. Claim · predict · mint 🐸`,
  },
};

export function getMatchdayStory(match: DallasMatch): MatchdayStory {
  const custom = STORY_BY_MATCH[match.id];
  if (custom) {
    return {
      matchId: match.id,
      ...custom,
      sharePost: ensureShareUrl(custom.sharePost),
    };
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
    sharePost: ensureShareUrl(
      `${match.home} vs ${match.away} — new STACK XI Pepe matchday story. Predict on Base. Mint the squad. 🐸`,
    ),
  };
}
