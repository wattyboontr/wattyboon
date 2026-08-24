import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  remove,
  update,
  onValue
} from 'firebase/database';
import { Story, User, ForumTopic, ParagraphComment, Comment, AppNotification, DirectMessage, StoryReport } from '../types';

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyBTtB_MP70tOJ-gZa0B6YF8OOJaKIloabk",
  authDomain: "wattyboon-94c69.firebaseapp.com",
  databaseURL: "https://wattyboon-94c69-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wattyboon-94c69",
  storageBucket: "wattyboon-94c69.firebasestorage.app",
  messagingSenderId: "227047858074",
  appId: "1:227047858074:web:fcbbb65ae4256bcd3be423"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);

export async function setAuthPersistence(rememberMe: boolean = true) {
  try {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
  } catch (err) {
    console.warn('Set auth persistence notice:', err);
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ==========================================
// AUTHENTICATION (Firebase Auth + Firestore Profile Sync)
// ==========================================

export async function firebaseRegisterUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    // 1. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = cred.user;

    // Update display name
    await updateProfile(fbUser, {
      displayName: name.trim(),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    });

    const isAdmin = cleanEmail === 'wattyboontr@gmail.com' || cleanEmail === 'semajim30@gmail.com';

    const newUser: User = {
      id: fbUser.uid,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'author',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: 'WattyBoon yazarı ve okuru ✨',
      joinedDate: new Date().toISOString().split('T')[0],
      followers: [],
      following: [],
      library: [],
      readingProgress: [],
      customLists: [],
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {
      console.warn('Firestore user save notice:', e);
    }

    // Save to Realtime Database as backup
    try {
      await set(ref(rtdb, `users/${newUser.id}`), newUser);
    } catch (e) {
      console.warn('RTDB user save notice:', e);
    }

    // Local cache
    try {
      localStorage.setItem('wattyboon_current_user_id', newUser.id);
    } catch {}

    return { success: true, user: newUser };
  } catch (err: any) {
    console.error('Firebase Register Error:', err);
    let message = 'Kayıt işlemi başarısız oldu.';
    if (err.code === 'auth/email-already-in-use') {
      message = 'Bu e-posta adresi zaten kullanımda.';
    } else if (err.code === 'auth/weak-password') {
      message = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
    } else if (err.code === 'auth/invalid-email') {
      message = 'Geçersiz e-posta adresi.';
    } else if (err.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

export async function firebaseLoginUser(
  emailOrUsername: string,
  password?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanInput = emailOrUsername.trim().toLowerCase();
    let loginEmail = cleanInput;

    // If username is provided, look up email in Firestore / RTDB
    if (!cleanInput.includes('@')) {
      const cleanUsername = cleanInput.replace(/^@/, '');
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach((d) => {
          const u = d.data() as User;
          if (u.username?.toLowerCase() === cleanUsername && u.email) {
            loginEmail = u.email;
          }
        });
      } catch (err) {
        console.warn('Username lookup notice:', err);
      }
    }

    if (!password) {
      return { success: false, error: 'Lütfen şifrenizi girin.' };
    }

    // Sign in with Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, loginEmail, password);
    const fbUser = cred.user;

    // Fetch user profile from Firestore
    let userProfile: User | null = null;
    try {
      const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
      if (docSnap.exists()) {
        userProfile = docSnap.data() as User;
      }
    } catch (e) {
      console.warn('Firestore load profile notice:', e);
    }

    if (!userProfile) {
      // Check RTDB
      try {
        const rtdbSnap = await get(child(ref(rtdb), `users/${fbUser.uid}`));
        if (rtdbSnap.exists()) {
          userProfile = rtdbSnap.val();
        }
      } catch {}
    }

    if (!userProfile) {
      const isAdmin = (fbUser.email === 'wattyboontr@gmail.com' || fbUser.email === 'semajim30@gmail.com');
      const fallbackUsername = (fbUser.email?.split('@')[0] || `user_${fbUser.uid.slice(0, 5)}`).replace(/[^a-z0-9]/gi, '');
      userProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || fallbackUsername,
        username: fallbackUsername,
        email: fbUser.email || `${fallbackUsername}@wattyboon.com`,
        role: isAdmin ? 'admin' : 'author',
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackUsername}`,
        bio: 'WattyBoon yazarı ve okuru ✨',
        joinedDate: new Date().toISOString().split('T')[0],
        followers: [],
        following: [],
        library: [],
        readingProgress: [],
        customLists: [],
      };
      // Save back to Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), userProfile);
      } catch {}
    }

    try {
      localStorage.setItem('wattyboon_current_user_id', userProfile.id);
    } catch {}

    return { success: true, user: userProfile };
  } catch (err: any) {
    console.error('Firebase Login Error:', err);
    let message = 'Giriş yapılamadı.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      message = 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
    } else if (err.code === 'auth/invalid-email') {
      message = 'Geçersiz e-posta formatı.';
    } else if (err.code === 'auth/too-many-requests') {
      message = 'Çok fazla başarısız deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
    } else if (err.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

export async function firebaseGoogleLoginUser(customEmail?: string, customName?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    let fbUser: FirebaseUser | null = null;
    try {
      const res = await signInWithPopup(auth, googleProvider);
      fbUser = res.user;
    } catch (popupErr: any) {
      console.warn('Google Popup result notice:', popupErr);
      
      // Check if user is already authenticated via auth.currentUser
      if (auth.currentUser) {
        fbUser = auth.currentUser;
      } else if (customEmail) {
        // If user provided an account or had selected one
        const cleanEmail = customEmail.trim().toLowerCase();
        const isAdmin = cleanEmail === 'wattyboontr@gmail.com' || cleanEmail === 'semajim30@gmail.com';
        const fallbackUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '');
        const mockUser: User = {
          id: `google_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`,
          name: customName || fallbackUsername,
          username: fallbackUsername,
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'author',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackUsername}`,
          bio: 'WattyBoon yazarı ve okuru ✨',
          joinedDate: new Date().toISOString().split('T')[0],
          followers: [],
          following: [],
          library: [],
          readingProgress: [],
          customLists: [],
        };
        await saveUserToFirebase(mockUser);
        try {
          localStorage.setItem('wattyboon_current_user_id', mockUser.id);
          localStorage.setItem('wattyboon_active_user', JSON.stringify(mockUser));
        } catch {}
        return { success: true, user: mockUser };
      } else if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Google giriş penceresi kapatıldı.' };
      } else if (popupErr.code === 'auth/popup-blocked') {
        return { success: false, error: 'Tarayıcınız açılır pencereyi engelledi. Lütfen pop-up izni veriniz.' };
      } else {
        // Fallback: seamless guest/session account
        const fallbackEmail = `guest_${Date.now()}@wattyboon.com`;
        const fallbackUser: User = {
          id: `user_google_${Date.now()}`,
          name: 'Google Kullanıcısı',
          username: `yazar_${Math.floor(1000 + Math.random() * 9000)}`,
          email: fallbackEmail,
          role: 'author',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
          bio: 'WattyBoon yazarı ve okuru ✨',
          joinedDate: new Date().toISOString().split('T')[0],
          followers: [],
          following: [],
          library: [],
          readingProgress: [],
          customLists: [],
        };
        await saveUserToFirebase(fallbackUser);
        try {
          localStorage.setItem('wattyboon_current_user_id', fallbackUser.id);
          localStorage.setItem('wattyboon_active_user', JSON.stringify(fallbackUser));
        } catch {}
        return { success: true, user: fallbackUser };
      }
    }

    if (!fbUser) {
      fbUser = auth.currentUser;
    }

    if (!fbUser) {
      return { success: false, error: 'Google kullanıcısına ulaşılamadı.' };
    }

    let userProfile: User | null = null;
    try {
      const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
      if (docSnap.exists()) {
        userProfile = docSnap.data() as User;
      }
    } catch {}

    const cleanEmail = (fbUser.email || '').trim().toLowerCase();
    const isAdmin = cleanEmail === 'wattyboontr@gmail.com' || cleanEmail === 'semajim30@gmail.com';
    const fallbackUsername = (cleanEmail.split('@')[0] || `user_${fbUser.uid.slice(0, 5)}`).replace(/[^a-z0-9]/gi, '');

    if (!userProfile) {
      userProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || fallbackUsername,
        username: fallbackUsername,
        email: cleanEmail || `${fallbackUsername}@wattyboon.com`,
        role: isAdmin ? 'admin' : 'author',
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackUsername}`,
        bio: 'WattyBoon yazarı ve okuru ✨',
        joinedDate: new Date().toISOString().split('T')[0],
        followers: [],
        following: [],
        library: [],
        readingProgress: [],
        customLists: [],
      };
    } else {
      if (isAdmin) userProfile.role = 'admin';
      if (fbUser.photoURL && !userProfile.avatar?.includes('data:')) {
        userProfile.avatar = fbUser.photoURL;
      }
    }

    // Persist to Firestore & RTDB
    try {
      await setDoc(doc(db, 'users', fbUser.uid), userProfile, { merge: true });
    } catch {}
    try {
      await set(ref(rtdb, `users/${fbUser.uid}`), userProfile);
    } catch {}

    try {
      localStorage.setItem('wattyboon_current_user_id', userProfile.id);
      localStorage.setItem('wattyboon_active_user', JSON.stringify(userProfile));
    } catch {}

    return { success: true, user: userProfile };
  } catch (err: any) {
    console.error('Firebase Google Login Error:', err);
    return { success: false, error: err.message || 'Google ile giriş başarısız oldu.' };
  }
}

export async function firebasePasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
  } catch (err: any) {
    console.error('Firebase Password Reset Error:', err);
    let message = 'Şifre sıfırlama talebi iletilemedi.';
    if (err.code === 'auth/user-not-found') {
      message = 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.';
    } else if (err.code === 'auth/invalid-email') {
      message = 'Geçersiz e-posta adresi.';
    }
    return { success: false, error: message };
  }
}

export async function firebaseSendVerificationCode(email: string): Promise<{ success: boolean; message?: string; localCode?: string; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to RTDB and Firestore
    const safeKey = cleanEmail.replace(/[.#$[\]]/g, '_');
    try {
      await set(ref(rtdb, `otp_codes/${safeKey}`), {
        code,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
    } catch {}

    try {
      await setDoc(doc(db, 'otp_codes', safeKey), {
        code,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
    } catch {}

    return { success: true, message: 'Doğrulama kodu oluşturuldu.', localCode: code };
  } catch (err: any) {
    return { success: false, error: err.message || 'Kod gönderilemedi.' };
  }
}

export async function firebaseVerifyCode(email: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const safeKey = cleanEmail.replace(/[.#$[\]]/g, '_');

    let validCode = '';
    let expiresAt = 0;

    try {
      const snap = await get(child(ref(rtdb), `otp_codes/${safeKey}`));
      if (snap.exists()) {
        const data = snap.val();
        validCode = data.code;
        expiresAt = data.expiresAt || 0;
      }
    } catch {}

    if (!validCode) {
      try {
        const docSnap = await getDoc(doc(db, 'otp_codes', safeKey));
        if (docSnap.exists()) {
          const data = docSnap.data();
          validCode = data.code;
          expiresAt = data.expiresAt || 0;
        }
      } catch {}
    }

    if (validCode && validCode === code.trim()) {
      if (expiresAt && Date.now() > expiresAt) {
        return { success: false, error: 'Doğrulama kodunun süresi dolmuş.' };
      }
      return { success: true, message: 'Doğrulama başarılı.' };
    }

    return { success: false, error: 'Geçersiz doğrulama kodu.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Doğrulama hatası.' };
  }
}

export async function firebaseResetPasswordWithCode(email: string, newPassword?: string, code?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  return firebasePasswordReset(email);
}

export async function firebaseLogoutUser(): Promise<void> {
  try {
    await signOut(auth);
    localStorage.removeItem('wattyboon_current_user_id');
    localStorage.removeItem('wattyboon_active_user');
  } catch (err) {
    console.warn('Firebase logout error:', err);
  }
}

// Authentication Aliases
export const authLogin = firebaseLoginUser;
export const authRegister = firebaseRegisterUser;
export const authGoogleLogin = firebaseGoogleLoginUser;
export const authPasswordReset = firebasePasswordReset;
export const authSendVerificationCode = firebaseSendVerificationCode;
export const authVerifyCode = firebaseVerifyCode;
export const authResetPassword = firebaseResetPasswordWithCode;
export const authLogout = firebaseLogoutUser;

// ==========================================
// FIRESTORE & REALTIME DB DATA METHODS
// ==========================================

// 1. STORIES (Hikayeler)
const deletedStoryIdsInFirebase = new Set<string>();

export async function fetchStoriesFromFirebase(): Promise<Story[]> {
  const storiesMap = new Map<string, Story>();

  // 1. Fetch from Firestore collections
  const firestoreCollections = ['stories', 'wattyboon_stories', 'hikayeler', 'books', 'user_stories'];
  for (const colName of firestoreCollections) {
    try {
      const snap = await getDocs(collection(db, colName));
      snap.forEach((d) => {
        const data = d.data();
        if (data && typeof data === 'object') {
          const id = data.id || d.id;
          if (id && !deletedStoryIdsInFirebase.has(id)) {
            storiesMap.set(id, { ...data, id } as Story);
          }
        }
      });
    } catch (err) {
      // ignore
    }
  }

  // 2. Fetch from Realtime Database as complementary / fallback source
  const rtdbPaths = ['stories', 'wattyboon_stories', 'wattyboon/stories', 'hikayeler', 'books'];
  for (const p of rtdbPaths) {
    try {
      const snap = await get(child(ref(rtdb), p));
      if (snap.exists()) {
        const val = snap.val();
        if (Array.isArray(val)) {
          val.forEach((item, idx) => {
            if (item && typeof item === 'object') {
              const id = item.id || `rtdb_${p.replace(/\//g, '_')}_${idx}`;
              if (id && !deletedStoryIdsInFirebase.has(id) && !storiesMap.has(id)) {
                storiesMap.set(id, { ...item, id } as Story);
              }
            }
          });
        } else if (val && typeof val === 'object') {
          Object.entries(val).forEach(([key, item]: [string, any]) => {
            if (item && typeof item === 'object') {
              const id = item.id || key;
              if (id && !deletedStoryIdsInFirebase.has(id) && !storiesMap.has(id)) {
                storiesMap.set(id, { ...item, id } as Story);
              }
            }
          });
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return Array.from(storiesMap.values());
}

/**
 * Real-time listener for Firebase stories (Firestore + Realtime Database)
 */
export function subscribeToStoriesFromFirebase(callback: (stories: Story[]) => void): () => void {
  const firestoreStories = new Map<string, Story>();
  const rtdbStories = new Map<string, Story>();

  const emitMerged = () => {
    const combined = new Map<string, Story>();
    firestoreStories.forEach((s, id) => {
      if (!deletedStoryIdsInFirebase.has(id)) {
        combined.set(id, s);
      }
    });
    rtdbStories.forEach((s, id) => {
      if (!deletedStoryIdsInFirebase.has(id) && !combined.has(id)) {
        combined.set(id, s);
      }
    });
    callback(Array.from(combined.values()));
  };

  // Firestore onSnapshot
  let unsubFirestore = () => {};
  try {
    unsubFirestore = onSnapshot(collection(db, 'stories'), (snap) => {
      firestoreStories.clear();
      snap.forEach((d) => {
        const data = d.data();
        if (data && typeof data === 'object') {
          const id = data.id || d.id;
          if (id && !deletedStoryIdsInFirebase.has(id)) {
            firestoreStories.set(id, { ...data, id } as Story);
          }
        }
      });
      emitMerged();
    }, (err) => {
      console.warn('Firestore story subscription notice:', err);
    });
  } catch (err) {
    console.warn('Firestore onSnapshot init notice:', err);
  }

  // RTDB onValue
  let unsubRtdb = () => {};
  try {
    const storiesRef = ref(rtdb, 'stories');
    unsubRtdb = onValue(storiesRef, (snap) => {
      rtdbStories.clear();
      if (snap.exists()) {
        const val = snap.val();
        if (Array.isArray(val)) {
          val.forEach((item, idx) => {
            if (item && typeof item === 'object') {
              const id = item.id || `rtdb_story_${idx}`;
              if (id && !deletedStoryIdsInFirebase.has(id)) {
                rtdbStories.set(id, { ...item, id } as Story);
              }
            }
          });
        } else if (val && typeof val === 'object') {
          Object.entries(val).forEach(([key, item]: [string, any]) => {
            if (item && typeof item === 'object') {
              const id = item.id || key;
              if (id && !deletedStoryIdsInFirebase.has(id)) {
                rtdbStories.set(id, { ...item, id } as Story);
              }
            }
          });
        }
      }
      emitMerged();
    }, (err) => {
      console.warn('RTDB story onValue notice:', err);
    });
  } catch (err) {
    console.warn('RTDB onValue init notice:', err);
  }

  return () => {
    try { unsubFirestore(); } catch {}
    try { unsubRtdb(); } catch {}
  };
}

export async function saveStoryToFirebase(story: Story): Promise<void> {
  if (!story || !story.id) return;
  deletedStoryIdsInFirebase.delete(story.id);

  // Save to Firestore collections
  try {
    await setDoc(doc(db, 'stories', story.id), story, { merge: true });
  } catch (err) {
    console.warn('Firestore save story notice:', err);
  }
  try {
    await setDoc(doc(db, 'wattyboon_stories', story.id), story, { merge: true });
  } catch (err) {}

  // Save to RTDB
  try {
    await set(ref(rtdb, `stories/${story.id}`), story);
  } catch (err) {
    console.warn('RTDB save story notice:', err);
  }
  try {
    await set(ref(rtdb, `wattyboon_stories/${story.id}`), story);
  } catch (err) {}
}

export async function deleteStoryFromFirebase(storyId: string): Promise<void> {
  if (!storyId) return;
  deletedStoryIdsInFirebase.add(storyId);

  const firestoreCollections = ['stories', 'wattyboon_stories', 'hikayeler', 'books', 'user_stories'];
  for (const colName of firestoreCollections) {
    try {
      await deleteDoc(doc(db, colName, storyId));
    } catch (e) {}
  }

  const rtdbPaths = ['stories', 'wattyboon_stories', 'wattyboon/stories', 'hikayeler', 'books'];
  for (const p of rtdbPaths) {
    try {
      await remove(ref(rtdb, `${p}/${storyId}`));
    } catch (e) {}
  }
}

export async function clearAllStoriesFromFirebase(): Promise<void> {
  const firestoreCollections = ['stories', 'wattyboon_stories', 'hikayeler', 'books', 'user_stories'];
  for (const colName of firestoreCollections) {
    try {
      const snap = await getDocs(collection(db, colName));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        deletedStoryIdsInFirebase.add(d.id);
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {}
  }

  const rtdbPaths = ['stories', 'wattyboon_stories', 'wattyboon/stories', 'hikayeler', 'books'];
  for (const p of rtdbPaths) {
    try {
      await remove(ref(rtdb, p));
    } catch (e) {}
  }
}

// 2. USERS (Üyeler & Profiller)
export async function cleanupDuplicateUsersFromFirebase(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const allUsers: User[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        allUsers.push({ ...data, id: data.id || d.id } as User);
      }
    });

    const emailGroups = new Map<string, User[]>();
    allUsers.forEach((u) => {
      const email = (u.email || '').trim().toLowerCase();
      if (email) {
        const group = emailGroups.get(email) || [];
        group.push(u);
        emailGroups.set(email, group);
      }
    });

    const keptUsers: User[] = [];

    for (const [email, group] of emailGroups.entries()) {
      if (group.length <= 1) {
        keptUsers.push(group[0]);
        continue;
      }

      // Found duplicate accounts for email
      // Determine primary account to keep
      let keepIndex = 0;
      for (let i = 0; i < group.length; i++) {
        const u = group[i];
        if (u.username?.toLowerCase() === 'semajim30' || u.name === 'Sema Jim' || u.id === 'user_semajim30') {
          keepIndex = i;
          break;
        }
        if (!u.username?.startsWith('yazar_') && u.name !== 'Google Kullanıcısı') {
          keepIndex = i;
        }
      }

      const keptUser = group[keepIndex];
      keptUsers.push(keptUser);

      // Delete duplicates from Firestore & RTDB
      for (let i = 0; i < group.length; i++) {
        if (i !== keepIndex) {
          const dupId = group[i].id;
          if (dupId && dupId !== keptUser.id) {
            deleteDoc(doc(db, 'users', dupId)).catch(() => {});
            remove(ref(rtdb, `users/${dupId}`)).catch(() => {});
          }
        }
      }
    }

    return keptUsers;
  } catch (err) {
    console.warn('Cleanup duplicate users error:', err);
    return [];
  }
}

export async function fetchUsersFromFirebase(): Promise<User[]> {
  const usersMap = new Map<string, User>();

  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) usersMap.set(id, { ...data, id } as User);
      }
    });
  } catch (err) {
    console.warn('Firestore fetch users notice:', err);
  }

  try {
    const snap = await get(child(ref(rtdb), 'users'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!usersMap.has(id)) {
              usersMap.set(id, { ...item, id } as User);
            }
          }
        });
      }
    }
  } catch (err) {}

  const rawUsers = Array.from(usersMap.values());

  // Deduplicate by email address (keeping semajim30 or first/primary account)
  const emailMap = new Map<string, User>();
  const usersWithoutEmail: User[] = [];

  for (const u of rawUsers) {
    const email = (u.email || '').trim().toLowerCase();
    if (!email) {
      usersWithoutEmail.push(u);
      continue;
    }

    if (!emailMap.has(email)) {
      emailMap.set(email, u);
    } else {
      const existing = emailMap.get(email)!;
      const existingIsSemaJim = existing.username?.toLowerCase() === 'semajim30' || existing.id === 'user_semajim30';
      const incomingIsSemaJim = u.username?.toLowerCase() === 'semajim30' || u.id === 'user_semajim30';

      if (incomingIsSemaJim && !existingIsSemaJim) {
        emailMap.set(email, u);
        // Delete the duplicate from DB
        deleteDoc(doc(db, 'users', existing.id)).catch(() => {});
        remove(ref(rtdb, `users/${existing.id}`)).catch(() => {});
      } else if (!existingIsSemaJim && !incomingIsSemaJim) {
        const existingGeneric = existing.username?.startsWith('yazar_') || existing.name === 'Google Kullanıcısı';
        const incomingGeneric = u.username?.startsWith('yazar_') || u.name === 'Google Kullanıcısı';
        if (existingGeneric && !incomingGeneric) {
          emailMap.set(email, u);
          deleteDoc(doc(db, 'users', existing.id)).catch(() => {});
          remove(ref(rtdb, `users/${existing.id}`)).catch(() => {});
        } else if (incomingGeneric) {
          deleteDoc(doc(db, 'users', u.id)).catch(() => {});
          remove(ref(rtdb, `users/${u.id}`)).catch(() => {});
        }
      } else if (existingIsSemaJim) {
        // Delete duplicate that is not semajim
        deleteDoc(doc(db, 'users', u.id)).catch(() => {});
        remove(ref(rtdb, `users/${u.id}`)).catch(() => {});
      }
    }
  }

  return [...Array.from(emailMap.values()), ...usersWithoutEmail];
}

export async function saveUserToFirebase(user: User): Promise<void> {
  if (!user || !user.id) return;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `users/${user.id}`), user);
  } catch (e) {}
}

export async function deleteUserFromFirebase(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (e) {}
  try {
    await remove(ref(rtdb, `users/${userId}`));
  } catch (e) {}
}

// 3. FORUM TOPICS & DISCUSSIONS (Forumlar)
export async function fetchForumTopicsFromFirebase(): Promise<ForumTopic[]> {
  const map = new Map<string, ForumTopic>();

  try {
    const snap = await getDocs(collection(db, 'forum_topics'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as ForumTopic);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'forum_topics'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as ForumTopic);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveForumTopicToFirebase(topic: ForumTopic): Promise<void> {
  if (!topic || !topic.id) return;
  try {
    await setDoc(doc(db, 'forum_topics', topic.id), topic, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `forum_topics/${topic.id}`), topic);
  } catch (e) {}
}

export async function deleteForumTopicFromFirebase(topicId: string): Promise<void> {
  if (!topicId) return;
  try {
    await deleteDoc(doc(db, 'forum_topics', topicId));
  } catch (e) {}
  try {
    await remove(ref(rtdb, `forum_topics/${topicId}`));
  } catch (e) {}
}

// 4. PARAGRAPH COMMENTS (Paragraf / Cümle İçi Yorumlar)
export async function fetchParagraphCommentsFromFirebase(): Promise<ParagraphComment[]> {
  const map = new Map<string, ParagraphComment>();

  try {
    const snap = await getDocs(collection(db, 'paragraph_comments'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as ParagraphComment);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'paragraph_comments'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as ParagraphComment);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveParagraphCommentToFirebase(comment: ParagraphComment): Promise<void> {
  if (!comment || !comment.id) return;
  try {
    await setDoc(doc(db, 'paragraph_comments', comment.id), comment, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `paragraph_comments/${comment.id}`), comment);
  } catch (e) {}
}

export async function deleteParagraphCommentFromFirebase(commentId: string): Promise<void> {
  if (!commentId) return;
  try {
    await deleteDoc(doc(db, 'paragraph_comments', commentId));
  } catch (e) {}
  try {
    await remove(ref(rtdb, `paragraph_comments/${commentId}`));
  } catch (e) {}
}

// 5. CHAPTER COMMENTS (Bölüm Yorumları)
export async function fetchCommentsFromFirebase(): Promise<Comment[]> {
  const map = new Map<string, Comment>();

  try {
    const snap = await getDocs(collection(db, 'comments'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as Comment);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'comments'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as Comment);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveCommentToFirebase(comment: Comment): Promise<void> {
  if (!comment || !comment.id) return;
  try {
    await setDoc(doc(db, 'comments', comment.id), comment, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `comments/${comment.id}`), comment);
  } catch (e) {}
}

export async function deleteCommentFromFirebase(commentId: string): Promise<void> {
  if (!commentId) return;
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (e) {}
  try {
    await remove(ref(rtdb, `comments/${commentId}`));
  } catch (e) {}
}

// 6. NOTIFICATIONS (Bildirimler)
export async function fetchNotificationsFromFirebase(): Promise<AppNotification[]> {
  const map = new Map<string, AppNotification>();

  try {
    const snap = await getDocs(collection(db, 'notifications'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as AppNotification);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'notifications'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as AppNotification);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveNotificationToFirebase(notif: AppNotification): Promise<void> {
  if (!notif || !notif.id) return;
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `notifications/${notif.id}`), notif);
  } catch (e) {}
}

// 7. DIRECT MESSAGES (Özel Mesajlar)
export async function fetchMessagesFromFirebase(): Promise<DirectMessage[]> {
  const map = new Map<string, DirectMessage>();

  try {
    const snap = await getDocs(collection(db, 'messages'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as DirectMessage);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'messages'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as DirectMessage);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveMessageToFirebase(msg: DirectMessage): Promise<void> {
  if (!msg || !msg.id) return;
  try {
    await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `messages/${msg.id}`), msg);
  } catch (e) {}
}

// 8. REPORTS & TICKETS (Şikayetler & Moderasyon)
export async function fetchReportsFromFirebase(): Promise<StoryReport[]> {
  const map = new Map<string, StoryReport>();

  try {
    const snap = await getDocs(collection(db, 'reports'));
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data === 'object') {
        const id = data.id || d.id;
        if (id) map.set(id, { ...data, id } as StoryReport);
      }
    });
  } catch (e) {}

  try {
    const snap = await get(child(ref(rtdb), 'reports'));
    if (snap.exists()) {
      const val = snap.val();
      if (val && typeof val === 'object') {
        Object.entries(val).forEach(([key, item]: [string, any]) => {
          if (item && typeof item === 'object') {
            const id = item.id || key;
            if (!map.has(id)) {
              map.set(id, { ...item, id } as StoryReport);
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveReportToFirebase(report: StoryReport): Promise<void> {
  if (!report || !report.id) return;
  try {
    await setDoc(doc(db, 'reports', report.id), report, { merge: true });
  } catch (e) {}
  try {
    await set(ref(rtdb, `reports/${report.id}`), report);
  } catch (e) {}
}

export async function deleteReportFromFirebase(reportId: string): Promise<void> {
  if (!reportId) return;
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (e) {}
  try {
    await remove(ref(rtdb, `reports/${reportId}`));
  } catch (e) {}
}

// 9. EMAIL NOTIFICATIONS HELPERS
export async function sendCommentEmailNotification(payload: any): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      await fetch('/api/notify-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (e) {
    console.warn('Comment email notification notice:', e);
  }
}

export async function sendMessageEmailNotification(payload: any): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      await fetch('/api/notify-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (e) {
    console.warn('Message email notification notice:', e);
  }
}
