const CACHE = 'nutrilent-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for assets, network-first for data
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  // API / Firestore / Workers → network only
  if (e.request.url.includes('/api/') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('workers.dev') ||
      e.request.url.includes('deepseek') ||
      e.request.url.includes('vision.googleapis')) {
    return;
  }

  // Google Fonts → cache-first (they rarely change)
  if (e.request.url.includes('fonts.googleapis.com') ||
      e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // CDN scripts (Chart.js, jsPDF, ZXing) → cache-first
  if (e.request.url.includes('cdn.jsdelivr.net') ||
      e.request.url.includes('cdnjs.cloudflare.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // App assets → stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Notify client when coming back online
self.addEventListener('message', e => {
  if (e.data === 'check-offline') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ offline: !navigator.onLine });
      });
    });
  }
});
