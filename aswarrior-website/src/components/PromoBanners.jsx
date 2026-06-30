import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { useLanguage } from '../context/LanguageContext';

const BANNERS_FALLBACK = [
  {
    id: 'cqb',
    title: 'CQB LOADOUTS',            title_bg: 'CQB КОМПЛЕКТИ',
    sub: 'Close-quarters. No mercy.', sub_bg: 'На близко разстояние. Без пощада.',
    body: 'Compact rifles, light vests, and speed holsters for urban combat dominance.',
    body_bg: 'Компактни пушки, леки елеци и бързи кобури за доминация в градски бой.',
    cta: 'Build Your Kit',            cta_bg: 'Построй Своя Kit',
    tag: 'CLOSE QUARTERS',           tag_bg: 'НА БЛИЗКО',
    imgSeed: '10', accentColor: '#D4500A', gradientDir: 'to right',
  },
  {
    id: 'sniper',
    title: 'SNIPER KITS',             title_bg: 'СНАЙПЕРСКИ КОМПЛЕКТИ',
    sub: 'One shot. One kill.',       sub_bg: 'Един изстрел. Един убит.',
    body: 'High-powered VSR builds, ghillie systems, and long-range optic packages.',
    body_bg: 'Мощни VSR конфигурации, гили системи и пакети с оптика за далечни разстояния.',
    cta: 'Gear Up',                   cta_bg: 'Екипирай Се',
    tag: 'LONG RANGE',               tag_bg: 'ДАЛЕЧНИ РАЗСТОЯНИЯ',
    imgSeed: '20', accentColor: '#6B8E4E', gradientDir: 'to left',
  },
  {
    id: 'nightops',
    title: 'NIGHT OPS',               title_bg: 'НОЩНИ ОПЕРАЦИИ',
    sub: 'Darkness is your cover.',   sub_bg: 'Тъмнината е твоето прикритие.',
    body: 'IR-compatible gear, blacked-out hardware, and suppressor-ready builds for low-light dominance.',
    body_bg: 'IR-съвместимо оборудване, изцяло черни компоненти и конфигурации с заглушители за доминация при слаба осветеност.',
    cta: 'Go Dark',                   cta_bg: 'Влез в Тъмнината',
    tag: 'STEALTH',                  tag_bg: 'СКРИТО ДЕЙСТВИЕ',
    imgSeed: '55', accentColor: '#4A7BA8', gradientDir: 'to right',
  },
];

export default function PromoBanners() {
  const { data } = useSiteData();
  const { lang } = useLanguage();
  const BANNERS = data?.banners?.length ? data.banners : BANNERS_FALLBACK;

  const L = (item, field) => (lang === 'bg' && item[`${field}_bg`]) ? item[`${field}_bg`] : item[field];

  return (
    <section className="relative py-8 sm:py-10"
      style={{ background: 'linear-gradient(160deg, #0f0a07 0%, #0a0a0a 40%, #07090f 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px)` }} />
      <div className="absolute top-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {BANNERS.map((banner) => {
            const { accentColor, gradientDir, imgSeed } = banner;
            return (
              <motion.div key={banner.id || banner.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-[340px] sm:h-[420px] lg:h-[500px] overflow-hidden cursor-pointer rounded-sm img-zoom-wrap">
                <img src={`https://picsum.photos/seed/${imgSeed}/900/600`} alt={L(banner, 'title')}
                  className="img-zoom absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'grayscale(40%) contrast(130%) brightness(40%)' }} />
                <div className="absolute inset-0 z-10"
                  style={{ background: `linear-gradient(${gradientDir}, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 100%)` }} />
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(${gradientDir}, ${accentColor}20 0%, transparent 60%)` }} />
                <div className="absolute inset-0 z-10 opacity-[0.04]"
                  style={{ backgroundImage: `repeating-linear-gradient(-55deg, transparent, transparent 8px, rgba(255,255,255,1) 8px, rgba(255,255,255,1) 9px)` }} />

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-[1px] w-6" style={{ background: accentColor }} />
                    <span style={{ fontFamily: 'Oswald, sans-serif', color: accentColor }}
                      className="text-[10px] tracking-[0.35em] uppercase font-medium">
                      {L(banner, 'tag')}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2 tracking-widest uppercase font-light">{L(banner, 'sub')}</p>
                  <h3 style={{ fontFamily: 'Oswald, sans-serif' }}
                    className="text-[48px] lg:text-[58px] font-bold leading-none tracking-wide text-white uppercase mb-3">
                    {L(banner, 'title')}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">{L(banner, 'body')}</p>
                  <div className="flex items-center gap-3">
                    <motion.a href="#" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
                      style={{ fontFamily: 'Oswald, sans-serif', color: accentColor }}
                      className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.2em] uppercase border-b pb-1 transition-all duration-300"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                      {L(banner, 'cta')}
                      <ArrowUpRight size={14} />
                    </motion.a>
                  </div>
                </div>

                <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <div className="w-8 h-8 border-t-2 border-r-2" style={{ borderColor: accentColor }} />
                </div>
                <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <div className="w-8 h-8 border-b-2 border-l-2" style={{ borderColor: accentColor }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
