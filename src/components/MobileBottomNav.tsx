import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Bookmark, PenTool, MessageSquare, User as UserIcon, Compass } from 'lucide-react';
import { getSavedDeviceAccounts } from '../lib/deviceAccounts';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setSelectedCategoryFilter, openStoryEditor, openAuthorProfile, currentUser } = useApp();

  const savedAccounts = !currentUser ? getSavedDeviceAccounts() : [];
  const lastSavedAccount = savedAccounts[0] || null;

  // In reader view, keep screen distraction-free (StoryReader has its own floating quick toolbar)
  if (activeView === 'reader') {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: Home,
      onClick: () => setActiveView('home'),
      isActive: activeView === 'home',
    },
    {
      id: 'explore',
      label: 'Keşfet',
      icon: Compass,
      onClick: () => setActiveView('explore'),
      isActive: activeView === 'explore',
    },
    {
      id: 'library',
      label: 'Kütüphane',
      icon: Bookmark,
      onClick: () => setActiveView('library'),
      isActive: activeView === 'library',
    },
    {
      id: 'editor',
      label: 'Yaz',
      icon: PenTool,
      onClick: () => openStoryEditor(null),
      isActive: activeView === 'editor',
    },
    {
      id: 'profile',
      label: currentUser ? 'Profil' : lastSavedAccount ? 'Oturum' : 'Giriş',
      customRender: () => {
        const isActive = activeView === 'profile';
        const displayAvatar = currentUser?.avatar || lastSavedAccount?.avatar;

        return (
          <button
            key="profile"
            onClick={() => {
              if (currentUser) {
                openAuthorProfile(currentUser.id);
              } else {
                setActiveView('profile');
              }
            }}
            className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 bg-purple-50 dark:bg-purple-950/60 rounded-2xl -z-10 animate-fade-in border border-purple-200/50 dark:border-purple-800/40" />
            )}
            {displayAvatar ? (
              <div className="relative">
                <img 
                  src={displayAvatar} 
                  alt="Profil" 
                  className={`w-5 h-5 rounded-full object-cover ring-1.5 ${
                    isActive 
                      ? 'ring-purple-600 dark:ring-purple-400 scale-110' 
                      : 'ring-slate-300 dark:ring-slate-700'
                  }`} 
                />
                {!currentUser && lastSavedAccount && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
                )}
              </div>
            ) : (
              <UserIcon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
              {currentUser ? 'Profil' : lastSavedAccount ? 'Oturum' : 'Giriş'}
            </span>
          </button>
        );
      },
      isActive: activeView === 'profile',
    },
  ];

  return (
    <nav 
      aria-label="Mobil Gezinme Menüsü"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-purple-100 dark:border-purple-900/40 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.customRender) {
            return item.customRender();
          }
          const Icon = item.icon!;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                item.isActive
                  ? 'text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.isActive && (
                <span className="absolute inset-0 bg-purple-50 dark:bg-purple-950/60 rounded-2xl -z-10 animate-fade-in border border-purple-200/50 dark:border-purple-800/40" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
