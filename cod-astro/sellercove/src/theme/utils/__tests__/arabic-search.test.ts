import { describe, expect, it } from "vitest";
import { normalizeSearchQuery, searchQueryCandidates } from "../arabic-search";

describe("normalizeSearchQuery", () => {
  it("strips diacritics and tatweel", () => {
    expect(normalizeSearchQuery("حَقِيبَةٌ جِلْدِيَّة")).toBe("حقيبة جلدية");
    expect(normalizeSearchQuery("ســـاعـــة")).toBe("ساعة");
  });

  it("folds alef variants and alef maqsura", () => {
    expect(normalizeSearchQuery("إلكترونيات أصلية آمنة")).toBe("الكترونيات اصلية امنة");
    expect(normalizeSearchQuery("مقهى")).toBe("مقهي");
  });

  it("converts Arabic-Indic digits to ASCII", () => {
    expect(normalizeSearchQuery("موديل ٢٠٢٦ رقم ١٥")).toBe("موديل 2026 رقم 15");
  });
});

describe("searchQueryCandidates", () => {
  it("offers the ة variant when the shopper ends a word with ه", () => {
    expect(searchQueryCandidates("حقيبه يد")).toEqual(["حقيبه يد", "حقيبة يد"]);
  });

  it("returns empty array for blank input", () => {
    expect(searchQueryCandidates("   ")).toEqual([]);
  });
});
