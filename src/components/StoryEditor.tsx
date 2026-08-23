import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Category, Visibility, Chapter } from '../types';
import { AIAssistantModal } from './AIAssistantModal';
import { FormattedContent } from './FormattedContent';
import { uploadImageToHost } from '../lib/imageUpload';
import { 
  PenTool, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Lock, 
  Globe, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock, 
  FileText, 
  Check, 
  Eye,
  Upload,
  Columns,
  X,
  Music,
  Headphones,
  Zap,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Layers,
  Type,
  RefreshCw,
  Edit3,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Genel',
  'Romantik',
  'Bilim Kurgu',
  'Fantastik',
  'Gizem',
  'Gerilim',
  'Korku',
  'Polisiye',
  'Paranormal',
  'Aksiyon',
  'Kişisel Blog',
  'Dram',
  'Şiir',
  'Teknoloji',
  'Hayran Kurgu',
  'Macera',
  'LGBTQ',
  'Psikoloji',
  'Tarihi',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
];

interface VisualBlock {
  id: string;
  type: 'text' | 'image';
  text?: string;
  url?: string;
  alt?: string;
}

export const StoryEditor: React.FC = () => {
  const { editingStoryId, stories, saveStory, deleteStory, setActiveView, openStoryReader, openStoryDetail } = useApp();

  const existingStory = stories.find((s) => s.id === editingStoryId);

  // Screen View Mode: 'story_details' (Overview & Chapter List) OR 'writing' (Dedicated Wattpad Writing Screen)
  const [screenMode, setScreenMode] = useState<'story_details' | 'writing'>('story_details');

  // Story Metadata State
  const [title, setTitle] = useState(existingStory?.title || '');
  const [summary, setSummary] = useState(existingStory?.summary || '');
  const [category, setCategory] = useState<Category>(existingStory?.category || 'Romantik');
  const [tagsInput, setTagsInput] = useState(existingStory?.tags.join(', ') || '');
  const [coverUrl, setCoverUrl] = useState(existingStory?.coverUrl || PRESET_COVERS[0]);
  const [visibility, setVisibility] = useState<Visibility>(existingStory?.visibility || 'public');
  const [status, setStatus] = useState<'ongoing' | 'completed'>(existingStory?.status || 'ongoing');
  const [isNsfw, setIsNsfw] = useState<boolean>(existingStory?.isNsfw || false);
  const [isShortStory, setIsShortStory] = useState<boolean>(existingStory?.isShortStory || false);
  const [musicUrl, setMusicUrl] = useState<string>(existingStory?.musicUrl || '');

  // Chapters State
  const [chapters, setChapters] = useState<Chapter[]>(
    existingStory?.chapters && existingStory.chapters.length > 0
      ? existingStory.chapters
      : [
          {
            id: 'chap_new_1',
            title: '1. Bölüm: Başlangıç',
            content: '',
            order: 1,
            readCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
          },
        ]
  );
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  
  // Editor mode inside writing screen: 'visual' (Wattpad block mode), 'edit' (Markdown text), 'preview' (Live Reader preview)
  const [editorViewMode, setEditorViewMode] = useState<'visual' | 'edit' | 'preview'>('visual');

  // Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingChapterImage, setIsUploadingChapterImage] = useState(false);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeInsertIndexRef = useRef<number>(0);

  const activeChapter = chapters[activeChapterIndex] || chapters[0] || {
    id: 'chap_def',
    title: '1. Bölüm',
    content: '',
    order: 1,
    readCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Sync with existing story if changed externally
  useEffect(() => {
    if (existingStory) {
      setTitle(existingStory.title);
      setSummary(existingStory.summary);
      setCategory(existingStory.category);
      setTagsInput(existingStory.tags.join(', '));
      setCoverUrl(existingStory.coverUrl || PRESET_COVERS[0]);
      setVisibility(existingStory.visibility);
      setStatus(existingStory.status);
      setIsNsfw(existingStory.isNsfw || false);
      setIsShortStory(existingStory.isShortStory || false);
      setMusicUrl(existingStory.musicUrl || '');
      if (existingStory.chapters && existingStory.chapters.length > 0) {
        setChapters(existingStory.chapters);
      }
    }
  }, [existingStory]);

  // Update Chapter Content
  const handleChapterContentChange = (content: string) => {
    setChapters((prev) =>
      prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, content } : c))
    );
  };

  const handleChapterTitleChange = (chapterTitle: string) => {
    setChapters((prev) =>
      prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, title: chapterTitle } : c))
    );
  };

  // Block Parsing & Serializing (Guarantees image order is preserved in-line!)
  const parseBlocks = (content: string): VisualBlock[] => {
    if (!content || !content.trim()) {
      return [{ id: 'block_0', type: 'text', text: '' }];
    }

    const rawParts = content.split(/\n\n+/);
    const blocks: VisualBlock[] = [];

    rawParts.forEach((part, idx) => {
      const trimmed = part.trim();
      const mdImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const isStandaloneImg =
        /^https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$/i.test(trimmed) ||
        /^data:image\/[a-zA-Z]+;base64,/i.test(trimmed);

      if (mdImgMatch) {
        blocks.push({
          id: `img_${idx}_${mdImgMatch[2].slice(-10)}`,
          type: 'image',
          alt: mdImgMatch[1] || 'Görsel',
          url: mdImgMatch[2],
        });
      } else if (isStandaloneImg) {
        blocks.push({
          id: `img_${idx}_${trimmed.slice(-10)}`,
          type: 'image',
          alt: 'Görsel',
          url: trimmed,
        });
      } else {
        blocks.push({
          id: `text_${idx}`,
          type: 'text',
          text: part,
        });
      }
    });

    return blocks.length > 0 ? blocks : [{ id: 'block_0', type: 'text', text: '' }];
  };

  const serializeBlocks = (blocks: VisualBlock[]): string => {
    return blocks
      .map((b) => {
        if (b.type === 'image') {
          return `![${b.alt || 'Görsel'}](${b.url})`;
        }
        return b.text || '';
      })
      .filter((t) => t !== undefined)
      .join('\n\n');
  };

  const handleUpdateBlockText = (blockIndex: number, newText: string) => {
    const blocks = parseBlocks(activeChapter.content);
    if (blocks[blockIndex]) {
      blocks[blockIndex].text = newText;
      handleChapterContentChange(serializeBlocks(blocks));
    }
  };

  const handleUpdateBlockAlt = (blockIndex: number, newAlt: string) => {
    const blocks = parseBlocks(activeChapter.content);
    if (blocks[blockIndex] && blocks[blockIndex].type === 'image') {
      blocks[blockIndex].alt = newAlt;
      handleChapterContentChange(serializeBlocks(blocks));
    }
  };

  const handleDeleteBlock = (blockIndex: number) => {
    const blocks = parseBlocks(activeChapter.content);
    blocks.splice(blockIndex, 1);
    if (blocks.length === 0) {
      blocks.push({ id: 'block_0', type: 'text', text: '' });
    }
    handleChapterContentChange(serializeBlocks(blocks));
  };

  const handleMoveBlock = (blockIndex: number, direction: 'up' | 'down') => {
    const blocks = parseBlocks(activeChapter.content);
    const targetIdx = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const temp = blocks[blockIndex];
    blocks[blockIndex] = blocks[targetIdx];
    blocks[targetIdx] = temp;
    handleChapterContentChange(serializeBlocks(blocks));
  };

  const handleAddParagraphAt = (insertAfterIndex: number) => {
    const blocks = parseBlocks(activeChapter.content);
    blocks.splice(insertAfterIndex + 1, 0, {
      id: `text_${Date.now()}`,
      type: 'text',
      text: '',
    });
    handleChapterContentChange(serializeBlocks(blocks));
  };

  // INLINE IMAGE INSERTION AT EXACT POSITION
  const insertImageAtPosition = (imageUrl: string, insertAfterIndex?: number) => {
    const blocks = parseBlocks(activeChapter.content);
    const targetIndex = insertAfterIndex !== undefined ? insertAfterIndex : focusedBlockIndex;
    
    const newImageBlock: VisualBlock = {
      id: `img_${Date.now()}`,
      type: 'image',
      url: imageUrl,
      alt: 'Bölüm Görseli',
    };

    // If inserted in visual mode
    if (blocks.length > 0 && targetIndex >= 0 && targetIndex < blocks.length) {
      blocks.splice(targetIndex + 1, 0, newImageBlock);
      // Also add an empty text block after image so the user can continue typing immediately!
      blocks.splice(targetIndex + 2, 0, {
        id: `text_${Date.now() + 1}`,
        type: 'text',
        text: '',
      });
      handleChapterContentChange(serializeBlocks(blocks));
    } else {
      // Append if empty
      blocks.push(newImageBlock);
      blocks.push({ id: `text_${Date.now() + 1}`, type: 'text', text: '' });
      handleChapterContentChange(serializeBlocks(blocks));
    }
  };

  // Formatting Syntax Helper (Supports both Textarea and Visual Mode)
  const applyFormatting = (syntaxStart: string, syntaxEnd: string = '') => {
    if (editorViewMode === 'edit') {
      const textarea = document.getElementById('chapter-content-textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = activeChapter.content;
        const selectedText = text.substring(start, end);
        const replacement = `${syntaxStart}${selectedText || 'metin'}${syntaxEnd}`;
        const newContent = text.substring(0, start) + replacement + text.substring(end);
        handleChapterContentChange(newContent);
        return;
      }
    }

    // In Visual Mode: Apply to the active paragraph block
    const blocks = parseBlocks(activeChapter.content);
    const targetIdx = focusedBlockIndex >= 0 && focusedBlockIndex < blocks.length ? focusedBlockIndex : 0;
    const block = blocks[targetIdx];
    
    if (block && block.type === 'text') {
      const currentText = block.text || '';
      block.text = currentText ? `${currentText} ${syntaxStart}vurgulanmış metin${syntaxEnd}` : `${syntaxStart}vurgulanmış metin${syntaxEnd}`;
      handleChapterContentChange(serializeBlocks(blocks));
    }
  };

  // Device Chapter Image Upload (Inserts at the specific line/block where user triggered it!)
  const triggerInlineImageUpload = (insertAfterIndex?: number) => {
    activeInsertIndexRef.current = insertAfterIndex !== undefined ? insertAfterIndex : focusedBlockIndex;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChapterImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Lütfen 20MB\'dan küçük bir görsel seçin.');
      return;
    }

    setIsUploadingChapterImage(true);
    try {
      const hostedUrl = await uploadImageToHost(file, file.name);
      if (hostedUrl) {
        insertImageAtPosition(hostedUrl, activeInsertIndexRef.current);
      }
    } catch (err) {
      console.error('Chapter image upload error:', err);
    } finally {
      setIsUploadingChapterImage(false);
      e.target.value = '';
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Lütfen 20MB\'dan küçük bir görsel seçin.');
        return;
      }
      setIsUploadingCover(true);
      try {
        const hostedUrl = await uploadImageToHost(file, file.name);
        if (hostedUrl) {
          setCoverUrl(hostedUrl);
        }
      } catch (err) {
        console.error('Cover upload error:', err);
      } finally {
        setIsUploadingCover(false);
      }
      e.target.value = '';
    }
  };

  // Chapter Management Handlers
  const handleAddNewChapter = () => {
    const nextOrder = chapters.length + 1;
    const newChap: Chapter = {
      id: 'chap_' + Date.now(),
      title: `${nextOrder}. Bölüm: İsimsiz`,
      content: '',
      order: nextOrder,
      readCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...chapters, newChap];
    setChapters(updated);
    setActiveChapterIndex(updated.length - 1);
    // Switch straight to the clean Wattpad writing screen
    setScreenMode('writing');
    setEditorViewMode('visual');
  };

  const handleEditChapter = (index: number) => {
    setActiveChapterIndex(index);
    setScreenMode('writing');
    setEditorViewMode('visual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteChapter = (index: number) => {
    if (chapters.length <= 1) {
      alert('Hikayenizde en az 1 bölüm bulunmalıdır.');
      return;
    }
    if (window.confirm(`"${chapters[index]?.title || 'Bu bölümü'}" silmek istediğinize emin misiniz?`)) {
      const updated = chapters.filter((_, idx) => idx !== index);
      setChapters(updated);
      setActiveChapterIndex((prev) => Math.min(prev, updated.length - 1));
    }
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;
    const updated = [...chapters];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapters(updated);
    setActiveChapterIndex(targetIdx);
  };

  // Total Story Stats
  const totalWords = chapters.reduce((acc, chap) => {
    const words = chap.content.trim() ? chap.content.trim().split(/\s+/).length : 0;
    return acc + words;
  }, 0);
  const totalReadingTime = Math.ceil(totalWords / 200) || 1;

  // Active Chapter Stats
  const currentChapterWords = activeChapter.content.trim() ? activeChapter.content.trim().split(/\s+/).length : 0;
  const currentChapterChars = activeChapter.content.length;
  const currentChapterReadTime = Math.ceil(currentChapterWords / 200) || 1;

  // Save Story (Draft or Public)
  const handleSaveStory = (publishMode: Visibility) => {
    if (!title.trim()) {
      alert('Lütfen hikaye başlığı girin.');
      setIsDetailsModalOpen(true);
      return;
    }

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const savedId = saveStory({
      id: existingStory?.id,
      title,
      summary,
      category,
      tags: tagsArr.length > 0 ? tagsArr : ['Genel'],
      coverUrl,
      visibility: publishMode,
      status,
      isNsfw,
      isShortStory,
      musicUrl,
      chapters,
    });

    setToastMessage(publishMode === 'public' ? 'Hikaye başarıyla yayınlandı!' : 'Taslak kaydedildi!');
    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
    }, 2500);

    return savedId;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-28 md:pb-16">
      
      {/* Hidden File Input for Inline Chapter Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleChapterImageFileSelect}
        className="hidden"
      />

      {/* Success Notification Toast */}
      {savedSuccessToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2.5 shadow-2xl animate-bounce">
          <Check className="w-5 h-5" />
          <span>{toastMessage || 'İşlem başarıyla tamamlandı!'}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STORY DETAILS & CHAPTER HUB VIEW (Wattpad Hikaye Tanıtım ve Yönetim) */}
      {/* ========================================================================= */}
      {screenMode === 'story_details' && (
        <div className="space-y-8">

          {/* Header Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('library')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Kütüphaneye Dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PenTool className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  {existingStory ? 'Hikaye Yönetimi & Tanıtımı' : 'Yeni Hikaye Oluştur'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hikaye özetinizi düzenleyin, yeni bölümler ekleyin ve yayınlayın.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {existingStory && (
                <button
                  onClick={() => openStoryDetail(existingStory.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  <Eye className="w-4 h-4 text-purple-500" />
                  Önizle
                </button>
              )}
              <button
                onClick={() => handleSaveStory('private')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <Lock className="w-4 h-4 text-amber-500" />
                Taslak Kaydet
              </button>
              <button
                onClick={() => handleSaveStory('public')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Globe className="w-4 h-4" />
                Yayınla
              </button>
            </div>
          </div>

          {/* Story Overview & Blurb Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              {/* Cover Image Thumbnail */}
              <div className="relative group flex-shrink-0 w-36 h-52 sm:w-44 sm:h-64 rounded-2xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={coverUrl || PRESET_COVERS[0]}
                  alt={title || 'Kapak Görseli'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_COVERS[0];
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                >
                  <Edit3 className="w-5 h-5" />
                  Kapağı Değiştir
                </button>
              </div>

              {/* Details & Blurb */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold">
                      {category}
                    </span>
                    {status === 'completed' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Devam Ediyor
                      </span>
                    )}
                    {visibility === 'private' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Gizli Taslak
                      </span>
                    )}
                    {isNsfw && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded font-black">
                        +18 NSFW
                      </span>
                    )}
                    {isShortStory && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded font-black flex items-center gap-0.5">
                        <Zap className="w-3 h-3" /> Kısa Hikaye
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    {title || <span className="text-slate-400 italic">İsimsiz Hikaye</span>}
                  </h2>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Arka Kapak & Tanıtım Özeti:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {summary ? summary : <span className="text-slate-400 italic">Henüz bir tanıtım özeti eklenmedi. "Hikaye Bilgilerini Düzenle" butonuna basarak ekleyebilirsiniz.</span>}
                  </p>
                </div>

                {/* Tags preview */}
                {tagsInput && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tagsInput.split(',').map((tag, i) => {
                      const t = tag.trim();
                      if (!t) return null;
                      return (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                          #{t}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Edit Details Action Button */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Hikaye Bilgilerini & Özeti Düzenle
                  </button>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pl-2">
                    <span><strong>{chapters.length}</strong> Bölüm</span>
                    <span><strong>{totalWords}</strong> Kelime</span>
                    <span>~{totalReadingTime} dk Okuma</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Chapters List & Add Chapter Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Bölümler ({chapters.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bölüm ekleyin veya mevcut bölümleri düzenlemek için "Bölümü Yaz" butonuna basın.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNewChapter}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Yeni Bölüm Ekle
              </button>
            </div>

            {/* Chapters Table / Cards */}
            <div className="space-y-3">
              {chapters.map((chap, idx) => {
                const words = chap.content.trim() ? chap.content.trim().split(/\s+/).length : 0;
                const readingTime = Math.ceil(words / 200) || 1;

                return (
                  <div
                    key={chap.id || idx}
                    className="group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {chap.title || `Bölüm ${idx + 1}`}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span>{words} kelime</span>
                          <span>•</span>
                          <span>~{readingTime} dk okuma</span>
                          {chap.musicUrl && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-500 font-medium flex items-center gap-1">
                                <Headphones className="w-3 h-3" /> Müzikli
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chapter Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(idx, 'up')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {idx < chapters.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(idx, 'down')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditChapter(idx)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5 transition-colors"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Bölümü Yaz / Düzenle
                      </button>

                      {chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(idx)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Bölümü Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}


      {/* ========================================================================= */}
      {/* 2. DEDICATED WATTPAD WRITING SCREEN (Bölüm Yazma Ekranı) */}
      {/* ========================================================================= */}
      {screenMode === 'writing' && (
        <div className="space-y-6">

          {/* Top Writing Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setScreenMode('story_details');
                  handleSaveStory('private');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-all"
                title="Bölümler Listesine Dön"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Bölümlere Dön</span>
              </button>
              <div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  {title || 'Hikaye'} • {activeChapter.title || `${activeChapterIndex + 1}. Bölüm`}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentChapterWords} kelime • ~{currentChapterReadTime} dk okuma süresi
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                AI Asistan
              </button>

              <button
                type="button"
                onClick={() => handleSaveStory('private')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-all"
              >
                <Save className="w-4 h-4 text-slate-500" />
                Taslak Kaydet
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveStory('public');
                  setScreenMode('story_details');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
              >
                <Check className="w-4 h-4" />
                Bölümü Kaydet & Bitir
              </button>
            </div>
          </div>

          {/* Writing Canvas Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            
            {/* Chapter Title Input */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <input
                type="text"
                value={activeChapter.title}
                onChange={(e) => handleChapterTitleChange(e.target.value)}
                placeholder="Bölüm Başlığını Buraya Girin (Örn: 1. Bölüm: Tozlu Sokaklar)..."
                className="w-full text-xl sm:text-2xl font-serif font-extrabold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Chapter Music Link Input */}
            <div className="px-5 py-2.5 bg-emerald-50/30 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex-shrink-0">
                Bölüm Şarkısı:
              </span>
              <input
                type="url"
                value={activeChapter.musicUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setChapters((prev) =>
                    prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, musicUrl: val } : c))
                  );
                }}
                placeholder="Bu bölüm için Spotify veya YouTube arka plan müziği linki..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Sticky Wattpad Toolbar */}
            <div className="sticky top-0 z-20 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1 text-slate-700 dark:text-slate-300">
              
              {/* Text Formatting */}
              <button 
                type="button"
                onClick={() => applyFormatting('**', '**')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold" 
                title="Kalın Yazı (**metin**)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button 
                type="button"
                onClick={() => applyFormatting('*', '*')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 italic" 
                title="İtalik Yazı (*metin*)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button 
                type="button"
                onClick={() => applyFormatting('<u>', '</u>')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
                title="Altı Çizili (<u>metin</u>)"
              >
                <Underline className="w-4 h-4" />
              </button>

              <button 
                type="button"
                onClick={() => applyFormatting('~~', '~~')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
                title="Üstü Çizili (~~metin~~)"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button 
                type="button"
                onClick={() => applyFormatting('# ')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
                title="Başlık 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>

              <button 
                type="button"
                onClick={() => applyFormatting('## ')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
                title="Başlık 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <button 
                type="button"
                onClick={() => applyFormatting('> ')} 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" 
                title="Alıntı Cümlesi"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Inline Image Upload (Inserts exactly at current focused line!) */}
              <button 
                type="button"
                onClick={() => triggerInlineImageUpload(focusedBlockIndex)}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                title="Şu anki satıra / araya görsel yükle"
              >
                {isUploadingChapterImage ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
                <span>{isUploadingChapterImage ? 'Görsel Yükleniyor...' : 'Araya Görsel Ekle'}</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  const url = prompt('Eklemek istediğiniz görselin doğrudan URL adresini girin:');
                  if (url) {
                    insertImageAtPosition(url, focusedBlockIndex);
                  }
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400" 
                title="URL ile Görsel Ekle"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* View Switchers */}
              <div className="ml-auto flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorViewMode('visual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    editorViewMode === 'visual'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Wattpad Tarzı Görsel Editör"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Görsel Editör</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorViewMode('edit')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    editorViewMode === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Düz Metin & Markdown"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Düz Metin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorViewMode('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    editorViewMode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Canlı Okuyucu Önizlemesi"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Önizleme</span>
                </button>
              </div>

            </div>

            {/* Editor Workspace: 1. Visual Block Editor (Wattpad Style) */}
            {editorViewMode === 'visual' && (
              <div className="p-4 sm:p-8 flex-1 min-h-[500px] space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
                {parseBlocks(activeChapter.content).map((block, idx, arr) => (
                  <div 
                    key={block.id} 
                    className="group relative"
                    onClick={() => setFocusedBlockIndex(idx)}
                  >
                    {block.type === 'text' ? (
                      <div className={`relative rounded-2xl bg-white dark:bg-slate-900 border p-4 transition-all shadow-sm ${
                        focusedBlockIndex === idx 
                          ? 'border-purple-400 ring-2 ring-purple-400/20' 
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}>
                        
                        {/* Block Header Toolbar */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Type className="w-3 h-3 text-purple-500" /> Paragraf #{idx + 1}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveBlock(idx, 'up')}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Yukarı Taşı"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < arr.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveBlock(idx, 'down')}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Aşağı Taşı"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {arr.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBlock(idx)}
                                className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Paragrafı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                          rows={Math.max(3, Math.min(16, (block.text?.split('\n').length || 1) + 2))}
                          value={block.text || ''}
                          onFocus={() => setFocusedBlockIndex(idx)}
                          onChange={(e) => handleUpdateBlockText(idx, e.target.value)}
                          placeholder="Hikayenizin bu paragrafını buraya yazın..."
                          className="w-full bg-transparent text-slate-800 dark:text-slate-100 font-serif text-base leading-relaxed focus:outline-none resize-y placeholder-slate-400"
                        />
                      </div>
                    ) : (
                      // Inline Image Block (Stays precisely pinned at this line!)
                      <div className="relative bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900/60 p-4 space-y-3 shadow-md rounded-2xl">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-purple-600" /> Eklenen Canlı Görsel (Satır #{idx + 1})
                          </span>

                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveBlock(idx, 'up')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Yukarı Taşı"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < arr.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveBlock(idx, 'down')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Aşağı Taşı"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(idx)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 flex items-center gap-1"
                              title="Görseli Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Sil
                            </button>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div className="w-full max-w-2xl mx-auto overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col items-center rounded-xl">
                          <img
                            src={block.url}
                            alt={block.alt || 'Bölüm Görseli'}
                            className="w-full max-h-[460px] object-contain block rounded-none border-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PRESET_COVERS[0];
                            }}
                          />
                        </div>

                        {/* Caption Editor */}
                        <div className="flex items-center gap-2 max-w-2xl mx-auto pt-1">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Alt Açıklama:</span>
                          <input
                            type="text"
                            value={block.alt || ''}
                            onChange={(e) => handleUpdateBlockAlt(idx, e.target.value)}
                            placeholder="Görsel alt yazısı veya sahne notu (isteğe bağlı)..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick Inline Insert Splitter (Add Paragraph or Image right here!) */}
                    <div className="flex items-center justify-center gap-2 py-1.5 opacity-30 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleAddParagraphAt(idx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Araya Paragraf Ekle
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerInlineImageUpload(idx)}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Upload className="w-3 h-3 text-purple-600" /> Araya Görsel Ekle
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bottom Add Block Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleAddParagraphAt(parseBlocks(activeChapter.content).length - 1)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-purple-600" /> Yeni Paragraf Ekle
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerInlineImageUpload(parseBlocks(activeChapter.content).length - 1)}
                    className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4 text-purple-600" /> Cihazdan Görsel Ekle
                  </button>
                </div>

              </div>
            )}

            {/* Editor Workspace: 2. Markdown Plain Text Editor */}
            {editorViewMode === 'edit' && (
              <div className="p-6 flex-1 min-h-[500px]">
                <textarea
                  id="chapter-content-textarea"
                  rows={20}
                  value={activeChapter.content}
                  onChange={(e) => handleChapterContentChange(e.target.value)}
                  placeholder="Hikayenizi markdown formatında kaleme alın..."
                  className="w-full h-full p-2 bg-transparent text-slate-800 dark:text-slate-100 font-serif text-base leading-relaxed focus:outline-none resize-none min-h-[450px]"
                />
              </div>
            )}

            {/* Editor Workspace: 3. Live Reader Preview */}
            {editorViewMode === 'preview' && (
              <div className="p-8 flex-1 min-h-[500px] bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {title || 'Hikaye'}
                    </span>
                    <h3 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                      {activeChapter.title || 'İsimsiz Bölüm'}
                    </h3>
                  </div>

                  <FormattedContent
                    content={activeChapter.content || 'Bu bölüm için henüz içerik yazılmadı.'}
                    paragraphClassName="text-base font-serif text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span><strong>{currentChapterWords}</strong> kelime</span>
                <span><strong>{currentChapterChars}</strong> karakter</span>
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Ort. {currentChapterReadTime} dk okuma süresi
                </span>
              </div>
              <span className="text-[11px] italic">Otomatik taslak koruması devrede</span>
            </div>

          </div>

        </div>
      )}


      {/* ========================================================================= */}
      {/* 3. MODAL: STORY METADATA / SUMMARY & DETAILS EDITOR */}
      {/* ========================================================================= */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600" />
                  Hikaye Tanıtımı & Künyesi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kapak, başlık, arka kapak özeti ve tür bilgilerini güncelleyin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hikaye Başlığı *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Gece Yarısı Kütüphanesi..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Summary / Blurb */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Arka Kapak / Tanıtım Özeti *
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Okuyucuların ilgisini çekecek arka kapak tanıtım özetinizi yazın..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hikaye Durumu</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ongoing">Devam Ediyor (Bölümler Eklenecek)</option>
                    <option value="completed">Tamamlandı (Final)</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Etiketler (Virgülle Ayırın)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Aşk, Gizem, Şehir, Macera"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Cover Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Kapak Görseli</label>
                  
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-100 font-bold text-[11px] flex items-center gap-1 transition-all">
                    {isUploadingCover ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingCover ? 'Yükleniyor...' : 'Cihazdan Kapak Yükle'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingCover}
                      onChange={handleCoverFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                  {PRESET_COVERS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt="Preset"
                      onClick={() => setCoverUrl(preset)}
                      className={`w-14 h-20 object-cover rounded-xl cursor-pointer transition-all flex-shrink-0 ${
                        coverUrl === preset ? 'ring-4 ring-purple-600 scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Veya Görsel URL adresi yapıştırın..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Visibility */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 text-xs font-bold transition-all ${
                    visibility === 'public'
                      ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-emerald-500" /> Herkese Açık</span>
                  <span className="text-[10px] font-normal text-slate-400">Tüm okuyucular görebilir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 text-xs font-bold transition-all ${
                    visibility === 'private'
                      ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-amber-500" /> Gizli Taslak</span>
                  <span className="text-[10px] font-normal text-slate-400">Yalnızca siz görürsünüz</span>
                </button>
              </div>

              {/* Short story & NSFW toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShortStory}
                    onChange={(e) => setIsShortStory(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Kısa Hikaye
                  </span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNsfw}
                    onChange={(e) => setIsNsfw(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <span className="px-1 py-0.2 bg-rose-600 text-white text-[9px] rounded font-black">+18</span> NSFW
                  </span>
                </label>
              </div>

              {/* Background Music Link */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-emerald-500" />
                  <span>Hikaye Şarkısı (Spotify veya YouTube)</span>
                </label>
                <input
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/... veya YouTube linki"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleSaveStory(visibility);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Bilgileri Kaydet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentContent={activeChapter.content}
        onInsertText={(text) => {
          const current = activeChapter.content.trim();
          const newContent = current ? `${current}\n\n${text}` : text;
          handleChapterContentChange(newContent);
        }}
      />

    </div>
  );
};
