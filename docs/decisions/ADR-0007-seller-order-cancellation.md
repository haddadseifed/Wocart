# ADR 0007: Seller-initiated cancellation of seller orders

- Status: Accepted (product policy); implementation pending
- Date: 2026-11-16
- Scope: SellerCove marketplace seller-order operations
- Depends on: ADR 0006 (shipment owns delivery lifecycle), the existing shared order lifecycle, and seller membership authorization

## Context

SellerCove models one buyer-facing parent order and one or more seller-scoped child orders. The current checkout pilot creates a seller child order, but `seller_orders` does not yet have its own operational status, cancellation endpoint, or audit history. The parent `orders.status` lifecycle is owned by the platform and must not be repurposed as a seller workflow.

Product decision: a seller with the required permission may cancel its own seller order directly. No prior administrator approval is required for an eligible cancellation.

## Decision

### 1. Authority and tenant boundary

- A seller may act only on a `seller_order` whose `seller_id` is among the authenticated user's active seller memberships.
- Cancellation authorization is a distinct permission: `seller.orders.cancel`.
- Initial role mapping: seller `owner` and `manager` may cancel; `orders` is read-only until its role contract is explicitly expanded. Platform staff retain their separate platform authority.
- Membership must be active at the time of the mutation. A suspended/revoked membership cannot cancel.
- A suspended seller profile does not erase historical access, but it cannot receive new orders. Existing cancellation permission is governed by active membership and the order/shipment gates below.
- Cross-seller IDs must return the same not-found behavior as unknown IDs; do not disclose another seller's order.

### 2. Eligibility and scope

- Version 1 cancels the entire seller child order, not selected lines. Partial line cancellation is a separate future capability.
- Seller cancellation is allowed only before a shipment exists and while the parent order has no shipment/handoff.
- If a shipment exists, the seller endpoint must refuse the operation. It must not silently cancel, delete, or mutate a shipment. Any later exception must use the shipment-owned void/cancellation workflow first, then reconcile the order through platform orchestration.
- A seller cannot use this operation to change the parent order status directly, cancel another seller's child order, or mark delivery complete.
- Require a structured cancellation reason code. An optional bounded note may supplement it; do not accept arbitrary status values from the client.

### 3. State model

Introduce a seller-order lifecycle independent from `orders.status` and shipment status:

- `open` — seller can process the child order.
- `cancelled` — terminal seller decision; no further seller-order transitions in v1.

The transition is `open -> cancelled` only. The write must be conditional on the current state and shipment absence, so concurrent requests cannot both perform side effects. Repeated requests with the same idempotency key return the original result; a repeated request after cancellation must not restore stock or emit duplicate effects.

Do not add seller-order event types to the stable shared public Order/Shipment Event Catalogue as part of this ADR. Use a seller-order-specific audit record until a separately reviewed, backward-compatible event-contract decision is made.

### 4. Atomic effects

The cancellation transaction must atomically:

1. Verify active membership, `seller.orders.cancel`, seller ownership, current seller-order state, parent order state, and absence of a shipment.
2. Change the seller child order to `cancelled` with cancellation reason and timestamps.
3. Append an immutable audit entry containing seller order ID, seller ID, actor user ID, actor role, previous/new state, reason code, optional note, and server timestamp.
4. Apply inventory compensation exactly once, only against the same inventory owner/source and reservation/deduction ledger used by checkout. Never increment stock based only on a client-supplied quantity.
5. Record an idempotency result/outbox intent for downstream effects.

If any required step fails, the entire database transaction must roll back. Audit records must not be editable through the seller portal.

### 5. Parent order, customer, and money effects

- The seller child cancellation does not by itself set the buyer's parent order to `cancelled`.
- A platform-owned reconciliation rule may mark the parent order cancelled only when every child order is cancelled and the existing parent lifecycle permits that transition; mixed active/cancelled seller orders leave the parent order active.
- Notify the buyer only through a reliable, retryable notification/outbox path. The current PR does not establish an SMS, WhatsApp, or email integration; do not claim that notification has been sent until delivery is confirmed.
- `cod_amount` is the amount due from the customer at delivery, not seller payout or settlement. Cancellation must not create a seller payout, refund, commission reversal, or settlement entry unless a corresponding financial ledger and policy exist.
- For COD, the cancelled seller portion must not be collected. For prepaid orders, refunds require a separately defined payment/refund integration and must not be simulated by changing order totals.
- Delivery-fee allocation, commission, settlement, and partial fulfilment rules remain explicit follow-up decisions; do not infer them from the current `seller_orders` monetary columns.

### 6. API and UX requirements

- Expose a seller-scoped cancellation command, not a generic status-update endpoint.
- Validate reason code and optional note server-side; ignore client-supplied seller IDs, actor IDs, prices, stock quantities, parent status, and timestamps.
- Use an atomic conditional update / transaction and return stable conflict codes for already-cancelled, shipment-created, ineligible parent state, and insufficient permission.
- Show a destructive confirmation in the seller portal with the order number, affected products/quantities, and clear consequences. Require a reason before confirmation.
- Display seller-order status separately from parent-order and shipment status. Never label a seller-cancelled child order as a delivered or globally cancelled buyer order.
- Provide Arabic, French, and English strings; ensure RTL/LTR behavior and accessible keyboard/screen-reader confirmation.

## Consequences

### Positive

- Sellers can resolve unavailable stock or fulfilment issues without waiting for an administrator.
- Tenant ownership, platform order lifecycle, and shipment lifecycle remain separate.
- Auditable, idempotent compensation reduces duplicate stock restoration and conflicting actions.

### Costs and risks

- Seller cancellation can reduce the buyer's basket/order value and may leave other sellers' child orders active.
- Inventory restoration is unsafe until the inventory owner and reservation/deduction source are identifiable for each line.
- Prepaid refunds, delivery-fee recalculation, commissions, and settlements remain unsupported until their ledgers/integrations are designed.
- Direct authority increases seller operational responsibility; reason capture, audit, and buyer communication are mandatory controls.

## Required tests before release

- Owner/manager can cancel only their own eligible seller order.
- Read-only `orders` role, inactive membership, and unrelated seller cannot cancel.
- Unknown and cross-tenant IDs do not reveal order existence.
- Shipment exists / handoff has occurred: cancellation is rejected with no mutation.
- Concurrent and replayed requests produce one state transition, one audit record, and at most one inventory compensation.
- Inventory compensation uses the original inventory source and never exceeds the original deduction.
- One child cancelled while another remains active does not cancel the parent.
- All children cancelled reconcile the parent only through the shared parent lifecycle.
- Audit is immutable and records actor, role, reason, and timestamp.
- Notification/outbox retries do not duplicate customer messages.
- Migration safety, API contract, Arabic/French/English UI, and mobile confirmation tests pass.

## Implementation boundary

This ADR records the accepted product policy and required design. It does not claim that cancellation behavior, inventory compensation, customer notifications, refunds, or seller settlement have been implemented. Those require schema/API/UI changes and passing CI before release.
