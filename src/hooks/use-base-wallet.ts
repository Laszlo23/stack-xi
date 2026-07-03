import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from "wagmi";
import { getAccount } from "wagmi/actions";
import { ERC20_ABI, USDC_ADDRESS, formatUsdc } from "@/lib/base/config";
import { wagmiConfig } from "@/lib/base/wagmi-config";

export function useBaseWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const { data: usdcBalance = 0n } = useReadContract({
    address: USDC_ADDRESS,
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

  async function approveUsdc(spender: `0x${string}`, amount: bigint) {
    const owner = getAccount(wagmiConfig).address ?? address;
    if (!owner) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  return {
    address,
    isConnected,
    isConnecting,
    usdcBalance,
    usdcBalanceLabel: formatUsdc(usdcBalance),
    connectWallet,
    disconnectWallet: disconnect,
    writeContractAsync,
    approveUsdc,
  };
}
