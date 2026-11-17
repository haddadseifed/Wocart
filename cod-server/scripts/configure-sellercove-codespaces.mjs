#!/usr/bin/env node
/**
 * Configure ignored, local-only environment files for a GitHub Codespace.
 * Derives forwarded origins from GitHub's documented Codespaces environment
 * variables; never changes port visibility and never prints secret values.
 */
import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const codespaceName = process.env.CODESPACE_NAME?.trim();
const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN?.trim();

if (!codespaceName || !forwardingDomain) {
  throw new Error("Run this script inside GitHub Codespaces; CODESPACE_NAME and GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN are required.");
}
if (!/^[a-z0-9-]+$/i.test(codespaceName) || !/^[a-z0-9.-]+$/i.test(forwardingDomain)) {
  throw new Error("Unexpected Codespaces forwarding host values; no local files were changed.");
}

const originFor = (port) => new URL(`https://${codespaceName}-${port}.${forwardingDomain}`).origin;
const dashboardOrigin = originFor(4321);
const storefrontOrigin = originFor(4322);
const apiOrigin = originFor(8787);

function existingValue(path, key) {
  if (!existsSync(path)) return "";
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const line = readFileSync(path, "utf8").split(/\r?\n/).find((row) =>
    new RegExp(`^\\s*(?:export\\s+)?${escaped}\\s*=`).test(row),
  );
  if (!line) return "";
  const raw = line.slice(line.indexOf("=") + 1).trim();
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1); }
  }
  if (raw.length >= 2 && raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1);
  return raw;
}

function formatValue(value) {
  return /^[a-z0-9_./:,=+-]+$/i.test(value) ? value : JSON.stringify(value);
}

function upsertEnvFile(path, values) {
  mkdirSync(dirname(path), { recursive: true });
  const original = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = original ? original.split(/\r?\n/) : [];
  const seen = new Set();
  const output = [];

  for (const line of lines) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    const key = match?.[1];
    if (!key || !(key in values)) {
      output.push(line);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(`${key}=${formatValue(values[key])}`);
  }

  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) output.push(`${key}=${formatValue(value)}`);
  }

  const content = output.join("\n").replace(/\n*$/, "\n");
  writeFileSync(path, content, { encoding: "utf8", mode: 0o600 });
  chmodSync(path, 0o600);
}

const serverVars = resolve(root, "cod-server/.dev.vars");
const storefrontVars = resolve(root, "cod-astro/sellercove/.dev.vars");
const dashboardVars = resolve(root, "cod-client-astro/.dev.vars");
const serverKey = existingValue(serverVars, "STORE_API_KEY");
const storefrontKey = existingValue(storefrontVars, "STORE_API_KEY");

if (serverKey && storefrontKey && serverKey !== storefrontKey) {
  throw new Error("STORE_API_KEY differs between cod-server/.dev.vars and cod-astro/sellercove/.dev.vars. Reconcile those local values, then rerun; neither file was changed.");
}
const storeApiKey = serverKey || storefrontKey || "codflow-dev-store-key";
const authSecret = existingValue(dashboardVars, "BETTER_AUTH_SECRET") || randomBytes(32).toString("base64url");

upsertEnvFile(serverVars, {
  STORE_API_KEY: storeApiKey,
  ALLOWED_ORIGINS: `${dashboardOrigin},${storefrontOrigin}`,
});
upsertEnvFile(storefrontVars, {
  STORE_API_KEY: storeApiKey,
  COD_SERVER_URL: "http://localhost:8787",
});
upsertEnvFile(dashboardVars, {
  BETTER_AUTH_SECRET: authSecret,
  PUBLIC_APP_URL: dashboardOrigin,
  PUBLIC_TRUSTED_ORIGINS: dashboardOrigin,
  PUBLIC_API_URL: apiOrigin,
});

console.log("[SellerCove] Local Codespaces environment configured.");
console.log(`Dashboard origin: ${dashboardOrigin}`);
console.log(`Storefront origin: ${storefrontOrigin}`);
console.log(`API origin: ${apiOrigin}`);
console.log("[SellerCove] Existing local secrets and unrelated .dev.vars entries were preserved.");
console.log("[SellerCove] Port visibility was not changed; keep all three ports private.");
