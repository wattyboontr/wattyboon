import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCommentsSection } from './StoryCommentsSection';
import { FormattedContent } from './FormattedContent';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Bookmark, 
  Share2, 
  Lock, 
  User, 
  Clock,
  Eye,
  MessageSquare,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Type,
  Sun,
  Moon,
  Coffee,
  LogIn,
  UserPlus,
  ListFilter
} from 'lucide-react';

export const StoryReader: React.FC = () => {
  const { 
    activeStoryId, 
    activeChapterIndex,
    setActiveChapterIndex,
    stories, 
    openStoryDetail,
    openAuthorProfile,
    setActiveView, 
    toggleLikeStory, 
    toggleLikeChapter,
    toggleLibraryStory, 
    isStoryInLibrary, 
    currentUser,
    setIsAuthModalOpen,
    updateReadingProgress
  } = useApp();

  const [fontSize, setFontSize] = useState<number>(18);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);

  // Preserve reading story state so background sync updates do not reset or jump reading session
  const activeStoryFromContext = stories.find((s) => s.id === activeStoryId) || (activeStoryId ? null : stories[0]);
  const [readingStory, setReadingStory] = useState(activeStoryFromContext);

  useEffect(() => {
    if (activeStoryFromContext) {
      setReadingStory(activeStoryFromContext);
    }
  }, [activeStoryId, activeStoryFromContext?.id, activeStoryFromContext?.updatedAt]);

  const story = readingStory || activeStoryFromContext || stories[0];

  useEffect(() => {
    if (story?.id && currentUser && activeChapterIndex !== undefined) {
      updateReadingProgress(story.id, activeChapterIndex);
    }
  }, [story?.id, activeChapterIndex, currentUser?.id]);

  if (!story) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hikaye Bulunamadı</h2>
        <button 
          onClick={() => setActiveView('explore')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700 transition-all cursor-pointer"
        >
          Keşfet’e Dön
        </button>
      </div>
    );
  }

  const isSaved = isStoryInLibrary(story.id);
  const isStoryLiked = currentUser ? (story.likedBy || []).includes(currentUser.id) : false;

  const chapters = story.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || chapters[0] || {
    id: 'chap_1',
    title: '1. Bölüm',
    content: story.summary || 'Bu bölüm henüz eklenmedi.',
    order: 1,
    readCount: 0,
    createdAt: story.createdAt,
    likes: 0,
    likedBy: []
  };

  const isChapterLiked = currentUser && Array.isArray(currentChapter.likedBy) 
    ? currentChapter.likedBy.includes(currentUser.id) 
    : false;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${story.title} - ${currentChapter.title}`,
        text: story.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Hikaye bağlantısı kopyalandı!');
    }
  };

  // =========================================================================
  // PAYWALL / ROUTE GUARD VIEW FOR NON-LOGGED IN (GUEST) USERS
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24 md:pb-16">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => openStoryDetail(story.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Hikaye Detayına Dön
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Giriş Yap / Kayıt Ol
          </button>
        </div>

        {/* Protected Access Paywall Banner */}
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-xl overflow-hidden p-6 sm:p-10 space-y-6 text-center">
          
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" /> Üyelere Özel Okuma Modu
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-display">
              Devamını Okumak İçin Giriş Yapın veya Kayıt Olun
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              <strong>"{story.title}"</strong> adlı eserin tüm bölümlerini ve içeriğini eksiksiz okumak için ücretsiz WattyBoon hesabınıza giriş yapın ya da saniyeler içinde yeni üyelik oluşturun.
            </p>
          </div>

          {/* Story Preview Box */}
          <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left flex flex-col sm:flex-row gap-4 items-center shadow-inner">
            <img 
              src={story.coverUrl} 
              alt={story.title}
              className="w-24 aspect-[2/3] object-cover rounded-xl shadow-md flex-shrink-0"
            />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  {story.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {story.chapters.length} Bölüm
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {story.title}
              </h3>
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => openAuthorProfile(story.authorId)}
              >
                <img src={story.authorAvatar} alt={story.authorName} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 transition-colors">
                  {story.authorName} (@{story.authorUsername})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {story.summary}
              </p>
            </div>
          </div>

          {/* Call To Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Giriş Yap veya Ücretsiz Üye Ol
            </button>
            <button
              onClick={() => openStoryDetail(story.id)}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> Hikaye Tanıtımına Dön
            </button>
          </div>
        </section>

        {/* Chapters Overview (Locked List) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Eser Bölümleri ({story.chapters.length})
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Üyeliğe Özel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {story.chapters.map((chap, idx) => (
              <div 
                key={chap.id}
                onClick={() => setIsAuthModalOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {chap.order}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 transition-colors">
                    {chap.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <Lock className="w-2.5 h-2.5" /> Kilitli
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    );
  }

  // =========================================================================
  // FULL READER VIEW FOR LOGGED IN MEMBERS
  // =========================================================================
  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fbf0d9] text-[#432b12] border-[#e8d2ac]',
    dark: 'bg-slate-950 text-slate-100 border-slate-800'
  };

  const fontFamilyClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      readingTheme === 'sepia' 
        ? 'bg-[#f7ebd3]' 
        : readingTheme === 'dark' 
        ? 'bg-slate-950' 
        : 'bg-slate-50 dark:bg-slate-950'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-16">
        
        {/* Floating Top Navigation & Reader Controls */}
        <div className="sticky top-4 z-30 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between gap-2">
          
          {/* Back to Story Detail */}
          <button
            onClick={() => openStoryDetail(story.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 hover:text-purple-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="Hikaye Detayına Dön"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Detaya Dön</span>
          </button>

          {/* Chapter Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
              className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-purple-100 transition-colors"
            >
              <ListFilter className="w-3.5 h-3.5 text-purple-600" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate">
                {currentChapter.title}
              </span>
            </button>

            {/* Chapter Dropdown */}
            {isChapterMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Bölüm Seç ({chapters.length})
                </div>
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      setIsChapterMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      idx === activeChapterIndex
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{chap.title}</span>
                    <span className="text-[10px] opacity-75">{chap.order}. Bölüm</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Settings */}
          <div className="flex items-center gap-1.5">
            
            {/* Reading Settings Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSettingsOpen 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                title="Okuma Ayarları"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Reader Options Menu */}
              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-4">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                    ⚙️ Okuma Görünümü Ayarları
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                      <span>Yazı Boyutu</span>
                      <span className="text-purple-600">{fontSize}px</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">A</span>
                      <input 
                        type="range" 
                        min="14" 
                        max="26" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-200">A</span>
                    </div>
                  </div>

                  {/* Reading Theme */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Renk Teması</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setReadingTheme('light')}
                        className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 cursor-pointer ${
                          readingTheme === 'light' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Beyaz
                      </button>
                      <button
                        onClick={() => setReadingTheme('sepia')}
                        className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 cursor-pointer ${
                          readingTheme === 'sepia' ? 'border-amber-600 bg-[#f7ebd3] text-[#432b12]' : 'border-[#e8d2ac] bg-[#fbf0d9] text-[#432b12]'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5 text-amber-800" /> Sepya
                      </button>
                      <button
                        onClick={() => setReadingTheme('dark')}
                        className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 cursor-pointer ${
                          readingTheme === 'dark' ? 'border-purple-500 bg-slate-900 text-purple-300' : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" /> Gece
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Yazı Tipi</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setFontFamily('serif')}
                        className={`p-1.5 rounded-xl text-xs font-serif font-bold border cursor-pointer ${
                          fontFamily === 'serif' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Serif
                      </button>
                      <button
                        onClick={() => setFontFamily('sans')}
                        className={`p-1.5 rounded-xl text-xs font-sans font-bold border cursor-pointer ${
                          fontFamily === 'sans' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Sans
                      </button>
                      <button
                        onClick={() => setFontFamily('mono')}
                        className={`p-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                          fontFamily === 'mono' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Mono
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Like Chapter */}
            <button
              onClick={() => toggleLikeChapter(story.id, activeChapterIndex)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isChapterLiked 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Bölümü Beğen"
            >
              <Heart className={`w-4 h-4 ${isChapterLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Bookmark Story */}
            <button
              onClick={() => toggleLibraryStory(story.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSaved 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Kütüphaneye Ekle"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-300 transition-all cursor-pointer"
              title="Paylaş"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Chapter Reader Container */}
        <article className={`p-6 sm:p-12 rounded-3xl border shadow-xl transition-all space-y-8 ${themeClasses[readingTheme]}`}>
          
          {/* Chapter Header */}
          <header className="space-y-4 pb-6 border-b border-slate-200/60 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                {story.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeChapterIndex + 1} / {chapters.length} Bölüm
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
              {story.title}
            </h1>

            <h2 className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentChapter.title}
            </h2>

            {/* Author & Stats */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-2">
              <div 
                onClick={() => openAuthorProfile(story.authorId)}
                className="flex items-center gap-2 cursor-pointer hover:text-purple-600 transition-colors font-semibold"
              >
                <img src={story.authorAvatar} alt={story.authorName} className="w-6 h-6 rounded-full object-cover" />
                <span>{story.authorName}</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-purple-500" /> {currentChapter.readCount || 0} okuma
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> {currentChapter.likes || 0} beğeni
              </span>
            </div>
          </header>

          {/* Chapter Body Content */}
          <div 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            className={`story-reader-text leading-relaxed select-text space-y-6 ${fontFamilyClasses[fontFamily]}`}
          >
            {currentChapter.content ? (
              <FormattedContent 
                content={currentChapter.content} 
                paragraphClassName="my-4 leading-relaxed"
              />
            ) : (
              <div className="py-12 text-center text-slate-400 italic">
                Bu bölüm henüz metin içeriği içermiyor.
              </div>
            )}
          </div>

          {/* Chapter Bottom Controls */}
          <footer className="pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Previous Chapter */}
            <button
              onClick={() => {
                if (activeChapterIndex > 0) {
                  setActiveChapterIndex(activeChapterIndex - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={activeChapterIndex === 0}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeChapterIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Önceki Bölüm
            </button>

            {/* Like Chapter Button */}
            <button
              onClick={() => toggleLikeChapter(story.id, activeChapterIndex)}
              className={`px-6 py-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isChapterLiked
                  ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isChapterLiked ? 'fill-current' : ''}`} />
              <span>{isChapterLiked ? 'Bölümü Beğendin' : 'Bu Bölümü Beğen'} ({currentChapter.likes || 0})</span>
            </button>

            {/* Next Chapter */}
            <button
              onClick={() => {
                if (activeChapterIndex < chapters.length - 1) {
                  setActiveChapterIndex(activeChapterIndex + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={activeChapterIndex >= chapters.length - 1}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeChapterIndex >= chapters.length - 1
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-lg shadow-purple-500/25'
              }`}
            >
              <span>Sonraki Bölüm</span> <ChevronRight className="w-4 h-4" />
            </button>
          </footer>

        </article>

        {/* Chapter Comments Section */}
        <section className="pt-4">
          <StoryCommentsSection storyId={story.id} chapterIndex={activeChapterIndex} />
        </section>

      </div>
    </div>
  );
};
