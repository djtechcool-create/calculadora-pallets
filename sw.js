const CACHE = 'pallet-calc-v4';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ARCHIVOS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  const req = e.request;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (net) {
        const copia = net.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copia); });
        return net;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (res) {
      return res || fetch(req).then(function (net) {
        const copia = net.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copia); });
        return net;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
