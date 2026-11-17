# SellerCove storefront design specification

Status: implementation direction for the existing Astro storefront. This is a design specification, not a claim that production is deployed.

## 1. Brief and direction

SellerCove is an Algeria-first multi-vendor marketplace. The storefront must make product discovery and purchase decisions feel clear, useful and trustworthy—not behave like a cinematic campaign page.

Visual direction: **warm editorial commerce** — distinctive, tactile, restrained and conversion-aware.
Signature: authentic product photography is the primary visual asset; the interface uses quiet ivory surfaces, precise obsidian typography and a restrained metallic-gold accent.

## 2. Existing stack and boundaries

- Preserve Astro 7, TypeScript, Tailwind v4, @wocart/storefront and @wocart/theme.
- Keep theme work inside cod-astro/sellercove/src/theme/.
- The platform SDK remains authoritative for products, seller ownership, stock, prices, shipping quotes and order submission.
- Do not add dependencies, third-party trackers, remote video or unlicensed media for decorative effect.
- Shipped page documents are defaults. A saved CodFlow page document can override them; update saved documents through the supported editor, not by writing directly to the database.
- Seller attribution may be shown only when approved seller data is supplied by the platform. Never fabricate a verification badge or seller reputation.

## 3. Design tokens

Use the theme's existing scheme and runtime tokens; do not add a competing hard-coded palette.

| Role | Token / value |
|---|---|
| Main page | Warm Ivory #F7F5EF |
| Primary text / CTA | Obsidian #050505 |
| Accent | Metallic Gold #D4AF37 |
| Secondary surface | Stone #F0EDE4 |
| Muted text | Derived from scheme text/background |
| Borders | Scheme border token |
| Body / UI font | Existing bundled theme body font |
| Heading font | Existing bundled theme heading font |
| Type scale | Existing Tailwind theme scale |
| Spacing | 4px lattice; 12–24px mobile gutters, 24–40px desktop gutters |
| Corners | Existing soft theme radius tokens; no glass surfaces |

No external font request is needed. Keep Arabic headings untracked (letter-spacing: 0) and retain RTL-aware logical properties.

## 4. Page architecture

1. Home — concise hero, primary path to products, category discovery, selected products, simple ordering steps and factual service assurances only.
2. Catalog / category / collection — breadcrumbs, category navigation, sorting, two-column product grid on phones, three columns on medium screens, merchant-selected 2–5 columns on desktop, pagination and honest empty states.
3. Search — real product search and sort; normalize common Arabic typing variants without mutating indexed product data.
4. Product detail — authentic gallery, product name, store-configured DZD price, variants, stock state, description, actual shipping choice/rate and order form. Show seller attribution only when the platform supplies approved seller data.
5. Cart / checkout — server-validated prices and inventory, customer and delivery fields, visible shipping line and total, COD only where enabled. The current pilot allows one seller per checkout. Preserve a parent checkout with seller-specific suborders and line-level ownership in the target order architecture; mixed-seller checkout remains blocked until suborders, per-seller stock reservations, shipment/fee allocation, COD reconciliation and returns are implemented and tested.
6. Thank-you / order tracking — platform-confirmed order outcome only; no invented confirmation promise.

## 5. Components and behaviour

- Header: brand, menu, search and cart; retain accessible mobile navigation.
- Product card: authentic product photo, real stock/discount status, actual review data only when present, name and price. The whole card links to the product.
- Category tiles: real category image or a real product image fallback; no generic stock imagery.
- Forms: visible labels or equivalent accessible names, inline errors, keyboard focus and touch targets of at least 44px.
- Delivery: wilaya, commune and delivery method come from platform data. Show an exact fee only when a configured rate or server quote exists.
- Order totals: server quote is authoritative. Never trust a client-only price for submission.

## 6. Responsive rules

- Phone (320–639px): two-column catalog grid, readable card titles and prices, no horizontal overflow, horizontally scrollable category chips where useful, full-width primary actions and safe-area-aware sticky actions.
- Tablet (640–1023px): three-column product grid where space allows.
- Desktop (1024px+): merchant-selected 2–5 column grid; product gallery and information may sit side-by-side.
- Carousels are optional merchandising rows, not the default catalog browsing pattern.
- No autoplaying hero video, WebGL, cursor-only interaction or heavy blur.

## 7. Motion and accessibility

- Use short state transitions (150–250ms) and subtle image hover zoom only for hover-capable pointers.
- Keep the resting state visible if JavaScript fails.
- Honour prefers-reduced-motion: reduce; no scroll-jacking or perpetual animation.
- Preserve semantic headings, alt text, focus-visible outlines, form error associations and RTL/LTR directionality.

## 8. Data truth and release gates

Functional only when connected to existing platform routes and tested: catalog, category navigation, product pages, cart, server-side price/stock validation, shipping quotes, COD order submission and wilaya/commune selection.

Not to be fabricated: products, inventory, prices, ratings, review counts, sales figures, seller verification, delivery prices, payment methods or delivery promises.

Before release: pass storefront tests, Astro check and build; inspect mobile and desktop screenshots; test empty/populated cart, invalid form, unavailable shipping, keyboard navigation, reduced motion and seller isolation. A passing CI build alone is not proof of a live end-to-end order.
