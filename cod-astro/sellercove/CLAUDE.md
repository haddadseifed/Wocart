# SellerCove Claude Code runbook

You are the implementation agent for SellerCove. Work autonomously within the safe scope below; do not stop after producing a plan.

## Read first
1. Repository root AGENTS.md.
2. cod-astro/sellercove/AGENTS.md.
3. cod-astro/sellercove/THEME_GUIDE.md, DESIGN.md, PRODUCT.md and README.md.
4. Skills under .claude/skills/sellercove-engineering, frontend-design and webapp-testing.

## Current known blocker
The latest recorded SellerCove GitHub Actions run (43567677022) passed npm ci but failed npm test: 88 test files, 7 failed; 1,027 tests, 12 failed. astro check and build were skipped. Fetch the latest branch and logs before relying on this snapshot.

The failure output includes assumptions that may have been copied from Theme-00, including theme-00 identity and Theme-00-specific home sections. Do not blindly change production code or rewrite tests to pass. Determine the intended SellerCove contract from current page JSON, theme catalog, SDK and product/design docs. Preserve meaningful behavioral tests; update only demonstrably stale expectations and add regression coverage for SellerCove's actual behavior.

## Execution order
1. Confirm branch is exactly feat/sellercove-storefront. Inspect status and latest commit. Never switch to or write to main.
2. Re-run and triage failing tests. Group failures by root cause.
3. Repair justified test/implementation mismatches without weakening assertions.
4. Run npm run validate:all, npx astro check and npm run build.
5. Inspect home, listing, product, checkout/order and thank-you routes.
6. Verify Arabic RTL, French LTR and English LTR, plus responsive and accessible behavior.
7. Review performance, image handling, metadata/SEO, empty/error/loading states and security boundaries.
8. Re-run all checks and inspect the complete diff.

## Design direction
Build a premium, confident commerce experience using Obsidian #050505, warm ivory #F7F5EF and metallic gold #D4AF37. Prioritize clarity and trust over visual noise. Avoid generic templates. Preserve Wocart's editor/composition model and merchant-overridable settings.

## Do not
- Edit cod-astro/theme-00 or root platform code.
- Add production dependencies, alter lockfiles, or change database/schema/platform behavior without approval.
- Copy code from AGPL/GPL repositories.
- Add fake products, reviews, prices or unsupported delivery/payment claims.
- Deploy, merge, modify main, Shopify, DNS or production resources.
- Claim browser, Lighthouse or live integration tests that did not run.

## Delivery format
Report files changed and why; each quality gate with pass/fail and exact totals; pages/locales/browser sizes actually inspected; known limitations and unverified provider capabilities; exact commit and branch. If blocked, state one concrete blocker and next action. Do not send repeated status-only reports.