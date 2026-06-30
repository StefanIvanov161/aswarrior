import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, LayoutDashboard, Package, ShoppingBag, Megaphone, Settings,
  Bell, Search, ExternalLink, ChevronLeft, ChevronRight, ChevronDown,
  Plus, Edit3, Trash2, Eye, Save, TrendingUp, TrendingDown,
  AlertTriangle, Check, Crosshair, Euro, ShoppingCart, BarChart2,
  Tag, Image as ImageIcon, RefreshCw, Zap, Menu, Upload,
  ArrowUpRight, Truck, CheckCircle, RotateCcw, Download, Minus,
  Layers, Layout, Globe, Lock, Star, Hash, Palette, Link, Scissors,
  Sun, Moon, GripVertical,
} from 'lucide-react';
import { useSiteData, DEFAULT_DATA } from '../context/SiteDataContext';
import ProductEditor from './ProductEditor';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const DARK_T = {
  bg0:'#030303', bg1:'#0a0a0a', bg2:'#0d0d0d', bg3:'#111', bg4:'#161616', bg5:'#1a1a1a',
  border:'rgba(255,255,255,0.06)', borderHover:'rgba(255,255,255,0.12)',
  accent:'#D4500A', accentDim:'rgba(212,80,10,0.15)', accentBorder:'rgba(212,80,10,0.35)',
  gold:'#C8921A', olive:'#6B8E4E', blue:'#4A7BA8',
  text:'rgba(255,255,255,0.88)', textSub:'rgba(255,255,255,0.45)', textMute:'rgba(255,255,255,0.22)',
  success:'#166534', successText:'#4ade80',
  warn:'#92400e', warnText:'#fbbf24',
  danger:'#7f1d1d', dangerText:'#f87171',
  font:'Oswald, sans-serif', fontBody:'Inter, sans-serif',
};
const LIGHT_T = {
  bg0:'#eef0f3', bg1:'#f8f9fb', bg2:'#ffffff', bg3:'#f4f5f8', bg4:'#f0f2f5', bg5:'#e6e8ec',
  border:'rgba(0,0,0,0.10)', borderHover:'rgba(0,0,0,0.20)',
  accent:'#D4500A', accentDim:'rgba(212,80,10,0.09)', accentBorder:'rgba(212,80,10,0.28)',
  gold:'#a06f0c', olive:'#3a6e1d', blue:'#1c5585',
  text:'rgba(0,0,0,0.87)', textSub:'rgba(0,0,0,0.52)', textMute:'rgba(0,0,0,0.33)',
  success:'#dcfce7', successText:'#15803d',
  warn:'#fef3c7', warnText:'#854d0e',
  danger:'#fee2e2', dangerText:'#b91c1c',
  font:'Oswald, sans-serif', fontBody:'Inter, sans-serif',
};
// Mutable token object — mutated in-place when theme switches so all inline styles update on re-render
const _initTheme = (() => { try { return localStorage.getItem('asw_cms_theme')||'dark'; } catch { return 'dark'; } })();
let T = { ...(_initTheme === 'light' ? LIGHT_T : DARK_T) };

// ─── CMS Translations ─────────────────────────────────────────────────────────
const CMS_TR = {
  bg: {
    nav:{ dashboard:'Табло', products:'Продукти', orders:'Поръчки', categories:'Категории', banners:'Банери', settings:'Настройки', backToStore:'Обратно към магазина', admin:'Администратор' },
    login:{ enterPassword:'Въведете парола', password:'Парола', enter:'Влез', back:'← Обратно към магазина' },
    common:{ save:'Запази', cancel:'Отказ', close:'Затвори', add:'Добави', edit:'Редактирай', delete:'Изтрий', refresh:'Обнови', loading:'Зареждане…', viewAll:'Виж Всички', yes:'ДА', no:'НЕ', all:'Всички', page:'Страница', of:'от', saving:'Запазване…' },
    dash:{ title:'Команден Център', totalRev:'Общ Приход', revMonth:'Приход Тоя Месец', totalOrders:'Общо Поръчки', avgOrder:'Средна Стойност', products:'Продукти', onPromo:'В Промоция', chart:'Приход', byStatus:'Поръчки по Статус', topCities:'Топ Градове', recent:'Последни Поръчки', confirmedPaid:'потвърдено платени', outOfStock:'изчерпани', lowStock:'малко налич.', markedNew:'маркирани нови', hidden:'скрити', vsLast:'% спрямо миналия', lastMonth:'Миналия месец', paid:'платени', unpaid:'неплатени', noOrders:'Няма поръчки', noData:'Няма данни', live:'Живи данни от базата данни' },
    periods:{ today:'Днес', week:'Тази Седмица', month:'Тоя Месец', quarter:'Последни 3 Мес', year:'Тази Година', all:'Всичко' },
    chartLabel:{ today:'Днес по Час', week:'Тази Седмица по Ден', month:'Тоя Месец по Ден', quarter:'Последните 3 Месеца', year:'Тази Година по Месец', all:'Всичко по Месец' },
    orders:{ title:'Поръчки', search:'Търси по клиент, имейл, номер, град…', num:'Поръчка №', date:'Дата', customer:'Клиент', city:'Град', delivery:'Доставка', total:'Стойност', paid:'Платено', status:'Статус', loadingMsg:'Зареждане на поръчки…', updateStatus:'Промени Статус', custInfo:'Клиент', delivInfo:'Доставка', payInfo:'Плащане', statInfo:'Статус', prodInfo:'Продукти', note:'Бележка от Клиент', discount:'Отстъпка', inDb:'поръчки в базата данни', statusUpdated:'Статусът е обновен' },
    products:{ title:'Продукти', allTab:'Всички Продукти', picksTab:'Избор на Редактора', addBtn:'Добави Продукт', search:'Търси продукти…', catFilter:'Категория', allCats:'Всички', col_name:'Продукт', col_cat:'Категория', col_price:'Цена', col_stock:'Налич.', col_status:'Статус', col_actions:'Действия', loadingMsg:'Зареждане от базата данни…', noResults:'Не са намерени продукти', added:'Продуктът е добавен', saved:'Продуктът е запазен', deleted:'Продуктът е изтрит', confirmDel:'Изтрий продукта от базата данни?', confirmDelSub:'Това действие е необратимо', saveBtn:'Запази Продукта', addTitle:'Добави Нов Продукт', catalog:'Продуктов Каталог' },
    picks:{ title:'Избор на Редактора', sub:'Изберете точно 8 продукта за началната страница.', selected:'Избрани', required:'задължителни', tip:'Стрелките за ред, × за премахване', addProd:'Добави Продукти', searchPh:'Търси по наименование или SKU…', noFound:'Не са намерени продукти', alreadyAdded:'Вече добавен', addedBtn:'Добавен', addBtn:'Добави', ready:'Готово — показва се на началната страница', maxReached:'Вече са избрани 8 — премахни преди да добавиш нов' },
    cats:{ title:'Категории', navTab:'Навигационни Категории', dbTab:'Категории в База Данни', addBtn:'Добави Категория', name:'Наименование', slug:'Slug', icon:'Иконка', parent:'Родителска Категория', saving:'Запазване…', none:'Няма категории' },
    banners:{ title:'Банери & Медия', heroTab:'Главни Слайдове', promoTab:'Промо Банери', addSlide:'Добави Слайд', addBanner:'Добави Банер', slide:'Слайд', banner:'Банер' },
    settings:{ title:'Настройки на Магазина', general:'Основни', security:'Сигурност', storeName:'Наименование на Магазина', tagline:'Слоган', adminPwd:'Парола за Администратор', dangerZone:'Опасна Зона', dangerDesc:'Нулиране на слайдове, категории и банери до фабрични настройки. Продуктите в базата НЕ са засегнати.', resetBtn:'Нулирай Съдържание', saved:'Настройките са запазени', resetDone:'Съдържанието е нулирано', serverControls:'Управление на Сървърите', restartSelect:'Избери услуга', restartBackend:'Само backend', restartFrontend:'Само frontend', restartBoth:'Рестартирай двете', restartBtn:'Рестартирай', restarting:'Рестартиране…', restartDone:'Сигналът е изпратен', restartWarn:'Страницата ще е недостъпна за няколко секунди.' },
  },
  en: {
    nav:{ dashboard:'Dashboard', products:'Products', orders:'Orders', categories:'Categories & Pages', banners:'Banners & Media', settings:'Store Settings', backToStore:'Back to Store', admin:'Admin' },
    login:{ enterPassword:'Enter Password', password:'Password', enter:'Enter', back:'← Back to storefront' },
    common:{ save:'Save', cancel:'Cancel', close:'Close', add:'Add', edit:'Edit', delete:'Delete', refresh:'Refresh', loading:'Loading…', viewAll:'View All', yes:'YES', no:'NO', all:'All', page:'Page', of:'of', saving:'Saving…' },
    dash:{ title:'Command Center', totalRev:'Total Revenue', revMonth:'Revenue This Month', totalOrders:'Total Orders', avgOrder:'Avg Order Value', products:'Products', onPromo:'On Promotion', chart:'Revenue', byStatus:'Orders by Status', topCities:'Top Cities', recent:'Recent Orders', confirmedPaid:'confirmed paid', outOfStock:'out of stock', lowStock:'low stock', markedNew:'marked new', hidden:'hidden', vsLast:'% vs last month', lastMonth:'Last month', paid:'paid', unpaid:'unpaid', noOrders:'No orders yet', noData:'No data yet', live:'Live data from your database' },
    periods:{ today:'Today', week:'This Week', month:'This Month', quarter:'Last 3 Mo', year:'This Year', all:'All Time' },
    chartLabel:{ today:'Today by Hour', week:'This Week by Day', month:'This Month by Day', quarter:'Last 3 Months by Week', year:'This Year by Month', all:'All Time by Month' },
    orders:{ title:'Orders', search:'Search by name, email, order number, city…', num:'Order #', date:'Date', customer:'Customer', city:'City', delivery:'Delivery', total:'Total', paid:'Paid', status:'Status', loadingMsg:'Loading orders…', updateStatus:'Update Status', custInfo:'Customer', delivInfo:'Delivery', payInfo:'Payment', statInfo:'Status', prodInfo:'Products', note:'Customer Note', discount:'Discount', inDb:'orders in database', statusUpdated:'Order status updated' },
    products:{ title:'Products', allTab:'All Products', picksTab:"Editor's Picks", addBtn:'Add Product', search:'Search products…', catFilter:'Category', allCats:'All', col_name:'Product', col_cat:'Category', col_price:'Price', col_stock:'Stock', col_status:'Status', col_actions:'Actions', loadingMsg:'Loading from database…', noResults:'No products found', added:'Product added to database', saved:'Product saved', deleted:'Product deleted', confirmDel:'Delete product from database?', confirmDelSub:'This action cannot be undone', saveBtn:'Save Product', addTitle:'Add New Product', catalog:'Product Catalog' },
    picks:{ title:"Editor's Picks", sub:'Select exactly 8 products to feature on the homepage.', selected:'Selected', required:'required', tip:'Use arrows to reorder, × to remove', addProd:'Add Products', searchPh:'Search by name or SKU…', noFound:'No products found', alreadyAdded:'Already added', addedBtn:'Added', addBtn:'Add', ready:'Ready — showing on homepage', maxReached:'Already 8 picks selected — remove one first' },
    cats:{ title:'Categories', navTab:'Navigation Categories', dbTab:'Product Categories (DB)', addBtn:'Add Category', name:'Name', slug:'Slug', icon:'Icon', parent:'Parent Category', saving:'Saving…', none:'No categories' },
    banners:{ title:'Banners & Media', heroTab:'Hero Slides', promoTab:'Promo Banners', addSlide:'Add Slide', addBanner:'Add Banner', slide:'Slide', banner:'Banner' },
    settings:{ title:'Store Settings', general:'General', security:'Security', storeName:'Store Name', tagline:'Tagline', adminPwd:'Admin Password', dangerZone:'Danger Zone', dangerDesc:'Reset hero slides, categories, and banners to factory defaults. Products in the database are NOT affected.', resetBtn:'Reset Content', saved:'Settings saved', resetDone:'Content reset to defaults', serverControls:'Server Controls', restartSelect:'Choose service', restartBackend:'Backend only', restartFrontend:'Frontend only', restartBoth:'Restart both', restartBtn:'Restart', restarting:'Restarting…', restartDone:'Restart signal sent', restartWarn:'The page will become unavailable for a few seconds.' },
  },
};

const CmsLangCtx = createContext({ lang:'bg', setLang:()=>{}, themeV:0 });
const useCmsT = () => {
  const { lang, themeV } = useContext(CmsLangCtx);
  void themeV; // consume so all useCmsT callers re-render when theme switches
  return (section, key) => CMS_TR[lang]?.[section]?.[key] ?? CMS_TR.bg[section]?.[key] ?? key;
};

// ─── Micro-components ─────────────────────────────────────────────────────────
const inp = (x={}) => ({ width:'100%', background:T.bg5, border:`1px solid ${T.border}`, color:T.text, padding:'8px 12px', fontSize:13, borderRadius:3, outline:'none', boxSizing:'border-box', fontFamily:T.fontBody, transition:'border-color .2s', ...x });

function Inp({ value, onChange, placeholder, type='text', style={}, readOnly, min, step }) {
  return <input readOnly={readOnly} type={type} value={value??''} min={min} step={step}
    onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}
    style={inp({ ...style, ...(readOnly?{opacity:.5,cursor:'default'}:{}) })}
    onFocus={e=>{ if(!readOnly)e.target.style.borderColor=T.accent; }}
    onBlur={e=>e.target.style.borderColor=T.border} />;
}
function Sel({ value, onChange, options, style={} }) {
  return (
    <select value={value??''} onChange={e=>onChange(e.target.value)} style={inp({ ...style, cursor:'pointer' })}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}>
      {options.map(o=> typeof o==='string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
function Txt({ value, onChange, rows=3, placeholder }) {
  return <textarea value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={inp({ resize:'vertical' })}
    onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} />;
}
function Lbl({ children, sub }) {
  return (
    <div style={{ marginBottom:6 }}>
      <label style={{ display:'block', fontSize:10, letterSpacing:'0.22em', color:T.textMute, fontFamily:T.font, textTransform:'uppercase' }}>{children}</label>
      {sub && <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:0 }}>{sub}</span>}
    </div>
  );
}
function Field({ label, labelSub, children, col }) {
  return <div style={{ marginBottom:14, ...(col?{gridColumn:col}:{}) }}><Lbl sub={labelSub}>{label}</Lbl>{children}</div>;
}
function Btn({ children, onClick, variant='primary', size='md', disabled, type='button', style={} }) {
  const bg = {primary:T.accent, ghost:T.bg4, danger:T.danger, success:T.success, warn:T.warn}[variant]||T.bg4;
  const border = variant==='ghost' ? `1px solid ${T.border}` : 'none';
  const pad = size==='sm'?'5px 12px':size==='lg'?'12px 28px':'8px 18px';
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ background:disabled?T.bg5:bg, border, color:disabled?T.textMute:'#fff', padding:pad, borderRadius:3,
        cursor:disabled?'not-allowed':'pointer', fontFamily:T.font, fontSize:size==='sm'?10:12, letterSpacing:'0.22em',
        textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:6, fontWeight:600,
        whiteSpace:'nowrap', transition:'opacity .18s', ...style }}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity='.82'}}
      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
      {children}
    </button>
  );
}
function Card({ children, style={} }) {
  return <div style={{ background:T.bg4, border:`1px solid ${T.border}`, borderRadius:4, padding:20, ...style }}>{children}</div>;
}
function SectionHead({ title, sub, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
      <div>
        <h2 style={{ fontFamily:T.font, fontSize:20, fontWeight:700, color:T.text, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>{title}</h2>
        {sub && <p style={{ fontSize:12, color:T.textMute, marginTop:5 }}>{sub}</p>}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
    </div>
  );
}
function Toggle({ on, onChange, size=22 }) {
  return (
    <button onClick={()=>onChange(!on)} style={{ background:on?T.accentDim:'transparent', border:`1px solid ${on?T.accent:T.border}`, borderRadius:20, width:size*2, height:size, position:'relative', cursor:'pointer', transition:'all .25s', flexShrink:0 }}>
      <motion.div animate={{ x: on ? size+2 : 2 }} transition={{ duration:.2 }} style={{ width:size-4, height:size-4, borderRadius:'50%', background:on?T.accent:'#555', position:'absolute', top:2 }} />
    </button>
  );
}
function Toast({ msg, type='success', onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2800); return ()=>clearTimeout(t); }, []);
  return (
    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:24}}
      style={{ position:'fixed', bottom:28, right:28, zIndex:9999, background:type==='success'?T.success:T.danger, border:`1px solid ${type==='success'?T.successText:T.dangerText}`, color:'#fff', padding:'11px 18px', borderRadius:4, fontFamily:T.font, fontSize:11, letterSpacing:'0.22em', display:'flex', alignItems:'center', gap:8 }}>
      {type==='success'?<Check size={13}/>:<AlertTriangle size={13}/>} {msg}
    </motion.div>
  );
}
function ModalShell({ title, tag, onClose, children, footer, width=720 }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.82)' }}>
      <motion.div initial={{scale:.94,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.94,opacity:0}} transition={{duration:.2}} onClick={e=>e.stopPropagation()}
        style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:6, width:'100%', maxWidth:width, maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 22px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            {tag && <p style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.35em', color:T.accent, textTransform:'uppercase', marginBottom:2 }}>{tag}</p>}
            <p style={{ fontFamily:T.font, fontSize:16, fontWeight:700, color:T.text }}>{title}</p>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.textSub, width:32, height:32, borderRadius:3, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSub}}>
            <X size={14}/>
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:22 }}>{children}</div>
        {footer && <div style={{ padding:'14px 22px', borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>{footer}</div>}
      </motion.div>
    </motion.div>
  );
}

// ─── Status maps ──────────────────────────────────────────────────────────────
const STATUS_FF = { Pending:{bg:'#451a03',text:'#fb923c',border:'rgba(251,146,60,0.3)'}, Processing:{bg:'#1e3a5f',text:'#60a5fa',border:'rgba(96,165,250,0.3)'}, Shipped:{bg:'#052e16',text:'#4ade80',border:'rgba(74,222,128,0.3)'}, Delivered:{bg:'#052e16',text:'#22c55e',border:'rgba(34,197,94,0.3)'}, Cancelled:{bg:'#450a0a',text:'#f87171',border:'rgba(248,113,113,0.3)'} };
const STATUS_PAY = { Paid:{bg:'#052e16',text:'#4ade80',border:'rgba(74,222,128,0.25)'}, Pending:{bg:'#451a03',text:'#fb923c',border:'rgba(251,146,60,0.25)'}, Refunded:{bg:'#1e3a5f',text:'#60a5fa',border:'rgba(96,165,250,0.25)'} };

function Badge({ label, map }) {
  const s=(map&&map[label])||{bg:T.bg5,text:T.textSub,border:T.border};
  return <span style={{ background:s.bg||T.bg5, color:s.text||T.textSub, border:`1px solid ${s.border||T.border}`, fontSize:9, fontFamily:T.font, letterSpacing:'0.2em', padding:'3px 8px', borderRadius:2, textTransform:'uppercase', whiteSpace:'nowrap' }}>{label}</span>;
}

// ─── Tags input chip component ────────────────────────────────────────────────
function TagsInput({ value='', onChange }) {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t=>t.trim()).filter(Boolean) : [];
  const add = () => {
    const v = input.trim();
    if (!v || tags.includes(v)) { setInput(''); return; }
    onChange([...tags, v].join(','));
    setInput('');
  };
  const remove = (tag) => onChange(tags.filter(t=>t!==tag).join(','));
  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
        {tags.map(tag=>(
          <span key={tag} style={{ display:'flex', alignItems:'center', gap:5, background:T.accentDim, border:`1px solid ${T.accentBorder}`, borderRadius:2, padding:'3px 8px', fontSize:11, color:T.accent, fontFamily:T.font, letterSpacing:'0.1em' }}>
            {tag}
            <button onClick={()=>remove(tag)} style={{ background:'none', border:'none', color:T.accent, cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}><X size={10}/></button>
          </span>
        ))}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add();}}} placeholder="Type tag, press Enter…" style={inp({ flex:1 })} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
        <Btn size="sm" onClick={add}><Plus size={11}/> Add</Btn>
      </div>
    </div>
  );
}

// ─── Image URL list component ─────────────────────────────────────────────────
function ImagesManager({ primary, onPrimaryChange, extras, onExtrasChange }) {
  const [newUrl, setNewUrl] = useState('');
  const addExtra = () => {
    const v = newUrl.trim();
    if (!v) return;
    onExtrasChange([...extras, v]);
    setNewUrl('');
  };
  return (
    <div>
      <Lbl sub="Displayed as main product image">Primary Image URL</Lbl>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <Inp value={primary} onChange={onPrimaryChange} placeholder="https://…"/>
        {primary && <img src={primary} alt="" style={{ height:38, width:38, objectFit:'cover', borderRadius:3, border:`1px solid ${T.border}`, flexShrink:0 }} onError={e=>e.target.style.display='none'}/>}
      </div>

      <Lbl sub="Additional product gallery images — click image to set as primary">Extra Images</Lbl>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:8 }}>
        {extras.map((url,i)=>(
          <div key={i} style={{ position:'relative' }}>
            <img
              src={url} alt=""
              title="Click to set as primary image"
              onClick={() => {
                const oldPrimary = primary;
                onPrimaryChange(url);
                onExtrasChange([...extras.filter((_,j)=>j!==i), ...(oldPrimary ? [oldPrimary] : [])]);
              }}
              style={{ height:64, width:64, objectFit:'cover', borderRadius:3, border:`2px solid ${T.accent}44`, cursor:'pointer' }}
              onError={e=>e.target.style.opacity='0.3'}
            />
            <button onClick={()=>onExtrasChange(extras.filter((_,j)=>j!==i))} style={{ position:'absolute', top:-6, right:-6, background:T.danger, border:'none', borderRadius:'50%', width:16, height:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><X size={9}/></button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <Inp value={newUrl} onChange={setNewUrl} placeholder="Paste image URL…" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addExtra();}}}/>
        <Btn size="sm" onClick={addExtra}><Plus size={11}/> Add</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function LoginScreen({ onSuccess, password }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const t = useCmsT();

  const submit = (e) => {
    e.preventDefault();
    if (val === password) { onSuccess(); }
    else { setErr(true); setTimeout(()=>setErr(false), 1200); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:T.bg0, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:340 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <Crosshair size={22} style={{ color:T.accent }}/>
          <span style={{ fontFamily:T.font, fontSize:18, fontWeight:700, letterSpacing:'0.2em', color:'#fff' }}>AS<span style={{ color:T.accent }}>WARRIOR</span> <span style={{ fontSize:12, color:T.textMute }}>ADMIN</span></span>
        </div>
        <form onSubmit={submit}>
          <p style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.4em', color:T.textMute, textTransform:'uppercase', marginBottom:14 }}>{t('login','enterPassword')}</p>
          <input type="password" value={val} onChange={e=>setVal(e.target.value)} placeholder={t('login','password')} autoFocus
            style={inp({ marginBottom:12, border:err?`1px solid ${T.dangerText}`:`1px solid ${T.border}`, height:44 })}
            onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=err?T.dangerText:T.border}/>
          <button type="submit" style={{ width:'100%', background:T.accent, border:'none', color:'#fff', padding:12, cursor:'pointer', fontFamily:T.font, fontSize:13, letterSpacing:'0.25em', textTransform:'uppercase', borderRadius:3 }}>
            {t('login','enter')}
          </button>
        </form>
        <button onClick={()=>navigate('/')} style={{ marginTop:20, background:'none', border:'none', color:T.textMute, cursor:'pointer', fontSize:12, fontFamily:T.fontBody }}>
          {t('login','back')}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: PRODUCTS — full edit
// ═══════════════════════════════════════════════════════════════════════════════

const PROD_TABS = ['General','Pricing & Badge','Images','Tags & SEO','Inventory'];
const BADGE_COLORS = ['#D4500A','#C8921A','#6B8E4E','#4A7BA8','#8B5E3C','#7B3F7B','#ef4444','#22c55e'];
const PAGE_SIZE = 50;

function ProductImg({ src, size=40 }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <div style={{ width:size, height:size, borderRadius:3, background:T.bg5, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Package size={size*0.38} style={{ color:T.textMute }}/></div>;
  return <img src={src} alt="" onError={()=>setErr(true)} style={{ width:size, height:size, objectFit:'cover', borderRadius:3, border:`1px solid ${T.border}`, flexShrink:0 }}/>;
}

function ProductModal({ product, onClose, onSave }) {
  const isNew = !product;
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    description: product?.description || '',
    parameters: product?.parameters || '',
    price: product?.price ?? '',
    old_price: product?.old_price ?? '',
    on_promotion: product?.on_promotion || false,
    badge_text: product?.badge_text || '',
    badge_color: product?.badge_color || '#D4500A',
    image_url: product?.image_url || '',
    images: (() => { try { return JSON.parse(product?.images||'[]'); } catch { return []; } })(),
    tags: product?.tags || '',
    sku: product?.sku || '',
    category: product?.category || '',
    category_parent: product?.category_parent || '',
    stock_quantity: product?.stock_quantity ?? 0,
    is_new: product?.is_new || false,
    hidden: product?.hidden || false,
  });
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      old_price: form.old_price !== '' && form.old_price !== null ? parseFloat(form.old_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      images: JSON.stringify(form.images),
    });
    setSaving(false);
    onClose();
  };

  const tabContent = [
    // 0 General
    <div key={0} style={{ display:'grid', gap:0 }}>
      <Field label="Product Name" col="1/-1"><Inp value={form.name} onChange={v=>upd('name',v)} placeholder="Full product name"/></Field>
      <Field label="Brand"><Inp value={form.brand} onChange={v=>upd('brand',v)} placeholder="Brand or manufacturer"/></Field>
      <Field label="Category">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Inp value={form.category_parent} onChange={v=>upd('category_parent',v)} placeholder="Parent (e.g. Реплики)"/>
          <Inp value={form.category} onChange={v=>upd('category',v)} placeholder="Sub (e.g. AEG Карабини)"/>
        </div>
      </Field>
      <Field label="Description" col="1/-1"><Txt value={form.description} onChange={v=>upd('description',v)} rows={5} placeholder="Full product description…"/></Field>
      <Field label="Parameters / Specs" col="1/-1"><Txt value={form.parameters} onChange={v=>upd('parameters',v)} rows={3} placeholder="Technical specs, dimensions, weight…"/></Field>
    </div>,

    // 1 Pricing & Badge
    <div key={1} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
      <Field label="Price (€)"><Inp type="number" step="0.01" min="0" value={form.price} onChange={v=>upd('price',v)} placeholder="0.00"/></Field>
      <Field label="Old / Compare-At Price (€)" labelSub="Leave empty if not on sale"><Inp type="number" step="0.01" min="0" value={form.old_price} onChange={v=>upd('old_price',v)} placeholder="e.g. 349.99"/></Field>
      <Field label="On Promotion" col="1/-1">
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <Toggle on={form.on_promotion} onChange={v=>upd('on_promotion',v)} size={22}/>
          <span style={{ fontSize:13, color:form.on_promotion?T.text:T.textSub }}>Show this product in promotion / sale section</span>
        </label>
      </Field>
      <Field label="Badge Label" labelSub="Short label shown on product card (e.g. BEST SELLER, NEW, HOT)">
        <Inp value={form.badge_text} onChange={v=>upd('badge_text',v)} placeholder="BEST SELLER"/>
      </Field>
      <Field label="Badge Color">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
          {BADGE_COLORS.map(c=>(
            <button key={c} onClick={()=>upd('badge_color',c)} style={{ width:28, height:28, borderRadius:3, background:c, border:form.badge_color===c?`2px solid #fff`:`2px solid transparent`, cursor:'pointer', flexShrink:0 }}/>
          ))}
        </div>
        <Inp value={form.badge_color} onChange={v=>upd('badge_color',v)} placeholder="#D4500A"/>
        {form.badge_text && (
          <div style={{ marginTop:10, display:'inline-flex' }}>
            <span style={{ background:form.badge_color, color:'#fff', fontSize:10, fontFamily:T.font, letterSpacing:'0.2em', padding:'3px 9px', borderRadius:2, textTransform:'uppercase' }}>
              {form.badge_text}
            </span>
            <span style={{ marginLeft:10, fontSize:11, color:T.textMute }}>← Preview</span>
          </div>
        )}
      </Field>
    </div>,

    // 2 Images
    <div key={2}>
      <ImagesManager
        primary={form.image_url}
        onPrimaryChange={v=>upd('image_url',v)}
        extras={form.images}
        onExtrasChange={v=>upd('images',v)}
      />
    </div>,

    // 3 Tags & SEO
    <div key={3} style={{ display:'grid', gap:14 }}>
      <Field label="Tags" labelSub="Used for filtering and search. Press Enter to add.">
        <TagsInput value={form.tags} onChange={v=>upd('tags',v)}/>
      </Field>
      <Field label="Product URL (from Gombashop)" labelSub="Reference only — not editable">
        <Inp value={product?.product_url||''} readOnly/>
      </Field>
    </div>,

    // 4 Inventory
    <div key={4} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
      <Field label="SKU"><Inp value={form.sku} onChange={v=>upd('sku',v)} placeholder="e.g. CM048M"/></Field>
      <Field label="Stock Quantity">
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={()=>upd('stock_quantity',Math.max(0,parseInt(form.stock_quantity||0)-1))} style={{ width:32, height:34, background:T.bg5, border:`1px solid ${T.border}`, color:T.text, cursor:'pointer', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Minus size={13}/></button>
          <Inp type="number" min="0" value={form.stock_quantity} onChange={v=>upd('stock_quantity',v)} style={{ textAlign:'center' }}/>
          <button onClick={()=>upd('stock_quantity',parseInt(form.stock_quantity||0)+1)} style={{ width:32, height:34, background:T.bg5, border:`1px solid ${T.border}`, color:T.text, cursor:'pointer', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Plus size={13}/></button>
        </div>
      </Field>
      <Field label="Mark as New" col="1/-1">
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <Toggle on={form.is_new} onChange={v=>upd('is_new',v)} size={22}/>
          <span style={{ fontSize:13, color:form.is_new?T.text:T.textSub }}>Show "New" badge on this product</span>
        </label>
      </Field>
      <Field label="Hidden (Draft)" col="1/-1">
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <Toggle on={form.hidden} onChange={v=>upd('hidden',v)} size={22}/>
          <span style={{ fontSize:13, color:form.hidden?T.dangerText:T.textSub }}>Hide from storefront — product exists in DB but is not visible to customers</span>
        </label>
      </Field>
    </div>,
  ];

  return (
    <ModalShell
      title={isNew ? 'Add New Product' : form.name}
      tag={isNew ? 'Product Catalog' : `Product · ID ${product.id} · SKU ${product.sku||'—'}`}
      onClose={onClose}
      width={780}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving||!form.name.trim()}><Save size={13}/>{saving?'Saving…':'Save Product'}</Btn></>}
    >
      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, marginBottom:22, marginTop:-6 }}>
        {PROD_TABS.map((t,i)=>(
          <button key={t} onClick={()=>setTab(i)} style={{ padding:'9px 14px', background:'transparent', border:'none', cursor:'pointer', fontFamily:T.font, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:tab===i?T.accent:T.textMute, borderBottom:tab===i?`2px solid ${T.accent}`:'2px solid transparent', transition:'all .15s' }}>{t}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.18}}>
          {tabContent[tab]}
        </motion.div>
      </AnimatePresence>
    </ModalShell>
  );
}

// ─── Editor's Picks manager ────────────────────────────────────────────────────
function EditorPicksManager() {
  const t = useCmsT();
  const { data, update } = useSiteData();
  const allProducts = data.products || [];
  const picks = data.editorsPicks || [];
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const pickedProducts = picks.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  const filtered = search
    ? allProducts.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())).slice(0, 40)
    : [];

  const addPick = (id) => {
    if (picks.includes(id)) return;
    if (picks.length >= 8) { setToast({ msg: t('picks','maxReached'), type: 'error' }); return; }
    update('editorsPicks', [...picks, id]);
  };
  const removePick = (id) => update('editorsPicks', picks.filter(p => p !== id));
  const movePick = (i, dir) => {
    const next = [...picks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update('editorsPicks', next);
  };

  return (
    <div>
      <SectionHead title={t('picks','title')} sub={t('picks','sub')}/>

      {/* Selected picks */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
          <p style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.3em', color: picks.length === 8 ? T.successText : T.accent, textTransform:'uppercase' }}>
            {picks.length} / 8 {t('picks','selected')}
          </p>
          {picks.length === 8 && <span style={{ fontSize:11, color:T.successText, display:'flex', alignItems:'center', gap:5 }}><Check size={12}/> {t('picks','ready')}</span>}
        </div>
        {pickedProducts.length === 0 ? (
          <p style={{ color:T.textMute, fontSize:12, padding:'20px 0', textAlign:'center' }}>{t('picks','noFound')}</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {pickedProducts.map((p, i) => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:T.bg5, borderRadius:3, border:`1px solid ${T.border}` }}>
                <span style={{ fontFamily:T.font, fontSize:11, color:T.textMute, width:18, flexShrink:0 }}>#{i+1}</span>
                <ProductImg src={p.image_url} size={36}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize:10, color:T.textMute }}>{p.category} · €{parseFloat(p.price||0).toFixed(2)}</p>
                </div>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  <button onClick={()=>movePick(i,-1)} disabled={i===0} style={{ width:24, height:24, background:'transparent', border:`1px solid ${T.border}`, borderRadius:2, cursor:i===0?'not-allowed':'pointer', color:i===0?T.textMute:T.text, display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={11}/></button>
                  <button onClick={()=>movePick(i,1)} disabled={i===pickedProducts.length-1} style={{ width:24, height:24, background:'transparent', border:`1px solid ${T.border}`, borderRadius:2, cursor:i===pickedProducts.length-1?'not-allowed':'pointer', color:i===pickedProducts.length-1?T.textMute:T.text, display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={11}/></button>
                  <button onClick={()=>removePick(p.id)} style={{ width:24, height:24, background:'transparent', border:`1px solid rgba(248,113,113,0.3)`, borderRadius:2, cursor:'pointer', color:T.dangerText, display:'flex', alignItems:'center', justifyContent:'center' }}><X size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Search to add */}
      {picks.length < 8 && (
        <Card>
          <p style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:12 }}>{t('picks','addProd')}</p>
          <div style={{ position:'relative', marginBottom:12 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T.textMute }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('picks','searchPh')} style={inp({paddingLeft:32})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          {search && (
            <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:320, overflowY:'auto' }}>
              {filtered.length === 0 && <p style={{ color:T.textMute, fontSize:12, padding:'10px 0' }}>{t('picks','noFound')}</p>}
              {filtered.map(p => {
                const already = picks.includes(p.id);
                return (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:T.bg5, borderRadius:3, border:`1px solid ${already ? T.accentBorder : T.border}`, opacity: already ? 0.5 : 1 }}>
                    <ProductImg src={p.image_url} size={32}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize:10, color:T.textMute }}>{p.sku} · {p.category} · €{parseFloat(p.price||0).toFixed(2)}</p>
                    </div>
                    <Btn size="sm" variant={already?'ghost':'primary'} disabled={already} onClick={()=>addPick(p.id)}>
                      {already ? <Check size={11}/> : <Plus size={11}/>} {already ? t('picks','addedBtn') : t('picks','addBtn')}
                    </Btn>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// Preferred sidebar order — mirrors the main website's FindYourKitSection
const CAT_PARENT_ORDER = [
  'Реплики',
  'Оборудване за Оръжия',
  'Аксесоари за Екипировка',
  'Екипировка',
  'Комуникация',
];
function sortParents(entries) {
  return entries.sort(([a],[b]) => {
    const ai = CAT_PARENT_ORDER.indexOf(a);
    const bi = CAT_PARENT_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function Products() {
  const t = useCmsT();
  const navigate = useNavigate();
  const { data, productsLoading, productsError, updateProduct, createProduct, deleteProduct } = useSiteData();
  const products = data.products || [];

  const [tab, setTab]                     = useState('catalog');
  const [search, setSearch]               = useState('');
  const [selectedCat, setSelectedCat]     = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [expandedParents, setExpandedParents] = useState(() => new Set());
  const [viewMode, setViewMode]           = useState('grid');
  const [sortBy, setSortBy]               = useState('name');
  const [modal, setModal]                 = useState(null);
  const [confirmDel, setConfirmDel]       = useState(null);
  const [toast, setToast]                 = useState(null);
  const [removingBg, setRemovingBg]       = useState({});
  const [bgUrlInput, setBgUrlInput]       = useState({});

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const getBrowserImageBase64 = (url) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 800;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });

  const runRemoveBg = async (product, sourceUrl) => {
    setRemovingBg(prev => ({ ...prev, [product.id]: 'processing' }));
    try {
      let bodyObj = {};
      if (sourceUrl) bodyObj.sourceUrl = sourceUrl;
      const urlToFetch = sourceUrl || product.image_url;
      if (urlToFetch && !urlToFetch.startsWith('/processed/')) {
        const b64 = await getBrowserImageBase64(urlToFetch);
        if (b64) bodyObj.imageBase64 = b64;
      }
      const res = await fetch(`${API}/api/admin/remove-bg/${product.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj),
      });
      const d = await res.json();
      if (d.ok) {
        setRemovingBg(prev => ({ ...prev, [product.id]: 'done' }));
        setBgUrlInput(prev => { const n = { ...prev }; delete n[product.id]; return n; });
        showToast(`BG removed for "${product.name.slice(0, 40)}"`);
      } else throw new Error(d.error || 'Failed');
    } catch (e) {
      setRemovingBg(prev => ({ ...prev, [product.id]: 'error' }));
      showToast(e.message, 'error');
    }
  };

  const handleRemoveBg = (product) => {
    if (product.image_url?.startsWith('/processed/') && removingBg[product.id] !== 'await-url') {
      setRemovingBg(prev => ({ ...prev, [product.id]: 'await-url' }));
      setBgUrlInput(prev => ({ ...prev, [product.id]: product.original_image_url || '' }));
      return;
    }
    runRemoveBg(product, bgUrlInput[product.id] || null);
  };

  const quickToggle = async (p, field) => {
    try { await updateProduct(p.id, { [field]: !p[field] }); }
    catch (e) { showToast(e.message, 'error'); }
  };

  // ── Drag-to-reorder state ──
  const [dragMode, setDragMode]   = useState(false);
  const [dragList, setDragList]   = useState(null);
  const [dragOver, setDragOver]   = useState(null);
  const [reordering, setReordering] = useState(false);
  const dragIdx = useRef(null);

  const displayList = dragMode && dragList ? dragList : null; // null = use filtered

  const saveSortOrder = async (list) => {
    setReordering(true);
    try {
      const items = list.map((p, i) => ({ id: p.id, sort_order: i * 10 }));
      const res = await fetch(`${API}/api/products/reorder`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setReordering(false); }
  };

  const enterDragMode = () => {
    const snap = [...filtered];
    setDragList(snap);
    setDragMode(true);
    saveSortOrder(snap); // snapshot current order into DB
  };
  const exitDragMode = () => { setDragMode(false); setDragList(null); setDragOver(null); };

  const onSortStart = (i) => { dragIdx.current = i; };
  const onSortOver  = (e, i) => { e.preventDefault(); if (dragIdx.current !== null && dragIdx.current !== i) setDragOver(i); };
  const onSortDrop  = async (i) => {
    const from = dragIdx.current;
    dragIdx.current = null; setDragOver(null);
    if (from === null || from === i) return;
    const next = [...(dragList || filtered)];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setDragList(next);
    await saveSortOrder(next);
  };
  const onSortEnd = () => setDragOver(null);

  // Auto-scroll the CMS content pane when dragging near edges
  useEffect(() => {
    if (!dragMode) return;
    let scrollEl = null;
    let rafId = null;
    let scrollDir = 0;
    let scrollSpeed = 0;
    const ZONE = 120; // px from edge to start scrolling

    const findScrollParent = (el) => {
      while (el && el !== document.body) {
        const { overflowY } = getComputedStyle(el);
        if (overflowY === 'auto' || overflowY === 'scroll') return el;
        el = el.parentElement;
      }
      return document.documentElement;
    };

    const onDragOver = (e) => {
      if (!scrollEl) scrollEl = findScrollParent(e.target);
      const rect = scrollEl === document.documentElement
        ? { top: 0, bottom: window.innerHeight }
        : scrollEl.getBoundingClientRect();
      const distTop    = e.clientY - rect.top;
      const distBottom = rect.bottom - e.clientY;
      if (distTop < ZONE) {
        scrollDir = -1;
        scrollSpeed = Math.ceil((ZONE - distTop) / ZONE * 18);
      } else if (distBottom < ZONE) {
        scrollDir = 1;
        scrollSpeed = Math.ceil((ZONE - distBottom) / ZONE * 18);
      } else {
        scrollDir = 0;
        scrollSpeed = 0;
      }
    };

    const tick = () => {
      if (scrollDir !== 0 && scrollEl) scrollEl.scrollTop += scrollDir * scrollSpeed;
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener('dragover', onDragOver);
    rafId = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      cancelAnimationFrame(rafId);
    };
  }, [dragMode]);

  // Build category tree: { parentName: { count, subs: { catName: count } } }
  const catTree = useMemo(() => {
    const tree = {};
    products.forEach(p => {
      const parent = p.category_parent || '(Без категория)';
      if (!tree[parent]) tree[parent] = { count: 0, subs: {} };
      tree[parent].count++;
      if (p.category) {
        tree[parent].subs[p.category] = (tree[parent].subs[p.category] || 0) + 1;
      }
    });
    return tree;
  }, [products]);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s)
      );
    }
    if (selectedCat) result = result.filter(p => p.category === selectedCat);
    else if (selectedParent) result = result.filter(p => (p.category_parent || '(Без категория)') === selectedParent);
    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc')  return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'stock')      return (a.stock_quantity || 0) - (b.stock_quantity || 0);
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, search, selectedCat, selectedParent, sortBy]);

  const handleSave = async (fields) => {
    try {
      if (modal === 'add') { await createProduct(fields); showToast('Product added'); }
      else { await updateProduct(modal.id, fields); showToast('Product saved'); }
      setModal(null);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDel = async (id) => {
    try { await deleteProduct(id); setConfirmDel(null); showToast('Product deleted'); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const toggleExpand = (name, e) => {
    e?.stopPropagation();
    setExpandedParents(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  };

  if (productsLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:320, gap:16 }}>
      <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}><Crosshair size={32} style={{color:T.accent}}/></motion.div>
      <p style={{ fontFamily:T.font, fontSize:11, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase' }}>Loading from database…</p>
    </div>
  );
  if (productsError) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:320, gap:12 }}>
      <AlertTriangle size={28} style={{color:T.dangerText}}/>
      <p style={{ color:T.dangerText, fontFamily:T.font }}>API Error: {productsError}</p>
      <p style={{ fontSize:11, color:T.textMute }}>Make sure npm start is running in aswarrior-backend</p>
    </div>
  );

  const currentLabel = selectedCat || selectedParent || t('products','allTab');

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        {[['catalog', t('products','allTab')], ['picks', t('products','picksTab')]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:'10px 20px', background:'transparent', border:'none', cursor:'pointer', fontFamily:T.font, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:tab===id?T.accent:T.textMute, borderBottom:tab===id?`2px solid ${T.accent}`:'2px solid transparent', transition:'all .15s' }}>{label}</button>
        ))}
      </div>

      {tab === 'picks' ? (
        <div style={{ padding:'24px 0' }}><EditorPicksManager /></div>
      ) : (
        <div style={{ display:'flex', minHeight:'calc(100vh - 120px)' }}>

          {/* ── Category Sidebar ── */}
          <aside style={{ width:220, flexShrink:0, borderRight:`1px solid ${T.border}`, background:T.bg3, overflowY:'auto', paddingTop:8 }}>
            <div style={{ padding:'8px 14px 6px', fontSize:9, fontFamily:T.font, letterSpacing:'0.25em', color:T.textMute, textTransform:'uppercase' }}>Категории</div>

            {/* All */}
            <SidebarItem
              label={t('common','all') || 'Всички'}
              count={products.length}
              selected={!selectedCat && !selectedParent}
              onClick={() => { setSelectedCat(null); setSelectedParent(null); }}
            />

            {/* Category tree */}
            {sortParents(Object.entries(catTree)).map(([parent, { count, subs }]) => {
              const isExpanded   = expandedParents.has(parent);
              const isSelected   = selectedParent === parent && !selectedCat;
              const subEntries   = Object.entries(subs).sort(([a],[b]) => a.localeCompare(b));
              const hasSubcats   = subEntries.length > 0;

              return (
                <div key={parent}>
                  {/* Parent row */}
                  <div style={{ display:'flex', alignItems:'stretch' }}>
                    <button
                      onClick={() => {
                        setSelectedParent(parent); setSelectedCat(null);
                        if (!isExpanded) toggleExpand(parent);
                      }}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px 7px 14px', background:isSelected?T.accentDim:'transparent', borderLeft:isSelected?`2px solid ${T.accent}`:'2px solid transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background .12s', minWidth:0 }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background=T.bg5; }}
                      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background='transparent'; }}
                    >
                      <span style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:isSelected?T.accent:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{parent}</span>
                      <span style={{ fontFamily:T.font, fontSize:9, color:T.textMute, background:T.bg5, padding:'1px 5px', borderRadius:8, flexShrink:0, marginLeft:4 }}>{count}</span>
                    </button>
                    {hasSubcats && (
                      <button onClick={e=>toggleExpand(parent,e)} style={{ flexShrink:0, padding:'7px 10px', background:'transparent', border:'none', cursor:'pointer', color:T.textMute, display:'flex', alignItems:'center' }}>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration:.15 }}><ChevronRight size={12}/></motion.div>
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.18}} style={{overflow:'hidden'}}>
                        {subEntries.map(([sub, subCount]) => {
                          const isSub = selectedCat === sub;
                          return (
                            <button key={sub}
                              onClick={() => { setSelectedCat(sub); setSelectedParent(null); }}
                              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'5px 10px 5px 26px', background:isSub?'rgba(212,80,10,0.08)':'transparent', borderLeft:isSub?`2px solid ${T.accent}`:'2px solid transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background .12s' }}
                              onMouseEnter={e=>{ if(!isSub) e.currentTarget.style.background=T.bg5; }}
                              onMouseLeave={e=>{ if(!isSub) e.currentTarget.style.background='transparent'; }}
                            >
                              <span style={{ fontSize:11, color:isSub?T.accent:T.textSub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</span>
                              <span style={{ fontFamily:T.font, fontSize:9, color:T.textMute, flexShrink:0, marginLeft:4 }}>{subCount}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </aside>

          {/* ── Main area ── */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, padding:'16px 20px' }}>

            {/* Toolbar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ marginRight:4 }}>
                <h2 style={{ fontFamily:T.font, fontSize:15, color:T.text, margin:0, letterSpacing:'0.12em', textTransform:'uppercase' }}>{currentLabel}</h2>
                <p style={{ fontSize:10, color:T.textMute, margin:0 }}>
                  {filtered.length}{filtered.length !== products.length ? ` ${t('common','of')} ${products.length}` : ''} продукта
                </p>
              </div>
              <div style={{ flex:1 }}/>
              {/* Search */}
              <div style={{ position:'relative' }}>
                <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:T.textMute }}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('products','search')}
                  style={inp({ paddingLeft:28, width:200, fontSize:12 })}
                  onFocus={e=>e.target.style.borderColor=T.accent}
                  onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
              {/* Sort (hidden in drag mode) */}
              {!dragMode && <Sel value={sortBy} onChange={setSortBy} options={[
                {v:'name',l:'Наименование A–Z'},{v:'price-asc',l:'Цена ↑'},{v:'price-desc',l:'Цена ↓'},{v:'stock',l:'Наличност ↑'},
              ]} style={{ width:160, fontSize:11 }}/>}
              {/* View toggle */}
              <div style={{ display:'flex', border:`1px solid ${T.border}`, borderRadius:3, overflow:'hidden' }}>
                {[['grid',<Layers size={13}/>],['list',<Layout size={13}/>]].map(([mode,icon])=>(
                  <button key={mode} onClick={()=>{ setViewMode(mode); if(dragMode) exitDragMode(); }} title={mode==='grid'?'Grid':'List'} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'5px 10px', background:viewMode===mode?T.accentDim:'transparent', border:'none', cursor:'pointer', color:viewMode===mode?T.accent:T.textMute, borderRight:mode==='grid'?`1px solid ${T.border}`:'none', transition:'all .15s' }}>{icon}</button>
                ))}
              </div>
              {/* Drag reorder toggle (grid only) */}
              {viewMode === 'grid' && (
                <button onClick={dragMode ? exitDragMode : enterDragMode}
                  title={dragMode ? 'Exit reorder mode' : 'Drag to reorder products'}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', border:`1px solid ${dragMode?T.accent:T.border}`, borderRadius:3, background:dragMode?T.accentDim:'transparent', color:dragMode?T.accent:T.textMute, cursor:'pointer', fontFamily:T.font, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', transition:'all .15s', whiteSpace:'nowrap' }}
                  onMouseEnter={e=>{ if(!dragMode){e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;} }}
                  onMouseLeave={e=>{ if(!dragMode){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMute;} }}>
                  <GripVertical size={12}/>
                  {dragMode ? (reordering ? 'Saving…' : 'Done') : 'Reorder'}
                </button>
              )}
              <Btn onClick={()=>setModal('add')} disabled={dragMode}><Plus size={13}/> {t('products','addBtn')}</Btn>
            </div>

            {/* ── GRID ── */}
            {viewMode === 'grid' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px, 1fr))', gap:12, overflowY:'auto' }}>
                {/* Add card — hidden in drag mode */}
                {!dragMode && <div onClick={()=>setModal('add')}
                  style={{ background:T.bg4, border:`1.5px dashed ${T.border}`, borderRadius:5, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:255, gap:10, color:T.textMute, transition:'all .2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.color=T.accent; e.currentTarget.style.background=T.accentDim; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMute; e.currentTarget.style.background=T.bg4; }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', border:'1.5px dashed currentColor', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={20}/></div>
                  <span style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase' }}>{t('products','addBtn')}</span>
                </div>}

                {/* Drag mode banner */}
                {dragMode && (
                  <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'10px 16px', background:T.accentDim, border:`1px solid ${T.accentBorder}`, borderRadius:5, marginBottom:4 }}>
                    <GripVertical size={16} style={{color:T.accent}}/>
                    <span style={{ fontFamily:T.font, fontSize:11, letterSpacing:'0.2em', color:T.accent, textTransform:'uppercase' }}>
                      {reordering ? 'Saving order…' : 'Drag cards to reorder — click "Done" when finished'}
                    </span>
                  </div>
                )}

                {/* Product cards */}
                {(displayList ?? filtered).map((p, cardIdx) => {
                  const bgState = removingBg[p.id];
                  const tracksStock  = p.track_stock ?? true;
                  const isOut        = tracksStock && (p.stock_quantity ?? 1) === 0;
                  const isLow        = tracksStock && !isOut && (p.stock_quantity ?? 999) <= 5;
                  const stockDot     = !tracksStock ? T.textMute : isOut ? T.dangerText : isLow ? T.warnText : T.successText;
                  const stockLabel   = !tracksStock ? '∞' : (p.stock_quantity ?? 0);
                  const isDragTarget = dragMode && dragOver === cardIdx;

                  return (
                    <div key={p.id}
                      draggable={dragMode}
                      onDragStart={dragMode ? () => onSortStart(cardIdx) : undefined}
                      onDragOver={dragMode ? (e) => onSortOver(e, cardIdx) : undefined}
                      onDrop={dragMode ? () => onSortDrop(cardIdx) : undefined}
                      onDragEnd={dragMode ? onSortEnd : undefined}
                      style={{ position:'relative', background:T.bg4, border:`2px solid ${isDragTarget?T.accent:T.border}`, borderRadius:5, overflow:'hidden', display:'flex', flexDirection:'column', opacity:p.hidden&&!dragMode?0.55:1, transition:'border-color .15s, box-shadow .15s', cursor:dragMode?'grab':'default', userSelect:'none', transform:isDragTarget?'scale(1.02)':'none' }}
                      onMouseEnter={e=>{ if(!dragMode){e.currentTarget.style.borderColor=T.borderHover; e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.45)';} }}
                      onMouseLeave={e=>{ if(!dragMode){e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow='none';} }}>

                      {/* Drag handle overlay */}
                      {dragMode && (
                        <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', padding:'4px 0', background:'rgba(212,80,10,0.15)', borderBottom:`1px solid ${T.accentBorder}` }}>
                          <GripVertical size={14} style={{ color:T.accent }}/>
                          <span style={{ fontFamily:T.font, fontSize:8, letterSpacing:'0.2em', color:T.accent, marginLeft:4 }}>DRAG</span>
                        </div>
                      )}

                      {/* Image */}
                      <div style={{ position:'relative', width:'100%', paddingTop:'75%', background:T.bg5, flexShrink:0, marginTop:dragMode?26:0 }}>
                        {p.image_url
                          ? <img src={p.image_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:4 }} onError={e=>{e.target.style.display='none';}}/>
                          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={28} style={{color:T.textMute}}/></div>
                        }
                        {/* Badges top-left */}
                        <div style={{ position:'absolute', top:6, left:6, display:'flex', flexDirection:'column', gap:3 }}>
                          {p.is_new && <span style={{ fontFamily:T.font, fontSize:8, letterSpacing:'0.18em', background:T.blue, color:'#fff', padding:'2px 5px', borderRadius:2 }}>NEW</span>}
                          {p.on_promotion && <span style={{ fontFamily:T.font, fontSize:8, letterSpacing:'0.18em', background:T.accent, color:'#fff', padding:'2px 5px', borderRadius:2 }}>PROMO</span>}
                        </div>
                        {/* Hidden badge top-right */}
                        {p.hidden && <div style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.75)', padding:'2px 6px', borderRadius:3, display:'flex', alignItems:'center', gap:3 }}><Eye size={8} style={{color:T.textMute}}/><span style={{ fontSize:7, color:T.textMute, fontFamily:T.font, letterSpacing:'0.15em' }}>HIDDEN</span></div>}
                        {/* Stock dot bottom-right */}
                        <div style={{ position:'absolute', bottom:6, right:6, display:'flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.7)', padding:'2px 7px', borderRadius:10 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:stockDot, flexShrink:0 }}/>
                          <span style={{ fontFamily:T.font, fontSize:9, color:stockDot }}>{stockLabel}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ padding:'9px 10px 6px', flex:1 }}>
                        <p style={{ fontSize:11, color:T.text, margin:'0 0 4px', lineHeight:1.35, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</p>
                        <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                          <span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:T.accent }}>€{parseFloat(p.price||0).toFixed(2)}</span>
                          {p.old_price && <span style={{ fontSize:9, color:T.textMute, textDecoration:'line-through' }}>€{parseFloat(p.old_price).toFixed(2)}</span>}
                        </div>
                      </div>

                      {/* Quick toggles row (hidden in drag mode) */}
                      {!dragMode && <div style={{ padding:'0 8px 6px', display:'flex', gap:4 }}>
                        {[['on_promotion','PROMO',T.accent],['is_new','NEW',T.blue],['hidden','HIDDEN','#888']].map(([field,label,col])=>(
                          <button key={field} onClick={()=>quickToggle(p,field)} style={{ flex:1, padding:'3px 0', fontFamily:T.font, fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', background:p[field]?`${col}20`:'transparent', border:`1px solid ${p[field]?col:T.border}`, color:p[field]?col:T.textMute, borderRadius:2, cursor:'pointer', transition:'all .12s' }}>{label}</button>
                        ))}
                      </div>}

                      {/* URL input for re-processing BG */}
                      {bgState === 'await-url' && (
                        <div style={{ padding:'0 8px 6px', display:'flex', gap:4 }}>
                          <input autoFocus value={bgUrlInput[p.id]||''}
                            onChange={e=>setBgUrlInput(prev=>({...prev,[p.id]:e.target.value}))}
                            onKeyDown={e=>{ if(e.key==='Enter'&&bgUrlInput[p.id]?.trim()) runRemoveBg(p,bgUrlInput[p.id].trim()); if(e.key==='Escape'){setRemovingBg(prev=>({...prev,[p.id]:undefined}));setBgUrlInput(prev=>{const n={...prev};delete n[p.id];return n;});} }}
                            placeholder="Original image URL…"
                            style={{ flex:1, background:T.bg5, border:`1px solid ${T.dangerText}55`, color:T.text, padding:'3px 6px', fontSize:10, borderRadius:3, outline:'none', minWidth:0 }}
                          />
                          <button onClick={()=>bgUrlInput[p.id]?.trim()&&runRemoveBg(p,bgUrlInput[p.id].trim())} style={{ padding:'3px 7px', fontSize:10, background:'rgba(74,123,168,0.2)', border:'1px solid rgba(100,160,255,0.4)', color:'#6ab0ff', borderRadius:3, cursor:'pointer' }}>Go</button>
                        </div>
                      )}

                      {/* Action row */}
                      <div style={{ padding:'6px 8px 8px', display:'flex', gap:5, borderTop:`1px solid ${T.border}` }}>
                        <button onClick={()=>navigate(`/cms/products/${p.id}`)}
                          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'5px 0', background:T.bg5, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:3, cursor:'pointer', fontSize:10, fontFamily:T.font, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all .12s' }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSub;}}>
                          <Edit3 size={11}/> {t('common','edit')}
                        </button>
                        <button onClick={()=>handleRemoveBg(p)} disabled={bgState==='processing'} title={p.image_url?.startsWith('/processed/')?'Re-process':'Remove BG'}
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'5px 8px', background:'transparent', border:`1px solid ${bgState==='done'?T.olive:bgState==='error'?T.dangerText:'rgba(100,160,255,0.3)'}`, color:bgState==='done'?T.olive:bgState==='error'?T.dangerText:'#6ab0ff', borderRadius:3, cursor:'pointer', opacity:bgState==='processing'?0.4:1, transition:'all .12s', flexShrink:0 }}>
                          {bgState==='processing'?<RefreshCw size={11} style={{animation:'spin 1s linear infinite'}}/>:bgState==='done'?<Check size={11}/>:<Scissors size={11}/>}
                        </button>
                        <button onClick={()=>setConfirmDel(p)}
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'5px 8px', background:'transparent', border:`1px solid ${T.border}`, color:T.textMute, borderRadius:3, cursor:'pointer', transition:'all .12s', flexShrink:0 }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.dangerText;e.currentTarget.style.color=T.dangerText;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMute;}}>
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{ gridColumn:'1 / -1', padding:'60px 0', textAlign:'center', color:T.textMute, fontFamily:T.font, fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase' }}>
                    {t('products','noResults')}
                  </div>
                )}
              </div>
            )}

            {/* ── LIST ── */}
            {viewMode === 'list' && (
              <Card style={{ padding:0, overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:780 }}>
                    <thead>
                      <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                        {['',t('products','col_name'),t('products','col_price'),t('products','col_stock'),'Promo','New',t('products','hidden'),''].map((h,i)=>(
                          <th key={i} style={{ padding:'10px 10px', textAlign:'left', fontFamily:T.font, fontSize:9, letterSpacing:'0.22em', color:T.textMute, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p,i) => (
                        <tr key={p.id} style={{ borderBottom:i<filtered.length-1?`1px solid ${T.border}`:'none', transition:'background .1s', opacity:p.hidden?0.55:1 }}
                          onMouseEnter={e=>e.currentTarget.style.background=T.bg5}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'8px 8px 8px 12px' }}><ProductImg src={p.image_url} size={42}/></td>
                          <td style={{ padding:'8px 10px', minWidth:190, maxWidth:260 }}>
                            <p style={{ fontSize:12, color:T.text, lineHeight:1.4, margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</p>
                            {p.badge_text && <span style={{ fontSize:9, background:p.badge_color||T.accent, color:'#fff', padding:'1px 5px', borderRadius:2, fontFamily:T.font }}>{p.badge_text}</span>}
                          </td>
                          <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                            <span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:T.accent }}>€{parseFloat(p.price||0).toFixed(2)}</span>
                            {p.old_price && <span style={{ fontSize:10, color:T.textMute, textDecoration:'line-through', marginLeft:5 }}>€{parseFloat(p.old_price).toFixed(2)}</span>}
                          </td>
                          <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                            <span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:(p.stock_quantity??0)===0?T.dangerText:(p.stock_quantity??0)<=5?T.warnText:T.successText }}>{p.track_stock===false?'∞':p.stock_quantity}</span>
                          </td>
                          <td style={{ padding:'8px 10px' }}><Toggle on={!!p.on_promotion} onChange={()=>quickToggle(p,'on_promotion')} size={18}/></td>
                          <td style={{ padding:'8px 10px' }}><Toggle on={!!p.is_new} onChange={()=>quickToggle(p,'is_new')} size={18}/></td>
                          <td style={{ padding:'8px 10px' }}><Toggle on={!!p.hidden} onChange={()=>quickToggle(p,'hidden')} size={18}/></td>
                          <td style={{ padding:'8px 12px 8px 10px' }}>
                            <div style={{ display:'flex', gap:5 }}>
                              <Btn size="sm" variant="ghost" onClick={()=>navigate(`/cms/products/${p.id}`)}><Edit3 size={11}/> {t('common','edit')}</Btn>
                              <Btn size="sm" variant="danger" onClick={()=>setConfirmDel(p)}><Trash2 size={11}/></Btn>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length===0 && <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:T.textMute, fontFamily:T.font, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase' }}>{t('products','noResults')}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.8)' }}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} style={{ background:T.bg2, border:`1px solid rgba(127,29,29,0.5)`, borderRadius:6, padding:28, maxWidth:420, width:'100%' }}>
              <AlertTriangle size={24} style={{ color:T.dangerText, marginBottom:12 }}/>
              <p style={{ fontFamily:T.font, fontSize:14, color:T.text, marginBottom:8 }}>{t('products','confirmDel')}</p>
              <p style={{ fontSize:12, color:T.textSub, marginBottom:20, lineHeight:1.6 }}>{t('products','confirmDelSub')}: <strong style={{color:T.text}}>{confirmDel.name}</strong></p>
              <div style={{ display:'flex', gap:10 }}>
                <Btn variant="ghost" onClick={()=>setConfirmDel(null)}>{t('common','cancel')}</Btn>
                <Btn variant="danger" onClick={()=>handleDel(confirmDel.id)}><Trash2 size={12}/> {t('common','delete')}</Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{modal && <ProductModal product={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}</AnimatePresence>
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// Sidebar item helper
function SidebarItem({ label, count, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'8px 14px', background:selected?T.accentDim:'transparent', borderLeft:selected?`2px solid ${T.accent}`:'2px solid transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background .12s' }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=T.bg5; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background='transparent'; }}>
      <span style={{ fontFamily:T.font, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:selected?T.accent:T.textSub }}>{label}</span>
      <span style={{ fontFamily:T.font, fontSize:9, color:T.textMute, background:T.bg5, padding:'1px 6px', borderRadius:8 }}>{count}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: CATEGORIES & PAGES
// ═══════════════════════════════════════════════════════════════════════════════

const ICON_OPTIONS = ['Crosshair','Target','Shield','Eye','Shirt','Circle','Wrench','Package','Star','Zap','Hash','Globe'];
const COLOR_OPTIONS = ['#D4500A','#C8921A','#6B8E4E','#4A7BA8','#8B5E3C','#888888','#7B7B7B','#7B3F7B'];

function CatModal({ cat, parents, onClose, onSave }) {
  const isNew = !cat;
  const [form, setForm] = useState({
    name: cat?.name || '',
    parent: cat?.parent || '',
    slug: cat?.slug || '',
    icon: '',
    color: '#D4500A',
  });
  const [saving, setSaving] = useState(false);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <ModalShell
      title={isNew ? 'New Category' : `Edit: ${cat.name}`}
      tag="Categories & Pages"
      onClose={onClose}
      width={540}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving||!form.name.trim()}><Save size={13}/>{saving?'Saving…':'Save Category'}</Btn></>}
    >
      <Field label="Category Name"><Inp value={form.name} onChange={v=>upd('name',v)} placeholder="e.g. AEG Карабини"/></Field>
      <Field label="Parent Category" labelSub="Leave empty for top-level">
        <Sel value={form.parent} onChange={v=>upd('parent',v)} options={[{v:'',l:'— Top level (no parent) —'},...parents.map(p=>({v:p,l:p}))]}/>
      </Field>
      <Field label="URL Slug" labelSub="Auto-generated if left empty"><Inp value={form.slug} onChange={v=>upd('slug',v)} placeholder="e.g. aeg-karabini"/></Field>
    </ModalShell>
  );
}

function NavCategoryEditor({ cats, onChange }) {
  const [editing, setEditing] = useState(null);

  const updateCat = (i, field, value) => {
    const next = cats.map((c,j)=>j===i?{...c,[field]:value}:c);
    onChange(next);
  };
  const removeCat = (i) => onChange(cats.filter((_,j)=>j!==i));
  const addCat = () => onChange([...cats,{id:`cat_${Date.now()}`,label:'New Category',label_bg:'Нова Категория',sub:'',sub_bg:'',icon:'Circle',color:'#D4500A'}]);

  if (editing !== null) {
    const c = cats[editing];
    return (
      <div>
        <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',color:T.textSub,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12,marginBottom:20}}>
          <ChevronLeft size={14}/> Back to list
        </button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <Field label="Label (English)"><Inp value={c.label} onChange={v=>updateCat(editing,'label',v)}/></Field>
          <Field label="Label (Bulgarian)"><Inp value={c.label_bg} onChange={v=>updateCat(editing,'label_bg',v)}/></Field>
          <Field label="Sub-label (English)"><Inp value={c.sub} onChange={v=>updateCat(editing,'sub',v)} placeholder="e.g. AEG · GBB · HPA"/></Field>
          <Field label="Sub-label (Bulgarian)"><Inp value={c.sub_bg} onChange={v=>updateCat(editing,'sub_bg',v)} placeholder="e.g. AEG · GBB · HPA"/></Field>
          <Field label="Icon"><Sel value={c.icon} onChange={v=>updateCat(editing,'icon',v)} options={ICON_OPTIONS}/></Field>
          <Field label="Accent Color">
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
              {COLOR_OPTIONS.map(col=>(
                <button key={col} onClick={()=>updateCat(editing,'color',col)} style={{width:26,height:26,borderRadius:3,background:col,border:c.color===col?'2px solid #fff':'2px solid transparent',cursor:'pointer'}}/>
              ))}
            </div>
            <Inp value={c.color} onChange={v=>updateCat(editing,'color',v)}/>
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{fontSize:12,color:T.textSub,marginBottom:16}}>These are the navigation categories shown in the Category Strip on your website homepage.</p>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
        {cats.map((c,i)=>(
          <div key={c.id||i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:T.bg5,border:`1px solid ${T.border}`,borderRadius:3}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:c.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:13,color:T.text}}>{c.label} <span style={{color:T.textMute,fontSize:11}}>/ {c.label_bg}</span></p>
              <p style={{fontSize:11,color:T.textMute}}>{c.sub}</p>
            </div>
            <div style={{display:'flex',gap:6}}>
              <Btn size="sm" variant="ghost" onClick={()=>setEditing(i)}><Edit3 size={11}/> Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>removeCat(i)}><Trash2 size={11}/></Btn>
            </div>
          </div>
        ))}
      </div>
      <Btn variant="ghost" onClick={addCat}><Plus size={13}/> Add Navigation Category</Btn>
    </div>
  );
}

function Categories() {
  const { data, update } = useSiteData();
  const [dbCats, setDbCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | cat object
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('nav'); // 'nav' | 'db'
  const [saveTimer, setSaveTimer] = useState(null);

  const showToast = (msg,type='success')=>setToast({msg,type});

  useEffect(()=>{
    fetch(`${API}/api/categories`).then(r=>r.json()).then(d=>{ setDbCats(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  const navCats = data.categories || DEFAULT_DATA.categories;

  const handleNavChange = (newCats) => {
    update('categories', newCats);
    if (saveTimer) clearTimeout(saveTimer);
    setSaveTimer(setTimeout(()=>showToast('Navigation categories saved'),800));
  };

  const handleDbSave = async (form) => {
    try {
      if (modal && modal !== 'add') {
        const r = await fetch(`${API}/api/categories/${modal.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
        const updated = await r.json();
        setDbCats(p=>p.map(c=>c.id===modal.id?updated:c));
      } else {
        const r = await fetch(`${API}/api/categories`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
        const created = await r.json();
        setDbCats(p=>[...p,created]);
      }
      showToast('Category saved');
    } catch(e) { showToast(e.message,'error'); }
  };

  const handleDbDelete = async (id) => {
    try {
      await fetch(`${API}/api/categories/${id}`,{method:'DELETE'});
      setDbCats(p=>p.filter(c=>c.id!==id));
      showToast('Category deleted');
    } catch(e) { showToast(e.message,'error'); }
  };

  const parents = [...new Set(dbCats.map(c=>c.name))].sort();

  // Group DB cats by parent
  const topLevel = dbCats.filter(c=>!c.parent);
  const grouped = {};
  dbCats.filter(c=>c.parent).forEach(c=>{
    if (!grouped[c.parent]) grouped[c.parent]=[];
    grouped[c.parent].push(c);
  });

  return (
    <div>
      <SectionHead title="Categories & Pages" sub="Manage website navigation and product categories"/>

      {/* Tab switcher */}
      <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,marginBottom:24}}>
        {[['nav','Navigation Categories'],['db','Product Categories (DB)']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'10px 20px',background:'transparent',border:'none',cursor:'pointer',fontFamily:T.font,fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',color:activeTab===id?T.accent:T.textMute,borderBottom:activeTab===id?`2px solid ${T.accent}`:'2px solid transparent',transition:'all .15s'}}>{label}</button>
        ))}
      </div>

      {activeTab==='nav' && (
        <NavCategoryEditor cats={navCats} onChange={handleNavChange}/>
      )}

      {activeTab==='db' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <p style={{fontSize:12,color:T.textSub}}>Product categories imported from Gombashop. Used for filtering products.</p>
            <Btn onClick={()=>setModal('add')}><Plus size={13}/> Add Category</Btn>
          </div>
          {loading ? (
            <p style={{color:T.textMute,fontFamily:T.font,fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase'}}>Loading…</p>
          ) : (
            <Card style={{padding:0}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${T.border}`}}>
                      {['Name','Parent','Slug','Products',''].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontFamily:T.font,fontSize:9,letterSpacing:'0.22em',color:T.textMute,textTransform:'uppercase'}}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {dbCats.map((c,i)=>(
                      <tr key={c.id} style={{borderBottom:i<dbCats.length-1?`1px solid ${T.border}`:'none'}} onMouseEnter={e=>e.currentTarget.style.background=T.bg5} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'10px 14px',fontSize:13,color:T.text}}>{c.name}</td>
                        <td style={{padding:'10px 14px',fontSize:11,color:T.textSub}}>{c.parent||<span style={{color:T.textMute,fontSize:10,fontStyle:'italic'}}>Top level</span>}</td>
                        <td style={{padding:'10px 14px',fontFamily:T.font,fontSize:10,letterSpacing:'0.1em',color:T.textMute}}>{c.slug}</td>
                        <td style={{padding:'10px 14px',fontSize:11,color:T.textSub}}>—</td>
                        <td style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <Btn size="sm" variant="ghost" onClick={()=>setModal(c)}><Edit3 size={11}/></Btn>
                            <Btn size="sm" variant="danger" onClick={()=>handleDbDelete(c.id)}><Trash2 size={11}/></Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      <AnimatePresence>{modal && <CatModal cat={modal==='add'?null:modal} parents={parents} onClose={()=>setModal(null)} onSave={handleDbSave}/>}</AnimatePresence>
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: BANNERS
// ═══════════════════════════════════════════════════════════════════════════════

function HeroSlideEditor({ slides, onChange }) {
  const [sel, setSel] = useState(0);
  const s = slides[sel];
  const upd = (field, val) => {
    const next = slides.map((sl,i)=>i===sel?{...sl,[field]:val}:sl);
    onChange(next);
  };
  const updHeadline = (lang, idx, val) => {
    const key = lang==='en'?'headline':'headline_bg';
    const arr = [...(s[key]||['',''])];
    arr[idx] = val;
    upd(key, arr);
  };

  return (
    <div>
      {/* Slide selector */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {slides.map((sl,i)=>(
          <button key={i} onClick={()=>setSel(i)} style={{padding:'8px 16px',borderRadius:3,border:`1px solid ${i===sel?T.accent:T.border}`,background:i===sel?T.accentDim:'transparent',color:i===sel?T.accent:T.textSub,cursor:'pointer',fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase'}}>
            Slide {i+1}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* English */}
        <div>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.blue,textTransform:'uppercase',marginBottom:12}}>🇬🇧 English</p>
          <Field label="Tag / Label"><Inp value={s.tag} onChange={v=>upd('tag',v)} placeholder="e.g. NEW SEASON DROP"/></Field>
          <Field label="Headline Line 1"><Inp value={s.headline?.[0]||''} onChange={v=>updHeadline('en',0,v)} placeholder="DOMINATE"/></Field>
          <Field label="Headline Line 2"><Inp value={s.headline?.[1]||''} onChange={v=>updHeadline('en',1,v)} placeholder="THE FIELD"/></Field>
          <Field label="Subheading"><Txt value={s.sub} onChange={v=>upd('sub',v)} rows={3}/></Field>
          <Field label="CTA Button Text"><Inp value={s.cta} onChange={v=>upd('cta',v)} placeholder="Shop Now"/></Field>
        </div>
        {/* Bulgarian */}
        <div>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.gold,textTransform:'uppercase',marginBottom:12}}>🇧🇬 Bulgarian</p>
          <Field label="Tag / Label"><Inp value={s.tag_bg} onChange={v=>upd('tag_bg',v)} placeholder="НОВА СЕЗОННА КОЛЕКЦИЯ"/></Field>
          <Field label="Headline Line 1"><Inp value={s.headline_bg?.[0]||''} onChange={v=>updHeadline('bg',0,v)} placeholder="ДОМИНИРАЙ"/></Field>
          <Field label="Headline Line 2"><Inp value={s.headline_bg?.[1]||''} onChange={v=>updHeadline('bg',1,v)} placeholder="НА ТЕРЕНА"/></Field>
          <Field label="Subheading"><Txt value={s.sub_bg} onChange={v=>upd('sub_bg',v)} rows={3}/></Field>
          <Field label="CTA Button Text"><Inp value={s.cta_bg} onChange={v=>upd('cta_bg',v)} placeholder="Разгледай"/></Field>
        </div>
        <Field label="Accent Word Index" labelSub="0 = first word highlighted, 1 = second word" col="1/-1">
          <Sel value={String(s.accentWord??1)} onChange={v=>upd('accentWord',parseInt(v))} options={[{v:'0',l:'Line 1 (first word)'},{v:'1',l:'Line 2 (second word)'}]}/>
        </Field>
      </div>
    </div>
  );
}

function PromoBannerEditor({ banners, onChange }) {
  const [sel, setSel] = useState(0);
  const b = banners[sel];
  const upd = (field, val) => { const next = banners.map((bn,i)=>i===sel?{...bn,[field]:val}:bn); onChange(next); };

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {banners.map((bn,i)=>(
          <button key={i} onClick={()=>setSel(i)} style={{padding:'8px 16px',borderRadius:3,border:`1px solid ${i===sel?T.accent:T.border}`,background:i===sel?T.accentDim:'transparent',color:i===sel?T.accent:T.textSub,cursor:'pointer',fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase'}}>
            {bn.id||`Banner ${i+1}`}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.blue,textTransform:'uppercase',marginBottom:12}}>🇬🇧 English</p>
          <Field label="Tag"><Inp value={b.tag} onChange={v=>upd('tag',v)}/></Field>
          <Field label="Title"><Inp value={b.title} onChange={v=>upd('title',v)}/></Field>
          <Field label="Subtitle"><Inp value={b.sub} onChange={v=>upd('sub',v)}/></Field>
          <Field label="Body Text"><Txt value={b.body} onChange={v=>upd('body',v)} rows={3}/></Field>
          <Field label="CTA Button"><Inp value={b.cta} onChange={v=>upd('cta',v)}/></Field>
        </div>
        <div>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.gold,textTransform:'uppercase',marginBottom:12}}>🇧🇬 Bulgarian</p>
          <Field label="Tag"><Inp value={b.tag_bg} onChange={v=>upd('tag_bg',v)}/></Field>
          <Field label="Title"><Inp value={b.title_bg} onChange={v=>upd('title_bg',v)}/></Field>
          <Field label="Subtitle"><Inp value={b.sub_bg} onChange={v=>upd('sub_bg',v)}/></Field>
          <Field label="Body Text"><Txt value={b.body_bg} onChange={v=>upd('body_bg',v)} rows={3}/></Field>
          <Field label="CTA Button"><Inp value={b.cta_bg} onChange={v=>upd('cta_bg',v)}/></Field>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
        <Field label="Accent Color">
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
            {COLOR_OPTIONS.map(c=><button key={c} onClick={()=>upd('accentColor',c)} style={{width:24,height:24,borderRadius:3,background:c,border:b.accentColor===c?'2px solid #fff':'2px solid transparent',cursor:'pointer'}}/>)}
          </div>
          <Inp value={b.accentColor} onChange={v=>upd('accentColor',v)}/>
        </Field>
        <Field label="Gradient Direction">
          <Sel value={b.gradientDir} onChange={v=>upd('gradientDir',v)} options={['to right','to left','to bottom','to top']}/>
        </Field>
        <Field label="Image Seed" labelSub="Number used to generate background image">
          <Inp value={b.imgSeed} onChange={v=>upd('imgSeed',v)} placeholder="10"/>
        </Field>
      </div>
    </div>
  );
}

function Banners() {
  const { data, update } = useSiteData();
  const [activeTab, setActiveTab] = useState('hero');
  const [toast, setToast] = useState(null);
  const [saveTimer, setSaveTimer] = useState(null);

  const heroSlides = data.heroSlides || DEFAULT_DATA.heroSlides;
  const banners = data.banners || DEFAULT_DATA.banners;

  const autoSave = (key, val) => {
    update(key, val);
    if (saveTimer) clearTimeout(saveTimer);
    setSaveTimer(setTimeout(()=>setToast({msg:'Changes saved automatically',type:'success'}), 1000));
  };

  return (
    <div>
      <SectionHead title="Banners & Media" sub="Edit all promotional content and hero slides. Changes are saved automatically."/>

      <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,marginBottom:28}}>
        {[['hero','Hero Slides'],['promo','Promo Banners']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'10px 20px',background:'transparent',border:'none',cursor:'pointer',fontFamily:T.font,fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',color:activeTab===id?T.accent:T.textMute,borderBottom:activeTab===id?`2px solid ${T.accent}`:'2px solid transparent',transition:'all .15s'}}>{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:.18}}>
          {activeTab==='hero' && <HeroSlideEditor slides={heroSlides} onChange={v=>autoSave('heroSlides',v)}/>}
          {activeTab==='promo' && <PromoBannerEditor banners={banners} onChange={v=>autoSave('banners',v)}/>}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function SalesChart({ data }) {
  if (!data || data.length === 0) return <p style={{color:T.textMute,fontSize:12,textAlign:'center',padding:'40px 0'}}>No order data yet</p>;
  const W=600, H=160, pad=40;
  const max = Math.max(...data.map(d => parseFloat(d.revenue)), 1);
  const pts = data.map((d,i) => ({
    x: pad + (data.length === 1 ? (W-pad*2)/2 : (i/(data.length-1))*(W-pad*2)),
    y: H - pad - (parseFloat(d.revenue)/max)*(H-pad*2),
    d,
  }));
  const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${pts[pts.length-1].x},${H-pad} L${pts[0].x},${H-pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'auto',overflow:'visible'}}>
      <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity="0.3"/><stop offset="100%" stopColor={T.accent} stopOpacity="0"/></linearGradient></defs>
      {[0.25,0.5,0.75,1].map(v=><line key={v} x1={pad} y1={H-pad-(v*(H-pad*2))} x2={W-pad} y2={H-pad-(v*(H-pad*2))} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
      <path d={area} fill="url(#cg)"/>
      <path d={path} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={T.accent} stroke={T.bg4} strokeWidth="2"/>
          <text x={p.x} y={H-6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily={T.font}>{p.d.month}</text>
          <text x={p.x} y={p.y-10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily={T.font}>
            {`€${parseFloat(p.d.revenue)>=1000?(parseFloat(p.d.revenue)/1000).toFixed(1)+'k':parseFloat(p.d.revenue).toFixed(0)}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatCard({ label, value, sub, icon:Icon, color, onClick }) {
  return (
    <Card style={{borderLeft:`3px solid ${color}`,cursor:onClick?'pointer':'default'}} onClick={onClick}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase'}}>{label}</span>
        <Icon size={16} style={{color,opacity:.7}}/>
      </div>
      <p style={{fontFamily:T.font,fontSize:28,fontWeight:700,color,lineHeight:1,marginBottom:6}}>{value}</p>
      <p style={{fontSize:11,color:T.textMute}}>{sub}</p>
    </Card>
  );
}


function Dashboard({ onNav }) {
  const { data: siteData, productsLoading } = useSiteData();
  const t = useCmsT();
  const products = siteData.products || [];
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/stats?period=${period}`)
      .then(r=>r.json())
      .then(d=>{ setStats(d); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [period]);

  const fmt = (n) => `€${parseFloat(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const num = (n) => parseInt(n||0).toLocaleString();

  const o = stats?.orders || {};
  const p = stats?.products || {};
  const lowStock   = productsLoading ? '…' : products.filter(pr=>pr.stock_quantity>0&&pr.stock_quantity<=5).length;
  const outOfStock = productsLoading ? '…' : products.filter(pr=>pr.stock_quantity===0).length;

  const revThisMonth = parseFloat(o.revenue_this_month || 0);
  const revLastMonth = parseFloat(o.revenue_last_month || 0);
  const revChange    = revLastMonth > 0 ? ((revThisMonth - revLastMonth) / revLastMonth * 100).toFixed(1) : null;

  const statusColors = { Pending:'#fb923c', Processing:'#60a5fa', Shipped:'#4ade80', Delivered:'#22c55e', Cancelled:'#f87171', Returned:'#a78bfa' };
  const chartLabel = t('chartLabel', period);
  const periodKeys = ['today','week','month','quarter','year','all'];

  return (
    <div>
      <SectionHead title={t('dash','title')} sub={loading ? t('common','loading') : t('periods',period) + ' overview'}>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {periodKeys.map(pk=>(
            <button key={pk} onClick={()=>setPeriod(pk)}
              style={{
                padding:'5px 12px', borderRadius:3, border:`1px solid ${period===pk ? T.accent : T.border}`,
                background: period===pk ? 'rgba(212,80,10,0.15)' : T.bg3,
                color: period===pk ? T.accent : T.textSub,
                fontFamily:T.font, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase',
                cursor:'pointer', transition:'all 0.15s',
              }}
            >{t('periods',pk)}</button>
          ))}
        </div>
      </SectionHead>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:14,marginBottom:20}}>
        <StatCard label={t('dash','totalRev')} value={loading?'…':fmt(o.total_revenue)} sub={`${fmt(o.paid_revenue)} ${t('dash','confirmedPaid')}`} icon={Euro} color={T.accent}/>
        <StatCard label={t('dash','revMonth')} value={loading?'…':fmt(o.revenue_this_month)}
          sub={revChange!==null?`${revChange>0?'+':''}${revChange}${t('dash','vsLast')}`:`${t('dash','lastMonth')}: ${fmt(o.revenue_last_month)}`}
          icon={revChange>=0?TrendingUp:TrendingDown} color={revChange>=0?T.olive:'#ef4444'}/>
        <StatCard label={t('dash','totalOrders')} value={loading?'…':num(o.total_orders)} sub={`${num(o.orders_this_month)} ${t('periods','month').toLowerCase()} · ${num(o.orders_last_month)} ${t('dash','lastMonth').toLowerCase()}`} icon={ShoppingCart} color={T.blue} onClick={()=>onNav('orders')}/>
        <StatCard label={t('dash','avgOrder')} value={loading?'…':fmt(o.avg_order_value)} sub={`${num(o.paid_orders)} ${t('dash','paid')} · ${num(o.unpaid_orders)} ${t('dash','unpaid')}`} icon={BarChart2} color={T.gold}/>
        <StatCard label={t('dash','products')} value={loading?'…':num(p.total_products||products.length)} sub={`${p.out_of_stock||outOfStock} ${t('dash','outOfStock')} · ${p.low_stock||lowStock} ${t('dash','lowStock')}`} icon={Package} color={T.accent} onClick={()=>onNav('products')}/>
        <StatCard label={t('dash','onPromo')} value={loading?'…':num(p.on_promotion)} sub={`${num(p.is_new)} ${t('dash','markedNew')} · ${num(p.hidden)} ${t('dash','hidden')}`} icon={Tag} color={T.gold} onClick={()=>onNav('products')}/>
      </div>

      <Card style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <p style={{fontFamily:T.font,fontSize:11,letterSpacing:'0.3em',color:T.accent,textTransform:'uppercase'}}>{t('dash','chart')} — {chartLabel}</p>
          <span style={{fontSize:11,color:T.textMute}}>{stats?.revenueByMonth?.length||0} {t('periods','month').toLowerCase()}</span>
        </div>
        {loading ? <p style={{color:T.textMute,fontSize:12,textAlign:'center',padding:'40px 0'}}>{t('common','loading')}</p> : <SalesChart data={stats?.revenueByMonth||[]}/>}
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <Card>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.accent,textTransform:'uppercase',marginBottom:16}}>{t('dash','byStatus')}</p>
          {loading ? <p style={{color:T.textMute,fontSize:12}}>{t('common','loading')}</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(stats?.statusBreakdown||[]).map(row=>{
                const tot = parseInt(o.total_orders||1);
                const pct = Math.round(parseInt(row.count)/tot*100);
                const color = statusColors[row.status]||T.textSub;
                return (
                  <div key={row.status}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,color,fontFamily:T.font,letterSpacing:'0.1em',textTransform:'uppercase'}}>{row.status}</span>
                      <span style={{fontSize:12,color:T.textSub}}>{num(row.count)} · {fmt(row.revenue)}</span>
                    </div>
                    <div style={{height:4,background:T.bg5,borderRadius:2}}>
                      <div style={{height:4,background:color,borderRadius:2,width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
              {!stats?.statusBreakdown?.length && <p style={{color:T.textMute,fontSize:12}}>{t('dash','noOrders')}</p>}
            </div>
          )}
        </Card>

        <Card>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.accent,textTransform:'uppercase',marginBottom:16}}>{t('dash','topCities')}</p>
          {loading ? <p style={{color:T.textMute,fontSize:12}}>{t('common','loading')}</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(stats?.topCities||[]).map((row,i)=>(
                <div key={row.city} style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontFamily:T.font,fontSize:11,color:T.textMute,width:16,flexShrink:0}}>#{i+1}</span>
                  <span style={{flex:1,fontSize:13,color:T.text}}>{row.city}</span>
                  <span style={{fontSize:12,color:T.textSub}}>{num(row.orders)}</span>
                  <span style={{fontSize:12,color:T.accent,fontFamily:T.font}}>{fmt(row.revenue)}</span>
                </div>
              ))}
              {!stats?.topCities?.length && <p style={{color:T.textMute,fontSize:12}}>{t('dash','noData')}</p>}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.accent,textTransform:'uppercase'}}>{t('dash','recent')}</p>
          <Btn size="sm" variant="ghost" onClick={()=>onNav('orders')}>{t('common','viewAll')} <ChevronRight size={11}/></Btn>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
            {[t('orders','num'),t('orders','customer'),t('orders','city'),t('orders','total'),t('orders','paid'),t('orders','status'),t('orders','date')].map(h=>(
              <th key={h} style={{padding:'7px 10px',textAlign:'left',fontFamily:T.font,fontSize:9,letterSpacing:'0.18em',color:T.textMute,textTransform:'uppercase'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{padding:24,textAlign:'center',color:T.textMute,fontSize:12}}>{t('common','loading')}</td></tr>
            ) : (stats?.recentOrders||[]).map((ord,i,arr)=>(
              <tr key={ord.id} style={{borderBottom:i<arr.length-1?`1px solid ${T.border}`:'none',cursor:'pointer'}}
                onClick={()=>onNav('orders')}
                onMouseEnter={e=>e.currentTarget.style.background=T.bg5}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'8px 10px',fontFamily:T.font,fontSize:11,color:T.accent}}>#{ord.order_number||ord.id}</td>
                <td style={{padding:'8px 10px',fontSize:12,color:T.text}}>{ord.customer_name||'—'}</td>
                <td style={{padding:'8px 10px',fontSize:11,color:T.textSub}}>{ord.delivery_city||'—'}</td>
                <td style={{padding:'8px 10px',fontFamily:T.font,fontSize:13,fontWeight:700,color:T.accent}}>€{parseFloat(ord.total||0).toFixed(2)}</td>
                <td style={{padding:'8px 10px',fontSize:11,fontFamily:T.font,color:ord.paid?T.successText:T.dangerText}}>{ord.paid?t('common','yes'):t('common','no')}</td>
                <td style={{padding:'8px 10px'}}><OrderStatusBadge status={ord.status}/></td>
                <td style={{padding:'8px 10px',fontSize:11,color:T.textMute}}>{ord.created_at?new Date(ord.created_at).toLocaleDateString('bg-BG'):'—'}</td>
              </tr>
            ))}
            {!loading && !stats?.recentOrders?.length && (
              <tr><td colSpan={7} style={{padding:24,textAlign:'center',color:T.textMute,fontFamily:T.font,fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase'}}>{t('dash','noOrders')}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

// Fetch current backend startedAt timestamp (null if unreachable)
async function getStartedAt() {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 2000);
    const r = await fetch(`${API}/api/health`, { signal: ctrl.signal });
    if (r.ok) { const j = await r.json(); return j.startedAt ?? null; }
  } catch {}
  return null;
}

// Poll backend health until startedAt changes (proves fresh restart), or timeout
async function pollBackendRestart({ interval = 1500, maxWait = 30000 } = {}) {
  const before = await getStartedAt();
  // Wait a moment for the process to die before polling
  await new Promise(res => setTimeout(res, 1500));
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    const after = await getStartedAt();
    if (after !== null && after !== before) return 'online';
    await new Promise(res => setTimeout(res, interval));
  }
  return 'timeout';
}

// Poll a generic URL until it responds (for frontend)
async function pollUntilUp(url, { interval = 1500, maxWait = 30000 } = {}) {
  await new Promise(res => setTimeout(res, 1500));
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 2000);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (r.ok) return 'online';
    } catch { /* still down */ }
    await new Promise(res => setTimeout(res, interval));
  }
  return 'timeout';
}

function ServiceStatus({ label, status }) {
  // status: null | 'restarting' | 'online' | 'timeout'
  if (!status) return null;
  const cfg = {
    restarting: { color:'#C8921A', dot:'#C8921A', text: label + '…' },
    online:     { color:'#4ade80', dot:'#4ade80', text: label + ' ✓' },
    timeout:    { color:'#ef4444', dot:'#ef4444', text: label + ' ✗' },
  }[status];
  return (
    <div style={{display:'flex',alignItems:'center',gap:7,marginTop:6}}>
      <span style={{width:7,height:7,borderRadius:'50%',background:cfg.dot,flexShrink:0,
        boxShadow:status==='restarting'?`0 0 6px ${cfg.dot}`:'none',
        animation:status==='restarting'?'pulse 1.2s ease-in-out infinite':'none'}}/>
      <span style={{fontFamily:'Inter,sans-serif',fontSize:12,color:cfg.color}}>{cfg.text}</span>
    </div>
  );
}

function StoreSettings() {
  const t = useCmsT();
  const { data, update, reset } = useSiteData();
  const [settings, setSettings] = useState(data.settings||DEFAULT_DATA.settings);
  const [toast, setToast] = useState(null);
  const [restartTarget, setRestartTarget] = useState('backend');
  const [restarting, setRestarting] = useState(false);
  // per-service status: null | 'restarting' | 'online' | 'timeout'
  const [backendStatus,  setBackendStatus]  = useState(null);
  const [frontendStatus, setFrontendStatus] = useState(null);

  const upd=(k,v)=>setSettings(p=>({...p,[k]:v}));
  const save=()=>{ update('settings',settings); setToast({msg:t('settings','saved'),type:'success'}); };

  // Resume backend polling after page reloads (e.g. frontend restart caused reload)
  useEffect(() => {
    const savedBefore = sessionStorage.getItem('restart_backend_before');
    if (!savedBefore) return;
    const age = Date.now() - parseInt(sessionStorage.getItem('restart_backend_ts') || '0', 10);
    sessionStorage.removeItem('restart_backend_before');
    sessionStorage.removeItem('restart_backend_ts');
    if (age > 60000) return;
    setBackendStatus('restarting');
    // Poll until startedAt differs from the pre-restart snapshot we saved
    (async () => {
      const before = parseInt(savedBefore, 10) || null;
      await new Promise(res => setTimeout(res, 800));
      const deadline = Date.now() + 45000;
      while (Date.now() < deadline) {
        const after = await getStartedAt();
        if (after !== null && after !== before) { setBackendStatus('online'); return; }
        await new Promise(res => setTimeout(res, 1500));
      }
      setBackendStatus('timeout');
    })();
  }, []);

  const handleRestart = async () => {
    setRestarting(true);
    setBackendStatus(null);
    setFrontendStatus(null);

    const doBackend  = restartTarget === 'backend'  || restartTarget === 'both';
    const doFrontend = restartTarget === 'frontend' || restartTarget === 'both';

    if (doBackend)  setBackendStatus('restarting');
    if (doFrontend) setFrontendStatus('restarting');

    // When restarting both, snapshot the current startedAt BEFORE the restart
    // so after page reload we can detect the new instance even if it's already up
    if (doBackend && doFrontend) {
      const before = await getStartedAt();
      sessionStorage.setItem('restart_backend_before', String(before ?? ''));
      sessionStorage.setItem('restart_backend_ts', String(Date.now()));
    }

    try {
      await fetch(`${API}/api/admin/restart/${restartTarget}`, { method:'POST' });
    } catch { /* connection cut on backend restart — expected */ }

    setRestarting(false);

    // Poll both services in parallel (for backend-only or frontend-only restarts)
    if (!doFrontend || !doBackend) {
      const checks = [];
      if (doBackend)  checks.push(pollBackendRestart().then(s => setBackendStatus(s)));
      if (doFrontend) checks.push(pollUntilUp(`${location.origin}/`).then(s => setFrontendStatus(s)));
      await Promise.all(checks);
    }
    // For 'both': page will reload — polling continues in the useEffect above
  };

  const selStyle = {
    flex:1, background:T.bg3, border:`1px solid ${T.border}`, color:T.text,
    padding:'8px 12px', fontFamily:'Inter, sans-serif', fontSize:13,
    cursor:'pointer', outline:'none', borderRadius:3,
  };

  return (
    <div>
      <SectionHead title={t('settings','title')}><Btn onClick={save}><Save size={13}/> {t('common','save')}</Btn></SectionHead>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:680}}>
        <Card>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginBottom:14}}>{t('settings','general')}</p>
          <Field label={t('settings','storeName')}><Inp value={settings.storeName} onChange={v=>upd('storeName',v)}/></Field>
          <Field label={t('settings','tagline')}><Inp value={settings.tagline} onChange={v=>upd('tagline',v)}/></Field>
        </Card>
        <Card>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginBottom:14}}>{t('settings','security')}</p>
          <Field label={t('settings','adminPwd')}><Inp type="password" value={settings.adminPassword} onChange={v=>upd('adminPassword',v)}/></Field>
        </Card>

        {/* Server Controls */}
        <Card style={{gridColumn:'1/-1'}}>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginBottom:14}}>{t('settings','serverControls')}</p>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <select value={restartTarget} onChange={e=>{setRestartTarget(e.target.value);setBackendStatus(null);setFrontendStatus(null);}} style={selStyle}>
              <option value="backend">{t('settings','restartBackend')}</option>
              <option value="frontend">{t('settings','restartFrontend')}</option>
              <option value="both">{t('settings','restartBoth')}</option>
            </select>
            <Btn onClick={handleRestart} disabled={restarting}
              style={{flexShrink:0,opacity:restarting?0.6:1,transition:'opacity .15s'}}>
              <RefreshCw size={13} style={{animation:restarting?'spin 1s linear infinite':'none'}}/>
              {restarting ? t('settings','restarting') : t('settings','restartBtn')}
            </Btn>
          </div>
          <div style={{marginTop:4}}>
            <ServiceStatus label="Backend"  status={backendStatus}/>
            <ServiceStatus label="Frontend" status={frontendStatus}/>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
        </Card>

        <Card style={{gridColumn:'1/-1',borderColor:'rgba(127,29,29,0.4)'}}>
          <p style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:'#ef4444',textTransform:'uppercase',marginBottom:8}}>{t('settings','dangerZone')}</p>
          <p style={{fontSize:12,color:T.textSub,marginBottom:14}}>{t('settings','dangerDesc')}</p>
          <Btn variant="danger" onClick={()=>{ reset(); setToast({msg:t('settings','resetDone'),type:'success'}); }}><RotateCcw size={13}/> {t('settings','resetBtn')}</Btn>
        </Card>
      </div>
      <AnimatePresence>{toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

const ORDER_STATUSES = ['All','Pending','Processing','Shipped','Delivered','Cancelled'];
const ORDER_STATUS_FF = {
  Pending:    { bg:'#1c1008', text:'#fb923c', border:'rgba(251,146,60,0.3)' },
  Processing: { bg:'#0f1e33', text:'#60a5fa', border:'rgba(96,165,250,0.3)' },
  Shipped:    { bg:'#082010', text:'#4ade80', border:'rgba(74,222,128,0.3)' },
  Delivered:  { bg:'#052e16', text:'#22c55e', border:'rgba(34,197,94,0.3)' },
  Cancelled:  { bg:'#1f0808', text:'#f87171', border:'rgba(248,113,113,0.3)' },
};

function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS_FF[status] || { bg:T.bg5, text:T.textSub, border:T.border };
  return (
    <span style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}`, fontSize:9, fontFamily:T.font, letterSpacing:'0.18em', padding:'3px 9px', borderRadius:2, textTransform:'uppercase', whiteSpace:'nowrap' }}>
      {status}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const t = useCmsT();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleStatusSave = async () => {
    setSaving(true);
    await onStatusChange(order.id, status);
    setSaving(false);
    onClose();
  };

  const items = order.items || [];
  const productsRaw = order.products_raw || '';

  return (
    <ModalShell
      title={`Order #${order.order_number || order.id}`}
      tag={`${order.created_at ? new Date(order.created_at).toLocaleDateString('bg-BG') : '—'} · ${order.delivery_city || order.billing_city || '—'}`}
      onClose={onClose}
      width={760}
      footer={<><Btn variant="ghost" onClick={onClose}>{t('common','close')}</Btn><Btn onClick={handleStatusSave} disabled={saving||status===order.status}><Save size={13}/>{saving?t('common','saving'):t('orders','updateStatus')}</Btn></>}
    >
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Customer */}
        <Card>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:10 }}>{t('orders','custInfo')}</p>
          <p style={{ fontSize:14, color:T.text, fontWeight:600, marginBottom:4 }}>{order.customer_name || '—'}</p>
          {order.customer_email && <p style={{ fontSize:12, color:T.textSub, marginBottom:2 }}>{order.customer_email}</p>}
          {order.customer_phone && <p style={{ fontSize:12, color:T.textSub }}>{order.customer_phone}</p>}
        </Card>
        {/* Delivery */}
        <Card>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:10 }}>{t('orders','delivInfo')}</p>
          <p style={{ fontSize:12, color:T.text, marginBottom:2 }}>{order.delivery_method || '—'}</p>
          <p style={{ fontSize:12, color:T.textSub, marginBottom:2 }}>{order.delivery_address || '—'}</p>
          <p style={{ fontSize:12, color:T.textSub }}>{[order.delivery_city, order.delivery_postal].filter(Boolean).join(', ') || '—'}</p>
          {order.delivery_phone && <p style={{ fontSize:12, color:T.textSub, marginTop:2 }}>{order.delivery_phone}</p>}
        </Card>
        {/* Payment */}
        <Card>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:10 }}>{t('orders','payInfo')}</p>
          <p style={{ fontSize:12, color:T.text, marginBottom:4 }}>{order.payment_method || '—'}</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:T.textSub }}>Paid:</span>
            <span style={{ fontSize:11, color:order.paid ? T.successText : T.dangerText, fontFamily:T.font }}>{order.paid ? t('common','yes') : t('common','no')}</span>
          </div>
          {order.payment_date && <p style={{ fontSize:11, color:T.textMute, marginTop:4 }}>{new Date(order.payment_date).toLocaleDateString('bg-BG')}</p>}
        </Card>
        {/* Status */}
        <Card>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:10 }}>{t('orders','statInfo')}</p>
          <div style={{ marginBottom:10 }}><OrderStatusBadge status={order.status}/></div>
          <Sel value={status} onChange={setStatus} options={ORDER_STATUSES.filter(s=>s!=='All')}/>
        </Card>
      </div>

      {/* Products */}
      {(items.length > 0 || productsRaw) && (
        <Card style={{ marginBottom:16 }}>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:12 }}>{t('orders','prodInfo')}</p>
          {items.length > 0 ? (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['SKU','Name','Qty','Price'].map(h=><th key={h} style={{ padding:'6px 10px', textAlign:'left', fontFamily:T.font, fontSize:9, color:T.textMute, textTransform:'uppercase', letterSpacing:'0.18em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {items.map((it,i)=>(
                  <tr key={i} style={{ borderBottom:i<items.length-1?`1px solid ${T.border}`:'none' }}>
                    <td style={{ padding:'7px 10px', fontSize:11, color:T.textMute, fontFamily:T.font }}>{it.sku||'—'}</td>
                    <td style={{ padding:'7px 10px', fontSize:12, color:T.text }}>{it.name}</td>
                    <td style={{ padding:'7px 10px', fontSize:12, color:T.text }}>{it.quantity}</td>
                    <td style={{ padding:'7px 10px', fontSize:12, color:T.accent, fontFamily:T.font }}>€{parseFloat(it.price||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize:12, color:T.textSub, whiteSpace:'pre-wrap', lineHeight:1.7 }}>{productsRaw}</p>
          )}
        </Card>
      )}

      {/* Note */}
      {order.note && (
        <Card>
          <p style={{ fontFamily:T.font, fontSize:9, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase', marginBottom:8 }}>{t('orders','note')}</p>
          <p style={{ fontSize:13, color:T.text, lineHeight:1.6 }}>{order.note}</p>
        </Card>
      )}

      {/* Totals */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:24, marginTop:16, padding:'14px 0', borderTop:`1px solid ${T.border}` }}>
        {order.discount > 0 && <div style={{ textAlign:'right' }}><p style={{ fontSize:10, color:T.textMute, fontFamily:T.font, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:3 }}>Discount</p><p style={{ fontSize:14, color:T.warnText, fontFamily:T.font }}>-€{parseFloat(order.discount||0).toFixed(2)}</p></div>}
        <div style={{ textAlign:'right' }}><p style={{ fontSize:10, color:T.textMute, fontFamily:T.font, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:3 }}>Total</p><p style={{ fontSize:22, fontWeight:700, color:T.accent, fontFamily:T.font }}>€{parseFloat(order.total||0).toFixed(2)}</p></div>
      </div>
    </ModalShell>
  );
}

const ORDERS_PAGE_SIZE = 50;

function Orders() {
  const t = useCmsT();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const searchTimer = useRef(null);

  const fetchOrders = useCallback(async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: ORDERS_PAGE_SIZE });
      if (st && st !== 'All') params.set('status', st);
      if (s) params.set('search', s);
      const r = await fetch(`${API}/api/orders?${params}`);
      const d = await r.json();
      setOrders(d.orders || []);
      setTotal(d.total || 0);
      setError(null);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(1, search, statusFilter); setPage(1); }, [statusFilter]);

  const handleSearchChange = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { fetchOrders(1, v, statusFilter); setPage(1); }, 400);
  };

  const handlePage = (p) => { setPage(p); fetchOrders(p, search, statusFilter); };

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${API}/api/orders/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) });
      setOrders(prev => prev.map(o => o.id===id ? {...o, status} : o));
      setToast({ msg:t('orders','statusUpdated'), type:'success' });
    } catch(e) { setToast({ msg:e.message, type:'error' }); }
  };

  const totalPages = Math.ceil(total / ORDERS_PAGE_SIZE);

  // Summary counts
  const counts = {};
  ORDER_STATUSES.forEach(s => counts[s] = 0);
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div>
      <SectionHead title={t('orders','title')} sub={`${total} ${t('orders','inDb')}`}>
        <Btn variant="ghost" onClick={() => fetchOrders(page, search, statusFilter)}><RefreshCw size={13}/> {t('common','refresh')}</Btn>
      </SectionHead>

      {/* Status filter pills */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${statusFilter===s ? (ORDER_STATUS_FF[s]?.border || T.accent) : T.border}`, background:statusFilter===s ? (ORDER_STATUS_FF[s]?.bg || T.accentDim) : 'transparent', color:statusFilter===s ? (ORDER_STATUS_FF[s]?.text || T.accent) : T.textSub, cursor:'pointer', fontFamily:T.font, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', transition:'all .15s' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:16, maxWidth:420 }}>
        <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T.textMute }}/>
        <input value={search} onChange={e=>handleSearchChange(e.target.value)} placeholder={t('orders','search')} style={inp({paddingLeft:32})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:260, gap:14 }}>
          <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}><Crosshair size={28} style={{color:T.accent}}/></motion.div>
          <p style={{ fontFamily:T.font, fontSize:11, letterSpacing:'0.3em', color:T.textMute, textTransform:'uppercase' }}>{t('orders','loadingMsg')}</p>
        </div>
      ) : error ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:260, gap:10 }}>
          <AlertTriangle size={24} style={{color:T.dangerText}}/>
          <p style={{ color:T.dangerText, fontFamily:T.font }}>{error}</p>
        </div>
      ) : (
        <Card style={{ padding:0 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:820 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                  {[t('orders','num'),t('orders','date'),t('orders','customer'),t('orders','city'),t('orders','delivery'),t('orders','total'),t('orders','paid'),t('orders','status'),''].map(h=>(
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontFamily:T.font, fontSize:9, letterSpacing:'0.22em', color:T.textMute, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id} style={{ borderBottom:i<orders.length-1?`1px solid ${T.border}`:'none', cursor:'pointer', transition:'background .1s' }}
                    onClick={() => setSelected(o)}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bg5}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 12px', fontFamily:T.font, fontSize:11, letterSpacing:'0.1em', color:T.accent, whiteSpace:'nowrap' }}>#{o.order_number || o.id}</td>
                    <td style={{ padding:'10px 12px', fontSize:11, color:T.textSub, whiteSpace:'nowrap' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('bg-BG') : '—'}</td>
                    <td style={{ padding:'10px 12px', minWidth:160 }}>
                      <p style={{ fontSize:13, color:T.text, margin:0 }}>{o.customer_name || '—'}</p>
                      {o.customer_email && <p style={{ fontSize:10, color:T.textMute, margin:0 }}>{o.customer_email}</p>}
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:12, color:T.textSub, whiteSpace:'nowrap' }}>{o.delivery_city || o.billing_city || '—'}</td>
                    <td style={{ padding:'10px 12px', fontSize:11, color:T.textMute, whiteSpace:'nowrap', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis' }}>{o.delivery_method || '—'}</td>
                    <td style={{ padding:'10px 12px', fontFamily:T.font, fontSize:13, fontWeight:700, color:T.accent, whiteSpace:'nowrap' }}>€{parseFloat(o.total||0).toFixed(2)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ fontSize:10, fontFamily:T.font, color:o.paid?T.successText:T.dangerText, letterSpacing:'0.15em' }}>{o.paid?t('common','yes'):t('common','no')}</span>
                    </td>
                    <td style={{ padding:'10px 12px' }}><OrderStatusBadge status={o.status}/></td>
                    <td style={{ padding:'10px 12px' }}>
                      <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setSelected(o);}}><Eye size={11}/></Btn>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={9} style={{ padding:40, textAlign:'center', color:T.textMute, fontFamily:T.font, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderTop:`1px solid ${T.border}` }}>
              <span style={{ fontSize:11, color:T.textMute, fontFamily:T.font }}>Showing {(page-1)*ORDERS_PAGE_SIZE+1}–{Math.min(page*ORDERS_PAGE_SIZE,total)} of {total}</span>
              <div style={{ display:'flex', gap:6 }}>
                <Btn size="sm" variant="ghost" disabled={page===1} onClick={()=>handlePage(page-1)}><ChevronLeft size={12}/> Prev</Btn>
                {Array.from({length:Math.min(totalPages,7)},(_,i)=>{
                  const pg = totalPages<=7?i+1:page<=4?i+1:page>=totalPages-3?totalPages-6+i:page-3+i;
                  return <button key={pg} onClick={()=>handlePage(pg)} style={{width:28,height:28,borderRadius:3,border:`1px solid ${pg===page?T.accent:T.border}`,background:pg===page?T.accentDim:'transparent',color:pg===page?T.accent:T.textMute,cursor:'pointer',fontFamily:T.font,fontSize:10}}>{pg}</button>;
                })}
                <Btn size="sm" variant="ghost" disabled={page===totalPages} onClick={()=>handlePage(page+1)}>Next <ChevronRight size={12}/></Btn>
              </div>
            </div>
          )}
        </Card>
      )}

      <AnimatePresence>
        {selected && <OrderDetailModal order={selected} onClose={()=>setSelected(null)} onStatusChange={handleStatusChange}/>}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CMS SHELL
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: IMAGE SCRAPER
// ═══════════════════════════════════════════════════════════════════════════════
function ImageScraper() {
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const logRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/admin/scrape/status`);
      const d = await r.json();
      setStatus(d);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      return d;
    } catch {}
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(async () => {
      const d = await fetchStatus();
      if (d && !d.running) setPolling(false);
    }, 1200);
    return () => clearInterval(id);
  }, [polling, fetchStatus]);

  const start = async (force = false) => {
    await fetch(`${API}/api/admin/scrape/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    setPolling(true);
    fetchStatus();
  };

  const stop = async () => {
    await fetch(`${API}/api/admin/scrape/stop`, { method: 'POST' });
    fetchStatus();
    setPolling(false);
  };

  const pct = status && status.total > 0 ? Math.round((status.progress / status.total) * 100) : 0;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 860 }}>
      <p style={{ fontFamily: T.font, fontSize: 11, letterSpacing: '0.4em', color: T.accent, textTransform: 'uppercase', marginBottom: 6 }}>Tools</p>
      <h2 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Image Scraper</h2>
      <p style={{ fontSize: 13, color: T.textSub, marginBottom: 28, lineHeight: 1.6 }}>
        Crawls <strong style={{ color: T.text }}>aswarrior.bg</strong>, finds product images, matches them to your database by SKU, and saves them locally. Images are stored in <code style={{ color: T.accent, fontSize: 11 }}>/public/images/products/</code>.
      </p>

      {/* Stats row */}
      {status && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Progress', val: `${status.progress} / ${status.total || '?'}` },
            { label: 'Matched',  val: status.matched,    color: T.olive },
            { label: 'Downloaded', val: status.downloaded, color: T.accent },
            { label: 'Skipped',  val: status.skipped,    color: T.textMute },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: '10px 16px', borderRadius: 3, minWidth: 100 }}>
              <p style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.3em', color: T.textMute, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
              <p style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: color || T.text }}>{val ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {status && status.total > 0 && (
        <div style={{ height: 4, background: T.bg5, borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: T.accent, transition: 'width .4s', borderRadius: 2 }} />
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Btn onClick={() => start(false)} disabled={status?.running}>
          <Download size={13} /> {status?.running ? `Scraping… (${pct}%)` : 'Start Scrape'}
        </Btn>
        <Btn variant="ghost" onClick={() => start(true)} disabled={status?.running} title="Re-download already-saved images">
          <RefreshCw size={13} /> Force Re-download
        </Btn>
        {status?.running && (
          <Btn variant="danger" onClick={stop}><X size={13} /> Stop</Btn>
        )}
        <Btn variant="ghost" onClick={fetchStatus}><RefreshCw size={11} /> Refresh</Btn>
        <Btn variant="ghost" disabled={diagLoading} onClick={async () => {
          setDiagLoading(true); setDiagData(null);
          try {
            const r = await fetch(`${API}/api/admin/scrape/diagnose`);
            setDiagData(await r.json());
          } catch (e) { setDiagData({ error: e.message }); }
          setDiagLoading(false);
        }}>
          <Search size={11} /> {diagLoading ? 'Scanning…' : 'Diagnose URLs'}
        </Btn>
      </div>

      {/* Diagnostic output */}
      {diagData && (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 3, marginBottom: 20 }}>
          <div style={{ padding: '8px 14px', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.font, fontSize: 10, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase' }}>URL Structure Diagnosis</span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7 }}>
            {diagData.error && <div style={{ color: T.dangerText }}>{diagData.error}</div>}
            {diagData.sitemapError && <div style={{ color: T.warnText }}>Sitemap error: {diagData.sitemapError}</div>}
            {diagData.sitemapIndexUrls?.length > 0 && <>
              <div style={{ color: T.accent, marginBottom: 4 }}>— sitemap_index.xml —</div>
              {diagData.sitemapIndexUrls.map((u,i) => <div key={i} style={{ color: T.textSub }}>{u}</div>)}
            </>}
            {diagData.sitemapUrls?.length > 0 && <>
              <div style={{ color: T.accent, margin: '8px 0 4px' }}>— sitemap.xml (first 60) —</div>
              {diagData.sitemapUrls.map((u,i) => <div key={i} style={{ color: T.textSub }}>{u}</div>)}
            </>}
            {diagData.homepageLinks?.length > 0 && <>
              <div style={{ color: T.accent, margin: '8px 0 4px' }}>— homepage links —</div>
              {diagData.homepageLinks.map((u,i) => <div key={i} style={{ color: T.textSub }}>{u}</div>)}
            </>}
            {diagData.sampleCatLinks?.length > 0 && <>
              <div style={{ color: T.accent, margin: '8px 0 4px' }}>— links inside: {diagData.sampleCatPage} —</div>
              {diagData.sampleCatLinks.map((u,i) => <div key={i} style={{ color: T.textSub }}>{u}</div>)}
            </>}
          </div>
        </div>
      )}

      {/* Log */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 3 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: T.font, fontSize: 10, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase' }}>Log</span>
          {status?.done && <span style={{ fontSize: 10, color: T.olive }}>✓ Complete</span>}
          {status?.running && <span style={{ fontSize: 10, color: T.accent }}>● Running</span>}
        </div>
        <div ref={logRef} style={{ height: 380, overflowY: 'auto', padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: T.textSub, lineHeight: 1.7 }}>
          {status?.log?.length
            ? [...status.log].reverse().map((line, i) => (
                <div key={i} style={{ color: line.includes('✓') ? T.olive : line.includes('✗') || line.includes('FATAL') ? T.dangerText : T.textSub }}>{line}</div>
              ))
            : <span style={{ color: T.textMute }}>No log yet — click Start Scrape to begin.</span>
          }
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { id:'dashboard',   label:'Dashboard',          Icon:LayoutDashboard },
  { id:'products',    label:'Products',            Icon:Package },
  { id:'orders',      label:'Orders',              Icon:ShoppingCart },
  { id:'categories',  label:'Categories & Pages',  Icon:Layers },
  { id:'banners',     label:'Banners & Media',     Icon:Layout },
  { id:'scraper',     label:'Image Scraper',       Icon:Download },
  { id:'settings',    label:'Store Settings',      Icon:Settings },
];

export default function CMS() {
  const { data } = useSiteData();
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(()=>sessionStorage.getItem('asw_cms_auth')==='1');
  const [collapsed, setCollapsed] = useState(false);
  const [lang, setLang] = useState(()=>localStorage.getItem('asw_cms_lang')||'bg');
  const [cmsTheme, setCmsTheme] = useState(_initTheme);
  const [themeV, setThemeV] = useState(0);

  const toggleTheme = () => {
    const next = cmsTheme === 'dark' ? 'light' : 'dark';
    Object.assign(T, next === 'light' ? LIGHT_T : DARK_T);
    setCmsTheme(next);
    setThemeV(v => v + 1);
    try { localStorage.setItem('asw_cms_theme', next); } catch {}
  };

  // Derive active view from URL: /cms → dashboard, /cms/products → products, etc.
  const view = location.pathname.replace(/^\/cms\/?/, '') || 'dashboard';

  const tl = (section, key) => CMS_TR[lang]?.[section]?.[key] ?? CMS_TR.bg[section]?.[key] ?? key;
  const toggleLang = () => {
    const next = lang==='bg' ? 'en' : 'bg';
    setLang(next);
    localStorage.setItem('asw_cms_lang', next);
  };

  const password = data?.settings?.adminPassword || 'admin123';

  const handleAuth = () => {
    sessionStorage.setItem('asw_cms_auth','1');
    setAuthed(true);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('asw_cms_auth');
    navigate('/');
  };

  if (!authed) return (
    <CmsLangCtx.Provider value={{ lang, setLang }}>
      <LoginScreen onSuccess={handleAuth} password={password}/>
    </CmsLangCtx.Provider>
  );

  const sideW = collapsed ? 60 : 230;
  const NAV_LABELS = { dashboard:tl('nav','dashboard'), products:tl('nav','products'), orders:tl('nav','orders'), categories:tl('nav','categories'), banners:tl('nav','banners'), scraper:'Image Scraper', settings:tl('nav','settings') };

  const renderView = () => {
    const [viewBase, viewParam] = view.split('/');
    switch(viewBase) {
      case 'dashboard':  return <Dashboard onNav={id=>navigate(id==='dashboard'?'/cms':`/cms/${id}`)}/>;
      case 'products':
        if (viewParam) return <ProductEditor productId={viewParam} allProducts={data.products || []} lang={lang}/>;
        return <Products/>;
      case 'orders':     return <Orders/>;
      case 'categories': return <Categories/>;
      case 'banners':    return <Banners/>;
      case 'scraper':    return <ImageScraper/>;
      case 'settings':   return <StoreSettings/>;
      default:           return null;
    }
  };

  return (
    <CmsLangCtx.Provider value={{ lang, setLang, themeV }}>
    <div style={{position:'fixed',inset:0,display:'flex',background:T.bg0,fontFamily:T.fontBody,overflow:'hidden'}}>
      {/* Sidebar */}
      <motion.div animate={{width:sideW}} transition={{duration:.25,ease:[.22,1,.36,1]}} style={{background:T.bg2,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden',position:'relative'}}>
        {/* Logo + collapse toggle */}
        <div style={{padding:collapsed?'16px 0':'16px 14px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:8,justifyContent:collapsed?'center':'space-between',flexShrink:0,minHeight:58}}>
          <div style={{display:'flex',alignItems:'center',gap:8,overflow:'hidden'}}>
            <Crosshair size={17} style={{color:T.accent,flexShrink:0}}/>
            <AnimatePresence>{!collapsed&&<motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} transition={{duration:.18}} style={{overflow:'hidden',whiteSpace:'nowrap'}}>
              <p style={{fontFamily:T.font,fontSize:13,fontWeight:700,letterSpacing:'0.2em',color:'#fff',lineHeight:1.1}}>AS<span style={{color:T.accent}}>WARRIOR</span></p>
              <p style={{fontFamily:T.font,fontSize:9,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginTop:2}}>{tl('nav','admin')}</p>
            </motion.div>}</AnimatePresence>
          </div>
          <button onClick={()=>setCollapsed(p=>!p)}
            title={collapsed?'Expand menu':'Collapse menu'}
            style={{flexShrink:0,width:24,height:24,borderRadius:3,border:`1px solid ${T.border}`,background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:T.textMute,transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMute;}}>
            <motion.div animate={{rotate:collapsed?180:0}} transition={{duration:.2}}>
              <ChevronLeft size={13}/>
            </motion.div>
          </button>
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
          {NAV.map(({id,Icon})=>{
            const active=view===id || view.startsWith(id+'/');
            const label = NAV_LABELS[id] || id;
            return (
              <button key={id} onClick={()=>navigate(id==='dashboard'?'/cms':`/cms/${id}`)} title={collapsed?label:undefined}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'11px 0':'10px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:3,border:'none',cursor:'pointer',background:active?T.accentDim:'transparent',color:active?T.accent:T.textSub,fontFamily:T.font,fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',textAlign:'left',marginBottom:2,borderLeft:active?`2px solid ${T.accent}`:'2px solid transparent',transition:'all .15s'}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color=T.text;}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color=T.textSub;}}}>
                <Icon size={15} style={{flexShrink:0}}/>
                <AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.1}} style={{whiteSpace:'nowrap',overflow:'hidden'}}>{label}</motion.span>}</AnimatePresence>
              </button>
            );
          })}
        </nav>
        {/* Bottom: lang toggle + logout */}
        <div style={{padding:collapsed?'14px 0':'14px 12px',borderTop:`1px solid ${T.border}`,flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title={collapsed?(cmsTheme==='dark'?'Light mode':'Dark mode'):undefined}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'6px 0':'6px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:3,border:`1px solid ${T.border}`,cursor:'pointer',background:T.bg3,color:T.textSub,fontFamily:T.font,fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',transition:'all .15s',marginBottom:4}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSub;}}>
            {cmsTheme==='dark' ? <Sun size={13} style={{flexShrink:0}}/> : <Moon size={13} style={{flexShrink:0}}/>}
            <AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.1}} style={{whiteSpace:'nowrap'}}>{cmsTheme==='dark'?'Light Mode':'Dark Mode'}</motion.span>}</AnimatePresence>
          </button>
          {/* Language toggle */}
          <button onClick={toggleLang} title={collapsed?(lang==='bg'?'Switch to English':'Смени на Български'):undefined}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'6px 0':'6px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:3,border:`1px solid ${T.border}`,cursor:'pointer',background:T.bg3,color:T.textSub,fontFamily:T.font,fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',transition:'all .15s',marginBottom:4}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSub;}}>
            <Globe size={13} style={{flexShrink:0}}/>
            <AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.1}} style={{whiteSpace:'nowrap'}}>{lang==='bg'?'English':'Български'}</motion.span>}</AnimatePresence>
          </button>
          <button onClick={handleLogout} title={collapsed?tl('nav','backToStore'):undefined}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'8px 0':'8px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:3,border:'none',cursor:'pointer',background:'transparent',color:T.textMute,fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.color=T.text;}} onMouseLeave={e=>{e.currentTarget.style.color=T.textMute;}}>
            <ExternalLink size={14} style={{flexShrink:0}}/>
            <AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.1}} style={{whiteSpace:'nowrap'}}>{tl('nav','backToStore')}</motion.span>}</AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Top bar */}
        <div style={{height:54,borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12,padding:'0 20px',flexShrink:0,background:T.bg1}}>
          <button onClick={()=>setCollapsed(p=>!p)} style={{background:'transparent',border:`1px solid ${T.border}`,color:T.textSub,width:32,height:32,borderRadius:3,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSub;}}>
            <Menu size={14}/>
          </button>
          <div style={{flex:1}}/>
          <span style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase'}}>
            {NAV_LABELS[view.split('/')[0]]}
          </span>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'28px 36px'}}>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.18}}>
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
    </CmsLangCtx.Provider>
  );
}
