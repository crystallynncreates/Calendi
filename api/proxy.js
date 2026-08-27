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

  // Multi-layer navigation interceptor injected at the top of <head>.
  // All same-origin navigations send postMessage to the parent BrowserWidget,
  // which re-points the iframe src to /api/proxy?url=... so Google stays in-frame.
  const interceptor =
    `<base href="${origin}/"><script>(function(){` +
    `var O='${origin}';` +
    // proxyNav: resolve URL, if same-origin send to parent via postMessage and return true
    `function pn(u){try{var a=new URL(u,document.baseURI).href;` +
    `if(a.startsWith(O)){window.parent.postMessage({calendi:'nav',url:a},'*');return true;}}` +
    `catch(e){}return false;}` +
    // 1. Location.prototype.href setter — catches  location.href = url
    `try{var hd=Object.getOwnPropertyDescriptor(Location.prototype,'href');` +
    `if(hd&&hd.configurable){Object.defineProperty(Location.prototype,'href',` +
    `{get:hd.get,set:function(v){if(!pn(String(v)))hd.set.call(this,v);},configurable:true,enumerable:true});}}catch(e){}` +
    // 2. location.assign — catches  location.assign(url)
    `try{var oa=Location.prototype.assign;Location.prototype.assign=function(v){if(!pn(v))oa.call(this,v);};}catch(e){}` +
    // 3. location.replace — catches  location.replace(url)
    `try{var ore=Location.prototype.replace;Location.prototype.replace=function(v){if(!pn(v))ore.call(this,v);};}catch(e){}` +
    // 4. history.pushState — catches SPA navigation
    `try{var ops=history.pushState;history.pushState=function(s,t,u){if(!u||!pn(String(u)))ops.call(this,s,t,u);};}catch(e){}` +
    // 5. history.replaceState
    `try{var ors=history.replaceState;history.replaceState=function(s,t,u){if(!u||!pn(String(u)))ors.call(this,s,t,u);};}catch(e){}` +
    // 6. capture-phase click interceptor
    `document.addEventListener('click',function(e){` +
    `var a=e.target.closest('a[href]');if(!a)return;` +
    `var h=a.getAttribute('href');if(!h||h[0]==='#'||/^(javascript|mailto|tel):/.test(h))return;` +
    `try{var abs=new URL(h,document.baseURI).href;` +
    `if(abs.startsWith(O)){e.preventDefault();e.stopImmediatePropagation();pn(abs);}` +
    `else{a.setAttribute('target','_blank');a.setAttribute('rel','noopener');}}catch(er){}},true);` +
    // 7. capture-phase submit interceptor
    `document.addEventListener('submit',function(e){` +
    `var f=e.target;var action=f.action||location.href;` +
    `try{var abs=new URL(action,document.baseURI).href;` +
    `e.preventDefault();e.stopImmediatePropagation();` +
    `var q=new URLSearchParams(new FormData(f)).toString();` +
    `pn(abs+(q?(abs.includes('?')?'&':'?')+q:''));}catch(er){}},true);` +
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
