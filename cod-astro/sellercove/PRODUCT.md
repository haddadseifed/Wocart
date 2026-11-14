# SellerCove storefront

## Product purpose

SellerCove is a curated commerce brand intended to serve international customers first and Algerian customers second. The storefront should communicate a modern, technology-aware retail identity while remaining clear, useful and trustworthy.

## Current implementation boundary

This theme is built on Wocart's published storefront and theme SDKs. The current Wocart ordering, delivery-pricing and cash-on-delivery flow is Algeria-focused. Therefore:

- The current theme may be developed and previewed as a branded storefront.
- The live catalogue must contain only real products and supplier-confirmed information.
- Algeria-specific ordering and delivery claims may appear only where the connected store configuration supports them.
- International checkout, payment and fulfilment are not yet supported by this Wocart integration and must not be presented as available.

International launch requires a verified payment provider, shipping coverage and rates, tax/customs handling, returns process, and corresponding backend support. Do not solve this with frontend copy alone.

## Audience

- Primary strategic audience: international shoppers.
- Secondary initial operational audience: Algerian shoppers where Wocart's connected COD and delivery configuration applies.
- Store operator: a solo founder who needs a mobile-first, low-maintenance storefront.

## Catalogue integrity

No placeholder products, prices, stock counts, discounts, ratings, testimonials, supplier claims, or delivery estimates may be shown as real. Empty catalogue states are preferable to invented data.

## Success criteria

- Fast, accessible and legible on mobile.
- Arabic, French and English copy remains complete and consistent.
- Product details, prices and inventory come from Wocart's real store data.
- Checkout is only exposed where the connected backend can actually fulfil the order.
- The store can evolve without modifying Wocart's reference theme or platform core.
