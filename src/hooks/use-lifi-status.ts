import { useEffect, useState } from "react";
import type { LifiAllowedChainId } from "@/lib/swap/lifi-config";
import { LIFI_ALLOWED_CHAIN_IDS } from "@/lib/swap/lifi-config";

export type LifiStatus = {
  configured: boolean;
  enabled: boolean;
  integrator: string;
  fee: number | null;
  ready: boolean;
};

let cachedStatus: LifiStatus | null = null;
let inflight: Promise<LifiStatus> | null = null;

async function fetchLifiStatus(): Promise<LifiStatus> {
  if (cachedStatus) return cachedStatus;
  if (inflight) return inflight;

  inflight = fetch("/api/lifi/status")
    .then(async (res) => {
      if (!res.ok) {
        return {
          configured: false,
          enabled: false,
          integrator: "stack-xi",
          fee: null,
          ready: false,
        };
      }
      return (await res.json()) as LifiStatus;
    })
    .then((data) => {
      cachedStatus = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useLifiStatus(): LifiStatus | null {
  const [status, setStatus] = useState<LifiStatus | null>(cachedStatus);

  useEffect(() => {
    let cancelled = false;
    void fetchLifiStatus().then((data) => {
      if (!cancelled) setStatus(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

export function isLifiReadyClient(status: LifiStatus | null): boolean {
  return Boolean(status?.ready);
}

export { LIFI_ALLOWED_CHAIN_IDS };
export type { LifiAllowedChainId };
