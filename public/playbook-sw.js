// Aces Playbook service worker. It exists so the playbook can be installed to a phone's home
// screen (and carry a badge); it never caches anything, plays always come fresh from the server.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) { e.respondWith(fetch(e.request)); });
