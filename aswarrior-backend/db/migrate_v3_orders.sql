-- Migration v3: expand orders table for Gombashop import
-- Run: psql -U postgres -d aswarrior -f db/migrate_v3_orders.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number    VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_date    TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid            BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city   VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_phone  VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_company VARCHAR(300);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_eik     VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_vat     VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_city    VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount        NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS products_raw    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS imported_at     TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number) WHERE order_number IS NOT NULL;
