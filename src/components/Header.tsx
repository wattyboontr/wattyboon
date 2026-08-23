import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WattyboonLogo } from './WattyboonLogo';
import { UserRoleBadge } from './UserRoleBadge';
import { InfoTabType } from './InfoModal';
import { EditStoryModal } from './EditStoryModal';
import { Category } from '../types';
import { 
  BookOpen, 
  Compass, 
  PenTool, 
  Bookmark, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  LogIn,
  Sparkles, 
  Lock, 
  ChevronDown,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  ShieldCheck,
  Mail,
  Grid,
  ShieldAlert,
  Crown,
  ExternalLink,
  Edit3,
  Home,
  History
} from 'lucide-react';
import { getSavedDeviceAccounts, SavedDeviceAccount } from '../lib/deviceAccounts';

interface HeaderProps {
  onOpenInfoModal?: (tab: InfoTabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfoModal }) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isNsfwEnabled,
    toggleNsfw,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    currentUser, 
    activeView, 
    setActiveView, 
    openStoryEditor, 
    openAuthorProfile, 
    unreadNotificationCount,
    unreadMessageCount,
    openMessagingWithUser,
    logout,
    login,
    loginWithGoogle,
    setIsAuthModalOpen,
    isAdmin
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const [isEditStoryModalOpen, setIsEditStoryModalOpen] = useState(false);

  const savedAccounts = !currentUser ? getSavedDeviceAccounts() : [];
  const lastSavedAccount = savedAccounts[0] || null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30 transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setActiveView('home');
          }}
          className="flex items-center cursor-pointer group select-none hover:opacity-90 transition-opacity"
        >
          <WattyboonLogo className="text-2xl sm:text-3xl" />
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveView('home');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'home'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </button>

          <button
            onClick={() => {
              setActiveView('explore');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'explore'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Keşfet
          </button>

          {/* Kategoriler Butonu (Sayfa Olarak Açar) */}
          <button
            onClick={() => setActiveView('categories')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'categories'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Kategoriler</span>
          </button>

          <button
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'library'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Kütüphanem
          </button>

          <button
            onClick={() => setActiveView('forum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'forum'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Tartışma
          </button>

          {/* Hikaye Yaz & Hikayeni Düzelt Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWriteMenuOpen(!isWriteMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'editor'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Hikaye Yaz</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWriteMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isWriteMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    openStoryEditor(null);
                    setIsWriteMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <PenTool className="w-4 h-4 text-purple-500" />
                  <span>Yeni Hikaye Yaz</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditStoryModalOpen(true);
                    setIsWriteMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  <span>Hikayeni Düzelt</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Messages Button */}
          <button
            onClick={() => openMessagingWithUser()}
            className="relative p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-all"
            title="Mesajlar"
          >
            <MessageCircle className="w-4 h-4" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white dark:border-slate-950">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setActiveView('notifications')}
            className={`relative p-2.5 rounded-xl border transition-all ${
              activeView === 'notifications'
                ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300'
            }`}
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white dark:border-slate-950">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Menu & Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 transition-all cursor-pointer"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-purple-500/30" 
                />
                <span className="hidden sm:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : lastSavedAccount ? (
              <div className="flex items-center gap-2">
                {/* Previous session quick profile button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-all cursor-pointer group"
                  title={`Önceki Oturum: ${lastSavedAccount.name}`}
                >
                  <div className="relative">
                    <img 
                      src={lastSavedAccount.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${lastSavedAccount.username || lastSavedAccount.email}`} 
                      alt={lastSavedAccount.name} 
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-purple-500/50" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Kayıtlı Oturum" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider leading-none">
                      Önceki Oturum
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight mt-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                      {lastSavedAccount.name}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all flex items-center justify-center cursor-pointer"
                  title="Giriş Yap / Kaydol"
                  aria-label="Giriş Yap"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-all cursor-pointer"
                  title="Menü"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all flex items-center justify-center cursor-pointer"
                  title="Giriş Yap"
                  aria-label="Giriş Yap"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dropdown Menu (Logged in or Guest) */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {currentUser ? (
                  <>
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                        <UserRoleBadge userId={currentUser.id} role={currentUser.role} />
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">@{currentUser.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        openAuthorProfile(currentUser.id);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-purple-500" />
                      Profilimi Görüntüle
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-600" />
                        <span>🛡️ Yönetim Paneli</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        openStoryEditor(null);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-4 h-4 text-purple-500" />
                      Yeni Hikaye Oluştur
                    </button>

                    <button
                      onClick={() => {
                        setIsEditStoryModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-indigo-500" />
                      Hikayeni Düzelt
                    </button>
                  </>
                ) : savedAccounts.length > 0 ? (
                  <div className="space-y-2 p-2">
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-purple-100 dark:border-purple-900/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <History className="w-3.5 h-3.5" />
                        Önceki Oturumlarınız
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
                        Kayıtlı
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {savedAccounts.slice(0, 3).map((acc) => (
                        <div
                          key={acc.id || acc.email}
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            if (acc.authProvider === 'google' || acc.email.toLowerCase().includes('gmail')) {
                              await loginWithGoogle(acc.email, acc.name);
                            } else {
                              await login(acc.email || acc.username);
                            }
                          }}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-100/60 dark:hover:bg-purple-900/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={acc.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.username || acc.email}`}
                              alt={acc.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-200 dark:border-purple-800 shadow-2xs"
                            />
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                {acc.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                @{acc.username || acc.email.split('@')[0]}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shrink-0 transition-colors shadow-2xs">
                            Oturumu Aç
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Farklı Hesapla Giriş Yap / Kaydol
                    </button>
                  </div>
                ) : (
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Hoş Geldiniz</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">WattyBoon topluluğuna katılın</p>
                  </div>
                )}

                {/* Bilgilendirme ve İletişim Bağlantıları */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
                  {onOpenInfoModal && (
                    <>
                      <button
                        onClick={() => {
                          onOpenInfoModal('about');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-purple-500" />
                        Hakkımızda
                      </button>
                      <button
                        onClick={() => {
                          onOpenInfoModal('help');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                        Yardım & SSS
                      </button>
                      <button
                        onClick={() => {
                          onOpenInfoModal('privacy');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                        Gizlilik Politikası
                      </button>
                      <button
                        onClick={() => {
                          onOpenInfoModal('contact');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        İletişim
                      </button>
                    </>
                  )}

                  {/* Gece / Gündüz Modu Butonu (Tam İletişim kısmının altında) */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDarkMode();
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                          <span>Gündüz / Gece Modu</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDarkMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {isDarkMode ? 'Gece' : 'Gündüz'}
                        </span>
                      </button>

                      {/* +18 (NSFW) Butonu (Gece/Gündüz modunun tam altında) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNsfw();
                        }}
                        className={`w-full mt-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          isNsfwEnabled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className={`w-3.5 h-3.5 ${isNsfwEnabled ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                          <span>+18 İçerik (NSFW)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isNsfwEnabled ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isNsfwEnabled ? '+18 AÇIK' : 'KAPALI'}
                        </span>
                      </button>
                    </div>
                  </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Giriş Yap / Kaydol
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Story Modal */}
      <EditStoryModal 
        isOpen={isEditStoryModalOpen} 
        onClose={() => setIsEditStoryModalOpen(false)} 
      />
    </header>
  );
};
