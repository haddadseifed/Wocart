import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestD1, type TestD1 } from "@/test-utils/d1";

let d1: TestD1;
const T = "2026-11-16T12:00:00.000Z";

beforeAll(async () => {
  d1 = await createTestD1({ before: "0083_seller_foundation.sql" });
  await d1.raw.prepare("INSERT INTO stores (id, name, created_at, updated_at) VALUES ('sc-store', 'SellerCove', ?, ?)").bind(T, T).run();
  await d1.raw.prepare("INSERT INTO products (id, name, handle, price, created_at, updated_at) VALUES ('legacy-product', 'Legacy item', 'legacy-item', 1000, ?, ?)").bind(T, T).run();
  await d1.applyRemaining();
}, 120_000);

afterAll(async () => d1?.dispose());

describe("migration 0083 — SellerCove seller foundation", () => {
  it("preserves legacy catalogue rows without inventing seller ownership", async () => {
    const row = await d1.raw.prepare("SELECT id, seller_id FROM products WHERE id = 'legacy-product'").first<{ id: string; seller_id: string | null }>();
    expect(row).toEqual({ id: "legacy-product", seller_id: null });
  });

  it("supports an approved seller, a seller membership, and explicit product attribution", async () => {
    await d1.raw.prepare("INSERT INTO users (id, name, email, created_at, updated_at) VALUES ('seller-user', 'Seller User', 'seller@example.test', ?, ?)").bind(T, T).run();
    await d1.raw.prepare("INSERT INTO sellers (id, store_id, name, slug, status, approved_at, created_at, updated_at) VALUES ('seller-1', 'sc-store', 'Test Seller', 'test-seller', 'approved', ?, ?, ?)").bind(T, T, T).run();
    await d1.raw.prepare("INSERT INTO seller_memberships (id, seller_id, user_id, role, created_at) VALUES ('membership-1', 'seller-1', 'seller-user', 'owner', ?)").bind(T).run();
    await d1.raw.prepare("UPDATE products SET seller_id = 'seller-1' WHERE id = 'legacy-product'").run();

    const product = await d1.raw.prepare("SELECT seller_id FROM products WHERE id = 'legacy-product'").first<{ seller_id: string }>();
    const membership = await d1.raw.prepare("SELECT role, status FROM seller_memberships WHERE id = 'membership-1'").first<{ role: string; status: string }>();
    expect(product?.seller_id).toBe("seller-1");
    expect(membership).toEqual({ role: "owner", status: "active" });
  });

  it("enforces seller slug uniqueness within a store and valid membership roles", async () => {
    await d1.raw.prepare("INSERT INTO sellers (id, store_id, name, slug, created_at, updated_at) VALUES ('seller-2', 'sc-store', 'Duplicate', 'test-seller', ?, ?)").bind(T, T).run().then(
      () => { throw new Error("duplicate seller slug was accepted"); },
      (error) => expect(String(error)).toMatch(/UNIQUE constraint failed/),
    );
    await d1.raw.prepare("INSERT INTO seller_memberships (id, seller_id, user_id, role, created_at) VALUES ('bad-role', 'seller-1', 'seller-user', 'admin', ?)").bind(T).run().then(
      () => { throw new Error("invalid membership role was accepted"); },
      (error) => expect(String(error)).toMatch(/CHECK constraint failed/),
    );
  });

  it("removes membership and leaves the product unassigned when a seller is deleted", async () => {
    await d1.raw.prepare("DELETE FROM sellers WHERE id = 'seller-1'").run();
    const product = await d1.raw.prepare("SELECT seller_id FROM products WHERE id = 'legacy-product'").first<{ seller_id: string | null }>();
    const membership = await d1.raw.prepare("SELECT id FROM seller_memberships WHERE id = 'membership-1'").first();
    expect(product?.seller_id).toBeNull();
    expect(membership).toBeNull();
  });
});
