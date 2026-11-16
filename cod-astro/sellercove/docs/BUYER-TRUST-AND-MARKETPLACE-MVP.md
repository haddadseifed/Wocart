# SellerCove — Buyer Trust & Marketplace MVP

**Status:** Product and acceptance specification. It does not claim that the described marketplace capabilities are implemented.

## The buyer's promise

SellerCove should make buying from independent Algerian sellers feel clear, accountable, and predictable. Trust is earned through accurate information and operational follow-through—not decorative trust badges or unsupported promises.

## The first transaction we must get right

1. Buyer discovers a real product.
2. Buyer can identify the seller and understand who is responsible for the sale.
3. Buyer sees the exact variant, price, stock status, and delivery information that the system can actually verify.
4. Buyer submits a clear order with a final payable amount.
5. SellerCove records the order and routes it to the correct seller.
6. The buyer receives a truthful confirmation with a reference and next step.
7. Operations can track acceptance, preparation, handoff, delivery, collection, cancellation, or return.
8. Buyer can reach a real support route if anything goes wrong.

The pilot may restrict checkout to one seller per order. If so, communicate the restriction before submission and do not silently drop or split basket items. The database and domain model should still be designed to support parent orders and seller suborders.

## Non-negotiable buyer-facing requirements

### Product truth
- No invented product, seller, price, stock, rating, review, discount, origin, or popularity claim.
- Product variants and availability must be validated by the server at checkout.
- Distinguish "in stock", "available on request", and "availability to be confirmed" only where those states exist in data.

### Seller accountability
- Display a seller name/profile only after it is verified and approved.
- Explain whether SellerCove or the seller handles customer support, returns, and product issues according to the actual agreement.
- Do not imply every supplier is the seller. Inventory owner, seller, fulfillment provider, and carrier are separate roles.

### Delivery and payment truth
- Calculate delivery availability and fees from verified configuration.
- If the quote is not available, state that it needs confirmation; never invent a fee or ETA.
- Display COD only where the actual order flow and operating agreement support it.
- Do not claim carrier partnership, nationwide coverage, insurance, or delivery guarantees without evidence.

### Order certainty
- A successful form submit is not proof of seller acceptance or carrier pickup.
- Use explicit order states and show only states confirmed by the backend.
- Give a stable order reference, useful next step, and support contact.
- Do not promise a confirmation time window unless it is operationally measured and supported.

### Policies and support
Before public sales, publish policies reviewed against actual practice:
- seller and marketplace responsibilities;
- cancellation before dispatch;
- failed delivery and refused COD orders;
- returns, damaged/wrong items, and refunds;
- privacy and personal-data use;
- complaint and escalation route.

Do not publish a generic "buyer protection" badge until the protection process, eligibility, funding, and dispute authority exist.

## Minimum launch checklist

| Area | Evidence required before launch |
|---|---|
| Catalogue | Real product records, owner/seller assignment, correct price and variant |
| Seller | Approved seller, agreement, contact/escalation path |
| Inventory | Authoritative stock source, reservation, oversell protection |
| Checkout | Server-side re-price/revalidate, explicit seller boundary, idempotency |
| Delivery | Verified coverage and quote or clearly stated manual confirmation |
| COD | Named beneficiary, collection and reconciliation process |
| Order status | State transitions backed by real operational events |
| Returns | Published process and responsible party |
| Support | Working contact route and internal ownership |
| Accessibility | Arabic RTL, French/English LTR, keyboard and mobile checks |
| QA | Staging end-to-end order tests and failure-path tests |

## Metrics that matter

Instrument only reliable events:
- product view → add to cart → checkout start → order placed;
- seller acceptance/rejection;
- ready for dispatch → handed to carrier → delivered/failed;
- COD collected and reconciled;
- cancellation, return, complaint, resolution;
- repeat purchase and seller fulfilment quality.

Do not call placed orders "sales" or gross order value "revenue" until delivery, collection, refunds, and accounting definitions are reconciled.

## Current reality and next engineering boundary

The current Astro theme is a branded storefront shell on the Wocart SDK. Its existing checkout/order path is Algeria-focused, but this alone does not establish multi-vendor ownership, seller suborders, commissions, seller payouts, or carrier integrations.

The next implementation work must begin with a read-only backend/schema/query audit, then a reviewed architecture decision record. No production migration, live COD/payout, carrier integration, or deployment is part of this document.
