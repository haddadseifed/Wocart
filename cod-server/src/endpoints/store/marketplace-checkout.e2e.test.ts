/** Marketplace first-checkout slice — real D1, synthetic catalogue and customers. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import type { AppContext } from "@/types";
import { errorHandler } from "@/middleware/error";
import { openApiValidationHook } from "@/openapi/validation-hook";
import { createTestD1, type TestD1 } from "@/test-utils/d1";
import * as schema from "@/db/schema";
import storeRouter from "./routes";

let d1: TestD1;
let app: OpenAPIHono<AppContext>;
const STORE = "marketplace-checkout-store";
const T = "2026-11-16T10:00:00.000Z";
const KEY = "2f1c2a0e-8b1d-4c3a-9e2f-0a1b2c3d4e5f";

beforeAll(async () => {
  d1 = await createTestD1();
  app = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook });
  app.use("*", async (c, next) => {
    c.env = { DB: d1.raw } as never;
    c.set("storeId", STORE);
    await next();
  });
  app.onError(errorHandler);
  app.route("/store", storeRouter);
}, 120_000);

afterAll(async () => d1?.dispose());

beforeEach(async () => {
  for (const table of [
    "seller_order_items", "seller_orders", "business_events", "order_products",
    "stock_movements", "orders", "customers", "products", "sellers",
    "shipping_rules", "shipping_profiles", "stores",
  ]) await d1.db.run(sql.raw(`DELETE FROM ${table}`));

  await d1.db.insert(schema.stores).values({
    id: STORE, name: "SellerCove Test", lang: "ar", currency: "DZD",
    createdAt: T, updatedAt: T,
  });
  await d1.db.insert(schema.shippingProfiles).values({
    id: "market-default", name: "Default", isDefault: true, createdAt: T, updatedAt: T,
  });
  await d1.db.insert(schema.shippingRules).values({
    id: "market-w16", profileId: "market-default", wilayaId: 16,
    homePrice: 600, stopDeskPrice: 300, homeEnabled: true, stopDeskEnabled: true, createdAt: T,
  });
  await d1.db.insert(schema.sellers).values({
    id: "seller-a", storeId: STORE, name: "Seller A", slug: "seller-a",
    status: "approved", approvedAt: T, createdAt: T, updatedAt: T,
  });
  await d1.db.insert(schema.products).values({
    id: "item-a", sellerId: "seller-a", name: "Test item", handle: "test-item",
    price: 2500, sku: "TEST-A", status: "ACTIVE", visibility: true,
    showInStore: true, trackInventory: true, inventory: 1,
    createdAt: T, updatedAt: T,
  });
});

async function checkout(items: unknown[], extra: Record<string, unknown> = {}, phone = "0551234567") {
  const response = await app.request("/store/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Test Buyer", phone, wilayaId: 16, communeId: "c-16-001",
      deliveryType: "home", address: "Test street", items, ...extra,
    }),
  });
  return { status: response.status, body: await response.json() as any };
}

describe("SellerCove marketplace checkout", () => {
  it("prices from the catalogue, saves one parent and one seller child, and exposes all child lines", async () => {
    const result = await checkout([{ productId: "item-a", productName: "Edited by browser", quantity: 1, pricePerUnit: 1 }], { checkoutKey: KEY });
    expect(result.status).toBe(201);
    expect(result.body.data).toMatchObject({ price: 2500, deliveryFee: 600, total: 3100 });

    const parents = await d1.db.select().from(schema.orders).all();
    const children = await d1.db.select().from(schema.sellerOrders).all();
    const lines = await d1.db.select().from(schema.sellerOrderItems).all();
    expect(parents).toHaveLength(1);
    expect(children).toHaveLength(1);
    expect(children[0]).toMatchObject({
      orderId: parents[0]!.id, sellerId: "seller-a",
      subtotal: 2500, deliveryFee: 600, total: 3100,
    });
    expect(lines).toHaveLength(1);
  });

  it("replays the same checkout key without duplicating the parent, seller child, or stock deduction", async () => {
    const items = [{ productId: "item-a", productName: "Item", quantity: 1 }];
    const first = await checkout(items, { checkoutKey: KEY });
    const replay = await checkout(items, { checkoutKey: KEY });
    expect(first.status).toBe(201);
    expect(replay.status).toBe(201);
    expect(replay.body.data.orderId).toBe(first.body.data.orderId);
    expect(await d1.db.select().from(schema.orders).all()).toHaveLength(1);
    expect(await d1.db.select().from(schema.sellerOrders).all()).toHaveLength(1);
    expect(await d1.db.select().from(schema.sellerOrderItems).all()).toHaveLength(1);
    const stock = await d1.db.select({ inventory: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, "item-a")).get();
    expect(stock?.inventory).toBe(0);
  });

  it("refuses a basket spanning two sellers without saving an order or deducting stock", async () => {
    await d1.db.insert(schema.sellers).values({
      id: "seller-b", storeId: STORE, name: "Seller B", slug: "seller-b",
      status: "approved", approvedAt: T, createdAt: T, updatedAt: T,
    });
    await d1.db.insert(schema.products).values({
      id: "item-b", sellerId: "seller-b", name: "Second item", handle: "second-item",
      price: 900, sku: "TEST-B", status: "ACTIVE", visibility: true,
      showInStore: true, trackInventory: true, inventory: 5,
      createdAt: T, updatedAt: T,
    });
    const result = await checkout([
      { productId: "item-a", productName: "A", quantity: 1 },
      { productId: "item-b", productName: "B", quantity: 1 },
    ]);
    expect(result.status).toBe(422);
    expect(await d1.db.select().from(schema.orders).all()).toHaveLength(0);
    expect(await d1.db.select().from(schema.sellerOrders).all()).toHaveLength(0);
    const stock = await d1.db.select({ inventory: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, "item-a")).get();
    expect(stock?.inventory).toBe(1);
  });

  it("refuses a seller suspended after catalogue display and rolls the order batch back", async () => {
    await d1.db.update(schema.sellers).set({ status: "suspended" }).where(eq(schema.sellers.id, "seller-a"));
    const result = await checkout([{ productId: "item-a", productName: "Item", quantity: 1 }]);
    expect(result.status).toBe(422);
    expect(await d1.db.select().from(schema.orders).all()).toHaveLength(0);
    expect(await d1.db.select().from(schema.sellerOrders).all()).toHaveLength(0);
    const stock = await d1.db.select({ inventory: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, "item-a")).get();
    expect(stock?.inventory).toBe(1);
  });

  it("does not oversell the last unit under two distinct concurrent checkout attempts", async () => {
    const items = [{ productId: "item-a", productName: "Item", quantity: 1 }];
    const [a, b] = await Promise.all([
      checkout(items, { checkoutKey: "a11c2a0e-8b1d-4c3a-9e2f-0a1b2c3d4e5f" }),
      checkout(items, { checkoutKey: "b22c2a0e-8b1d-4c3a-9e2f-0a1b2c3d4e5f" }, "0661234567"),
    ]);
    expect([a.status, b.status].filter((status) => status === 201)).toHaveLength(1);
    expect(await d1.db.select().from(schema.orders).all()).toHaveLength(1);
    expect(await d1.db.select().from(schema.sellerOrders).all()).toHaveLength(1);
    const stock = await d1.db.select({ inventory: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, "item-a")).get();
    expect(stock?.inventory).toBe(0);
  });
});
