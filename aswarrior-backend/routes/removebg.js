const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const axios    = require('axios');
const FormData = require('form-data');
const pool     = require('../db/pool');

const PROCESSED_DIR = path.join(__dirname, '../public/processed');

function getApiKey(res) {
  const key = process.env.REMOVEBG_API_KEY;
  if (!key || key === 'YOUR_KEY_HERE') {
    res.status(400).json({ error: 'Add REMOVEBG_API_KEY to your .env — free key at https://www.remove.bg/api' });
    return null;
  }
  return key;
}

async function callRemoveBg(apiKey, payload) {
  const form = new FormData();
  if (payload.type === 'url') {
    form.append('image_url', payload.url);
  } else {
    form.append('image_file', payload.buffer, { filename: 'product.png', contentType: 'image/png' });
  }
  form.append('size', 'auto');
  form.append('type', 'product'); // optimize for e-commerce product photos

  const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
    headers: { 'X-Api-Key': apiKey, ...form.getHeaders() },
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  const buf = Buffer.from(response.data);
  if (buf.length < 500) throw new Error('remove.bg returned empty result');
  return buf;
}

// POST /api/admin/remove-bg/:id
// Body (JSON): { imageBase64: '...' }  ← browser sends actual image pixels
// OR body empty                         ← we pass URL directly to remove.bg
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const apiKey = getApiKey(res);
  if (!apiKey) return;

  try {
    const { rows } = await pool.query('SELECT id, image_url, images FROM products WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];

    // Body may contain: imageBase64 (browser pixels) and/or sourceUrl (URL override from CMS)
    const sourceUrl = req.body?.sourceUrl || product.image_url;
    if (!sourceUrl) return res.status(400).json({ error: 'Product has no image URL' });

    // Persist original URL in original_image_url column before we overwrite image_url
    const originalUrl = product.image_url.startsWith('/processed/')
      ? (req.body?.sourceUrl || null)
      : product.image_url;
    if (originalUrl) {
      await pool.query(
        'UPDATE products SET original_image_url = $1 WHERE id = $2 AND (original_image_url IS NULL OR original_image_url = \'\')',
        [originalUrl, id]
      );
    }

    // Clear any old cached result so we always reprocess
    const localPath = path.join(PROCESSED_DIR, `${id}.png`);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

    let resultBuffer;

    // Option 1: browser sent us the actual image bytes (best — bypasses hotlink protection)
    if (req.body?.imageBase64) {
      console.log(`[RemoveBG] #${id} → using browser-provided image`);
      const rawBuf = Buffer.from(req.body.imageBase64, 'base64');
      const pngBuf = await sharp(rawBuf).png().toBuffer();
      resultBuffer = await callRemoveBg(apiKey, { type: 'buffer', buffer: pngBuf });

    // Option 2: pass URL directly to remove.bg — their servers fetch it
    } else {
      console.log(`[RemoveBG] #${id} → passing URL to remove.bg: ${sourceUrl}`);
      resultBuffer = await callRemoveBg(apiKey, { type: 'url', url: sourceUrl });
    }

    // Trim transparent borders so the product fills its canvas tightly
    const trimmedBuffer = await sharp(resultBuffer)
      .trim({ threshold: 10 })
      .png()
      .toBuffer();

    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
    fs.writeFileSync(localPath, trimmedBuffer);

    const newUrl = `/processed/${id}.png`;

    // Keep the original image in the gallery (images array) so it isn't lost
    const currentImages = (() => {
      try { return JSON.parse(product.images || '[]'); } catch { return []; }
    })();
    const oldUrl = product.image_url;
    if (oldUrl && oldUrl !== newUrl && !currentImages.includes(oldUrl)) {
      currentImages.unshift(oldUrl); // original goes first in the gallery
    }

    await pool.query(
      'UPDATE products SET image_url = $1, images = $2 WHERE id = $3',
      [newUrl, JSON.stringify(currentImages), id]
    );

    console.log(`[RemoveBG] #${id} ✓ saved (${resultBuffer.length} bytes)`);
    res.json({ ok: true, url: `http://localhost:3001${newUrl}` });

  } catch (err) {
    const msg = err.response?.data
      ? Buffer.from(err.response.data).toString().slice(0, 300)
      : err.message;
    console.error(`[RemoveBG] #${id} ✗`, msg);
    res.status(500).json({ error: msg });
  }
});

// GET /api/admin/remove-bg/processed-ids
router.get('/processed-ids', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id FROM products WHERE image_url LIKE '/processed/%'");
    res.json({ ids: rows.map(r => r.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
