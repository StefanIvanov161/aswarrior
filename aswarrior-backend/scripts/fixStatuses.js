require('dotenv').config();
const pool = require('../db/pool');

const STATUS_MAP = [
  { english: 'Delivered',  bulgarian: ['завършена','свършена','изпълнена','доставена','изпълнено','завършено','свършено'] },
  { english: 'Shipped',    bulgarian: ['изпратена','доставка','при куриер','в доставка','изпратено'] },
  { english: 'Processing', bulgarian: ['потвърдена','обработва се','приета','потвърдено','в обработка'] },
  { english: 'Pending',    bulgarian: ['нова','изчаква','нов','нова поръчка'] },
  { english: 'Cancelled',  bulgarian: ['отказана','анулирана','отменена','отказано','анулирано'] },
  { english: 'Returned',   bulgarian: ['върната','върнато','върнат','върнати','return','returned'] },
];

async function main() {
  // Show what's actually in DB
  const { rows: current } = await pool.query(
    "SELECT DISTINCT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC"
  );
  console.log('\nCurrent statuses in DB:');
  current.forEach(r => {
    const buf = Buffer.from(r.status, 'utf8');
    console.log(`  "${r.status}" (${r.count} orders) — hex: ${buf.toString('hex')}`);
  });

  console.log('\nApplying updates…');
  let total = 0;
  for (const { english, bulgarian } of STATUS_MAP) {
    const placeholders = bulgarian.map((_, i) => `LOWER(status) = $${i + 1}`).join(' OR ');
    const sql = `UPDATE orders SET status = '${english}' WHERE ${placeholders}`;
    const { rowCount } = await pool.query(sql, bulgarian);
    console.log(`  → ${english}: ${rowCount} rows updated`);
    total += rowCount;
  }

  console.log(`\nTotal updated: ${total}`);

  // Show remaining non-English statuses
  const ENGLISH = ['Pending','Processing','Shipped','Delivered','Cancelled','Returned'];
  const { rows: remaining } = await pool.query(
    'SELECT DISTINCT status, COUNT(*) AS count FROM orders WHERE status != ALL($1) GROUP BY status ORDER BY count DESC',
    [ENGLISH]
  );
  if (remaining.length) {
    console.log('\nStill non-English:');
    remaining.forEach(r => {
      const buf = Buffer.from(r.status || '', 'utf8');
      console.log(`  "${r.status}" (${r.count}) — hex: ${buf.toString('hex')}`);
    });
  } else {
    console.log('\nAll statuses are now English.');
  }

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
