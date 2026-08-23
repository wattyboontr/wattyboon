import { db, rtdb } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, set, get, child, remove } from 'firebase/database';

export interface StoryCommentRow {
  id: string;
  story_id: string;
  chapter_index: number;
  paragraph_index: number | null;
  selected_text: string | null;
  parent_id?: string | null;
  reply_to_user_name?: string | null;
  reply_to_comment_id?: string | null;
  content: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string;
  user_role?: string;
  likes_count: number;
  liked_by: string[];
  created_at: string;
  updated_at?: string;
}

const STORAGE_PREFIX = 'wattyboon_fb_comments_';

/**
 * Fetch comments for a story chapter from Firebase Firestore / Realtime DB / LocalStorage
 */
export async function fetchComments(
  storyId: string,
  chapterIndex: number
): Promise<StoryCommentRow[]> {
  const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
  
  // 1. Try local storage cache first for instant UI response
  let localComments: StoryCommentRow[] = [];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      localComments = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Comments local cache read notice:', e);
  }

  // 2. Fetch from Firebase Firestore
  try {
    const q = query(
      collection(db, 'story_comments'),
      where('story_id', '==', storyId),
      where('chapter_index', '==', chapterIndex)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const fbList: StoryCommentRow[] = [];
      snap.forEach((d) => fbList.push(d.data() as StoryCommentRow));
      
      fbList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(fbList));
      } catch {}

      return fbList;
    }
  } catch (err) {
    console.warn('[Firebase Comments] Firestore fetch notice:', err);
  }

  // 3. Fallback to Firebase Realtime Database
  try {
    const safeStoryKey = storyId.replace(/[.#$[\]]/g, '_');
    const rtdbSnap = await get(child(ref(rtdb), `story_comments/${safeStoryKey}/${chapterIndex}`));
    if (rtdbSnap.exists()) {
      const data = rtdbSnap.val();
      const fbList = Object.values(data) as StoryCommentRow[];
      fbList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(fbList));
      } catch {}

      return fbList;
    }
  } catch (err) {
    console.warn('[Firebase Comments] RTDB fetch notice:', err);
  }

  return localComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Insert a new comment and back it up to Firebase Firestore & RTDB.
 */
export async function insertComment(payload: {
  storyId: string;
  storyTitle?: string;
  chapterIndex: number;
  chapterTitle?: string;
  paragraphIndex?: number | null;
  selectedText?: string | null;
  parentId?: string | null;
  replyToUserName?: string | null;
  replyToCommentId?: string | null;
  content: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: string;
}): Promise<StoryCommentRow> {
  const commentId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();
  const newRow: StoryCommentRow = {
    id: commentId,
    story_id: payload.storyId,
    chapter_index: payload.chapterIndex,
    paragraph_index: payload.paragraphIndex ?? null,
    selected_text: payload.selectedText ?? null,
    parent_id: payload.parentId ?? null,
    reply_to_user_name: payload.replyToUserName ?? null,
    reply_to_comment_id: payload.replyToCommentId ?? null,
    content: payload.content,
    user_id: payload.userId,
    user_name: payload.userName,
    user_username: payload.userUsername,
    user_avatar: payload.userAvatar,
    user_role: payload.userRole || 'user',
    likes_count: 0,
    liked_by: [],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const cacheKey = `${STORAGE_PREFIX}${payload.storyId}_${payload.chapterIndex}`;

  // 1. Update local cache immediately
  try {
    const cached = localStorage.getItem(cacheKey);
    const list: StoryCommentRow[] = cached ? JSON.parse(cached) : [];
    list.unshift(newRow);
    localStorage.setItem(cacheKey, JSON.stringify(list));
  } catch (e) {
    console.warn('Cache update notice:', e);
  }

  // 2. Persist to Firebase Firestore
  try {
    await setDoc(doc(db, 'story_comments', newRow.id), newRow);
  } catch (err) {
    console.warn('[Firebase Comments] Firestore save notice:', err);
  }

  // 3. Persist to Firebase Realtime Database
  try {
    const safeStoryKey = payload.storyId.replace(/[.#$[\]]/g, '_');
    await set(ref(rtdb, `story_comments/${safeStoryKey}/${payload.chapterIndex}/${newRow.id}`), newRow);
  } catch (err) {
    console.warn('[Firebase Comments] RTDB save notice:', err);
  }

  return newRow;
}

/**
 * Toggle like on a comment.
 */
export async function toggleLikeComment(
  commentId: string,
  userId: string,
  currentLikedBy: string[],
  storyId?: string,
  chapterIndex?: number
): Promise<boolean> {
  const isLiked = currentLikedBy.includes(userId);
  const newLikedBy = isLiked
    ? currentLikedBy.filter((id) => id !== userId)
    : [...currentLikedBy, userId];
  const newLikesCount = newLikedBy.length;

  if (storyId && chapterIndex !== undefined) {
    const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const list: StoryCommentRow[] = JSON.parse(cached);
        const updated = list.map((c) =>
          c.id === commentId ? { ...c, liked_by: newLikedBy, likes_count: newLikesCount } : c
        );
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      }
    } catch {}
  }

  try {
    await setDoc(doc(db, 'story_comments', commentId), { liked_by: newLikedBy, likes_count: newLikesCount }, { merge: true });
  } catch (e) {}

  if (storyId && chapterIndex !== undefined) {
    try {
      const safeStoryKey = storyId.replace(/[.#$[\]]/g, '_');
      await set(ref(rtdb, `story_comments/${safeStoryKey}/${chapterIndex}/${commentId}/liked_by`), newLikedBy);
      await set(ref(rtdb, `story_comments/${safeStoryKey}/${chapterIndex}/${commentId}/likes_count`), newLikesCount);
    } catch (e) {}
  }

  return true;
}

/**
 * Delete a comment from storage and Firebase.
 */
export async function deleteComment(
  commentId: string,
  storyId?: string,
  chapterIndex?: number
): Promise<boolean> {
  if (storyId && chapterIndex !== undefined) {
    const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const list: StoryCommentRow[] = JSON.parse(cached);
        const updated = list.filter((c) => c.id !== commentId && c.parent_id !== commentId);
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      }
    } catch {}
  }

  try {
    await deleteDoc(doc(db, 'story_comments', commentId));
  } catch (e) {}

  if (storyId && chapterIndex !== undefined) {
    try {
      const safeStoryKey = storyId.replace(/[.#$[\]]/g, '_');
      await remove(ref(rtdb, `story_comments/${safeStoryKey}/${chapterIndex}/${commentId}`));
    } catch (e) {}
  }

  return true;
}
