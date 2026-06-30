require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const pool = require('../db/pool');

// ── Status mapping Bulgarian → English ────────────────────────────────────────
const STATUS_MAP = {
  'нова':          'Pending',
  'потвърдена':    'Processing',
  'изпратена':     'Shipped',
  'доставена':     'Delivered',
  'свършена':      'Delivered',
  'завършена':     'Delivered',
  'отказана':      'Cancelled',
  'анулирана':     'Cancelled',
  'pending':       'Pending',
  'processing':    'Processing',
  'shipped':       'Shipped',
  'delivered':     'Delivered',
  'cancelled':     'Cancelled',
};

function mapStatus(raw) {
  if (!raw) return 'Pending';
  return STATUS_MAP[raw.trim().toLowerCase()] || raw.trim();
}

function parseDate(raw) {
  if (!raw || !raw.trim()) return null;
  try {
    const d = new Date(raw.trim().replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

function parseBool(raw) {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === 'да' || v === 'yes' || v === 'true' || v === '1';
}

function parseAmount(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim().replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

// ── Column name finder (handles slight variations) ─────────────────────────────
function col(row, ...names) {
  for (const name of names) {
    const key = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
    if (key !== undefined && row[key] !== undefined) return (row[key] || '').trim();
  }
  return '';
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/importOrders.js <path/to/orders.csv>');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(csvPath));

  // Try UTF-8 first, fall back stripping BOM
  const content = raw.toString('utf8').replace(/^﻿/, '');

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (rows.length === 0) {
    console.error('No rows found in CSV');
    process.exit(1);
  }

  // Print headers so you can verify mapping
  console.log('\n=== CSV Headers found ===');
  Object.keys(rows[0]).forEach(h => console.log(' •', h));
  console.log('=========================\n');
  console.log(`Found ${rows.length} orders. Importing…\n`);

  let imported = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const row of rows) {
    try {
      const orderNumber   = col(row, '№ на поръчка', 'номер на поръчка', 'order number', 'order_number', 'id');
      const status        = mapStatus(col(row, 'статус', 'status'));
      const createdAt     = parseDate(col(row, 'дата', 'date', 'created_at'));
      const paymentMethod = col(row, 'банков метод на плащане', 'начин на плащане', 'payment method', 'метод на плащане');
      const paymentDate   = parseDate(col(row, 'дата на плащане', 'payment date'));
      const paid          = parseBool(col(row, 'платено', 'paid', 'is paid'));
      const deliveryMethod= col(row, 'начин на доставка', 'delivery method', 'метод на доставка');
      const deliveryCity  = col(row, 'град за доставка', 'delivery city');
      const deliveryAddr  = col(row, 'адрес за доставка', 'delivery address');
      const deliveryPostal= col(row, 'пощенски код за доставка', 'поискан код', 'delivery postal');
      const deliveryPhone = col(row, 'телефон за доставка', 'delivery phone');
      const note          = col(row, 'бележка на клиента', 'note', 'бележка', 'comment');
      const company       = col(row, 'фирма', 'company');
      const eik           = col(row, 'еик', 'eik', 'булстат');
      const vat           = col(row, 'ин по зддс', 'vat', 'vat number', 'ддс номер');
      const billingAddr   = col(row, 'адрес за фактура', 'billing address', 'адрес');
      const billingCity   = col(row, 'град за фактура', 'billing city', 'град');
      const customerName  = col(row, 'лице за доставка', 'клиент', 'customer', 'customer name', 'име');
      const phone         = col(row, 'телефон', 'phone');
      const email         = col(row, 'имейл', 'email', 'e-mail');
      const productsRaw   = col(row, 'продукти', 'products', 'items');
      const discount      = parseAmount(col(row, 'обща отстъпка', 'отстъпка', 'discount')) ?? 0;
      const total         = parseAmount(col(row, 'обща стойност', 'total', 'сума', 'стойност')) ?? 0;

      await pool.query(
        `INSERT INTO orders
           (order_number, status, customer_name, customer_email, customer_phone,
            address, note, total, created_at,
            payment_method, payment_date, paid,
            delivery_method, delivery_city, delivery_address, delivery_postal, delivery_phone,
            billing_company, billing_eik, billing_vat, billing_address, billing_city,
            discount, products_raw, imported_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())`,
        [
          orderNumber || null,
          status,
          customerName || null,
          email || null,
          phone || deliveryPhone || null,
          deliveryAddr || billingAddr || null,
          note || null,
          total,
          createdAt || new Date().toISOString(),
          paymentMethod || null,
          paymentDate,
          paid,
          deliveryMethod || null,
          deliveryCity || billingCity || null,
          deliveryAddr || null,
          deliveryPostal || null,
          deliveryPhone || null,
          company || null,
          eik || null,
          vat || null,
          billingAddr || null,
          billingCity || null,
          discount,
          productsRaw || null,
        ]
      );
      imported++;
      if (imported % 100 === 0) process.stdout.write(`  ${imported}…\r`);
    } catch (err) {
      errors++;
      console.error(`  Row error (order ${row['№ на поръчка'] || '?'}): ${err.message}`);
    }
  }

  console.log(`\nDone! Imported: ${imported}  Skipped: ${skipped}  Errors: ${errors}`);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
