const INSTANCES = [
  'https://searx.be',
  'https://searxng.site',
  'https://search.mdosch.de',
  'https://search.bus-hit.me',
];

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function hostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function page(query, results, errMsg) {
  const q = esc(query);
  const hasResults = results && results.length > 0;

  const topBar = query ? `
    <div class="bar">
      <a class="glogo" href="/api/search">
        <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc04">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
      </a>
      <form action="/api/search" method="get" class="barform">
        <div class="sbox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:#9aa0a6;flex-shrink:0"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input name="q" value="${q}" autofocus autocomplete="off" spellcheck="false" placeholder="Search…">
          <button type="submit">Search</button>
        </div>
      </form>
    </div>` : '';

  const homeContent = !query ? `
    <div class="home">
      <div class="home-logo">
        <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc04">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
      </div>
      <form action="/api/search" method="get">
        <div class="sbox home-sbox">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="color:#9aa0a6;flex-shrink:0"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input name="q" autofocus autocomplete="off" spellcheck="false" placeholder="Search Google…" style="font-size:16px">
          <button type="submit">Search</button>
        </div>
      </form>
      <p class="powered">Powered by SearXNG · results open in a new tab</p>
    </div>` : '';

  const resultsContent = query ? `
    <div class="results">
      ${errMsg && !hasResults ? `
        <div class="empty">
          Could not reach search backend. <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" rel="noopener">Open in Google ↗</a>
        </div>` : ''}
      ${hasResults ? results.map(r => `
        <div class="result">
          <div class="cite">${esc(hostname(r.url))}</div>
          <a class="title" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title || r.url)}</a>
          ${r.content ? `<div class="snippet">${esc(r.content)}</div>` : ''}
        </div>`).join('') : (!errMsg ? '<div class="empty">No results found.</div>' : '')}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${q ? q + ' — Search' : 'Search'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:arial,sans-serif;background:#fff;color:#202124;font-size:14px}
a{text-decoration:none}
.bar{display:flex;align-items:center;gap:16px;padding:8px 20px;border-bottom:1px solid #dfe1e5;position:sticky;top:0;background:#fff;z-index:10}
.glogo{font-size:22px;font-weight:700;letter-spacing:-1px;white-space:nowrap}
.barform{flex:1;max-width:600px}
.sbox{display:flex;align-items:center;gap:8px;border:1px solid #dfe1e5;border-radius:24px;padding:7px 16px;background:#fff}
.sbox:focus-within{border-color:#4285f4;box-shadow:0 1px 3px rgba(66,133,244,.3)}
.sbox input{flex:1;border:none;outline:none;font-size:14px;color:#202124;min-width:0}
.sbox button{background:none;border:none;cursor:pointer;color:#4285f4;font-weight:700;font-size:12px;white-space:nowrap;padding:0}
.home{text-align:center;padding:80px 20px 40px}
.home-logo{font-size:56px;font-weight:700;letter-spacing:-2px;margin-bottom:32px}
.home-sbox{padding:12px 20px;max-width:500px;margin:0 auto}
.powered{font-size:11px;color:#9aa0a6;margin-top:24px}
.results{max-width:680px;padding:16px 20px;margin:0}
.result{margin-bottom:28px}
.cite{font-size:12px;color:#4d5156;margin-bottom:3px}
.title{font-size:18px;color:#1a0dab;line-height:1.3;display:block;margin-bottom:5px}
.title:hover{text-decoration:underline}
.snippet{font-size:13px;color:#4d5156;line-height:1.57}
.empty{padding:32px 0;color:#70757a;line-height:1.8}
.empty a{color:#1a0dab}
</style>
</head>
<body>
${topBar}${homeContent}${resultsContent}
</body>
</html>`;
}

export default async function handler(req, res) {
  const { q } = req.query;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Cache-Control', 'no-store');

  if (!q || !q.trim()) {
    return res.status(200).send(page('', [], null));
  }

  const query = q.trim();
  let results = [];
  let lastErr = null;

  for (const base of INSTANCES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const r = await fetch(
        `${base}/search?q=${encodeURIComponent(query)}&format=json&language=en&categories=general`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );
      clearTimeout(timer);
      if (r.ok) {
        const data = await r.json();
        results = (data.results || []).slice(0, 20);
        lastErr = null;
        break;
      }
      lastErr = `HTTP ${r.status} from ${base}`;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e.message;
    }
  }

  return res.status(200).send(page(query, results, lastErr));
}
