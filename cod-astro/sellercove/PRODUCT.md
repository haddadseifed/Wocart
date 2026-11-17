# SellerCove marketplace

## Product purpose

SellerCove is an Algeria-first, multi-vendor commerce marketplace. Independent sellers own and maintain their inventory; SellerCove is responsible for discovery, the buyer experience and the platform workflows that connect orders to the correct seller.

The intended operating model is a trusted, useful marketplace—not a generic catalogue with an unrelated seller label attached.

## Current implementation boundary

- The current operational pilot is Algeria-only: DZD, Algerian wilayas and communes, and only the delivery and cash-on-delivery options supported by the connected store configuration.
- The current cart pilot accepts products from one seller per checkout. A mixed-seller basket is rejected; do not describe split-cart checkout as available.
- Seller foundation and seller-scoped order access are under development. Treat seller self-service catalogue management, public seller profiles, commissions, settlement ledger, carrier integrations and production reconciliation as incomplete until their code and tests prove otherwise.
- International checkout, payments, tax/customs and fulfilment are not part of the current product scope.

## Audience

- Algerian shoppers using Arabic (RTL), French (LTR) and English (LTR) on mobile and desktop.
- Independent sellers who retain ownership of their stock and need clear order handling.
- A solo founder operating the platform with a mobile-first, low-maintenance workflow.

## Catalogue and marketplace integrity

- Publish only real products with supplier-confirmed names, specifications, images, prices and stock.
- Never invent seller verification, ratings, testimonials, order counts, discounts, delivery fees or delivery estimates.
- Identify the responsible seller only from approved seller data returned by the platform.
- Keep seller ownership, order visibility and stock changes enforced by the backend, not by storefront filtering.
- Empty catalogue and empty-state views are preferable to fabricated social proof or placeholder merchandise.

## Design direction

Warm editorial commerce: warm ivory surfaces, obsidian typography, restrained metallic-gold accents, strong product photography, generous spacing and a calm mobile-first hierarchy. The storefront should feel distinctive and memorable without sacrificing product clarity or checkout conversion.

## Release gates

- Storefront tests, Astro check and production build pass.
- Arabic, French and English copy remains complete and directionally correct.
- Prices, inventory, seller attribution, delivery quotes and order outcomes come from authoritative platform data.
- The full local checkout path is verified, including stock decrement and seller isolation.
- COD is shown only where configured; no live carrier, payment or settlement capability is claimed before integration and reconciliation tests.
- Mobile and desktop screenshots are reviewed, including empty catalogue, populated cart, invalid form, unavailable delivery and reduced-motion states.
