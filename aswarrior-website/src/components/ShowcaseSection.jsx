import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Tag } from 'lucide-react';

const FEATURED = [
  {
    name: 'Full CQB Strike Package',
    price: 649.99,
    originalPrice: 780.00,
    tag: 'BUNDLE DEAL',
    desc: 'M4 CQB AEG + JPC Plate Carrier + Osprey Helmet + 3× Mid-Caps',
    badge: 'SAVE €130',
    bgIndex: 0,
  },
  {
    name: 'Woodland Recon Loadout',
    price: 489.99,
    originalPrice: 560.00,
    tag: 'BEST SELLER',
    desc: 'G36C AEG + Woodland Chest Rig + Boonie Hat + Ghillie Wrap',
    badge: 'SAVE €70',
    bgIndex: 1,
  },
  {
    name: 'Long-Range Sniper Build',
    price: 799.99,
    originalPrice: 950.00,
    tag: 'PREMIUM BUILD',
    desc: 'VSR-10 Upgraded + Bipod + 8×32 Scope + 500rd Speed Loader',
    badge: 'SAVE €150',
    bgIndex: 2,
  },
];

const BG_GRADIENTS = [
  'from-[#1a0d08] to-[#0a0a0a]',
  'from-[#0d1a0d] to-[#0a0a0a]',
  'from-[#0d0d1a] to-[#0a0a0a]',
];

export default function ShowcaseSection() {
  const [activeProduct, setActiveProduct] = useState(0);

  const prev = () => setActiveProduct((p) => (p - 1 + FEATURED.length) % FEATURED.length);
  const next = () => setActiveProduct((p) => (p + 1) % FEATURED.length);

  const product = FEATURED[activeProduct];

  return (
    <section className="relative overflow-hidden bg-[#111111] mx-3 sm:mx-6 lg:mx-12">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="absolute top-10 left-1/2 -translate-x-1/2 z-30 text-center"
      >
        <span
          style={{ fontFamily: 'Oswald, sans-serif' }}
          className="text-[11px] tracking-[0.4em] text-[#D4500A] uppercase"
        >
          Operator's Choice
        </span>
      </motion.div>

      <div className="flex flex-col lg:flex-row min-h-[640px]">

        {/* ── LEFT: Large Lifestyle Image ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full lg:w-[60%] min-h-[400px] lg:min-h-[640px] img-zoom-wrap"
        >
          {/* Lifestyle image */}
          <img
            src="https://picsum.photos/seed/military42/1200/800"
            alt="Operator in full tactical gear"
            className="img-zoom absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'grayscale(25%) contrast(120%) brightness(45%)',
            }}
          />

          {/* Gradient fade right (to blend with card) */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-[#111111] lg:to-[#111111]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

          {/* Floating label on image */}
          <div className="absolute bottom-10 left-10 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-1"
            >
              <span
                style={{ fontFamily: 'Oswald, sans-serif' }}
                className="text-[clamp(32px,4vw,52px)] font-bold text-white uppercase leading-none"
              >
                WORK SMARTER.
              </span>
              <span
                style={{ fontFamily: 'Oswald, sans-serif' }}
                className="text-[clamp(32px,4vw,52px)] font-bold text-[#D4500A] uppercase leading-none"
              >
                FIGHT HARDER.
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Shop the Gear Card ── */}
        <div className="relative w-full lg:w-[40%] flex items-center justify-center bg-[#111111] py-20 px-6 sm:px-12 lg:px-16">

          {/* Card — overlaps image slightly on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative w-full max-w-[420px] mx-auto lg:mx-0 lg:-ml-14 z-20"
          >
            <div
              className="rounded-sm overflow-hidden shadow-2xl shadow-black/70"
              style={{
                background: 'linear-gradient(145deg, #1e1e1e 0%, #161616 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div>
                  <span
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                    className="text-[11px] tracking-[0.3em] text-[#D4500A] uppercase font-medium"
                  >
                    Shop the Gear
                  </span>
                  <p
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                    className="text-[20px] font-bold text-white tracking-wide"
                  >
                    Featured Builds
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={next}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Product area */}
              <div className="relative overflow-hidden">
                {/* Product image area */}
                <div className={`h-[200px] relative bg-gradient-to-br ${BG_GRADIENTS[activeProduct]} flex items-center justify-center`}>
                  <img
                    src={`https://picsum.photos/seed/tactical${activeProduct + 30}/600/400`}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40"
                    style={{ filter: 'contrast(130%)' }}
                  />
                  <div className="absolute inset-0 dot-grid opacity-50" />

                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-[#D4500A] px-2 py-1">
                    <span
                      style={{ fontFamily: 'Oswald, sans-serif' }}
                      className="text-[10px] tracking-[0.2em] text-white font-medium uppercase"
                    >
                      {product.badge}
                    </span>
                  </div>

                  {/* Tag */}
                  <div className="absolute top-4 left-4 border border-white/20 px-2 py-1">
                    <span
                      style={{ fontFamily: 'Oswald, sans-serif' }}
                      className="text-[10px] tracking-[0.2em] text-gray-300 uppercase"
                    >
                      {product.tag}
                    </span>
                  </div>
                </div>

                {/* Product info */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProduct}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="p-6"
                  >
                    <p
                      style={{ fontFamily: 'Oswald, sans-serif' }}
                      className="text-[20px] font-bold text-white uppercase tracking-wide leading-tight"
                    >
                      {product.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                      {product.desc}
                    </p>

                    {/* Price row */}
                    <div className="mt-4">
                      <div className="flex items-baseline gap-3">
                        <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[28px] font-bold text-[#D4500A]">
                          €{parseFloat(product.price || 0).toFixed(2)}
                        </span>
                        {(product.originalPrice || product.old_price) > 0 && (
                          <span className="text-gray-600 text-sm line-through">
                            €{parseFloat(product.originalPrice || product.old_price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                        {(parseFloat(product.price || 0) * 1.95583).toFixed(2)} лв.
                        {(product.originalPrice || product.old_price) > 0 && (
                          <span className="line-through ml-2 text-gray-700">
                            {(parseFloat(product.originalPrice || product.old_price || 0) * 1.95583).toFixed(2)} лв.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to cart */}
                    <button className="btn-sweep btn-glow mt-5 w-full flex items-center justify-center gap-3 py-4 bg-[#D4500A] text-white transition-all hover:bg-[#b83d08]">
                      <ShoppingBag size={15} strokeWidth={2} />
                      <span
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                        className="text-[13px] font-semibold tracking-[0.2em] uppercase"
                      >
                        Add Bundle to Cart
                      </span>
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center gap-2 pb-5">
                {FEATURED.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveProduct(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeProduct
                        ? 'w-6 h-1.5 bg-[#D4500A]'
                        : 'w-1.5 h-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
