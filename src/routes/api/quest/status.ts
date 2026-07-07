import { createFileRoute } from "@tanstack/react-router";
import { allQuestStepsComplete, QUEST_STEPS, RAFFLE_DRAW_DEADLINE, RAFFLE_PRIZE_BCC } from "@/lib/quest/quest-config";
import { getQuestProgress } from "@/lib/server/quest-storage";
import { getWalletSocialLinks } from "@/lib/server/social-storage";
import { readRaffleOnchainState } from "@/lib/server/raffle-chain";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CULTURE_RAFFLE_ABI, RAFFLE_TICKET_ADDRESS } from "@/lib/base/config";
import { getRaffleRpcUrl } from "@/lib/server/raffle-allowlist";

async function syncConnectStep(address: string) {
  const links = await getWalletSocialLinks(address);
  const connected = Boolean(links?.x && links?.farcaster);
  if (connected) {
    const { setQuestStep, getQuestProgress: getProgress } = await import("@/lib/server/quest-storage");
    await setQuestStep(address, "connect", true);
    return getProgress(address);
  }
  return getQuestProgress(address);
}

export const Route = createFileRoute("/api/quest/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();

        if (!address?.startsWith("0x") || address.length !== 42) {
          return Response.json({ error: "invalid_address" }, { status: 400 });
        }

        const progress = await syncConnectStep(address);
        const raffle = await readRaffleOnchainState();

        let onchainAllowed = false;
        let onchainHasMinted = false;
        let ticketBalance = 0;

        if (RAFFLE_TICKET_ADDRESS?.startsWith("0x")) {
          const client = createPublicClient({
            chain: base,
            transport: http(getRaffleRpcUrl()),
          });
          const normalized = address.toLowerCase() as `0x${string}`;
          try {
            [onchainAllowed, onchainHasMinted, ticketBalance] = await Promise.all([
              client.readContract({
                address: RAFFLE_TICKET_ADDRESS,
                abi: CULTURE_RAFFLE_ABI,
                functionName: "allowed",
                args: [normalized],
              }),
              client.readContract({
                address: RAFFLE_TICKET_ADDRESS,
                abi: CULTURE_RAFFLE_ABI,
                functionName: "hasMinted",
                args: [normalized],
              }),
              client.readContract({
                address: RAFFLE_TICKET_ADDRESS,
                abi: CULTURE_RAFFLE_ABI,
                functionName: "balanceOf",
                args: [normalized],
              }),
            ]);
            ticketBalance = Number(ticketBalance);
          } catch {
            /* contract may not be deployed yet */
          }
        }

        return Response.json({
          progress,
          steps: QUEST_STEPS,
          prizeBcc: RAFFLE_PRIZE_BCC,
          drawDeadline: RAFFLE_DRAW_DEADLINE,
          allComplete: allQuestStepsComplete(progress.steps),
          mintApproved: Boolean(progress.mintApprovedAt),
          raffle,
          onchain: {
            allowed: onchainAllowed,
            hasMinted: onchainHasMinted,
            ticketBalance,
            contractAddress: RAFFLE_TICKET_ADDRESS ?? null,
          },
        });
      },
    },
  },
});
