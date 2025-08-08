// Service Worker for James & Oliver's Wedding Site
const CACHE_NAME = 'james-oliver-wedding-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/gifts.html',
  '/photos.html',
  '/thankyou.html',
  '/manifest.json',
  '/images/favicon.png',
  '/images/apple-touch-icon.png',
  '/images/hero-bg.jpg',
  '/images/dress-code-sketch.png',
  '/images/timeline-background.png',
  '/images/dividers/mono-divide.png',
  '/images/dividers/london.png',
  '/images/dividers/wave.png',
  '/images/flourishes/glass-cheers.png',
  '/images/flourishes/lightGreen-coupe.png',
  '/images/monograms/JO_Circle.png',
  '/images/icon-aperitivo.png',
  '/images/icon-dinner.png',
  '/images/icon-toasts.png',
  '/images/icon-dessert.png',
  '/images/icon-music.png',
  '/images/arrow-down.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@600&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
