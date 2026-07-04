import { useCallback, useEffect, useState } from "react";

export const SQUAD_TABS = ["mint", "holdings", "points", "leaderboard", "swap"] as const;

export type SquadTab = (typeof SQUAD_TABS)[number];

function isSquadTab(value: string): value is SquadTab {
  return (SQUAD_TABS as readonly string[]).includes(value);
}

function readTabFromUrl(): SquadTab {
  if (typeof window === "undefined") return "mint";
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && isSquadTab(tab)) return tab;
  if (window.location.hash.replace("#", "") === "squad") return "mint";
  return "mint";
}

export function useSquadTab() {
  const [tab, setTabState] = useState<SquadTab>(() => readTabFromUrl());

  useEffect(() => {
    const sync = () => setTabState(readTabFromUrl());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const setTab = useCallback((next: SquadTab) => {
    setTabState(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    url.hash = "squad";
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return { tab, setTab };
}

export function squadTabLabel(tab: SquadTab): string {
  switch (tab) {
    case "mint":
      return "Mint";
    case "holdings":
      return "My Squad";
    case "points":
      return "Points";
    case "leaderboard":
      return "Leaderboard";
    case "swap":
      return "Swap BCC";
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}
