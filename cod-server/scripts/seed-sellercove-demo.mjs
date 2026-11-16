#!/usr/bin/env node
/**
 * Creates two synthetic SellerCove sellers and portal users in LOCAL D1 only.
 * Run after: npm run db:setup:local
 *
 * This script deliberately has no --remote mode. It never creates Cloudflare
 * resources, deploys, or reads customer data. Fixed IDs + INSERT OR IGNORE make
 * the fixture repeatable without deleting or resetting existing rows.
 */
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { getCloudEnv } from "./cloud-env.mjs";

if (process.argv.includes("--remote") || process.argv.includes("--production")) {
  throw new Error("Refusing remote/production execution. This fixture is local-only.");
}

const { dbName } = getCloudEnv();
const scryptAsync = promisify(scrypt);
const SCRYPT = { N: 16384, r: 16, p: 1, dkLen: 64 };
const STORE_ID = "store-local-dev";
const now = new Date().toISOString();
const q = (value) => "'" + String(value).replace(/'/g, "''") + "'";
const passwordA = process.env.SELLERCOVE_SELLER_A_PASSWORD ?? "SellerA-local-only-2026!";
const passwordB = process.env.SELLERCOVE_SELLER_B_PASSWORD ?? "SellerB-local-only-2026!";

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password.normalize("NFKC"), salt, SCRYPT.dkLen, {
    N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 128 * SCRYPT.N * SCRYPT.r * 2,
  });
  return salt + ":" + key.toString("hex");
}

const users = [
  { id: "sellercove-demo-seller-a", name: "SellerCove Demo Seller A", email: "seller-a@example.test", password: passwordA, seller: "sellercove-demo-seller-a", membership: "sellercove-demo-membership-a", role: "owner" },
  { id: "sellercove-demo-seller-b", name: "SellerCove Demo Seller B", email: "seller-b@example.test", password: passwordB, seller: "sellercove-demo-seller-b", membership: "sellercove-demo-membership-b", role: "owner" },
];
const statements = [
  `UPDATE stores SET cart_enabled = 1, updated_at = ${q(now)} WHERE id = ${q(STORE_ID)}`,
  ...users.flatMap((u) => [
    `INSERT OR IGNORE INTO users (id, name, email, email_verified, role, status, created_at, updated_at, language) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, 'staff', 'active', ${Date.now()}, ${Date.now()}, 'ar')`,
    `INSERT OR IGNORE INTO accounts (id, user_id, account_id, provider_id, issuer, password, created_at, updated_at) VALUES (${q("account-" + u.id)}, ${q(u.id)}, ${q(u.id)}, 'credential', 'local:credential', ${q("__PASSWORD__" + u.id)}, ${Date.now()}, ${Date.now()})`,
    `INSERT OR IGNORE INTO sellers (id, store_id, name, slug, description, status, approved_at, created_at, updated_at) VALUES (${q(u.seller)}, ${q(STORE_ID)}, ${q(u.name)}, ${q(u.email.startsWith("seller-a") ? "demo-seller-a" : "demo-seller-b")}, 'Synthetic local test seller', 'approved', ${q(now)}, ${q(now)}, ${q(now)})`,
    `INSERT OR IGNORE INTO seller_memberships (id, seller_id, user_id, role, status, created_at) VALUES (${q(u.membership)}, ${q(u.seller)}, ${q(u.id)}, ${q(u.role)}, 'active', ${q(now)})`,
  ]),
  `INSERT OR IGNORE INTO products (id, name, description, handle, currency, price, type, has_variants, sku, inventory, track_inventory, low_stock_threshold, visibility, status, show_in_store, published_at, created_at, updated_at, seller_id) VALUES ('sellercove-demo-product-a', 'منتج تجريبي — البائع أ', 'Synthetic product for local checkout testing.', 'demo-seller-a-product', 'DZD', 2490, 'PHYSICAL', 0, 'SC-DEMO-A-001', 5, 1, 1, 1, 'ACTIVE', 1, ${q(now)}, ${q(now)}, ${q(now)}, 'sellercove-demo-seller-a')`,
  `INSERT OR IGNORE INTO products (id, name, description, handle, currency, price, type, has_variants, sku, inventory, track_inventory, low_stock_threshold, visibility, status, show_in_store, published_at, created_at, updated_at, seller_id) VALUES ('sellercove-demo-product-b', 'منتج تجريبي — البائع ب', 'Synthetic isolation product; do not combine with seller A in the pilot cart.', 'demo-seller-b-product', 'DZD', 3990, 'PHYSICAL', 0, 'SC-DEMO-B-001', 3, 1, 1, 1, 'ACTIVE', 1, ${q(now)}, ${q(now)}, ${q(now)}, 'sellercove-demo-seller-b')`,
];

async function main() {
  const hashes = await Promise.all(users.map((u) => hashPassword(u.password)));
  const sql = statements.map((statement) => {
    const index = users.findIndex((u) => statement.includes("__PASSWORD__" + u.id));
    return index >= 0 ? statement.replace(q("__PASSWORD__" + users[index].id), q(hashes[index])) : statement;
  }).join(";\n") + ";\n";
  const file = join(tmpdir(), "sellercove-demo-seed.sql");
  writeFileSync(file, sql, "utf8");
  try {
    execSync(`npx wrangler d1 execute ${dbName} --local --persist-to ../.wrangler-shared --file "${file}"`, { stdio: "inherit" });
  } finally {
    unlinkSync(file);
  }
  console.log("\nSellerCove local fixture is ready.");
  console.log("Store: store-local-dev (cart enabled)");
  console.log("Seller A: seller-a@example.test / " + passwordA);
  console.log("Seller B: seller-b@example.test / " + passwordB);
  console.log("Products: 2,490 DZD (stock 5) and 3,990 DZD (stock 3).");
  console.log("Credentials are LOCAL TEST ONLY. Never reuse them outside this local database.");
}

main().catch((error) => { console.error(error); process.exit(1); });
