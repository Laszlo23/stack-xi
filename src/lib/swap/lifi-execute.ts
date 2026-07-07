import type { LiFiStep } from "@lifi/sdk";
import { getAccount, getPublicClient, getWalletClient, switchChain } from "@wagmi/core";
import { getAddress, maxUint256 } from "viem";
import type { Config } from "wagmi";
import { BASESCAN_URL, ERC20_ABI } from "@/lib/base/config";
import { ETH_PLACEHOLDER } from "@/lib/swap/swap-config";
import { LIFI_NATIVE_TOKEN } from "@/lib/swap/lifi-config";

function isNativeLifiToken(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === LIFI_NATIVE_TOKEN.toLowerCase() ||
    normalized === ETH_PLACEHOLDER.toLowerCase()
  );
}

export async function fetchLifiStepTransaction(step: LiFiStep): Promise<LiFiStep> {
  const res = await fetch("/api/lifi/step-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });

  const data = (await res.json()) as LiFiStep | { error?: string };
  if (!res.ok) {
    const message =
      "error" in data && data.error ? data.error : `Step transaction failed (${res.status})`;
    throw new Error(message);
  }

  return data as LiFiStep;
}

function parseHexBigInt(value: string | number | bigint | undefined): bigint | undefined {
  if (value == null) return undefined;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (value.startsWith("0x")) return BigInt(value);
  return BigInt(value);
}

export async function executeLifiSwap(params: {
  wagmiConfig: Config;
  step: LiFiStep;
  onProgress?: (label: string) => void;
}): Promise<{ hash: `0x${string}`; explorerUrl: string }> {
  const { wagmiConfig, step, onProgress } = params;
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.address) {
    throw new Error("Connect your wallet to swap");
  }
  const owner = getAddress(account.address);

  const chainId = step.action.fromChainId;
  if (account.chainId !== chainId) {
    onProgress?.("Switch network in your wallet…");
    await switchChain(wagmiConfig, { chainId });
  }

  const walletClient = await getWalletClient(wagmiConfig, { chainId });
  if (!walletClient) {
    throw new Error("Wallet not ready — wait for sync to finish or reconnect");
  }

  const preparedStep: LiFiStep = {
    ...step,
    action: {
      ...step.action,
      fromAddress: owner,
    },
  };

  onProgress?.("Preparing transaction…");
  const stepWithTx = await fetchLifiStepTransaction(preparedStep);
  const tx = stepWithTx.transactionRequest;
  if (!tx?.to || !tx.data) {
    throw new Error("LI.FI did not return swap transaction data");
  }

  const fromTokenAddress = stepWithTx.action.fromToken.address;
  const approvalAddress = stepWithTx.estimate?.approvalAddress as `0x${string}` | undefined;
  const fromAmount = BigInt(stepWithTx.action.fromAmount);

  if (!isNativeLifiToken(fromTokenAddress) && approvalAddress) {
    const publicClient = getPublicClient(wagmiConfig, { chainId });
    if (!publicClient) {
      throw new Error("RPC client not ready");
    }

    const tokenAddress = fromTokenAddress as `0x${string}`;
    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, approvalAddress],
    });

    if (allowance < fromAmount) {
      onProgress?.("Approve token spend in your wallet…");
      const approveHash = await walletClient.writeContract({
        account: owner,
        chain: walletClient.chain,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [approvalAddress, maxUint256],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }
  }

  onProgress?.("Confirm swap in your wallet…");
  const hash = await walletClient.sendTransaction({
    account: owner,
    chain: walletClient.chain,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    value: parseHexBigInt(tx.value) ?? 0n,
    gas: parseHexBigInt(tx.gasLimit),
  });

  return {
    hash,
    explorerUrl: `${BASESCAN_URL}/tx/${hash}`,
  };
}
