/**
 * EdgeMobile.js (v2.2.0)
 * Non-intrusive, production-grade mobile utility library for touch devices.
 * Modular swipe gestures, haptic feedback, safe-area insets, and container-bound pull-to-refresh.
 * 
 * Part of Origin Edge Ecosystem.
 * @license MIT
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EdgeMobile = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. Device Capabilities
  function isTouchDevice() {
    return (
      (typeof window !== 'undefined' && 'ontouchstart' in window) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  }

  // 2. Safe Haptic Feedback
  function vibrate(pattern = 15) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  // 3. Container-Scoped Gesture Recognizer
  class GestureManager {
    constructor(element) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      this.startX = 0;
      this.startY = 0;
      this.startTime = 0;
      this.listeners = new Map();

      if (this.element) {
        this._bindEvents();
      }
    }

    _bindEvents() {
      this.element.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.startX = e.touches[0].clientX;
          this.startY = e.touches[0].clientY;
          this.startTime = Date.now();
        }
      }, { passive: true });

      this.element.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - this.startX;
          const deltaY = e.changedTouches[0].clientY - this.startY;
          const deltaTime = Date.now() - this.startTime;

          // Threshold: > 45px swipe in < 350ms
          if (deltaTime < 350) {
            if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
              const dir = deltaX > 0 ? 'swiperight' : 'swipeleft';
              this._emit(dir, { deltaX, deltaY, originalEvent: e });
            } else if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
              const dir = deltaY > 0 ? 'swipedown' : 'swipeup';
              this._emit(dir, { deltaX, deltaY, originalEvent: e });
            }
          }
        }
      }, { passive: true });
    }

    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.listeners.has(event)) {
        this.listeners.set(event, this.listeners.get(event).filter(fn => fn !== callback));
      }
    }

    _emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(fn => fn(data));
      }
    }
  }

  // 4. Container-Bound Opt-In Pull-to-Refresh
  function enablePullToRefresh(targetContainer, onRefresh) {
    if (!targetContainer || typeof onRefresh !== 'function') return;
    const el = typeof targetContainer === 'string' ? document.querySelector(targetContainer) : targetContainer;
    if (!el) return;

    let touchStartY = 0;
    let isPulling = false;

    el.addEventListener('touchstart', (e) => {
      if (el.scrollTop <= 0 && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      if (!isPulling) return;
      isPulling = false;
      const pullDist = e.changedTouches[0].clientY - touchStartY;
      if (pullDist > 80 && el.scrollTop <= 0) {
        vibrate(20);
        onRefresh();
      }
    }, { passive: true });
  }

  // 5. Safe Dock Builder
  function createDock(items = [], options = {}) {
    const dock = document.createElement('nav');
    dock.className = options.className || 'edge-mobile-dock';
    
    items.forEach(item => {
      const btn = document.createElement(item.href ? 'a' : 'button');
      if (item.href) btn.href = item.href;
      btn.className = 'edge-dock-item' + (item.active ? ' active' : '');
      btn.innerHTML = `
        <span class="edge-dock-icon">${item.icon || ''}</span>
        <span class="edge-dock-label">${item.label || ''}</span>
      `;
      btn.addEventListener('click', (e) => {
        vibrate(10);
        if (item.onClick) item.onClick(e);
      });
      dock.appendChild(btn);
    });

    if (options.target) {
      const parent = typeof options.target === 'string' ? document.querySelector(options.target) : options.target;
      if (parent) parent.appendChild(dock);
    }
    return dock;
  }

  return {
    version: '2.2.0',
    isTouchDevice,
    vibrate,
    GestureManager,
    bindSwipe: (el) => new GestureManager(el),
    enablePullToRefresh,
    createDock
  };
}));
