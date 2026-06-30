// Import products from Gombashop CSV export
// Usage: node scripts/importProducts.js products.csv
//
// Expected columns (Gombashop Bulgarian export):
//   Име на продукт, sku, Категория, Параметри, Описание, Марка,
//   Цена, Стара цена, В промоция, Нов продукт, Дата,
//   Скрит продукт, Линк към продукта, Линк към снимка на продукта

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'aswarrior',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// "276,05 EUR" → 276.05
function parsePrice(str) {
  if (!str || str.trim() === '') return null;
  return parseFloat(str.replace(/\s*EUR\s*/i, '').replace(',', '.').trim()) || null;
}

// "Не" / "Да" → false / true
function parseBool(str) {
  return str && str.trim().toLowerCase() === 'да';
}

// "Реплики > AEG Карабини" → { parent: "Реплики", name: "AEG Карабини" }
function parseCategory(str) {
  if (!str) return { parent: null, name: null };
  const parts = str.split('>').map((s) => s.trim());
  if (parts.length === 1) return { parent: null, name: parts[0] };
  return { parent: parts[0], name: parts[parts.length - 1] };
}

function toSlug(str) {
  if (!str) return null;
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9Ѐ-ӿ-]/g, '');
}

// Parse "2021-06-23 12:30:44" or similar
function parseDate(str) {
  if (!str || str.trim() === '') return null;
  const d = new Date(str.trim());
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function importCSV(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const records = [];
  const parser = fs.createReadStream(absolutePath).pipe(
    parse({
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // handle UTF-8 BOM from Excel exports
    })
  );

  for await (const row of parser) {
    records.push(row);
  }

  console.log(`Parsed ${records.length} rows from CSV`);

  const client = await pool.connect();
  let inserted = 0, updated = 0, skipped = 0;

  try {
    await client.query('BEGIN');

    for (const row of records) {
      // Map column names — handle both BG and EN headers
      const name        = row['Име на продукт'] || row['name'] || '';
      const sku         = row['sku'] || row['SKU'] || '';
      const categoryRaw = row['Категория'] || row['category'] || '';
      const parameters  = row['Параметри'] || row['parameters'] || '';
      const description = row['Описание'] || row['description'] || '';
      const brand       = row['Марка'] || row['brand'] || '';
      const priceRaw    = row['Цена'] || row['price'] || '';
      const oldPriceRaw = row['Стара цена'] || row['old_price'] || '';
      const promoRaw    = row['В промоция'] || '';
      const newRaw      = row['Нов продукт'] || '';
      const dateRaw     = row['Дата'] || '';
      const hiddenRaw   = row['Скрит продукт'] || '';
      const productUrl  = row['Линк към продукта'] || '';
      const imageUrl    = row['Линк към снимка на продукта'] || '';

      if (!name.trim()) { skipped++; continue; }

      const price    = parsePrice(priceRaw) ?? 0;
      const oldPrice = parsePrice(oldPriceRaw);
      const cat      = parseCategory(categoryRaw);

      // Upsert category
      if (cat.name) {
        await client.query(
          `INSERT INTO categories (parent, name, slug)
           VALUES ($1, $2, $3)
           ON CONFLICT (parent, name) DO NOTHING`,
          [cat.parent, cat.name, toSlug(cat.name)]
        );
      }

      // Upsert product by SKU (or insert if no SKU)
      if (sku.trim()) {
        const existing = await client.query('SELECT id FROM products WHERE sku = $1', [sku]);
        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE products SET
              name = $1, category = $2, category_parent = $3,
              parameters = $4, description = $5, brand = $6,
              price = $7, old_price = $8, on_promotion = $9,
              is_new = $10, hidden = $11, image_url = $12,
              product_url = $13, created_at = $14
             WHERE sku = $15`,
            [name, cat.name, cat.parent, parameters, description, brand,
             price, oldPrice, parseBool(promoRaw), parseBool(newRaw),
             parseBool(hiddenRaw), imageUrl, productUrl, parseDate(dateRaw), sku]
          );
          updated++;
        } else {
          await client.query(
            `INSERT INTO products
              (name, sku, category, category_parent, parameters, description,
               brand, price, old_price, on_promotion, is_new, hidden,
               image_url, product_url, created_at, stock_quantity)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0)`,
            [name, sku, cat.name, cat.parent, parameters, description, brand,
             price, oldPrice, parseBool(promoRaw), parseBool(newRaw),
             parseBool(hiddenRaw), imageUrl, productUrl, parseDate(dateRaw)]
          );
          inserted++;
        }
      } else {
        // No SKU — insert without conflict check
        await client.query(
          `INSERT INTO products
            (name, sku, category, category_parent, parameters, description,
             brand, price, old_price, on_promotion, is_new, hidden,
             image_url, product_url, created_at, stock_quantity)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0)`,
          [name, sku || null, cat.name, cat.parent, parameters, description, brand,
           price, oldPrice, parseBool(promoRaw), parseBool(newRaw),
           parseBool(hiddenRaw), imageUrl, productUrl, parseDate(dateRaw)]
        );
        inserted++;
      }
    }

    await client.query('COMMIT');
    console.log(`Done: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('Usage: node scripts/importProducts.js <path-to-csv>');
  process.exit(1);
}

importCSV(csvFile);
