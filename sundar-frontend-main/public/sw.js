// Simple service worker to prevent fetch errors
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle fetch events gracefully
self.addEventListener('fetch', (event) => {
  // For API requests, let them go through to the network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(error => {
        // Return error response for API failures
        return new Response(JSON.stringify({ error: 'API request failed' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For static assets, try cache first then network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available, otherwise fetch from network
      return cachedResponse || fetch(event.request).catch(() => {
        // Return a basic response for failed requests
        return new Response('Offline', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});