import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import { buildXPost, ensureShareUrl } from "@/lib/growth/share-copy";
import { absoluteUrl } from "@/lib/seo/site-config";

export type ViralCalendarDay = {
  id: string;
  dayNumber: number;
  /** ISO date YYYY-MM-DD */
  date: string;
  dateLabel: string;
  theme: string;
  hook: string;
  matchContext: string;
  postWindow: string;
  productAction: string;
  pepeImage: string;
  farcasterPost: string;
  xPost: string;
  builderTags: readonly string[];
};

export type ViralCalendarWeek = {
  id: "knockout" | "semifinal";
  title: string;
  rangeLabel: string;
  days: ViralCalendarDay[];
};

const TAG_ROTATIONS = [
  [FC_BUILDERS[0], FC_BUILDERS[1], FC_BUILDERS[3]],
  [FC_BUILDERS[1], FC_BUILDERS[2], FC_BUILDERS[6]],
  [FC_BUILDERS[3], FC_BUILDERS[4], FC_BUILDERS[0]],
  [FC_BUILDERS[5], FC_BUILDERS[6], FC_BUILDERS[1]],
  [FC_BUILDERS[0], FC_BUILDERS[4], FC_BUILDERS[2]],
  [FC_BUILDERS[2], FC_BUILDERS[5], FC_BUILDERS[3]],
  [FC_BUILDERS[6], FC_BUILDERS[0], FC_BUILDERS[1]],
  [FC_BUILDERS[4], FC_BUILDERS[1], FC_BUILDERS[5]],
  [FC_BUILDERS[2], FC_BUILDERS[3], FC_BUILDERS[6]],
  [FC_BUILDERS[0], FC_BUILDERS[5], FC_BUILDERS[4]],
  [FC_BUILDERS[1], FC_BUILDERS[6], FC_BUILDERS[2]],
  [FC_BUILDERS[3], FC_BUILDERS[0], FC_BUILDERS[5]],
  [FC_BUILDERS[6], FC_BUILDERS[4], FC_BUILDERS[1]],
  [FC_BUILDERS[5], FC_BUILDERS[2], FC_BUILDERS[0]],
] as const;

function tagsForDay(dayIndex: number): readonly string[] {
  return TAG_ROTATIONS[dayIndex % TAG_ROTATIONS.length].map((b) => b.handle);
}

function finalizeCalendarDay(day: ViralCalendarDay): ViralCalendarDay {
  return {
    ...day,
    xPost: buildXPost(day.xPost, { tagSeed: day.dayNumber }),
    farcasterPost: ensureShareUrl(day.farcasterPost, day.farcasterPost.includes("/#predict") ? "/" : "/"),
  };
}

const KNOCKOUT_WEEK_DAYS: ViralCalendarDay[] = [
  {
    id: "d1-receipts",
    dayNumber: 1,
    date: "2026-07-04",
    dateLabel: "Fri Jul 4 · Post-matchday",
    theme: "Receipts & Luck",
    hook: "Turn yesterday's chaos into today's social proof.",
    matchContext: "Egypt 4-2 pens vs Australia · Argentina 3-2 Cape Verde AET · R16 live",
    postWindow: "10:00–11:30 AM CT",
    productAction: "Share Egypt pens receipt · France vs Paraguay pick · /proof hub",
    pepeImage: "/gaolpepe.jpg",
    builderTags: tagsForDay(0),
    farcasterPost: [
      "STACK XI matchday receipts 🐸⚽",
      "Egypt beat Australia 4-2 on pens in Dallas — first WC knockout win ever.",
      "Argentina survived Cape Verde 3-2 AET. Messi goal #20.",
      "Tonight: Paraguay vs France · Jul 4. Leonardo picks France to win it all Jul 19.",
      "Next Dallas: Portugal vs Spain · Round of 16 · Jul 6.",
      tagsForDay(0).join(" "),
      absoluteUrl("/"),
    ].join("\n"),
    xPost:
      "Egypt on pens. Argentina in extra time. France tonight. Leonardo's bracket is France 🐸",
  },
  {
    id: "d2-eve",
    dayNumber: 2,
    date: "2026-07-05",
    dateLabel: "Sat Jul 5 · Round of 16 eve",
    theme: "Crowd Is Wrong",
    hook: "Counter-narrative beats consensus — that's the engagement spike.",
    matchContext: "Portugal vs Spain · Dallas R16 eve · Jul 6 kickoff 2 PM CT",
    postWindow: "6:00–8:00 PM CT",
    productAction: "Open predict flow · tease 90-min live window · Iberian derby",
    pepeImage: "/pepeheadball.jpg",
    builderTags: tagsForDay(1),
    farcasterPost: [
      "STACK XI Matchday Prediction opens tomorrow 🐸",
      "Portugal vs Spain · Dallas Round of 16 · Jul 6",
      "Ramos 93rd vs Oyarzabal brace — Iberian derby energy.",
      "Crowd split tight. Crowd is usually wrong.",
      tagsForDay(1).join(" "),
    ].join("\n"),
    xPost: "Portugal vs Spain in Dallas tomorrow. Iberian derby. Lock BCC. 🐸⚽",
  },
  {
    id: "d3-live",
    dayNumber: 3,
    date: "2026-07-06",
    dateLabel: "Mon Jul 6 · MATCHDAY LIVE",
    theme: "Cast-to-Predict",
    hook: "Every prediction = one cast. That's the viral loop.",
    matchContext:
      "Portugal vs Spain · 2:00 PM CT Dallas · Morocco, France, Norway, England already in QF",
    postWindow: "12:30–1:30 PM CT (90 min window)",
    productAction: "Cast-to-unlock → lock BCC → meme share card",
    pepeImage: "/pepesoccerbeer.jpg",
    builderTags: tagsForDay(2),
    farcasterPost: [
      "STACK XI Matchday Prediction is LIVE 🐸",
      "Portugal vs Spain · Dallas Round of 16",
      "Four QF spots set: Morocco, France, Norway, England.",
      "Haaland broke Brazil. Bellingham broke Mexico. Iberian derby decides the next.",
      "Leonardo still picks France to lift the trophy Jul 19.",
      tagsForDay(2).join(" "),
      absoluteUrl("/#predict"),
    ].join("\n"),
    xPost: "Iberian derby live in Dallas. Four quarterfinalists already set. Lock BCC. 🐸",
  },
  {
    id: "d4-flex",
    dayNumber: 4,
    date: "2026-07-07",
    dateLabel: "Tue Jul 7 · R16 doubleheader",
    theme: "Messi vs Salah",
    hook: "Status loop — winners publish, losers lurk.",
    matchContext: "Argentina vs Egypt Atlanta · Switzerland vs Colombia Vancouver",
    postWindow: "9:00–10:30 AM CT",
    productAction: "Post Dallas R16 receipt · tease Atlanta + Vancouver picks",
    pepeImage: "/pepecard.jpg",
    builderTags: tagsForDay(3),
    farcasterPost: [
      "STACK XI knockout receipts 🐸⚽",
      "Portugal vs Spain settled in Dallas — quarterfinal picture updating.",
      "Today: Salah vs Messi in Atlanta · Switzerland vs Colombia in Vancouver.",
      "France vs Morocco QF confirmed Jul 9 · Norway vs England Jul 11.",
      tagsForDay(3).join(" "),
    ].join("\n"),
    xPost: "Salah vs Messi today. Quarterfinal bracket tightening. 🐸",
  },
  {
    id: "d5-curve",
    dayNumber: 5,
    date: "2026-07-08",
    dateLabel: "Tue Jul 8 · Squad curve",
    theme: "Bonding Curve Lore",
    hook: "Not NFT banking — own a position on the pitch.",
    matchContext: "Founding squad mint · 770 BCC + 70 BCC per mint",
    postWindow: "5:00–7:00 PM CT",
    productAction: "Mint squad tile · DeFi layer page share",
    pepeImage: "/fallpepepenug.jpg",
    builderTags: tagsForDay(4),
    farcasterPost: [
      "STACK XI founding squad curve is the real matchday game 🐸",
      "11 positions · bonding curve on Base · not a finance dashboard.",
      "Early believers define valuation. Price steps +70 BCC every mint.",
      tagsForDay(4).join(" "),
      absoluteUrl("/defi"),
    ].join("\n"),
    xPost: "Own a position. Not an NFT brochure. Squad curve on Base. 🐸",
  },
  {
    id: "d6-builders",
    dayNumber: 6,
    date: "2026-07-09",
    dateLabel: "Wed Jul 9 · Quarterfinal eve",
    theme: "France vs Morocco",
    hook: "Story-universe tagging — gratitude, not spam.",
    matchContext: "France vs Morocco QF · Boston · Mbappé vs Atlas Lions",
    postWindow: "11:00 AM–12:30 PM CT",
    productAction: "Profile missions · quarterfinal pick tease",
    pepeImage: "/beforefallpepepengubeer.jpg",
    builderTags: tagsForDay(5),
    farcasterPost: [
      "Quarterfinal week on STACK XI 🐸⚽",
      "France vs Morocco · Boston · Jul 9.",
      "Leonardo's bracket still says France lift the trophy Jul 19.",
      "Tag the builders who made onchain culture feel human:",
      tagsForDay(5).join(" "),
      "Team culture > solo grind.",
    ].join("\n"),
    xPost: "QF eve: France vs Morocco. Leonardo's bracket still says blue. 🐸",
  },
  {
    id: "d7-semifinal-tease",
    dayNumber: 7,
    date: "2026-07-10",
    dateLabel: "Thu Jul 10 · Semifinal horizon",
    theme: "Semifinal Tease",
    hook: "Close the week by opening the next arc.",
    matchContext: "Semifinal Jul 14 · France vs Portugal (projected) · Leonardo's bracket",
    postWindow: "4:00–6:00 PM CT",
    productAction: "Tease Week 2 calendar · Finals Stacks path",
    pepeImage: "/pepeheadball.jpg",
    builderTags: tagsForDay(6),
    farcasterPost: [
      "One week of STACK XI matchdays down. Semifinal loading 🐸⚽",
      "Jul 14 · France vs Portugal projected in Dallas — if the bracket holds.",
      "Leonardo picks France to win the World Cup Jul 19 in New York.",
      "Social prediction sport on Base — then Bitcoin finals arc on Stacks.",
      "Week 2 post calendar drops — same loop, bigger stakes.",
      tagsForDay(6).join(" "),
      absoluteUrl("/calendar"),
    ].join("\n"),
    xPost: "Semifinal horizon. Luck doesn't chase — it waits in the pool. 🐸",
  },
];

const SEMIFINAL_WEEK_DAYS: ViralCalendarDay[] = [
  {
    id: "d8-countdown",
    dayNumber: 8,
    date: "2026-07-11",
    dateLabel: "Fri Jul 11 · Semifinal countdown",
    theme: "Three Days Out",
    hook: "Slow burn beats cold spam — start the narrative early.",
    matchContext: "France vs Portugal · Semifinal Jul 14 · projected Dallas",
    postWindow: "12:00–1:30 PM CT",
    productAction: "Share Week 2 calendar · remind cast-to-unlock loop",
    pepeImage: "/pepeheadball.jpg",
    builderTags: tagsForDay(7),
    farcasterPost: [
      "STACK XI Semifinal week starts now 🐸⚽",
      "3 days until France vs Portugal projected semifinal in Dallas.",
      "Same viral loop: cast your pick → unlock odds → lock BCC on Base.",
      "Social prediction sport — not a finance dashboard.",
      tagsForDay(7).join(" "),
      absoluteUrl("/calendar"),
    ].join("\n"),
    xPost: "Semifinal countdown. Three days. Luck loading. 🐸",
  },
  {
    id: "d9-luck-leaderboard",
    dayNumber: 9,
    date: "2026-07-12",
    dateLabel: "Sat Jul 12 · LUCK flex",
    theme: "Leaderboard Energy",
    hook: "Competition is content — show the top 10% without being cringe.",
    matchContext: "LUCK reputation layer · prediction receipts",
    postWindow: "5:00–7:00 PM CT",
    productAction: "Profile XP screenshot · prediction receipt panel",
    pepeImage: "/pepecard.jpg",
    builderTags: tagsForDay(8),
    farcasterPost: [
      "Top 10% on STACK XI earn LUCK 🐸",
      "Not a token — reputation for whitelist, multipliers, mint priority.",
      "Semifinal picks hit different when you've been in the pool all tournament.",
      "Check your member profile — culture missions still running.",
      tagsForDay(8).join(" "),
      absoluteUrl("/profile"),
    ].join("\n"),
    xPost: "Top 10% earn LUCK. Status loop on Base. Semifinal eve loading. 🐸",
  },
  {
    id: "d10-semifinal-eve",
    dayNumber: 10,
    date: "2026-07-13",
    dateLabel: "Sun Jul 13 · Semifinal eve",
    theme: "Crowd Pressure 2.0",
    hook: "Semifinal stakes = bigger casts, shorter patience.",
    matchContext: "Winner M97 vs Winner M98 · kickoff tomorrow 2 PM CT",
    postWindow: "7:00–9:00 PM CT",
    productAction: "Predict flow · crowd bar + 'crowd is usually wrong'",
    pepeImage: "/pepesoccerbeer.jpg",
    builderTags: tagsForDay(9),
    farcasterPost: [
      "STACK XI Semifinal Prediction opens tomorrow 🐸",
      "France vs Portugal · Dallas · WM chaos edition",
      "Crowd will consensus hard. Crowd is usually wrong.",
      "Cast-to-unlock your pick before the 90-min live window.",
      tagsForDay(9).join(" "),
    ].join("\n"),
    xPost: "Semifinal eve. Crowd is usually wrong. That's the whole game. 🐸⚽",
  },
  {
    id: "d11-semifinal-live",
    dayNumber: 11,
    date: "2026-07-14",
    dateLabel: "Mon Jul 14 · SEMIFINAL LIVE",
    theme: "Maximum Cast Loop",
    hook: "Every user should generate 2–5 impressions today.",
    matchContext: "Winner M97 vs Winner M98 · 2:00 PM CT kickoff",
    postWindow: "12:30–1:30 PM CT (90 min window)",
    productAction: "Full loop: share unlock → BCC lock → meme card blast",
    pepeImage: "/gaolpepe.jpg",
    builderTags: tagsForDay(10),
    farcasterPost: [
      "STACK XI SEMIFINAL Prediction is LIVE 🐸🔥",
      "France vs Portugal — I locked mine onchain with BCC.",
      "WM chaos edition on Base. Unlock full odds by sharing your pick.",
      "This is social prediction sport. Let Luck decide.",
      tagsForDay(10).join(" "),
      absoluteUrl("/#predict"),
    ].join("\n"),
    xPost: "Semifinal locked onchain. Cast gate cleared. Luck decides everything. 🐸",
  },
  {
    id: "d12-semifinal-receipts",
    dayNumber: 12,
    date: "2026-07-15",
    dateLabel: "Tue Jul 15 · Semifinal receipts",
    theme: "Cinematic Flex",
    hook: "Winners post meme cards — losers become tomorrow's converts.",
    matchContext: "Semifinal result · Top 10% LUCK payout",
    postWindow: "9:30–11:00 AM CT",
    productAction: "Winner Call meme card · receipt leaderboard share",
    pepeImage: "/fallpepepenug.jpg",
    builderTags: tagsForDay(11),
    farcasterPost: [
      "Semifinal receipts on STACK XI 🐸⚽",
      "Called it on Base — prediction locked, meme card posted.",
      "Top predictors earned LUCK. Everyone else got lore.",
      "Screenshot your share card. Status > silence.",
      tagsForDay(11).join(" "),
    ].join("\n"),
    xPost: "Semifinal receipt posted. Luck hit different onchain. 🐸",
  },
  {
    id: "d13-base-stacks-bridge",
    dayNumber: 13,
    date: "2026-07-16",
    dateLabel: "Wed Jul 16 · Base → Stacks bridge",
    theme: "Finals Arc Bridge",
    hook: "Connect Dallas Base energy to Bitcoin finals mythology.",
    matchContext: "Early believers · Stacks finals whitelist narrative",
    postWindow: "4:00–6:00 PM CT",
    productAction: "Share /finals teaser · squad early believer flex",
    pepeImage: "/beforefallpepepengubeer.jpg",
    builderTags: tagsForDay(12),
    farcasterPost: [
      "Base believers → Bitcoin finals arc 🐸",
      "STACK XI Dallas matchdays run on BCC. Finals mint lands on Stacks.",
      "If you minted the founding squad early, you're already in the lore.",
      "Semifinal was the bridge. Final is the crescendo.",
      tagsForDay(12).join(" "),
      absoluteUrl("/finals"),
    ].join("\n"),
    xPost: "Base matchdays done. Bitcoin finals arc loading. Early believers know. 🐸",
  },
  {
    id: "d14-final-tease",
    dayNumber: 14,
    date: "2026-07-17",
    dateLabel: "Thu Jul 17 · Final tease",
    theme: "Close Semifinal Week",
    hook: "End with anticipation — not exhaustion.",
    matchContext: "World Cup Final approaching · culture > solo grind",
    postWindow: "6:00–8:00 PM CT",
    productAction: "Recap both calendar weeks · community thank-you cast",
    pepeImage: "/pepeheadball.jpg",
    builderTags: tagsForDay(13),
    farcasterPost: [
      "Two weeks of STACK XI matchday loops 🐸⚽",
      "Cast-to-predict · BCC on Base · meme cards · LUCK receipts.",
      "Social prediction sport for internet culture — we built the layer.",
      "Final arc next. Pepe doesn't chase liquidity. He plays inside it.",
      tagsForDay(13).join(" "),
      absoluteUrl("/"),
    ].join("\n"),
    xPost: "Two weeks in. Social prediction sport on Base. Final arc next. 🐸",
  },
];

export const VIRAL_CALENDAR_WEEKS: ViralCalendarWeek[] = [
  {
    id: "knockout",
    title: "Week 1 · Knockout Push",
    rangeLabel: "Jul 4 – 10, 2026",
    days: KNOCKOUT_WEEK_DAYS.map(finalizeCalendarDay),
  },
  {
    id: "semifinal",
    title: "Week 2 · Semifinal Arc",
    rangeLabel: "Jul 11 – 17, 2026",
    days: SEMIFINAL_WEEK_DAYS.map(finalizeCalendarDay),
  },
];

/** @deprecated Use VIRAL_CALENDAR_WEEKS */
export const VIRAL_CALENDAR_DAYS = KNOCKOUT_WEEK_DAYS;

export const CALENDAR_RANGE_LABEL = "Jul 4 – 17, 2026 · WM Knockout + Semifinal";

export function getAllCalendarDays(): ViralCalendarDay[] {
  return VIRAL_CALENDAR_WEEKS.flatMap((w) => w.days);
}

export function getTodayCalendarDay(now = new Date()): ViralCalendarDay | undefined {
  const key = now.toISOString().slice(0, 10);
  return getAllCalendarDays().find((d) => d.date === key);
}

export function getTodayCalendarWeek(now = new Date()): ViralCalendarWeek | undefined {
  const key = now.toISOString().slice(0, 10);
  return VIRAL_CALENDAR_WEEKS.find((w) => w.days.some((d) => d.date === key));
}

export function getCalendarDayProgress(now = new Date()): {
  today: ViralCalendarDay | undefined;
  week: ViralCalendarWeek | undefined;
  dayIndex: number;
  totalDays: number;
} {
  const today = getTodayCalendarDay(now);
  const week = getTodayCalendarWeek(now);
  return {
    today,
    week,
    dayIndex: today?.dayNumber ?? 0,
    totalDays: getAllCalendarDays().length,
  };
}
