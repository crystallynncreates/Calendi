function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

const OEMBED_ENDPOINTS = {
  instagram: 'https://graph.facebook.com/v18.0/instagram_oembed?url=',
  tiktok: 'https://www.tiktok.com/oembed?url=',
  twitter: 'https://publish.twitter.com/oembed?url=',
  facebook: 'https://www.facebook.com/plugins/post/oembed.json/?url=',
};

function detectPlatform(url) {
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/facebook\.com/.test(url)) return 'facebook';
  return null;
}

function page(embedHtml, postUrl, error, platform) {
  const tabs = ['instagram', 'tiktok', 'twitter', 'facebook'];
  const tabLabels = { instagram: '📷 Instagram', tiktok: '🎵 TikTok', twitter: '✕ X / Twitter', facebook: '🔵 Facebook' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Social Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column}
.bar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#111118;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0}
.tabs{display:flex;gap:4px;overflow-x:auto;padding:8px 14px 0;background:#0d0d14;flex-shrink:0}
.tab{padding:6px 14px;border-radius:8px 8px 0 0;font-size:11px;font-family:monospace;cursor:pointer;border:1px solid rgba(255,255,255,0.08);border-bottom:none;background:rgba(255,255,255,0.03);color:#94a3b8;white-space:nowrap;text-decoration:none}
.tab.active{background:#1a1a2e;color:#e2e8f0;border-color:rgba(99,102,241,0.4)}
form{display:flex;gap:6px;flex:1}
input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 10px;color:#e2e8f0;font-size:12px;font-family:monospace;outline:none}
input:focus{border-color:rgba(99,102,241,0.5)}
input::placeholder{color:#64748b}
button[type=submit]{background:#6366f1;border:none;border-radius:8px;padding:6px 14px;color:#fff;font-size:11px;font-family:monospace;cursor:pointer;white-space:nowrap}
button[type=submit]:hover{background:#5558e3}
.content{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:20px 14px;overflow-y:auto}
.embed-wrap{width:100%;max-width:540px}
.error{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:14px;color:#f87171;font-size:12px;text-align:center;line-height:1.6}
.hint{text-align:center;color:#475569;font-size:11px;font-family:monospace;line-height:1.8;margin-top:8px}
.hint code{color:#818cf8;background:rgba(99,102,241,0.1);padding:1px 6px;border-radius:4px;font-size:10px}
</style>
</head>
<body>

<div class="tabs">
  ${tabs.map(t => `<a class="tab${t === (platform || 'instagram') ? ' active' : ''}" href="/api/social?platform=${t}">${tabLabels[t]}</a>`).join('')}
</div>

<div class="bar">
  <form action="/api/social" method="get">
    <input type="hidden" name="platform" value="${esc(platform || 'instagram')}">
    <input name="url" value="${esc(postUrl || '')}" placeholder="Paste a post or video URL here…" autofocus>
    <button type="submit">View</button>
  </form>
</div>

<div class="content">
  ${error ? `<div class="error">${esc(error)}</div>` : ''}
  ${embedHtml ? `<div class="embed-wrap">${embedHtml}</div>` : `
    <div>
      <div class="hint">
        Paste any public ${(platform || 'social media')} post URL above to view it here.<br><br>
        ${platform === 'instagram' ? `Example:<br><code>https://www.instagram.com/p/ABC123/</code>` : ''}
        ${platform === 'tiktok' ? `Example:<br><code>https://www.tiktok.com/@user/video/123</code>` : ''}
        ${platform === 'twitter' ? `Example:<br><code>https://x.com/user/status/123</code>` : ''}
        ${platform === 'facebook' ? `Example:<br><code>https://www.facebook.com/user/posts/123</code>` : ''}
        ${!platform ? `Supports Instagram, TikTok, X/Twitter, and Facebook public posts.` : ''}
      </div>
    </div>
  `}
</div>

</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const { url, platform } = req.query;
  const plat = platform || 'instagram';

  if (!url || !url.trim()) {
    return res.status(200).send(page('', '', null, plat));
  }

  const postUrl = url.trim();
  const detectedPlat = detectPlatform(postUrl) || plat;
  const endpoint = OEMBED_ENDPOINTS[detectedPlat];

  if (!endpoint) {
    return res.status(200).send(page('', postUrl, 'Could not detect platform from URL.', plat));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(
      `${endpoint}${encodeURIComponent(postUrl)}&omitscript=false`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Calendi/1.0)',
          'Accept': 'application/json',
        },
      }
    );
    clearTimeout(timer);

    if (!r.ok) {
      const errText = await r.text().catch(() => `HTTP ${r.status}`);
      return res.status(200).send(page('', postUrl, `Could not load post (${r.status}). Make sure the post is public.`, detectedPlat));
    }

    const data = await r.json();
    const embedHtml = data.html || '';

    if (!embedHtml) {
      return res.status(200).send(page('', postUrl, 'No embed content returned. The post may be private or unavailable.', detectedPlat));
    }

    return res.status(200).send(page(embedHtml, postUrl, null, detectedPlat));
  } catch (e) {
    clearTimeout(timer);
    return res.status(200).send(page('', postUrl, `Failed to load: ${e.message}`, detectedPlat));
  }
}
