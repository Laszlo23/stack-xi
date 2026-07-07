/** ISO 3166-1 alpha-2 codes for flagcdn.com (England uses gb-eng). */
const TEAM_FLAG_CODES: Record<string, string> = {
  Netherlands: "nl",
  Japan: "jp",
  England: "gb-eng",
  Croatia: "hr",
  Argentina: "ar",
  Austria: "at",
  Sweden: "se",
  Jordan: "jo",
  "Côte d'Ivoire": "ci",
  Norway: "no",
  Australia: "au",
  Egypt: "eg",
  Portugal: "pt",
  Spain: "es",
  USA: "us",
  Belgium: "be",
  Switzerland: "ch",
  Colombia: "co",
  France: "fr",
};

export function getTeamFlagCode(team: string): string | null {
  return TEAM_FLAG_CODES[team] ?? null;
}

export function teamFlagUrl(team: string, width = 80): string | null {
  const code = getTeamFlagCode(team);
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}

export function teamInitials(team: string): string {
  const words = team.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return team.slice(0, 3).toUpperCase();
}
