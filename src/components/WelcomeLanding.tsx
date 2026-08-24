import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { WattyboonLogo } from './WattyboonLogo';

interface SampleSlide {
  id: number;
  heading: string;
  description: string;
  leftCard: {
    title: string;
    subtitle: string;
    tag: string;
    image: string;
  };
  centerCard: {
    title: string;
    author: string;
    tag: string;
    badge: string;
    image: string;
  };
  rightCard: {
    title: string;
    subtitle: string;
    tag: string;
    image: string;
  };
}

const slides: SampleSlide[] = [
  {
    id: 0,
    heading: "Sevdiğin Çeşit Çeşit Hikayeler",
    description: "Her kategoride sınırsız hikayeler oku, kendi eserlerini kaleme al ve dev topluluğa katıl.",
    leftCard: {
      title: "Crash",
      subtitle: "Aşk & Tutku",
      tag: "#romantik",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    centerCard: {
      title: "Given: Ejderha Bahçesi",
      author: "Nandi Taylor",
      tag: "#fantezi",
      badge: "POPÜLER",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80"
    },
    rightCard: {
      title: "PARALLEL",
      subtitle: "Zaman Yolculuğu",
      tag: "#bilimkurgu",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
    }
  },
  {
    id: 1,
    heading: "Büyüleyici Gizem ve Kurgular",
    description: "Sürükleyici bölümler, unutulmaz karakterler ve gizem dolu dünyalar seni bekliyor.",
    leftCard: {
      title: "Five Hargreeves",
      subtitle: "Zamanın Gölgesinde",
      tag: "#gizem",
      image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80"
    },
    centerCard: {
      title: "His Favourite Sin",
      author: "Jenny W.",
      tag: "#karanlıkkurgu",
      badge: "ÖNE ÇIKAN",
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80"
    },
    rightCard: {
      title: "Eunoia",
      subtitle: "Kiraz Çiçekleri",
      tag: "#macera",
      image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&auto=format&fit=crop&q=80"
    }
  },
  {
    id: 2,
    heading: "Kendi Hikayeni Yaz, Milyonlara Ulaş",
    description: "Yazarlık yolculuğuna bugün başla, okurların yorumları ve beğenileriyle eserini büyüt.",
    leftCard: {
      title: "Pain Is Love",
      subtitle: "Sert İmtihan",
      tag: "#dram",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
    },
    centerCard: {
      title: "Siber Savaşçı",
      author: "Aura Writer",
      tag: "#aksiyon",
      badge: "YENİ",
      image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&auto=format&fit=crop&q=80"
    },
    rightCard: {
      title: "Kayıp Yıldızlar",
      subtitle: "Gençlik Ateşi",
      tag: "#gençlik",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80"
    }
  }
];

export const WelcomeLanding: React.FC = () => {
  const { openAuthModal } = useApp();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const current = slides[activeSlide];

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center px-4 py-6 sm:py-10 relative overflow-hidden select-none">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-1">
        <WattyboonLogo size="md" />
        <button
          onClick={() => openAuthModal('login')}
          className="px-4 py-1.5 rounded-full text-xs font-extrabold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer shadow-sm"
        >
          Giriş Yap
        </button>
      </header>

      {/* Main Center Content & Interactive Swipe Area */}
      <main className="w-full max-w-lg mx-auto my-auto flex flex-col items-center text-center z-10 space-y-6 sm:space-y-8 py-4">
        
        {/* Swipeable 3 Book Covers Showcase */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-sm h-64 sm:h-72 flex items-center justify-center pt-2 cursor-grab active:cursor-grabbing group"
        >
          {/* Side Navigation Arrow Buttons */}
          <button 
            onClick={prevSlide}
            aria-label="Önceki Slayt"
            className="absolute left-[-8px] sm:left-[-16px] z-50 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-lg opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={nextSlide}
            aria-label="Sonraki Slayt"
            className="absolute right-[-8px] sm:right-[-16px] z-50 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-lg opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Left Book Card */}
          <div className="absolute left-2 sm:left-4 bottom-2 z-10 w-28 sm:w-32 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 -rotate-6 transition-all duration-500 ease-out transform">
            <img 
              src={current.leftCard.image} 
              alt={current.leftCard.title} 
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
              <span className="text-[11px] font-black text-white drop-shadow-md truncate">{current.leftCard.title}</span>
              <span className="text-[9px] text-slate-300 truncate">{current.leftCard.subtitle}</span>
            </div>
          </div>
          <div className="absolute left-6 sm:left-8 -bottom-4 z-20 transition-all duration-300">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
              {current.leftCard.tag}
            </span>
          </div>

          {/* Center Main Book Card */}
          <div className="absolute z-30 w-36 sm:w-44 h-52 sm:h-60 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-500/40 transform hover:scale-105 transition-all duration-500 ease-out bg-slate-900">
            <img 
              src={current.centerCard.image} 
              alt={current.centerCard.title} 
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <span className="px-2 py-0.5 rounded-md bg-purple-600/95 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                  {current.centerCard.badge}
                </span>
              </div>
              <div className="text-left space-y-0.5 text-white">
                <span className="text-xs sm:text-sm font-black drop-shadow-md block leading-tight truncate">{current.centerCard.title}</span>
                <span className="text-[10px] text-purple-300 font-semibold block truncate">{current.centerCard.author}</span>
                <div className="pt-1 flex items-center gap-1.5 text-[9px] text-slate-300 font-bold border-t border-white/20">
                  <div className="w-3 h-3 rounded-full bg-purple-500 text-white flex items-center justify-center text-[7px] font-black">W</div>
                  <span>wattyboon eserleri</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[-18px] z-40 transition-all duration-300">
            <span className="px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 text-[11px] font-black shadow-lg ring-1 ring-purple-300 dark:ring-purple-700">
              {current.centerCard.tag}
            </span>
          </div>

          {/* Right Book Card */}
          <div className="absolute right-2 sm:right-4 bottom-2 z-10 w-28 sm:w-32 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 rotate-6 transition-all duration-500 ease-out transform">
            <img 
              src={current.rightCard.image} 
              alt={current.rightCard.title} 
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
              <span className="text-[11px] font-black text-white drop-shadow-md truncate">{current.rightCard.title}</span>
              <span className="text-[9px] text-slate-300 truncate">{current.rightCard.subtitle}</span>
            </div>
          </div>
          <div className="absolute right-6 sm:right-8 -bottom-4 z-20 transition-all duration-300">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
              {current.rightCard.tag}
            </span>
          </div>

        </div>

        {/* Dynamic Headings & Interactive Pagination Dots */}
        <div className="space-y-3 pt-3 px-2">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight transition-all">
            {current.heading}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed transition-all">
            {current.description}
          </p>
          
          {/* Interactive Pagination Dots (Click to switch slides) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {slides.map((slide, idx) => (
              <button
                key={`dot_${slide.id}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-6 h-2.5 bg-slate-900 dark:bg-purple-500'
                    : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3.5 pt-1">
          
          {/* Primary Big Black/Purple Button */}
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-3.5 sm:py-4 px-8 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-slate-900/20 dark:shadow-purple-600/30 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ücretsiz Katıl</span>
          </button>

          {/* Login Link below */}
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            <span>Zaten bir hesabın var mı? </span>
            <button
              onClick={() => openAuthModal('login')}
              className="font-black text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              Giriş Yap
            </button>
          </div>

        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold pt-1">
          <Lock className="w-3.5 h-3.5 text-purple-500" />
          <span>Sitedeki hikayeleri keşfetmek ve okumak için oturum açılması gereklidir.</span>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center text-slate-400 dark:text-slate-600 text-xs z-10 pt-3">
        © 2026 WattyBoon. Tüm hakları saklıdır.
      </footer>

    </div>
  );
};

