// Cache Invalidation Helper for James & Oliver's Wedding Site
// This script helps manage cache versions and provides utilities for cache busting

class CacheManager {
  constructor() {
    this.version = 'v4';
    this.timestamp = Date.now();
  }

  // Generate a cache-busting parameter
  getCacheBuster() {
    return `?v=${this.version}&t=${this.timestamp}`;
  }

  // Update service worker cache version
  updateServiceWorkerVersion() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }
  }

  // Clear all caches
  async clearAllCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  // Force reload with cache bypass
  forceReload() {
    window.location.reload(true);
  }

  // Add cache-busting parameters to URLs
  addCacheBuster(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${this.version}`;
  }

  // Monitor cache status
  async getCacheStatus() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheInfo = {};
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      }
      
      return cacheInfo;
    }
    return null;
  }
}

// Initialize cache manager
const cacheManager = new CacheManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CacheManager;
} else {
  window.CacheManager = CacheManager;
  window.cacheManager = cacheManager;
}

// Auto-update service worker on page load
document.addEventListener('DOMContentLoaded', () => {
  cacheManager.updateServiceWorkerVersion();
});

// Provide cache management functions in console
console.log('Cache Manager loaded. Use cacheManager.clearAllCaches() to clear caches.');
console.log('Current version:', cacheManager.version);
