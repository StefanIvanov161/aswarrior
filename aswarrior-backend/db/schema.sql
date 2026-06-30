-- AS Warrior Database Schema
-- Run this once: psql -U postgres -d aswarrior -f db/schema.sql

CREATE TABLE IF NOT EXISTS categories (
  id        SERIAL PRIMARY KEY,
  parent    VARCHAR(200),
  name      VARCHAR(200) NOT NULL,
  slug      VARCHAR(200) UNIQUE,
  UNIQUE(parent, name)
);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(500) NOT NULL,
  sku            VARCHAR(100) UNIQUE,
  category       VARCHAR(200),
  category_parent VARCHAR(200),
  parameters     TEXT,
  description    TEXT,
  brand          VARCHAR(200),
  price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price      NUMERIC(10,2),
  on_promotion   BOOLEAN DEFAULT false,
  is_new         BOOLEAN DEFAULT false,
  hidden         BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  image_url      TEXT,
  product_url    TEXT,
  created_at     TIMESTAMPTZ,
  imported_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_log (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  sku         VARCHAR(100),
  change      INTEGER NOT NULL,
  reason      VARCHAR(200),
  note        TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  customer_name VARCHAR(300),
  customer_email VARCHAR(300),
  customer_phone VARCHAR(50),
  address       TEXT,
  status        VARCHAR(50) DEFAULT 'pending',
  total         NUMERIC(10,2),
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  sku        VARCHAR(100),
  name       VARCHAR(500),
  price      NUMERIC(10,2),
  quantity   INTEGER NOT NULL DEFAULT 1
);

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
