import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PARTNERS } from '../data/partners';
import { useLanguage } from '../context/LanguageContext';

/* Duplicate logos so the seam is invisible */
const TRACK = [...PARTNERS, ...PARTNERS, ...PARTNERS];

const LOGO_W = 220;  // px per logo cell
const GAP    = 40;
const CELL   = LOGO_W + GAP;
const SPEED  = 60; // px / second

function LogoPlaceholder({ name }) {
  return (
    <div style={{
      width: LOGO_W,
      height: 64,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'Oswald, sans-serif',
        fontSize: 14,
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
      }}>
        {name}
      </span>
    </div>
  );
}

function LogoImage({ partner }) {
  return (
    <div style={{ width: LOGO_W, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img
        src={partner.logo}
        alt={partner.name}
        style={{
          maxWidth: LOGO_W - 24,
          maxHeight: 52,
          objectFit: 'contain',
          filter: 'grayscale(100%) brightness(0.55)',
          transition: 'filter .25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) brightness(1)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(100%) brightness(0.55)'; }}
      />
    </div>
  );
}

export default function PartnersStrip() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const xRef = useRef(0);
  const x = useMotionValue(0);
  const totalWidth = PARTNERS.length * CELL;
  const hovered = useRef(false);

  useAnimationFrame((_, delta) => {
    if (hovered.current) return;
    xRef.current -= (delta / 1000) * SPEED;
    if (xRef.current <= -totalWidth) xRef.current += totalWidth;
    x.set(xRef.current);
  });

  return (
    <section
      onClick={() => navigate('/partners')}
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => { hovered.current = false; }}
      style={{
        position: 'relative',
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Left label */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 180,
        background: 'linear-gradient(to right, #0a0a0a 70%, transparent)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 36,
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.5em', color: '#D4500A', textTransform: 'uppercase', marginBottom: 3 }}>
            {lang === 'bg' ? 'НАШИ' : 'OUR'}
          </p>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700 }}>
            {lang === 'bg' ? 'ПАРТНЬОРИ' : 'PARTNERS'}
          </p>
        </div>
      </div>

      {/* Right fade + "view all" hint */}
      <div style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: 160,
        background: 'linear-gradient(to left, #0a0a0a 60%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 32,
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
            {lang === 'bg' ? 'Виж всички' : 'View all'}
          </span>
          <ExternalLink size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>

      {/* Scrolling track */}
      <div style={{ paddingLeft: 200, paddingRight: 160, paddingTop: 24, paddingBottom: 24, overflow: 'hidden' }}>
        <motion.div
          style={{
            x,
            display: 'flex',
            gap: GAP,
            width: 'max-content',
          }}
        >
          {TRACK.map((partner, i) => (
            <div key={`${partner.id}-${i}`} style={{ flexShrink: 0 }}>
              {partner.logo
                ? <LogoImage partner={partner} />
                : <LogoPlaceholder name={partner.name} />
              }
            </div>
          ))}
        </motion.div>
      </div>

      {/* Full-width hover highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(212,80,10,0.03)',
          pointerEvents: 'none',
          transition: 'opacity .2s',
        }}
      />
    </section>
  );
}
