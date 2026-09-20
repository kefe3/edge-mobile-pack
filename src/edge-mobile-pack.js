/**
 * EdgeMobilePack.js (v2.0.0)
 * All-In-One Mobile Compatibility & Offline-First Suite for Modern Web Apps.
 * 
 * Bundles:
 * - EdgeOffline: IndexedDB Outbox, Action Queue, Auto Replay, Status Pill
 * - EdgeMobile: Touch Gestures, Viewport Keyboard Fix, Pull-To-Refresh, Bottom Dock
 * - EdgeTurn: Low-Latency Multi-STUN/TURN WebRTC Accelerator
 * 
 * @license MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./edge-offline', './edge-mobile', './edge-turn-accelerator'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./edge-offline'),
      require('./edge-mobile'),
      require('./edge-turn-accelerator')
    );
  } else {
    root.EdgeMobilePack = factory(root.EdgeOffline, root.EdgeMobile, root.EdgeTurn);
  }
}(typeof self !== 'undefined' ? self : this, function (EdgeOffline, EdgeMobile, EdgeTurn) {
  'use strict';

  return {
    version: '2.0.0',
    Offline: EdgeOffline,
    Mobile: EdgeMobile,
    Turn: EdgeTurn,
    init: function (config = {}) {
      if (config.enablePullToRefresh) {
        EdgeMobile.initPullToRefresh(config.onRefresh);
      }
      if (config.bottomDockItems && config.bottomDockItems.length > 0) {
        EdgeMobile.createBottomDock(config.bottomDockItems);
      }
      console.log('🚀 [EdgeMobilePack v2.0.0] Initialized with Offline & Touch Engine');
      return this;
    }
  };
}));
