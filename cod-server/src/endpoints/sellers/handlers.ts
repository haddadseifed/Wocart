import type { Context } from "hono";
import type { AppContext } from "@/types";
import { getDb } from "@/db";
import { stores, sellerMemberships, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { BusinessLogicError, ConflictError, NotFoundError } from "@/lib/errors/classes";
import { ERROR_CODES } from "../../../../cod-shared/errors/codes";
import * as queries from "./queries";

async function currentStoreId(c: Context<AppContext>) {
  const store = await getDb(c.env.DB).select({ id: stores.id }).from(stores).limit(1).get();
  if (!store) throw new NotFoundError("Store");
  return store.id;
}

export async function listSellers(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const storeId = await currentStoreId(c);
  const filters = (c.req as any).valid?.("query") ?? {};
  const data = await queries.listSellers(db, storeId, {
    status: filters.status,
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  });
  return c.json({ success: true, data, count: data.length }, 200);
}

export async function createSeller(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const storeId = await currentStoreId(c);
  const body = (c.req as any).valid?.("json") ?? await c.req.json();
  const duplicate = await queries.getSellerBySlug(db, storeId, body.slug);
  if (duplicate) {
    throw new ConflictError("A seller with this store slug already exists", ERROR_CODES.DUPLICATE_ENTITY, {
      slug: body.slug,
      existingSellerId: duplicate.id,
    });
  }
  const now = new Date().toISOString();
  const seller = await queries.createSeller(db, {
    id: crypto.randomUUID(),
    storeId,
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    logoKey: body.logoKey ?? null,
    contactPhone: body.contactPhone ?? null,
    contactEmail: body.contactEmail ?? null,
    createdAt: now,
    updatedAt: now,
  });
  if (!seller) throw new Error("Seller insert did not return a row");
  return c.json({ success: true, data: seller }, 201);
}

export async function updateSellerStatus(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const storeId = await currentStoreId(c);
  const id = c.req.param("id")!;
  const body = (c.req as any).valid?.("json") ?? await c.req.json();
  const seller = await queries.setSellerStatus(db, { storeId, id, status: body.status, now: new Date().toISOString() });
  if (!seller) throw new NotFoundError("Seller", id);
  return c.json({ success: true, data: seller }, 200);
}

/** Assign an existing active platform user to an approved seller. */
export async function createSellerMembership(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const storeId = await currentStoreId(c);
  const sellerId = c.req.param("id")!;
  const body = (c.req as any).valid?.("json") ?? await c.req.json();

  const seller = await queries.getSellerById(db, storeId, sellerId);
  if (!seller) throw new NotFoundError("Seller", sellerId);
  if (seller.status !== "approved") {
    throw new BusinessLogicError("Only an approved seller can receive portal memberships", ERROR_CODES.SELLER_NOT_AVAILABLE, { sellerId });
  }

  const user = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, body.userId)).get();
  if (!user || user.status !== "active") throw new NotFoundError("Active user", body.userId);

  const existing = await db.select().from(sellerMemberships)
    .where(and(eq(sellerMemberships.sellerId, sellerId), eq(sellerMemberships.userId, body.userId)))
    .get();
  if (existing?.status === "active") {
    throw new ConflictError("This user already has an active membership for the seller", ERROR_CODES.DUPLICATE_ENTITY, { sellerId, userId: body.userId });
  }

  if (existing) {
    await db.update(sellerMemberships)
      .set({ role: body.role, status: "active" })
      .where(eq(sellerMemberships.id, existing.id))
      .run();
    const [membership] = await db.select({
      id: sellerMemberships.id,
      sellerId: sellerMemberships.sellerId,
      userId: sellerMemberships.userId,
      role: sellerMemberships.role,
      status: sellerMemberships.status,
      createdAt: sellerMemberships.createdAt,
    }).from(sellerMemberships).where(eq(sellerMemberships.id, existing.id)).limit(1).all();
    return c.json({ success: true, data: membership }, 200);
  }

  const id = crypto.randomUUID();
  await db.insert(sellerMemberships).values({
    id, sellerId, userId: body.userId, role: body.role, status: "active", createdAt: new Date().toISOString(),
  });
  const [membership] = await db.select({
    id: sellerMemberships.id,
    sellerId: sellerMemberships.sellerId,
    userId: sellerMemberships.userId,
    role: sellerMemberships.role,
    status: sellerMemberships.status,
    createdAt: sellerMemberships.createdAt,
  }).from(sellerMemberships).where(eq(sellerMemberships.id, id)).limit(1).all();
  return c.json({ success: true, data: membership }, 201);
}
