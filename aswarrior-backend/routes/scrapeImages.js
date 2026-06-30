const express  = require('express');
const router   = express.Router();
const axios    = require('axios');
const cheerio  = require('cheerio');
const fs       = require('fs');
const path     = require('path');
const pool     = require('../db/pool');

const BASE_URL  = 'https://www.aswarrior.bg';
const IMG_DIR   = path.join(__dirname, '../public/images/products');

// In-memory status (single scrape at a time)
let status = { running: false, done: false, progress: 0, total: 0, matched: 0, downloaded: 0, skipped: 0, log: [] };

function addLog(msg) {
  const line = `[${new Date().toLocaleTimeString('bg-BG')}] ${msg}`;
  status.log.push(line);
  if (status.log.length > 300) status.log.shift();
  console.log('[Scraper]', msg);
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'bg,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Referer': BASE_URL,
};

async function get(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await axios.get(url, { headers: HEADERS, timeout: 20000 });
      return r.data;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

async function downloadBinary(url, dest) {
  const r = await axios.get(url, { headers: HEADERS, responseType: 'arraybuffer', timeout: 30000 });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(r.data));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function classifyUrl(url) {
  const clean = url.split('?')[0].split('#')[0];
  if (!clean.startsWith(BASE_URL) || !clean.endsWith('.html')) return null;
  const slug = clean.replace(BASE_URL + '/', '').replace('.html', '');
  if (/\/(faq|kontakti|dostavka|login|cart|gdpr|cookie|za-nas|about|obshti|bg-content|bg-catalog-details)/.test(clean)) return null;
  const parts = slug.split('-').filter(Boolean);
  return parts.length >= 4 ? 'product' : 'category';
}

// ── Discover product page URLs ──────────────────────────────────────────────
async function discoverProductUrls() {
  const categoryUrls = new Set();
  const productUrls  = new Set();

  // Step 1: classify every sitemap URL immediately — no need to crawl product pages
  try {
    const xml = await get(`${BASE_URL}/sitemap.xml`);
    const $ = cheerio.load(xml, { xmlMode: true });
    $('loc').each((_, el) => {
      const u = $(el).text().trim();
      const type = classifyUrl(u);
      if (type === 'product')  productUrls.add(u);
      if (type === 'category') categoryUrls.add(u);
    });
    addLog(`Sitemap: ${productUrls.size} products + ${categoryUrls.size} categories to crawl`);
  } catch (e) {
    addLog(`Sitemap error: ${e.message}`);
  }

  // Always crawl homepage (catches featured products not in sitemap)
  categoryUrls.add(BASE_URL + '/');

  // Step 2: crawl only category pages to collect any additional product links
  const pagesToCrawl = [...categoryUrls];
  const crawledCats  = new Set();
  const enqueuedPages = new Set([...categoryUrls]);

  for (let i = 0; i < pagesToCrawl.length; i++) {
    const catUrl = pagesToCrawl[i];
    if (crawledCats.has(catUrl)) continue;
    crawledCats.add(catUrl);

    if (i % 5 === 0) addLog(`Crawling category ${i + 1}/${pagesToCrawl.length} — ${productUrls.size} products so far`);

    try {
      await sleep(250);
      const html = await get(catUrl);
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        let raw = $(el).attr('href') || '';
        if (!raw.startsWith('http')) raw = BASE_URL + (raw.startsWith('/') ? '' : '/') + raw;

        // Pagination pages keep query params but strip hash
        const full = raw.split('#')[0];
        const clean = full.split('?')[0];

        if (!full.startsWith(BASE_URL)) return;

        // Pagination: ?start=N — enqueue as category page to crawl
        if (full.includes('start=') && clean.endsWith('.html') && !enqueuedPages.has(full)) {
          pagesToCrawl.push(full);
          enqueuedPages.add(full);
          return;
        }

        if (!clean.endsWith('.html')) return;

        // Skip utility pages
        if (/\/(faq|kontakti|dostavka|login|cart|gdpr|cookie|za-nas|about|obshti|catalog\.html|bg-content|bg-catalog-details)/.test(clean)) return;

        // Product URLs have long slugs (4+ hyphen parts)
        const slug = clean.replace(BASE_URL + '/', '').replace('.html', '');
        const parts = slug.split('-').filter(Boolean);
        const looksLikeProduct = parts.length >= 4;

        if (looksLikeProduct) {
          productUrls.add(clean);
        } else if (!enqueuedPages.has(clean)) {
          // Potential sub-category — enqueue for crawling
          pagesToCrawl.push(clean);
          enqueuedPages.add(clean);
          categoryUrls.add(clean);
        }
      });

    } catch (e) {
      addLog(`Skipped ${catUrl}: ${e.message}`);
    }
  }

  addLog(`Found ${productUrls.size} product URLs across ${crawledCats.size} pages`);
  return [...productUrls];
}

// ── Scrape one product page ─────────────────────────────────────────────────
function extractSku($) {
  // JSON-LD (most reliable)
  let sku = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (sku) return;
    try {
      const d = JSON.parse($(el).html());
      const items = Array.isArray(d['@graph']) ? d['@graph'] : [d];
      for (const item of items) {
        if (item.sku) { sku = item.sku.trim(); return; }
        if (item.mpn) { sku = item.mpn.trim(); return; }
      }
    } catch {}
  });
  if (sku) return sku;

  // Meta property
  const metaSku = $('meta[property="product:retailer_item_id"], meta[name="sku"]').attr('content');
  if (metaSku) return metaSku.trim();

  // [data-code] is aswarrior.bg's SKU element: "Кат. номер: 0010АКМ74"
  if (!sku) {
    $('[data-code]').each((_, el) => {
      if (sku) return;
      const txt = $(el).text().trim();
      const m = txt.match(/:\s*(.{2,30})\s*$/);
      if (m) sku = m[1].trim();
    });
  }

  // Generic visible SKU/code elements — keep Cyrillic chars
  if (!sku) {
    const selectors = [
      '[class*="sku"]', '[class*="SKU"]', '[class*="code"]',
      '[class*="артикул"]', '[class*="код"]', '[itemprop="sku"]',
    ];
    for (const sel of selectors) {
      const txt = $(sel).first().text().trim().replace(/[^A-Za-zА-Яа-яЁё0-9\-_]/g, '');
      if (txt.length >= 3 && txt.length <= 30) { sku = txt; break; }
    }
  }

  // Table rows / list items — keep Cyrillic in SKU value
  if (!sku) {
    $('tr, li').each((_, el) => {
      const txt = $(el).text();
      const m = txt.match(/(?:sku|код|арт(?:икул)?|кат[.\s]*номер)[:\s]+([A-Za-zА-Яа-яЁё0-9\-_]{2,30})/i);
      if (m && !sku) sku = m[1].trim();
    });
  }

  return sku || null;
}

function extractImages($, pageUrl) {
  // data-pop-image is present ONLY on the product's own gallery thumbnails (t40s-4).
  // Logo and related-product images never have this attribute.
  // Fallback: og:image gives the canonical product image if no popup images found.

  const seen = new Set();
  const imgs = [];

  const addUrl = (src) => {
    if (!src) return;
    src = src.trim().split('?')[0];
    if (!src.startsWith('http')) src = BASE_URL + (src.startsWith('/') ? '' : '/') + src;
    if (!/\.(png|jpg|jpeg|webp)$/i.test(src)) return;
    if (seen.has(src)) return;
    seen.add(src);
    imgs.push(src);
  };

  // Primary source: data-pop-image on gallery thumbnails (full-size lightbox images)
  $('img[data-pop-image]').each((_, el) => addUrl($(el).attr('data-pop-image')));

  // Fallback: og:image (always the primary product image)
  if (!imgs.length) addUrl($('meta[property="og:image"]').attr('content'));

  return imgs.filter(u => u.includes(BASE_URL));
}

// ── Main scrape loop ─────────────────────────────────────────────────────────
async function runScrape(options = {}) {
  status = { running: true, done: false, progress: 0, total: 0, matched: 0, downloaded: 0, skipped: 0, log: [] };

  try {
    // Normalize Cyrillic homoglyphs → Latin so mixed-encoding SKUs still match
    // e.g. DB has Cyrillic А (U+0410), page may have Latin A (U+0041)
    const homoglyphs = { 'А':'A','В':'B','С':'C','Е':'E','Н':'H','І':'I','К':'K','М':'M','О':'O','Р':'P','Т':'T','Х':'X','У':'Y' };
    const normSku = s => s.toUpperCase().trim().replace(/[А-ЯЁ]/g, c => homoglyphs[c] || c);

    const { rows } = await pool.query(`SELECT id, sku, image_url FROM products WHERE sku IS NOT NULL AND sku <> ''`);
    const bySkU = new Map();
    rows.forEach(p => bySkU.set(normSku(p.sku), p));
    addLog(`DB has ${rows.length} products with SKUs`);

    const productUrls = options.urls || await discoverProductUrls();
    status.total = productUrls.length;
    addLog(`Will scrape ${productUrls.length} product pages`);

    fs.mkdirSync(IMG_DIR, { recursive: true });

    for (let i = 0; i < productUrls.length; i++) {
      if (!status.running) { addLog('Stopped early by user'); break; }
      status.progress = i + 1;
      const url = productUrls[i];

      try {
        await sleep(350); // polite delay
        const html = await get(url);
        const $ = cheerio.load(html);

        const sku = extractSku($);
        if (!sku) { addLog(`No SKU at ${url}`); status.skipped++; continue; }

        const dbProduct = bySkU.get(normSku(sku));
        if (!dbProduct) { addLog(`SKU ${sku} not in DB`); status.skipped++; continue; }

        const imageUrls = extractImages($, url);
        if (!imageUrls.length) { addLog(`SKU ${sku} — no images found`); status.skipped++; continue; }

        addLog(`SKU ${sku} → #${dbProduct.id} | ${imageUrls.length} image(s)`);
        status.matched++;

        // Download images
        const localPaths = [];
        for (let j = 0; j < imageUrls.length; j++) {
          const imgUrl = imageUrls[j];
          const ext = (imgUrl.match(/\.(png|jpg|jpeg|webp)/i) || ['.jpg'])[0].toLowerCase();
          const dest = path.join(IMG_DIR, String(dbProduct.id), `${j}${ext}`);
          const localUrl = `/images/products/${dbProduct.id}/${j}${ext}`;

          if (fs.existsSync(dest) && !options.force) {
            localPaths.push(localUrl);
            continue;
          }

          try {
            await sleep(150); // avoid rate-limiting on rapid sequential image downloads
            await downloadBinary(imgUrl, dest);
            localPaths.push(localUrl);
            status.downloaded++;
          } catch (e) {
            // Retry once after a longer pause
            try {
              await sleep(1500);
              await downloadBinary(imgUrl, dest);
              localPaths.push(localUrl);
              status.downloaded++;
            } catch (e2) {
              addLog(`  ✗ download failed: ${imgUrl} — ${e2.message}`);
            }
          }
        }

        if (localPaths.length) {
          const primary = localPaths[0];
          const extras  = JSON.stringify(localPaths.slice(1));
          await pool.query(
            `UPDATE products
             SET image_url = $1, images = $2,
                 original_image_url = COALESCE(NULLIF(original_image_url,''), $1)
             WHERE id = $3`,
            [primary, extras, dbProduct.id]
          );
          addLog(`  ✓ saved ${localPaths.length} image(s) for #${dbProduct.id}`);
        }

      } catch (e) {
        addLog(`✗ ${url}: ${e.message}`);
      }
    }

    addLog(`━━ Done. matched=${status.matched} downloaded=${status.downloaded} skipped=${status.skipped} ━━`);
  } catch (e) {
    addLog(`FATAL: ${e.message}`);
  }

  status.running = false;
  status.done = true;
}

// ── Diagnostic: show what URLs/structure we find ─────────────────────────────
router.get('/diagnose', async (req, res) => {
  try {
    const result = {};

    // 1. Sitemap raw URLs (first 60)
    try {
      const xml = await get(`${BASE_URL}/sitemap.xml`);
      const $ = cheerio.load(xml, { xmlMode: true });
      result.sitemapUrls = $('loc').map((_, el) => $(el).text().trim()).get().slice(0, 60);
    } catch (e) { result.sitemapError = e.message; }

    // 2. Try sitemap_index.xml
    try {
      const xml = await get(`${BASE_URL}/sitemap_index.xml`);
      const $ = cheerio.load(xml, { xmlMode: true });
      result.sitemapIndexUrls = $('loc').map((_, el) => $(el).text().trim()).get();
    } catch {}

    // 3. All links from homepage
    try {
      const html = await get(BASE_URL);
      const $ = cheerio.load(html);
      const links = new Set();
      $('a[href]').each((_, el) => {
        let href = $(el).attr('href') || '';
        if (!href.startsWith('http')) href = BASE_URL + href;
        if (href.includes('aswarrior.bg')) links.add(href);
      });
      result.homepageLinks = [...links].slice(0, 80);
    } catch (e) { result.homepageError = e.message; }

    // 4. Sample one known-ish category page to see product link patterns
    if (result.homepageLinks && result.homepageLinks.length > 0) {
      try {
        const catUrl = result.homepageLinks.find(u => u !== BASE_URL && u !== BASE_URL + '/') || result.homepageLinks[1];
        const html = await get(catUrl);
        const $ = cheerio.load(html);
        const links = new Set();
        $('a[href]').each((_, el) => {
          let href = $(el).attr('href') || '';
          if (!href.startsWith('http')) href = BASE_URL + href;
          if (href.includes('aswarrior.bg') && href !== BASE_URL + '/') links.add(href);
        });
        result.sampleCatPage = catUrl;
        result.sampleCatLinks = [...links].slice(0, 40);
      } catch {}
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
router.post('/start', (req, res) => {
  if (status.running) return res.json({ ok: false, error: 'Already running' });
  const options = req.body || {};
  runScrape(options);
  res.json({ ok: true });
});

router.post('/stop', (req, res) => {
  // Graceful stop: mark done so the loop exits on next iteration
  status.running = false;
  status.done = true;
  addLog('Stopped by user');
  res.json({ ok: true });
});

router.get('/status', (req, res) => res.json(status));

module.exports = router;
