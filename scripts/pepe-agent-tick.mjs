#!/usr/bin/env node
/**
 * Trigger Pepe Farcaster agent tick on production host.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultEnvFile = path.join(root, ".env");

function loadDotenvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq < 1) continue;
    const k = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const envPath = process.env.ENV_FILE?.trim() || defaultEnvFile;
const fileEnv = loadDotenvFile(envPath);
const env = { ...fileEnv, ...process.env };

const dryRun = process.argv.includes("--dry-run");
const origin = String(env.VITE_SITE_URL || env.PEPE_AGENT_PUBLIC_ORIGIN || "")
  .trim()
  .replace(/\/$/, "");
const secret = String(
  env.PEPE_AGENT_ADMIN_SECRET ||
    env.LUCK_AGENT_ADMIN_SECRET ||
    env.X_MARKETING_ADMIN_SECRET ||
    "",
).trim();

if (!origin) {
  console.error("Missing VITE_SITE_URL or PEPE_AGENT_PUBLIC_ORIGIN in", envPath);
  process.exit(2);
}
if (!secret) {
  console.error("Missing PEPE_AGENT_ADMIN_SECRET in", envPath);
  process.exit(2);
}

const url = `${origin}/api/agents/pepe/tick`;
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-pepe-agent-admin-secret": secret,
  },
  body: JSON.stringify({ dryRun }),
});

const raw = await res.text();
let json;
try {
  json = JSON.parse(raw);
} catch {
  json = null;
}

if (!res.ok) {
  console.error("HTTP", res.status, json ?? raw);
  process.exit(1);
}

console.log(JSON.stringify(json ?? { raw }));
