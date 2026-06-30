import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, SlidersHorizontal, X, Package, Crosshair, Shield, Wrench, Radio, Target, ChevronDown } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EUR_BGN = 1.95583;

const CATEGORY_THEMES = {
  'Реплики':                   { gradA:'#3d1508', gradB:'#200a04', icon:Crosshair, iconColor:'#D4500A' },
  'Оборудване за оръжия':      { gradA:'#2e1a06', gradB:'#1a0f03', icon:Wrench,    iconColor:'#C8921A' },
  'Екипировка':                { gradA:'#102210', gradB:'#091508', icon:Shield,    iconColor:'#6B8E4E' },
  'Аксесоари за екипировка':   { gradA:'#1e1c08', gradB:'#121006', icon:Package,   iconColor:'#A89040' },
  'Комуникация':               { gradA:'#0e1828', gradB:'#080f1a', icon:Radio,     iconColor:'#4A7BA8' },
};
const DEFAULT_THEME = { gradA:'#1e1a10', gradB:'#12100a', icon:Target, iconColor:'#888' };

// Characteristic keys to use as filters per parent category
const PARENT_FILTER_KEYS = {
  'Реплики':               ['Тип на задвижването', 'Цвят', 'Материал на тялото'],
  'Оборудване за оръжия':  ['Тип', 'Съвместимост', 'Цвят', 'Материал'],
  'Екипировка':            ['Материал', 'Цвят / Камуфлаж', 'Налични размери'],
  'Аксесоари за екипировка':['Тип', 'Материал', 'Цвят'],
  'Комуникация':           ['Тип'],
};

function decodeHtml(str) {
  if (!str) return str;
  const el = document.createElement('textarea');
  el.innerHTML = str; return el.value;
}

function parseChars(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch { return []; }
}

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

function getCharValue(product, key) {
  const chars = parseChars(product.characteristics);
  return chars.find(r => r.key === key)?.value?.trim() || '';
}

// ─── Sub-filter category button ────────────────────────────────────────────
function SubFilterBtn({ label, count, active, onClick, image, lang, isAll }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} whileTap={{ scale: 0.97 }}
      style={{ position:'relative', height:140, minWidth:170, flex:'1 1 170px', maxWidth:280,
        background:active?'rgba(212,80,10,0.1)':'#141414',
        border:`2px solid ${active?'#D4500A':hovered?'rgba(212,80,10,0.3)':'rgba(255,255,255,0.07)'}`,
        cursor:'pointer', overflow:'hidden', transition:'border-color .18s, background .18s',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', padding:'0 16px 14px', textAlign:'center' }}>
      {image ? (
        <img src={image} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:'12px 20px 40px', opacity:active?0.45:hovered?0.32:0.22, transition:'opacity .18s', pointerEvents:'none' }} onError={e=>{e.target.style.display='none';}}/>
      ) : (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-60%)', opacity:active?0.4:hovered?0.25:0.15, transition:'opacity .18s', pointerEvents:'none' }}>
          {isAll?<Crosshair size={42} style={{color:'#D4500A'}} strokeWidth={0.8}/>:<Package size={42} style={{color:'rgba(255,255,255,0.5)'}} strokeWidth={0.7}/>}
        </div>
      )}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:active?'#D4500A':'transparent', transition:'background .18s' }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <p style={{ fontFamily:'Oswald, sans-serif', fontSize:12, letterSpacing:'0.18em', color:active?'#fff':hovered?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1.25, marginBottom:4, transition:'color .18s' }}>{label}</p>
        <p style={{ fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.3em', color:active?'#D4500A':'rgba(255,255,255,0.25)', transition:'color .18s' }}>{count} {lang==='bg'?'бр.':'pcs.'}</p>
      </div>
    </motion.button>
  );
}

// ─── Product card ───────────────────────────────────────────────────────────
function ProductCard({ product, lang, index }) {
  const navigate = useNavigate();
  const eur = parseFloat(product.price || 0);
  const bgn = (eur * EUR_BGN).toFixed(2);
  const oldEur = parseFloat(product.old_price || 0);
  const outOfStock = (product.track_stock ?? true) && (product.stock_quantity ?? 1) === 0;
  const theme = CATEGORY_THEMES[product.category_parent] || DEFAULT_THEME;
  const ThemeIcon = theme.icon;

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:Math.min(index*0.025,0.4) }}
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ background:'#181818', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', display:'flex', flexDirection:'column', transition:'border-color .18s, transform .18s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(212,80,10,0.4)';e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='translateY(0)';}}>
      <div style={{ height:200, background:`radial-gradient(ellipse 85% 80% at 50% 50%, #28221a 0%, #1e1810 35%, ${theme.gradA} 70%, ${theme.gradB} 100%)`, overflow:'hidden', position:'relative', flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`repeating-linear-gradient(-45deg, transparent, transparent 40px, ${theme.iconColor}28 40px, ${theme.iconColor}28 46px)`, maskImage:'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 40%, black 80%)', WebkitMaskImage:'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 40%, black 80%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:`radial-gradient(circle, ${theme.iconColor}18 0%, transparent 70%)`, border:`1px solid ${theme.iconColor}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ThemeIcon size={28} style={{ color:theme.iconColor, opacity:0.22 }} strokeWidth={1.2}/>
          </div>
        </div>
        {product.image_url && (
          <img src={product.image_url} alt={product.name}
            style={{ position:'absolute', inset:0, zIndex:10, width:'100%', height:'100%', objectFit:'contain', padding:product.image_url?.startsWith('/processed/')?10:4 }}
            onError={e=>{e.target.style.display='none';}}/>
        )}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:64, background:'linear-gradient(to top, #181818 0%, transparent 100%)', pointerEvents:'none', zIndex:2 }}/>
        <div style={{ position:'absolute', top:10, left:10, display:'flex', flexDirection:'column', gap:4, zIndex:3 }}>
          {product.badge_text && <span style={{ background:product.badge_color||'#D4500A', padding:'3px 8px', fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.25em', color:'#fff', textTransform:'uppercase' }}>{product.badge_text}</span>}
          {product.on_promotion&&!product.badge_text && <span style={{ background:'#D4500A', padding:'3px 8px', fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.25em', color:'#fff', textTransform:'uppercase' }}>{lang==='bg'?'ПРОМО':'SALE'}</span>}
          {product.is_new && <span style={{ background:'#C8921A', padding:'3px 8px', fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.25em', color:'#fff', textTransform:'uppercase' }}>NEW</span>}
        </div>
        {outOfStock && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:11 }}>
            <span style={{ fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:'0.3em', color:'rgba(255,255,255,0.45)', textTransform:'uppercase' }}>{lang==='bg'?'ИЗЧЕРПАН':'OUT OF STOCK'}</span>
          </div>
        )}
      </div>
      <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', flex:1 }}>
        <p style={{ fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.3em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:5 }}>{product.brand||product.category}</p>
        <p style={{ fontFamily:'Oswald, sans-serif', fontSize:14, letterSpacing:'0.06em', color:'#fff', textTransform:'uppercase', lineHeight:1.3, flex:1, fontWeight:600 }}>{decodeHtml(product.name)}</p>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8, marginTop:14 }}>
          <div>
            <div style={{ fontFamily:'Oswald, sans-serif', fontSize:20, fontWeight:700, color:'#D4500A', lineHeight:1 }}>€{eur.toFixed(2)}</div>
            <div style={{ fontFamily:'Oswald, sans-serif', fontSize:10, color:'rgba(255,255,255,0.28)', marginTop:2 }}>{bgn} лв.</div>
            {oldEur>0 && <div style={{ fontFamily:'Oswald, sans-serif', fontSize:11, color:'rgba(255,255,255,0.2)', textDecoration:'line-through', marginTop:1 }}>€{oldEur.toFixed(2)}</div>}
          </div>
          <button onClick={e=>{e.stopPropagation();}} disabled={outOfStock}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 13px', background:outOfStock?'rgba(255,255,255,0.04)':'#D4500A', border:'none', cursor:outOfStock?'not-allowed':'pointer', color:outOfStock?'rgba(255,255,255,0.25)':'#fff', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', flexShrink:0, transition:'background .15s' }}
            onMouseEnter={e=>{if(!outOfStock)e.currentTarget.style.background='#b83d08';}}
            onMouseLeave={e=>{if(!outOfStock)e.currentTarget.style.background='#D4500A';}}>
            <ShoppingBag size={12}/>{lang==='bg'?'Добави':'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter group (collapsible) ─────────────────────────────────────────────
function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:16, marginBottom:16 }}>
      <button onClick={()=>setOpen(p=>!p)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'transparent', border:'none', cursor:'pointer', padding:'0 0 10px', color:'rgba(255,255,255,0.55)' }}>
        <span style={{ fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase' }}>{title}</span>
        <ChevronDown size={13} style={{ color:'rgba(255,255,255,0.3)', transform:open?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}/>
      </button>
      {open && children}
    </div>
  );
}

// ─── Checkbox filter option ──────────────────────────────────────────────────
function FilterOption({ label, count, checked, onChange }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'3px 0' }}
      onMouseEnter={e=>e.currentTarget.style.color='#fff'}
      onMouseLeave={e=>e.currentTarget.style.color=''}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}
        style={{ accentColor:'#D4500A', width:13, height:13, cursor:'pointer', flexShrink:0 }}/>
      <span style={{ fontFamily:'Inter, sans-serif', fontSize:12, color:checked?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.5)', flex:1, transition:'color .12s' }}>{label}</span>
      {count != null && <span style={{ fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.15em', color:'rgba(255,255,255,0.22)' }}>{count}</span>}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ShopPage() {
  const { data, productsLoading } = useSiteData();
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();

  const catsParam = searchParams.get('cats');
  const pageTitle = searchParams.get('name') || (lang==='bg'?'Всички Продукти':'All Products');
  const cats = useMemo(()=>(catsParam?catsParam.split(',').map(c=>c.trim()):[]),[catsParam]);

  const [activeCat,   setActiveCat]   = useState(null);
  const [sort,        setSort]        = useState('default');
  const [brandFilter, setBrandFilter] = useState([]); // array for multi-select
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPromo,   setOnlyPromo]   = useState(false);
  const [priceMin,    setPriceMin]    = useState('');
  const [priceMax,    setPriceMax]    = useState('');
  const [charFilters, setCharFilters] = useState({}); // { 'Тип на задвижването': ['AEG','GBB'] }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(()=>typeof window!=='undefined'&&window.innerWidth<900);

  useEffect(()=>{
    setActiveCat(null);
    setCharFilters({});
    setBrandFilter([]);
    setPriceMin(''); setPriceMax('');
  },[catsParam]);

  useEffect(()=>{
    const handle=()=>setIsMobile(window.innerWidth<900);
    window.addEventListener('resize',handle);
    return()=>window.removeEventListener('resize',handle);
  },[]);

  // ── Base list (for filter option counting) ──
  const baseList = useMemo(()=>{
    let list = (data.products||[]).filter(p=>!p.hidden);
    if (activeCat) list = list.filter(p=>p.category===activeCat);
    else if (cats.length>0) list = list.filter(p=>cats.includes(p.category));
    return list;
  },[data.products,cats,activeCat]);

  // ── Detect parent category ──
  const mainParent = useMemo(()=>{
    const parents = [...new Set(baseList.map(p=>p.category_parent).filter(Boolean))];
    return parents[0] || '';
  },[baseList]);

  // ── Dynamic filter groups ──
  const filterGroups = useMemo(()=>{
    const keys = PARENT_FILTER_KEYS[mainParent] || [];
    const groups = [];

    keys.forEach(key=>{
      const valMap = {}; // value → count
      baseList.forEach(p=>{
        const val = getCharValue(p, key);
        if (val) valMap[val] = (valMap[val]||0)+1;
      });
      const values = Object.keys(valMap).sort();
      if (values.length >= 2) groups.push({ key, values, valMap });
    });

    // For Реплики also pull power_source from specs field
    if (mainParent==='Реплики') {
      const valMap={};
      baseList.forEach(p=>{
        const s=parseSpecs(p.specs);
        const v=s.power_source?.trim();
        if(v) valMap[v]=(valMap[v]||0)+1;
      });
      const values=Object.keys(valMap).sort();
      if(values.length>=2 && !groups.find(g=>g.key==='Тип на задвижването')){
        groups.unshift({key:'Тип на задвижването',values,valMap,fromSpecs:true});
      }
    }

    return groups;
  },[baseList,mainParent]);

  // ── Brands ──
  const brands = useMemo(()=>{
    const valMap={};
    baseList.forEach(p=>{if(p.brand){valMap[p.brand]=(valMap[p.brand]||0)+1;}});
    return Object.entries(valMap).sort((a,b)=>a[0].localeCompare(b[0]));
  },[baseList]);

  // ── Price bounds ──
  const priceBounds = useMemo(()=>{
    const prices=baseList.map(p=>parseFloat(p.price||0)).filter(n=>n>0);
    if(!prices.length) return {min:0,max:9999};
    return {min:Math.floor(Math.min(...prices)),max:Math.ceil(Math.max(...prices))};
  },[baseList]);

  // ── Active filter count ──
  const activeFilterCount = useMemo(()=>{
    let n=0;
    if(brandFilter.length)n+=brandFilter.length;
    if(onlyInStock)n++;
    if(onlyPromo)n++;
    if(priceMin||priceMax)n++;
    Object.values(charFilters).forEach(arr=>{n+=arr.length;});
    return n;
  },[brandFilter,onlyInStock,onlyPromo,priceMin,priceMax,charFilters]);

  const clearAll=()=>{setBrandFilter([]);setOnlyInStock(false);setOnlyPromo(false);setPriceMin('');setPriceMax('');setCharFilters({});};

  const toggleCharFilter=(key,val)=>{
    setCharFilters(prev=>{
      const cur=prev[key]||[];
      const next=cur.includes(val)?cur.filter(v=>v!==val):[...cur,val];
      return next.length?{...prev,[key]:next}:Object.fromEntries(Object.entries(prev).filter(([k])=>k!==key));
    });
  };

  // ── Per-category sub-filter ──
  const catMeta = useMemo(()=>{
    const allProds=(data.products||[]).filter(p=>!p.hidden);
    return cats.map(cat=>{
      const catProds=allProds.filter(p=>p.category===cat);
      return {cat, count:catProds.length, image:catProds.find(p=>p.image_url)?.image_url??null};
    });
  },[data.products,cats]);

  const totalCatCount=useMemo(()=>catMeta.reduce((s,m)=>s+m.count,0),[catMeta]);

  // ── Final visible products ──
  const visibleProducts = useMemo(()=>{
    let list=baseList;

    if(brandFilter.length) list=list.filter(p=>brandFilter.includes(p.brand));
    if(onlyInStock) list=list.filter(p=>!(p.track_stock??true)||(p.stock_quantity??1)>0);
    if(onlyPromo)   list=list.filter(p=>p.on_promotion);

    const minP=parseFloat(priceMin);
    const maxP=parseFloat(priceMax);
    if(!isNaN(minP)&&priceMin!=='') list=list.filter(p=>parseFloat(p.price||0)>=minP);
    if(!isNaN(maxP)&&priceMax!=='') list=list.filter(p=>parseFloat(p.price||0)<=maxP);

    // Characteristic filters
    Object.entries(charFilters).forEach(([key,vals])=>{
      if(!vals.length) return;
      list=list.filter(p=>{
        // Check characteristics array
        const charVal=getCharValue(p,key);
        if(charVal&&vals.includes(charVal)) return true;
        // For 'Тип на задвижването' also check specs.power_source
        if(key==='Тип на задвижването'){
          const s=parseSpecs(p.specs);
          if(s.power_source&&vals.includes(s.power_source.trim())) return true;
        }
        return false;
      });
    });

    if(sort==='price_asc')  return [...list].sort((a,b)=>parseFloat(a.price)-parseFloat(b.price));
    if(sort==='price_desc') return [...list].sort((a,b)=>parseFloat(b.price)-parseFloat(a.price));
    if(sort==='newest')     return [...list].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return list;
  },[baseList,brandFilter,onlyInStock,onlyPromo,priceMin,priceMax,charFilters,sort]);

  const showSubFilter=cats.length>1;

  // ── Sidebar content ──
  const sidebarContent = (
    <div style={{ width:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <span style={{ fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:'0.35em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>
          {lang==='bg'?'Филтри':'Filters'}
          {activeFilterCount>0&&<span style={{ marginLeft:7, background:'#D4500A', color:'#fff', borderRadius:10, padding:'1px 6px', fontSize:9, fontFamily:'Oswald, sans-serif', letterSpacing:'0.1em' }}>{activeFilterCount}</span>}
        </span>
        {activeFilterCount>0&&(
          <button onClick={clearAll} style={{ background:'transparent', border:'none', color:'#D4500A', cursor:'pointer', fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase' }}>
            {lang==='bg'?'Изчисти':'Clear all'}
          </button>
        )}
      </div>

      {/* Price range */}
      <FilterGroup title={lang==='bg'?'Цена (€)':'Price (€)'}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="number" value={priceMin} onChange={e=>setPriceMin(e.target.value)} placeholder={String(priceBounds.min)}
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', padding:'6px 8px', fontSize:12, borderRadius:2, outline:'none', width:'100%', fontFamily:'Inter, sans-serif' }}
            onFocus={e=>e.target.style.borderColor='#D4500A'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
          <span style={{ color:'rgba(255,255,255,0.25)', fontSize:12 }}>—</span>
          <input type="number" value={priceMax} onChange={e=>setPriceMax(e.target.value)} placeholder={String(priceBounds.max)}
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', padding:'6px 8px', fontSize:12, borderRadius:2, outline:'none', width:'100%', fontFamily:'Inter, sans-serif' }}
            onFocus={e=>e.target.style.borderColor='#D4500A'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
        </div>
      </FilterGroup>

      {/* Brand */}
      {brands.length>1&&(
        <FilterGroup title={lang==='bg'?'Марка':'Brand'}>
          <div style={{ maxHeight:180, overflowY:'auto' }}>
            {brands.map(([b,cnt])=>(
              <FilterOption key={b} label={b} count={cnt}
                checked={brandFilter.includes(b)}
                onChange={chk=>setBrandFilter(prev=>chk?[...prev,b]:prev.filter(x=>x!==b))}/>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* In stock / Promo */}
      <FilterGroup title={lang==='bg'?'Наличност':'Availability'}>
        <FilterOption label={lang==='bg'?'В наличност':'In stock'} checked={onlyInStock} onChange={v=>setOnlyInStock(v)}/>
        <FilterOption label={lang==='bg'?'Промоция':'On sale'} checked={onlyPromo} onChange={v=>setOnlyPromo(v)}/>
      </FilterGroup>

      {/* Dynamic characteristic filters */}
      {filterGroups.map(({key,values,valMap})=>(
        <FilterGroup key={key} title={key}>
          {values.map(v=>(
            <FilterOption key={v} label={v} count={valMap[v]}
              checked={(charFilters[key]||[]).includes(v)}
              onChange={()=>toggleCharFilter(key,v)}/>
          ))}
        </FilterGroup>
      ))}
    </div>
  );

  const inputSel = {
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    color:'rgba(255,255,255,0.65)', padding:'8px 14px',
    fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:'0.2em',
    textTransform:'uppercase', cursor:'pointer', outline:'none',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f' }}>
      <Navbar/>

      {/* Page header */}
      <div style={{ paddingTop:128, paddingBottom:36, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0a0a0a' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 48px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            <Link to="/" style={{ fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.3em', color:'rgba(255,255,255,0.3)', textDecoration:'none', textTransform:'uppercase' }}
              onMouseEnter={e=>e.currentTarget.style.color='#D4500A'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
              {lang==='bg'?'Начало':'Home'}
            </Link>
            <span style={{ color:'rgba(255,255,255,0.15)', fontSize:10 }}>/</span>
            <span style={{ fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.3em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>{pageTitle}</span>
          </div>
          <p style={{ fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.45em', color:'#D4500A', textTransform:'uppercase', marginBottom:8 }}>
            {lang==='bg'?'Категория':'Category'}
          </p>
          <h1 style={{ fontFamily:'Oswald, sans-serif', fontSize:38, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em', margin:0, lineHeight:1 }}>
            {pageTitle}{activeCat&&<span style={{ color:'#D4500A' }}> — {activeCat}</span>}
          </h1>
          {!productsLoading&&(
            <p style={{ fontFamily:'Oswald, sans-serif', fontSize:11, color:'rgba(255,255,255,0.28)', marginTop:10, letterSpacing:'0.2em' }}>
              {visibleProducts.length} {lang==='bg'?'продукта':'products'}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'36px 48px 80px' }}>

        {/* Sub-filter buttons */}
        {showSubFilter&&!productsLoading&&(
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} style={{ marginBottom:36 }}>
            <p style={{ fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:'0.45em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginBottom:12 }}>
              {lang==='bg'?'ФИЛТРИРАЙ ПО ВИД':'FILTER BY TYPE'}
            </p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <SubFilterBtn label={lang==='bg'?'Всички':'All'} count={totalCatCount} active={activeCat===null} onClick={()=>setActiveCat(null)} image={null} lang={lang} isAll/>
              {catMeta.map(({cat,count,image})=>(
                <SubFilterBtn key={cat} label={cat} count={count} active={activeCat===cat} onClick={()=>setActiveCat(prev=>prev===cat?null:cat)} image={image} lang={lang} isAll={false}/>
              ))}
            </div>
            <div style={{ marginTop:32, borderBottom:'1px solid rgba(255,255,255,0.06)' }}/>
          </motion.div>
        )}

        {/* Mobile: filter toggle button */}
        {isMobile&&(
          <button onClick={()=>setSidebarOpen(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, padding:'9px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', cursor:'pointer' }}>
            <SlidersHorizontal size={13}/>
            {lang==='bg'?'Филтри':'Filters'}
            {activeFilterCount>0&&<span style={{ background:'#D4500A', color:'#fff', borderRadius:10, padding:'1px 6px', fontSize:9 }}>{activeFilterCount}</span>}
          </button>
        )}

        {/* Mobile drawer overlay */}
        <AnimatePresence>
          {isMobile&&sidebarOpen&&(
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)}
                style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:40 }}/>
              <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:0.25}}
                style={{ position:'fixed', top:0, left:0, bottom:0, width:290, background:'#141414', zIndex:41, overflowY:'auto', padding:24, borderRight:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
                  <button onClick={()=>setSidebarOpen(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4 }}>
                    <X size={18}/>
                  </button>
                </div>
                {sidebarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main layout: sidebar + grid */}
        <div style={{ display:'flex', gap:40, alignItems:'flex-start' }}>

          {/* ── Sidebar (desktop) ── */}
          {!isMobile&&(
          <div style={{ width:240, flexShrink:0, position:'sticky', top:100 }}>
            {sidebarContent}
          </div>
          )}

          {/* ── Right: sort bar + grid ── */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* Sort bar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
              <SlidersHorizontal size={13} style={{ color:'rgba(255,255,255,0.3)', flexShrink:0 }}/>
              <select value={sort} onChange={e=>setSort(e.target.value)} style={inputSel}>
                <option value="default">{lang==='bg'?'Сортиране':'Sort by'}</option>
                <option value="price_asc">{lang==='bg'?'Цена: ниска → висока':'Price: Low to High'}</option>
                <option value="price_desc">{lang==='bg'?'Цена: висока → ниска':'Price: High to Low'}</option>
                <option value="newest">{lang==='bg'?'Най-нови':'Newest'}</option>
              </select>

              {/* Active filter chips */}
              {brandFilter.map(b=>(
                <button key={b} onClick={()=>setBrandFilter(p=>p.filter(x=>x!==b))}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(212,80,10,0.12)', border:'1px solid rgba(212,80,10,0.35)', color:'#D4500A', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}>
                  <X size={9}/>{b}
                </button>
              ))}
              {Object.entries(charFilters).flatMap(([key,vals])=>vals.map(v=>(
                <button key={key+v} onClick={()=>toggleCharFilter(key,v)}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(212,80,10,0.12)', border:'1px solid rgba(212,80,10,0.35)', color:'#D4500A', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}>
                  <X size={9}/>{v}
                </button>
              )))}
              {(onlyInStock||onlyPromo||(priceMin||priceMax))&&(
                <>
                  {onlyInStock&&<button onClick={()=>setOnlyInStock(false)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(212,80,10,0.12)', border:'1px solid rgba(212,80,10,0.35)', color:'#D4500A', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}><X size={9}/>{lang==='bg'?'В наличност':'In stock'}</button>}
                  {onlyPromo&&<button onClick={()=>setOnlyPromo(false)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(212,80,10,0.12)', border:'1px solid rgba(212,80,10,0.35)', color:'#D4500A', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}><X size={9}/>{lang==='bg'?'Промоция':'On sale'}</button>}
                  {(priceMin||priceMax)&&<button onClick={()=>{setPriceMin('');setPriceMax('');}} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(212,80,10,0.12)', border:'1px solid rgba(212,80,10,0.35)', color:'#D4500A', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}><X size={9}/>€{priceMin||'0'} — €{priceMax||'∞'}</button>}
                </>
              )}

              <span style={{ marginLeft:'auto', fontFamily:'Oswald, sans-serif', fontSize:10, color:'rgba(255,255,255,0.22)', letterSpacing:'0.25em' }}>
                {!productsLoading&&`${visibleProducts.length} ${lang==='bg'?'резултата':'results'}`}
              </span>
            </div>

            {/* Product grid */}
            {productsLoading ? (
              <div style={{ textAlign:'center', padding:'100px 0' }}>
                <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.4, repeat:Infinity }}
                  style={{ fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:'0.5em', color:'rgba(212,80,10,0.6)', textTransform:'uppercase' }}>
                  {lang==='bg'?'ЗАРЕЖДАНЕ...':'LOADING...'}
                </motion.div>
              </div>
            ) : visibleProducts.length===0 ? (
              <div style={{ textAlign:'center', padding:'100px 0' }}>
                <Package size={48} style={{ color:'rgba(255,255,255,0.07)', margin:'0 auto 20px' }} strokeWidth={0.8}/>
                <p style={{ fontFamily:'Oswald, sans-serif', fontSize:13, letterSpacing:'0.35em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>
                  {lang==='bg'?'НЯМА НАМЕРЕНИ ПРОДУКТИ':'NO PRODUCTS FOUND'}
                </p>
                {activeFilterCount>0&&(
                  <button onClick={clearAll} style={{ marginTop:16, background:'transparent', border:'1px solid rgba(212,80,10,0.4)', color:'#D4500A', padding:'8px 20px', fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', cursor:'pointer' }}>
                    {lang==='bg'?'Изчисти Филтрите':'Clear Filters'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14 }}>
                {visibleProducts.map((product,i)=>(
                  <ProductCard key={product.id} product={product} lang={lang} index={i}/>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}
