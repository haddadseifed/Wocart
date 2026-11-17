/**
 * Arabic-aware search query normalization for Algerian shoppers.
 *
 * Normalize common Arabic typing variants without changing the indexed product
 * data. The original query remains a final fallback so normalization cannot
 * make a valid search less likely to match.
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
 * Ordered, de-duplicated candidates: normalized spelling first, then the
 * common final ة/ه alternative, then the original spelling as a safe fallback.
 */
export function searchQueryCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const normalized = normalizeSearchQuery(trimmed);
  const candidates: string[] = [];
  const add = (value: string) => {
    if (value && !candidates.includes(value)) candidates.push(value);
  };
  add(normalized);
  if (/\u0647(\s|$)/.test(normalized)) add(normalized.replace(/\u0647(?=\s|$)/g, "\u0629"));
  if (/\u0629(\s|$)/.test(normalized)) add(normalized.replace(/\u0629(?=\s|$)/g, "\u0647"));
  add(trimmed);
  return candidates;
}
