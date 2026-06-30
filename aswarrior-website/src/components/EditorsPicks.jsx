import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Crosshair, Target, Shield, Wrench, Package, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useT } from '../context/LanguageContext';
import { TR } from '../translations';

const EUR_BGN = 1.95583;

const CATEGORY_THEMES = {
  'Реплики':                  { gradA: '#3d1508', gradB: '#200a04', icon: Crosshair, iconColor: '#D4500A' },
  'Оборудване за оръжия':    { gradA: '#2e1a06', gradB: '#1a0f03', icon: Wrench,    iconColor: '#C8921A' },
  'Екипировка':              { gradA: '#102210', gradB: '#091508', icon: Shield,    iconColor: '#6B8E4E' },
  'Аксесоари за екипировка': { gradA: '#1e1c08', gradB: '#121006', icon: Package,   iconColor: '#A89040' },
  'Комуникация':             { gradA: '#0e1828', gradB: '#080f1a', icon: Radio,     iconColor: '#4A7BA8' },
};
const DEFAULT_THEME = { gradA: '#1e1a10', gradB: '#12100a', icon: Target, iconColor: '#888' };

function decodeHtml(str) {
  if (!str) return str;
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

const PRODUCTS_FALLBACK = [
  { id:1, name:'KRYTAC Trident MK3-M',   category_parent:'Реплики',                 price:389.99, badge_text:'BEST SELLER', badge_color:'#D4500A' },
  { id:2, name:'WE-Tech G17 Gen5',         category_parent:'Реплики',                 price:189.99, badge_text:'NEW',         badge_color:'#C8921A' },
  { id:3, name:'Atlas JPC Plate Carrier',  category_parent:'Екипировка',             price:149.99, badge_text:'',            badge_color:'' },
  { id:4, name:'ACOG 4×32 Scope',          category_parent:'Оборудване за оръжия',   price:89.99,  badge_text:'HOT',         badge_color:'#D4500A' },
  { id:5, name:'Crye G3 Combat Pants',     category_parent:'Екипировка',             price:119.99, badge_text:'',            badge_color:'' },
  { id:6, name:'BioShot .28g BBs 3000pk', category_parent:'Аксесоари за екипировка', price:24.99,  badge_text:'VALUE PICK',  badge_color:'#6B8E4E' },
  { id:7, name:'P-Mag 150rd Mid-Cap',      category_parent:'Оборудване за оръжия',   price:29.99,  badge_text:'',            badge_color:'' },
  { id:8, name:'Osprey MICH Helmet',       category_parent:'Екипировка',             price:134.99, badge_text:'LIMITED',     badge_color:'#8B5E3C' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const cardVariants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };

function ProductCard({ product, t }) {
  const navigate = useNavigate();
  const theme = CATEGORY_THEMES[product.category_parent] || DEFAULT_THEME;
  const ThemeIcon = theme.icon;
  const eur = parseFloat(product.price || 0);
  const bgn = (eur * EUR_BGN).toFixed(2);
  const badge = product.badge_text || '';
  const badgeColor = product.badge_color || '#D4500A';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={() => product.id && navigate(`/product/${product.id}`)}
      className="group relative flex flex-col overflow-hidden cursor-pointer"
      style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.iconColor}55`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      {/* Image area */}
      <div style={{
        height: 'clamp(140px, 16vw, 200px)',
        background: `radial-gradient(ellipse 85% 80% at 50% 50%, #28221a 0%, #1e1810 35%, ${theme.gradA} 70%, ${theme.gradB} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Diagonal stripes — masked out in center, appear only at dark edges */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, ${theme.iconColor}28 40px, ${theme.iconColor}28 46px)`,
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 40%, black 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 40%, black 80%)',
          pointerEvents: 'none',
        }} />

        {/* Ghost icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.iconColor}18 0%, transparent 70%)`,
            border: `1px solid ${theme.iconColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ThemeIcon size={28} style={{ color: theme.iconColor, opacity: 0.22 }} strokeWidth={1.2} />
          </div>
        </div>

        {/* Product image — on top of everything, no blending */}
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              width: '100%', height: '100%', objectFit: 'contain',
              padding: product.image_url?.startsWith('/processed/') ? 10 : 4,
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Bottom fade into card */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
          background: 'linear-gradient(to top, #181818 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Badge */}
        {badge && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}>
            <span style={{ background: badgeColor, padding: '3px 8px', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.25em', color: '#fff', textTransform: 'uppercase' }}>
              {badge}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/10 bg-black/50 flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 hover:text-[#D4500A] hover:border-[#D4500A]/40 transition-all duration-200"
          style={{ zIndex: 3 }}
        >
          <Heart size={12} strokeWidth={1.8} />
        </button>

        {/* Quick add bar */}
        <div className="quick-add-bar absolute bottom-0 left-0 right-0" style={{ zIndex: 10 }}>
          <button
            onClick={e => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-[10px] bg-[#D4500A] hover:bg-[#b83d08] transition-colors"
          >
            <ShoppingBag size={12} strokeWidth={2} className="text-white" />
            <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white">
              {t(TR.picks.quickAdd)}
            </span>
          </button>
        </div>

        {/* Hover border glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${theme.iconColor}30`, zIndex: 4 }} />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>
            {product.category || product.category_parent || ''}
          </p>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}
            className="line-clamp-2">
            {decodeHtml(product.name)}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: theme.iconColor, lineHeight: 1 }}>
            €{eur.toFixed(2)}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
            {bgn} лв.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EditorsPicks() {
  const { data } = useSiteData();
  const t = useT();

  const pickedIds = data?.editorsPicks || [];
  const allProducts = data?.products || [];

  const picked = pickedIds.length >= 8
    ? pickedIds.slice(0, 8).map(id => allProducts.find(p => p.id === id)).filter(Boolean)
    : [];

  const source = picked.length === 8 ? picked : PRODUCTS_FALLBACK;

  return (
    <section className="bg-[#0f0f0f] pt-20 sm:pt-24 pb-28 sm:pb-36 lg:pb-44 relative">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4500A]/30 to-transparent" />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="px-6 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14"
        >
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[10px] sm:text-[11px] tracking-[0.4em] text-[#D4500A] uppercase font-medium">
            {t(TR.picks.sectionTag)}
          </span>
          <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="mt-1 text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-wider text-white uppercase leading-none">
            {t(TR.picks.sectionTitle)}
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {source.map((product) => <ProductCard key={product.id} product={product} t={t} />)}
        </motion.div>
      </div>
    </section>
  );
}
