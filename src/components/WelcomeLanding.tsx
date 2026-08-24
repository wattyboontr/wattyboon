import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, BookOpen, PenTool, Flame, Compass, Heart, Lock } from 'lucide-react';
import { WattyboonLogo } from './WattyboonLogo';

export const WelcomeLanding: React.FC = () => {
  const { openAuthModal } = useApp();

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <WattyboonLogo className="w-8 h-8" />
          <span className="text-xl font-display font-black tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
            WattyBoon
          </span>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="px-4 py-1.5 rounded-full text-xs font-extrabold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer"
        >
          Giriş Yap
        </button>
      </header>

      {/* Main Center Content */}
      <main className="w-full max-w-lg mx-auto my-auto flex flex-col items-center text-center z-10 space-y-8 sm:space-y-10 py-6">
        
        {/* 3 Floating Book Covers Showcase (Matching uploaded image layout) */}
        <div className="relative w-full max-w-sm h-64 sm:h-72 flex items-center justify-center pt-2">
          
          {/* Left Book Card (#romantik) */}
          <div className="absolute left-2 sm:left-4 bottom-2 z-10 w-28 sm:w-32 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 -rotate-6 transition-transform hover:rotate-0 duration-300">
            <img 
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" 
              alt="Romantik Kurgu" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
              <span className="text-[11px] font-black text-white drop-shadow-md">Crash</span>
              <span className="text-[9px] text-slate-300">Aşk & Tutku</span>
            </div>
          </div>
          <div className="absolute left-6 sm:left-8 -bottom-4 z-20">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
              #romantik
            </span>
          </div>

          {/* Center Main Book Card (#fantezi) */}
          <div className="absolute z-30 w-36 sm:w-44 h-52 sm:h-60 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-500/30 transform hover:scale-105 transition-transform duration-300 bg-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80" 
              alt="Kadim Efsaneler" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <span className="px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                  Popüler
                </span>
              </div>
              <div className="text-left space-y-0.5 text-white">
                <span className="text-xs font-black drop-shadow-md block leading-tight">Given: Ejderha Bahçesi</span>
                <span className="text-[10px] text-purple-300 font-semibold block">Nandi Taylor</span>
                <div className="pt-1 flex items-center gap-1 text-[9px] text-slate-300 font-bold border-t border-white/20">
                  <WattyboonLogo className="w-3.5 h-3.5" />
                  <span>wattyboon eserleri</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[-18px] z-40">
            <span className="px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 text-[11px] font-black shadow-lg ring-1 ring-purple-300 dark:ring-purple-700">
              #fantezi
            </span>
          </div>

          {/* Right Book Card (#bilimkurgu) */}
          <div className="absolute right-2 sm:right-4 bottom-2 z-10 w-28 sm:w-32 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 rotate-6 transition-transform hover:rotate-0 duration-300">
            <img 
              src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" 
              alt="Bilim Kurgu" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
              <span className="text-[11px] font-black text-white drop-shadow-md">PARALLEL</span>
              <span className="text-[9px] text-slate-300">Zaman Yolculuğu</span>
            </div>
          </div>
          <div className="absolute right-6 sm:right-8 -bottom-4 z-20">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
              #bilimkurgu
            </span>
          </div>

        </div>

        {/* Headings & Subtitle */}
        <div className="space-y-3 pt-4 px-2">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Sevdiğin Çeşit Çeşit Hikayeler
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Her kategoride sınırsız hikayeler oku, kendi eserlerini kaleme al ve dev topluluğa katıl.
          </p>
          
          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-purple-400 transition-all" />
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-all" />
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-all" />
          </div>
        </div>

        {/* Action Call-to-Actions (Matching Uploaded Screenshot Style) */}
        <div className="w-full space-y-4 pt-2">
          
          {/* Primary Big Black/Purple Pill Button */}
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-4 px-8 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-extrabold text-base shadow-xl shadow-slate-900/20 dark:shadow-purple-600/30 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ücretsiz Katıl</span>
          </button>

          {/* Login Link below */}
          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
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
        <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold pt-2">
          <Lock className="w-3.5 h-3.5 text-purple-500" />
          <span>Sitedeki hikayeleri keşfetmek ve okumak için oturum açılması gereklidir.</span>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center text-slate-400 dark:text-slate-600 text-xs z-10 pt-4">
        © 2026 WattyBoon. Tüm hakları saklıdır.
      </footer>

    </div>
  );
};
