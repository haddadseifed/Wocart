# SellerCove storefront design specification

Status: implementation direction for the existing Astro storefront. This is a design specification, not a claim that production is deployed.

## 1. Brief and direction
A mobile-first Algerian multi-category retail store. The first screen must make the store and product discovery immediately clear; it must not behave like a cinematic campaign page.

Visual direction: **warm editorial commerce** — clear, tactile, restrained, trustworthy.
Signature: product photography is the primary visual asset; the UI uses quiet ivory surfaces, precise dark typography, and a small metallic-gold accent.

## 2. Existing stack and boundaries
- Preserve Astro 7, TypeScript, Tailwind v4, `@wocart/storefront`, and `@wocart/theme`.
- Keep all theme work inside `cod-astro/sellercove/src/theme/`.
- Preserve the SDK as the authority for product, stock, price, shipping quotes, and order submission.
- Do not add dependencies, third-party trackers, remote video, or unlicensed media.
- The shipped page documents are defaults. A saved CodFlow Cloud page document can override them and must be updated through its supported editor, not by writing directly to the database.

## 3. Design tokens
Use the theme's existing scheme and runtime tokens; do not add a competing hard-coded palette.

| Role | Token / value |
|---|---|
| Main page | Warm Ivory `#F7F5EF` |
| Primary text / CTA | Obsidian `#050505` |
| Accent | Metallic Gold `#D4AF37` |
| Secondary surface | Stone `#F0EDE4` |
| Muted text | Derived from scheme text/background |
| Borders | Scheme border token |
| Body / UI font | Existing bundled theme body font |
| Heading font | Existing bundled theme heading font |
| Type scale | Existing Tailwind theme scale; display headings use the available 2xl–6xl steps |
| Spacing | 4px lattice; 12–24px mobile gutters, 24–40px desktop gutters |
| Corners | Existing soft theme radius tokens; no glass surfaces |

No external font request is needed. Keep Arabic headings untracked (letter-spacing: 0) and retain RTL-aware logical properties.

## 4. Page architecture
1. **Home** — concise split hero, clear primary link to all products, category discovery, selected products, simple ordering steps, factual service assurances only.
2. **Catalog / category / collection** — page title, breadcrumb, category chips, sorting, two-column product grid on phones, three columns on medium screens, merchant-selected 2–5 columns on desktop, pagination and honest empty states.
3. **Search** — real product search and sort, with a clear empty state.
4. **Product detail** — image gallery, product name, price in store-configured DZD currency, variants, stock state, description, actual shipping choice/rate, order form, and mobile sticky buy action.
5. **Cart / checkout** — empty and populated states, server-validated prices and inventory, customer and delivery fields, visible shipping line and total, COD only where enabled.
6. **Thank-you / order tracking** — platform-confirmed order outcome only; no invented confirmation promise.

## 5. Components and behaviour
- Header: brand, menu, search, cart; mobile bottom navigation remains available.
- Product card: product photo, real stock/discount status, actual review data only when present, name and price. Whole card links to the product.
- Category tiles: real category image or a real product image fallback; no generic stock imagery.
- Forms: visible labels or equivalent accessible names, inline errors, keyboard focus, touch targets at least 44px.
- Delivery: wilaya, commune and delivery method are sourced from platform data. Home address appears only when needed. Show an exact fee only when a configured rate or server quote exists; otherwise show the existing calculated/unavailable state.
- Order totals: server quote is authoritative. Never calculate or trust a client-only price for submission.

## 6. Responsive rules
- Phone (320–639px): two-column catalog grid, readable card titles and prices, no horizontal page overflow, category chips may scroll horizontally, full-width primary actions, safe-area-aware sticky actions.
- Tablet (640–1023px): three-column product grid where space allows; maintain comfortable card width.
- Desktop (1024px+): merchant-selected 2–5 column grid; product gallery and information may sit side-by-side; preserve sticky gallery only where it improves orientation.
- Carousels are optional merchandising rows, not the default catalog browsing pattern.
- No autoplaying hero video, WebGL, cursor-only interaction, or heavy blur.

## 7. Motion and accessibility
- Use short state transitions (150–250ms) and subtle image hover zoom only for hover-capable pointers.
- Keep the resting state visible if JavaScript fails.
- Honour `prefers-reduced-motion: reduce`; no scroll-jacking or perpetual animation.
- Preserve semantic headings, alt text, focus-visible outlines, form error associations, and RTL/LTR directionality.

## 8. Data truth and release gates
Functional only when connected to existing platform routes and tested: catalog, category navigation, product pages, cart, server-side price/stock validation, shipping quotes, COD order submission, wilaya/commune selection.
Not to be fabricated: product inventory, prices, ratings, review counts, sales figures, delivery prices, payment methods, or delivery promises.
Before release: pass storefront tests, Astro check and build; inspect mobile and desktop screenshots; test empty/populated cart, invalid form, unavailable shipping, keyboard navigation, and reduced motion. A passing CI build alone is not proof of a live end-to-end order.
