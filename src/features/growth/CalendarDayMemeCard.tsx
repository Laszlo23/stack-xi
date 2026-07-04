import { forwardRef } from "react";
import { EXPORT_COLORS } from "@/lib/share/export-colors";
import type { ViralCalendarDay } from "@/lib/growth/viral-calendar";

const GRAY = {
  300: "#d1d5db",
  400: "#9ca3af",
  500: "#6b7280",
  white: "#ffffff",
} as const;

export const CalendarDayMemeCard = forwardRef<
  HTMLDivElement,
  { day: ViralCalendarDay; matchLine?: string }
>(function CalendarDayMemeCard({ day, matchLine }, ref) {
  const subtitle = matchLine ?? day.matchContext;

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
          STACK XI · Day {day.dayNumber}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
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
              src={day.pepeImage}
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
              {day.theme}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: GRAY[300] }}>{day.hook}</div>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 14, color: GRAY[400] }}>{subtitle}</p>

        <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: GRAY.white }}>
          {day.xPost}
        </p>

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
          <span>{day.dateLabel}</span>
          <span>Pepe doesn&apos;t chase · Luck does</span>
        </div>
      </div>
    </div>
  );
});
