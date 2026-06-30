import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, Shield, Package, Radio, Target, Zap, Wrench, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteData } from '../context/SiteDataContext';

const KITS = [
  {
    id: 'replicas',
    bg: { text: 'РЕПЛИКИ',            sub: 'AEG · Пистолети · Гранати' },
    en: { text: 'REPLICAS',           sub: 'AEG · Pistols · Grenades' },
    icon: Crosshair,
    color: '#D4500A',
    cats: ['AEG Карабини', 'Пистолети', 'Гранати', 'Ножове'],
    name_bg: 'Реплики',
    name_en: 'Replicas',
  },
  {
    id: 'protection',
    bg: { text: 'ЗАЩИТА',             sub: 'Каски · Маски · Очила' },
    en: { text: 'PROTECTION',         sub: 'Helmets · Masks · Goggles' },
    icon: Shield,
    color: '#6B8E4E',
    cats: ['Каски', 'Защитни Очила', 'Предпазни Маски'],
    name_bg: 'Каски и Защита',
    name_en: 'Helmets & Protection',
  },
  {
    id: 'gear',
    bg: { text: 'ТАКТИЧЕСКА',         sub: 'Жилетки · Чанти · Раници' },
    en: { text: 'TACTICAL GEAR',      sub: 'Vests · Bags · Backpacks' },
    icon: Package,
    color: '#C8921A',
    cats: ['Жилетки и Chest Rigs', 'Джобове и Панели', 'Раници', 'Универсални Чантички'],
    name_bg: 'Тактическа Екипировка',
    name_en: 'Tactical Gear',
  },
  {
    id: 'comms',
    bg: { text: 'КОМУНИКАЦИЯ',        sub: 'Радиостанции · Слушалки' },
    en: { text: 'COMMUNICATION',      sub: 'Radios · Headsets · PTT' },
    icon: Radio,
    color: '#4A7BA8',
    cats: ['Радиостанции', 'Слушалки', 'Антифони', 'PTT Бутони и Трубки', 'Антени'],
    name_bg: 'Комуникация',
    name_en: 'Communication',
  },
  {
    id: 'ammo',
    bg: { text: 'БОЕПРИПАСИ',         sub: 'Топчета · 0.20g · 0.25g · Bio' },
    en: { text: 'AMMO',               sub: 'BBs · 0.20g · 0.25g · Bio' },
    icon: Target,
    color: '#D4500A',
    cats: ['Топчета (BBs)'],
    name_bg: 'Топчета (BBs)',
    name_en: 'BBs',
  },
  {
    id: 'power',
    bg: { text: 'ЗАХРАНВАНЕ',         sub: 'Батерии · Зарядни · CO2' },
    en: { text: 'POWER',              sub: 'Batteries · Chargers · CO2' },
    icon: Zap,
    color: '#C8921A',
    cats: ['Батерии', 'Зарядни Устройства', 'CO2', 'Green Gas'],
    name_bg: 'Батерии и Зарядни',
    name_en: 'Batteries & Chargers',
  },
  {
    id: 'accessories',
    bg: { text: 'АКСЕСОАРИ',          sub: 'Релси · Монтажи · Дръжки' },
    en: { text: 'ACCESSORIES',        sub: 'Rails · Mounts · Grips' },
    icon: Wrench,
    color: '#888',
    cats: ['Дръжки', 'Релси', 'Монтажи', 'Повдигачи и Преходници', 'Антабки и Монтажни Планки'],
    name_bg: 'Аксесоари за Реплики',
    name_en: 'Replica Accessories',
  },
  {
    id: 'carry',
    bg: { text: 'НОСЕНЕ',             sub: 'Колани · Ремъци · Кобури' },
    en: { text: 'CARRY',              sub: 'Belts · Slings · Holsters' },
    icon: Briefcase,
    color: '#888',
    cats: ['Колани', 'Ремъци', 'Кобури', 'Чантички за Пълнители', 'Чантички за Гранати'],
    name_bg: 'Колани, Ремъци и Кобури',
    name_en: 'Belts, Slings & Holsters',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function FindYourKitSection() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data } = useSiteData();

  const allProducts = data?.products || [];

  const getCount = (cats) =>
    allProducts.filter(p => !p.hidden && cats.includes(p.category)).length;

  const handleClick = (kit) => {
    const url = `/shop?cats=${encodeURIComponent(kit.cats.join(','))}&name=${encodeURIComponent(lang === 'bg' ? kit.name_bg : kit.name_en)}`;
    navigate(url);
  };

  return (
    <section style={{ background: '#090909', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Dot grid texture */}
      <div className="absolute inset-0 dot-grid opacity-[0.14] pointer-events-none" />
      {/* Top / bottom accent lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,80,10,0.35), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />

      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 48px' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}
        >
          <div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.5em', color: '#D4500A', textTransform: 'uppercase', marginBottom: 10 }}>
              {lang === 'bg' ? 'ПАЗАРУВАЙ ПО КИТ' : 'SHOP BY KIT'}
            </p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
              {lang === 'bg' ? 'НАМЕРИ' : 'FIND'}{' '}
              <span style={{ color: '#D4500A' }}>{lang === 'bg' ? 'СВОЯ КИТ' : 'YOUR KIT'}</span>
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 360, lineHeight: 1.65 }}>
            {lang === 'bg'
              ? 'Избери категория и открий оборудването, което ти трябва за следващата операция.'
              : 'Pick a category and find the gear you need for your next operation.'}
          </p>
        </motion.div>

        {/* 4×2 grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {KITS.map((kit) => {
            const Icon = kit.icon;
            const label = lang === 'bg' ? kit.bg : kit.en;
            const count = getCount(kit.cats);

            return (
              <motion.div
                key={kit.id}
                variants={cardVariants}
                onClick={() => handleClick(kit)}
                style={{
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  padding: '32px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color .2s, transform .2s',
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${kit.color}55`;
                  e.currentTarget.querySelector('.kit-glow').style.opacity = '1';
                  e.currentTarget.querySelector('.kit-bar').style.opacity = '1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.querySelector('.kit-glow').style.opacity = '0';
                  e.currentTarget.querySelector('.kit-bar').style.opacity = '0';
                }}
              >
                {/* Radial glow on hover */}
                <div className="kit-glow" style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 50% 0%, ${kit.color}18 0%, transparent 65%)`,
                  opacity: 0,
                  transition: 'opacity .25s',
                  pointerEvents: 'none',
                }} />
                {/* Bottom color bar */}
                <div className="kit-bar" style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${kit.color}, transparent)`,
                  opacity: 0,
                  transition: 'opacity .25s',
                }} />

                {/* Icon */}
                <div style={{
                  width: 52, height: 52,
                  background: `${kit.color}15`,
                  border: `1px solid ${kit.color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  flexShrink: 0,
                }}>
                  <Icon size={22} style={{ color: kit.color }} strokeWidth={1.6} />
                </div>

                {/* Text */}
                <p style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}>
                  {label.text}
                </p>
                <p style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 9,
                  letterSpacing: '0.25em',
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}>
                  {label.sub}
                </p>

                {/* Count */}
                {count > 0 && (
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 1, background: kit.color, opacity: 0.5 }} />
                    <span style={{
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: 10,
                      letterSpacing: '0.3em',
                      color: 'rgba(255,255,255,0.25)',
                      textTransform: 'uppercase',
                    }}>
                      {count} {lang === 'bg' ? 'продукта' : 'products'}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
