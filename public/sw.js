const CACHE_NAME = 'lista-passageiros-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1042/1042263.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (except icons/fonts we explicitly want)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('flaticon.com')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Update cache with new response
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // If we have a cached response, return it immediately
        if (cachedResponse) {
          // Catch potential network errors (offline) to prevent unhandled rejections
          fetchPromise.catch(err => {
            console.log('Background fetch failed (offline):', err);
          });
          return cachedResponse;
        }

        // If no cache, return the network response
        return fetchPromise;
      });
    })
  );
});
