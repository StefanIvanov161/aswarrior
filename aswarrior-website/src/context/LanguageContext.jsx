import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangRaw] = useState(() => localStorage.getItem('aswarrior_lang') || 'bg');
  const setLang = (l) => {
    setLangRaw(l);
    localStorage.setItem('aswarrior_lang', l);
  };
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Returns a translator function: t({ bg: '...', en: '...' }) → picks current lang
export function useT() {
  const { lang } = useLanguage();
  return (obj) => (obj ? (obj[lang] ?? obj.en) : '') ?? '';
}
