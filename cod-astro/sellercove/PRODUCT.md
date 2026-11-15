# SellerCove storefront

## Product purpose

SellerCove is a curated Algerian commerce brand. The storefront communicates a modern, technology-aware retail identity while remaining clear, useful and trustworthy for Algerian shoppers.

## Implementation boundary

This theme is built on Wocart's published storefront and theme SDKs. All ordering, delivery-pricing and cash-on-delivery flows are Algeria-only (DZD, Algerian wilayas and communes, configured local delivery and payment methods).

- The live catalogue must contain only real products and supplier-confirmed information.
- Ordering and delivery claims may appear only where the connected store configuration supports them.
- International checkout, payment and fulfilment are not part of the product scope and must not be presented as available.

## Audience

- Shoppers across Algeria ordering on mobile and desktop in Arabic (RTL), French (LTR) and English (LTR).
- Store operator: a founder who needs a mobile-first, low-maintenance storefront.

## Catalogue integrity

No placeholder products, prices, stock counts, discounts, ratings, testimonials, supplier claims, or delivery estimates may be shown as real. Empty catalogue states are preferable to invented data.

## Success criteria

- Fast, accessible and legible on mobile.
- Arabic, French and English copy remains complete and consistent.
- Product details, prices and inventory come from Wocart's real store data.
- Checkout is only exposed where the connected backend can actually fulfil the order.
- The store can evolve without modifying Wocart's reference theme or platform contracts.
