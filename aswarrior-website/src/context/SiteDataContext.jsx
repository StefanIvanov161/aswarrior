import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const DEFAULT_DATA = {
  heroSlides: [
    {
      id: 0,
      tag: 'NEW SEASON DROP — SS26',          tag_bg: 'НОВА СЕЗОННА КОЛЕКЦИЯ — ЛЯ26',
      headline: ['DOMINATE', 'THE FIELD'],    headline_bg: ['ДОМИНИРАЙ', 'НА ТЕРЕНА'],
      accentWord: 1,
      sub: 'Elite airsoft rifles, tactical loadouts, and premium gear engineered for operators who refuse second place.',
      sub_bg: 'Елитни ейрсофт пушки, тактически комплекти и висококачествено оборудване, проектирано за оператори, които не приемат второ място.',
      cta: 'Shop the Arsenal',                cta_bg: 'Разгледай Арсенала',
    },
    {
      id: 1,
      tag: 'CQB SPECIALIST KIT',              tag_bg: 'CQB СПЕЦИАЛИСТ КИТ',
      headline: ['GEAR UP.', 'STRIKE HARD.'], headline_bg: ['ЕКИПИРАЙ СЕ.', 'УДРЯЙ СИЛНО.'],
      accentWord: 1,
      sub: 'Full tactical loadouts purpose-built for CQB, woodland, and long-range engagements. Dominate every environment.',
      sub_bg: 'Пълни тактически комплекти, специално изградени за CQB, гора и далечни разстояния. Доминирай на всеки терен.',
      cta: 'View Loadouts',                   cta_bg: 'Виж Комплектите',
    },
    {
      id: 2,
      tag: 'PRECISION OPTICS LINE',           tag_bg: 'ЛИНИЯ ПРЕЦИЗНА ОПТИКА',
      headline: ['ZERO IN ON', 'VICTORY.'],   headline_bg: ['ФОКУСИРАЙ СЕ', 'ВЪРХУ ПОБЕДАТА.'],
      accentWord: 1,
      sub: 'Top-tier scopes, red-dot sights, and IR laser targeting. Because the first shot is all that matters.',
      sub_bg: 'Топ оптика, колиматорни мерници и IR лазерна насочваща система. Защото само първият изстрел има значение.',
      cta: 'Shop Optics',                     cta_bg: 'Купи Оптика',
    },
  ],
  categories: [
    { id: 'rifles',   label: 'Rifles',        label_bg: 'Пушки',                    sub: 'AEG · GBB · HPA',            sub_bg: 'AEG · GBB · HPA',                    icon: 'Crosshair', color: '#D4500A' },
    { id: 'pistols',  label: 'Pistols',        label_bg: 'Пистолети',                sub: 'GBB · CO₂ · AEP',            sub_bg: 'GBB · CO₂ · AEP',                    icon: 'Target',    color: '#C8921A' },
    { id: 'tactical', label: 'Tactical Gear',  label_bg: 'Тактическа Екипировка',    sub: 'Vests · Pouches · Packs',    sub_bg: 'Елеци · Чанти · Раници',             icon: 'Shield',    color: '#6B8E4E' },
    { id: 'optics',   label: 'Optics',         label_bg: 'Оптика',                   sub: 'Scopes · Red Dots · Lasers', sub_bg: 'Оптика · Колиматори · Лазери',       icon: 'Eye',       color: '#D4500A' },
    { id: 'apparel',  label: 'Apparel',         label_bg: 'Облекло',                  sub: 'BDU · Camo · Boots',         sub_bg: 'BDU · Камуфлаж · Обувки',            icon: 'Shirt',     color: '#888888' },
    { id: 'ammo',     label: 'BBs & Ammo',     label_bg: 'Кулички и Амуниция',       sub: '.20g · .25g · .28g · Bio',   sub_bg: '.20g · .25g · .28g · Bio',           icon: 'Circle',    color: '#C8921A' },
    { id: 'upgrades', label: 'Upgrades',       label_bg: 'Надграждания',              sub: 'Barrels · Hopups · MOSFETs', sub_bg: 'Цеви · Hop-up · MOSFET',             icon: 'Wrench',    color: '#7B7B7B' },
  ],
  banners: [
    {
      id: 'cqb',
      title: 'CQB LOADOUTS',              title_bg: 'CQB КОМПЛЕКТИ',
      sub: 'Close-quarters. No mercy.',   sub_bg: 'На близко разстояние. Без пощада.',
      body: 'Compact rifles, light vests, and speed holsters for urban combat dominance.',
      body_bg: 'Компактни пушки, леки елеци и бързи кобури за доминация в градски бой.',
      cta: 'Build Your Kit',              cta_bg: 'Построй Своя Kit',
      tag: 'CLOSE QUARTERS',             tag_bg: 'НА БЛИЗКО',
      imgSeed: '10', accentColor: '#D4500A', gradientDir: 'to right',
    },
    {
      id: 'sniper',
      title: 'SNIPER KITS',               title_bg: 'СНАЙПЕРСКИ КОМПЛЕКТИ',
      sub: 'One shot. One kill.',         sub_bg: 'Един изстрел. Един убит.',
      body: 'High-powered VSR builds, ghillie systems, and long-range optic packages.',
      body_bg: 'Мощни VSR конфигурации, гили системи и пакети с оптика за далечни разстояния.',
      cta: 'Gear Up',                     cta_bg: 'Екипирай Се',
      tag: 'LONG RANGE',                 tag_bg: 'ДАЛЕЧНИ РАЗСТОЯНИЯ',
      imgSeed: '20', accentColor: '#6B8E4E', gradientDir: 'to left',
    },
    {
      id: 'nightops',
      title: 'NIGHT OPS',                 title_bg: 'НОЩНИ ОПЕРАЦИИ',
      sub: 'Darkness is your cover.',     sub_bg: 'Тъмнината е твоето прикритие.',
      body: 'IR-compatible gear, blacked-out hardware, and suppressor-ready builds for low-light dominance.',
      body_bg: 'IR-съвместимо оборудване, изцяло черни компоненти и конфигурации с заглушители за доминация при слаба осветеност.',
      cta: 'Go Dark',                     cta_bg: 'Влез в Тъмнината',
      tag: 'STEALTH',                    tag_bg: 'СКРИТО ДЕЙСТВИЕ',
      imgSeed: '55', accentColor: '#4A7BA8', gradientDir: 'to right',
    },
  ],
  settings: {
    storeName: 'AS WARRIOR',
    tagline: 'Dominate the field.',
    accentColor: '#D4500A',
    adminPassword: 'admin123',
  },
  editorsPicks: [],
};

// Keys that live in localStorage (CMS-managed content)
const LOCAL_KEYS = ['heroSlides', 'categories', 'banners', 'settings', 'editorsPicks'];

function loadLocal() {
  try {
    const saved = localStorage.getItem('aswarrior_cms');
    if (saved) {
      const parsed = JSON.parse(saved);
      const out = {};
      LOCAL_KEYS.forEach((k) => { if (parsed[k]) out[k] = parsed[k]; });
      return out;
    }
  } catch {}
  return {};
}

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(() => ({ ...DEFAULT_DATA, ...loadLocal(), products: [] }));
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Fetch all products from the API on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        // Fetch all pages
        const first = await fetch(`${API}/api/products?limit=100&page=1&all=1`).then(r => r.json());
        const total = first.total;
        const pages = Math.ceil(total / 100);
        let all = [...first.products];

        if (pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: pages - 1 }, (_, i) =>
              fetch(`${API}/api/products?limit=100&page=${i + 2}&all=1`).then(r => r.json())
            )
          );
          rest.forEach(r => { all = all.concat(r.products); });
        }

        if (!cancelled) {
          setData(prev => ({ ...prev, products: all }));
          setProductsError(null);
        }
      } catch (err) {
        if (!cancelled) setProductsError(err.message);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // Save a single product update to the API
  const updateProduct = useCallback(async (id, fields) => {
    const res = await fetch(`${API}/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? updated : p),
    }));
    return updated;
  }, []);

  // Create a new product
  const createProduct = useCallback(async (fields) => {
    const res = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(await res.text());
    const created = await res.json();
    setData(prev => ({ ...prev, products: [created, ...prev.products] }));
    return created;
  }, []);

  // Delete a product
  const deleteProduct = useCallback(async (id) => {
    await fetch(`${API}/api/products/${id}`, { method: 'DELETE' });
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  }, []);

  // Update localStorage-backed CMS content (heroSlides, categories, banners, settings)
  const update = useCallback((key, value) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      try {
        const toSave = {};
        LOCAL_KEYS.forEach(k => { toSave[k] = next[k]; });
        localStorage.setItem('aswarrior_cms', JSON.stringify(toSave));
      } catch {}
      return next;
    });
  }, []);

  const updateNested = useCallback((key, subKey, value) => {
    setData((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [subKey]: value } };
      try {
        const toSave = {};
        LOCAL_KEYS.forEach(k => { toSave[k] = next[k]; });
        localStorage.setItem('aswarrior_cms', JSON.stringify(toSave));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem('aswarrior_cms');
    setData(prev => ({ ...DEFAULT_DATA, products: prev.products }));
  }, []);

  // Update a single product in-memory after an external PATCH (no extra network call)
  const syncProduct = useCallback((updated) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updated.id ? updated : p),
    }));
  }, []);

  return (
    <SiteDataContext.Provider value={{
      data, update, updateNested, reset,
      updateProduct, createProduct, deleteProduct, syncProduct,
      productsLoading, productsError,
      apiUrl: API,
    }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);
