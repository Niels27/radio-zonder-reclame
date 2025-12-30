// utils/toastNotifications.js - Toast notification system

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.initializeContainer();
  }

  initializeContainer() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {object} options - { type: 'success'|'info'|'warning'|'error', duration: number in ms }
   */
  show(message, options = {}) {
    const {
      type = 'info',
      duration = 3000
    } = options;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon based on type
    const icons = {
      success: '✓',
      info: 'ℹ',
      warning: '⚠',
      error: '✕'
    };

    const icon = icons[type] || icons.info;

    // Color based on type
    const colors = {
      success: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    const color = colors[type] || colors.info;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          flex-shrink: 0;
        ">${icon}</div>
        <div style="flex: 1; font-size: 14px; font-weight: 500;">${message}</div>
      </div>
    `;

    toast.style.cssText = `
      background: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid #374151;
      min-width: 300px;
      max-width: 400px;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Add to container
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(toast);
    }, duration);

    return toast;
  }

  /**
   * Remove a toast
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    // Fade out animation
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Remove from array
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.toasts.forEach(toast => this.remove(toast));
  }

  /**
   * Convenience methods
   */
  success(message, duration = 3000) {
    return this.show(message, { type: 'success', duration });
  }

  info(message, duration = 3000) {
    return this.show(message, { type: 'info', duration });
  }

  warning(message, duration = 3000) {
    return this.show(message, { type: 'warning', duration });
  }

  error(message, duration = 3000) {
    return this.show(message, { type: 'error', duration });
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export convenience functions
export const showToast = (message, options) => toastManager.show(message, options);
export const toast = {
  success: (message, duration) => toastManager.success(message, duration),
  info: (message, duration) => toastManager.info(message, duration),
  warning: (message, duration) => toastManager.warning(message, duration),
  error: (message, duration) => toastManager.error(message, duration),
  clear: () => toastManager.clearAll()
};

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.toast = toast;
}

export default toast;
