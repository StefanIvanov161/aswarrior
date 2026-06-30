require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const pool = require('../db/pool');

function parseAmount(raw) {
  if (!raw || !raw.toString().trim()) return null;
  const s = raw.toString().trim().replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function col(row, ...names) {
  for (const name of names) {
    const key = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
    if (key !== undefined && row[key] !== undefined && row[key] !== '') return row[key].toString().trim();
  }
  return '';
}

function decodeEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");
}

function normalize(str) {
  return decodeEntities(str).toLowerCase().replace(/\s+/g, ' ').trim();
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/importStock.js <path/to/file.csv>');
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath)).toString('utf8').replace(/^﻿/, '');

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (!rows.length) { console.error('No rows found'); process.exit(1); }

  console.log('\n=== CSV Headers ===');
  Object.keys(rows[0]).forEach(h => console.log(' •', h));
  console.log(`===================\n`);
  console.log(`Found ${rows.length} rows. Matching by product name…\n`);

  let updated = 0, notFound = 0, skipped = 0;

  for (const row of rows) {
    const name         = col(row, 'Име на продукт', 'ime na produkt', 'name', 'product name', 'продукт');
    const stockRaw     = col(row, 'Наличност', 'nalichnost', 'quantity', 'stock', 'qty', 'количество');
    const oldPriceRaw  = col(row, 'Стара цена', 'stara cena', 'old price', 'old_price');
    const priceRaw     = col(row, 'Цена', 'cena', 'price', 'цена');

    if (!name) { skipped++; continue; }

    const stock    = stockRaw    !== '' ? parseInt(stockRaw)       : null;
    const price    = parseAmount(priceRaw);
    const oldPrice = parseAmount(oldPriceRaw);

    // Build update fields
    const fields = {};
    if (stock    !== null && !isNaN(stock)) fields.stock_quantity = stock;
    if (price    !== null)                  fields.price          = price;
    if (oldPrice !== null)                  fields.old_price      = oldPrice;

    if (Object.keys(fields).length === 0) { skipped++; continue; }

    // Match by exact name, also try with decoded HTML entities
    const decoded = decodeEntities(name).trim();
    const { rows: found } = await pool.query(
      `SELECT id, name FROM products WHERE LOWER(TRIM(name)) = LOWER($1) OR LOWER(TRIM(name)) = LOWER($2) LIMIT 1`,
      [name.trim(), decoded]
    );

    if (!found.length) {
      console.log(`  NOT FOUND: "${name}"`);
      notFound++;
      continue;
    }

    const setClauses = Object.keys(fields).map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values     = [...Object.values(fields), found[0].id];
    await pool.query(
      `UPDATE products SET ${setClauses} WHERE id = $${values.length}`,
      values
    );

    updated++;
    process.stdout.write(`  Updated (${updated}): ${found[0].name}\r`);
  }

  console.log(`\n\nDone!`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Skipped:   ${skipped}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
