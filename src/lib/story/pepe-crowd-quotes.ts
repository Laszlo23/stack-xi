/** English fallback when i18n quote array is unavailable. */
export const PEPE_CROWD_QUOTES_FALLBACK = [
  "Crowd is loud. Pepe is calm. That's the edge. 🐸",
  "They chase hype. You chase the whistle. Different sport.",
  "Luck doesn't ask permission — and neither should your conviction.",
  "The masses panic at 89'. Builders lock in before kickoff.",
  "Pepe doesn't chase. Luck does. Tag in.",
  "Consensus is comfortable. Correct picks rarely are.",
  "Your pick. Your stake. Your story on Base.",
  "Wrong crowd, right read — that's the whole game.",
  "Fortune favors the frog who ships before the whistle.",
  "Everyone has an opinion. Few have a receipt.",
  "The feed screams. The pitch decides. Stay seated.",
  "Conviction beats consensus. Every matchday.",
] as const;

export const PEPE_CROWD_QUOTE_COUNT = PEPE_CROWD_QUOTES_FALLBACK.length;

export function pickPepeCrowdQuote(seed: number): string {
  const index = Math.abs(seed) % PEPE_CROWD_QUOTE_COUNT;
  return PEPE_CROWD_QUOTES_FALLBACK[index]!;
}
