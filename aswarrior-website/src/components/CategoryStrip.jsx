import { motion } from 'framer-motion';
import { Crosshair, Target, Shield, Eye, Shirt, Circle, Wrench, Package, Zap, Star } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { useLanguage, useT } from '../context/LanguageContext';
import { TR } from '../translations';

const ICON_MAP = { Crosshair, Target, Shield, Eye, Shirt, Circle, Wrench, Package, Zap, Star };

const CATEGORIES_FALLBACK = [
  { id: 'rifles',   label: 'Rifles',        label_bg: 'Пушки',                 sub: 'AEG · GBB · HPA',            sub_bg: 'AEG · GBB · HPA',              icon: 'Crosshair', color: '#D4500A' },
  { id: 'pistols',  label: 'Pistols',        label_bg: 'Пистолети',             sub: 'GBB · CO₂ · AEP',            sub_bg: 'GBB · CO₂ · AEP',              icon: 'Target',    color: '#C8921A' },
  { id: 'tactical', label: 'Tactical Gear',  label_bg: 'Тактическа Екипировка', sub: 'Vests · Pouches · Packs',    sub_bg: 'Елеци · Чанти · Раници',       icon: 'Shield',    color: '#6B8E4E' },
  { id: 'optics',   label: 'Optics',         label_bg: 'Оптика',                sub: 'Scopes · Red Dots · Lasers', sub_bg: 'Оптика · Колиматори · Лазери', icon: 'Eye',       color: '#D4500A' },
  { id: 'apparel',  label: 'Apparel',         label_bg: 'Облекло',               sub: 'BDU · Camo · Boots',         sub_bg: 'BDU · Камуфлаж · Обувки',      icon: 'Shirt',     color: '#888' },
  { id: 'ammo',     label: 'BBs & Ammo',     label_bg: 'Кулички и Амуниция',    sub: '.20g · .25g · .28g · Bio',   sub_bg: '.20g · .25g · .28g · Bio',     icon: 'Circle',    color: '#C8921A' },
  { id: 'upgrades', label: 'Upgrades',       label_bg: 'Надграждания',           sub: 'Barrels · Hopups · MOSFETs', sub_bg: 'Цеви · Hop-up · MOSFET',       icon: 'Wrench',    color: '#7B7B7B' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };

export default function CategoryStrip() {
  const { data } = useSiteData();
  const { lang } = useLanguage();
  const t = useT();

  const CATEGORIES = (data?.categories?.length ? data.categories : CATEGORIES_FALLBACK).map((c) => ({
    ...c,
    icon: ICON_MAP[c.icon] || Crosshair,
    glow: c.color ? `${c.color}26` : 'rgba(212,80,10,0.15)',
    displayLabel: lang === 'bg' ? (c.label_bg || c.label) : c.label,
    displaySub:   lang === 'bg' ? (c.sub_bg   || c.sub)   : c.sub,
  }));

  return (
    <section className="py-16 sm:py-20 relative"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e0e06 0%, #0d0d0d 55%), linear-gradient(180deg, #111111 0%, #080808 100%)' }}>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4500A]/40 to-transparent" />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="px-6 sm:px-10 lg:px-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12">
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[10px] sm:text-[11px] tracking-[0.4em] text-[#D4500A] uppercase font-medium">
            {t(TR.category.sectionTag)}
          </span>
          <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="mt-2 text-[30px] sm:text-[36px] font-bold tracking-wider text-white uppercase">
            {t(TR.category.sectionTitle)}
          </h2>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
          {CATEGORIES.map(({ displayLabel, displaySub, icon: Icon, color, glow }) => (
            <motion.a key={displayLabel} href="#" variants={cardVariants} whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative flex flex-col items-center justify-center gap-3 py-6 sm:py-8 px-2 sm:px-4 rounded-sm cursor-pointer overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #191919 0%, #141414 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(circle at 50% 40%, ${glow} 0%, transparent 70%)` }} />
              <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ border: `1px solid ${color}40` }} />
              <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={20} style={{ color }} className="transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
              </div>
              <div className="relative z-10 text-center">
                <p style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[13px] font-semibold tracking-[0.1em] text-white uppercase group-hover:text-white transition-colors">
                  {displayLabel}
                </p>
                <p className="text-[10px] text-gray-600 mt-1 group-hover:text-gray-500 transition-colors">{displaySub}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
            </motion.a>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </section>
  );
}
