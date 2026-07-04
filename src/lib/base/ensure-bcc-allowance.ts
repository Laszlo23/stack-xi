import type { PublicClient } from "viem";
import { maxUint256 } from "viem";
import { BCC_TOKEN_ADDRESS, ERC20_ABI } from "./config";

export type WriteContractFn = (args: {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args: unknown[];
}) => Promise<`0x${string}`>;

/** Skip approve when allowance covers amount; otherwise one max approve per spender. */
export async function ensureBccAllowance(
  publicClient: PublicClient,
  writeContract: WriteContractFn,
  owner: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint,
): Promise<`0x${string}` | null> {
  const allowance = await publicClient.readContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [owner, spender],
  });

  if (allowance >= amount) {
    return null;
  }

  const hash = await writeContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spender, maxUint256],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
