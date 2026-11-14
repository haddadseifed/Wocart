# SellerCove execution runbook

This file is a project guide for a coding agent (Claude Code or another capable agent). It is not an executable command and does not install or launch any agent. Work autonomously only within the safe scope below; do not stop after producing a plan.

## Read first
1. Repository root AGENTS.md.
2. cod-astro/sellercove/AGENTS.md.
3. cod-astro/sellercove/THEME_GUIDE.md, DESIGN.md, PRODUCT.md and README.md.
4. Skills under .claude/skills/sellercove-engineering, frontend-design and webapp-testing.

## Establish the actual baseline before changing code
- Never assume an old CI failure is still present. The historical workflow run 43567677022 is not a reliable description of the current branch state.
- A subsequent independent verification reported, on commit 0a9d8f4: npm ci passed; Vitest passed (88/88 files, 1,027/1,027 tests) on Node 24.22.3 and Node 22.23.4; npm run validate:all passed with zero violations; npx astro check reported zero errors and zero warnings across 393 files; npm run build completed.
- Treat the above as a reported verification snapshot, not as your own execution or proof of the latest remote CI status. Re-fetch the branch head and inspect the latest relevant GitHub Actions run before making claims.
- If the latest CI is green, do not spend time "fixing" already-passing tests. Move to the remaining quality and product work.
- If CI is red, identify the exact failing step and first meaningful error before changing anything. Do not assume failures are stale Theme-00 tests without evidence.

## Execution order
1. Confirm branch is exactly feat/sellercove-storefront. Inspect status and latest commit. Never switch to or write to main.
2. Establish current CI and local verification baseline. Distinguish independently reported results from checks you actually ran.
3. If checks fail, group failures by root cause and make only justified fixes. Never weaken meaningful assertions.
4. Run npm ci, npm test, npm run validate:all, npx astro check and npm run build when the environment permits.
5. Inspect home, listing, product, checkout/order and thank-you routes against the actual Wocart SDK and theme contracts.
6. Verify Arabic RTL, French LTR and English LTR, responsive behavior, keyboard accessibility and reduced-motion behavior.
7. Review performance, image handling, metadata/SEO, empty/error/loading states and security boundaries.
8. Re-run relevant checks and inspect the complete diff.

## Design direction
Build a premium, confident commerce experience using Obsidian #050505, warm ivory #F7F5EF and metallic gold #D4AF37. Prioritize clarity and trust over visual noise. Avoid generic templates. Preserve Wocart's editor/composition model and merchant-overridable settings.

## Agent availability
- This runbook does not imply Claude Code is installed.
- If the `claude` command is unavailable, do not repeatedly invoke it and do not install software or incur subscription/API costs without the user's explicit decision.
- Continue with the available approved coding environment or provide a precise, minimal manual next step. Do not imply that a coding agent has been launched.

## Do not
- Edit cod-astro/theme-00 or root platform code.
- Add production dependencies, alter lockfiles, or change database/schema/platform behavior without approval.
- Copy code from AGPL/GPL repositories.
- Add fake products, reviews, prices or unsupported delivery/payment claims.
- Deploy, merge, modify main, Shopify, DNS or production resources.
- Claim browser, Playwright, Lighthouse or live integration tests that did not run.

## Delivery format
Report files changed and why; each quality gate with pass/fail and exact totals; pages/locales/browser sizes actually inspected; known limitations and unverified provider capabilities; exact commit and branch. Separate verified facts from inherited reports. If blocked, state one concrete blocker and next action. Do not send repeated status-only reports.
