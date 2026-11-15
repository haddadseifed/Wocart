/**
 * Arabic-aware search query normalization for Algerian shoppers.
 *
 * Strips Arabic diacritics and tatweel, normalizes common hamza/alef variants
 * (أ إ آ ٱ → ا), folds ى → ي, converts Eastern Arabic-Indic digits (٠-٩) and
 * Extended Arabic-Indic digits (۰-۹) to ASCII 0-9, and collapses whitespace.
 * Also produces an alternate spelling with ة ↔ ه swapped when the initial
 * search returns no results (e.g. "حقيبه" matches "حقيبة").
 */
export function normalizeSearchQuery(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ordered list of distinct query candidates to try against the store search:
 * 1. The normalized query.
 * 2. If it ends with ه on a word, the ة variant (and vice-versa), since
 *    shoppers commonly type "حقيبه" for "حقيبة".
 * 3. The raw trimmed query if normalization changed it.
 */
export function searchQueryCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const norm = normalizeSearchQuery(trimmed);
  const out: string[] = [];
  const push = (s: string) => {
    if (s && !out.includes(s)) out.push(s);
  };
  push(norm);
  if (/\u0647(\s|$)/.test(norm)) push(norm.replace(/\u0647(?=\s|$)/g, "\u0629"));
  if (/\u0629(\s|$)/.test(norm)) push(norm.replace(/\u0629(?=\s|$)/g, "\u0647"));
  push(trimmed);
  return out;
}
