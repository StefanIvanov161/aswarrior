import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { SiteDataProvider, useSiteData } from './context/SiteDataContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import CategoryStrip from './components/CategoryStrip';
import PromoBanners from './components/PromoBanners';
import BuildKitSection from './components/BuildKitSection';
import WhatsNew from './components/WhatsNew';
import EditorsPicks from './components/EditorsPicks';
import Footer from './components/Footer';
import KitBuilder from './components/KitBuilder';
import CMS from './cms/CMS';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import PartnersPage from './pages/PartnersPage';
import PartnersStrip from './components/PartnersStrip';
import FindYourKitSection from './components/FindYourKitSection';

function AdminButton() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => navigate('/cms')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Admin Panel"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 150,
        width: 40, height: 40, borderRadius: '50%',
        background: hover ? 'rgba(212,80,10,0.9)' : 'rgba(20,20,20,0.9)',
        border: '1px solid rgba(212,80,10,0.4)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', color: hover ? '#fff' : 'rgba(212,80,10,0.7)',
      }}
    >
      <Lock size={15} />
    </button>
  );
}

function Site() {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      <AnimatePresence>
        {showBuilder && <KitBuilder onClose={() => setShowBuilder(false)} />}
      </AnimatePresence>

      <Navbar onBuildKit={() => setShowBuilder(true)} />

      <main className="[overflow-x:clip]">
        <HeroSlider />
        <div className="mt-48 sm:mt-64 lg:mt-80"><PartnersStrip /></div>
        <div className="mt-48 sm:mt-64 lg:mt-80"><PromoBanners /></div>
        <div className="mt-48 sm:mt-64 lg:mt-80"><BuildKitSection onBuildKit={() => setShowBuilder(true)} /></div>
        <div className="mt-48 sm:mt-64 lg:mt-80"><FindYourKitSection /></div>
        <div className="mt-48 sm:mt-64 lg:mt-80"><WhatsNew /></div>
        <div className="mt-48 sm:mt-64 lg:mt-80"><EditorsPicks /></div>
      </main>
      <div style={{ paddingTop: '28px', background: '#0f0f0f' }}><Footer /></div>

      <AdminButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SiteDataProvider>
          <Routes>
            <Route path="/" element={<Site />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/cms/*" element={<CMS />} />
          </Routes>
        </SiteDataProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
