#!/usr/bin/env bun
/**
 * Sync Alchemy CLI local EVM wallet into .env for VPS x402 swap payer.
 *
 * Uses `alchemy wallet address` (local EVM) + `alchemy config get wallet-key-file`.
 * The session/agent wallet (alchemy wallet connect --mode session) has no exportable
 * private key — only the local wallet works for server-side signing.
 *
 * Run: bun run sync:alchemy-cli-wallet
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = join(import.meta.dir, "..");
const ENV_PATH = join(ROOT, ".env");

function runAlchemyJson(args: string[]): unknown {
  const result = Bun.spawnSync(["alchemy", ...args], { stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) {
    const err = result.stderr.toString().trim() || result.stdout.toString().trim();
    throw new Error(`alchemy ${args.join(" ")} failed: ${err}`);
  }
  return JSON.parse(result.stdout.toString()) as unknown;
}

function upsertEnv(lines: string[], key: string, value: string): string[] {
  const prefix = `${key}=`;
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true;
      return `${prefix}${value}`;
    }
    return line;
  });
  if (!found) next.push(`${prefix}${value}`);
  return next;
}

async function main() {
  const addresses = runAlchemyJson(["wallet", "address"]) as { evm?: string; session?: { evm?: string } };
  const keyFileResult = runAlchemyJson(["config", "get", "wallet-key-file"]) as { value?: string };

  const keyFile = keyFileResult.value?.trim();
  const localAddress = addresses.evm?.trim();
  const sessionAddress = addresses.session?.evm?.trim();

  if (!keyFile) {
    console.error("No Alchemy local wallet key file. Create one:");
    console.error("  alchemy wallet connect --mode local");
    console.error("  # or import: alchemy wallet connect --mode local --import ./my-key.txt");
    process.exit(1);
  }

  const privateKey = readFileSync(keyFile, "utf8").trim();
  if (!privateKey.startsWith("0x")) {
    throw new Error(`Invalid key file format: ${keyFile}`);
  }

  const derivedAddress = privateKeyToAccount(privateKey as `0x${string}`).address;
  if (localAddress && derivedAddress.toLowerCase() !== localAddress.toLowerCase()) {
    throw new Error(`Key file does not match local EVM address (${localAddress} vs ${derivedAddress})`);
  }

  const envText = readFileSync(ENV_PATH, "utf8");
  let lines = envText.split("\n");
  lines = upsertEnv(lines, "ALCHEMY_WALLET_KEY", privateKey);
  lines = upsertEnv(lines, "ALCHEMY_PUBLIC_WALLET_ADDRESS", derivedAddress);
  lines = upsertEnv(lines, "ALCHEMY_WALLET_KEY_FILE", keyFile);
  writeFileSync(ENV_PATH, lines.join("\n"));

  console.log("Synced Alchemy CLI local wallet → .env\n");
  console.log(`  Local payer (x402):  ${derivedAddress}`);
  if (sessionAddress && sessionAddress.toLowerCase() !== derivedAddress.toLowerCase()) {
    console.log(`  Session wallet:      ${sessionAddress}  (CLI-only, not used on VPS)`);
  }
  console.log(`  Key file:            ${keyFile}`);
  console.log("\nNext:");
  console.log("  1. Fund local payer with USDC on Base (~$5–10)");
  console.log("  2. bun run setup:alchemy-swap-payer");
  console.log("  3. bun run deploy:vps");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
