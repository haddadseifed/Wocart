import type { AppDb } from "@/db";
import { sellers } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface SellerListFilters {
  status?: "pending" | "approved" | "suspended" | "rejected";
  limit: number;
  offset: number;
}

export async function listSellers(db: AppDb, storeId: string, filters: SellerListFilters) {
  const conditions = [eq(sellers.storeId, storeId)];
  if (filters.status) conditions.push(eq(sellers.status, filters.status));
  return db
    .select()
    .from(sellers)
    .where(and(...conditions))
    .orderBy(desc(sellers.createdAt), desc(sellers.id))
    .limit(filters.limit)
    .offset(filters.offset)
    .all();
}

export async function getSellerById(db: AppDb, storeId: string, id: string) {
  return db
    .select()
    .from(sellers)
    .where(and(eq(sellers.storeId, storeId), eq(sellers.id, id)))
    .get();
}

export async function getSellerBySlug(db: AppDb, storeId: string, slug: string) {
  return db
    .select({ id: sellers.id })
    .from(sellers)
    .where(and(eq(sellers.storeId, storeId), eq(sellers.slug, slug)))
    .get();
}

export async function createSeller(
  db: AppDb,
  input: {
    id: string;
    storeId: string;
    name: string;
    slug: string;
    description: string | null;
    logoKey: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    createdAt: string;
    updatedAt: string;
  },
) {
  await db.insert(sellers).values({ ...input, status: "pending", approvedAt: null }).run();
  return getSellerById(db, input.storeId, input.id);
}

export async function setSellerStatus(
  db: AppDb,
  input: { storeId: string; id: string; status: "pending" | "approved" | "suspended" | "rejected"; now: string },
) {
  const current = await getSellerById(db, input.storeId, input.id);
  if (!current) return null;
  await db.update(sellers)
    .set({
      status: input.status,
      approvedAt: input.status === "approved" ? current.approvedAt ?? input.now : current.approvedAt,
      updatedAt: input.now,
    })
    .where(and(eq(sellers.storeId, input.storeId), eq(sellers.id, input.id)))
    .run();
  return getSellerById(db, input.storeId, input.id);
}
