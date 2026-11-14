# SellerCove storefront — coding instructions

This directory is SellerCove's independent Wocart theme. Do not edit `cod-astro/theme-00`; it remains the reference theme.

Read `THEME_GUIDE.md` for the Wocart theme contract and the root `AGENTS.md` for repository-wide rules. This theme must continue to use the published `@wocart/storefront` and `@wocart/theme` packages.

## Non-negotiable rules

- Keep platform reads and actions inside the SDK seams already present in this theme. Do not reimplement product, price, stock, delivery, order, OTP, or checkout logic.
- Every shopper-visible string belongs in the Arabic, French and English content packs; keep the locale packs type-aligned.
- Keep theme identity unique: `src/theme/key.ts` must remain `sellercove`.
- Never add demo products, fake prices, fabricated reviews, false scarcity, or unverified delivery/payment claims.
- Wocart's current order and fulfilment path is Algeria-focused. Do not claim international checkout or delivery until a separately supported and configured path exists.
- Never commit API keys, tokens, store credentials, or real account IDs. Use ignored `.dev.vars`.
- Do not deploy, change domains/DNS, or connect production resources from this theme branch.

## Verification

Run from this directory:

```sh
npm ci
npm test
npx astro check
npm run build
``

After changing TypeScript, run the relevant checks. After changing storefront behavior, add or update tests. A build is not a deployment.
