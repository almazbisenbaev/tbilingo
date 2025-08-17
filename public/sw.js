/**
 * Service Worker for Tbilingo PWA
 * Handles caching of app assets for offline functionality
 * and manages updates to the application
 */

// Dynamic cache name with timestamp to force cache busting
// This ensures users get fresh content when the app updates
const CACHE_VERSION = Date.now().toString();
const CACHE_NAME = `tbilingo-v${CACHE_VERSION}`;

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

/**
 * Install event handler - caches all essential resources when SW is installed
 * This ensures the app can work offline after the first visit
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        // Add all specified URLs to the cache for offline access
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  // This ensures the new service worker activates immediately without waiting
  self.skipWaiting();
});

// Fetch event - implement network-first strategy for HTML pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first strategy for HTML pages and API calls
  if (request.method === 'GET' && 
      (request.headers.get('accept')?.includes('text/html') || 
       url.pathname === '/' || 
       url.pathname.startsWith('/alphabet'))) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request);
        })
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
  }
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

/**
 * Message event handler - listens for messages from the main application
 * Used primarily to handle update notifications and control service worker lifecycle
 */
self.addEventListener('message', (event) => {
  // Handle the SKIP_WAITING message which forces the service worker to activate immediately
  // This is typically sent when the user agrees to update the application
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});