import { motion } from 'framer-motion';
import { ExternalLink, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PARTNERS } from '../data/partners';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PartnerCard({ partner, index }) {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo area */}
      <div style={{
        height: 180,
        background: '#0f0f0f',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderRight: '1px solid rgba(212,80,10,0.2)', borderBottom: '1px solid rgba(212,80,10,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderLeft: '1px solid rgba(212,80,10,0.2)', borderTop: '1px solid rgba(212,80,10,0.2)', pointerEvents: 'none' }} />

        {partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            style={{ maxWidth: 200, maxHeight: 120, objectFit: 'contain' }}
          />
        ) : (
          /* Placeholder */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 72, height: 72,
              border: '1px solid rgba(212,80,10,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 28,
                fontWeight: 700,
                color: 'rgba(212,80,10,0.35)',
                letterSpacing: '0.05em',
              }}>
                {partner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 9,
              letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.15)',
              textTransform: 'uppercase',
            }}>
              {lang === 'bg' ? 'ЛОГО СКОРО' : 'LOGO COMING'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontFamily: 'Oswald, sans-serif',
          fontSize: 9,
          letterSpacing: '0.45em',
          color: '#D4500A',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          {partner.tagline}
        </p>

        <h2 style={{
          fontFamily: 'Oswald, sans-serif',
          fontSize: 26,
          fontWeight: 700,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1,
          marginBottom: 16,
        }}>
          {partner.name}
        </h2>

        <div style={{ width: 32, height: 2, background: '#D4500A', marginBottom: 18 }} />

        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.75,
          flex: 1,
          marginBottom: 28,
        }}>
          {partner.description}
        </p>

        {/* Website button */}
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            border: '1px solid rgba(212,80,10,0.45)',
            color: '#D4500A',
            textDecoration: 'none',
            fontFamily: 'Oswald, sans-serif',
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
            transition: 'all .18s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#D4500A';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#D4500A';
          }}
        >
          <ExternalLink size={13} />
          {lang === 'bg' ? 'Посети сайта' : 'Visit Website'}
        </a>
      </div>
    </motion.div>
  );
}

export default function PartnersPage() {
  const { lang } = useLanguage();

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />

      {/* Hero header */}
      <div style={{ paddingTop: 128, paddingBottom: 60, background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        {/* Background grid */}
        <div className="absolute inset-0 dot-grid opacity-[0.08] pointer-events-none" />

        {/* Accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D4500A 40%, transparent)' }} />

        <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 48px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Link to="/" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textTransform: 'uppercase' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4500A'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              {lang === 'bg' ? 'Начало' : 'Home'}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              {lang === 'bg' ? 'Партньори' : 'Partners'}
            </span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, border: '1px solid rgba(212,80,10,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Handshake size={18} style={{ color: '#D4500A' }} strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.5em', color: '#D4500A', textTransform: 'uppercase' }}>
                {lang === 'bg' ? 'ОФИЦИАЛНИ ПАРТНЬОРИ' : 'OFFICIAL PARTNERS'}
              </p>
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1, marginBottom: 18 }}>
              {lang === 'bg' ? 'НАШИТЕ' : 'OUR'}{' '}
              <span style={{ color: '#D4500A' }}>{lang === 'bg' ? 'ПАРТНЬОРИ' : 'PARTNERS'}</span>
            </h1>

            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 560, lineHeight: 1.7 }}>
              {lang === 'bg'
                ? 'Горди сме да работим с утвърдени компании, които споделят нашите ценности — качество, надеждност и страст към airsoft.'
                : 'We are proud to work with established companies that share our values — quality, reliability, and passion for airsoft.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Partner cards */}
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '64px 48px 100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {PARTNERS.map((partner, i) => (
            <PartnerCard key={partner.id} partner={partner} index={i} />
          ))}
        </div>

        {/* Bottom CTA — become a partner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            marginTop: 80,
            padding: '48px',
            border: '1px solid rgba(212,80,10,0.2)',
            background: 'rgba(212,80,10,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.45em', color: '#D4500A', textTransform: 'uppercase', marginBottom: 8 }}>
              {lang === 'bg' ? 'ЗАИНТЕРЕСОВАН?' : 'INTERESTED?'}
            </p>
            <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {lang === 'bg' ? 'СТАНИ НАШ ПАРТНЬОР' : 'BECOME OUR PARTNER'}
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 480, lineHeight: 1.65 }}>
              {lang === 'bg'
                ? 'Ако имате продукти или услуги, подходящи за нашата общност, свържете се с нас — заедно можем да изградим нещо страхотно.'
                : 'If you have products or services suited for our community, get in touch — together we can build something great.'}
            </p>
          </div>
          <a
            href="mailto:info@aswarrior.bg"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 32px',
              background: '#D4500A',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              flexShrink: 0,
              transition: 'background .18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b83d08'}
            onMouseLeave={e => e.currentTarget.style.background = '#D4500A'}
          >
            {lang === 'bg' ? 'СВЪРЖИ СЕ С НАС' : 'CONTACT US'}
          </a>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
