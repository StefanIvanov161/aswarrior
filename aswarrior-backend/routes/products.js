const router = require('express').Router();
const pool   = require('../db/pool');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(__dirname, '../public/images/products', String(req.params.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/products — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, promo, page = 1, limit = 50, all } = req.query;
    const conditions = all === '1' ? [] : ['hidden = false'];
    const values = [];
    let i = 1;

    if (category) { conditions.push(`category = $${i++}`); values.push(category); }
    if (brand)    { conditions.push(`brand = $${i++}`);    values.push(brand); }
    if (promo)    { conditions.push(`on_promotion = true`); }
    if (search) {
      conditions.push(`(name ILIKE $${i} OR sku ILIKE $${i} OR brand ILIKE $${i})`);
      values.push(`%${search}%`); i++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows, countRow] = await Promise.all([
      pool.query(`SELECT * FROM products ${where} ORDER BY sort_order ASC, name ASC LIMIT $${i} OFFSET $${i+1}`,
        [...values, parseInt(limit), offset]),
      pool.query(`SELECT COUNT(*) FROM products ${where}`, values),
    ]);

    res.json({ total: parseInt(countRow.rows[0].count), page: parseInt(page), products: rows.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — create
router.post('/', async (req, res) => {
  try {
    const {
      name, sku, category, category_parent, parameters, description, brand,
      price, old_price, image_url, images, tags, badge_text, badge_color,
      stock_quantity, on_promotion, is_new, hidden,
    } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products
         (name, sku, category, category_parent, parameters, description, brand,
          price, old_price, image_url, images, tags, badge_text, badge_color,
          stock_quantity, on_promotion, is_new, hidden)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [name, sku, category, category_parent, parameters, description, brand,
       price, old_price, image_url, images ?? '[]', tags ?? '', badge_text ?? '', badge_color ?? '',
       stock_quantity ?? 0, on_promotion ?? false, is_new ?? false, hidden ?? false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/reorder — bulk update sort_order
router.post('/reorder', async (req, res) => {
  try {
    const { items } = req.body; // [{ id, sort_order }]
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items required' });
    await Promise.all(items.map(({ id, sort_order }) =>
      pool.query('UPDATE products SET sort_order = $1 WHERE id = $2', [sort_order, id])
    ));
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/products/:id — update fields
router.patch('/:id', async (req, res) => {
  try {
    const allowed = [
      'name','sku','category','category_parent','parameters','description','brand',
      'price','old_price','image_url','images','tags','badge_text','badge_color',
      'stock_quantity','hidden','on_promotion','is_new',
      'specs','variants','upsell_ids','meta_title','meta_description','slug',
      'short_description','characteristics','track_stock','sort_order',
    ];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (!fields.length) return res.status(400).json({ error: 'No valid fields' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await pool.query(`UPDATE products SET ${set} WHERE id = $${fields.length + 1} RETURNING *`, values);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/upload-image
router.post('/:id/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const localUrl = `/images/products/${req.params.id}/${req.file.filename}`;
    res.json({ ok: true, url: localUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id/image — remove a specific image file
router.delete('/:id/image', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.startsWith('/images/products/')) return res.status(400).json({ error: 'Invalid URL' });
    const filePath = path.join(__dirname, '../public', url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/categories/all
router.get('/categories/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY parent, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
