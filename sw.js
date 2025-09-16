// Service Worker for James & Oliver's Wedding Site
const CACHE_VERSION = 'v5';
const CACHE_NAME = `james-oliver-wedding-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const urlsToCache = [
  '/',
  '/pages/index.html',
  '/pages/gifts.html',
  '/pages/photos.html',
  '/pages/thankyou.html',
  '/manifest.json',
  '/assets/images/favicon.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/hero-bg.jpg',
  '/assets/images/dress-code-sketch.png',
  '/assets/images/timeline-background.png',
  '/assets/images/dividers/mono-divide.png',
  '/assets/images/dividers/london.png',
  '/assets/images/dividers/wave.png',
  '/assets/images/flourishes/glass-cheers.png',
  '/assets/images/flourishes/lightGreen-coupe.png',
  '/assets/images/monograms/JO_Circle.png',
  '/assets/icons/icon-aperitivo.png',
  '/assets/icons/icon-dinner.png',
  '/assets/icons/icon-toasts.png',
  '/assets/icons/icon-dessert.png',
  '/assets/icons/icon-music.png',
  '/assets/images/arrow-down.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js'
];

// Install event - cache resources and skip waiting
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      // Notify all clients that SW is ready
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
      });
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
  } else if (request.mode === 'navigate') {
    // For HTML navigation requests, use network-first strategy
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page if no cached version
              return caches.match('/pages/index.html');
            });
        })
    );
  } else {
    // For other resources, use cache-first with network fallback
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
                return caches.match('/pages/index.html');
              }
            });
        })
    );
  }
});

// Message event - handle version checks and updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    checkForUpdates().then(hasUpdate => {
      event.ports[0].postMessage({ hasUpdate });
    });
  }
});

// Check for updates by fetching version.json
async function checkForUpdates() {
  try {
    const response = await fetch('/version.json?t=' + Date.now(), {
      cache: 'no-cache'
    });
    if (response.ok) {
      const versionData = await response.json();
      const currentVersion = CACHE_VERSION;
      return versionData.version !== currentVersion;
    }
  } catch (error) {
    console.log('Version check failed:', error);
  }
  return false;
}
