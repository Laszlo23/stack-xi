import { forwardRef } from "react";
import { EXPORT_COLORS } from "@/lib/share/export-colors";

export type MemeShareCardProps = {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
  homePct?: number;
  awayPct?: number;
  pepeSrc?: string;
  subtitle?: string;
};

const GRAY = {
  300: "#d1d5db",
  400: "#9ca3af",
  500: "#6b7280",
  white: "#ffffff",
} as const;

export const MemeShareCard = forwardRef<HTMLDivElement, MemeShareCardProps>(function MemeShareCard(
  {
    home,
    away,
    pick,
    stakeLabel,
    homePct = 50,
    awayPct = 50,
    pepeSrc = "/pepeheadball.jpg",
    subtitle = "My prediction is locked.",
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: 400,
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundColor: EXPORT_COLORS.bgOuter,
        border: `2px solid ${EXPORT_COLORS.neonBorder}`,
        borderRadius: 16,
        padding: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: EXPORT_COLORS.bgInner,
          borderRadius: 12,
          padding: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: EXPORT_COLORS.neon,
          }}
        >
          STACK XI · Winner call
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${EXPORT_COLORS.neonBorderSoft}`,
            }}
          >
            <img
              src={pepeSrc}
              alt=""
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1, color: GRAY.white }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.25,
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {home} vs {away}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: EXPORT_COLORS.neon }}>
              Locked: {pick}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: GRAY[400],
                }}
              >
                Stake
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: EXPORT_COLORS.neon,
                  textShadow: `0 0 20px ${EXPORT_COLORS.neonGlow}`,
                }}
              >
                ${stakeLabel.replace(/^\$/, "")}
              </span>
              <span style={{ fontSize: 12, color: GRAY[400] }}>BCC</span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 20, fontSize: 14, color: GRAY[300] }}>{subtitle}</p>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: GRAY[400], marginBottom: 6 }}>{home}</div>
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "#374151" }}>
            <div style={{ width: `${homePct}%`, background: EXPORT_COLORS.neon }} />
            <div style={{ width: `${awayPct}%`, background: "#60a5fa" }} />
          </div>
          <div style={{ fontSize: 12, color: GRAY[400], marginTop: 6, textAlign: "right" }}>{away}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY[500], marginTop: 4 }}>
            <span>{homePct}%</span>
            <span>{awayPct}%</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 16,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: GRAY[500],
          }}
        >
          <span>Base mainnet</span>
          <span>Pepe doesn&apos;t chase · Luck does</span>
        </div>
      </div>
    </div>
  );
});
