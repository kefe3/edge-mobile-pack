# 🚀 Edge Mobile Pack (`edge-mobile-pack`)

> **Enterprise Mobile Compatibility, Low-Latency WebRTC STUN/TURN & Offline-First Background Sync Suite for Modern Web Applications.**
> *Mobil Uyumluluk, Düşük Gecikmeli WebRTC Multi-STUN/TURN ve Çevrimdışı (Offline-First) Senkronizasyon Paketi.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-indigo.svg)](package.json)
[![Zero Dependency](https://img.shields.io/badge/dependencies-0-emerald.svg)](package.json)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25-purple.svg)](examples/pwa-service-worker.js)

---

## 🌟 Features / Öne Çıkan Özellikler

### 1. 📶 **EdgeOffline (`src/edge-offline.js`)**
* **IndexedDB Outbox Queue:** When offline, user actions (form submits, email drafts, settings, API calls) are queued safely with prioritization (`HIGH`, `NORMAL`, `LOW`) and timestamping.
* **Automatic Replay & Exponential Backoff:** As soon as internet connectivity returns, queued actions are automatically executed and synced with the backend.
* **Network Quality Estimator:** Real-time detection of connection type (4G, 3G, 2G, slow-2g), RTT latency, and downlink speed.
* **Glassmorphism Status Badge:** Customizable floating status pill showing offline state and pending item count.

### 2. 📱 **EdgeMobile (`src/edge-mobile.js`)**
* **Touch Gesture Engine:** Fast swipe (`swipeleft`, `swiperight`, `swipeup`, `swipedown`), pinch, and pull-to-refresh recognizers.
* **Virtual Keyboard Fix:** Eliminates viewport jumping and input scrolling bugs on iOS Safari & Android Chrome.
* **Mobile Bottom Dock:** Sleek glassmorphism thumb-friendly navigation bar for phones (`<=768px`).
* **Haptic Feedback:** Native vibration triggers for tap interactions (`navigator.vibrate`).
* **Safe-Area Inset Support:** CSS variables for iPhone Notch, Dynamic Island, and home indicators.

### 3. ⚡ **EdgeTurn (`src/edge-turn-accelerator.js`)**
* **Multi-Node STUN/TURN Pool:** Integrated with Google, Cloudflare, Mozilla, and Twilio global STUN nodes.
* **Max-Bundle ICE Acceleration:** Pre-gathers 10 ICE candidate pools, cutting mobile CGNAT & cellular connection negotiation from >3s to **<150ms**.
* **Live P2P Ping/RTT Estimator:** Real-time roundtrip latency heartbeat over WebRTC data channels.

---

## 📦 Quick Start / Hızlı Başlangıç

### Via CDN / Script Tags:
```html
<!-- CSS (Safe Area, Touch & Animations) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kefe3/edge-mobile-pack@main/src/edge-mobile-pack.css">

<!-- JS Modules -->
<script src="https://cdn.jsdelivr.net/gh/kefe3/edge-mobile-pack@main/src/edge-offline.js"></script>
<script src="https://cdn.jsdelivr.net/gh/kefe3/edge-mobile-pack@main/src/edge-mobile.js"></script>
<script src="https://cdn.jsdelivr.net/gh/kefe3/edge-mobile-pack@main/src/edge-turn-accelerator.js"></script>
<script src="https://cdn.jsdelivr.net/gh/kefe3/edge-mobile-pack@main/src/edge-mobile-pack.js"></script>
```

---

## 💻 Usage Examples / Kullanım Örnekleri

### 1. Offline Action Queue (Çevrimdışı Kuyruk & Senkronizasyon):
```javascript
// 1. Register handler for action
EdgeOffline.registerHandler('SEND_MESSAGE', async (payload) => {
  return await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
});

// 2. Enqueue action (Works offline & online!)
await EdgeOffline.enqueue('SEND_MESSAGE', {
  recipient: 'user@oedge.xyz',
  text: 'Hello from offline mode!',
  priority: 'HIGH'
});
```

### 2. Touch Gestures & Mobile Bottom Dock:
```javascript
// Initialize Mobile Pack with Pull-to-Refresh and Bottom Dock
EdgeMobilePack.init({
  enablePullToRefresh: true,
  bottomDockItems: [
    { icon: '🏠', label: 'Ana Sayfa', href: '/' },
    { icon: '🛠️', label: 'Araçlar', href: '/tools' },
    { icon: '✉️', label: 'Mesajlar', href: '/mail' },
    { icon: '⚙️', label: 'Ayarlar', onClick: () => openSettings() }
  ]
});

// Swipe detection
const gestures = EdgeMobile.createGestureManager(document.getElementById('card'));
gestures.on('swiperight', () => console.log('Swiped Right!'));
gestures.on('swipeleft', () => console.log('Swiped Left!'));
```

### 3. WebRTC Low-Latency P2P Accelerator:
```javascript
const accelerator = EdgeTurn.createAccelerator({
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle'
});

const peerConnection = accelerator.createPeer(true); // true = initiator

accelerator.on('latency', (rttMs) => {
  console.log(`Live P2P Latency: ${rttMs} ms`);
});
```

---

## 📂 Project Structure / Proje Yapısı

```
edge-mobile-pack/
├── src/
│   ├── edge-offline.js          # IndexedDB Outbox, Sync Queue & Network Quality
│   ├── edge-mobile.js           # Touch Gestures, Viewport Keyboard Fix & Bottom Dock
│   ├── edge-turn-accelerator.js # WebRTC Low-Latency Multi-STUN/TURN Engine
│   ├── edge-mobile-pack.js      # All-in-one unified suite entry point
│   └── edge-mobile-pack.css     # Safe-area padding, Glassmorphism & Touch styles
├── examples/
│   ├── index.html               # Live Interactive Playground Demo
│   └── pwa-service-worker.js    # Ready-to-use PWA Service Worker
├── package.json
└── README.md
```

---

## 📄 License

MIT License © 2026 Origin Edge & kefe3.
Bu kütüphane açık kaynaklı olup ticari ve bireysel tüm projelerde özgürce kullanılabilir.
