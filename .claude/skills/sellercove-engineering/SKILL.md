---
name: sellercove-engineering
description: Project-specific engineering guardrails and delivery workflow for SellerCove on Wocart/Astro. Use whenever implementing, reviewing, testing, styling, localizing, integrating, or preparing a release for SellerCove.
---

# SellerCove Engineering

## Mission
Build a distinctive, trustworthy, production-minded storefront for SellerCove on the existing Wocart theme architecture. Optimize for correctness, accessibility, mobile usability, maintainability, and honest commerce flows—not visual novelty at the expense of reliability.

## Read before changing code
1. Repository root `AGENTS.md` (authoritative platform rules).
2. `cod-astro/sellercove/AGENTS.md`.
3. `cod-astro/sellercove/THEME_GUIDE.md`.
4. `DESIGN.md`, `PRODUCT.md`, and the relevant content/page schema docs.

If any instruction conflicts, follow root `AGENTS.md` and the published Wocart SDK contract. Do not infer undocumented platform capabilities.

## Architecture boundaries
- Work only in `cod-astro/sellercove/` for storefront implementation unless a task explicitly requires a repository-level configuration or test change.
- Never edit `cod-astro/theme-00/`; it is the reference theme.
- Preserve `src/theme/key.ts` as `sellercove`; changing it can orphan merchant content overrides.
- Use only published `@wocart/storefront` and `@wocart/theme` APIs through their documented public entry points. Do not import private SDK internals or duplicate platform business logic.
- Product, stock, price, cart, checkout, order, OTP, fulfilment, delivery, and shipping rules belong to Wocart's platform/SDK seams. The theme presents supported capabilities; it does not recreate them.
- Do not add production dependencies, alter D1 schema, or introduce new external services without explicit approval.
- Never deploy, change DNS/domains, touch Shopify, or connect production resources from this branch.

## Commerce truth and safety
- Never invent products, variants, stock, prices, discounts, reviews, ratings, testimonials, scarcity, shipping fees, delivery estimates, payment methods, or service coverage.
- Render catalog sections only from real store data; handle empty, loading, and error states intentionally.
- Wocart's current order/fulfilment path is Algeria-focused. Never promise international checkout or delivery unless a separately implemented and verified path exists.
- Delivery coverage and carrier capabilities must be derived from platform-supported configuration and carrier capabilities, not assumptions or hard-coded marketing claims.
- Do not assume Yalidine, Guepex, or other carrier endpoints, webhook support, signature schemes, or province-code coverage from third-party skills alone. Verify against the actual platform implementation and current provider documentation before integration.
- Keep API credentials, tokens, store IDs, phone numbers, and real customer data out of source, fixtures, logs, screenshots, and commits. Use ignored local environment files only.

## Design system
- Brand palette: Obsidian `#050505`, Warm Ivory `#F7F5EF`, Metallic Gold `#D4AF37`. Use semantic contrast tokens; gold is an accent, not body text on every surface.
- Design for a mobile-first, thumb-friendly storefront with clear hierarchy, readable type, visible focus, reduced-motion support, and accessible contrast.
- Avoid generic SaaS card grids, decorative gradients, fake metrics, gratuitous animations, and placeholder photography.
- Distinctiveness must come from SellerCove's own commerce narrative, product imagery when real assets exist, typography, spacing, and a coherent visual system.
- Support Arabic RTL, French, and English without clipping, mixed-direction punctuation errors, or untranslated user-facing strings.
- Keep all shared UI labels in the three aligned locale packs. Page-specific editorial copy belongs in the localized page document, following the Wocart schema.

## Implementation workflow
1. Inspect current branch, working tree, relevant files, SDK types, and tests before editing.
2. State a concise implementation plan and identify risks/unknowns.
3. Make the smallest coherent change; do not refactor unrelated files.
4. Add/update tests for changed behavior, especially empty states, locale parity, RTL, data boundaries, and failure paths.
5. Run from `cod-astro/sellercove/`: `npm ci` when lock/dependencies require it, `npm test`, `npm run validate:all`, `npx astro check`, and `npm run build`.
6. If local browser tooling is available, use Playwright to verify mobile and desktop, Arabic RTL, keyboard navigation, console errors, and key shopper journeys. Do not claim a browser check if it was not actually run.
7. Inspect screenshots and test output; fix root causes, not assertions or lint rules merely to make CI green.
8. Report exact commit, files changed, commands actually run, pass/fail status, and remaining blockers.

## Quality gates
- TypeScript and Astro checks must pass without suppressing meaningful diagnostics.
- Tests must assert real behavior; do not weaken or delete tests to manufacture green CI.
- Build output must succeed before calling the theme build-verified.
- Validate translated strings and schema parity in Arabic, French, and English.
- Check responsive behavior at narrow mobile widths and desktop widths.
- Verify semantic HTML, labels, focus states, contrast, and reduced motion.
- Check SEO basics (unique title/description, canonical/robots behavior where configured, structured data only when grounded in real data).
- Ensure performance choices do not cause layout shift or block the initial page.

## Required completion report
- What changed and why.
- Exact commit SHA and branch.
- Tests/checks run with actual results.
- Known limitations and unverified assumptions.
- Explicit confirmation that `main`, production resources, DNS, and deployments were untouched.
