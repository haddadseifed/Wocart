import { OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppContext } from "@/types";
import { defineRoute } from "@/lib/route-builder";
import * as handlers from "./handlers";

const jsonContent = <T extends z.ZodType>(schema: T) => ({ "application/json": { schema } });
const statusSchema = z.enum(["pending", "approved", "suspended", "rejected"]);
const sellerSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoKey: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  status: statusSchema,
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const idParams = z.object({ id: z.string().min(1) });
const listQuery = z.object({
  status: statusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
const createBody = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).nullable().optional(),
  logoKey: z.string().max(500).nullable().optional(),
  contactPhone: z.string().max(40).nullable().optional(),
  contactEmail: z.string().email().max(254).nullable().optional(),
});
const updateStatusBody = z.object({ status: statusSchema });
const membershipBody = z.object({
  userId: z.string().min(1),
  role: z.enum(["owner", "manager", "catalog", "orders"]),
});

const router = new OpenAPIHono<AppContext>();

const listRoute = defineRoute({
  method: "get",
  path: "/",
  auth: "admin",
  tags: ["Marketplace Sellers"],
  summary: "List marketplace sellers",
  operationId: "listMarketplaceSellers",
  query: listQuery,
  responses: {
    200: { description: "Sellers in the current store", content: jsonContent(z.object({ success: z.boolean(), data: z.array(sellerSchema), count: z.number() })) },
  },
  handler: handlers.listSellers,
});

const createRoute = defineRoute({
  method: "post",
  path: "/",
  auth: "admin",
  tags: ["Marketplace Sellers"],
  summary: "Create a pending marketplace seller",
  description: "Creates a seller profile in pending state. Approval is a separate explicit action; this does not create a seller login or grant dashboard access.",
  operationId: "createMarketplaceSeller",
  body: createBody,
  responses: {
    201: { description: "Pending seller created", content: jsonContent(z.object({ success: z.boolean(), data: sellerSchema })) },
    409: { description: "Seller slug already exists in this store" },
  },
  handler: handlers.createSeller,
});

const updateStatusRoute = defineRoute({
  method: "patch",
  path: "/{id}/status",
  auth: "admin",
  tags: ["Marketplace Sellers"],
  summary: "Change marketplace seller status",
  description: "Approves, suspends, rejects, or reopens a seller profile. This does not grant or revoke a seller login.",
  operationId: "updateMarketplaceSellerStatus",
  params: idParams,
  body: updateStatusBody,
  responses: {
    200: { description: "Seller status updated", content: jsonContent(z.object({ success: z.boolean(), data: sellerSchema })) },
    404: { description: "Seller not found in the current store" },
  },
  handler: handlers.updateSellerStatus,
});

router.openapi(listRoute.route, listRoute.handler);
router.openapi(createRoute.route, createRoute.handler);
router.openapi(updateStatusRoute.route, updateStatusRoute.handler);

const createMembershipRoute = defineRoute({
  method: "post",
  path: "/{id}/memberships",
  auth: "admin",
  tags: ["Marketplace Sellers"],
  summary: "Assign an existing user to an approved seller",
  description: "Creates or reactivates a seller membership for an existing active platform user. This is an explicit admin action; it does not send an invitation or create a user account.",
  operationId: "createSellerMembership",
  params: idParams,
  body: membershipBody,
  responses: {
    201: { description: "Seller membership created" },
    200: { description: "Seller membership reactivated" },
    404: { description: "Seller or active user not found" },
    409: { description: "An active membership already exists" },
  },
  handler: handlers.createSellerMembership,
});

router.openapi(createMembershipRoute.route, createMembershipRoute.handler);

export default router;
