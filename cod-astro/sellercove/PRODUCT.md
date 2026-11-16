# SellerCove — Product Truth

## Product identity

SellerCove is an Algeria-first, multi-vendor e-commerce marketplace. It is an independent customer-facing brand built on Wocart Core, which remains neutral and reusable. SellerCove is not a single-seller retail store and must not be positioned as an international-first store.

The initial operating market is Algeria. The buyer experience is mobile-first, Arabic-first with native RTL, and supports French and English. Prices are displayed in DZD using integer minor units appropriate to the existing money contract.

## Marketplace model

SellerCove coordinates discovery, listings, buyer acquisition, order orchestration, seller governance, and marketplace operations.

Keep these roles distinct:
- **Seller:** the party accountable for the listing and sale to the buyer under the marketplace's published terms.
- **Supplier:** the party that provides goods; it may or may not also be the seller.
- **Inventory owner:** the legal/operational owner of stock. This may differ from the seller.
- **Fulfillment provider:** the party that prepares or hands over goods.
- **Carrier:** the delivery company transporting the shipment.
- **SellerCove:** marketplace operator; do not imply that it owns every listed item or is the seller of record unless the actual legal and operating model says so.

Seller onboarding is invitation/approval-based for the pilot. Do not expose open seller registration until verification, agreements, permissions, dispute handling, and settlement controls are implemented.

## Current implementation boundary

The current repository contains a branded Astro storefront shell built on Wocart's storefront/theme SDKs. Its existing order, delivery-pricing, and cash-on-delivery path is Algeria-focused and is not evidence of a multi-vendor marketplace backend.

Do not describe the current system as supporting multi-vendor inventory, seller-specific order splitting, seller dashboards, seller settlements, marketplace commissions, multi-seller checkout, international checkout, or carrier integrations unless each capability is implemented and verified end-to-end.

A single-seller operational pilot may be used to validate demand, but the underlying target architecture remains parent order → seller suborders, with explicit seller and inventory ownership. Do not turn the pilot limitation into a permanent single-vendor data model.

## Buyer trust standard

Every buyer-facing claim must be backed by live configuration, an implemented process, or a documented policy. Never fabricate:
- product stock, seller identity, product origin, reviews, ratings, discounts, or popularity;
- delivery coverage, carrier partnerships, shipping prices, or delivery dates;
- COD availability, payment security, refunds, returns, warranties, or buyer protection;
- order confirmation or support response-time promises.

Before order submission, show the buyer:
1. Accurate product identity, variant, price, and availability.
2. Seller identity or a clear explanation of who is responsible for the sale.
3. Delivery fee and service availability for the buyer's wilaya/commune when verified; otherwise say it will be confirmed, not guessed.
4. Total payable amount and COD/payment method only when supported.
5. A concise cancellation, return, and complaint route based on the actual published policy.
6. A clear consent/confirmation action and what happens next.

After submission, show only a confirmed order reference and verified order state. Never imply an order was accepted by a seller or carrier if the backend has not confirmed it.

## Buyer journey acceptance criteria

- Arabic is the default language where configured; RTL layout is correct across navigation, forms, validation, checkout, and order status.
- Product cards and product pages use real catalogue data only.
- Price, variant, stock, delivery quote, and order total are revalidated server-side at submission.
- Checkout does not silently combine multiple sellers until seller suborders, allocation, shipping, payment/COD reconciliation, and failure handling are implemented.
- If a basket contains items from incompatible sellers or fulfillment groups, explain the limitation clearly and preserve the basket.
- Form errors are localised, actionable, and do not expose internal server details.
- The thank-you page displays only verified order data; no invented delivery ETA.
- A buyer can find contact, cancellation/return, privacy, and terms information without hunting through the site.
- Mobile interaction is usable with one hand, readable at common phone widths, keyboard accessible, and resilient to slow networks.

## Launch gates

The marketplace is not ready for public transaction launch until the following are proven in staging:
- seller identity, onboarding approval, membership permissions, and seller data isolation;
- product ownership and inventory ownership rules;
- atomic stock reservation and prevention of overselling;
- parent orders and seller suborders with immutable item/price snapshots;
- COD beneficiary and carrier cash reconciliation rules;
- commission calculation rules and effective dates;
- append-only financial journal, idempotency, reversal, and manual settlement reconciliation;
- cancellation, partial fulfillment, returns, refunds, disputes, and audit trail;
- verified carrier coverage, rates, return handling, COD terms, and operational agreement;
- buyer-facing policies that match actual legal and operational practice;
- end-to-end tests across Arabic, French, and English on mobile.

## Product success

Optimise for buyer confidence and completed, correctly fulfilled orders—not animation count, page count, or vanity metrics. Measure product discovery, add-to-cart, checkout completion, seller acceptance, delivery completion, cancellation/return reasons, complaint resolution, and repeat purchase only when the underlying events are reliable.

## Engineering guardrails

- Keep Wocart Core neutral and reusable; keep SellerCove branding and presentation in its own app/theme layer.
- Prefer a modular monolith; do not introduce microservices without demonstrated operational need.
- Do not change production data, migrations, secrets, domains, payment accounts, carrier accounts, or deployment settings without explicit approval.
- Do not use frontend copy to disguise missing backend capabilities.
