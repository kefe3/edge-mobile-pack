/**
 * EdgeMobile.js (v2.3.0)
 * Non-intrusive, production-grade mobile utility library for touch devices.
 * Modular swipe gestures, haptic feedback, safe-area insets, container-bound pull-to-refresh,
 * and adaptive bottom navigation dock.
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

  // ── 1. DEVICE CAPABILITIES ──────────────────────────────────────────
  function isTouchDevice() {
    return (
      (typeof window !== 'undefined' && 'ontouchstart' in window) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  }

  // ── 2. SAFE HAPTIC FEEDBACK ─────────────────────────────────────────
  function vibrate(pattern = 15) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  // ── 3. CONTAINER-SCOPED GESTURE RECOGNIZER ──────────────────────────
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
      // Touch events
      this.element.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.startX = e.touches[0].clientX;
          this.startY = e.touches[0].clientY;
          this.startTime = Date.now();
        }
      }, { passive: true });

      this.element.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          this._handleGestureEnd(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY,
            e
          );
        }
      }, { passive: true });

      // Mouse drag emulation for desktop testing
      let isMouseDown = false;
      this.element.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startTime = Date.now();
      });

      window.addEventListener('mouseup', (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        this._handleGestureEnd(e.clientX, e.clientY, e);
      });
    }

    _handleGestureEnd(endX, endY, originalEvent) {
      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;
      const deltaTime = Date.now() - this.startTime;

      // Threshold: > 35px swipe in < 450ms
      if (deltaTime < 450) {
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          const dir = deltaX > 0 ? 'swiperight' : 'swipeleft';
          this._emit(dir, { deltaX, deltaY, originalEvent });
          this._emit('swipe', { direction: dir, deltaX, deltaY, originalEvent });
        } else if (Math.abs(deltaY) > 35 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
          const dir = deltaY > 0 ? 'swipedown' : 'swipeup';
          this._emit(dir, { deltaX, deltaY, originalEvent });
          this._emit('swipe', { direction: dir, deltaX, deltaY, originalEvent });
        }
      }
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
        this.listeners.get(event).forEach(fn => {
          try { fn(data); } catch (e) { console.error('[EdgeMobile:GestureError]', e); }
        });
      }
    }
  }

  function createGestureManager(element) {
    return new GestureManager(element);
  }

  // ── 4. CONTAINER-BOUND PULL-TO-REFRESH ───────────────────────────────
  function enablePullToRefresh(targetContainer, onRefresh) {
    if (!targetContainer) return;
    if (typeof targetContainer === 'function' && !onRefresh) {
      onRefresh = targetContainer;
      targetContainer = document.body;
    }
    const el = typeof targetContainer === 'string' ? document.querySelector(targetContainer) : targetContainer;
    if (!el || typeof onRefresh !== 'function') return;

    let touchStartY = 0;
    let isPulling = false;

    el.addEventListener('touchstart', (e) => {
      if ((el === document.body ? window.scrollY : el.scrollTop) <= 0 && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      if (!isPulling) return;
      isPulling = false;
      const pullDist = e.changedTouches[0].clientY - touchStartY;
      if (pullDist > 75 && (el === document.body ? window.scrollY : el.scrollTop) <= 0) {
        vibrate(25);
        onRefresh();
      }
    }, { passive: true });
  }

  // ── 5. ADAPTIVE MOBILE BOTTOM DOCK ──────────────────────────────────
  function createDock(items = [], options = {}) {
    if (typeof document === 'undefined') return null;
    
    // Remove existing dock if present
    const existing = document.querySelector('.edge-mobile-dock');
    if (existing) existing.remove();

    const dock = document.createElement('nav');
    dock.className = options.className || 'edge-mobile-dock';
    
    items.forEach(item => {
      const btn = document.createElement(item.href ? 'a' : 'button');
      if (item.href) {
        btn.href = item.href;
        if (item.target) btn.target = item.target;
      }
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

    const parent = options.target ? 
      (typeof options.target === 'string' ? document.querySelector(options.target) : options.target) 
      : document.body;
    
    if (parent) {
      parent.appendChild(dock);
    }
    return dock;
  }

  return {
    version: '2.3.0',
    isTouchDevice,
    vibrate,
    GestureManager,
    createGestureManager,
    bindSwipe: (el) => new GestureManager(el),
    enablePullToRefresh,
    initPullToRefresh: enablePullToRefresh,
    createDock,
    createBottomDock: createDock
  };
}));
