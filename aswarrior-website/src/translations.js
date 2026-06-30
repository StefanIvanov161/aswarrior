// All UI strings for Bulgarian (bg) and English (en)
// Usage: import { TR } from '../translations'; const t = useT(); t(TR.nav.shop)

export const TR = {
  nav: {
    shop:         { bg: 'Магазин',             en: 'Shop' },
    newArrivals:  { bg: 'Нови Артикули',        en: 'New Arrivals' },
    bundles:      { bg: 'Комплекти',             en: 'Bundles' },
    tacticalKits: { bg: 'Тактически Набори',     en: 'Tactical Kits' },
    about:        { bg: 'За Нас',               en: 'About' },
    buildKit:     { bg: 'Построй Kit',           en: 'Build Kit' },
  },

  hero: {
    learnMore:    { bg: 'Научи Повече',          en: 'Learn More' },
    scroll:       { bg: 'Превъртете',            en: 'Scroll' },
    products:     { bg: 'Продукта',              en: 'Products' },
    operators:    { bg: 'Доволни Оператори',     en: 'Happy Operators' },
    rating:       { bg: 'Средна Оценка',         en: 'Avg. Rating' },
  },

  category: {
    sectionTag:   { bg: 'Разгледай по Категория',  en: 'Browse by Category' },
    sectionTitle: { bg: 'НАМЕРИ СВОЯ КОМПЛЕКТ',    en: 'FIND YOUR KIT' },
  },

  picks: {
    sectionTag:   { bg: 'Подбрано от Професионалисти', en: 'Handpicked by Pros' },
    sectionTitle: { bg: "Избор на Редактора",          en: "Editor's Picks" },
    viewAll:      { bg: 'Виж Всички →',               en: 'View All →' },
    quickAdd:     { bg: 'Добави',                      en: 'Quick Add' },
    loadArsenal:  { bg: 'Зареди Пълния Арсенал',      en: 'Load the Full Arsenal' },
  },

  // Category display names for product cards
  catNames: {
    'AEG Rifle':       { bg: 'AEG Пушка',           en: 'AEG Rifle' },
    'GBB Pistol':      { bg: 'GBB Пистолет',         en: 'GBB Pistol' },
    'Tactical Vest':   { bg: 'Тактически Елек',       en: 'Tactical Vest' },
    'Optics':          { bg: 'Оптика',                en: 'Optics' },
    'Apparel':         { bg: 'Облекло',               en: 'Apparel' },
    'Ammunition':      { bg: 'Амуниция',              en: 'Ammunition' },
    'Magazines':       { bg: 'Пълнители',             en: 'Magazines' },
    'Head Protection': { bg: 'Защита на Главата',     en: 'Head Protection' },
  },

  build: {
    badge:        { bg: 'Ексклузивна Функция — Активна',  en: 'Exclusive Feature — Live Now' },
    line1:        { bg: 'ИЗГРАДИ',        en: 'BUILD' },
    line2:        { bg: 'СВОЯ',           en: 'YOUR' },
    line3:        { bg: 'КОМПЛЕКТ',       en: 'LOADOUT' },
    sub:          { bg: 'Конфигурирай перфектния ейрсофт комплект стъпка по стъпка. Избери реплика, настрой оптиката, добави дръжки и заглушители — изчисляваме цената в реално време.',
                    en: 'Spec out your perfect airsoft kit step-by-step. Pick your replica, dial in your optics, add grips and suppressors — we total it up in real time.' },
    howItWorks:   { bg: 'Как Работи',     en: 'How it works' },
    statSteps:    { bg: 'Стъпки',         en: 'Build Steps' },
    statCombos:   { bg: 'Комбинации',     en: 'Combinations' },
    statCustom:   { bg: 'Персонализиран', en: 'Custom Kit' },
    cta:          { bg: 'Конфигурирай Своя Kit', en: 'Configure Your Kit' },
    ctaSub:       { bg: 'Безплатно · Без регистрация', en: 'Free · No account needed' },
    liveTotal:    { bg: 'Живо Общо',      en: 'Live total' },
  },

  whatsNew: {
    badge:        { bg: 'Току-що Пуснато',    en: 'Just Dropped' },
    introducing:  { bg: 'ПРЕДСТАВЯМЕ',        en: 'INTRODUCING' },
    series:       { bg: 'СЕРИЯТА',            en: 'SERIES' },
    desc:         { bg: 'Нашата най-напреднала тактическа линия. Създадена за нощни операции с IR-съвместими материали, цеви с резба за заглушители и изцяло черни компоненти от цевта до приклада.',
                    en: 'Our most advanced tactical line yet. Built for night operations, featuring infrared-compatible materials, suppressor-ready barrel threads, and blacked-out hardware from barrel to stock.' },
    feat1:        { bg: 'IR-Съвместими Покрития',  en: 'IR-Compatible Coatings' },
    feat2:        { bg: 'Full-Auto HPA Система',    en: 'Full-Auto HPA Engine' },
    feat3:        { bg: 'Оборудван с MOSFET ETU',   en: 'MOSFET ETU Equipped' },
    feat4:        { bg: 'Midnight Black Cerakote',  en: 'Midnight Black Cerakote' },
    cta:          { bg: 'Купи Shadow Ops',          en: 'Shop Shadow Ops' },
    lookbook:     { bg: 'Виж Lookbook',             en: 'View Lookbook' },
  },

  footer: {
    brand:        { bg: 'Премиум ейрсофт и тактическо оборудване за оператори, които изискват повече от всеки комплект.',
                    en: 'Premium airsoft and tactical gear for operators who demand more from every loadout.' },
    shopTitle:    { bg: 'Магазин',              en: 'Shop' },
    shopRifles:   { bg: 'Пушки и AEG',          en: 'Rifles & AEGs' },
    shopPistols:  { bg: 'Пистолети',            en: 'Pistols' },
    shopGear:     { bg: 'Тактическа Екипировка', en: 'Tactical Gear' },
    shopOptics:   { bg: 'Оптика',               en: 'Optics' },
    shopApparel:  { bg: 'Облекло',              en: 'Apparel' },
    shopAmmo:     { bg: 'Амуниция и Кулички',   en: 'Ammo & BBs' },
    suppTitle:    { bg: 'Поддръжка',            en: 'Support' },
    suppFaq:      { bg: 'ЧЗВ',                  en: 'FAQ' },
    suppShipping: { bg: 'Доставка и Връщане',   en: 'Shipping & Returns' },
    suppTrack:    { bg: 'Проследи Поръчка',     en: 'Track Order' },
    suppSize:     { bg: 'Ръководство за Размери', en: 'Size Guide' },
    suppWarranty: { bg: 'Гаранция',             en: 'Warranty' },
    compTitle:    { bg: 'Компания',             en: 'Company' },
    compAbout:    { bg: 'За Нас',               en: 'About Us' },
    compPress:    { bg: 'Преса',                en: 'Press' },
    compCareers:  { bg: 'Кариери',              en: 'Careers' },
    compWholesale:{ bg: 'Едро',                 en: 'Wholesale' },
    compBlog:     { bg: 'Блог',                 en: 'Blog' },
    newsletterTag:{ bg: 'Intel Новини',         en: 'Intel Drops' },
    newsletterH:  { bg: 'Първи Достъп. Без Спам.', en: 'First Access. No Spam.' },
    newsletterSub:{ bg: 'Присъедини се към 50,000+ оператори. Получавай новини, ексклузивни оферти и информация от терена преди всички останали.',
                    en: 'Join 50,000+ operators. Get drops, exclusive deals, and field intel before anyone else.' },
    emailPlaceholder: { bg: 'оператор@имейл.com', en: 'operator@email.com' },
    enlist:       { bg: 'Запиши Се',            en: 'Enlist' },
    copyright:    { bg: '© 2026 AS Warrior. Всички права запазени.', en: '© 2026 AS Warrior. All rights reserved.' },
    privacy:      { bg: 'Политика за Поверителност', en: 'Privacy Policy' },
    terms:        { bg: 'Условия за Ползване',  en: 'Terms of Use' },
    cookies:      { bg: 'Политика за Бисквитки', en: 'Cookie Policy' },
  },

  kit: {
    builderLabel:     { bg: 'Конфигуратор',               en: 'Kit Builder' },
    total:            { bg: 'Общо',                        en: 'Total' },
    currentLoadout:   { bg: 'Текущ Комплект',              en: 'Current Loadout' },
    noReplica:        { bg: 'НЕ Е ИЗБРАНА РЕПЛИКА',        en: 'NO REPLICA SELECTED' },
    notSelected:      { bg: '— НЕ Е ИЗБРАНО —',           en: '— NOT SELECTED —' },
    free:             { bg: 'БЕЗПЛАТНО',                   en: 'FREE' },
    step:             { bg: 'Стъпка',                      en: 'Step' },
    of:               { bg: 'от',                          en: 'of' },
    selectOption:     { bg: 'ИЗБЕРИ ОПЦИЯ',                en: 'SELECT AN OPTION' },
    back:             { bg: 'Назад',                       en: 'Back' },
    next:             { bg: 'Следва',                      en: 'Next' },
    deploy:           { bg: 'Разгърни Комплекта',          en: 'Deploy Kit' },
    compiling:        { bg: 'Компилиране на комплекта...', en: 'Compiling loadout...' },
    compiled:         { bg: 'Комплектът е компилиран',     en: 'Loadout compiled' },
    kitReady:         { bg: 'Комплектът е Готов',          en: 'Kit Ready' },
    addToCart:        { bg: 'Добави Комплекта в Кошницата', en: 'Add Kit to Cart' },
    continueShopping: { bg: 'Продължи Пазаруването',       en: 'Continue Shopping' },
  },

  // Kit step labels & prompts (indexed 0–4 matching STEPS array)
  kitSteps: [
    { label: { bg: 'РЕПЛИКА',    en: 'REPLICA' },    prompt: { bg: 'Избери основната си бойна платформа', en: 'Select your primary weapon platform' } },
    { label: { bg: 'ОПТИКА',     en: 'OPTIC' },      prompt: { bg: 'Избери своята система за прицелване',  en: 'Choose your sighting system' } },
    { label: { bg: 'ДРЪЖКА',     en: 'GRIP' },       prompt: { bg: 'Избери предна дръжка или hand stop',   en: 'Pick a foregrip or hand stop' } },
    { label: { bg: 'ЗАГЛУШИТЕЛ', en: 'SUPPRESSOR' }, prompt: { bg: 'Намали своя сигнатурен отпечатък',      en: 'Suppress your signature' } },
    { label: { bg: 'ПЪЛНИТЕЛ',   en: 'MAGAZINE' },   prompt: { bg: 'Зареди своята система за подаване',    en: 'Load your feeding system' } },
  ],

  // BuildKitSection step card sub-labels
  kitStepSubs: [
    { bg: 'AEG · GBB · HPA',                  en: 'AEG · GBB · HPA' },
    { bg: 'Red Dot · ACOG · Holo',             en: 'Red Dot · ACOG · Holo' },
    { bg: 'Предна Дръжка · Hand Stop',         en: 'Foregrip · Hand Stop' },
    { bg: 'CQB · Дълъг · Флашхайдер',         en: 'CQB · Long · Flash' },
    { bg: 'Mid · Hi-Cap · Барабанен',          en: 'Mid · Hi-Cap · Drum' },
  ],
};
