/**
 * Runtime Version Checker (Fallback for non-SW environments)
 * Polls version.json and triggers updates when needed
 */

class VersionChecker {
  constructor() {
    this.currentVersion = null;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.intervalId = null;
    this.isChecking = false;
    
    this.init();
  }

  async init() {
    // Get current version from version.json
    await this.getCurrentVersion();
    
    // Start periodic checking
    this.startChecking();
    
    // Check on page focus
    window.addEventListener('focus', () => {
      this.checkForUpdates();
    });
    
    // Check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  async getCurrentVersion() {
    try {
      const response = await fetch('/version.json?t=' + Date.now(), {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const versionData = await response.json();
        this.currentVersion = versionData.version;
        console.log('Current version:', this.currentVersion);
      }
    } catch (error) {
      console.log('Failed to get current version:', error);
    }
  }

  startChecking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  stopChecking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkForUpdates() {
    if (this.isChecking) return;
    
    this.isChecking = true;
    
    try {
      const response = await fetch('/version.json?t=' + Date.now(), {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const versionData = await response.json();
        
        if (this.currentVersion && versionData.version !== this.currentVersion) {
          console.log('New version detected:', versionData.version);
          this.handleUpdateAvailable(versionData);
        }
      }
    } catch (error) {
      console.log('Version check failed:', error);
    } finally {
      this.isChecking = false;
    }
  }

  handleUpdateAvailable(versionData) {
    // Stop checking to prevent multiple notifications
    this.stopChecking();
    
    // Show update notification
    this.showUpdateNotification(versionData);
  }

  showUpdateNotification(versionData) {
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'version-update-notification';
    notification.innerHTML = `
      <div class="version-update-notification">
        <div class="version-update-content">
          <h3>🔄 Site Updated!</h3>
          <p>A new version of the site is available with improvements and new features.</p>
          <div class="version-update-actions">
            <button id="version-update-now" class="btn-primary">Reload Now</button>
            <button id="version-update-later" class="btn-secondary">Later</button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .version-update-notification {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #778053, #B8375B);
        color: white;
        padding: 16px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      
      .version-update-notification.show {
        transform: translateY(0);
      }
      
      .version-update-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .version-update-content h3 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        font-size: 1.2em;
      }
      
      .version-update-content p {
        margin: 0;
        opacity: 0.9;
      }
      
      .version-update-actions {
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
        color: #778053;
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
        .version-update-content {
          flex-direction: column;
          text-align: center;
        }
        
        .version-update-actions {
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
    document.getElementById('version-update-now').addEventListener('click', () => {
      this.applyUpdate();
    });

    document.getElementById('version-update-later').addEventListener('click', () => {
      this.hideUpdateNotification();
    });

    // Auto-hide after 30 seconds
    setTimeout(() => {
      this.hideUpdateNotification();
    }, 30000);
  }

  hideUpdateNotification() {
    const notification = document.getElementById('version-update-notification');
    if (notification) {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
    
    // Resume checking after hiding
    this.startChecking();
  }

  applyUpdate() {
    // Force reload with cache bypass
    window.location.reload(true);
  }
}

// Initialize version checker if service worker is not available
if (!('serviceWorker' in navigator)) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new VersionChecker();
    });
  } else {
    new VersionChecker();
  }
}
