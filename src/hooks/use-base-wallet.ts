import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { getAccount } from "wagmi/actions";
import {
  BCC_TOKEN_ADDRESS,
  BCC_SYMBOL,
  ERC20_ABI,
  USDC_ADDRESS,
  formatBcc,
  formatUsdc,
} from "@/lib/base/config";
import { ensureBccAllowance } from "@/lib/base/ensure-bcc-allowance";
import { wagmiConfig } from "@/lib/base/wagmi-config";

export function useBaseWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

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

  async function connectWallet(): Promise<`0x${string}`> {
    const active = getAccount(wagmiConfig);
    if (active.address) return active.address;

    const connector = connectors[0];
    if (!connector) throw new Error("No wallet connector available");
    const result = await connectAsync({ connector });
    const connected = result.accounts[0];
    if (!connected) throw new Error("Wallet connection failed");
    return connected;
  }

  async function approveToken(token: `0x${string}`, spender: `0x${string}`, amount: bigint) {
    const owner = getAccount(wagmiConfig).address ?? address;
    if (!owner) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  async function ensureBccAllowanceFor(spender: `0x${string}`, amount: bigint) {
    const owner = getAccount(wagmiConfig).address ?? address;
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

  return {
    address,
    isConnected,
    isConnecting,
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
