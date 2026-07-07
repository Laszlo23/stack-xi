import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import {
  SQUAD_NFT_ABI,
  SQUAD_NFT_ADDRESS,
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  isSquadContractConfigured,
  isSquadV2Configured,
} from "@/lib/base/config";
import { computeSquadPerks, type PerkSnapshot, type SquadHoldingsInput } from "@/lib/squad/perk-tiers";

function getServerRpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    (process.env.ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.trim()}`
      : base.rpcUrls.default.http[0])
  );
}

async function countGenesisHoldings(
  client: ReturnType<typeof createPublicClient>,
  address: `0x${string}`,
): Promise<number> {
  if (!isSquadContractConfigured() || !SQUAD_NFT_ADDRESS) return 0;
  let count = 0;
  for (let playerId = 1; playerId <= 11; playerId++) {
    try {
      const owner = await client.readContract({
        address: SQUAD_NFT_ADDRESS,
        abi: SQUAD_NFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(playerId)],
      });
      if (owner.toLowerCase() === address.toLowerCase()) count++;
    } catch {
      // not minted or not owned
    }
  }
  return count;
}

async function readV2Holdings(
  client: ReturnType<typeof createPublicClient>,
  address: `0x${string}`,
): Promise<Pick<SquadHoldingsInput, "v2RevealedCount" | "v2UniquePlayers" | "isEarlyBeliever">> {
  if (!isSquadV2Configured() || !SQUAD_NFT_V2_ADDRESS) {
    return { v2RevealedCount: 0, v2UniquePlayers: 0, isEarlyBeliever: false };
  }

  const [balance, isEarlyBeliever] = await Promise.all([
    client.readContract({
      address: SQUAD_NFT_V2_ADDRESS,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "balanceOf",
      args: [address],
    }),
    client.readContract({
      address: SQUAD_NFT_V2_ADDRESS,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "earlyBeliever",
      args: [address],
    }),
  ]);

  const uniquePlayers = new Set<number>();
  let revealedCount = 0;

  for (let i = 0n; i < balance; i++) {
    const tokenId = await client.readContract({
      address: SQUAD_NFT_V2_ADDRESS,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: [address, i],
    });
    const revealed = await client.readContract({
      address: SQUAD_NFT_V2_ADDRESS,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "revealed",
      args: [tokenId],
    });
    if (!revealed) continue;
    revealedCount++;
    const playerId = Number(
      await client.readContract({
        address: SQUAD_NFT_V2_ADDRESS,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "tokenPlayerId",
        args: [tokenId],
      }),
    );
    if (playerId >= 1 && playerId <= 11) uniquePlayers.add(playerId);
  }

  return {
    v2RevealedCount: revealedCount,
    v2UniquePlayers: uniquePlayers.size,
    isEarlyBeliever,
  };
}

export async function fetchSquadPerksForAddress(address: `0x${string}`): Promise<PerkSnapshot> {
  const client = createPublicClient({
    chain: base,
    transport: http(getServerRpcUrl()),
  });

  const [genesisCount, v2] = await Promise.all([
    countGenesisHoldings(client, address),
    readV2Holdings(client, address),
  ]);

  return computeSquadPerks({
    genesisCount,
    ...v2,
  });
}
