// Service Worker for James & Oliver's Wedding Site
const CACHE_NAME = 'james-oliver-wedding-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

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
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'image') {
    // Cache images with network-first strategy
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else if (request.destination === 'font' || request.destination === 'style') {
    // Cache fonts and styles with cache-first strategy
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(response => {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
  } else {
    // For HTML and other resources, use cache-first with network fallback
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(response => {
              // Don't cache external resources
              if (url.origin === location.origin) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
