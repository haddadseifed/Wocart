import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import type { AppContext } from "@/types";
import { errorHandler } from "@/middleware/error";
import { openApiValidationHook } from "@/openapi/validation-hook";
import { createTestD1, type TestD1 } from "@/test-utils/d1";
import * as schema from "@/db/schema";
import portalRoutes from "./portal";

let d1: TestD1;
let app: OpenAPIHono<AppContext>;
let currentUserId = "seller-user-a";
const STORE = "seller-portal-store";
const T = "2026-11-16T10:00:00.000Z";

beforeAll(async () => {
  d1 = await createTestD1();
  app = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook });
  app.use("*", async (c, next) => {
    c.env = { DB: d1.raw } as never;
    c.set("user", {
      id: currentUserId, name: currentUserId, email: `${currentUserId}@example.test`,
      role: "staff", status: "active", scopes: [], language: "ar",
      createdAt: Date.now(), updatedAt: Date.now(),
    } as any);
    await next();
  });
  app.onError(errorHandler);
  app.route("/seller", portalRoutes);
}, 120_000);

afterAll(async () => d1?.dispose());

beforeEach(async () => {
  for (const table of [
    "seller_order_items", "seller_orders", "order_products", "orders",
    "customers", "seller_memberships", "sellers", "users", "stores",
  ]) await d1.db.run(sql.raw(`DELETE FROM ${table}`));

  await d1.db.insert(schema.stores).values({ id: STORE, name: "Seller Portal", createdAt: T, updatedAt: T });
  await d1.db.insert(schema.users).values([
    { id: "seller-user-a", name: "Seller A user", email: "a@example.test", role: "staff", status: "active" },
    { id: "seller-user-b", name: "Seller B user", email: "b@example.test", role: "staff", status: "active" },
    { id: "catalog-user", name: "Catalog user", email: "catalog@example.test", role: "staff", status: "active" },
  ]);
  await d1.db.insert(schema.sellers).values([
    { id: "seller-a", storeId: STORE, name: "Seller A", slug: "seller-a", status: "approved", approvedAt: T, createdAt: T, updatedAt: T },
    { id: "seller-b", storeId: STORE, name: "Seller B", slug: "seller-b", status: "approved", approvedAt: T, createdAt: T, updatedAt: T },
  ]);
  await d1.db.insert(schema.sellerMemberships).values([
    { id: "membership-a", sellerId: "seller-a", userId: "seller-user-a", role: "orders", status: "active", createdAt: T },
    { id: "membership-b", sellerId: "seller-b", userId: "seller-user-b", role: "owner", status: "active", createdAt: T },
    { id: "membership-catalog", sellerId: "seller-a", userId: "catalog-user", role: "catalog", status: "active", createdAt: T },
  ]);
  await d1.db.insert(schema.customers).values({
    id: "buyer", name: "Buyer", phone: "0551234567", wilaya: "الجزائر", createdAt: T,
  });
  await d1.db.insert(schema.orders).values([
    { id: "parent-a", orderNumber: "ORD-A", customerId: "buyer", customerName: "Buyer", phone: "0551234567", price: 1000, createdAt: T, updatedAt: T },
    { id: "parent-b", orderNumber: "ORD-B", customerId: "buyer", customerName: "Buyer", phone: "0551234567", price: 2000, createdAt: T, updatedAt: T },
  ]);
  await d1.db.insert(schema.orderProducts).values([
    { id: "line-a", orderId: "parent-a", productName: "Seller A product", quantity: 1, pricePerUnit: 1000, lineTotal: 1000, createdAt: T },
    { id: "line-b", orderId: "parent-b", productName: "Seller B product", quantity: 1, pricePerUnit: 2000, lineTotal: 2000, createdAt: T },
  ]);
  await d1.db.insert(schema.sellerOrders).values([
    { id: "seller-order-a", orderId: "parent-a", sellerId: "seller-a", orderNumber: "ORD-A-01", subtotal: 1000, deliveryFee: 600, total: 1600, createdAt: T },
    { id: "seller-order-b", orderId: "parent-b", sellerId: "seller-b", orderNumber: "ORD-B-01", subtotal: 2000, deliveryFee: 600, total: 2600, createdAt: T },
  ]);
  await d1.db.insert(schema.sellerOrderItems).values([
    { id: "item-a", sellerOrderId: "seller-order-a", orderProductId: "line-a", createdAt: T },
    { id: "item-b", sellerOrderId: "seller-order-b", orderProductId: "line-b", createdAt: T },
  ]);
});

describe("seller portal order isolation", () => {
  it("lists only orders assigned to the signed-in user's active seller memberships", async () => {
    currentUserId = "seller-user-a";
    const response = await app.request("/seller/orders");
    const body = await response.json() as any;
    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({ id: "seller-order-a", parentOrderNumber: "ORD-A" });
  });

  it("returns 404 when a seller guesses another seller's child-order id", async () => {
    currentUserId = "seller-user-a";
    const response = await app.request("/seller/orders/seller-order-b");
    expect(response.status).toBe(404);
  });

  it("allows a second seller to read their own child order and its line snapshot", async () => {
    currentUserId = "seller-user-b";
    const response = await app.request("/seller/orders/seller-order-b");
    const body = await response.json() as any;
    expect(response.status).toBe(200);
    expect(body.data.products).toEqual([
      expect.objectContaining({ id: "line-b", productName: "Seller B product", lineTotal: 2000 }),
    ]);
  });

  it("does not grant order access to the catalog-only membership role", async () => {
    currentUserId = "catalog-user";
    const response = await app.request("/seller/orders");
    expect(response.status).toBe(403);
  });

  it("keeps historical order access when the seller profile is suspended", async () => {
    currentUserId = "seller-user-a";
    await d1.db.update(schema.sellers).set({ status: "suspended" }).where(eq(schema.sellers.id, "seller-a"));
    const response = await app.request("/seller/orders");
    const body = await response.json() as any;
    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("revokes seller portal access when the membership is suspended", async () => {
    currentUserId = "seller-user-a";
    await d1.db.update(schema.sellerMemberships).set({ status: "suspended" }).where(eq(schema.sellerMemberships.id, "membership-a"));
    const response = await app.request("/seller/orders");
    expect(response.status).toBe(403);
  });
});
