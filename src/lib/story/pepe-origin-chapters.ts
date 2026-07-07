import { ensureShareUrl } from "@/lib/growth/share-copy";

export type PepeOriginChapter = {
  id: string;
  chapter: string;
  title: string;
  line: string;
  image: string;
  sharePost: string;
};

export const PEPE_ORIGIN_CHAPTERS: PepeOriginChapter[] = [
  {
    id: "watching",
    chapter: "01",
    title: "Pepe was just watching.",
    line: "Same couch. Same timeline. Same takes about who should start. Football was on — he was scrolling past it.",
    image: "/beforefallpepepengubeer.jpg",
    sharePost:
      "Chapter 1: Pepe was just watching. 🐸⚽ STACK XI — the internet's football playground where predictions become culture.",
  },
  {
    id: "luck",
    chapter: "02",
    title: "Then Luck found him.",
    line: "Not hype. Not a token launch. A slide tackle from the universe that said: stop lurking, start playing.",
    image: "/fallpepepenug.jpg",
    sharePost:
      "Chapter 2: Then Luck found him. 🐸💥 Pepe doesn't chase. Luck does. STACK XI on Base.",
  },
  {
    id: "stopped-chasing",
    chapter: "03",
    title: "He stopped chasing attention.",
    line: "No more performing for the feed. He picked a side, locked a prediction, and let the match do the talking.",
    image: "/pepesoccerbeer.jpg",
    sharePost:
      "Chapter 3: He stopped chasing attention. 🐸⚽ Pick a match. Lock your call. STACK XI matchday culture.",
  },
  {
    id: "building-culture",
    chapter: "04",
    title: "He started building culture.",
    line: "Predictions became receipts. Receipts became community. Community became STACK XI — your matchday legacy with Pepe.",
    image: "/pepeheadball.jpg",
    sharePost:
      "Chapter 4: He started building culture. 🐸🏟️ STACK XI — predict matches, earn your card, join the squad.",
  },
].map((chapter) => ({
  ...chapter,
  sharePost: ensureShareUrl(chapter.sharePost),
}));
