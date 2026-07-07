import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { CULTURE_RAFFLE_ABI } from "@/lib/base/config";
import { RAFFLE_DRAW_DEADLINE, RAFFLE_PRIZE_BCC } from "@/lib/quest/quest-config";
import { getRaffleContractAddress, getRaffleRpcUrl } from "@/lib/server/raffle-allowlist";

export type RaffleOnchainState = {
  configured: boolean;
  contractAddress: string | null;
  totalMinted: number;
  entriesClosed: boolean;
  closeBlock: string | null;
  drawCommit: string | null;
  drawComplete: boolean;
  winnerTokenId: number | null;
  winner: string | null;
  prizeClaimed: boolean;
  prizePoolWei: string;
  prizeTargetBcc: number;
  drawDeadline: string;
  phase: "open" | "closed" | "drawn" | "claimed" | "unconfigured";
};

const ticketMintedEvent = parseAbiItem(
  "event TicketMinted(address indexed holder, uint256 indexed tokenId)",
);

export async function readRaffleOnchainState(): Promise<RaffleOnchainState> {
  const address = getRaffleContractAddress();
  const baseState: RaffleOnchainState = {
    configured: false,
    contractAddress: address,
    totalMinted: 0,
    entriesClosed: false,
    closeBlock: null,
    drawCommit: null,
    drawComplete: false,
    winnerTokenId: null,
    winner: null,
    prizeClaimed: false,
    prizePoolWei: "0",
    prizeTargetBcc: RAFFLE_PRIZE_BCC,
    drawDeadline: RAFFLE_DRAW_DEADLINE,
    phase: "unconfigured",
  };

  if (!address) return baseState;

  const client = createPublicClient({
    chain: base,
    transport: http(getRaffleRpcUrl()),
  });

  try {
    const [
      totalMinted,
      entriesClosed,
      closeBlock,
      drawCommit,
      drawComplete,
      winnerTokenId,
      winner,
      prizeClaimed,
      prizePoolWei,
    ] = await Promise.all([
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "totalMinted" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "entriesClosed" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "closeBlock" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "drawCommit" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "drawComplete" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "winnerTokenId" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "winner" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "prizeClaimed" }),
      client.readContract({ address, abi: CULTURE_RAFFLE_ABI, functionName: "prizePoolBalance" }),
    ]);

    let phase: RaffleOnchainState["phase"] = "open";
    if (prizeClaimed) phase = "claimed";
    else if (drawComplete) phase = "drawn";
    else if (entriesClosed) phase = "closed";

    return {
      configured: true,
      contractAddress: address,
      totalMinted: Number(totalMinted),
      entriesClosed: Boolean(entriesClosed),
      closeBlock: closeBlock ? closeBlock.toString() : null,
      drawCommit: drawCommit && drawCommit !== `0x${"0".repeat(64)}` ? drawCommit : null,
      drawComplete: Boolean(drawComplete),
      winnerTokenId: drawComplete && Number(winnerTokenId) > 0 ? Number(winnerTokenId) : null,
      winner:
        drawComplete && winner && winner !== "0x0000000000000000000000000000000000000000"
          ? winner
          : null,
      prizeClaimed: Boolean(prizeClaimed),
      prizePoolWei: prizePoolWei.toString(),
      prizeTargetBcc: RAFFLE_PRIZE_BCC,
      drawDeadline: RAFFLE_DRAW_DEADLINE,
      phase,
    };
  } catch {
    return { ...baseState, configured: true, phase: "unconfigured" };
  }
}

export type RaffleTicketEntry = {
  tokenId: number;
  holder: string;
  txHash: string;
};

export async function listRaffleTicketEntries(): Promise<RaffleTicketEntry[]> {
  const address = getRaffleContractAddress();
  if (!address) return [];

  const client = createPublicClient({
    chain: base,
    transport: http(getRaffleRpcUrl()),
  });

  const logs = await client.getLogs({
    address,
    event: ticketMintedEvent,
    fromBlock: 0n,
    toBlock: "latest",
  });

  return logs.map((log) => ({
    tokenId: Number(log.args.tokenId ?? 0n),
    holder: log.args.holder ?? "0x",
    txHash: log.transactionHash,
  }));
}
