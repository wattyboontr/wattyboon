import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Eye, 
  Heart, 
  Bookmark, 
  MessageSquare, 
  Share2, 
  Lock, 
  Globe, 
  Clock, 
  PenTool, 
  Plus, 
  Sparkles,
  UserCheck,
  UserPlus,
  Calendar,
  ListPlus,
  Trash2,
  Headphones,
  Zap,
  ExternalLink,
  Trophy,
  TrendingUp,
  ShieldAlert,
  Flame,
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { AddToCustomListModal } from './AddToCustomListModal';
import { StoryCommentsSection } from './StoryCommentsSection';
import { StoryReportModal } from './StoryReportModal';
import { Story } from '../types';

export const StoryDetailView: React.FC = () => {
  const { 
    stories, 
    activeStoryId, 
    setActiveView, 
    openStoryReader, 
    openAuthorProfile, 
    openStoryEditor,
    toggleLibraryStory, 
    isStoryInLibrary, 
    toggleLikeStory, 
    toggleLikeChapter,
    deleteStory,
    deleteChapter,
    currentUser,
    setIsAuthModalOpen,
    toggleFollowUser,
    setSelectedCategoryFilter,
    setSelectedTagFilter,
    isNsfwEnabled,
    toggleNsfw
  } = useApp();

  // Active Tab state: 'summary' (Özet) or 'chapters' (Bölümler)
  const [activeTab, setActiveTab] = useState<'summary' | 'chapters'>('summary');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);
  const [isCustomListModalOpen, setIsCustomListModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const story = stories.find((s) => s.id === activeStoryId);

  // Turkish locative suffix helper (e.g. Romantik'te, Korku'da)
  const getTurkishLocative = (word: string): string => {
    const clean = word.trim().replace(/^#/, '');
    if (!clean) return '';
    const lastVowelMatch = clean.match(/[aıoueiöüAIOUEIÖÜ][^aıoueiöüAIOUEIÖÜ]*$/);
    const lastVowel = lastVowelMatch ? lastVowelMatch[0][0].toLowerCase() : 'e';
    const isBack = ['a', 'ı', 'o', 'u'].includes(lastVowel);
    
    const lastChar = clean.slice(-1).toLowerCase();
    const isVoiceless = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'].includes(lastChar);
    
    const dOrT = isVoiceless ? 't' : 'd';
    const aOrE = isBack ? 'a' : 'e';
    
    return `'${dOrT}${aOrE}`;
  };

  const getStoryScore = (s: Story) => {
    return (s.reads || 0) + (s.likes || 0) * 5 + (s.comments?.length || 0) * 2;
  };

  // Category Rank Calculation
  const categoryRankInfo = useMemo(() => {
    if (!story) return { rank: 1, total: 1 };
    const categoryStories = stories
      .filter((s) => s && s.category === story.category && s.visibility !== 'private')
      .sort((a, b) => getStoryScore(b) - getStoryScore(a));

    const rankIndex = categoryStories.findIndex((s) => s.id === story.id);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 1;
    const total = Math.max(categoryStories.length, 1);

    return { rank, total };
  }, [stories, story]);

  // Tag Ranks Calculation
  const tagRankInfos = useMemo(() => {
    if (!story || !story.tags || story.tags.length === 0) return [];

    return story.tags
      .map((tag) => {
        const cleanTag = tag.trim().replace(/^#/, '');
        const tagStories = stories
          .filter((s) => s && s.tags?.some((t) => t.toLowerCase() === cleanTag.toLowerCase()) && s.visibility !== 'private')
          .sort((a, b) => getStoryScore(b) - getStoryScore(a));

        const rankIndex = tagStories.findIndex((s) => s.id === story.id);
        const rank = rankIndex !== -1 ? rankIndex + 1 : 1;
        const total = Math.max(tagStories.length, 1);

        return {
          tag: cleanTag,
          rank,
          total,
        };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [stories, story]);

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
  const isLiked = currentUser ? (story.likedBy || []).includes(currentUser.id) : false;
  
  // Author checks: compare ID, username or name
  const isAuthor = Boolean(
    currentUser && (
      currentUser.id === story.authorId || 
      (currentUser.username && story.authorUsername && currentUser.username.toLowerCase() === story.authorUsername.toLowerCase()) ||
      (currentUser.name && story.authorName && currentUser.name.toLowerCase() === story.authorName.toLowerCase())
    )
  );

  const isFollowingAuthor = currentUser && Array.isArray(currentUser.following) 
    ? currentUser.following.includes(story.authorId) 
    : false;

  // Reading history progress
  const userReadingProgress = useMemo(() => {
    if (!currentUser || !Array.isArray(currentUser.readingProgress)) return null;
    return currentUser.readingProgress.find((p) => p.storyId === story.id) || null;
  }, [currentUser, story.id]);

  const resumeChapterIndex = userReadingProgress ? userReadingProgress.lastChapterIndex : 0;
  const hasReadingHistory = userReadingProgress !== null && userReadingProgress.lastChapterIndex > 0;
  const resumeChapterTitle = story.chapters[resumeChapterIndex]?.title || `${resumeChapterIndex + 1}. Bölüm`;

  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.summary,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in pb-32">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setActiveView('explore')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Keşfet’e Dön
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors cursor-pointer"
          title="Paylaş"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Cover & Info Section */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row gap-5 lg:gap-7 items-start">
          
          {/* Vertical Book Cover Image */}
          <div className="relative w-36 sm:w-44 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-500/20 bg-slate-100 dark:bg-slate-800 mx-auto sm:mx-0">
            <img 
              src={story.coverUrl} 
              alt={story.title} 
              className={`w-full h-full object-cover transition-all duration-300 ${
                story.isNsfw && !isNsfwEnabled ? 'blur-md filter scale-110 brightness-75' : ''
              }`} 
            />

            {story.isNsfw && (
              <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] shadow-md">
                +18
              </div>
            )}

            {story.isNsfw && !isNsfwEnabled && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm p-3 flex flex-col items-center justify-center text-center gap-2 z-10">
                <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider">+18 İçerik</span>
                <button
                  onClick={toggleNsfw}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-md"
                >
                  Göster
                </button>
              </div>
            )}
          </div>

          {/* Right Info Column */}
          <div className="flex-1 space-y-3.5 w-full text-left">
            
            {/* Story Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {story.title}
            </h1>

            {/* Author Row */}
            <div className="flex items-center justify-between gap-3 py-1">
              <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => openAuthorProfile(story.authorId)}
              >
                <img 
                  src={story.authorAvatar} 
                  alt={story.authorName} 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500" 
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">
                  {story.authorName} <span className="text-purple-600 dark:text-purple-400 font-semibold">(@{story.authorUsername})</span>
                </span>
              </div>

              {!isAuthor && (
                <button
                  onClick={() => toggleFollowUser(story.authorId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isFollowingAuthor
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                  }`}
                >
                  {isFollowingAuthor ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isFollowingAuthor ? 'Takipte' : 'Takip Et'}</span>
                </button>
              )}
            </div>

            {/* Stats Row (Reads, Likes, Chapters) */}
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold py-1">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-500" /> {story.reads || 0}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" /> {story.likes || 0}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-amber-500" /> {story.chapters.length} bölüm
              </span>
            </div>

            {/* Category / Status Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                {story.category}
              </span>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                story.status === 'completed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
              }`}>
                {story.status === 'completed' ? '✓ Tamamlandı' : '• Devam Ediyor'}
              </span>

              {story.isShortStory && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[11px] flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Kısa
                </span>
              )}

              {story.isNsfw && (
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px]">
                  +18
                </span>
              )}
            </div>

            {/* Report Button for Non-Author */}
            {!isAuthor && (
              <div className="pt-1">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Şikayet veya Telif Bildir
                </button>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 📖 PROMINENT "OKUMAYA BAŞLA" ACTION BANNER (Right Above Özet & Bölümler Tabs) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900/10 via-purple-600/10 to-indigo-900/10 dark:from-purple-950/60 dark:to-indigo-950/60 border border-purple-500/20 dark:border-purple-500/30 shadow-lg shadow-purple-900/5 dark:shadow-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-purple-600/20 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {hasReadingHistory ? 'Kaldığın Yerden Devam Et' : 'Hikayeye Başla'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-purple-200/70 font-medium mt-0.5">
              {hasReadingHistory 
                ? `${resumeChapterTitle} kalınan bölüm` 
                : `${story.chapters.length} Bölüm • Keyifli Okumalar`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => openStoryReader(story.id, resumeChapterIndex)}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {hasReadingHistory
                ? `Devam Et (${resumeChapterTitle})`
                : 'Okumaya Başla'}
            </span>
          </button>

          <button
            onClick={() => setIsCustomListModalOpen(true)}
            className={`p-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              isSaved
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
            title="Kütüphaneye / Listeye Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleLikeStory(story.id)}
            className={`p-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-400'
            }`}
            title="Hikayeyi Beğen"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tab Bar: Özet (Summary) vs Bölümler (Chapters) */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Özet
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'chapters'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <span>Bölümler</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'chapters' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {story.chapters.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: Özet (Summary) */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          
          {/* Metadata & Summary Card */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Status & Publication Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                {story.status === 'completed' ? 'Tamamlanmış Hikaye' : 'Devam Eden Hikaye'}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Yayınlanma: {story.createdAt}
              </span>
            </div>

            {/* Category Line */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kategori</span>
              <button
                onClick={() => {
                  setSelectedCategoryFilter(story.category);
                  setActiveView('explore');
                }}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {story.category}
              </button>
            </div>

            {/* Tags Section */}
            {story.tags && story.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Etiketler</span>
                <div className="flex flex-wrap gap-1.5">
                  {story.tags.map((tag) => {
                    const clean = tag.trim().replace(/^#/, '');
                    return (
                      <button
                        key={clean}
                        onClick={() => {
                          setSelectedTagFilter(clean);
                          setActiveView('explore');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-950 hover:text-purple-600 transition-colors cursor-pointer"
                      >
                        #{clean}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary Text Box */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Hikaye Özeti
              </span>

              <div className="relative">
                <p className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line ${
                  !isSummaryExpanded ? 'line-clamp-4' : ''
                }`}>
                  {story.summary || 'Bu hikaye için henüz özet girilmedi.'}
                </p>

                {story.summary && story.summary.length > 180 && (
                  <button
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isSummaryExpanded ? 'Daha az göster' : 'Daha çok oku'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSummaryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Category / Tag Rankings Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  #{categoryRankInfo.rank} {story.category}{getTurkishLocative(story.category)} sıralaması
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategoryFilter(story.category);
                  setActiveView('explore');
                }}
                className="text-amber-700 dark:text-amber-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Tüm Liste</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Music Link Widget */}
            {story.musicUrl && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-purple-900/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400 block">Hikaye Müzik Listesi</span>
                    <span className="text-[11px] text-slate-300">Yazarın önerdiği arka plan müziği.</span>
                  </div>
                </div>
                <a
                  href={story.musicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shrink-0 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Dinle
                </a>
              </div>
            )}

          </section>

          {/* AUTHOR CONTROLS PANEL (If story belongs to current logged in author) */}
          {isAuthor && (
            <section className="p-5 sm:p-6 rounded-3xl bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-2 uppercase tracking-wider">
                  <PenTool className="w-4 h-4 text-purple-600" /> Yazar Yönetim Alanı
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                  Senin Eserin
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Edit Story Details Button */}
                <button
                  onClick={() => openStoryEditor(story.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <PenTool className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                  <span>Hikayeyi Düzenle</span>
                </button>

                {/* Add New Chapter Button */}
                <button
                  onClick={() => openStoryEditor(story.id)}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Bölüm Ekle</span>
                </button>

                {/* Delete Story Button */}
                <button
                  onClick={() => {
                    if (window.confirm(`"${story.title}" adlı hikayenizi tamamen silmek istediğinizden emin misiniz?`)) {
                      deleteStory(story.id);
                      setActiveView('explore');
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 group-hover:text-white transition-colors" />
                  <span>Hikayeyi Sil</span>
                </button>
              </div>
            </section>
          )}

        </div>
      )}

      {/* TAB CONTENT: Bölümler (Chapters) */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" /> Eser Bölümleri ({story.chapters.length})
            </h3>

            {isAuthor && (
              <button
                onClick={() => openStoryEditor(story.id)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Bölüm Ekle
              </button>
            )}
          </div>

          <div className="space-y-3">
            {story.chapters.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Bu hikayeye henüz bölüm eklenmedi.</p>
                {isAuthor && (
                  <button
                    onClick={() => openStoryEditor(story.id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    İlk Bölümü Ekle
                  </button>
                )}
              </div>
            ) : (
              story.chapters.map((chapter, index) => {
                const chapLikes = chapter.likes || 0;
                const hasLikedChap = currentUser ? (chapter.likedBy || []).includes(currentUser.id) : false;
                const isLastReadChapter = userReadingProgress !== null && userReadingProgress.lastChapterIndex === index;

                return (
                  <div
                    key={chapter.id || `chap_${index}`}
                    className={`p-4 rounded-2xl border shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isLastReadChapter
                        ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 ring-1 ring-purple-400/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900/60'
                    }`}
                  >
                    {/* Chapter Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isLastReadChapter
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      }`}>
                        {chapter.order || index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => openStoryReader(story.id, index)}
                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer truncate transition-colors"
                          >
                            {chapter.title || `${index + 1}. Bölüm`}
                          </h4>
                          {isLastReadChapter && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">
                              Kaldığın Bölüm
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-purple-500" /> {chapter.readCount || 0} okuma
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {chapter.createdAt}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Chapter Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      
                      {/* Like Chapter */}
                      <button
                        onClick={() => toggleLikeChapter(story.id, index)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                          hasLikedChap
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                        }`}
                        title="Bu Bölümü Beğen"
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLikedChap ? 'fill-current text-rose-500' : ''}`} />
                        <span>{chapLikes}</span>
                      </button>

                      {/* Read Button */}
                      <button
                        onClick={() => openStoryReader(story.id, index)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Oku
                      </button>

                      {/* Author Chapter Delete Button */}
                      {isAuthor && (
                        <button
                          onClick={() => {
                            if (window.confirm(`"${chapter.title || `Bölüm ${index + 1}`}" bölümünü silmek istediğinize emin misiniz?`)) {
                              deleteChapter(story.id, index);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                          title="Bölümü Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Story Comments Section */}
      <section className="pt-2">
        <StoryCommentsSection storyId={story.id} chapterIndex={0} />
      </section>

      {/* Modals */}
      <AddToCustomListModal
        story={story}
        isOpen={isCustomListModalOpen}
        onClose={() => setIsCustomListModalOpen(false)}
      />

      <StoryReportModal
        story={story}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};
