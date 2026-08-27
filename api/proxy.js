export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing url parameter');
  }

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).send('Invalid URL');
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return res.status(400).send('Only http/https allowed');
  }

  let upstream;
  try {
    upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
  } catch (err) {
    return res.status(502).send(
      `<html><body style="font-family:sans-serif;padding:20px"><h3>Could not connect to ${url}</h3><p>${err.message}</p></body></html>`
    );
  }

  const contentType = upstream.headers.get('content-type') || 'text/html';

  if (!contentType.includes('text/html')) {
    const buffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(upstream.status).send(Buffer.from(buffer));
  }

  let html = await upstream.text();
  const origin = target.origin;

  // Navigation interceptor injected at the top of <head>.
  // Avoids overriding Location/history prototypes (they cause reload loops because
  // Google reads back window.location.pathname — which is the proxy path — and
  // passes it to replaceState, resolving it against the google.com base to create
  // a double-proxy URL). Instead we intercept three targeted ways:
  //   1. Capture-phase click handler  — <a> links
  //   2. Capture-phase submit handler — form submissions
  //   3. keydown Enter on input[name=q] — Google's search box (hooked on DOMContentLoaded
  //      and retried after 500 ms / 1500 ms for dynamic inputs)
  // All intercepted navigations go via postMessage so the parent BrowserWidget can
  // reload the iframe src as /api/proxy?url=<target> rather than navigating directly.
  const interceptor =
    `<base href="${origin}/"><script>(function(){` +
    `var O='${origin}';` +
    `function pn(u){try{var a=new URL(u,document.baseURI).href;` +
    `if(a.startsWith(O)){window.parent.postMessage({calendi:'nav',url:a},'*');return true;}}` +
    `catch(e){}return false;}` +
    // click interceptor
    `document.addEventListener('click',function(e){` +
    `var a=e.target.closest('a[href]');if(!a)return;` +
    `var h=a.getAttribute('href');if(!h||h[0]==='#'||/^(javascript|mailto|tel):/.test(h))return;` +
    `try{var abs=new URL(h,document.baseURI).href;` +
    `if(abs.startsWith(O)){e.preventDefault();e.stopImmediatePropagation();pn(abs);}` +
    `else{a.setAttribute('target','_blank');a.setAttribute('rel','noopener');}}catch(er){}},true);` +
    // submit interceptor
    `document.addEventListener('submit',function(e){` +
    `var f=e.target;var action=f.action||location.href;` +
    `try{var abs=new URL(action,document.baseURI).href;` +
    `if(!abs.startsWith(O))return;` +
    `e.preventDefault();e.stopImmediatePropagation();` +
    `var q=new URLSearchParams(new FormData(f)).toString();` +
    `pn(abs+(q?(abs.includes('?')?'&':'?')+q:''));}catch(er){}},true);` +
    // search-box keydown interceptor (hooks input[name=q] to catch Enter before Google's JS)
    `function hs(){document.querySelectorAll('input[name=q]').forEach(function(inp){` +
    `if(inp._ch)return;inp._ch=true;` +
    `inp.addEventListener('keydown',function(e){` +
    `if(e.key==='Enter'||e.keyCode===13){` +
    `e.preventDefault();e.stopImmediatePropagation();` +
    `pn(O+'/search?q='+encodeURIComponent(inp.value));` +
    `}},true);});}` +
    `document.addEventListener('DOMContentLoaded',hs);setTimeout(hs,500);setTimeout(hs,1500);` +
    `}());<\/script>`;

  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const idx = html.indexOf(headMatch[0]) + headMatch[0].length;
    html = html.slice(0, idx) + interceptor + html.slice(idx);
  } else {
    html = interceptor + html;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(html);
}
