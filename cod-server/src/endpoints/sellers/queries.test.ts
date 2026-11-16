import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestD1, type TestD1 } from "@/test-utils/d1";
import * as queries from "./queries";

let d1: TestD1;
const T = "2026-11-16T12:00:00.000Z";

beforeAll(async () => {
  d1 = await createTestD1();
  await d1.raw.prepare("INSERT INTO stores (id, name, created_at, updated_at) VALUES ('market', 'SellerCove', ?, ?)").bind(T, T).run();
}, 120_000);

afterAll(async () => d1?.dispose());

describe("marketplace seller administration queries", () => {
  it("creates sellers pending and scopes list/read operations to the store", async () => {
    const created = await queries.createSeller(d1.db, {
      id: "seller-a", storeId: "market", name: "Seller A", slug: "seller-a",
      description: null, logoKey: null, contactPhone: null, contactEmail: null,
      createdAt: T, updatedAt: T,
    });
    expect(created?.status).toBe("pending");
    expect(await queries.getSellerById(d1.db, "another-store", "seller-a")).toBeUndefined();
    expect((await queries.listSellers(d1.db, "market", { limit: 20, offset: 0 })).map((s) => s.id)).toEqual(["seller-a"]);
  });

  it("records approval time once and preserves it through suspension", async () => {
    const approved = await queries.setSellerStatus(d1.db, { storeId: "market", id: "seller-a", status: "approved", now: T });
    expect(approved?.approvedAt).toBe(T);
    const suspended = await queries.setSellerStatus(d1.db, { storeId: "market", id: "seller-a", status: "suspended", now: "2026-11-17T12:00:00.000Z" });
    expect(suspended?.status).toBe("suspended");
    expect(suspended?.approvedAt).toBe(T);
  });

  it("does not update a seller through another store boundary", async () => {
    expect(await queries.setSellerStatus(d1.db, { storeId: "another-store", id: "seller-a", status: "rejected", now: T })).toBeNull();
  });
});
