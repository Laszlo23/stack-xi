import { useCallback, useEffect, useState } from "react";

import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";

type WorldStatus = {
  verified: boolean;
  verifiedAt?: string | null;
};

export function useWorldVerification() {
  const { address } = useConnectBaseWallet();
  const [status, setStatus] = useState<WorldStatus>({ verified: false });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) {
      setStatus({ verified: false });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/social/status?address=${address}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        worldId?: { verified?: boolean; verifiedAt?: string | null } | null;
      };
      setStatus({
        verified: Boolean(data.worldId?.verified),
        verifiedAt: data.worldId?.verifiedAt ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...status, loading, refresh };
}
