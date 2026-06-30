-- Migration v2: extra product fields
-- Run: psql -U postgres -d aswarrior -f db/migrate_v2.sql

ALTER TABLE products ADD COLUMN IF NOT EXISTS tags        TEXT    DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images      TEXT    DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_text  VARCHAR(100) DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_color VARCHAR(20)  DEFAULT '';
