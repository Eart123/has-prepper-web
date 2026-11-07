// Service Worker for HAS Prepper Disk PWA
const CACHE_NAME = 'has-prepper-v1';
const STATIC_CACHE = 'has-prepper-static-v1';
const DYNAMIC_CACHE = 'has-prepper-dynamic-v1';
const ZIM_CACHE = 'has-prepper-zim-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/emergency',
  '/library',
  '/settings',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== ZIM_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle ZIM files - cache them separately
  if (url.pathname.endsWith('.zim') || url.pathname.includes('/zim/')) {
    event.respondWith(handleZIMRequest(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets and navigation
  event.respondWith(handleStaticRequest(request));
});

// Handle static assets and navigation requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) return offlineResponse;
    }

    // Return a generic offline response
    return new Response('Çevrimdışı - İçerik yüklenemedi', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// Handle ZIM file requests - these are large, so we stream them
async function handleZIMRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Only cache if it's a reasonable size (< 100MB)
    const contentLength = networkResponse.headers.get('content-length');
    if (networkResponse.ok && contentLength && parseInt(contentLength) < 100 * 1024 * 1024) {
      const cache = await caches.open(ZIM_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return new Response('ZIM dosyası çevrimdışı erişilemiyor', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// Handle API requests - network first, then cache
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Çevrimdışı' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Background sync for pending operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-zim-files') {
    event.waitUntil(syncZIMFiles());
  }
});

async function syncZIMFiles() {
  // This would sync any pending ZIM file operations
  // For now, just log
  console.log('[SW] Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'clearCache') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}