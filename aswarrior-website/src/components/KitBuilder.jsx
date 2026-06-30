import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Crosshair, Eye, Grip,
  Circle, Package, Check, ShoppingBag, Zap, Shield, Target,
  Wrench, ScanLine, Radio
} from 'lucide-react';
import { useT } from '../context/LanguageContext';
import { TR } from '../translations';

// ── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'replica', Icon: Crosshair,
    options: [
      { id: 'm4',   name: 'M4A1 CQB',     brand: 'KRYTAC',     price: 349.99, tag: 'BEST SELLER', desc: 'Full-auto AEG · 380 FPS · M-LOK handguard',        Icon: Crosshair },
      { id: 'scar', name: 'SCAR-L MK16',  brand: 'VFC',        price: 479.99, tag: 'PREMIUM',     desc: 'Licensed · ETU MOSFET · Reinforced gearbox',        Icon: Crosshair },
      { id: 'ak',   name: 'AKM GBB',      brand: 'WE-Tech',    price: 389.99, tag: 'RECOIL',      desc: 'Full blowback · Bolt release · Steel receiver',      Icon: Crosshair },
      { id: 'mp5',  name: 'MP5A5 AEG',    brand: 'Umarex',     price: 299.99, tag: 'CQB',         desc: 'Compact · Licensed H&K · 340 FPS urban ops',        Icon: Target },
    ],
  },
  {
    id: 'optic', Icon: Eye,
    options: [
      { id: 'reddot', name: 'T1 Red Dot',        brand: 'Aim-O',        price: 39.99,  tag: 'FAST ACQ.', desc: '4 MOA dot · 11 brightness levels · Auto-off' },
      { id: 'acog',   name: 'ACOG 4×32',          brand: 'NcStar',       price: 89.99,  tag: 'LONG RANGE',desc: 'Fixed 4× magnification · Illuminated reticle'  },
      { id: 'holo',   name: 'XPS3 Holographic',   brand: 'Clone EOTech', price: 69.99,  tag: 'HOLO',      desc: '65 MOA ring · Unlimited eye relief · CR123A'  },
      { id: 'none',   name: 'Iron Sights',         brand: 'Stock',        price: 0,      tag: 'FREE',      desc: 'Factory iron sights · No additional cost'     },
    ],
  },
  {
    id: 'grip', Icon: Shield,
    options: [
      { id: 'angled',   name: 'Angled Foregrip',  brand: 'Magpul AFG2',  price: 19.99, tag: 'CONTROL',   desc: 'Reduces muzzle climb · Ergonomic angle'          },
      { id: 'vertical', name: 'Vertical Foregrip', brand: 'PTS Enhanced', price: 24.99, tag: 'STABILITY', desc: 'Classic vertical hold · Picatinny mount'          },
      { id: 'handstop', name: 'M-LOK Hand Stop',   brand: 'Magpul MOE+',  price: 14.99, tag: 'LIGHT',     desc: 'Lightweight indexing stop · M-LOK compatible'    },
      { id: 'none',     name: 'No Foregrip',        brand: '—',            price: 0,     tag: 'FREE',      desc: 'Run clean — no foregrip attachment'              },
    ],
  },
  {
    id: 'suppressor', Icon: Radio,
    options: [
      { id: 'short',  name: 'Short Suppressor',  brand: 'Specna Arms',   price: 29.99, tag: 'CQB',      desc: '14mm CCW thread · 140mm · Matte black'           },
      { id: 'long',   name: 'Long Suppressor',   brand: 'PTS Syndicate', price: 49.99, tag: 'STEALTH',  desc: '220mm length · Dramatically reduces report'      },
      { id: 'flash',  name: 'Flash Hider A2',    brand: 'Steel',         price: 9.99,  tag: 'TACTICAL', desc: 'A2 style · Reduces visible flash signature'      },
      { id: 'none',   name: 'No Muzzle Device',  brand: '—',             price: 0,     tag: 'FREE',     desc: 'Keep the factory threading cap'                  },
    ],
  },
  {
    id: 'magazine', Icon: Package,
    options: [
      { id: 'midcap',   name: '150rd Mid-Cap',    brand: 'P-Mag Clone',  price: 29.99, tag: 'REALISTIC',   desc: 'No-rattle mid-cap · Realistic capacity'         },
      { id: 'hicap',    name: '300rd Hi-Cap',      brand: 'Matrix',       price: 19.99, tag: 'ECONOMY',     desc: 'High capacity · Wind-up wheel feeder'           },
      { id: 'drum',     name: '3000rd Drum Mag',   brand: 'Evike',        price: 59.99, tag: 'SUPPRESSION', desc: 'Electric drum · Never run dry in the field'    },
      { id: 'x3midcap', name: '3× Mid-Cap Bundle', brand: 'P-Mag Clone',  price: 74.99, tag: 'BEST VALUE',  desc: 'Three 150rd mids for sustained operations'     },
    ],
  },
];

const TAG_COLORS = {
  'BEST SELLER':'#D4500A','PREMIUM':'#C8921A','RECOIL':'#4A7BA8','CQB':'#6B8E4E',
  'FAST ACQ.':'#D4500A','LONG RANGE':'#6B8E4E','HOLO':'#C8921A','FREE':'#555',
  'CONTROL':'#D4500A','STABILITY':'#6B8E4E','LIGHT':'#C8921A',
  'STEALTH':'#4A7BA8','TACTICAL':'#D4500A','REALISTIC':'#D4500A',
  'ECONOMY':'#6B8E4E','SUPPRESSION':'#C8921A','BEST VALUE':'#D4500A',
};

// ── Price counter ─────────────────────────────────────────────────────────────

function PriceCounter({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value;
    if (start === end) return;
    const duration = 400, startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(start + (end - start) * ease);
      if (t < 1) requestAnimationFrame(tick);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>€{display.toFixed(2)} <span style={{ fontSize: '0.65em', opacity: 0.45 }}>/ {(display * 1.95583).toFixed(2)} лв.</span></span>;
}

// ── Option card ───────────────────────────────────────────────────────────────

function OptionCard({ option, selected, onSelect, freeLabel }) {
  const tagColor = TAG_COLORS[option.tag] || '#D4500A';
  return (
    <motion.button onClick={() => onSelect(option)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }} className="relative w-full text-left overflow-hidden"
      style={{ background: selected ? 'linear-gradient(135deg, rgba(212,80,10,0.15) 0%, rgba(212,80,10,0.05) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: selected ? '1px solid rgba(212,80,10,0.6)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '2px', padding: '14px 16px', transition: 'background 0.25s, border-color 0.25s' }}>
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(212,80,10,0.12) 0%, transparent 70%)' }} />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontFamily: 'Oswald, sans-serif', color: selected ? '#fff' : 'rgba(255,255,255,0.85)' }}
              className="text-[14px] font-semibold tracking-wide uppercase leading-tight">{option.name}</span>
            <span className="text-[9px] font-medium tracking-[0.2em] uppercase px-1.5 py-[2px]"
              style={{ background: tagColor, color: '#fff', fontFamily: 'Oswald, sans-serif' }}>{option.tag}</span>
          </div>
          <p className="text-[11px] text-gray-600 mb-1" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{option.brand}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">{option.desc}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span style={{ fontFamily: 'Oswald, sans-serif', color: selected ? '#D4500A' : 'rgba(255,255,255,0.5)' }} className="text-[16px] font-bold">
            {parseFloat(option.price||0) === 0 ? freeLabel : (
              <span>€{parseFloat(option.price||0).toFixed(2)} <span style={{ fontSize: '0.65em', opacity: 0.45 }}>/ {(parseFloat(option.price||0) * 1.95583).toFixed(2)} лв.</span></span>
            )}
          </span>
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"
            style={{ border: selected ? '1.5px solid #D4500A' : '1.5px solid rgba(255,255,255,0.15)', background: selected ? '#D4500A' : 'transparent', borderRadius: '2px', transition: 'all 0.2s' }}>
            {selected && <Check size={11} className="text-white" strokeWidth={3} />}
          </div>
        </div>
      </div>
      {selected && (
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #D4500A, transparent)', transformOrigin: 'left' }} />
      )}
    </motion.button>
  );
}

// ── Loadout panel ─────────────────────────────────────────────────────────────

function LoadoutPanel({ selections, currentStepId, t }) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.4em] text-[#D4500A] uppercase mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {t(TR.kit.currentLoadout)}
        </p>
        <AnimatePresence mode="wait">
          <motion.h2 key={selections.replica?.name || 'none'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }} style={{ fontFamily: 'Oswald, sans-serif' }}
            className="text-[22px] font-bold text-white uppercase tracking-wider leading-tight">
            {selections.replica?.name || t(TR.kit.noReplica)}
          </motion.h2>
        </AnimatePresence>
        {selections.replica && (
          <p className="text-[11px] text-gray-600 mt-1 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>{selections.replica.brand}</p>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="relative">
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,80,10,0.2) 0%, transparent 70%)', width: '180px', height: '180px', margin: '-40px' }} />
          <div className="relative flex items-center justify-center"
            style={{ width: '100px', height: '100px', border: '1px solid rgba(212,80,10,0.3)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,80,10,0.08) 0%, transparent 70%)' }}>
            <Crosshair size={40} style={{ color: selections.replica ? '#D4500A' : 'rgba(255,255,255,0.1)' }} strokeWidth={1} />
            <div className="absolute inset-3 rounded-full" style={{ border: '1px solid rgba(212,80,10,0.15)' }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const sel = selections[step.id];
          const isCurrent = step.id === currentStepId;
          const StepIcon = step.Icon;
          return (
            <motion.div key={step.id} animate={isCurrent ? { borderColor: 'rgba(212,80,10,0.5)' } : {}}
              className="flex items-center gap-3 px-3 py-2.5"
              style={{ border: isCurrent ? '1px solid rgba(212,80,10,0.5)' : '1px solid rgba(255,255,255,0.05)', background: isCurrent ? 'rgba(212,80,10,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: '2px', transition: 'all 0.3s' }}>
              <StepIcon size={13} style={{ color: sel ? '#D4500A' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.3em] uppercase mb-0.5"
                  style={{ fontFamily: 'Oswald, sans-serif', color: isCurrent ? '#D4500A' : 'rgba(255,255,255,0.3)' }}>
                  {t(TR.kitSteps[i].label)}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p key={sel?.name || 'empty'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }} className="text-[11px] truncate"
                    style={{ fontFamily: 'Oswald, sans-serif', color: sel ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>
                    {sel ? sel.name : t(TR.kit.notSelected)}
                  </motion.p>
                </AnimatePresence>
              </div>
              {sel && (
                <span className="text-[10px] flex-shrink-0" style={{ color: '#D4500A', fontFamily: 'Oswald, sans-serif' }}>
                  {parseFloat(sel.price||0) === 0 ? t(TR.kit.free) : (
                    <span>€{parseFloat(sel.price||0).toFixed(2)} <span style={{ fontSize: '0.65em', opacity: 0.45 }}>/ {(parseFloat(sel.price||0) * 1.95583).toFixed(2)}лв.</span></span>
                  )}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Deploy screen ─────────────────────────────────────────────────────────────

function DeployScreen({ selections, total, onClose, t }) {
  const [phase, setPhase] = useState('scanning');
  useEffect(() => { const timer = setTimeout(() => setPhase('ready'), 2200); return () => clearTimeout(timer); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center px-6">
      {phase === 'scanning' ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mb-6">
            <Crosshair size={48} style={{ color: '#D4500A' }} strokeWidth={1} />
          </motion.div>
          <p style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[12px] tracking-[0.5em] text-[#D4500A] uppercase animate-pulse">
            {t(TR.kit.compiling)}
          </p>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,80,10,0.15)', border: '1px solid rgba(212,80,10,0.4)' }}>
              <Check size={28} style={{ color: '#D4500A' }} strokeWidth={2} />
            </div>
          </div>
          <p style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[11px] tracking-[0.4em] text-[#D4500A] uppercase mb-2">
            {t(TR.kit.compiled)}
          </p>
          <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[32px] sm:text-[40px] font-bold text-white uppercase tracking-wider mb-2">
            {t(TR.kit.kitReady)}
          </h2>
          <p className="text-[28px] font-bold mb-1" style={{ fontFamily: 'Oswald, sans-serif', color: '#D4500A' }}>€{total.toFixed(2)}</p>
          <p className="text-[14px] mb-6" style={{ fontFamily: 'Oswald, sans-serif', color: 'rgba(255,255,255,0.35)' }}>{(total * 1.95583).toFixed(2)} лв.</p>
          <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
            {STEPS.map((s) => selections[s.id] && (
              <div key={s.id} className="flex items-center gap-3">
                <Check size={11} style={{ color: '#D4500A', flexShrink: 0 }} strokeWidth={3} />
                <span className="text-[12px] text-gray-400">
                  <span style={{ fontFamily: 'Oswald, sans-serif', color: 'rgba(255,255,255,0.7)' }}>{selections[s.id].name}</span>
                  {' '}· {selections[s.id].brand}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onClose} className="flex items-center gap-2 px-8 py-3"
              style={{ background: '#D4500A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              <ShoppingBag size={15} />
              {t(TR.kit.addToCart)}
            </button>
            <button onClick={onClose}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 24px' }}>
              {t(TR.kit.continueShopping)}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KitBuilder({ onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selections, setSelections] = useState({});
  const [deployed, setDeployed] = useState(false);
  const t = useT();

  const currentStep = STEPS[step];
  const currentSel = selections[currentStep?.id];
  const total = Object.values(selections).reduce((sum, o) => sum + (o?.price || 0), 0);
  const isLast = step === STEPS.length - 1;

  const goNext = () => { if (!currentSel) return; if (isLast) { setDeployed(true); return; } setDirection(1); setStep((s) => s + 1); };
  const goPrev = () => { if (step === 0) return; setDirection(-1); setStep((s) => s - 1); };
  const select = (option) => setSelections((prev) => ({ ...prev, [currentStep.id]: option }));

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#050505' }}>
      {/* Scanline */}
      <motion.div animate={{ y: ['0%', '100%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,80,10,0.15), transparent)', top: 0 }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      {/* Corner brackets */}
      {['tl','tr','bl','br'].map((p) => (
        <div key={p} className="absolute" style={{ top: p.startsWith('t') ? 12 : 'auto', bottom: p.startsWith('b') ? 12 : 'auto', left: p.endsWith('l') ? 12 : 'auto', right: p.endsWith('r') ? 12 : 'auto', width: 24, height: 24, borderTop: p.startsWith('t') ? '2px solid rgba(212,80,10,0.4)' : 'none', borderBottom: p.startsWith('b') ? '2px solid rgba(212,80,10,0.4)' : 'none', borderLeft: p.endsWith('l') ? '2px solid rgba(212,80,10,0.4)' : 'none', borderRight: p.endsWith('r') ? '2px solid rgba(212,80,10,0.4)' : 'none' }} />
      ))}

      {/* Top bar */}
      <div className="flex items-center justify-between pl-6 sm:pl-10 pr-10 sm:pr-14 flex-shrink-0"
        style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <Crosshair size={18} style={{ color: '#D4500A' }} />
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[16px] font-bold tracking-[0.2em] text-white uppercase">
            AS<span style={{ color: '#D4500A' }}>WARRIOR</span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-gray-600 uppercase ml-2 hidden sm:inline"
            style={{ fontFamily: 'Oswald, sans-serif' }}>
            / {t(TR.kit.builderLabel)}
          </span>
        </div>

        {/* Step progress */}
        {!deployed && (
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }} className="flex items-center gap-1.5"
                  style={{ cursor: i < step ? 'pointer' : 'default' }}>
                  <div className="flex items-center justify-center"
                    style={{ width: 22, height: 22, border: i === step ? '1.5px solid #D4500A' : i < step ? '1.5px solid rgba(212,80,10,0.4)' : '1.5px solid rgba(255,255,255,0.12)', background: i === step ? 'rgba(212,80,10,0.15)' : i < step ? 'rgba(212,80,10,0.08)' : 'transparent', borderRadius: '2px', transition: 'all 0.3s' }}>
                    {i < step
                      ? <Check size={10} style={{ color: '#D4500A' }} strokeWidth={3} />
                      : <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: i === step ? '#D4500A' : 'rgba(255,255,255,0.2)' }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: i === step ? '#D4500A' : i < step ? 'rgba(212,80,10,0.5)' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', transition: 'color 0.3s' }}>
                    {t(TR.kitSteps[i].label)}
                  </span>
                </button>
                {i < STEPS.length - 1 && <div style={{ width: 16, height: 1, background: i < step ? 'rgba(212,80,10,0.4)' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-6">
          {!deployed && total > 0 && (
            <div className="text-right">
              <p className="text-[9px] tracking-[0.3em] text-gray-600 uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>{t(TR.kit.total)}</p>
              <p className="text-[16px] font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: '#D4500A' }}><PriceCounter value={total} /></p>
            </div>
          )}
          <button onClick={onClose} className="flex items-center justify-center"
            style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,80,10,0.5)'; e.currentTarget.style.color = '#D4500A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col flex-shrink-0 p-8 overflow-y-auto"
          style={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(212,80,10,0.03) 0%, transparent 40%)' }}>
          {!deployed && <LoadoutPanel selections={selections} currentStepId={currentStep?.id} t={t} />}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {deployed ? (
            <DeployScreen selections={selections} total={total} onClose={onClose} t={t} />
          ) : (
            <>
              {/* Step header */}
              <div className="px-6 sm:px-10 pt-8 pb-5 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-[0.4em] text-[#D4500A] uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {t(TR.kit.step)} {step + 1} {t(TR.kit.of)} {STEPS.length}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[28px] sm:text-[36px] font-bold text-white uppercase tracking-wider leading-none">
                      {t(TR.kitSteps[step].label)}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{t(TR.kitSteps[step].prompt)}</p>
                  </motion.div>
                </AnimatePresence>
                {/* Mobile progress bar */}
                <div className="flex items-center gap-1 mt-4 lg:hidden">
                  {STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 2, background: i <= step ? '#D4500A' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s', borderRadius: 1 }} />
                  ))}
                </div>
              </div>

              {/* Options grid */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.options.map((option) => (
                      <OptionCard key={option.id} option={option} selected={currentSel?.id === option.id} onSelect={select} freeLabel={t(TR.kit.free)} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom nav */}
              <div className="flex items-center justify-between px-6 sm:px-10 py-5 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={goPrev} disabled={step === 0} className="flex items-center gap-2"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', cursor: step === 0 ? 'not-allowed' : 'pointer', padding: '10px 20px', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'all 0.2s', borderRadius: '2px' }}
                  onMouseEnter={(e) => { if (step > 0) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'; }}>
                  <ChevronLeft size={14} />
                  {t(TR.kit.back)}
                </button>

                <div className="flex items-center gap-3">
                  {!currentSel && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-gray-600"
                      style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>
                      {t(TR.kit.selectOption)}
                    </motion.p>
                  )}
                  <motion.button onClick={goNext} disabled={!currentSel}
                    whileHover={currentSel ? { scale: 1.02 } : {}} whileTap={currentSel ? { scale: 0.98 } : {}}
                    className="flex items-center gap-2"
                    style={{ background: currentSel ? '#D4500A' : 'rgba(212,80,10,0.15)', border: currentSel ? '1px solid #D4500A' : '1px solid rgba(212,80,10,0.2)', color: currentSel ? '#fff' : 'rgba(212,80,10,0.3)', cursor: currentSel ? 'pointer' : 'not-allowed', padding: '10px 28px', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'all 0.25s', borderRadius: '2px' }}>
                    {isLast ? (
                      <><Zap size={14} />{t(TR.kit.deploy)}</>
                    ) : (
                      <>{t(TR.kit.next)}<ChevronRight size={14} /></>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
