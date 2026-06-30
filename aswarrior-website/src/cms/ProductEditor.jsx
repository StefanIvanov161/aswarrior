import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import {
  ChevronLeft, Save, Image as ImageIcon, Zap, Tag, Search,
  Plus, Trash2, Star, Upload, X, AlertTriangle, Check, Crosshair,
  ExternalLink, ChevronDown, FileText, Settings, BarChart2, Link,
  Eye, RefreshCw, Wand2, AlignLeft, Table2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const T = {
  bg0:'#030303', bg1:'#0a0a0a', bg2:'#0d0d0d', bg3:'#111', bg4:'#161616', bg5:'#1a1a1a',
  border:'rgba(255,255,255,0.06)', borderHover:'rgba(255,255,255,0.12)',
  accent:'#D4500A', accentDim:'rgba(212,80,10,0.15)', accentBorder:'rgba(212,80,10,0.35)',
  text:'rgba(255,255,255,0.88)', textSub:'rgba(255,255,255,0.45)', textMute:'rgba(255,255,255,0.22)',
  success:'#166534', successText:'#4ade80',
  danger:'#7f1d1d', dangerText:'#f87171',
  font:'Oswald, sans-serif', fontBody:'Inter, sans-serif',
};

// ─── Translations ─────────────────────────────────────────────────────────────
const PE_TR = {
  bg: {
    back:'Продукти', preview:'Преглед', save:'Запази', saving:'Запазване…',
    loading:'Зареждане…', saved:'Продуктът е запазен', saveFailed:'Грешка при запазване',
    untitled:'Нов Продукт',
    titleDesc:'Съдържание', media:'Снимки', airsoftSpecs:'Еърсофт Спецификации',
    variants:'Варианти', cartUpsell:'Допълнителни Продукти',
    status:'Статус', organisation:'Организация', pricing:'Цена и Наличност', seo:'SEO (търсачки)',
    shortDesc:'Кратко описание', shortDescSub:'2-3 изречения — показва се директно на страницата',
    shortDescPh:'Кратко резюме на продукта — накратко кой е, за какво е и защо е добър.',
    longDesc:'Пълно описание', longDescSub:'богат текст — в падащо меню на страницата',
    techSpecs:'Технически Параметри', techSpecsSub:'обикновен текст', techSpecsPh:'Тегло, размери, материали…',
    characteristics:'Характеристики', charsSub:'таблица — в падащо меню на страницата',
    charsKey:'Характеристика', charsValue:'Стойност',
    charsAddRow:'+ Добави ред',
    charsTemplate:'Зареди шаблон',
    charsTemplateDetected:'Разпознат шаблон',
    charsTemplateNone:'Избери шаблон',
    charsConfirm:'Шаблонът ще замени съществуващите редове. Продължи?',
    uploadPrompt:'Провлачи снимки или натисни за избор',
    uploadHint:'PNG, JPG, WEBP — макс. 20MB', uploading:'Качване…',
    primaryBadge:'Основна', setPrimary:'Направи основна', deleteImg:'Изтрий',
    brand:'Марка', brandPh:'Производител',
    parentCat:'Родителска Категория', parentCatPh:'напр. Реплики',
    subCat:'Под-категория', subCatPh:'напр. AEG Карабини',
    sku:'Каталожен Номер', price:'Цена (€)',
    salePrice:'Цена при Промоция (€)', salePriceSub:'оставете празно ако няма промоция',
    stock:'Налично Количество', trackStock:'Не следи наличност', badge:'Бадж', badgePh:'напр. ХИТ',
    powerSource:'Захранване', fpsRange:'FPS Диапазон',
    gearboxType:'Тип Механизъм', batteryType:'Батерия / Конектор',
    active:'Активен (видим)', draft:'Чернова (скрит)',
    markNew:'Маркирай като Нов', onPromo:'В Промоция',
    variantGroupPh:'Наименование (напр. Цвят)',
    variantValue:'Стойност', variantSku:'SKU Суфикс', variantStock:'Налично',
    variantAddOption:'+ Добави опция', variantAddGroup:'Добави Група Варианти',
    upsellHint:'Тези продукти се показват когато клиент добави артикула в количката.',
    upsellSearch:'Търси продукти…',
    urlSlug:'URL Адрес', urlSlugSub:'авто-генерирано ако е празно',
    metaTitle:'Мета Заглавие', metaDesc:'Мета Описание',
    metaDescPh:'Кратко описание за Google…', tags:'Тагове', tagsPh:'таг1, таг2, таг3',
    autoSeo:'Авто SEO', autoSeoTooltip:'Автоматично генерира URL, мета заглавие и описание',
    autoSeoGenerated:'SEO данните са генерирани', autoSeoHelp:'Натисни "Авто SEO" и полетата ще се попълнят автоматично.',
  },
  en: {
    back:'Products', preview:'Preview', save:'Save Product', saving:'Saving…',
    loading:'Loading…', saved:'Product saved', saveFailed:'Save failed', untitled:'Untitled Product',
    titleDesc:'Content', media:'Media', airsoftSpecs:'Airsoft Specifications',
    variants:'Variants', cartUpsell:'Smart Cart Upsell',
    status:'Status', organisation:'Organisation', pricing:'Pricing & Inventory', seo:'SEO',
    shortDesc:'Short Description', shortDescSub:'2-3 sentences — shown directly on the product page',
    shortDescPh:'Brief summary of the product — what it is, who it\'s for, why it\'s good.',
    longDesc:'Full Description', longDescSub:'rich text — inside a dropdown on the product page',
    techSpecs:'Technical Specs', techSpecsSub:'plain text', techSpecsPh:'Weight, dimensions, materials…',
    characteristics:'Characteristics', charsSub:'table — inside a dropdown on the product page',
    charsKey:'Characteristic', charsValue:'Value',
    charsAddRow:'+ Add row',
    charsTemplate:'Load Template',
    charsTemplateDetected:'Detected template',
    charsTemplateNone:'Choose template',
    charsConfirm:'This will replace existing rows. Continue?',
    uploadPrompt:'Drag & drop images or click to browse',
    uploadHint:'PNG, JPG, WEBP — max 20MB', uploading:'Uploading…',
    primaryBadge:'Primary', setPrimary:'Set Primary', deleteImg:'Delete',
    brand:'Brand', brandPh:'Manufacturer',
    parentCat:'Parent Category', parentCatPh:'e.g. Replicas',
    subCat:'Sub-category', subCatPh:'e.g. AEG Rifles',
    sku:'SKU', price:'Price (€)',
    salePrice:'Sale Price (€)', salePriceSub:'leave empty if not on sale',
    stock:'Stock Quantity', trackStock:'Ignore stock (always orderable)', badge:'Badge', badgePh:'e.g. HOT',
    powerSource:'Power Source', fpsRange:'FPS Range',
    gearboxType:'Gearbox Type', batteryType:'Battery / Connector',
    active:'Active (visible)', draft:'Draft (hidden)',
    markNew:'Mark as New', onPromo:'On Promotion',
    variantGroupPh:'Option name (e.g. Color)',
    variantValue:'Value', variantSku:'SKU Suffix', variantStock:'Stock',
    variantAddOption:'+ Add option', variantAddGroup:'Add Variant Group',
    upsellHint:'These products appear in a popup when a customer adds this item to cart.',
    upsellSearch:'Search products to link…',
    urlSlug:'URL Slug', urlSlugSub:'auto-generated if empty',
    metaTitle:'Meta Title', metaDesc:'Meta Description',
    metaDescPh:'Brief description for Google…', tags:'Tags', tagsPh:'tag1, tag2, tag3',
    autoSeo:'Auto SEO', autoSeoTooltip:'Auto-generate URL slug, meta title and description',
    autoSeoGenerated:'SEO fields generated', autoSeoHelp:'Click "Auto SEO" to fill all fields automatically.',
  },
};

// ─── Smart characteristics templates ─────────────────────────────────────────
const CHAR_TEMPLATES = {
  replica: {
    labelBg: 'Реплики (AEG / GBB / HPA / Spring)',
    labelEn: 'Replicas (AEG / GBB / HPA / Spring)',
    rows: [
      ['Тип на задвижването', ''],
      ['FPS (дулна скорост)', ''],
      ['Изстрела в секунда (RPS)', ''],
      ['Тегло', ''],
      ['Дължина', ''],
      ['Материал на тялото', ''],
      ['Цвят', ''],
      ['Тип батерия / захранване', ''],
      ['Конектор', ''],
      ['Капацитет на пълнителя', ''],
      ['Hop-up', 'Регулируем'],
      ['Вътрешна цев', ''],
      ['Калибър', '6 мм'],
    ],
  },
  gear: {
    labelBg: 'Екипировка (жилетки, панталони, якета)',
    labelEn: 'Gear (vests, pants, jackets)',
    rows: [
      ['Материал', ''],
      ['Налични размери', ''],
      ['Цвят / Камуфлаж', ''],
      ['Тегло', ''],
      ['Платформа MOLLE', ''],
      ['Налични джобове', ''],
      ['Максимален товар', ''],
      ['Водоустойчивост', ''],
    ],
  },
  magazine: {
    labelBg: 'Пълнители / Магазини',
    labelEn: 'Magazines',
    rows: [
      ['Тип (Mid-cap / Hi-cap / Low-cap)', ''],
      ['Съвместимост', ''],
      ['Капацитет (топчета)', ''],
      ['Материал', ''],
      ['Цвят', ''],
    ],
  },
  optics: {
    labelBg: 'Оптика (мерници, колиматори, скопове)',
    labelEn: 'Optics (sights, scopes, red dots)',
    rows: [
      ['Тип', ''],
      ['Увеличение', ''],
      ['Диаметър на тръбата', ''],
      ['Монтаж', ''],
      ['Осветление на мерника', ''],
      ['Батерия', ''],
      ['Материал', ''],
      ['Цвят', ''],
    ],
  },
  protection: {
    labelBg: 'Защита (маски, очила, ръкавици)',
    labelEn: 'Protection (masks, goggles, gloves)',
    rows: [
      ['Тип', ''],
      ['Материал', ''],
      ['Ниво на защита', ''],
      ['Размер', ''],
      ['Тегло', ''],
      ['Съвместимост', ''],
      ['Цвят', ''],
    ],
  },
  weaponAccessory: {
    labelBg: 'Оборудване за оръжие (грипове, ръкохватки, рейли)',
    labelEn: 'Weapon accessories (grips, rails, foregrips)',
    rows: [
      ['Тип', ''],
      ['Съвместимост', ''],
      ['Монтаж / Рейл', ''],
      ['Материал', ''],
      ['Тегло', ''],
      ['Цвят', ''],
    ],
  },
  suppressor: {
    labelBg: 'Сурпресори / Пламегасители',
    labelEn: 'Suppressors / Flash hiders',
    rows: [
      ['Тип', ''],
      ['Резба (CW / CCW)', ''],
      ['Дължина', ''],
      ['Диаметър', ''],
      ['Материал', ''],
      ['Цвят', ''],
    ],
  },
  sling: {
    labelBg: 'Ремъци за оръжие',
    labelEn: 'Weapon slings',
    rows: [
      ['Тип (1-точков / 2-точков / 3-точков)', ''],
      ['Материал', ''],
      ['Дължина (регулируема)', ''],
      ['Ширина', ''],
      ['Цвят', ''],
    ],
  },
  holster: {
    labelBg: 'Кобури',
    labelEn: 'Holsters',
    rows: [
      ['Тип', ''],
      ['Съвместимост с пистолет', ''],
      ['Материал', ''],
      ['Монтаж', ''],
      ['Страна на носене', ''],
      ['Цвят', ''],
    ],
  },
  battery: {
    labelBg: 'Батерии и зарядни',
    labelEn: 'Batteries & chargers',
    rows: [
      ['Тип', ''],
      ['Капацитет (mAh)', ''],
      ['Напрежение (V)', ''],
      ['Конектор', ''],
      ['Форма / Размер', ''],
    ],
  },
  bbs: {
    labelBg: 'BBs / Топчета',
    labelEn: 'BBs / Pellets',
    rows: [
      ['Тегло (грама)', ''],
      ['Количество в опаковка', ''],
      ['Диаметър', '6 мм'],
      ['Материал', ''],
      ['Цвят', ''],
      ['Биоразградими', ''],
    ],
  },
  knife: {
    labelBg: 'Ножове и инструменти',
    labelEn: 'Knives & tools',
    rows: [
      ['Тип', ''],
      ['Дължина на острието', ''],
      ['Обща дължина', ''],
      ['Материал на острието', ''],
      ['Дръжка', ''],
      ['Включена кания', ''],
    ],
  },
  communication: {
    labelBg: 'Комуникация (радиостанции, слушалки)',
    labelEn: 'Communication (radios, headsets)',
    rows: [
      ['Тип', ''],
      ['Честоти', ''],
      ['Обхват', ''],
      ['Мощност (W)', ''],
      ['Батерия', ''],
      ['Водоустойчивост', ''],
    ],
  },
};

function detectTemplateKey(categoryParent, category) {
  const p = (categoryParent || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (p.includes('реплик') || c.includes('aeg') || c.includes('gbb') || c.includes('hpa') || c.includes('spring') || c.includes('aep') || c.includes('реплик')) return 'replica';
  if (c.includes('пълнител') || c.includes('магазин')) return 'magazine';
  if (c.includes('оптик') || c.includes('мерник') || c.includes('прицел') || c.includes('колиматор') || c.includes('scope')) return 'optics';
  if (c.includes('сурпресор') || c.includes('пламегасит') || c.includes('накрайник') || c.includes('supressor')) return 'suppressor';
  if (c.includes('ремък') || c.includes('sling')) return 'sling';
  if (c.includes('кобур') || c.includes('holster')) return 'holster';
  if (c.includes('нож') || c.includes('knife') || c.includes('мачете')) return 'knife';
  if (c.includes('батер') || c.includes('зарядн') || p.includes('батер')) return 'battery';
  if (c.includes('bb') || c.includes('топчет') || p.includes('bb')) return 'bbs';
  if (p.includes('комуникаци') || c.includes('радио') || c.includes('уоки') || c.includes('слушалк')) return 'communication';
  if (c.includes('маск') || c.includes('очил') || c.includes('ръкавиц') || c.includes('наколенк') || p.includes('защит')) return 'protection';
  if (p.includes('екипировк') || c.includes('жилетк') || c.includes('панталон') || c.includes('якет') || c.includes('облекло') || c.includes('ризи') || c.includes('блуз')) return 'gear';
  if (p.includes('оборудване') || c.includes('грип') || c.includes('рейл') || c.includes('rail') || c.includes('fore')) return 'weaponAccessory';
  return null;
}

// ─── Primitives ───────────────────────────────────────────────────────────────
const inp = (x = {}) => ({
  width:'100%', background:T.bg5, border:`1px solid ${T.border}`,
  color:T.text, padding:'8px 12px', fontSize:13, borderRadius:3,
  outline:'none', boxSizing:'border-box', fontFamily:T.fontBody,
  transition:'border-color .2s', ...x,
});

function Inp({ value, onChange, placeholder, type='text', style={}, readOnly, min, step }) {
  return (
    <input readOnly={readOnly} type={type} value={value??''} min={min} step={step}
      onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}
      style={inp({...style,...(readOnly?{opacity:.5,cursor:'default'}:{})})}
      onFocus={e=>{if(!readOnly)e.target.style.borderColor=T.accent;}}
      onBlur={e=>{e.target.style.borderColor=T.border;}} />
  );
}
function Txt({ value, onChange, rows=4, placeholder, style={} }) {
  return (
    <textarea value={value??''} onChange={e=>onChange?.(e.target.value)} rows={rows} placeholder={placeholder}
      style={inp({resize:'vertical',lineHeight:1.6,...style})}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} />
  );
}
function Sel({ value, onChange, options, style={} }) {
  return (
    <select value={value??''} onChange={e=>onChange(e.target.value)}
      style={inp({cursor:'pointer',...style})}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}>
      {options.map(o=>(
        <option key={o.value??o} value={o.value??o} style={{background:T.bg3}}>{o.label??o}</option>
      ))}
    </select>
  );
}
function Toggle({ on, onChange, size=22 }) {
  return (
    <button onClick={()=>onChange(!on)} style={{
      width:size*1.9, height:size, borderRadius:size, border:'none', cursor:'pointer',
      background:on?T.accent:'rgba(255,255,255,0.1)', position:'relative', transition:'background .2s', flexShrink:0,
    }}>
      <span style={{position:'absolute',top:2,left:on?size*.9:2,width:size-4,height:size-4,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
    </button>
  );
}
function Btn({ children, onClick, variant='primary', disabled, style={}, size='md', title }) {
  const pad = size==='sm'?'5px 12px':'8px 18px';
  const fs  = size==='sm'?11:12;
  const base = {display:'inline-flex',alignItems:'center',gap:6,padding:pad,fontSize:fs,fontFamily:T.font,letterSpacing:'0.15em',textTransform:'uppercase',borderRadius:3,cursor:disabled?'not-allowed':'pointer',border:'none',transition:'all .15s',opacity:disabled?.5:1,flexShrink:0,...style};
  const v = {
    primary:{background:T.accent,color:'#fff'},
    ghost:{background:'transparent',color:T.textSub,border:`1px solid ${T.border}`},
    magic:{background:'rgba(124,58,237,0.2)',color:'#c4b5fd',border:'1px solid rgba(124,58,237,0.4)'},
    accent:{background:T.accentDim,color:T.accent,border:`1px solid ${T.accentBorder}`},
    danger:{background:T.danger,color:T.dangerText,border:'1px solid rgba(248,113,113,0.2)'},
  };
  return <button title={title} onClick={disabled?undefined:onClick} style={{...base,...v[variant]}}>{children}</button>;
}
function Card({ title, icon:Icon, children, defaultOpen=true, action }) {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:4,overflow:'hidden',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',borderBottom:open?`1px solid ${T.border}`:'none'}}>
        <button onClick={()=>setOpen(p=>!p)} style={{flex:1,display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:'transparent',border:'none',cursor:'pointer',color:T.text}}>
          {Icon&&<Icon size={15} style={{color:T.accent,flexShrink:0}}/>}
          <span style={{fontFamily:T.font,fontSize:11,letterSpacing:'0.25em',textTransform:'uppercase',flex:1,textAlign:'left'}}>{title}</span>
          <ChevronDown size={14} style={{color:T.textMute,transform:open?'rotate(180deg)':'none',transition:'transform .2s'}}/>
        </button>
        {action&&<div style={{paddingRight:14}}>{action}</div>}
      </div>
      {open&&<div style={{padding:18}}>{children}</div>}
    </div>
  );
}
function Field({ label, labelSub, children, style={} }) {
  return (
    <div style={{marginBottom:14,...style}}>
      <label style={{display:'block',fontSize:11,fontFamily:T.font,letterSpacing:'0.15em',textTransform:'uppercase',color:T.textSub,marginBottom:6}}>
        {label}
        {labelSub&&<span style={{fontFamily:T.fontBody,fontSize:10,color:T.textMute,textTransform:'none',letterSpacing:0,marginLeft:8}}>{labelSub}</span>}
      </label>
      {children}
    </div>
  );
}
function Toast({ msg, type, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  return (
    <div style={{position:'fixed',bottom:28,right:28,zIndex:9999,background:type==='error'?T.danger:'#1a3a2a',border:`1px solid ${type==='error'?T.dangerText:T.successText}30`,color:type==='error'?T.dangerText:T.successText,padding:'12px 18px',borderRadius:4,fontSize:13,fontFamily:T.fontBody,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
      {type==='error'?<AlertTriangle size={15}/>:<Check size={15}/>}{msg}
    </div>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
const AIRSOFT_TEMPLATE = `<h2>Основни характеристики</h2>
<ul>
  <li>Конструкция: </li>
  <li>Скорострелност: </li>
  <li>Дулна скорост: </li>
</ul>
<h2>Вътрешни компоненти</h2>
<ul>
  <li>Механизъм: </li>
  <li>Мотор: </li>
  <li>Зъбни колела: </li>
  <li>Пружина: </li>
  <li>Цев: </li>
</ul>
<h2>Съдържание на пакета</h2>
<ul>
  <li>1x Реплика</li>
  <li>1x Пълнител (__ BBs)</li>
  <li>1x Наръчник</li>
</ul>`;

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  useEffect(()=>{if(ref.current)ref.current.innerHTML=value||'';},[]);
  const exec=(cmd,val)=>{ref.current?.focus();document.execCommand(cmd,false,val);onChange(ref.current.innerHTML);};
  const tools=[
    {l:'B',cmd:'bold',bold:true},{l:'I',cmd:'italic',italic:true},
    {l:'H2',cmd:'formatBlock',val:'H2'},{l:'H3',cmd:'formatBlock',val:'H3'},
    {l:'• UL',cmd:'insertUnorderedList'},{l:'1. OL',cmd:'insertOrderedList'},
    {l:'—',cmd:'insertHorizontalRule'},
  ];
  return (
    <div style={{border:`1px solid ${T.border}`,borderRadius:3,overflow:'hidden'}}>
      <div style={{display:'flex',gap:2,padding:'6px 8px',background:T.bg3,borderBottom:`1px solid ${T.border}`,flexWrap:'wrap',alignItems:'center'}}>
        {tools.map(({l,cmd,val,bold,italic})=>(
          <button key={l} onMouseDown={e=>{e.preventDefault();exec(cmd,val);}}
            style={{background:'transparent',border:`1px solid ${T.border}`,color:T.textSub,padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:bold?'serif':T.fontBody,fontWeight:bold?700:400,fontStyle:italic?'italic':'normal'}}>
            {l}
          </button>
        ))}
        <div style={{width:1,height:18,background:T.border,margin:'0 4px'}}/>
        <button onMouseDown={e=>{e.preventDefault();ref.current.innerHTML=AIRSOFT_TEMPLATE;onChange(AIRSOFT_TEMPLATE);}}
          style={{display:'flex',alignItems:'center',gap:4,background:T.accentDim,border:`1px solid ${T.accentBorder}`,color:T.accent,padding:'3px 10px',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:T.font,letterSpacing:'0.1em',textTransform:'uppercase'}}>
          <FileText size={11}/> Airsoft Template
        </button>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={()=>onChange(ref.current.innerHTML)}
        style={{minHeight:180,padding:14,outline:'none',color:T.text,fontSize:13,lineHeight:1.7,fontFamily:T.fontBody,background:T.bg5}}/>
    </div>
  );
}

// ─── Characteristics Table ────────────────────────────────────────────────────
function CharacteristicsTable({ value, onChange, categoryParent, category, lang, tr }) {
  const rows   = Array.isArray(value) ? value : [];
  const tKey   = detectTemplateKey(categoryParent, category);
  const tpl    = tKey ? CHAR_TEMPLATES[tKey] : null;

  const loadTemplate = (key) => {
    const t = CHAR_TEMPLATES[key];
    if (!t) return;
    if (rows.length > 0 && !window.confirm(tr.charsConfirm)) return;
    onChange(t.rows.map(([k, v]) => ({ key: k, value: v })));
  };

  const updRow = (i, field, val) => onChange(rows.map((r, j) => j === i ? { ...r, [field]: val } : r));
  const removeRow = i => onChange(rows.filter((_, j) => j !== i));
  const addRow = () => onChange([...rows, { key: '', value: '' }]);

  const allTemplateOptions = Object.entries(CHAR_TEMPLATES).map(([k, t]) => ({
    value: k,
    label: lang === 'en' ? t.labelEn : t.labelBg,
  }));

  return (
    <div>
      {/* Template bar */}
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:14,flexWrap:'wrap'}}>
        {tpl && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'rgba(212,80,10,0.08)',border:`1px solid ${T.accentBorder}`,borderRadius:3,fontSize:11,color:T.accent,fontFamily:T.font,letterSpacing:'0.1em',textTransform:'uppercase'}}>
            <Wand2 size={12}/> {tr.charsTemplateDetected}: {lang==='en'?tpl.labelEn:tpl.labelBg}
            <button onClick={()=>loadTemplate(tKey)}
              style={{background:T.accent,border:'none',color:'#fff',padding:'2px 8px',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:T.font,letterSpacing:'0.08em',textTransform:'uppercase',marginLeft:4}}>
              {tr.charsTemplate}
            </button>
          </div>
        )}
        <select onChange={e=>{if(e.target.value)loadTemplate(e.target.value);e.target.value='';}}
          defaultValue=""
          style={{...inp({width:'auto',fontSize:11,padding:'5px 10px',cursor:'pointer'}),color:T.textMute}}>
          <option value="">{tr.charsTemplateNone}</option>
          {allTemplateOptions.map(o=>(
            <option key={o.value} value={o.value} style={{background:T.bg3}}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table rows */}
      {rows.length > 0 && (
        <div style={{marginBottom:10}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 28px',gap:5,marginBottom:5}}>
            <span style={{fontSize:10,color:T.textMute,fontFamily:T.font,letterSpacing:'0.08em',textTransform:'uppercase'}}>{tr.charsKey}</span>
            <span style={{fontSize:10,color:T.textMute,fontFamily:T.font,letterSpacing:'0.08em',textTransform:'uppercase'}}>{tr.charsValue}</span>
            <span/>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 28px',gap:5,marginBottom:5}}>
              <input value={r.key||''} onChange={e=>updRow(i,'key',e.target.value)}
                style={inp({})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              <input value={r.value||''} onChange={e=>updRow(i,'value',e.target.value)}
                style={inp({})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              <button onClick={()=>removeRow(i)} style={{background:'transparent',border:'none',color:T.textMute,cursor:'pointer',padding:2,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <X size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={addRow}
        style={{display:'flex',alignItems:'center',gap:5,background:'transparent',border:`1px dashed ${T.border}`,color:T.textMute,cursor:'pointer',padding:'6px 14px',borderRadius:3,fontSize:11,width:'100%',justifyContent:'center',fontFamily:T.fontBody}}>
        <Plus size={12}/> {tr.charsAddRow}
      </button>
    </div>
  );
}

// ─── Media Manager ────────────────────────────────────────────────────────────
function MediaManager({ productId, primary, onPrimaryChange, extras, onExtrasChange, tr }) {
  const [dropZoneDrag, setDropZoneDrag] = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [dragOver,     setDragOver]     = useState(null);
  const dragIdx = useRef(null);
  const fileRef = useRef(null);
  const allImages = [primary, ...extras].filter(Boolean);

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${API}/api/products/${productId}/upload-image`, { method:'POST', body:fd });
      const d = await res.json();
      if (d.ok) { if (!primary) onPrimaryChange(d.url); else onExtrasChange([...extras, d.url]); }
    } catch(e) { console.error(e); }
    setUploading(false);
  };

  const handleDropZone = async (e) => {
    e.preventDefault(); setDropZoneDrag(false);
    for (const f of [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))) await uploadFile(f);
  };
  const handleFiles = async (e) => { for (const f of [...e.target.files]) await uploadFile(f); e.target.value=''; };

  const deleteImage = async (url) => {
    if (url===primary) { onPrimaryChange(extras[0]||''); onExtrasChange(extras.slice(1)); }
    else onExtrasChange(extras.filter(u => u!==url));
    if (url.startsWith('/images/products/'))
      await fetch(`${API}/api/products/${productId}/image`, { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url}) });
  };

  const setPrimary = (url) => {
    if (url===primary) return;
    onPrimaryChange(url);
    onExtrasChange([primary, ...extras.filter(u => u!==url)].filter(Boolean));
  };

  // ── Drag-to-sort handlers ──
  const onSortStart = (e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    // Ghost image: use the element itself (default) but fade it slightly
    setTimeout(() => e.target.style.opacity = '0.35', 0);
  };
  const onSortOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(idx);
  };
  const onSortDrop = (e, toIdx) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    dragIdx.current = null;
    setDragOver(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    const arr = [...allImages];
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    onPrimaryChange(arr[0] || '');
    onExtrasChange(arr.slice(1));
  };
  const onSortEnd = (e) => {
    e.target.style.opacity = '1';
    dragIdx.current = null;
    setDragOver(null);
  };

  return (
    <div>
      {/* Upload drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDropZoneDrag(true); }}
        onDragLeave={() => setDropZoneDrag(false)}
        onDrop={handleDropZone}
        onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${dropZoneDrag?T.accent:T.border}`, borderRadius:4, padding:'22px 20px', textAlign:'center', cursor:'pointer', background:dropZoneDrag?T.accentDim:T.bg4, marginBottom:14, transition:'all .2s' }}>
        <Upload size={20} style={{ color:dropZoneDrag?T.accent:T.textMute, marginBottom:6 }}/>
        <p style={{ fontSize:12, color:T.textSub, margin:0 }}>{uploading ? tr.uploading : tr.uploadPrompt}</p>
        <p style={{ fontSize:11, color:T.textMute, margin:'3px 0 0' }}>{tr.uploadHint}</p>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display:'none' }}/>
      </div>

      {allImages.length > 0 && (
        <>
          <p style={{ fontSize:10, color:T.textMute, letterSpacing:'0.15em', marginBottom:8 }}>
            DRAG TO REORDER — FIRST = PRIMARY
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:8 }}>
            {allImages.map((url, i) => (
              <div key={url}
                draggable
                onDragStart={e => onSortStart(e, i)}
                onDragOver={e => onSortOver(e, i)}
                onDrop={e => onSortDrop(e, i)}
                onDragEnd={onSortEnd}
                style={{ position:'relative', aspectRatio:'1', borderRadius:3, overflow:'hidden', cursor:'grab',
                  border: dragOver===i ? `2px dashed ${T.accent}` : (url===primary ? `2px solid ${T.accent}` : `1px solid ${T.border}`),
                  boxShadow: dragOver===i ? `0 0 0 2px ${T.accentDim}` : 'none',
                  transition:'border-color .12s, box-shadow .12s' }}>
                <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }}/>
                {url===primary && (
                  <div style={{ position:'absolute', top:4, left:4, background:T.accent, borderRadius:2, padding:'2px 6px', fontSize:9, fontFamily:T.font, letterSpacing:'0.1em', color:'#fff', textTransform:'uppercase' }}>
                    {tr.primaryBadge}
                  </div>
                )}
                <div style={{ position:'absolute', inset:0, background:'transparent', display:'flex', alignItems:'flex-end', justifyContent:'center', gap:4, padding:6, opacity:0, transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(0,0,0,0.65)'; e.currentTarget.style.opacity=1; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.opacity=0; }}>
                  {url!==primary && (
                    <button onClick={() => setPrimary(url)} title={tr.setPrimary}
                      style={{ background:T.accent, border:'none', borderRadius:2, color:'#fff', padding:'4px 8px', cursor:'pointer' }}>
                      <Star size={11}/>
                    </button>
                  )}
                  <button onClick={() => deleteImage(url)} title={tr.deleteImg}
                    style={{ background:T.danger, border:'none', borderRadius:2, color:T.dangerText, padding:'4px 8px', cursor:'pointer' }}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Variants Manager ─────────────────────────────────────────────────────────
function VariantsManager({ variants, onChange, tr }) {
  const add=()=>onChange([...variants,{name:'',options:[{label:'',sku_suffix:'',stock:0}]}]);
  const remove=i=>onChange(variants.filter((_,j)=>j!==i));
  const updV=(i,k,v)=>onChange(variants.map((x,j)=>j===i?{...x,[k]:v}:x));
  const addOpt=i=>onChange(variants.map((x,j)=>j===i?{...x,options:[...x.options,{label:'',sku_suffix:'',stock:0}]}:x));
  const removeOpt=(vi,oi)=>onChange(variants.map((x,j)=>j===vi?{...x,options:x.options.filter((_,k)=>k!==oi)}:x));
  const updOpt=(vi,oi,k,v)=>onChange(variants.map((x,j)=>j===vi?{...x,options:x.options.map((o,k2)=>k2===oi?{...o,[k]:v}:o)}:x));
  return (
    <div>
      {variants.map((v,vi)=>(
        <div key={vi} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:3,padding:14,marginBottom:10}}>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
            <input value={v.name} onChange={e=>updV(vi,'name',e.target.value)} placeholder={tr.variantGroupPh}
              style={inp({flex:1})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
            <button onClick={()=>remove(vi)} style={{background:'transparent',border:'none',color:T.dangerText,cursor:'pointer',padding:4}}><X size={14}/></button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 110px 70px 28px',gap:5,marginBottom:5}}>
            {[tr.variantValue,tr.variantSku,tr.variantStock,''].map(h=>(
              <span key={h} style={{fontSize:10,color:T.textMute,fontFamily:T.font,letterSpacing:'0.08em',textTransform:'uppercase'}}>{h}</span>
            ))}
          </div>
          {v.options.map((o,oi)=>(
            <div key={oi} style={{display:'grid',gridTemplateColumns:'1fr 110px 70px 28px',gap:5,marginBottom:5}}>
              <input value={o.label} onChange={e=>updOpt(vi,oi,'label',e.target.value)} style={inp({})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              <input value={o.sku_suffix} onChange={e=>updOpt(vi,oi,'sku_suffix',e.target.value)} style={inp({})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              <input type="number" min="0" value={o.stock} onChange={e=>updOpt(vi,oi,'stock',e.target.value)} style={inp({textAlign:'center'})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              <button onClick={()=>removeOpt(vi,oi)} style={{background:'transparent',border:'none',color:T.textMute,cursor:'pointer',padding:2,display:'flex',alignItems:'center',justifyContent:'center'}}><X size={12}/></button>
            </div>
          ))}
          <button onClick={()=>addOpt(vi)} style={{display:'flex',alignItems:'center',gap:4,background:'transparent',border:`1px dashed ${T.border}`,color:T.textMute,cursor:'pointer',padding:'5px 10px',borderRadius:3,fontSize:11,marginTop:4,width:'100%',justifyContent:'center'}}>
            {tr.variantAddOption}
          </button>
        </div>
      ))}
      <button onClick={add} style={{display:'flex',alignItems:'center',gap:6,background:T.accentDim,border:`1px solid ${T.accentBorder}`,color:T.accent,cursor:'pointer',padding:'8px 14px',borderRadius:3,fontSize:11,fontFamily:T.font,letterSpacing:'0.1em',textTransform:'uppercase'}}>
        <Plus size={13}/> {tr.variantAddGroup}
      </button>
    </div>
  );
}

// ─── Upsell Picker ────────────────────────────────────────────────────────────
function UpsellPicker({ upsellIds, onChange, allProducts, tr }) {
  const [search,setSearch]=useState('');
  const selected=allProducts.filter(p=>upsellIds.includes(p.id));
  const results=search.length>1?allProducts.filter(p=>!upsellIds.includes(p.id)&&(p.name?.toLowerCase().includes(search.toLowerCase())||p.sku?.toLowerCase().includes(search.toLowerCase()))).slice(0,8):[];
  return (
    <div>
      <p style={{fontSize:11,color:T.textMute,marginBottom:10,lineHeight:1.5}}>{tr.upsellHint}</p>
      {selected.length>0&&(
        <div style={{marginBottom:10}}>
          {selected.map(p=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:T.bg3,borderRadius:3,marginBottom:4}}>
              {p.image_url&&<img src={p.image_url} alt="" style={{width:28,height:28,objectFit:'cover',borderRadius:2,border:`1px solid ${T.border}`}}/>}
              <span style={{flex:1,fontSize:12,color:T.text}}>{p.name}</span>
              <span style={{fontSize:10,color:T.textMute}}>{p.sku}</span>
              <button onClick={()=>onChange(upsellIds.filter(id=>id!==p.id))} style={{background:'transparent',border:'none',color:T.textMute,cursor:'pointer',padding:2}}><X size={12}/></button>
            </div>
          ))}
        </div>
      )}
      <div style={{position:'relative'}}>
        <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:T.textMute,pointerEvents:'none'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr.upsellSearch}
          style={inp({paddingLeft:32})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
        {results.length>0&&(
          <div style={{position:'absolute',left:0,right:0,top:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:3,zIndex:50,maxHeight:200,overflowY:'auto',marginTop:2}}>
            {results.map(p=>(
              <button key={p.id} onClick={()=>{onChange([...upsellIds,p.id]);setSearch('');}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'transparent',border:'none',cursor:'pointer',textAlign:'left'}}
                onMouseEnter={e=>e.currentTarget.style.background=T.bg4}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {p.image_url&&<img src={p.image_url} alt="" style={{width:26,height:26,objectFit:'cover',borderRadius:2}}/>}
                <span style={{flex:1,fontSize:12,color:T.text}}>{p.name}</span>
                <span style={{fontSize:10,color:T.textMute}}>{p.sku}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
const makeSlug = name =>
  name.toLowerCase()
    .replace(/[аА]/g,'a').replace(/[бБ]/g,'b').replace(/[вВ]/g,'v').replace(/[гГ]/g,'g')
    .replace(/[дД]/g,'d').replace(/[еЕ]/g,'e').replace(/[жЖ]/g,'zh').replace(/[зЗ]/g,'z')
    .replace(/[иИ]/g,'i').replace(/[йЙ]/g,'y').replace(/[кК]/g,'k').replace(/[лЛ]/g,'l')
    .replace(/[мМ]/g,'m').replace(/[нН]/g,'n').replace(/[оО]/g,'o').replace(/[пП]/g,'p')
    .replace(/[рР]/g,'r').replace(/[сС]/g,'s').replace(/[тТ]/g,'t').replace(/[уУ]/g,'u')
    .replace(/[фФ]/g,'f').replace(/[хХ]/g,'h').replace(/[цЦ]/g,'ts').replace(/[чЧ]/g,'ch')
    .replace(/[шШ]/g,'sh').replace(/[щЩ]/g,'sht').replace(/[ъЪ]/g,'u').replace(/[ьЬ]/g,'')
    .replace(/[юЮ]/g,'yu').replace(/[яЯ]/g,'ya')
    .replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');

const POWER_SOURCES = ['','AEG','GBB (Green Gas)','GBB (CO2)','HPA','Spring','AEP'];
const FPS_RANGES    = ['','< 280 FPS','280–300 FPS','300–330 FPS','330–360 FPS','360–400 FPS','400–450 FPS','450+ FPS'];
const GEARBOX_TYPES = ['','Version 2 (V2)','Version 3 (V3)','Version 6 (V6)','Version 7 (V7)','AK Gearbox','P90/PS90','MP5K','Other'];
const BATTERY_TYPES = ['','Mini Tamiya','Large Tamiya','Deans / T-Plug','XT30','JST','11.1V LiPo','7.4V LiPo','NiMH','N/A (GBB/Spring)'];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductEditor({ productId, allProducts=[], lang='bg' }) {
  const navigate = useNavigate();
  const { syncProduct } = useSiteData();
  const tr = PE_TR[lang] || PE_TR.bg;
  const [loading,setLoading] = useState(true);
  const [saving,setSaving]   = useState(false);
  const [toast,setToast]     = useState(null);
  const [form,setForm]       = useState(null);

  const upd       = (k,v) => setForm(p=>({...p,[k]:v}));
  const showToast = (msg,type='success') => setToast({msg,type});

  useEffect(()=>{
    setLoading(true);
    fetch(`${API}/api/products/${productId}`)
      .then(r=>r.json())
      .then(p=>{
        setForm({
          name:             p.name||'',
          brand:            p.brand||'',
          short_description:p.short_description||'',
          description:      p.description||'',
          parameters:       p.parameters||'',
          price:            p.price??'',
          old_price:        p.old_price??'',
          sku:              p.sku||'',
          stock_quantity:   p.stock_quantity??0,
          track_stock:      p.track_stock??true,
          category:         p.category||'',
          category_parent:  p.category_parent||'',
          image_url:        p.image_url||'',
          images:           (()=>{try{return JSON.parse(p.images||'[]');}catch{return [];}})(),
          tags:             p.tags||'',
          badge_text:       p.badge_text||'',
          badge_color:      p.badge_color||'#D4500A',
          on_promotion:     p.on_promotion||false,
          is_new:           p.is_new||false,
          hidden:           p.hidden||false,
          specs:            (()=>{try{return typeof p.specs==='object'?p.specs:JSON.parse(p.specs||'{}');}catch{return {};}})(),
          variants:         (()=>{try{return typeof p.variants==='object'?p.variants:JSON.parse(p.variants||'[]');}catch{return [];}})(),
          upsell_ids:       (()=>{try{return typeof p.upsell_ids==='object'?p.upsell_ids:JSON.parse(p.upsell_ids||'[]');}catch{return [];}})(),
          characteristics:  (()=>{try{return typeof p.characteristics==='object'?p.characteristics:JSON.parse(p.characteristics||'[]');}catch{return [];}})(),
          meta_title:       p.meta_title||'',
          meta_description: p.meta_description||'',
          slug:             p.slug||'',
        });
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[productId]);

  const handleAutoSeo = () => {
    if(!form) return;
    const name  = form.name.trim();
    const brand = form.brand.trim();
    const cat   = form.category.trim();
    const plain = (form.short_description||form.description||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const slug  = makeSlug(name);
    const withBrand = brand?`${name} | ${brand}`:name;
    const withStore = `${withBrand} | AsWarrior`;
    let metaTitle = withStore.length<=60?withStore:withBrand.length<=60?withBrand:name.slice(0,57)+'…';
    let metaDesc = '';
    if(plain.length>30){metaDesc=plain.length<=155?plain:plain.slice(0,152)+'…';}
    else{
      const parts=[name];
      if(brand) parts.push(lang==='bg'?`от ${brand}`:`by ${brand}`);
      if(cat)   parts.push(cat);
      parts.push(lang==='bg'?'Купи онлайн от AsWarrior.bg — магазин за еърсофт.':'Buy online at AsWarrior.bg — airsoft store.');
      metaDesc=parts.join(' | ').slice(0,160);
    }
    setForm(p=>({...p,slug,meta_title:metaTitle,meta_description:metaDesc}));
    showToast(tr.autoSeoGenerated);
  };

  const handleSave = async () => {
    if(!form?.name?.trim()) return;
    setSaving(true);
    try{
      const payload={
        ...form,
        price:          parseFloat(form.price)||0,
        old_price:      form.old_price!==''&&form.old_price!==null?parseFloat(form.old_price):null,
        stock_quantity: parseInt(form.stock_quantity)||0,
        track_stock:    form.track_stock,
        images:         JSON.stringify(form.images),
        specs:          JSON.stringify(form.specs),
        variants:       JSON.stringify(form.variants),
        upsell_ids:     JSON.stringify(form.upsell_ids),
        characteristics:JSON.stringify(form.characteristics),
        slug:           form.slug||makeSlug(form.name),
      };
      const res=await fetch(`${API}/api/products/${productId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error(tr.saveFailed);
      const updated=await res.json();
      syncProduct(updated);
      showToast(tr.saved);
    }catch(e){showToast(e.message,'error');}
    setSaving(false);
  };

  if(loading||!form) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:320,gap:16}}>
      <Crosshair size={32} style={{color:T.accent}}/>
      <p style={{fontFamily:T.font,fontSize:11,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase'}}>{tr.loading}</p>
    </div>
  );

  return (
    <div style={{maxWidth:1200,margin:'0 auto'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
        <button onClick={()=>navigate('/cms/products')}
          style={{display:'flex',alignItems:'center',gap:6,background:'transparent',border:`1px solid ${T.border}`,color:T.textSub,padding:'6px 12px',borderRadius:3,cursor:'pointer',fontSize:11,fontFamily:T.font,letterSpacing:'0.15em',textTransform:'uppercase'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <ChevronLeft size={14}/> {tr.back}
        </button>
        <div style={{flex:1}}>
          <h1 style={{fontFamily:T.font,fontSize:20,fontWeight:700,letterSpacing:'0.1em',color:T.text,margin:0}}>{form.name||tr.untitled}</h1>
          <p style={{fontSize:11,color:T.textMute,margin:'2px 0 0',fontFamily:T.fontBody}}>ID {productId} · SKU {form.sku||'—'}</p>
        </div>
        <a href={`/product/${productId}`} target="_blank" rel="noreferrer"
          style={{display:'flex',alignItems:'center',gap:5,color:T.textMute,fontSize:11,textDecoration:'none',fontFamily:T.fontBody}}
          onMouseEnter={e=>e.currentTarget.style.color=T.text}
          onMouseLeave={e=>e.currentTarget.style.color=T.textMute}>
          <ExternalLink size={13}/> {tr.preview}
        </a>
        <Btn onClick={handleSave} disabled={saving}><Save size={13}/>{saving?tr.saving:tr.save}</Btn>
      </div>

      {/* 2-col layout */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start'}}>

        {/* LEFT */}
        <div>
          {/* Content: 3 boxes */}
          <Card title={tr.titleDesc} icon={FileText}>
            {/* Box 1 — Short description */}
            <div style={{marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <AlignLeft size={13} style={{color:T.accent}}/>
                <span style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textSub}}>{tr.shortDesc}</span>
                <span style={{fontSize:10,color:T.textMute,fontFamily:T.fontBody}}> — {tr.shortDescSub}</span>
              </div>
              <Txt value={form.short_description} onChange={v=>upd('short_description',v)} rows={3} placeholder={tr.shortDescPh}/>
            </div>

            {/* Divider */}
            <div style={{borderTop:`1px solid ${T.border}`,marginBottom:20}}/>

            {/* Box 2 — Long description (rich text) */}
            <div style={{marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <FileText size={13} style={{color:T.accent}}/>
                <span style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textSub}}>{tr.longDesc}</span>
                <span style={{fontSize:10,color:T.textMute,fontFamily:T.fontBody}}> — {tr.longDescSub}</span>
              </div>
              <RichEditor value={form.description} onChange={v=>upd('description',v)}/>
            </div>

            {/* Divider */}
            <div style={{borderTop:`1px solid ${T.border}`,marginBottom:20}}/>

            {/* Box 3 — Characteristics table */}
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <Table2 size={13} style={{color:T.accent}}/>
                <span style={{fontFamily:T.font,fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textSub}}>{tr.characteristics}</span>
                <span style={{fontSize:10,color:T.textMute,fontFamily:T.fontBody}}> — {tr.charsSub}</span>
              </div>
              <CharacteristicsTable
                value={form.characteristics}
                onChange={v=>upd('characteristics',v)}
                categoryParent={form.category_parent}
                category={form.category}
                lang={lang}
                tr={tr}
              />
            </div>
          </Card>

          <Card title={tr.media} icon={ImageIcon}>
            <MediaManager productId={productId} primary={form.image_url} onPrimaryChange={v=>upd('image_url',v)}
              extras={form.images} onExtrasChange={v=>upd('images',v)} tr={tr}/>
          </Card>

          <Card title={tr.airsoftSpecs} icon={Zap}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Field label={tr.powerSource}><Sel value={form.specs.power_source||''} onChange={v=>upd('specs',{...form.specs,power_source:v})} options={POWER_SOURCES}/></Field>
              <Field label={tr.fpsRange}><Sel value={form.specs.fps_range||''} onChange={v=>upd('specs',{...form.specs,fps_range:v})} options={FPS_RANGES}/></Field>
              <Field label={tr.gearboxType}><Sel value={form.specs.gearbox_type||''} onChange={v=>upd('specs',{...form.specs,gearbox_type:v})} options={GEARBOX_TYPES}/></Field>
              <Field label={tr.batteryType}><Sel value={form.specs.battery_type||''} onChange={v=>upd('specs',{...form.specs,battery_type:v})} options={BATTERY_TYPES}/></Field>
            </div>
          </Card>

          <Card title={tr.cartUpsell} icon={BarChart2} defaultOpen={form.upsell_ids.length>0}>
            <UpsellPicker upsellIds={form.upsell_ids} onChange={v=>upd('upsell_ids',v)} allProducts={allProducts} tr={tr}/>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          <Card title={tr.status} icon={Eye}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
                <span style={{fontSize:13,color:form.hidden?T.textMute:T.text}}>{form.hidden?tr.draft:tr.active}</span>
                <Toggle on={!form.hidden} onChange={v=>upd('hidden',!v)} size={20}/>
              </label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
                <span style={{fontSize:13,color:T.textSub}}>{tr.markNew}</span>
                <Toggle on={form.is_new} onChange={v=>upd('is_new',v)} size={20}/>
              </label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
                <span style={{fontSize:13,color:T.textSub}}>{tr.onPromo}</span>
                <Toggle on={form.on_promotion} onChange={v=>upd('on_promotion',v)} size={20}/>
              </label>
            </div>
          </Card>

          <Card title={tr.organisation} icon={Tag}>
            <Field label={tr.brand}><Inp value={form.brand} onChange={v=>upd('brand',v)} placeholder={tr.brandPh}/></Field>
            <Field label={tr.parentCat}><Inp value={form.category_parent} onChange={v=>upd('category_parent',v)} placeholder={tr.parentCatPh}/></Field>
            <Field label={tr.subCat}><Inp value={form.category} onChange={v=>upd('category',v)} placeholder={tr.subCatPh}/></Field>
          </Card>

          <Card title={tr.pricing} icon={Settings}>
            <Field label={tr.sku}><Inp value={form.sku} onChange={v=>upd('sku',v)} placeholder="e.g. CM048M"/></Field>
            <Field label={tr.price}><Inp type="number" step="0.01" min="0" value={form.price} onChange={v=>upd('price',v)} placeholder="0.00"/></Field>
            <Field label={tr.salePrice} labelSub={tr.salePriceSub}><Inp type="number" step="0.01" min="0" value={form.old_price} onChange={v=>upd('old_price',v)} placeholder="—"/></Field>
            <Field label={tr.stock}>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>upd('stock_quantity',Math.max(0,parseInt(form.stock_quantity||0)-1))} style={{width:34,height:34,background:T.bg3,border:`1px solid ${T.border}`,color:T.text,cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>−</button>
                <Inp type="number" min="0" value={form.stock_quantity} onChange={v=>upd('stock_quantity',v)} style={{textAlign:'center'}}/>
                <button onClick={()=>upd('stock_quantity',parseInt(form.stock_quantity||0)+1)} style={{width:34,height:34,background:T.bg3,border:`1px solid ${T.border}`,color:T.text,cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:8,marginTop:10,cursor:'pointer',userSelect:'none'}}>
                <input type="checkbox" checked={!form.track_stock} onChange={e=>upd('track_stock',!e.target.checked)}
                  style={{width:15,height:15,accentColor:'#D4500A',cursor:'pointer',flexShrink:0}}/>
                <span style={{fontFamily:'Inter,sans-serif',fontSize:12,color:!form.track_stock?T.text:T.textMute,transition:'color .15s'}}>{tr.trackStock}</span>
              </label>
            </Field>
            <Field label={tr.badge}>
              <div style={{display:'flex',gap:6}}>
                <Inp value={form.badge_text} onChange={v=>upd('badge_text',v)} placeholder={tr.badgePh} style={{flex:1}}/>
                <input type="color" value={form.badge_color||'#D4500A'} onChange={e=>upd('badge_color',e.target.value)}
                  style={{width:34,height:34,border:`1px solid ${T.border}`,borderRadius:3,background:T.bg5,cursor:'pointer',padding:2}}/>
              </div>
            </Field>
          </Card>

          <Card title={tr.seo} icon={Link} defaultOpen={false}
            action={<Btn size="sm" variant="magic" onClick={handleAutoSeo} title={tr.autoSeoTooltip}><Wand2 size={11}/> {tr.autoSeo}</Btn>}>
            <div style={{background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.25)',borderRadius:3,padding:'10px 12px',marginBottom:14}}>
              <p style={{fontSize:11,color:'#c4b5fd',lineHeight:1.6,margin:0}}>{tr.autoSeoHelp}</p>
            </div>
            <Field label={tr.urlSlug} labelSub={tr.urlSlugSub}>
              <div style={{display:'flex',gap:6}}>
                <Inp value={form.slug} onChange={v=>upd('slug',v)} placeholder={makeSlug(form.name)||'url-slug'} style={{flex:1}}/>
                <button onClick={()=>upd('slug',makeSlug(form.name))} style={{width:34,height:34,background:T.bg3,border:`1px solid ${T.border}`,color:T.textSub,cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><RefreshCw size={12}/></button>
              </div>
            </Field>
            <Field label={tr.metaTitle} labelSub={`${(form.meta_title||form.name).length}/60`}>
              <Inp value={form.meta_title} onChange={v=>upd('meta_title',v)} placeholder={form.name}/>
              <div style={{height:2,background:T.border,borderRadius:1,marginTop:5,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:1,width:`${Math.min(100,((form.meta_title||form.name).length/60)*100)}%`,background:(form.meta_title||form.name).length>60?T.dangerText:(form.meta_title||form.name).length>45?'#4ade80':T.accent,transition:'width .2s'}}/>
              </div>
            </Field>
            <Field label={tr.metaDesc} labelSub={`${form.meta_description.length}/160`}>
              <Txt value={form.meta_description} onChange={v=>upd('meta_description',v)} rows={3} placeholder={tr.metaDescPh}/>
              <div style={{height:2,background:T.border,borderRadius:1,marginTop:5,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:1,width:`${Math.min(100,(form.meta_description.length/160)*100)}%`,background:form.meta_description.length>160?T.dangerText:form.meta_description.length>120?'#4ade80':T.accent,transition:'width .2s'}}/>
              </div>
            </Field>
            <Field label={tr.tags}><Inp value={form.tags} onChange={v=>upd('tags',v)} placeholder={tr.tagsPh}/></Field>
          </Card>
        </div>
      </div>

      {/* Floating save */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:100}}>
        <Btn onClick={handleSave} disabled={saving} style={{boxShadow:'0 4px 20px rgba(212,80,10,0.4)'}}>
          <Save size={13}/>{saving?tr.saving:tr.save}
        </Btn>
      </div>

      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}
