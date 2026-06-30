require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const pool    = require('./db/pool');

const app = express();

// Add product editor columns if they don't exist
pool.query(`
  ALTER TABLE products
    ADD COLUMN IF NOT EXISTS specs             JSONB   DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS variants          JSONB   DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS upsell_ids        JSONB   DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS meta_title        TEXT    DEFAULT '',
    ADD COLUMN IF NOT EXISTS meta_description  TEXT    DEFAULT '',
    ADD COLUMN IF NOT EXISTS slug              TEXT    DEFAULT '',
    ADD COLUMN IF NOT EXISTS short_description TEXT    DEFAULT '',
    ADD COLUMN IF NOT EXISTS characteristics   JSONB   DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS track_stock       BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS sort_order        INTEGER DEFAULT 0
`).catch(e => console.error('Migration error:', e.message));

app.use(cors());
app.use(express.json({ limit: '20mb' })); // large limit for base64 image uploads

// Serve background-removed product images
app.use('/processed', express.static(path.join(__dirname, 'public/processed')));

app.use('/api/products',         require('./routes/products'));
app.use('/api/inventory',        require('./routes/inventory'));
app.use('/api/orders',           require('./routes/orders'));
app.use('/api/categories',       require('./routes/categories'));
app.use('/api/stats',            require('./routes/stats'));
app.use('/api/admin/remove-bg',  require('./routes/removebg'));
app.use('/api/admin/scrape',     require('./routes/scrapeImages'));
app.use('/images',               express.static(path.join(__dirname, 'public/images')));

app.use('/api/admin/restart',     require('./routes/restart'));
const STARTED_AT = Date.now();
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date(), startedAt: STARTED_AT }));

// Serve built frontend (run `npm run build` in aswarrior-website first)
const DIST = path.join(__dirname, '..', 'aswarrior-website', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.use((req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`AS Warrior API running on http://localhost:${PORT}`));
