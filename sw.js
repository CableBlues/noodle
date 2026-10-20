/**
 * @file sw.js
 * @module ServiceWorker
 * @description
 * Offline-First Service Worker für Noodle Studio.
 * Cached sämtliche App-Shell-Ressourcen (HTML, CSS, JS-Module, lokale Schriftarten und Icons)
 * während der `install`-Phase und beantwortet Navigations- sowie Asset-Anfragen
 * verlässlich auch ohne bestehende Internetverbindung.
 */

const CACHE_NAME = 'noodle-cache-v2361831097';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app-alarm.js',
  './app-backup.js',
  './app-command-palette.js',
  './app-cooking.js',
  './app-core.js',
  './app-dice.js',
  './app-feature-bridge.js',
  './app-feedback.js',
  './app-health.js',
  './app-humor.js',
  './app-installation-hub.js',
  './app-interaction-mode.js',
  './app-multitasking-hub.js',
  './app-radio-news.js',
  './app-regulation.js',
  './app-reports.js',
  './app-routine-presets.js',
  './app-shopping.js',
  './app-social.js',
  './app-tasks.js',
  './app-tooltip.js',
  './app-weather-news.js',
  './app.bundle.js',
  './audio-core.js',
  './audio-generators.js',
  './audio-player.js',
  './audio-scheduler-1.js',
  './audio-scheduler-2.js',
  './audio-scheduler-3.js',
  './auth-engine.js',
  './collab-engine.js',
  './config.js',
  './crypto-sync.js',
  './data-custom-translations.js',
  './data-extras.js',
  './data-tasks-steps-1.js',
  './data-tasks-steps-2.js',
  './data-tasks-steps-3.js',
  './data-tasks.js',
  './data-translations-1.js',
  './data-translations-2.js',
  './data-translations.js',
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
  './helper-brainstorm.js',
  './helper-clarity.js',
  './helper-cleaning.js',
  './helper-core-2.js',
  './helper-core-data.js',
  './helper-core.js',
  './helper-learning.js',
  './helper-ocr-scanner.js',
  './icon-192.png',
  './icon-192.svg',
  './icon-512.png',
  './icon-512.svg',
  './logo-banner.png',
  './logo-noodle.png',
  './main.js',
  './manifest.json',
  './monetization.js',
  './onboarding.js',
  './sport.js',
  './state.js',
  './storage.js',
  './styles-animations.css',
  './styles-base-1.css',
  './styles-base-2.css',
  './styles-dock.css',
  './styles-hover.css',
  './styles-mobile.css',
  './styles-tailwind.css',
  './sync-engine.js',
  './timer-1.js',
  './timer-2.js',
  './timer-3.js',
  './utils-2.js',
  './utils-data.js',
  './utils.js',
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
