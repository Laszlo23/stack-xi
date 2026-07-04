#!/usr/bin/env bun
/**
 * Sponsor security + eligibility smoke tests.
 * Run: bun run test:sponsor-security
 */
import { createPublicClient, http, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import { PREDICTION_SPONSOR_ABI } from "../src/lib/base/config.ts";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

async function main() {
  console.log("Sponsor security tests\n");

  const rpc = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const sponsor = process.env.VITE_PREDICTION_SPONSOR_ADDRESS;
  const pool = process.env.VITE_PREDICTION_POOL_ADDRESS;
  const siteUrl = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
    /\/$/,
    "",
  );

  assert(sponsor?.startsWith("0x") ?? false, "VITE_PREDICTION_SPONSOR_ADDRESS configured");
  assert(pool?.startsWith("0x") ?? false, "VITE_PREDICTION_POOL_ADDRESS configured");

  if (!sponsor?.startsWith("0x")) {
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }

  const client = createPublicClient({ chain: base, transport: http(rpc) });

  const SPONSOR_ABI = [
    ...PREDICTION_SPONSOR_ABI,
    {
      type: "function",
      name: "allowed",
      stateMutability: "view",
      inputs: [{ name: "user", type: "address" }],
      outputs: [{ type: "bool" }],
    },
  ] as const;

  const [remaining, vaultCheck] = await Promise.all([
    client.readContract({
      address: sponsor as `0x${string}`,
      abi: SPONSOR_ABI,
      functionName: "remainingSlots",
    }),
    client.readContract({
      address: sponsor as `0x${string}`,
      abi: SPONSOR_ABI,
      functionName: "remainingSlots",
    }),
  ]);

  assert(Number(remaining) > 0, `Sponsor has ${remaining} slots remaining`);
  assert(Number(vaultCheck) <= 77, "Slot cap sane (≤77)");

  const unverifiedWallet = "0x000000000000000000000000000000000000dEaD" as const;
  let hasAllowlist = true;
  try {
    const allowed = await client.readContract({
      address: sponsor as `0x${string}`,
      abi: SPONSOR_ABI,
      functionName: "allowed",
      args: [unverifiedWallet],
    });
    assert(allowed === false, "Unverified wallet not on allowlist");

    const eligible = await client.readContract({
      address: sponsor as `0x${string}`,
      abi: SPONSOR_ABI,
      functionName: "isEligible",
      args: [unverifiedWallet],
    });
    assert(eligible === false, "Unverified wallet fails isEligible");

    const calldata = encodeFunctionData({
      abi: SPONSOR_ABI,
      functionName: "sponsoredPredict",
      args: ["test-match", true],
    });

    try {
      await client.call({
        account: unverifiedWallet,
        to: sponsor as `0x${string}`,
        data: calldata,
      });
      assert(false, "Direct sponsoredPredict should revert for unverified wallet");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      assert(
        message.includes("revert") || message.includes("not verified"),
        "Unverified wallet blocked on-chain (revert)",
      );
    }
  } catch {
    hasAllowlist = false;
    console.warn("  ⚠ Sponsor missing allowlist — run: bun run migrate:sponsor-gated");
  }

  assert(hasAllowlist, "Gated sponsor contract deployed (allowed mapping present)");

  const randomAddress = "0x1234567890123456789012345678901234567890";
  const apiRes = await fetch(`${siteUrl}/api/sponsor/eligibility?address=${randomAddress}`, {
    headers: { referer: `${siteUrl}/` },
  });
  assert(apiRes.ok, "Sponsor eligibility API responds");

  if (apiRes.ok) {
    const body = (await apiRes.json()) as {
      socialEligible: boolean;
      canUseSponsored: boolean;
      onChainAllowed: boolean | null;
    };
    assert(body.socialEligible === false, "Unknown wallet not socially eligible");
    assert(body.canUseSponsored === false, "Unknown wallet cannot use sponsored stake");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
