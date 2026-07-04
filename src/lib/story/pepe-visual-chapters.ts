export type PepeVisualChapter = {
  id: string;
  image: string;
  alt: string;
  chapter: string;
  title: string;
  line: string;
  sub?: string;
  sharePost: string;
  imagePosition: "left" | "right";
  accent: "neon" | "electric" | "magenta";
};

export const PEPE_VISUAL_CHAPTERS: PepeVisualChapter[] = [
  {
    id: "before-fall",
    image: "/beforefallpepepengubeer.jpg",
    alt: "Pepe dribbling with beer while PENGU slides in",
    chapter: "01",
    title: "Before the fall",
    line: "Pepe used to play like life was a friendly group stage. Beer in hand. Penguin opponent. NO REELS ONLY VIBES on the kit.",
    sub: "He wasn't winning. He wasn't losing. He was… posting through it.",
    sharePost:
      "Pepe before Luck chased him: beer, vibes, penguin slide tackle energy. NO REELS ONLY VIBES 🐸⚽ STACK XI matchday stories on Base",
    imagePosition: "left",
    accent: "neon",
  },
  {
    id: "the-fall",
    image: "/fallpepepenug.jpg",
    alt: "Pepe shocked mid-slide as PENGU charges",
    chapter: "02",
    title: "Then Luck tackled him",
    line: "Same pitch. Same penguin. Completely different energy. Pepe's face says: I did not budget for this level of abundance.",
    sub: "NO FEELS ONLY VIBE — the shirt lied. He felt everything. That's the plot twist.",
    sharePost:
      "When Luck slide-tackles your whole personality 🐸💥 Pepe felt it. STACK XI · predict on Base · mint the squad from 770 BCC",
    imagePosition: "right",
    accent: "magenta",
  },
  {
    id: "beer-wins",
    image: "/pepesoccerbeer.jpg",
    alt: "Pepe sprinting with beer and soccer ball in cyber stadium",
    chapter: "03",
    title: "No feels. Only wins.",
    line: "He stopped running from good things. Now he sprints with a beer and a ball like a man who finally read the group chat.",
    sub: "Builders on Farcaster don't chase. They show up. Pepe learned that from @jessepollak energy.",
    sharePost:
      "NO FEELS ONLY WINS — Pepe edition 🐸🍺⚽ If you're building in public, you're already on the squad. STACK XI on Base",
    imagePosition: "left",
    accent: "electric",
  },
  {
    id: "header",
    image: "/pepeheadball.jpg",
    alt: "Pepe diving header in neon stadium",
    chapter: "04",
    title: "Header your prediction",
    line: "Some people overthink the match. Pepe headers the ball and the narrative at the same time. NO FEELS ONLY GAINS.",
    sub: "Pick a side. Lock BCC. Cast it. Touch grass until kickoff.",
    sharePost:
      "Pepe said header the prediction, not your feelings 🐸⚽ 1K/5K/10K BCC picks on Base · STACK XI Dallas matchday",
    imagePosition: "right",
    accent: "neon",
  },
  {
    id: "goal",
    image: "/gaolpepe.jpg",
    alt: "Pepe scoring with water splash in cyber stadium",
    chapter: "05",
    title: "Goal energy unlocked",
    line: "When the splash hits and the stadium goes neon — that's not just a goal. That's a mint confirmation screen in real life.",
    sub: "Every founding minter gets a personal video shout-out. Leonardo tags you. The culture tags you back.",
    sharePost:
      "Goal energy = mint energy 🐸⚽ Founding squad on Base from 770 BCC (+70 BCC each mint). Video shout-out every minter. STACK XI",
    imagePosition: "left",
    accent: "magenta",
  },
  {
    id: "legend-card",
    image: "/pepecard.jpg",
    alt: "Pepe XI Legend trading card 1 of 11 NFT",
    chapter: "06",
    title: "You're on the card",
    line: "PEPE · THE ORIGINAL · 1/11 NFT. SHO 88. VIBES 999. Mint before the price curve makes your wallet emotional.",
    sub: "This squad is a team effort. Leonardo starts the show. You hold the card.",
    sharePost:
      "1/11 · PEPE THE ORIGINAL 🐸⚽ Founding squad mint live on Base. 770 BCC start · +70 BCC per mint · video shout-out included. @jessepollak @dwr builder love 💜 STACK XI",
    imagePosition: "right",
    accent: "neon",
  },
];
