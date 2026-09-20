const CACHE = 'kochbuch-v2';
const DATEIEN = ['index.html', 'manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Google-/Drive-Anfragen nie aus dem Cache beantworten, nur die App-Huelle
  if (e.request.url.indexOf('googleapis.com') !== -1 || e.request.url.indexOf('accounts.google.com') !== -1 || e.request.url.indexOf('drive.google.com') !== -1) return;

  // App-Huelle (HTML) immer zuerst aus dem Netz laden, damit neue Rezepte sofort ankommen
  if (e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
