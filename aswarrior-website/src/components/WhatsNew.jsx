import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useT } from '../context/LanguageContext';
import { TR } from '../translations';

export default function WhatsNew() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['20px', '-20px']);
  const t = useT();

  const features = [t(TR.whatsNew.feat1), t(TR.whatsNew.feat2), t(TR.whatsNew.feat3), t(TR.whatsNew.feat4)];

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[520px] flex items-center mx-3 sm:mx-6 lg:mx-12">
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110 origin-center">
        <img src="https://picsum.photos/seed/nightops88/1600/700" alt="Shadow Ops Series"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(50%) contrast(130%) brightness(30%)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,1) 24px, rgba(255,255,255,1) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,1) 24px, rgba(255,255,255,1) 25px)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4500A]/15 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ y: contentY, paddingLeft: 'clamp(1.5rem, 12%, 14rem)', paddingRight: '2rem', paddingTop: '6rem', paddingBottom: '6rem' }}
        className="relative z-10 w-full">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-[#D4500A] px-4 py-2 mb-8">
            <Zap size={12} className="text-white" fill="white" />
            <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[11px] tracking-[0.35em] text-white font-medium uppercase">
              {t(TR.whatsNew.badge)}
            </span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-[clamp(36px,6vw,90px)] font-bold leading-none tracking-wider text-white uppercase">
            {t(TR.whatsNew.introducing)}<br />
            <span className="text-[#D4500A]">SHADOW OPS</span><br />
            {t(TR.whatsNew.series)}
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
            className="mt-6 text-gray-400 text-base lg:text-lg leading-relaxed max-w-xl">
            {t(TR.whatsNew.desc)}
          </motion.p>

          <motion.ul initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.32 }} className="mt-6 space-y-2">
            {features.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-1 h-1 rounded-full bg-[#D4500A] flex-shrink-0" />
                {feat}
              </li>
            ))}
          </motion.ul>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
            className="mt-10 flex items-center gap-4 flex-wrap">
            <button className="btn-sweep btn-glow inline-flex items-center gap-3 px-8 py-4 bg-[#D4500A] text-white transition-all hover:bg-[#b83d08]">
              <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-sm font-semibold tracking-[0.2em] uppercase">
                {t(TR.whatsNew.cta)}
              </span>
              <ArrowRight size={15} />
            </button>
            <a href="#" style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-[13px] tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-white/60">
              {t(TR.whatsNew.lookbook)}
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Right glow orb */}
      <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="absolute right-0 top-0 bottom-0 w-[40%] hidden lg:flex items-center justify-center z-10 pr-16">
        <div className="w-[280px] h-[280px] rounded-full flex items-center justify-center relative"
          style={{ background: 'radial-gradient(circle, rgba(212,80,10,0.08) 0%, transparent 70%)', border: '1px solid rgba(212,80,10,0.15)' }}>
          <div className="w-[200px] h-[200px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,80,10,0.12) 0%, transparent 70%)', border: '1px solid rgba(212,80,10,0.25)' }} />
          <div className="absolute inset-0 rounded-full border border-[#D4500A]/10 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-4 rounded-full border border-[#D4500A]/05 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="absolute text-center text-white/10 text-[80px] font-black select-none">SO</span>
        </div>
      </motion.div>
    </section>
  );
}
