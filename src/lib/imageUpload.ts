/**
 * Image Upload Helper - ImgBB CDN
 * Member profile pictures, avatars, cover photos, story covers, and chapter images are hosted on ImgBB CDN (https://api.imgbb.com/1/upload).
 */

// ImgBB API Key specified by the user
export const IMGBB_API_KEY = "ab2e5f162e826273cb3649b55debc0bd";

// ImgBB API Keys Pool for redundancy
const IMGBB_API_KEYS = [
  IMGBB_API_KEY,
  "6d207e02198a847aa5fb3acda8b4f4bb"
];

/**
 * Upload directly to ImgBB CDN via client-side fetch
 */
export async function uploadToImgBB(fileOrBase64: File | string, originalName?: string): Promise<string | null> {
  for (const apiKey of IMGBB_API_KEYS) {
    try {
      const formData = new FormData();
      if (typeof fileOrBase64 === 'string') {
        const cleanBase64 = fileOrBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        formData.append('image', cleanBase64);
      } else {
        formData.append('image', fileOrBase64);
      }
      if (originalName) {
        formData.append('name', originalName.replace(/\.[^/.]+$/, ''));
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const directUrl = result.data.url || result.data.display_url || result.data.image?.url;
          if (directUrl) {
            return directUrl;
          }
        }
      }
    } catch (err) {
      console.warn('[ImgBB Client Upload] Attempt notice:', err);
    }
  }
  return null;
}

/**
 * Upload via backend server-side ImgBB proxy
 */
export async function uploadToImgBBViaServer(base64: string, originalName?: string, userId?: string): Promise<string | null> {
  try {
    const res = await fetch('/api/imgbb/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        originalName: originalName || 'image.jpg',
        userId: userId || 'user',
        type: 'imgbb_media',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[ImgBB Server Proxy Upload] notice:', err);
  }
  return null;
}

export async function uploadImageToHost(fileOrBase64: File | string, originalName?: string, userId?: string): Promise<string> {
  if (!fileOrBase64) return '';

  let base64Result = '';

  // Convert File to Base64 if it's a File object
  if (typeof fileOrBase64 !== 'string') {
    base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.readAsDataURL(fileOrBase64);
    });
  } else {
    base64Result = fileOrBase64;
  }

  if (!base64Result) return '';

  // If already a hosted URL (http/https), return directly
  if (base64Result.startsWith('http://') || base64Result.startsWith('https://') || base64Result.startsWith('/uploads/')) {
    return base64Result;
  }

  // 1. PRIMARY (A): Direct Client Upload to ImgBB CDN
  try {
    const imgbbDirectUrl = await uploadToImgBB(fileOrBase64, originalName);
    if (imgbbDirectUrl) {
      return imgbbDirectUrl;
    }
  } catch (imgbbErr) {
    console.warn('[ImgBB Upload] Direct client upload failed, trying server proxy:', imgbbErr);
  }

  // 1. PRIMARY (B): Server-side Proxy to ImgBB CDN
  try {
    const imgbbServerUrl = await uploadToImgBBViaServer(base64Result, originalName, userId);
    if (imgbbServerUrl) {
      return imgbbServerUrl;
    }
  } catch (serverErr) {
    console.warn('[ImgBB Server Upload] Proxy notice:', serverErr);
  }

  // 2. Fallback: Return raw base64 data URL
  return base64Result;
}

