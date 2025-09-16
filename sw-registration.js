/**
 * Service Worker Registration with Update Handling
 * Handles SW lifecycle and notifies users of updates
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
        
        this.setupEventListeners();
        this.startVersionChecking();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  setupEventListeners() {
    // Listen for service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      console.log('New service worker found');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available
          this.showUpdateNotification();
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SW_ACTIVATED') {
        console.log('Service Worker activated with version:', event.data.version);
        this.hideUpdateNotification();
      }
    });

    // Handle service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      // Reload the page to get the latest content
      window.location.reload();
    });
  }

  startVersionChecking() {
    // Check for updates every 5 minutes
    setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);

    // Also check on page focus
    window.addEventListener('focus', () => {
      this.checkForUpdates();
    });
  }

  async checkForUpdates() {
    if (this.registration && this.registration.active) {
      try {
        const hasUpdate = await this.checkVersionWithSW();
        if (hasUpdate && !this.updateAvailable) {
          this.showUpdateNotification();
        }
      } catch (error) {
        console.log('Version check failed:', error);
      }
    }
  }

  checkVersionWithSW() {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.hasUpdate);
      };

      if (this.registration.active) {
        this.registration.active.postMessage(
          { type: 'CHECK_VERSION' },
          [messageChannel.port2]
        );
      } else {
        resolve(false);
      }
    });
  }

  showUpdateNotification() {
    this.updateAvailable = true;
    
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification">
        <div class="update-content">
          <h3>🎉 New Version Available!</h3>
          <p>We've updated the site with new features and improvements.</p>
          <div class="update-actions">
            <button id="update-now" class="btn-primary">Update Now</button>
            <button id="update-later" class="btn-secondary">Later</button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .update-notification {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #B8375B, #778053);
        color: white;
        padding: 16px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      
      .update-notification.show {
        transform: translateY(0);
      }
      
      .update-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .update-content h3 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        font-size: 1.2em;
      }
      
      .update-content p {
        margin: 0;
        opacity: 0.9;
      }
      
      .update-actions {
        display: flex;
        gap: 12px;
      }
      
      .btn-primary, .btn-secondary {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: white;
        color: #B8375B;
      }
      
      .btn-primary:hover {
        background: #f8f8f8;
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .btn-secondary:hover {
        background: rgba(255,255,255,0.1);
      }
      
      @media (max-width: 768px) {
        .update-content {
          flex-direction: column;
          text-align: center;
        }
        
        .update-actions {
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Add event listeners
    document.getElementById('update-now').addEventListener('click', () => {
      this.applyUpdate();
    });

    document.getElementById('update-later').addEventListener('click', () => {
      this.hideUpdateNotification();
    });

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (this.updateAvailable) {
        this.hideUpdateNotification();
      }
    }, 30000);
  }

  hideUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
    this.updateAvailable = false;
  }

  applyUpdate() {
    if (this.registration && this.registration.waiting) {
      // Tell the waiting service worker to skip waiting and activate
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ServiceWorkerManager();
  });
} else {
  new ServiceWorkerManager();
}
