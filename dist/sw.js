const CACHE_NAME = 'noodle-cache-v265';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo-noodle.png',
  './logo-banner.png',
  './favicon.png',
  './favicon.svg',
  './icon-192.png',
  './icon-192.svg',
  './icon-512.png',
  './icon-512.svg',
  './fonts.css',
  './app.bundle.js',
  './fonts/plus-jakarta-sans-400.ttf',
  './fonts/plus-jakarta-sans-500.ttf',
  './fonts/plus-jakarta-sans-600.ttf',
  './fonts/plus-jakarta-sans-700.ttf',
  './fonts/space-grotesk-500.ttf',
  './fonts/space-grotesk-700.ttf',
  './fonts/caveat-400.ttf',
  './fonts/caveat-700.ttf',
  './fonts/playfair-display-400.ttf',
  './fonts/playfair-display-700.ttf',
  './styles-base-1.css',
  './styles-base-2.css',
  './styles-dock.css',
  './styles-hover.css',
  './styles-animations.css',
  './styles-mobile.css',
  './vendor/tailwindcss.js',
  './vendor/lucide.min.js',
  './vendor/supabase.min.js',
  './vendor/qrcode.min.js',
  './vendor/html2canvas.min.js'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Einige Assets konnten nicht vorab gecacht werden:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Sync API & Wetter Aufrufe: Network-First mit Cache-Fallback
  if (url.origin !== self.location.origin && !url.hostname.includes('cdn') && !url.hostname.includes('unpkg') && !url.hostname.includes('fonts')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // HTML & Navigation: Network-First für sofortige Updates bei Änderungen
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => caches.match('./index.html') || caches.match(event.request))
    );
    return;
  }

  // Statische Assets & App-Code: Cache-First für 0ms Ladezeit & Offline-Betrieb
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
