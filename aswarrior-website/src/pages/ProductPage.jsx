import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronDown, Crosshair, Shield, Wrench, Radio, Target } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORY_THEMES = {
  'Реплики':                   { gradA:'#3d1508', gradB:'#200a04', icon:Crosshair, iconColor:'#D4500A' },
  'Оборудване за оръжия':      { gradA:'#2e1a06', gradB:'#1a0f03', icon:Wrench,    iconColor:'#C8921A' },
  'Екипировка':                { gradA:'#102210', gradB:'#091508', icon:Shield,    iconColor:'#6B8E4E' },
  'Аксесоари за екипировка':   { gradA:'#1e1c08', gradB:'#121006', icon:Package,   iconColor:'#A89040' },
  'Комуникация':               { gradA:'#0e1828', gradB:'#080f1a', icon:Radio,     iconColor:'#4A7BA8' },
};
const DEFAULT_THEME = { gradA:'#1e1a10', gradB:'#12100a', icon:Target, iconColor:'#888' };
const EUR_BGN = 1.95583;

function decodeHtml(str) {
  if (!str) return str;
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function parseImages(product) {
  const result = [];
  if (product.image_url && !product.image_url.startsWith('/processed/')) result.push(product.image_url);
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) parsed.forEach(url => { if (url && !result.includes(url) && !url.startsWith('/processed/')) result.push(url); });
    } catch {}
  }
  return result;
}

function parseCharacteristics(raw) {
  if (!raw) return null;
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {}
  return null;
}

// Collapsible accordion section for the product page
function Accordion({ title, children, defaultOpen = false, accentColor = '#D4500A' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 20 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: open ? '#fff' : 'rgba(255,255,255,0.55)', transition: 'color .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = open ? '#fff' : 'rgba(255,255,255,0.55)'}
      >
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <ChevronDown size={15} style={{ color: accentColor, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 20 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { data, productsLoading } = useSiteData();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const product = useMemo(
    () => (data.products || []).find(p => String(p.id) === String(id)),
    [data.products, id]
  );

  const images = useMemo(() => (product ? parseImages(product) : []), [product]);
  const chars  = useMemo(() => (product ? parseCharacteristics(product.characteristics) : null), [product]);

  if (productsLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}
          style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.5em', color: 'rgba(212,80,10,0.6)', textTransform: 'uppercase' }}>
          {lang === 'bg' ? 'ЗАРЕЖДАНЕ...' : 'LOADING...'}
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div style={{ paddingTop: 180, textAlign: 'center' }}>
          <Package size={64} style={{ color: 'rgba(255,255,255,0.07)', margin: '0 auto 24px' }} strokeWidth={0.8} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 24 }}>
            {lang === 'bg' ? 'ПРОДУКТЪТ НЕ Е НАМЕРЕН' : 'PRODUCT NOT FOUND'}
          </p>
          <button onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'transparent', border: '1px solid rgba(212,80,10,0.4)', color: '#D4500A', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <ChevronLeft size={14} />{lang === 'bg' ? 'Назад' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const eur = parseFloat(product.price || 0);
  const bgn = (eur * EUR_BGN).toFixed(2);
  const oldEur = parseFloat(product.old_price || 0);
  const outOfStock = (product.track_stock ?? true) && (product.stock_quantity ?? 1) === 0;
  const discount = oldEur > 0 ? Math.round((1 - eur / oldEur) * 100) : 0;
  const theme = CATEGORY_THEMES[product.category_parent] || DEFAULT_THEME;
  const ThemeIcon = theme.icon;
  const shopLink = product.category
    ? `/shop?cats=${encodeURIComponent(product.category)}&name=${encodeURIComponent(product.category)}`
    : '/shop';

  // What to show directly (not in dropdown)
  const shortText = product.short_description || '';
  // What goes in dropdowns
  const longDesc  = product.description || '';
  // Old-style parameters fallback for products that don't have characteristics yet
  const hasChars  = chars && chars.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />

      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '120px 48px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 44, flexWrap: 'wrap' }}>
          <Link to="/" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', textTransform: 'uppercase' }}
            onMouseEnter={e => e.currentTarget.style.color = '#D4500A'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}>
            {lang === 'bg' ? 'Начало' : 'Home'}
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
          {product.category && (
            <>
              <Link to={shopLink} style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', textTransform: 'uppercase' }}
                onMouseEnter={e => e.currentTarget.style.color = '#D4500A'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}>
                {product.category}
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
            </>
          )}
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            {decodeHtml(product.name)}
          </span>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>

          {/* LEFT — Image gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', height: 460, overflow: 'hidden', position: 'relative' }}>
              {images.length > 0 ? (
                <img key={activeImg} src={images[activeImg] ?? ''} alt={decodeHtml(product.name)}
                  style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <ThemeIcon size={80} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: theme.iconColor, opacity: 0.12, zIndex: 1 }} strokeWidth={0.7} />
              )}

              {product.badge_text && (
                <div style={{ position: 'absolute', top: 14, left: 14, background: product.badge_color || '#D4500A', padding: '4px 10px', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.25em', color: '#fff', textTransform: 'uppercase', zIndex: 3 }}>
                  {product.badge_text}
                </div>
              )}
              {discount > 0 && (
                <div style={{ position: 'absolute', top: product.badge_text ? 48 : 14, right: 14, background: '#C8921A', padding: '4px 10px', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: '#fff', zIndex: 3 }}>
                  -{discount}%
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 4 }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 4 }}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 72, height: 72, background: '#111', border: `1px solid ${activeImg === i ? theme.iconColor : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', overflow: 'hidden', padding: 3, flexShrink: 0, transition: 'border-color .15s' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Product info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
            {/* Brand + badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              {product.brand && (
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.4em', color: '#D4500A', textTransform: 'uppercase' }}>{product.brand}</span>
              )}
              {product.is_new && (
                <span style={{ background: '#C8921A', padding: '2px 8px', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.25em', color: '#fff', textTransform: 'uppercase' }}>NEW</span>
              )}
              {product.on_promotion && (
                <span style={{ background: '#D4500A', padding: '2px 8px', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.25em', color: '#fff', textTransform: 'uppercase' }}>
                  {lang === 'bg' ? 'ПРОМО' : 'SALE'}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 30, fontWeight: 700, color: '#fff', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 10, letterSpacing: '0.05em' }}>
              {decodeHtml(product.name)}
            </h1>

            {product.sku && (
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', marginBottom: 24 }}>
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 40, fontWeight: 700, color: '#D4500A', lineHeight: 1 }}>
                  €{eur.toFixed(2)}
                </span>
                {oldEur > 0 && (
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through' }}>
                    €{oldEur.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.32)', marginTop: 6 }}>
                {bgn} лв.
                {oldEur > 0 && (
                  <span style={{ marginLeft: 12, textDecoration: 'line-through', color: 'rgba(255,255,255,0.18)' }}>
                    {(oldEur * EUR_BGN).toFixed(2)} лв.
                  </span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              {outOfStock ? (
                <>
                  <XCircle size={15} style={{ color: 'rgba(255,70,70,0.6)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,70,70,0.6)', textTransform: 'uppercase' }}>
                    {lang === 'bg' ? 'ИЗЧЕРПАН' : 'OUT OF STOCK'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} style={{ color: '#6B8E4E', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.25em', color: '#6B8E4E', textTransform: 'uppercase' }}>
                    {lang === 'bg'
                      ? `В НАЛИЧНОСТ${product.stock_quantity ? ` — ${product.stock_quantity} бр.` : ''}`
                      : `IN STOCK${product.stock_quantity ? ` — ${product.stock_quantity} pcs.` : ''}`}
                  </span>
                </>
              )}
            </div>

            {/* Add to cart */}
            <button disabled={outOfStock}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px', background: outOfStock ? 'rgba(255,255,255,0.04)' : '#D4500A', border: outOfStock ? '1px solid rgba(255,255,255,0.08)' : 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', color: outOfStock ? 'rgba(255,255,255,0.2)' : '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 28, transition: 'background .15s' }}
              onMouseEnter={e => { if (!outOfStock) e.currentTarget.style.background = '#b83d08'; }}
              onMouseLeave={e => { if (!outOfStock) e.currentTarget.style.background = '#D4500A'; }}>
              <ShoppingBag size={17} />
              {lang === 'bg' ? 'ДОБАВИ В КОШНИЦАТА' : 'ADD TO CART'}
            </button>

            {/* ── Short description — shown directly ── */}
            {shortText && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.8, marginBottom: 8 }}>
                {shortText}
              </p>
            )}

            {/* ── Fallback: old description if no short_description ── */}
            {!shortText && product.description && !product.description.includes('<') && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 8 }}>
                {product.description}
              </p>
            )}

            {/* ── Full description — dropdown ── */}
            {longDesc && longDesc.includes('<') && (
              <Accordion title={lang === 'bg' ? 'Пълно описание' : 'Full Description'} accentColor={theme.iconColor}>
                <div
                  dangerouslySetInnerHTML={{ __html: longDesc }}
                  style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}
                />
              </Accordion>
            )}

            {/* ── Characteristics — dropdown ── */}
            {hasChars && (
              <Accordion title={lang === 'bg' ? 'Характеристики' : 'Specifications'} accentColor={theme.iconColor}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {chars.map((row, i) => (
                      row.key ? (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', padding: '8px 0', paddingRight: 24, whiteSpace: 'nowrap', verticalAlign: 'top', width: '40%' }}>
                            {row.key}
                          </td>
                          <td style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '8px 0', verticalAlign: 'top' }}>
                            {row.value || '—'}
                          </td>
                        </tr>
                      ) : null
                    ))}
                  </tbody>
                </table>
              </Accordion>
            )}

            {/* ── Legacy parameters fallback (for old products with no characteristics) ── */}
            {!hasChars && product.parameters && (
              <Accordion title={lang === 'bg' ? 'Характеристики' : 'Specifications'} accentColor={theme.iconColor}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                  {product.parameters}
                </p>
              </Accordion>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
