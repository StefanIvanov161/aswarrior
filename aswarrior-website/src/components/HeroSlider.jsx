import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { useLanguage, useT } from '../context/LanguageContext';
import { TR } from '../translations';

const SLIDES_FALLBACK = [
  {
    id: 0,
    tag: 'NEW SEASON DROP — SS26',          tag_bg: 'НОВА СЕЗОННА КОЛЕКЦИЯ — ЛЯ26',
    headline: ['DOMINATE', 'THE FIELD'],    headline_bg: ['ДОМИНИРАЙ', 'НА ТЕРЕНА'],
    accentWord: 1,
    sub: 'Elite airsoft rifles, tactical loadouts, and premium gear engineered for operators who refuse second place.',
    sub_bg: 'Елитни ейрсофт пушки, тактически комплекти и висококачествено оборудване, проектирано за оператори, които не приемат второ място.',
    cta: 'Shop the Arsenal', cta_bg: 'Разгледай Арсенала',
    gradientFrom: '#0a0505', gradientVia: '#1a0d08', glowColor: 'rgba(212,80,10,0.12)',
  },
  {
    id: 1,
    tag: 'CQB SPECIALIST KIT',              tag_bg: 'CQB СПЕЦИАЛИСТ КИТ',
    headline: ['GEAR UP.', 'STRIKE HARD.'], headline_bg: ['ЕКИПИРАЙ СЕ.', 'УДРЯЙ СИЛНО.'],
    accentWord: 1,
    sub: 'Full tactical loadouts purpose-built for CQB, woodland, and long-range engagements. Dominate every environment.',
    sub_bg: 'Пълни тактически комплекти, специално изградени за CQB, гора и далечни разстояния. Доминирай на всеки терен.',
    cta: 'View Loadouts', cta_bg: 'Виж Комплектите',
    gradientFrom: '#050a05', gradientVia: '#0d1a0d', glowColor: 'rgba(100,140,60,0.10)',
  },
  {
    id: 2,
    tag: 'PRECISION OPTICS LINE',           tag_bg: 'ЛИНИЯ ПРЕЦИЗНА ОПТИКА',
    headline: ['ZERO IN ON', 'VICTORY.'],   headline_bg: ['ФОКУСИРАЙ СЕ', 'ВЪРХУ ПОБЕДАТА.'],
    accentWord: 1,
    sub: 'Top-tier scopes, red-dot sights, and IR laser targeting. Because the first shot is all that matters.',
    sub_bg: 'Топ оптика, колиматорни мерници и IR лазерна насочваща система. Защото само първият изстрел има значение.',
    cta: 'Shop Optics', cta_bg: 'Купи Оптика',
    gradientFrom: '#050508', gradientVia: '#0d0d1a', glowColor: 'rgba(80,100,200,0.10)',
  },
];

const textVariants = {
  enter: { opacity: 0, y: 50, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -40, filter: 'blur(4px)' },
};

export default function HeroSlider() {
  const { data } = useSiteData();
  const { lang } = useLanguage();
  const t = useT();

  const SLIDES = (data?.heroSlides?.length ? data.heroSlides : SLIDES_FALLBACK).map((s, i) => ({
    ...SLIDES_FALLBACK[i] || SLIDES_FALLBACK[0], ...s,
  }));

  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sectionRef = useRef(null);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ['0%', '25%']);
  const textY = useTransform(scrollY, [0, 700], ['0%', '10%']);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => { setCurrent((c) => (c + 1) % SLIDES.length); }, 5500);
    return () => clearInterval(timer);
  }, [autoplay, SLIDES.length]);

  const slide = SLIDES[Math.min(current, SLIDES.length - 1)];

  // Pick localised field or fall back to English
  const L = (field) => (lang === 'bg' && slide[`${field}_bg`]) ? slide[`${field}_bg`] : slide[field];

  const statsData = [
    { val: '2,400+', label: t(TR.hero.products) },
    { val: '50K+',   label: t(TR.hero.operators) },
    { val: '4.9★',   label: t(TR.hero.rating) },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.15] origin-center">
        <AnimatePresence mode="sync">
          <motion.div key={`bg-${current}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }} className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 70% at 60% 40%, ${slide.glowColor} 0%, transparent 65%), linear-gradient(160deg, ${slide.gradientFrom} 0%, ${slide.gradientVia} 50%, #0a0a0a 100%)` }} />
        </AnimatePresence>
        <div className="absolute inset-0 dot-grid opacity-100" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `repeating-linear-gradient(-55deg, transparent, transparent 12px, rgba(212,80,10,1) 12px, rgba(212,80,10,1) 13px)` }} />
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#111111] to-transparent" />
        <div className="absolute top-0 right-0 w-[1px] h-[35%] bg-gradient-to-b from-transparent via-[#D4500A]/50 to-transparent" />
        <div className="absolute top-0 right-[25%] w-[1px] h-[20%] bg-gradient-to-b from-transparent via-[#D4500A]/25 to-transparent" />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />

      {/* Content */}
      <motion.div style={{ y: textY, opacity, paddingLeft: 'clamp(1.5rem, 12%, 14rem)', paddingRight: '2rem', paddingTop: '8rem', paddingBottom: '9rem' }} className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div key={`content-${current}`} initial="enter" animate="visible" exit="exit" variants={{ enter: {}, visible: {}, exit: {} }}>

            {/* Tag */}
            <motion.div variants={textVariants} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }} className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-[#D4500A]" />
              <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[11px] tracking-[0.35em] text-[#D4500A] font-medium uppercase">
                {L('tag')}
              </span>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden">
              {L('headline').map((line, lineIdx) => (
                <motion.h1 key={lineIdx} variants={textVariants}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 + lineIdx * 0.1 }}
                  style={{ fontFamily: 'Oswald, sans-serif' }}
                  className={`font-bold leading-none tracking-[0.04em] uppercase text-[clamp(44px,9vw,130px)] ${lineIdx === slide.accentWord ? 'text-[#D4500A]' : 'text-white'}`}>
                  {line}
                </motion.h1>
              ))}
            </div>

            {/* Sub */}
            <motion.p variants={textVariants} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="mt-4 sm:mt-6 max-w-lg text-gray-400 text-sm sm:text-base lg:text-[17px] leading-relaxed font-light">
              {L('sub')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={textVariants} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
              className="mt-7 sm:mt-10 flex items-center gap-3 sm:gap-4 flex-wrap">
              <button className="btn-sweep btn-glow inline-flex items-center gap-3 px-8 py-4 bg-[#D4500A] text-white text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#b83d08]"
                style={{ fontFamily: 'Oswald, sans-serif' }}>
                {L('cta')}
                <ArrowRight size={16} />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white/70 text-sm font-medium tracking-[0.15em] uppercase hover:border-white/50 hover:text-white transition-all duration-300"
                style={{ fontFamily: 'Oswald, sans-serif' }}>
                {t(TR.hero.learnMore)}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={textVariants} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.48 }}
              className="mt-16 flex items-center gap-10 flex-wrap">
              {statsData.map(({ val, label }) => (
                <div key={label} className="flex flex-col">
                  <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[28px] font-bold text-white tracking-wide">{val}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Slide dots */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setAutoplay(false); }} aria-label={`Slide ${i + 1}`}
            className={`slider-dot ${i === current ? 'active' : ''}`} />
        ))}
      </div>

      {/* Slide number */}
      <div className="absolute bottom-10 left-10 z-20 hidden lg:flex items-center gap-2">
        <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[#D4500A] text-xl font-bold">{String(current + 1).padStart(2, '0')}</span>
        <span className="text-white/20 text-sm">/ {String(SLIDES.length).padStart(2, '0')}</span>
      </div>

      {/* Scroll chevron */}
      <motion.div style={{ opacity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">{t(TR.hero.scroll)}</span>
        <ChevronDown size={16} className="text-white/30 bounce-slow" />
      </motion.div>
    </section>
  );
}
