const APP_PREFIX = 'Anytime_budjet_19';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/",
  "/css/styles.css",
  "/js/index.js",
  "/js/idb.js",
  "/index.html",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];
// Respond with cached resources
self.addEventListener('fetch', function (event) {
    console.log('fetch request : ' + event.request.url)
    event.respondWith(
      caches.match(event.request).then(function (request) {
        if (request) { // if cache is available, respond with cache
          console.log('responding with cache : ' + event.request.url)
          return request
        } else {       // if there are no cache, try fetching request
          console.log('file is not cached, fetching : ' + event.request.url)
          return fetch(event.request)
        }
      })
    )
  })

// Install the service worker, cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Activate the service worker and remove old data from the cache
self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches.keys().then((keyList) => {
        let cacheKeeplist = keyList.filter(function (key) {
            return key.indexOf(APP_PREFIX);
          })
          cacheKeeplist.push(CACHE_NAME);

        return Promise.all(
          keyList.map((key, i) => {
            if (cacheKeeplist.indexOf(key) === -1) {
                console.log('deleting cache : ' + keyList[i] );
                return caches.delete(keyList[i]);
              }
          })
        );
      })
    );
  });

