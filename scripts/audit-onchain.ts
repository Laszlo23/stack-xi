#!/usr/bin/env bun
/**
 * Unified onchain audit — contracts, links, lint, build, optional 0x smoke test.
 * Run: bun run audit:onchain
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

function run(label: string, cmd: string, args: string[]): boolean {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed`);
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
}

async function smokeZeroX(): Promise<boolean> {
  if (!process.env.ZEROX_API_KEY) {
    console.log("\n⊘ Skipping 0x smoke test (ZEROX_API_KEY not set)");
    return true;
  }

  console.log("\n▶ 0x price smoke test");
  const { proxyZeroXPrice } = await import("../src/lib/swap/zerox-proxy.ts");
  try {
    await proxyZeroXPrice({
      sellToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      buyToken: "0xb890a5289f789f1346032ccc1847939e855fab07",
      sellAmount: "1000000",
      taker: "0x0000000000000000000000000000000000000001",
      slippageBps: 100,
    });
    console.log("✓ 0x price smoke test");
    return true;
  } catch (err) {
    console.error("✗ 0x price smoke test:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function main() {
  console.log("Onchain audit\n");

  const steps = [
    run("contracts:build", "bun", ["run", "contracts:build"]),
    run("verify:bcc", "bun", ["run", "verify:bcc"]),
    run("verify:contracts", "bun", ["run", "verify:contracts"]),
    run("check:links", "bun", ["run", "check:links"]),
    run("test:bcc-flows", "bun", ["run", "test:bcc-flows"]),
    run("lint", "bun", ["run", "lint"]),
    run("build", "bun", ["run", "build"]),
  ];

  const zeroXOk = await smokeZeroX();

  const envExample = readFileSync(join(ROOT, ".env.example"), "utf8");
  const hasZeroXDoc = envExample.includes("ZEROX_API_KEY");
  const hasDexDoc = envExample.includes("VITE_DEXSCREENER_POOL_URL");
  if (!hasZeroXDoc || !hasDexDoc) {
    console.error("\n✗ .env.example missing ZEROX_API_KEY or VITE_DEXSCREENER_POOL_URL");
    steps.push(false);
  } else {
    console.log("\n✓ .env.example documents swap env vars");
  }

  const allOk = steps.every(Boolean) && zeroXOk;
  console.log(`\n${allOk ? "All audits passed" : "Audit failed"}`);
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
