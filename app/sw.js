const CACHE_NAME = 'my-site-cache-v2';
const resources = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/js/main.bundle.js',
  '/js/restaurant_info.bundle.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache!')
        return cache.addAll(resources)
      })
      .catch(error => console.error('Error in open cache. Reason:', error))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        }

        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then(response => {
          const responseToCache = response.clone();

          if (event.request.url.endsWith('.jpg')) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache))
          }

          return response
        })
      }).catch(error => console.error('Error in match cache. Reason:', error))
  )
})

self.addEventListener('activate', event => {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => (cacheWhitelist.indexOf(cacheName) === -1) && caches.delete(cacheName)))
    ))
})