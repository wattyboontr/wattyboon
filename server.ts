import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable trust proxy for cloud deployment & global CDN/load balancers
app.set('trust proxy', true);

// Enable Global CORS & Standard Open Web Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Support up to 50MB for story covers, avatars, and chapter illustrations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to send email (SMTP or Relay)
async function sendSystemEmail(to: string, subject: string, htmlContent: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (smtpHost || (smtpUser && smtpPass)) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"WattyBoon Güvenlik" <${smtpUser || 'wattyboontr@gmail.com'}>`,
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, method: 'smtp' };
    } catch (e) {
      console.warn('[Email Helper] SMTP failed, attempting relay:', e);
    }
  }

  try {
    const relayRes = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Platform: 'WattyBoon Firebase Auth',
        Subject: subject,
        Message: htmlContent.replace(/<[^>]+>/g, ' ').substring(0, 500),
      }),
    });
    if (relayRes.ok) return { success: true, method: 'relay' };
  } catch (err) {
    console.warn('[Email Helper] Relay failed:', err);
  }

  console.log(`[Email Helper] Logged email to ${to}: "${subject}"`);
  return { success: true, method: 'logged' };
}

// API health endpoint for uptime checks & deployment monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Dynamic Sitemap XML endpoint for Google Search Console & SEO (/sitemap.xml)
app.get(['/sitemap.xml', '/api/sitemap.xml'], (req, res) => {
  try {
    const host = req.get('host') || 'wattyboon.com';
    const protocol = req.protocol === 'http' && !host.includes('localhost') ? 'https' : req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const staticUrls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/kategoriler`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/forum`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/yaz`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/kutuphanem`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/sitemap`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/kesfet?kategori=Romantik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Fantastik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Bilim+Kurgu`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Gizem`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Korku`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Macera`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Gen%C3%A7lik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=%C5%9Eiir`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Tarih`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Klasik`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/kesfet?kategori=K%C4%B1sa+Hikaye`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/kesfet?kategori=Mizah`, priority: '0.7', changefreq: 'weekly' },
    ];

    const allStories = [];
    const storyUrls = Array.isArray(allStories)
      ? allStories
          .filter((s: any) => s.visibility === 'public')
          .map((s: any) => ({
            loc: `${baseUrl}/hikaye/${encodeURIComponent(s.id)}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: s.updatedAt ? s.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          }))
      : [];

    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...storyUrls]
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${(u as any).lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'wattyboon.com';
  const protocol = req.protocol === 'http' && !host.includes('localhost') ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const robots = `# WattyBoon Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /?sayfa=admin

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ==========================================
// FORMSPREE WEBHOOK
// ==========================================
app.post('/api/formspree/webhook', async (req, res) => {
  try {
    const { email, message } = req.body;
    
    const db = (process.env as any).DB;
    
    if (db && typeof db.prepare === 'function') {
      await db.prepare("INSERT INTO ContactSubmissions (email, message, createdAt) VALUES (?, ?, ?)")
        .bind(email, message, new Date().toISOString())
        .run();
    } else {
      console.log('Formspree webhook received (D1 not available):', { email, message });
    }
    
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Formspree webhook error:', e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.get('/api/formspree/submissions', async (req, res) => {
  try {
    const db = (process.env as any).DB;
    
    if (db && typeof db.prepare === 'function') {
      const { results } = await db.prepare("SELECT * FROM ContactSubmissions ORDER BY createdAt DESC").all();
      res.json({ success: true, data: results });
    } else {
      res.json({ success: true, data: [], note: 'D1 not available' });
    }
  } catch (e) {
    console.error('Fetch submissions error:', e);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ==========================================
// SECURE AUTHENTICATION API ROUTES (Stubbed - Pending Cloudflare Worker Implementation)
// ==========================================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 3. GOOGLE SECURE LOGIN
app.post('/api/auth/google-login', async (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 4. GET CURRENT USER (Session verification)
app.get('/api/auth/me', (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 5. SEND OTP / VERIFICATION CODE
app.post('/api/auth/send-code', async (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 6. VERIFY OTP CODE
app.post('/api/auth/verify-code', (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 7. PASSWORD RESET
app.post('/api/auth/reset-password', async (req, res) => {
  return res.status(501).json({ error: 'Auth service not yet implemented.' });
});

// 8. LOGOUT
app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});


// ==========================================
// EMAIL NOTIFICATIONS
// ==========================================

// API route for Email Notifications when a new comment or reply is posted
app.post('/api/notify-comment', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      storyId,
      storyTitle,
      chapterIndex,
      chapterTitle,
      paragraphIndex,
      selectedText,
      parentId,
      replyToUserName,
      content,
      userName,
      userUsername,
      createdAt,
    } = req.body;

    const isReply = Boolean(parentId || replyToUserName);
    const targetEmail = recipientEmail || process.env.NOTIFICATION_EMAIL || 'wattyboontr@gmail.com';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const commentTime = createdAt 
      ? new Date(createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) 
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    
    const subject = isReply
      ? `[WattyBoon] Yorumunuza Yanıt: "${storyTitle || 'Hikaye'}" - ${userName || 'Kullanıcı'} size yanıt verdi`
      : `[WattyBoon] Yeni Yorum: "${storyTitle || 'Hikaye'}" - ${userName || 'Okuyucu'} bir yorum bıraktı`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">WattyBoon</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${isReply ? '💬 Yeni Yorum Yanıtı' : '✨ Yeni Okuyucu Yorumu'}</p>
        </div>
        
        <div style="padding: 24px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Merhaba <strong>${recipientName || 'WattyBoon Yazarı'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            ${isReply 
              ? `Platformda <strong>${userName || 'Bir kullanıcı'}</strong>, <strong>@${replyToUserName || 'yorumunuza'}</strong> bir yanıt bıraktı.` 
              : `<strong>"${storyTitle || 'Hikayeniz'}"</strong> adlı eserinize yeni bir okuyucu yorumu paylaşıldı. Detaylar aşağıdadır:`}
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>Hikaye:</strong> ${storyTitle || 'Bilinmeyen Hikaye'}
            </p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>Bölüm:</strong> ${chapterTitle || `${(chapterIndex ?? 0) + 1}. Bölüm`}
            </p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>${isReply ? 'Yanıtlayan:' : 'Yorum Yapan:'}</strong> ${userName || 'Kullanıcı'} (@${userUsername || 'kullanici'})
            </p>
            ${isReply && replyToUserName ? `
            <p style="margin: 0 0 8px; font-size: 13px; color: #7c3aed; font-weight: 600;">
              <strong>Yanıt Verilen:</strong> @${replyToUserName}
            </p>
            ` : ''}
            <p style="margin: 0; font-size: 13px; color: #334155;">
              <strong>Tarih / Saat:</strong> ${commentTime}
            </p>
          </div>

          ${selectedText ? `
          <div style="margin: 16px 0; padding: 12px 16px; background-color: #faf5ff; border-radius: 8px; border: 1px dashed #d8b4fe;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #7e22ce; text-transform: uppercase;">Alıntı Yapılan Cümle:</p>
            <p style="margin: 0; font-size: 13px; font-style: italic; color: #4c1d95;">"${selectedText}"</p>
          </div>
          ` : ''}

          <div style="margin: 20px 0; padding: 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">${isReply ? 'Yanıt Metni:' : 'Yorum Metni:'}</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${content}</p>
          </div>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${appUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);">
              WattyBoon'a Git ve Yanıtla
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Bu e-posta WattyBoon Hikaye Platformu bildirim sistemi tarafından <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">${targetEmail}</a> adresine iletilmiştir.
          </p>
        </div>
      </div>
    `;

    await sendSystemEmail(targetEmail, subject, htmlContent);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Email Notification Error:', err);
    return res.status(500).json({ error: err.message || 'E-posta bildirimi gönderilirken hata oluştu.' });
  }
});

// API route for Direct Message Email Notifications
app.post('/api/notify-message', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      senderName,
      senderUsername,
      messageContent,
      createdAt,
    } = req.body;

    const targetEmail = recipientEmail || process.env.NOTIFICATION_EMAIL || 'wattyboontr@gmail.com';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const msgTime = createdAt 
      ? new Date(createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) 
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const subject = `[WattyBoon] @${senderUsername || senderName} size yeni bir özel mesaj gönderdi`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">WattyBoon Mesajlar</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">✉️ Yeni Özel Mesaj</p>
        </div>
        
        <div style="padding: 24px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Merhaba <strong>${recipientName || 'Kullanıcı'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            <strong>${senderName || 'Bir kullanıcı'} (@${senderUsername || 'kullanici'})</strong> size WattyBoon üzerinden özel bir mesaj gönderdi.
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">Gelen Mesaj:</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${messageContent}</p>
            <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">Tarih: ${msgTime}</p>
          </div>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${appUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);">
              Mesajı Görüntüle & Yanıtla
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Bu bildirim e-postası WattyBoon Direkt Mesajlaşma sistemi tarafından <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">${targetEmail}</a> adresine iletilmiştir.
          </p>
        </div>
      </div>
    `;

    await sendSystemEmail(targetEmail, subject, htmlContent);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Direct Message Email Notification Error:', err);
    return res.status(500).json({ error: err.message || 'Mesaj e-posta bildirimi gönderilirken hata oluştu.' });
  }
});

// API route for AI Writing Assistant in rich text editor
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY bulunamadı. Lütfen Ayarlar panelinden ekleyin.' });
    }

    const { prompt, type, context } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = 'Sen Wattpad ve blog yazarları için Türkçe çalışan yaratıcı bir yazım asistanısın. Etkileyici, samimi ve kaliteli öneriler sunarsın.';
    if (type === 'continue') {
      systemInstruction += ' Verilen hikaye akışını doğal bir şekilde devam ettiren 2-3 sürükleyici paragraf yaz.';
    } else if (type === 'enhance') {
      systemInstruction += ' Verilen metni edebi dili güçlendirerek, betimlemeleri zenginleştirerek ve imla hatalarını düzelterek yeniden düzenle.';
    } else if (type === 'character') {
      systemInstruction += ' Verilen fikre veya türe uygun, isimleri, kişilik özellikleri, geçmişleri ve sırları olan 2 özgün karakter konsepti oluştur.';
    } else if (type === 'outline') {
      systemInstruction += ' Sürükleyici 3 bölümlük bir hikaye taslağı ve bölüm özetleri hazırla.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${prompt ? `Kullanıcı İsteği: ${prompt}\n` : ''}${context ? `Hikaye / Metin Bağlamı:\n${context}` : ''}`,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error('AI Assistant Error:', err);
    return res.status(500).json({ error: err.message || 'Yapay zeka yanıt üretirken hata oluştu.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
