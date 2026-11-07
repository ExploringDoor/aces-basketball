// Aces Playbook service worker. It exists so the playbook can be installed to a phone's home
// screen (and carry a badge). It caches nothing and does not touch requests: plays always come
// fresh from the server, and the coach's clip uploads never pass through it.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
