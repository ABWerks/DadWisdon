// Dad Wisdon service worker — caches the app shell and audio clips for offline use.
// Bump CACHE_VERSION whenever you add/change clips so devices pick up the new files.
const CACHE_VERSION = 'dad-wisdon-v3';
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;

  // Network-first for page navigations so the newest app shell shows when
  // online; fall back to cache when offline. This avoids serving a stale
  // index.html after the app is updated.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          return (await caches.match(req, { ignoreSearch: true }))
            || (await caches.match('index.html'))
            || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Cache-first for everything else (audio, icons, json), caching what we fetch.
  event.respondWith(
    (async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(req);
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, response.clone());
        }
        return response;
      } catch (e) {
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
