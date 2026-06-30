import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Crosshair, Eye, Shield, Radio, Package, ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { useT } from '../context/LanguageContext';
import { TR } from '../translations';

export default function BuildKitSection({ onBuildKit }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const t = useT();

  const STEPS = [
    { num: '01', labelKey: 0, subKey: 0, Icon: Crosshair, color: '#D4500A' },
    { num: '02', labelKey: 1, subKey: 1, Icon: Eye,       color: '#C8921A' },
    { num: '03', labelKey: 2, subKey: 2, Icon: Shield,    color: '#6B8E4E' },
    { num: '04', labelKey: 3, subKey: 3, Icon: Radio,     color: '#4A7BA8' },
    { num: '05', labelKey: 4, subKey: 4, Icon: Package,   color: '#D4500A' },
  ];

  const STATS = [
    { value: '5',    labelKey: 'statSteps' },
    { value: '256+', labelKey: 'statCombos' },
    { value: '100%', labelKey: 'statCustom' },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden flex items-center" style={{ minHeight: '100vh', background: '#050505' }}>
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[340, 520, 700, 900].map((size, i) => (
          <motion.div key={size} className="absolute rounded-full"
            style={{ width: size, height: size, border: `1px solid rgba(212,80,10,${0.12 - i * 0.025})` }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }} />
        ))}
        <motion.div className="absolute rounded-full"
          style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,80,10,0.18) 0%, transparent 70%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <Crosshair size={48} style={{ color: 'rgba(212,80,10,0.25)', position: 'absolute' }} strokeWidth={0.8} />
      </div>

      <div className="absolute inset-0 dot-grid opacity-[0.18] pointer-events-none" />
      <motion.div className="absolute left-0 right-0 pointer-events-none"
        style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,80,10,0.3), transparent)' }}
        animate={{ top: ['0%', '100%'] }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
      <motion.div className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: 'linear-gradient(to bottom, transparent, #D4500A, transparent)' }}
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Main content */}
      <div className="relative z-10 w-full py-24"
        style={{ paddingLeft: 'clamp(1.5rem, 12%, 14rem)', paddingRight: 'clamp(1.5rem, 10%, 12rem)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-20">

          {/* LEFT */}
          <div className="flex-1">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }} className="inline-flex items-center gap-3 mb-8"
              style={{ background: 'rgba(212,80,10,0.1)', border: '1px solid rgba(212,80,10,0.35)', padding: '8px 16px', borderRadius: '2px' }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full" style={{ background: '#D4500A' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.4em', color: '#D4500A' }} className="uppercase">
                {t(TR.build.badge)}
              </span>
            </motion.div>

            {/* Giant headline */}
            {[TR.build.line1, TR.build.line2, TR.build.line3].map((lineKey, idx) => (
              <div key={idx} className={`overflow-hidden ${idx < 2 ? 'mb-2' : 'mb-8'}`}>
                <motion.h2 initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
                  style={{ fontFamily: 'Oswald, sans-serif', lineHeight: 0.9, letterSpacing: '0.03em' }}
                  className={`text-[clamp(56px,10vw,140px)] font-black uppercase ${idx === 1 ? '' : 'text-white'}`}>
                  {idx === 1 ? <span style={{ color: '#D4500A' }}>{t(lineKey)}</span> : t(lineKey)}
                </motion.h2>
              </div>
            ))}

            {/* Sub */}
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }} className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
              {t(TR.build.sub)}
            </motion.p>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.38 }} className="flex items-center gap-8 mb-12">
              {STATS.map(({ value, labelKey }) => (
                <div key={labelKey}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#D4500A', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)' }} className="uppercase mt-1">
                    {t(TR.build[labelKey])}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }} className="flex items-center gap-4 flex-wrap">
              <motion.button onClick={onBuildKit} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-glow relative inline-flex items-center gap-3 overflow-hidden"
                style={{ background: '#D4500A', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(13px,1.2vw,16px)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', padding: 'clamp(14px,1.5vw,18px) clamp(32px,3vw,52px)', borderRadius: '2px' }}>
                <Zap size={18} />
                {t(TR.build.cta)}
                <ArrowRight size={16} />
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }}
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
              </motion.button>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)' }} className="uppercase">
                {t(TR.build.ctaSub)}
              </span>
            </motion.div>
          </div>

          {/* RIGHT: Steps */}
          <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="flex flex-col gap-3 w-full lg:w-[380px] flex-shrink-0">
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.4em', color: 'rgba(212,80,10,0.7)' }}
              className="uppercase mb-2">
              {t(TR.build.howItWorks)}
            </p>

            {STEPS.map(({ num, labelKey, subKey, Icon, color }, i) => (
              <motion.div key={num} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                onClick={onBuildKit} className="flex items-center gap-4 cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '2px', padding: '14px 16px', transition: 'border-color 0.25s, background 0.25s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', minWidth: 20 }}>{num}</span>
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 36, height: 36, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '2px' }}>
                  <Icon size={15} style={{ color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', fontWeight: 600 }} className="uppercase">
                    {t(TR.kitSteps[labelKey].label)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {t(TR.kitStepSubs[subKey])}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} className="group-hover:text-[#D4500A] transition-colors duration-200" />
              </motion.div>
            ))}

            {/* Live total */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.8 }} className="mt-2 flex items-center justify-between px-4 py-3"
              style={{ background: 'rgba(212,80,10,0.08)', border: '1px solid rgba(212,80,10,0.2)', borderRadius: '2px' }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(212,80,10,0.7)' }} className="uppercase">
                {t(TR.build.liveTotal)}
              </span>
              <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', fontWeight: 700, color: '#D4500A' }}>
                €0.00 →
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
