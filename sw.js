// Dad Wisdom service worker — caches the app shell and audio clips for offline use.
// Bump CACHE_VERSION whenever you add/change clips so devices pick up the new files.
const CACHE_VERSION = 'dad-wisdom-v1';
const APP_SHELL = [
  '.',
  'index.html',
  'clips.json',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(APP_SHELL);
      // Also pre-cache every audio clip listed in clips.json
      try {
        const res = await fetch('clips.json');
        const data = await res.json();
        const files = (data.clips || []).map(c => c.file).filter(Boolean);
        await Promise.all(
          files.map(f => cache.add(f).catch(() => {})) // skip missing files
        );
      } catch (e) { /* clips.json missing/invalid — shell still works */ }
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

// Cache-first, falling back to network (and caching what we fetch).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (e) {
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
