import { getTeamFlagCode, teamFlagUrl, teamInitials } from "@/lib/story/team-flags";

const SIZE = {
  sm: { img: "h-5 w-7", badge: "h-5 w-7 text-[9px]", ring: "ring-1" },
  md: { img: "h-8 w-11", badge: "h-8 w-11 text-xs", ring: "ring-1" },
  lg: { img: "h-12 w-16 sm:h-14 sm:w-20", badge: "h-12 w-12 text-sm", ring: "ring-2" },
  xl: { img: "h-16 w-24 sm:h-20 sm:w-28", badge: "h-16 w-16 text-base", ring: "ring-2" },
} as const;

export function TeamFlag({
  team,
  size = "md",
  className = "",
}: {
  team: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const code = getTeamFlagCode(team);
  const url = teamFlagUrl(team, size === "xl" ? 160 : 80);
  const dims = SIZE[size];

  if (code && url) {
    return (
      <img
        src={url}
        srcSet={`${teamFlagUrl(team, 160)!} 2x`}
        alt=""
        width={80}
        height={56}
        loading="lazy"
        decoding="async"
        className={`rounded-md object-cover shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${dims.img} ${dims.ring} ring-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`grid place-items-center rounded-md bg-primary/15 font-mono font-bold text-primary ${dims.badge} ${dims.ring} ring-primary/30 ${className}`}
    >
      {teamInitials(team)}
    </div>
  );
}
