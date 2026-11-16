/**
 * CORS Middleware Tests
 * CORS controls browser response access; it does not replace authentication.
 */
import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { corsMiddleware } from "./cors";
import type { AppContext } from "@/types/app";

function makeApp(environment: string, allowedOrigins?: string) {
  const app = new Hono<AppContext>();
  app.use("*", async (c, next) => {
    c.env = { ENVIRONMENT: environment, ALLOWED_ORIGINS: allowedOrigins } as any;
    await next();
  });
  app.use("*", corsMiddleware);
  app.get("/test", (c) => c.json({ ok: true }));
  app.options("/test", (c) => c.body(null, 204));
  app.get("/auth-check", (c) => c.json({ authenticated: false }, 401));
  app.get("/raw", () => new Response("raw-body", { status: 200 }));
  return app;
}

describe("CORS middleware", () => {
  it("allows an explicitly listed development origin with credentials", async () => {
    const app = makeApp("development", "https://dashboard.example.test,https://store.example.test");
    const res = await app.request("/test", { headers: { origin: "https://dashboard.example.test" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://dashboard.example.test");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("does not grant CORS access to an unlisted development origin", async () => {
    const app = makeApp("development", "https://dashboard.example.test");
    const res = await app.request("/test", { headers: { origin: "https://untrusted.example.test" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("rejects an unlisted OPTIONS preflight", async () => {
    const app = makeApp("development", "https://dashboard.example.test");
    const res = await app.request("/test", { method: "OPTIONS", headers: { origin: "https://untrusted.example.test" } });
    expect(res.status).toBe(403);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("answers an allowed OPTIONS preflight with the expected methods and headers", async () => {
    const app = makeApp("development", "https://dashboard.example.test");
    const res = await app.request("/test", { method: "OPTIONS", headers: { origin: "https://dashboard.example.test" } });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://dashboard.example.test");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("does not add CORS headers to requests without Origin and preserves their status", async () => {
    const app = makeApp("development", "https://dashboard.example.test");
    const res = await app.request("/auth-check");
    expect(res.status).toBe(401);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("does not bypass the existing authentication response for an unlisted origin", async () => {
    const app = makeApp("development", "https://dashboard.example.test");
    const res = await app.request("/auth-check", { headers: { origin: "https://untrusted.example.test" } });
    expect(res.status).toBe(401);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("requires an explicit allowlist in production too", async () => {
    const app = makeApp("production");
    const res = await app.request("/test", { headers: { origin: "https://dashboard.example.test" } });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("preserves CORS headers on raw Response handlers", async () => {
    const app = makeApp("production", "https://dashboard.example.test");
    const res = await app.request("/raw", { headers: { origin: "https://dashboard.example.test" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://dashboard.example.test");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });
});
