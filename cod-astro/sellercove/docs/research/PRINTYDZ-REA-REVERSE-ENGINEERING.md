# Printy DZ competitive research — preliminary

**Status:** Partial, evidence-limited reconnaissance  
**Target:** https://printydz.com/  
**Research date:** 2026-11-15  
**SellerCove target:** Algeria-only, single-merchant storefront.  
**Important:** This document records only facts visible in the public HTML response. It is not a complete reverse-engineering report. The target's client-rendered application could not be inspected in this session.

## 1. Verified observations

The public landing response identifies Printy DZ as **"an Algerian print-on-demand marketplace"** and explicitly states that the site needs JavaScript to run.

The landing page exposes these navigation destinations:

| Route | Visible label | Verified scope |
|---|---|---|
| `/` | Printy DZ | Brand positioning only |
| `/products` | Products | Route exists; client content not inspected |
| `/stores` | Stores | Route exists; client content not inspected |
| `/order` | Custom order | Route exists; form/flow not inspected |
| `/shipping` | Shipping information | Route exists; rates/coverage not inspected |
| `/help` | Help Center | Route exists; articles not inspected |
| `/about` | About us | Route exists; content not inspected |
| `/contact` | Contact us | Route exists; contact methods not inspected |

Evidence URLs:
- https://printydz.com/
- https://printydz.com/products
- https://printydz.com/stores
- https://printydz.com/order
- https://printydz.com/shipping
- https://printydz.com/help
- https://printydz.com/about
- https://printydz.com/contact

Each route returned the same minimal JavaScript-required shell to the text crawler. Therefore no claims are made here about product count, prices, filters, cart, checkout, payment methods, shipping fees, vendor onboarding, customer accounts, or actual order handling.

## 2. Competitive interpretation (not verified product behaviour)

The positioning indicates a business model materially different from SellerCove:
- Printy DZ presents itself as a print-on-demand marketplace.
- The visible navigation separates products, stores, and custom orders.
- Shipping information and help are first-class navigation destinations.

These are useful research leads, not proof of how the underlying workflows work.

## 3. SellerCove decisions

SellerCove remains a centrally operated Algerian store. Do not import Printy DZ's marketplace/store model.

| Candidate idea | Decision | Rationale / gate |
|---|---|---|
| Clear product discovery and catalog | Keep improving | Already within SellerCove's retail scope |
| Clear shipping-information page | Adopt if absent/incomplete | Publish only confirmed coverage, rates, delivery methods and policies |
| Contextual help centre / FAQ | Adopt incrementally | Answers must reflect actual SellerCove operations |
| Custom-order request flow | Conditional | Only if a real supplier can quote, produce, quality-check and fulfil custom goods |
| Multi-store/vendor marketplace | Reject for current phase | Conflicts with the single-merchant operating model and adds seller, payout, quality and dispute complexity |
| Print-on-demand production pipeline | Research only | Requires supplier validation, samples, unit economics, lead times, returns and defect handling |

## 4. Required next evidence collection

A full reverse-engineering pass still needs a JavaScript-capable browser session on the public target. Use REA only if it is actually installed and connected to the agent; otherwise use a normal browser plus Playwright for controlled observations.

Collect, without bypassing authentication or access controls:
1. Mobile and desktop screenshots of home, product listing, product detail, custom-order, shipping, help and contact.
2. Public product-card fields, filters, sorting, pagination, variant selectors and empty/loading/error states.
3. Custom-order form fields, upload constraints, validation, price/quote behaviour and confirmation state (do not submit a real order).
4. Cart and checkout screens up to—but not including—placing a real order; use synthetic data only.
5. Public shipping claims, wilaya/commune coverage, fees, carrier names, delivery estimates and exclusions.
6. Public store/vendor information and any published seller terms.
7. Performance, accessibility, responsive behaviour and console/network errors.
8. Evidence capture with timestamp, URL, viewport, screenshot path and confidence label.

Do not probe private APIs, evade bot controls, enumerate accounts, or collect customer data.

## 5. SellerCove implementation gates

Before implementing any competitor-inspired feature:
- Confirm the user problem and SellerCove business value.
- Confirm that the relevant SellerCove SDK/backend route exists.
- Keep product, price, stock, shipping quote and order outcome server-authoritative.
- Use only real supplier data and actual service coverage.
- Keep Arabic RTL, French and English LTR.
- Test phone viewport, keyboard accessibility, reduced motion and failure/empty states.
- Do not copy Printy DZ source code, branding, text, images or distinctive protected visual expression.

## 6. Current conclusion

**What is established:** Printy DZ is publicly described as an Algerian print-on-demand marketplace and exposes separate navigation paths for products, stores, custom orders, shipping, help, about and contact.

**What remains unknown:** The actual UI, workflows, technical stack, catalog, pricing, fulfilment model, vendor operations, checkout, payment methods and delivery rules.

**Recommendation:** Do not implement a Printy DZ clone. First complete browser-based evidence collection. In SellerCove, prioritize truthful shipping information and support content; treat custom ordering as a supplier-dependent experiment; defer marketplace/vendor functionality.
