const router = require('express').Router();
const pool = require('../db/pool');

// GET /api/inventory — all products with stock
router.get('/', async (req, res) => {
  try {
    const { low } = req.query;
    let query = 'SELECT id, name, sku, brand, category, stock_quantity, price FROM products WHERE hidden = false';
    if (low) query += ' AND stock_quantity <= 5';
    query += ' ORDER BY stock_quantity ASC, name ASC';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/adjust — add or remove stock
// Body: { sku, change, reason, note }
// change: positive = received stock, negative = removed/sold
router.post('/adjust', async (req, res) => {
  const client = await pool.connect();
  try {
    const { sku, product_id, change, reason = 'manual', note } = req.body;
    if (!change) return res.status(400).json({ error: 'change is required' });

    await client.query('BEGIN');

    let pid = product_id;
    if (!pid && sku) {
      const { rows } = await client.query('SELECT id FROM products WHERE sku = $1', [sku]);
      if (!rows.length) return res.status(404).json({ error: 'Product not found' });
      pid = rows[0].id;
    }
    if (!pid) return res.status(400).json({ error: 'sku or product_id required' });

    const { rows: updated } = await client.query(
      `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity + $1) WHERE id = $2 RETURNING id, sku, name, stock_quantity`,
      [parseInt(change), pid]
    );

    await client.query(
      `INSERT INTO inventory_log (product_id, sku, change, reason, note) VALUES ($1, $2, $3, $4, $5)`,
      [pid, updated[0].sku, parseInt(change), reason, note || null]
    );

    await client.query('COMMIT');
    res.json({ product: updated[0], logged: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/inventory/log — recent stock changes
router.get('/log', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, p.name, p.sku as product_sku
       FROM inventory_log l
       LEFT JOIN products p ON p.id = l.product_id
       ORDER BY l.logged_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
