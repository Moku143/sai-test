// 사이 — the home-screen app's offline cache (this site only).
// Pages: from the network first (a new version shows up as soon as there is a connection), the last copy when offline.
// Everything else here (book models, the runtime, OpenCV, icons): from the cache at once, refreshed in the background.
const C = 'sai-sw-1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('sai-sw-') && k !== C) await caches.delete(k);
  await self.clients.claim();
})()));
// Safari refuses a redirected response for a page load: hand back a clean copy
async function clean(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), {status: res.status, statusText: res.statusText, headers: res.headers});
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate' || r.destination === 'document') {
    e.respondWith((async () => {
      const c = await caches.open(C);
      try {
        const res = await clean(await fetch(r.url, {cache: 'no-cache', credentials: 'same-origin'}));
        if (res.ok) await c.put(r.url.split('#')[0], res.clone());
        return res;
      } catch (err) {
        return (await c.match(r.url.split('#')[0], {ignoreSearch: true})) || (await c.match(new URL('./', location.href).href)) ||
          (await c.match(new URL('./index.html', location.href).href)) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(C), hit = await c.match(r);
    const net = fetch(r).then(res => { if (res.ok && res.status === 200 && res.type === 'basic') c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || Response.error();
  })());
});
