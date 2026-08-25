import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Play, 
  BookOpen, 
  Eye, 
  CheckCircle2, 
  Heart, 
  Crown, 
  Zap, 
  ChevronLeft,
  ChevronRight,
  PenTool,
  Bookmark,
  TrendingUp,
  MessageSquare,
  Users,
  ArrowRight,
  MessagesSquare,
  Dices,
  Shuffle,
  Star
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    stories, 
    currentUser, 
    openStoryDetail, 
    openStoryReader, 
    openAuthorProfile, 
    toggleLibraryStory, 
    isStoryInLibrary, 
    openStoryEditor,
    setActiveView
  } = useApp();

  // Public stories available to current user (Deduplicated)
  const availableStories = useMemo(() => {
    const list = (stories || []).filter((s) => {
      if (!s || !s.id) return false;
      return s.visibility !== 'private' || (currentUser && s.authorId === currentUser.id);
    });

    const map = new Map<string, typeof list[0]>();
    list.forEach((s) => {
      const key = `${(s.title || '').trim().toLowerCase()}___${s.authorId || s.authorUsername}`;
      if (!map.has(key)) {
        map.set(key, s);
      } else {
        const existing = map.get(key)!;
        if ((s.chapters?.length || 0) > (existing.chapters?.length || 0)) {
          map.set(key, s);
        }
      }
    });

    return Array.from(map.values());
  }, [stories, currentUser]);

  // Top Featured Stories for Hero Slider
  const sliderStories = useMemo(() => {
    if (!availableStories.length) return [];
    return [...availableStories]
      .sort((a, b) => (b.reads * 1.5 + b.likes * 3) - (a.reads * 1.5 + a.likes * 3))
      .slice(0, 5);
  }, [availableStories]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-advance slider every 6 seconds
  useEffect(() => {
    if (!isAutoPlay || sliderStories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderStories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, sliderStories.length]);

  const nextSlide = () => {
    if (!sliderStories.length) return;
    setCurrentSlide((prev) => (prev + 1) % sliderStories.length);
  };

  const prevSlide = () => {
    if (!sliderStories.length) return;
    setCurrentSlide((prev) => (prev - 1 + sliderStories.length) % sliderStories.length);
  };

  const activeStory = sliderStories[currentSlide] || sliderStories[0];

  // Stories to Continue Reading (Okumaya Devam Et)
  const continueReadingList = useMemo(() => {
    if (!currentUser) return [];
    const progressList = Array.isArray(currentUser.readingProgress) ? currentUser.readingProgress : [];
    if (!progressList.length) return [];
    return progressList
      .map((progress) => {
        const story = stories.find((s) => s.id === progress.storyId);
        if (!story) return null;
        return {
          story,
          lastChapterIndex: progress.lastChapterIndex,
          updatedAt: progress.updatedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [currentUser, stories]);

  // Recommended Stories (Sizin İçin Önerilenler)
  const recommendedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => (b.reads * 0.4 + b.likes * 0.6) - (a.reads * 0.4 + a.likes * 0.6))
      .slice(0, 6);
  }, [availableStories]);

  // "Ne Okusam?" Random lucky story picker state
  const [randomStoryIndex, setRandomStoryIndex] = useState<number>(0);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const selectedRandomStory = useMemo(() => {
    if (!availableStories.length) return null;
    return availableStories[randomStoryIndex % availableStories.length];
  }, [availableStories, randomStoryIndex]);

  const handleShuffleRandomStory = () => {
    if (!availableStories.length || isShuffling) return;
    setIsShuffling(true);
    let count = 0;
    const interval = setInterval(() => {
      setRandomStoryIndex(Math.floor(Math.random() * availableStories.length));
      count++;
      if (count > 6) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 80);
  };

  // Trending & Most Liked Stories (Öne Çıkanlar & Trendler)
  const mostLikedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return b.reads - a.reads;
      })
      .slice(0, 6);
  }, [availableStories]);

  // Personalized Stories for user (Sana Özel)
  const personalizedStories = useMemo(() => {
    if (!availableStories.length) return [];
    
    const categoryWeights: Record<string, number> = {};
    if (currentUser) {
      const userLib = Array.isArray(currentUser.library) ? currentUser.library : [];
      userLib.forEach((item) => {
        const s = stories.find((st) => st.id === item.storyId);
        if (s?.category) {
          categoryWeights[s.category] = (categoryWeights[s.category] || 0) + 3;
        }
      });
      const userProg = Array.isArray(currentUser.readingProgress) ? currentUser.readingProgress : [];
      userProg.forEach((item) => {
        const s = stories.find((st) => st.id === item.storyId);
        if (s?.category) {
          categoryWeights[s.category] = (categoryWeights[s.category] || 0) + 2;
        }
      });
    }

    const preferredCategories = Object.keys(categoryWeights);

    if (preferredCategories.length > 0) {
      return [...availableStories]
        .filter((s) => preferredCategories.includes(s.category))
        .sort((a, b) => {
          const scoreA = (categoryWeights[a.category] || 0) + a.likes * 0.1;
          const scoreB = (categoryWeights[b.category] || 0) + b.likes * 0.1;
          return scoreB - scoreA;
        })
        .slice(0, 6);
    }

    return [...availableStories]
      .sort((a, b) => (b.likes * 2 + b.reads) - (a.likes * 2 + a.reads))
      .slice(0, 6);
  }, [currentUser, availableStories, stories]);

  // Short Stories (Kısa Hikayeler)
  const shortStories = useMemo(() => {
    return [...availableStories]
      .filter((s) => s.isShortStory || s.readingTimeMinutes <= 7 || s.chapters.length === 1)
      .sort((a, b) => {
        if (a.isShortStory !== b.isShortStory) return a.isShortStory ? -1 : 1;
        return b.likes - a.likes;
      })
      .slice(0, 6);
  }, [availableStories]);

  // Completed Stories (Tamamlanan Hikayeler)
  const completedStories = useMemo(() => {
    return availableStories
      .filter((s) => s.status === 'completed' || s.isCompleted === true)
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 6);
  }, [availableStories]);

  // New Releases (Son Eklenenler)
  const latestStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  }, [availableStories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* 📌 EN ÜSTE SABİTLENMİŞ TOPLULUK & FORUM ÇUBUĞU */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shrink-0">
            <MessagesSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              WattyBoon Topluluk & Forum
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Yazarlık tüyoları, sohbetler ve aradığınız kurgular için topluluğa katılın.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('forum')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <span>Foruma Git</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 1. Interactive Hero Slider (Vitrin Slider) */}
      {sliderStories.length > 0 && activeStory && (
        <section 
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900/95 dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 transition-all group/slider"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 -left-12 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-12 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full filter blur-3xl pointer-events-none" />

          {/* Navigation Arrows */}
          {sliderStories.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer"
                title="Önceki Hikaye"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer"
                title="Sonraki Hikaye"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
            
            {/* Story Cover */}
            <div 
              onClick={() => openStoryDetail(activeStory.id)}
              className="relative w-48 sm:w-56 md:w-52 lg:w-64 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/25 dark:ring-purple-500/30 group cursor-pointer transform hover:-translate-y-1 hover:shadow-purple-500/20 transition-all duration-300 mx-auto md:mx-0 bg-slate-200 dark:bg-slate-800"
            >
              <img 
                src={activeStory.coverUrl} 
                alt={activeStory.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />

              {activeStory.isNsfw && (
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg border border-white/25 tracking-tighter">
                  +18
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  <BookOpen className="w-3 h-3 text-purple-300" />
                  {activeStory.chapters.length} Bölüm
                </span>
                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  <Eye className="w-3 h-3 text-blue-300" />
                  {activeStory.reads > 1000 ? `${(activeStory.reads / 1000).toFixed(1)}k` : activeStory.reads}
                </span>
              </div>
            </div>

            {/* Story Details & Actions */}
            <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-black shadow-md shadow-purple-500/25 tracking-wide">
                  <Crown className="w-3.5 h-3.5 fill-current" /> ÖNE ÇIKAN SLIDER #{currentSlide + 1}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  {activeStory.category}
                </span>
                {(activeStory.status === 'completed' || activeStory.isCompleted) && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-500" /> ~{activeStory.readingTimeMinutes || 5} dk okuma
                </span>
              </div>

              <h1 
                onClick={() => openStoryDetail(activeStory.id)}
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
              >
                {activeStory.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                {activeStory.summary}
              </p>

              {/* Author & CTA Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60 dark:border-slate-800/80">
                <div 
                  className="flex items-center gap-3 cursor-pointer group/author"
                  onClick={() => openAuthorProfile(activeStory.authorId)}
                >
                  <img 
                    src={activeStory.authorAvatar} 
                    alt={activeStory.authorName} 
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500 shadow-md group-hover/author:scale-105 transition-transform" 
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-purple-600 dark:group-hover/author:text-purple-300 transition-colors">
                      {activeStory.authorName}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">@{activeStory.authorUsername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {(() => {
                    const activeProgress = currentUser?.readingProgress?.find((p) => p.storyId === activeStory.id);
                    const resumeIndex = activeProgress ? activeProgress.lastChapterIndex : 0;
                    const hasProgress = activeProgress !== undefined && activeProgress.lastChapterIndex > 0;

                    return (
                      <button
                        onClick={() => openStoryReader(activeStory.id, resumeIndex)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        title={hasProgress ? `Kaldığın yerden devam et (${resumeIndex + 1}. Bölüm)` : 'Okumaya Başla'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{hasProgress ? `Devam Et (${resumeIndex + 1}. Bölüm)` : 'Okumaya Başla'}</span>
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => openStoryDetail(activeStory.id)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-400 font-bold text-xs transition-all cursor-pointer active:scale-95"
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => toggleLibraryStory(activeStory.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      isStoryInLibrary(activeStory.id)
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600'
                    }`}
                    title={isStoryInLibrary(activeStory.id) ? 'Kütüphaneden Çıkar' : 'Kütüphaneye Ekle'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slider Pagination Dots & Mini Thumbnails */}
              {sliderStories.length > 1 && (
                <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                  {sliderStories.map((s, idx) => (
                    <button
                      key={`slide_dot_${s.id}`}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide
                          ? 'w-8 bg-purple-600 dark:bg-purple-400'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      title={s.title}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>
        </section>
      )}

      {/* 2. Sizin İçin Önerildi (Asymmetric Grid Layout) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            Sizin için önerildi
          </h2>
          <button
            onClick={() => setActiveView('explore')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedStories.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Henüz Yayımlanmış Hikaye Bulunmuyor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Platformumuz sıfırlandı! İlk hikayeyi kaleme alıp milyonlarca okurla buluşturan ilk yazar sen ol.
              </p>
            </div>
            <button
              onClick={() => openStoryEditor(null)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <PenTool className="w-4 h-4" /> İlk Hikayeni Yaz
            </button>
          </div>
        ) : (
          (() => {
            const mainHeroStory = recommendedStories[0];
            const gridStories = recommendedStories.slice(1, 5);

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
                
                {/* Left Main Large Hero Card */}
                {mainHeroStory && (
                  <div 
                    onClick={() => openStoryDetail(mainHeroStory.id)}
                    className={`relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-900 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex flex-col justify-end transition-all duration-300 hover:ring-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 ${
                      gridStories.length > 0 ? 'md:col-span-5 lg:col-span-5' : 'md:col-span-12'
                    }`}
                  >
                    <img 
                      src={mainHeroStory.coverUrl} 
                      alt={mainHeroStory.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100" 
                    />

                    {/* Gradient Overlay for Readable Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                    {/* Category / Badge */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-black tracking-wide shadow-md">
                        ✨ ÖNE ÇIKAN ÖNERİ
                      </span>
                    </div>

                    {/* Bottom Info Content */}
                    <div className="relative z-10 p-5 sm:p-6 space-y-2 text-white">
                      <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest block">
                        {mainHeroStory.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-black leading-tight tracking-tight drop-shadow-md group-hover:text-purple-300 transition-colors">
                        {mainHeroStory.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed">
                        {mainHeroStory.summary}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 border-t border-white/15">
                        <span className="flex items-center gap-1.5 text-white font-bold">
                          <PenTool className="w-3.5 h-3.5 text-purple-400" />
                          {mainHeroStory.authorName}
                        </span>
                        <span className="flex items-center gap-2 text-[11px]">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-purple-400" /> {mainHeroStory.reads}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {mainHeroStory.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right 2x2 Grid for Remaining Recommended Stories */}
                {gridStories.length > 0 && (
                  <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
                    {gridStories.map((story) => (
                      <div
                        key={`rec_grid_${story.id}`}
                        onClick={() => openStoryDetail(story.id)}
                        className="relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-900 aspect-[3/4] flex flex-col justify-end transition-all duration-300 hover:ring-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
                      >
                        <img 
                          src={story.coverUrl} 
                          alt={story.title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100" 
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

                        {/* Top Category Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold tracking-tight border border-white/10">
                            {story.category}
                          </span>
                        </div>

                        {/* Title & Author at bottom */}
                        <div className="relative z-10 p-3.5 sm:p-4 space-y-1 text-white">
                          <h4 className="text-xs sm:text-sm font-display font-extrabold leading-snug tracking-tight truncate group-hover:text-purple-300 transition-colors">
                            {story.title}
                          </h4>
                          <p className="text-[10px] text-slate-300 font-medium truncate flex items-center justify-between">
                            <span>by {story.authorName}</span>
                            <span className="flex items-center gap-1 text-[10px] text-purple-300">
                              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {story.likes}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })()
        )}
      </section>

      {/* 🎲 "NE OKUSAM?" (Kararsızlar İçin Şanslı Seri Önerisi) MODÜLÜ - KÜÇÜK VE ŞIK */}
      {selectedRandomStory && (
        <section className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  Ne Okusam? <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">Şanslı Seri</span>
                </h3>
              </div>
            </div>

            {/* Shuffle Button */}
            <button
              onClick={handleShuffleRandomStory}
              disabled={isShuffling}
              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1 border border-purple-200/60 dark:border-purple-800/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Karıştırılıyor' : 'Karıştır'}</span>
            </button>
          </div>

          {/* Random Story Compact Row */}
          <div className="flex items-center gap-3">
            {/* Small Cover */}
            <div 
              onClick={() => openStoryDetail(selectedRandomStory.id)}
              className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 shrink-0 cursor-pointer group"
            >
              <img 
                src={selectedRandomStory.coverUrl} 
                alt={selectedRandomStory.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            {/* Story Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  {selectedRandomStory.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {((selectedRandomStory.likes * 0.1) % 1.5 + 8.5).toFixed(1)}
                </span>
                <span>•</span>
                <span>{selectedRandomStory.chapters.length} Bölüm</span>
              </div>

              <h4 
                onClick={() => openStoryDetail(selectedRandomStory.id)}
                className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
              >
                {selectedRandomStory.title}
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">
                {selectedRandomStory.summary}
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => openStoryReader(selectedRandomStory.id, 0)}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Hemen Oku</span>
                </button>

                <button
                  onClick={() => openStoryDetail(selectedRandomStory.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  İncele
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Continue Reading Section (Okumaya Devam Et) */}
      {continueReadingList.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Okumaya Devam Et
            </h2>
            <span className="text-xs text-slate-400 font-medium">Kaldığın yerden sürdür</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueReadingList.slice(0, 3).map(({ story, lastChapterIndex }) => {
              const chapter = story.chapters[lastChapterIndex] || story.chapters[0];
              const totalChapters = story.chapters.length;

              return (
                <div
                  key={story.id}
                  onClick={() => openStoryReader(story.id, lastChapterIndex)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-12 h-16 object-cover rounded-xl shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {story.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Kaldığın Bölüm: <span className="font-semibold text-slate-700 dark:text-slate-300">{chapter ? chapter.title : `Bölüm ${lastChapterIndex + 1}`}</span>
                    </p>
                    <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.round(((lastChapterIndex + 1) / totalChapters) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openStoryReader(story.id, lastChapterIndex);
                    }}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform cursor-pointer"
                    title="Devam Et"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Öne Çıkan Hikayeler (En Çok Beğenilenler & Trendler) */}
      {mostLikedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              Trend & Popüler Hikayeler
            </h2>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> En Çok Beğenilenler
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {mostLikedStories.map((story, idx) => (
              <div key={`home_featured_${story.id}`} className="relative group">
                {idx < 3 && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black shadow-md flex items-center gap-0.5">
                    <Crown className="w-3 h-3 fill-current" /> #{idx + 1}
                  </div>
                )}
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Sana Özel Section (Personalized Stories) */}
      {personalizedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sana Özel Kurgular
            </h2>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> İlgi alanlarına ve okuma zevkine göre
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {personalizedStories.map((story) => (
              <StoryCard key={`home_pers_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Kısa Hikayeler Bandı (Short Stories) */}
      {shortStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Kısa Hikayeler
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              ⚡ Tek Oturuşta Bitirebileceğiniz Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {shortStories.map((story) => (
              <div key={`home_short_${story.id}`} className="relative group">
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold shadow-md flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" /> Kısa
                </div>
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Tamamlanan Hikayeler (Completed Stories) */}
      {completedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Tamamlanan Hikayeler
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Final Yapan Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {completedStories.map((story) => (
              <StoryCard key={`home_comp_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Son Yayınlanan Hikayeler Vitrini */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Yeni Eklenen Hikayeler
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Topluluk tarafından en son eklenen ve güncellenen kurgular
            </p>
          </div>
        </div>

        {latestStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {latestStories.map((story) => (
              <StoryCard key={`home_latest_${story.id}`} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 space-y-4">
            <PenTool className="w-12 h-12 text-purple-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Henüz Hikaye Eklenmedi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              İlk hikayeyi yazıp WattyBoon topluluğuna katılan ilk yazar olabilirsin!
            </p>
            <button
              onClick={() => openStoryEditor(null)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Hikaye Yazmaya Başla
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
