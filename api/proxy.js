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

  // Navigation interceptor injected at top of <head>. Three layers:
  //
  // 1. window.navigation API (Chrome 102+) — fires BEFORE any navigation and gives the
  //    destination URL. We intercept same-origin destinations via postMessage so the
  //    parent BrowserWidget can remount the iframe with the proxied URL instead.
  //    For interceptable (same-document) navigations we call e.intercept(); for
  //    cross-document ones we just postMessage — the parent remounts the iframe before
  //    the blocked google.com response arrives.
  //
  // 2. Broad capture-phase keydown — catches Enter on ANY input/textarea/contenteditable/
  //    role=searchbox element. Google's new AI search interface uses a contenteditable
  //    div, not input[name=q], so the hook must be element-agnostic.
  //
  // 3. Capture-phase click + submit — catches <a> links and traditional form posts.
  //    External links get target=_blank.
  const interceptor =
    `<base href="${origin}/"><script>(function(){` +
    `var O='${origin}';` +
    // pn: resolve u against the base URL; if it's a real same-origin destination send
    // it to the parent via postMessage. Guard against the double-proxy trap: because
    // <base href> is set to the proxied origin, Google's history.replaceState calls that
    // pass the current proxy path (/api/proxy?url=...) as a relative URL resolve to
    // <proxied-origin>/api/proxy?url=..., which looks like a same-origin URL but is
    // actually the proxy path. We detect this by checking if the resolved path starts
    // with /api/ and bail out.
    `function pn(u){try{var a=new URL(u,document.baseURI).href;` +
    `if(!a.startsWith(O))return false;` +
    `if(new URL(a).pathname.indexOf('/api/')===0)return false;` +
    `window.parent.postMessage({calendi:'nav',url:a},'*');return true;}` +
    `catch(e){}return false;}` +
    // 1. Navigation API — broadest net, catches location.href / pushState / form / link
    `try{if(window.navigation){` +
    `window.navigation.addEventListener('navigate',function(e){` +
    `try{var abs=new URL(e.destination.url,document.baseURI).href;` +
    `if(!abs.startsWith(O))return;` +
    `if(new URL(abs).pathname.indexOf('/api/')===0)return;` +
    `if(e.canIntercept){e.intercept({handler:function(){` +
    `window.parent.postMessage({calendi:'nav',url:abs},'*');` +
    `return new Promise(function(res){setTimeout(res,5000);});` +
    `}});}else{window.parent.postMessage({calendi:'nav',url:abs},'*');}` +
    `}catch(er){}},{capture:true});}}catch(e){}` +
    // 2. Broad keydown Enter — any text input/textarea/contenteditable/role=searchbox
    `document.addEventListener('keydown',function(e){` +
    `if(e.key!=='Enter'&&e.keyCode!==13)return;` +
    `var el=e.target,tag=el.tagName,role=(el.getAttribute('role')||'').toLowerCase(),ce=el.contentEditable;` +
    `if(tag==='INPUT'||tag==='TEXTAREA'||ce==='true'||role==='textbox'||role==='combobox'||role==='searchbox'){` +
    `var val=(el.value||el.innerText||el.textContent||'').trim();` +
    `if(val){e.preventDefault();e.stopImmediatePropagation();` +
    `pn(O+'/search?q='+encodeURIComponent(val));}}},true);` +
    // 3a. click interceptor
    `document.addEventListener('click',function(e){` +
    `var a=e.target.closest('a[href]');if(!a)return;` +
    `var h=a.getAttribute('href');if(!h||h[0]==='#'||/^(javascript|mailto|tel):/.test(h))return;` +
    `try{var abs=new URL(h,document.baseURI).href;` +
    `if(abs.startsWith(O)){e.preventDefault();e.stopImmediatePropagation();pn(abs);}` +
    `else{a.setAttribute('target','_blank');a.setAttribute('rel','noopener');}}catch(er){}},true);` +
    // 3b. submit interceptor
    `document.addEventListener('submit',function(e){` +
    `var f=e.target;var action=f.action||location.href;` +
    `try{var abs=new URL(action,document.baseURI).href;` +
    `if(!abs.startsWith(O))return;` +
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
