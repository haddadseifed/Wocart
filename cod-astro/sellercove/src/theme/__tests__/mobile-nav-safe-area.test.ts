// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(new URL("../styles/global.css", import.meta.url), "utf8");

describe("mobile navigation safe-area clearance", () => {
  it("keeps a minimum gesture-area reserve when Android reports a zero safe-area inset", () => {
    expect(globalCss).toContain("height: calc(4rem + max(var(--safe-bottom), 1.25rem));");
    expect(globalCss).toContain("padding-bottom: max(var(--safe-bottom), 1.25rem);");
    expect(globalCss).toContain(".has-mobile-nav { padding-bottom: calc(4rem + max(var(--safe-bottom), 1.25rem)); }");
  });
});
