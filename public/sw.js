const CACHE_NAME = 'tbilingo-v1';
const urlsToCache = [
  '/',
  '/alphabet',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/audio/ani.mp3',
  '/audio/bani.mp3',
  '/audio/chari.mp3',
  '/audio/chini.mp3',
  '/audio/doni.mp3',
  '/audio/dzili.mp3',
  '/audio/eni.mp3',
  '/audio/gani.mp3',
  '/audio/ghani.mp3',
  '/audio/hae.mp3',
  '/audio/ini.mp3',
  '/audio/jani.mp3',
  '/audio/kani.mp3',
  '/audio/kari.mp3',
  '/audio/khani.mp3',
  '/audio/lasi.mp3',
  '/audio/mani.mp3',
  '/audio/nari.mp3',
  '/audio/oni.mp3',
  '/audio/pari.mp3',
  '/audio/phari.mp3',
  '/audio/qari.mp3',
  '/audio/rae.mp3',
  '/audio/sani.mp3',
  '/audio/shini.mp3',
  '/audio/tani.mp3',
  '/audio/tari.mp3',
  '/audio/tsani.mp3',
  '/audio/tsili.mp3',
  '/audio/uni.mp3',
  '/audio/vini.mp3',
  '/audio/zeni.mp3',
  '/audio/zhani.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 