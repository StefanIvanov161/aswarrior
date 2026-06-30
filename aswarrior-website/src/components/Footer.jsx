import { motion } from 'framer-motion';
import { Crosshair, Camera, Video, X, Mail, ArrowRight } from 'lucide-react';
import { useT } from '../context/LanguageContext';
import { TR } from '../translations';

const SOCIALS = [
  { Icon: Camera, label: 'Instagram' },
  { Icon: Video,  label: 'YouTube' },
  { Icon: X,      label: 'X / Twitter' },
];

export default function Footer() {
  const t = useT();

  const LINKS = {
    [t(TR.footer.shopTitle)]:  [t(TR.footer.shopRifles), t(TR.footer.shopPistols), t(TR.footer.shopGear), t(TR.footer.shopOptics), t(TR.footer.shopApparel), t(TR.footer.shopAmmo)],
    [t(TR.footer.suppTitle)]:  [t(TR.footer.suppFaq), t(TR.footer.suppShipping), t(TR.footer.suppTrack), t(TR.footer.suppSize), t(TR.footer.suppWarranty)],
    [t(TR.footer.compTitle)]:  [t(TR.footer.compAbout), t(TR.footer.compPress), t(TR.footer.compCareers), t(TR.footer.compWholesale), t(TR.footer.compBlog)],
  };

  return (
    <footer className="bg-[#0a0a0a] mt-0 mx-3 sm:mx-6 lg:mx-12">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4500A]/60 to-transparent" />

      <div style={{ paddingLeft: 'clamp(1.5rem, 12%, 14rem)', paddingRight: 'clamp(1.5rem, 8%, 8rem)' }}>
        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pt-16 sm:pt-20 pb-14 sm:pb-16 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="inline-flex items-center gap-2 mb-6">
              <Crosshair size={20} className="text-[#D4500A]" />
              <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[20px] font-bold tracking-[0.2em] text-white uppercase">
                AS<span className="text-[#D4500A]">WARRIOR</span>
              </span>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[260px] mb-8">{t(TR.footer.brand)}</p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#D4500A] hover:border-[#D4500A]/40 transition-all duration-200">
                  <Icon size={14} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[11px] tracking-[0.35em] text-[#D4500A] uppercase font-medium mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200 leading-relaxed">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="py-12 sm:py-14 border-b border-white/[0.06]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={14} className="text-[#D4500A]" />
                <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[10px] tracking-[0.35em] text-[#D4500A] uppercase">
                  {t(TR.footer.newsletterTag)}
                </span>
              </div>
              <h4 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[20px] sm:text-[24px] font-bold text-white uppercase tracking-wider leading-tight mb-2">
                {t(TR.footer.newsletterH)}
              </h4>
              <p className="text-gray-500 text-sm">{t(TR.footer.newsletterSub)}</p>
            </div>
            <div className="flex w-full lg:w-auto lg:max-w-md">
              <input type="email" placeholder={t(TR.footer.emailPlaceholder)}
                className="flex-1 min-w-0 px-4 py-3 bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-[#D4500A]/50 transition-colors" />
              <button className="btn-sweep flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[#D4500A] text-white hover:bg-[#b83d08] transition-colors">
                <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[12px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap">
                  {t(TR.footer.enlist)}
                </span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs">{t(TR.footer.copyright)}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[t(TR.footer.privacy), t(TR.footer.terms), t(TR.footer.cookies)].map((item) => (
              <a key={item} href="#" className="text-gray-700 hover:text-gray-500 text-xs transition-colors duration-200">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
