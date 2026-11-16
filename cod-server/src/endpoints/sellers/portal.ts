import { OpenAPIHono, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { AppContext } from "@/types";
import { defineRoute } from "@/lib/route-builder";
import { getDb } from "@/db";
import { sellerMemberships, sellers, sellerOrders, orders, sellerOrderItems, orderProducts } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { PermissionError, NotFoundError } from "@/lib/errors/classes";

const router = new OpenAPIHono<AppContext>();
const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
const idParams = z.object({ id: z.string().min(1) });

/** Resolve only active memberships on currently approved sellers. */
async function sellerIdsFor(c: Context<AppContext>): Promise<string[]> {
  const user = c.get("user");
  const db = getDb(c.env.DB);
  const rows = await db
    .select({ sellerId: sellerMemberships.sellerId })
    .from(sellerMemberships)
    .innerJoin(sellers, eq(sellers.id, sellerMemberships.sellerId))
    .where(and(
      eq(sellerMemberships.userId, user.id),
      eq(sellerMemberships.status, "active"),
      inArray(sellerMemberships.role, ["owner", "manager", "orders"]),
    ))
    .all();
  const ids = [...new Set(rows.map((row) => row.sellerId))];
  if (ids.length === 0) throw new PermissionError("An active seller order membership is required");
  return ids;
}

async function listSellerOrders(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const sellerIds = await sellerIdsFor(c);
  const query = (c.req as any).valid?.("query") ?? {};
  const rows = await db
    .select({
      id: sellerOrders.id,
      orderId: sellerOrders.orderId,
      orderNumber: sellerOrders.orderNumber,
      subtotal: sellerOrders.subtotal,
      deliveryFee: sellerOrders.deliveryFee,
      codAmount: sellerOrders.codAmount,
      createdAt: sellerOrders.createdAt,
      parentOrderNumber: orders.orderNumber,
      status: orders.status,
      customerName: orders.customerName,
      phone: orders.phone,
      wilayaId: orders.wilayaId,
      communeId: orders.communeId,
      address: orders.address,
      deliveryType: orders.deliveryType,
    })
    .from(sellerOrders)
    .innerJoin(orders, eq(orders.id, sellerOrders.orderId))
    .where(inArray(sellerOrders.sellerId, sellerIds))
    .orderBy(desc(sellerOrders.createdAt), desc(sellerOrders.id))
    .limit(query.limit ?? 30)
    .offset(query.offset ?? 0)
    .all();
  return c.json({ success: true, data: rows, count: rows.length }, 200);
}

async function getSellerOrder(c: Context<AppContext>) {
  const db = getDb(c.env.DB);
  const sellerIds = await sellerIdsFor(c);
  const id = c.req.param("id")!;
  const [row] = await db
    .select({
      id: sellerOrders.id,
      orderId: sellerOrders.orderId,
      orderNumber: sellerOrders.orderNumber,
      subtotal: sellerOrders.subtotal,
      deliveryFee: sellerOrders.deliveryFee,
      codAmount: sellerOrders.codAmount,
      createdAt: sellerOrders.createdAt,
      parentOrderNumber: orders.orderNumber,
      status: orders.status,
      customerName: orders.customerName,
      phone: orders.phone,
      wilayaId: orders.wilayaId,
      communeId: orders.communeId,
      address: orders.address,
      deliveryType: orders.deliveryType,
      notes: orders.notes,
    })
    .from(sellerOrders)
    .innerJoin(orders, eq(orders.id, sellerOrders.orderId))
    .where(and(eq(sellerOrders.id, id), inArray(sellerOrders.sellerId, sellerIds)))
    .limit(1)
    .all();
  if (!row) throw new NotFoundError("Seller order", id);

  const lines = await db
    .select({
      id: orderProducts.id,
      productId: orderProducts.productId,
      productName: orderProducts.productName,
      variantId: orderProducts.variantId,
      variantLabel: orderProducts.variantLabel,
      sku: orderProducts.sku,
      quantity: orderProducts.quantity,
      pricePerUnit: orderProducts.pricePerUnit,
      lineTotal: orderProducts.lineTotal,
      discount: orderProducts.discount,
      reward: orderProducts.reward,
    })
    .from(sellerOrderItems)
    .innerJoin(orderProducts, eq(orderProducts.id, sellerOrderItems.orderProductId))
    .where(eq(sellerOrderItems.sellerOrderId, id))
    .all();
  return c.json({ success: true, data: { ...row, products: lines } }, 200);
}

const listRoute = defineRoute({
  method: "get",
  path: "/orders",
  auth: "api-key",
  tags: ["Seller Portal"],
  summary: "List orders belonging to the signed-in seller memberships",
  operationId: "listMySellerOrders",
  query: listQuery,
  handler: listSellerOrders,
});

const detailRoute = defineRoute({
  method: "get",
  path: "/orders/{id}",
  auth: "api-key",
  tags: ["Seller Portal"],
  summary: "Get one seller-scoped order",
  operationId: "getMySellerOrder",
  params: idParams,
  handler: getSellerOrder,
});

router.openapi(listRoute.route, listRoute.handler);
router.openapi(detailRoute.route, detailRoute.handler);
export default router;
