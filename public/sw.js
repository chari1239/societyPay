
// Basic Service Worker

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Skip waiting to activate new service worker immediately.
  // self.skipWaiting(); // Uncomment if you want to activate new SW immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Optional: Clean up old caches here
  // event.waitUntil(clients.claim()); // Ensure new SW takes control immediately
});

self.addEventListener('fetch', (event) => {
  // For a basic PWA, we don't need complex caching yet.
  // This simply logs the fetch request and lets the browser handle it.
  // More advanced strategies (cache-first, network-first) can be added later for offline support.
  console.log('Service Worker: Fetching ', event.request.url);
  // Fallback to network.
  event.respondWith(fetch(event.request));
});
