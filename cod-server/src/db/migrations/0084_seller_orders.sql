-- Seller-scoped child order for the first marketplace checkout rollout.
-- The buyer keeps one parent order; the seller receives a scoped child order.
-- This migration is additive and does not infer ownership for legacy orders.
CREATE TABLE seller_orders (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee INTEGER NOT NULL CHECK (delivery_fee >= 0),
  total INTEGER NOT NULL CHECK (total = subtotal + delivery_fee),
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX seller_orders_parent_seller_unique ON seller_orders (order_id, seller_id);
CREATE INDEX seller_orders_parent_idx ON seller_orders (order_id);
CREATE INDEX seller_orders_seller_created_idx ON seller_orders (seller_id, created_at);

CREATE TABLE seller_order_items (
  id TEXT PRIMARY KEY NOT NULL,
  seller_order_id TEXT NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
  order_product_id TEXT NOT NULL UNIQUE REFERENCES order_products(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX seller_order_items_order_idx ON seller_order_items (seller_order_id);

-- A seller may be suspended between catalogue display and checkout. The
-- database is the final guard at commit time; this trigger rolls back the
-- entire D1 batch (parent order, lines and stock deductions included).
CREATE TRIGGER seller_orders_require_approved BEFORE INSERT ON seller_orders FOR EACH ROW WHEN NOT EXISTS (SELECT 1 FROM sellers WHERE id = NEW.seller_id AND status = 'approved') BEGIN SELECT RAISE(ABORT, 'SELLER_NOT_APPROVED'); END;
