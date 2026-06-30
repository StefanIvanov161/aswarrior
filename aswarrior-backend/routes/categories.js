const router = require('express').Router();
const pool = require('../db/pool');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY parent NULLS FIRST, name ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, parent, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const autoSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { rows } = await pool.query(
      `INSERT INTO categories (name, parent, slug) VALUES ($1, $2, $3)
       ON CONFLICT (parent, name) DO UPDATE SET slug = EXCLUDED.slug RETURNING *`,
      [name, parent || null, autoSlug]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/categories/:id
router.patch('/:id', async (req, res) => {
  try {
    const { name, parent, slug } = req.body;
    const { rows } = await pool.query(
      `UPDATE categories SET
        name   = COALESCE($1, name),
        parent = COALESCE($2, parent),
        slug   = COALESCE($3, slug)
       WHERE id = $4 RETURNING *`,
      [name || null, parent || null, slug || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
