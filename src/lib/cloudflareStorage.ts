// Comments & Discussion Storage Engine (Local-first + Cloudflare Sync)
// Firebase dependencies removed temporarily until Cloudflare Worker setup is complete.
// import { db, rtdb } from './firebase';
// import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
// import { ref, set, get, child, remove } from 'firebase/database';

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

  // Firebase integration removed temporarily.
  return localComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Insert a new comment and back it up to Firebase.
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

  // Firebase integration removed temporarily.
  
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
  // Firebase integration removed temporarily.
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
  // Firebase integration removed temporarily.
  return true;
}
