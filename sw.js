const CACHE = 'kochbuch-v1';
const DATEIEN = ['index.html', 'manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
});

self.addEventListener('fetch', (e) => {
  // Google-/Drive-Anfragen nie aus dem Cache beantworten, nur die App-Huelle
  if (e.request.url.indexOf('googleapis.com') !== -1 || e.request.url.indexOf('accounts.google.com') !== -1) return;
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
