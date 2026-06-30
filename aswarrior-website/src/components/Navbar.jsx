import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, Crosshair, ChevronDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MotionLink = motion(Link);

const shopUrl = (s) =>
  `/shop?cats=${encodeURIComponent(s.cats.join(','))}&name=${encodeURIComponent(s.bg)}`;

const NAV_ITEMS = [
  {
    label: { bg: 'РЕПЛИКИ', en: 'REPLICAS' },
    allCats: ['AEG Карабини', 'Пистолети', 'Гранати', 'Ножове'],
    sub: [
      { bg: 'AEG Карабини',  en: 'AEG Carbines',  cats: ['AEG Карабини'] },
      { bg: 'Пистолети',     en: 'Pistols',        cats: ['Пистолети'] },
      { bg: 'Гранати',       en: 'Grenades',       cats: ['Гранати'] },
      { bg: 'Ножове',        en: 'Knives',         cats: ['Ножове'] },
    ],
  },
  {
    label: { bg: 'ОБОРУДВАНЕ ЗА ОРЪЖИЯ', en: 'WEAPON EQUIPMENT' },
    allCats: ['Топчета (BBs)', 'Пълнители', 'Спийдлоудъри', 'Green Gas', 'CO2', 'Смазка', 'Батерии', 'Зарядни Устройства', 'Защитни Торбички', 'Бързомери (Red Dots)', 'Фенери', 'Дръжки', 'Релси', 'Монтажи', 'Повдигачи и Преходници', 'Антабки и Монтажни Планки', 'Калъфи/Чанти за Оръжия', 'Камуфлажни Ленти'],
    sub: [
      { bg: 'Топчета (BBS)',              en: 'BBs',                      cats: ['Топчета (BBs)'] },
      { bg: 'Пълнители и Спийдлоудъри',  en: 'Magazines & Speed Loaders', cats: ['Пълнители', 'Спийдлоудъри'] },
      { bg: 'Green Gas, CO2 и Смазка',   en: 'Green Gas, CO2 & Lubricant', cats: ['Green Gas', 'CO2', 'Смазка'] },
      { bg: 'Батерии и Зарядни',         en: 'Batteries & Chargers',     cats: ['Батерии', 'Зарядни Устройства', 'Защитни Торбички'] },
      { bg: 'Бързомери и Фенери',        en: 'Red Dots & Flashlights',   cats: ['Бързомери (Red Dots)', 'Фенери'] },
      { bg: 'Аксесоари за Реплики',      en: 'Replica Accessories',      cats: ['Дръжки', 'Релси', 'Монтажи', 'Повдигачи и Преходници', 'Антабки и Монтажни Планки'] },
      { bg: 'Калъфи/Чанти за Оръжия',   en: 'Weapon Cases & Bags',      cats: ['Калъфи/Чанти за Оръжия'] },
      { bg: 'Камуфлажни Ленти',          en: 'Camo Wraps',               cats: ['Камуфлажни Ленти'] },
    ],
  },
  {
    label: { bg: 'ЕКИПИРОВКА', en: 'GEAR' },
    allCats: ['Каски', 'Защитни Очила', 'Предпазни Маски', 'Шапки, Балаклави, Шалове', 'Жилетки и Chest Rigs', 'Колани', 'Ремъци', 'Кобури', 'Ръкавици', 'Наколенки и Налакътници', 'Джобове и Панели', 'Чантички за Пълнители', 'Чантички за Гранати', 'Чантички за Радиостанции', 'Универсални Чантички', 'Раници'],
    sub: [
      { bg: 'Каски и Защита на Главата',  en: 'Helmets & Head Protection', cats: ['Каски', 'Защитни Очила', 'Предпазни Маски'] },
      { bg: 'Шапки, Балаклави и Шалове',  en: 'Caps, Balaclavas & Scarves', cats: ['Шапки, Балаклави, Шалове'] },
      { bg: 'Жилетки и Chest Rigs',       en: 'Vests & Chest Rigs',       cats: ['Жилетки и Chest Rigs'] },
      { bg: 'Колани, Ремъци и Кобури',    en: 'Belts, Slings & Holsters', cats: ['Колани', 'Ремъци', 'Кобури'] },
      { bg: 'Ръкавици и Протектори',      en: 'Gloves & Protectors',      cats: ['Ръкавици', 'Наколенки и Налакътници'] },
      { bg: 'Джобове и Панели',           en: 'Pouches & Panels',         cats: ['Джобове и Панели'] },
      { bg: 'Чантички',                   en: 'Small Bags',               cats: ['Чантички за Пълнители', 'Чантички за Гранати', 'Чантички за Радиостанции', 'Универсални Чантички'] },
      { bg: 'Раници',                     en: 'Backpacks',                cats: ['Раници'] },
    ],
  },
  {
    label: { bg: 'АКСЕСОАРИ ЗА ЕКИПИРОВКА', en: 'GEAR ACCESSORIES' },
    allCats: ['Нашивки', 'Карабинери', 'Чантички за Пълнители', 'Чантички за Гранати', 'Чантички за Радиостанции', 'Универсални Чантички', 'Други'],
    sub: [
      { bg: 'Нашивки',    en: 'Patches',    cats: ['Нашивки'] },
      { bg: 'Карабинери', en: 'Carabiners', cats: ['Карабинери'] },
      { bg: 'Чантички',   en: 'Small Bags', cats: ['Чантички за Пълнители', 'Чантички за Гранати', 'Чантички за Радиостанции', 'Универсални Чантички'] },
      { bg: 'Други',      en: 'Other',      cats: ['Други'] },
    ],
  },
  {
    label: { bg: 'КОМУНИКАЦИЯ', en: 'COMMUNICATION' },
    allCats: ['Радиостанции', 'Антифони', 'Слушалки', 'Антени', 'PTT Бутони и Трубки', 'Зарядни', 'Аксесоари'],
    sub: [
      { bg: 'Радиостанции',          en: 'Radios',                cats: ['Радиостанции'] },
      { bg: 'Антифони',              en: 'Hearing Protection',    cats: ['Антифони'] },
      { bg: 'Слушалки',              en: 'Headsets',              cats: ['Слушалки'] },
      { bg: 'Антени',                en: 'Antennas',              cats: ['Антени'] },
      { bg: 'РТТ Бутони и Трубки',   en: 'PTT Buttons & Handsets', cats: ['PTT Бутони и Трубки'] },
      { bg: 'Зарядни',               en: 'Chargers',              cats: ['Зарядни'] },
      { bg: 'Аксесоари',             en: 'Accessories',           cats: ['Аксесоари'] },
    ],
  },
];


const TOP_BAR_MSGS = {
  bg: 'Безплатна доставка при поръчка над €200 / 391.17 лв',
  en: 'Free delivery on orders over €200 / 391.17 лв',
};

export default function Navbar({ onBuildKit }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [cartCount] = useState(3);
  const { lang, setLang } = useLanguage();
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = (idx) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(idx);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  };
  const keepOpen = () => clearTimeout(closeTimer.current);

  return (
    <>
      <motion.nav
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled || activeMenu !== null ? 'glass shadow-xl shadow-black/50' : 'bg-transparent'
        }`}
      >
        {/* Top announcement bar */}
        <div style={{
          background: '#D4500A',
          textAlign: 'center',
          padding: '6px 16px',
          fontFamily: 'Oswald, sans-serif',
          fontSize: 11,
          letterSpacing: '0.22em',
          color: '#fff',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {TOP_BAR_MSGS[lang]}
        </div>

        <div style={{ maxWidth: '1340px', margin: '0 auto' }} className="px-6 sm:px-8 lg:px-12 h-[68px] flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0" style={{ textDecoration: 'none' }}>
            <Crosshair size={22} className="text-[#D4500A] transition-transform duration-300 group-hover:rotate-45" />
            <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[22px] font-bold tracking-[0.18em] text-white uppercase">
              AS<span className="text-[#D4500A]">WARRIOR</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <ul className="hidden lg:flex items-center" style={{ gap: '32px', flex: 1, justifyContent: 'center' }}>
            {NAV_ITEMS.map((item, idx) => (
              <li key={item.label.en} style={{ position: 'relative' }}
                onMouseEnter={() => openMenu(idx)}
                onMouseLeave={closeMenu}
              >
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 13,
                  letterSpacing: '0.16em',
                  color: activeMenu === idx ? '#fff' : 'rgba(255,255,255,0.75)',
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 0',
                  transition: 'color .18s',
                  whiteSpace: 'nowrap',
                  borderBottom: activeMenu === idx ? '2px solid #D4500A' : '2px solid transparent',
                }}>
                  {item.label[lang]}
                  <ChevronDown size={11} strokeWidth={2.5} style={{
                    transition: 'transform .2s',
                    transform: activeMenu === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: activeMenu === idx ? '#D4500A' : 'rgba(255,255,255,0.35)',
                    flexShrink: 0,
                  }} />
                </button>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Language switcher */}
            <div className="hidden sm:flex" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
              {(['bg', 'en']).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '5px 10px',
                  background: lang === l ? '#D4500A' : 'transparent',
                  color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Oswald, sans-serif', fontSize: 10,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  transition: 'all .18s',
                }}>
                  {l === 'bg' ? 'БГ' : 'EN'}
                </button>
              ))}
            </div>

            <button className="text-gray-400 hover:text-white transition-colors duration-200 hidden sm:block"><Search size={17} strokeWidth={1.8} /></button>
            <button className="text-gray-400 hover:text-white transition-colors duration-200 hidden sm:block"><User size={17} strokeWidth={1.8} /></button>
            <button className="relative text-gray-400 hover:text-white transition-colors duration-200">
              <ShoppingBag size={17} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-[16px] h-[16px] bg-[#D4500A] rounded-full text-[9px] font-bold flex items-center justify-center text-white">{cartCount}</span>
              )}
            </button>

            <button className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200 ml-1" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div key="mobile-menu"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="glass overflow-hidden border-t border-white/[0.06] lg:hidden">
              <ul className="flex flex-col px-6 py-4 gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li key={item.label.en} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase' }}>{item.label[lang]}</span>
                      <ChevronDown size={14} style={{ color: '#D4500A', transform: mobileExpanded === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                          <div style={{ paddingLeft: 14, paddingBottom: 10, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {item.sub.map((s) => (
                              <Link
                                key={s.en}
                                to={shopUrl(s)}
                                onClick={() => setMobileOpen(false)}
                                style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', textDecoration: 'none', padding: '8px 0', display: 'block', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#D4500A'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                              >
                                {s[lang]}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (NAV_ITEMS.length) * 0.05 }}>
                  <div className="flex gap-2 pt-4 pb-2">
                    {(['bg', 'en']).map((l) => (
                      <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }} style={{
                        padding: '7px 18px', background: lang === l ? '#D4500A' : 'transparent',
                        color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${lang === l ? '#D4500A' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: 3, cursor: 'pointer', fontFamily: 'Oswald, sans-serif',
                        fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                      }}>
                        {l === 'bg' ? 'Български' : 'English'}
                      </button>
                    ))}
                  </div>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Full-width Mega Menu — rendered outside nav so it spans 100vw */}
      <AnimatePresence>
        {activeMenu !== null && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={keepOpen}
            onMouseLeave={closeMenu}
            style={{
              position: 'fixed',
              top: 99,
              left: 0,
              right: 0,
              zIndex: 49,
              background: '#0f0f0f',
              borderTop: '2px solid #D4500A',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '30px 48px 34px' }}>
              {/* Category label */}
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.5em', color: '#D4500A', textTransform: 'uppercase', marginBottom: 22 }}>
                {NAV_ITEMS[activeMenu]?.label[lang]}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
                {NAV_ITEMS[activeMenu]?.sub?.map((s, i) => (
                  <MotionLink
                    key={s.en}
                    to={shopUrl(s)}
                    onClick={() => setActiveMenu(null)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      width: '25%', padding: '10px 12px',
                      borderLeft: '2px solid transparent',
                      textDecoration: 'none', fontFamily: 'Oswald, sans-serif',
                      fontSize: 14, letterSpacing: '0.18em',
                      color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase',
                      transition: 'all .14s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderLeftColor = '#D4500A'; e.currentTarget.style.background = 'rgba(212,80,10,0.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <ArrowRight size={12} style={{ color: '#D4500A', flexShrink: 0 }} />
                    {s[lang]}
                  </MotionLink>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
