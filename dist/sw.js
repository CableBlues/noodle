/**
 * @file sw.js
 * @module ServiceWorker
 * @description
 * Offline-First Service Worker für Noodle Studio.
 * Cached sämtliche App-Shell-Ressourcen (HTML, CSS, JS-Module, lokale Schriftarten und Icons)
 * während der `install`-Phase und beantwortet Navigations- sowie Asset-Anfragen
 * verlässlich auch ohne bestehende Internetverbindung.
 */

const CACHE_NAME = 'noodle-cache-v3446346047';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-radio-news.js',
  './app.bundle.js',
  './data-custom-translations.js',
  './favicon.png',
  './favicon.svg',
  './fonts.css',
  './fonts/caveat-400.ttf',
  './fonts/caveat-700.ttf',
  './fonts/playfair-display-400.ttf',
  './fonts/playfair-display-700.ttf',
  './fonts/plus-jakarta-sans-400.ttf',
  './fonts/plus-jakarta-sans-500.ttf',
  './fonts/plus-jakarta-sans-600.ttf',
  './fonts/plus-jakarta-sans-700.ttf',
  './fonts/space-grotesk-500.ttf',
  './fonts/space-grotesk-700.ttf',
  './icon-192.png',
  './icon-192.svg',
  './icon-512.png',
  './icon-512.svg',
  './logo-banner.png',
  './logo-noodle.png',
  './manifest.json',
  './styles-animations.css',
  './styles-base-1.css',
  './styles-base-2.css',
  './styles-dock.css',
  './styles-hover.css',
  './styles-mobile.css',
  './styles-tailwind.css',
  './vendor/html2canvas.min.js',
  './vendor/lucide.min.js',
  './vendor/qrcode.min.js',
  './vendor/supabase.min.js'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Einige Assets konnten nicht vorab gecacht werden:', err);
      });
    })
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
  // 1. Nur GET-Requests behandeln
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Audio- & Videostreams und Range-Requests direkt an den Browser durchreichen
  if (event.request.destination === 'audio' || event.request.destination === 'video' || event.request.headers.get('range')) {
    return;
  }

  const url = new URL(event.request.url);

  // 3. Externe dynamische Ressourcen (Radio-Streams, Wetter-APIs, RSS-Feeds, Supabase) nicht abfangen
  if (url.origin !== self.location.origin) {
    const ALLOWED_STATIC_CDNS = [
      'cdn.jsdelivr.net',
      'unpkg.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];
    const isStaticCdn = ALLOWED_STATIC_CDNS.some(function(dom) {
      return url.hostname === dom || url.hostname.endsWith('.' + dom);
    });
    if (!isStaticCdn) {
      return;
    }
  }

  // 4. HTML & Navigation: Network-First für sofortige Updates bei Änderungen
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(async () => {
        const fallback = (await caches.match('./index.html')) || (await caches.match(event.request));
        return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
    );
    return;
  }

  // 5. Statische Assets & App-Code: Cache-First für 0ms Ladezeit & Offline-Betrieb
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
      }).catch(async () => {
        if (event.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || new Response('Offline', { status: 503 });
        }
        return new Response('', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
