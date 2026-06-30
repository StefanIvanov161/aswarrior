const router = require('express').Router();
const pool = require('../db/pool');

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;

    if (status && status !== 'All') { conditions.push(`o.status = $${i++}`); values.push(status); }
    if (search) {
      conditions.push(`(o.customer_name ILIKE $${i} OR o.customer_email ILIKE $${i} OR o.order_number ILIKE $${i} OR o.delivery_city ILIKE $${i})`);
      values.push(`%${search}%`); i++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [dataRows, countRow] = await Promise.all([
      pool.query(
        `SELECT o.*,
          json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'sku', oi.sku, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity)) FILTER (WHERE oi.id IS NOT NULL) as items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         ${where}
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT $${i} OFFSET $${i+1}`,
        [...values, parseInt(limit), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM orders o ${where}`, values),
    ]);

    res.json({ total: parseInt(countRow.rows[0].count), page: parseInt(page), orders: dataRows.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
        json_agg(json_build_object('id', oi.id, 'sku', oi.sku, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity)) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 GROUP BY o.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pending','Processing','Shipped','Delivered','Cancelled','Returned'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const setPaid = status === 'Delivered' ? ', paid = true' : '';
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1${setPaid} WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    // Decrement stock when confirmed
    if (status === 'confirmed') {
      const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
      for (const item of items.rows) {
        await pool.query(
          `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2`,
          [item.quantity, item.product_id]
        );
        await pool.query(
          `INSERT INTO inventory_log (product_id, sku, change, reason, note) VALUES ($1,$2,$3,'order','Order #' || $4)`,
          [item.product_id, item.sku, -item.quantity, req.params.id]
        );
      }
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
