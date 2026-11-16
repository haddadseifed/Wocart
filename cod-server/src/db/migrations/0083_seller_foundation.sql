-- Seller foundation for the multi-vendor marketplace.
-- Existing products intentionally remain unassigned; do not infer a seller from
-- the store operator, supplier, stock owner, or a historical test product.
CREATE TABLE sellers (
  id TEXT PRIMARY KEY NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  logo_key TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  approved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX sellers_store_slug_unique ON sellers (store_id, slug);
CREATE INDEX sellers_store_status_idx ON sellers (store_id, status);

CREATE TABLE seller_memberships (
  id TEXT PRIMARY KEY NOT NULL,
  seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'catalog', 'orders')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX seller_memberships_seller_user_unique ON seller_memberships (seller_id, user_id);
CREATE INDEX seller_memberships_user_status_idx ON seller_memberships (user_id, status);

ALTER TABLE products ADD COLUMN seller_id TEXT REFERENCES sellers(id) ON DELETE SET NULL;
CREATE INDEX products_seller_id_idx ON products (seller_id);
