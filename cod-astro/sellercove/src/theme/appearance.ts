/**
 * How a store looks, as the theme's settings decide it: the default color
 * schemes, the faces for headings and text, the corners, the product cards'
 * image shape, and the sizes behind the style steps a merchant picks. Plain
 * data and pure functions — the layout turns them into the page's tokens.
 */
import type { CssVariable } from "astro:assets";
import type { ColorScheme, ThemeStyle } from "@wocart/theme";
import { SCHEME } from "./catalog/labels";
import themeFonts from "./fonts.json";
import styleSizes from "./style-sizes.json";

/**
 * The schemes a store starts with. The first is the page's; the others band
 * sections: a stone ground, warm sand behind photos, metallic gold for emphasis,
 * the night of the footer and the announcement. Gold marks savings and key
 * actions. Their ids never change, since
 * sections store them.
 */
export const DEFAULT_SCHEMES = [
  {
    id: "scheme-1",
    name: SCHEME.light,
    colors: { background: "#F7F5EF", text: "#514B40", heading: "#050505", accent: "#D4AF37", button: "#050505", buttonText: "#F7F5EF", border: "#DED8C8" },
  },
  {
    id: "scheme-2",
    name: SCHEME.stone,
    colors: { background: "#F0EDE4", text: "#514B40", heading: "#050505", accent: "#D4AF37", button: "#050505", buttonText: "#F7F5EF", border: "#D9D2C4" },
  },
  {
    id: "scheme-3",
    name: SCHEME.sand,
    colors: { background: "#E9E2D2", text: "#514B40", heading: "#050505", accent: "#D4AF37", button: "#050505", buttonText: "#F7F5EF", border: "#D9CFB9" },
  },
  {
    id: "scheme-4",
    name: SCHEME.saffron,
    colors: { background: "#D4AF37", text: "#050505", heading: "#050505", accent: "#D4AF37", button: "#050505", buttonText: "#F7F5EF", border: "#B99224" },
  },
  {
    id: "scheme-5",
    name: SCHEME.night,
    colors: { background: "#050505", text: "#D8D1C2", heading: "#F7F5EF", accent: "#D4AF37", button: "#F7F5EF", buttonText: "#050505", border: "#2A2925" },
  },
] as const satisfies readonly ColorScheme[];

export type SchemeId = (typeof DEFAULT_SCHEMES)[number]["id"];

/** The default schemes by role, for the theme's own defaults. */
export const SCHEME_OF = { light: "scheme-1", stone: "scheme-2", sand: "scheme-3", saffron: "scheme-4", night: "scheme-5" } as const satisfies Record<string, SchemeId>;

/** The page's scheme unless the merchant picks another. */
export const PAGE_SCHEME: SchemeId = "scheme-1";

/** The sizes the theme gives the platform's style steps and widths, in pixels. */
export const THEME_STYLE: ThemeStyle = styleSizes;

/** A face the theme ships: its family name and the variable Astro registered it under. */
export type ThemeFont = { family: string; cssVariable: CssVariable };

/** Astro types each variable from the configured list, so a typo here fails the build. */
const FONTS = themeFonts as { family: string; cssVariable: CssVariable; default?: boolean; headingDefault?: boolean }[];

export const FONT_FAMILIES = FONTS.map((font) => font.family) as [string, ...string[]];
export const BODY_FONT = FONTS.find((font) => font.default)!.family;
export const HEADING_FONT = FONTS.find((font) => font.headingDefault)!.family;

/** The face a font setting names; one the theme does not ship renders in that setting's default. */
export function themeFont(family: string, fallback: string = BODY_FONT): ThemeFont {
  const chosen = FONTS.find((font) => font.family === family) ?? FONTS.find((font) => font.family === fallback) ?? FONTS[0]!;
  return { family: chosen.family, cssVariable: chosen.cssVariable };
}

export const CORNERS = ["sharp", "soft", "round"] as const;
export type Corners = (typeof CORNERS)[number];

/**
 * Each corners choice keeps the same order — a photo rounder than a field, a
 * field rounder than a tag — so the hierarchy survives every choice.
 */
const RADII: Readonly<Record<Corners, Readonly<Record<"media" | "panel" | "input" | "button" | "tag", string>>>> = {
  sharp: { media: "0", panel: "0", input: "0.125rem", button: "0.125rem", tag: "0.125rem" },
  soft: { media: "0.875rem", panel: "1.125rem", input: "0.625rem", button: "0.625rem", tag: "62.5rem" },
  round: { media: "1.5rem", panel: "1.75rem", input: "1rem", button: "62.5rem", tag: "62.5rem" },
};

/** The radius tokens for a corners choice; an unknown one is soft. */
export function cornerRadii(corners: string): Readonly<Record<"media" | "panel" | "input" | "button" | "tag", string>> {
  return RADII[(CORNERS as readonly string[]).includes(corners) ? (corners as Corners) : "soft"];
}

export const CARD_RATIOS = ["square", "portrait", "landscape"] as const;
export type CardRatio = (typeof CARD_RATIOS)[number];

/** The CSS aspect ratio of a product card's photo; an unknown shape is portrait. */
export function cardAspect(ratio: string): string {
  return ratio === "square" ? "1 / 1" : ratio === "landscape" ? "4 / 3" : "3 / 4";
}

/** A scheme's background, for the browser's own chrome; warm ivory when the id names none. */
export function schemeBackground(schemes: readonly ColorScheme[] | undefined, id: string | undefined): string {
  return (schemes ?? []).find((scheme) => scheme.id === id)?.colors.background ?? "#F7F5EF";
}
