import { useCallback, useState } from "react";
import {
  useAccount,
  useConfig,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { connect, getAccount, getConnectors } from "wagmi/actions";
import type { Config, Connector } from "wagmi";
import {
  BCC_TOKEN_ADDRESS,
  BCC_SYMBOL,
  ERC20_ABI,
  USDC_ADDRESS,
  formatBcc,
  formatUsdc,
} from "@/lib/base/config";
import { ensureBccAllowance } from "@/lib/base/ensure-bcc-allowance";
import {
  formatWalletConnectError,
  getWalletConnectorsInOrder,
  isWalletConnectUserRejection,
} from "@/lib/base/pick-wallet-connector";
import { isTelegramMiniApp } from "@/lib/telegram/types";

async function waitForConnectors(config: Config, timeoutMs = 6_000): Promise<readonly Connector[]> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const connectors = getConnectors(config);
    if (connectors.length > 0) return connectors;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return getConnectors(config);
}

async function connectWithFallback(
  config: Config,
  candidates: Connector[],
): Promise<`0x${string}`> {
  let lastError: unknown;

  for (const connector of candidates) {
    try {
      const result = await connect(config, { connector });
      const connected = result.accounts[0];
      if (connected) return connected;
    } catch (error) {
      lastError = error;
      if (isWalletConnectUserRejection(error)) throw error;
    }
  }

  if (lastError instanceof Error && lastError.message.trim()) {
    throw lastError;
  }
  throw new Error("Could not connect wallet — try MetaMask, Coinbase Wallet, or WalletConnect");
}

export function useBaseWallet() {
  const config = useConfig();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [connectPending, setConnectPending] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const { data: usdcBalance = 0n } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: bccBalance = 0n, refetch: refetchBccBalance } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const connectWallet = useCallback(async (): Promise<`0x${string}`> => {
    const active = getAccount(config);
    if (active.address) return active.address;

    setConnectError(null);
    setConnectPending(true);

    try {
      const connectors = await waitForConnectors(config);
      const candidates = getWalletConnectorsInOrder(connectors, {
        preferWalletConnect: isTelegramMiniApp(),
      });

      if (candidates.length === 0) {
        const message = "No wallet connector available";
        setConnectError(message);
        throw new Error(message);
      }

      return await connectWithFallback(config, candidates);
    } catch (error) {
      if (!isWalletConnectUserRejection(error)) {
        const message = formatWalletConnectError(error);
        setConnectError(message);
      }
      throw error;
    } finally {
      setConnectPending(false);
    }
  }, [config]);

  async function approveToken(token: `0x${string}`, spender: `0x${string}`, amount: bigint) {
    const owner = getAccount(config).address ?? address;
    if (!owner) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  async function ensureBccAllowanceFor(spender: `0x${string}`, amount: bigint) {
    const owner = getAccount(config).address ?? address;
    if (!owner) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("RPC client not ready");
    return ensureBccAllowance(publicClient, writeContractAsync, owner, spender, amount);
  }

  async function approveBcc(spender: `0x${string}`, amount: bigint) {
    return ensureBccAllowanceFor(spender, amount);
  }

  async function approveUsdc(spender: `0x${string}`, amount: bigint) {
    return approveToken(USDC_ADDRESS, spender, amount);
  }

  const isConnectBusy = isConnecting || connectPending;

  return {
    address,
    isConnected,
    isConnecting: isConnectBusy,
    connectPending,
    connectError,
    clearConnectError: () => setConnectError(null),
    usdcBalance,
    usdcBalanceLabel: formatUsdc(usdcBalance),
    bccBalance,
    bccBalanceLabel: formatBcc(bccBalance),
    bccSymbol: BCC_SYMBOL,
    connectWallet,
    disconnectWallet: disconnect,
    writeContractAsync,
    approveUsdc,
    approveBcc,
    ensureBccAllowance: ensureBccAllowanceFor,
    approveToken,
    refetchBccBalance,
    publicClient,
  };
}
