/**
 * CORS middleware.
 *
 * Browser origins must be explicitly listed in ALLOWED_ORIGINS in every
 * environment. Requests without an Origin header (for example server-to-server
 * calls) are not subject to CORS and continue through the normal auth stack.
 */
import { Context, Next } from "hono";
import type { AppContext } from "@/types/app";

const ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOW_HEADERS = "Content-Type, X-API-Key, X-Store-API-Key, Accept, Authorization";

export async function corsMiddleware(c: Context<AppContext>, next: Next) {
  const requestOrigin = c.req.header("origin");

  // CORS is a browser access policy, not authentication. Preserve requests
  // without Origin and let the existing authentication middleware decide.
  if (!requestOrigin) {
    if (c.req.method === "OPTIONS") return c.body(null, 204);
    return next();
  }

  const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const originAllowed = allowedOrigins.includes(requestOrigin);

  // A disallowed preflight must fail before the browser sends the actual
  // request. For other methods, keep the API's normal response/auth behavior
  // but deliberately omit CORS headers so browsers cannot read the response.
  if (!originAllowed) {
    if (c.req.method === "OPTIONS") return c.body(null, 403);
    return next();
  }

  const applyCorsHeaders = () => {
    c.header("Access-Control-Allow-Origin", requestOrigin);
    c.header("Access-Control-Allow-Methods", ALLOW_METHODS);
    c.header("Access-Control-Allow-Headers", ALLOW_HEADERS);
    c.header("Access-Control-Expose-Headers", "Content-Type, X-API-Key, X-Store-API-Key");
    c.header("Access-Control-Max-Age", "86400");
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  };

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204, {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Methods": ALLOW_METHODS,
      "Access-Control-Allow-Headers": ALLOW_HEADERS,
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    });
  }

  applyCorsHeaders();
  await next();
  // Preserve headers on handlers returning a raw Response.
  applyCorsHeaders();
}
