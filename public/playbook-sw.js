// Aces Playbook service worker.
// Players: it only makes the playbook installable (home screen + badge). Player pages and all
// play data always come from the server, so nothing of theirs is stored on a phone.
// Coaches: the coach board's page, the court engine, the drill library, the logo and the fonts
// are kept here so the iPad still opens the board with no signal. Its plays come from the
// snapshot the page itself saves (see playbook-admin.html, "offline"). /api is never touched.
var CACHE = 'pb-coach-v1';
var SHELL = ['/playbook-admin.html', '/playbook-court.js', '/playbook-drills.js', '/LM_Logo.png', '/playbook-admin.webmanifest'];
var NET_FIRST = { '/playbook-admin.html': 1, '/playbook-court.js': 1, '/playbook-drills.js': 1, '/LM_Logo.png': 1, '/playbook-admin.webmanifest': 1 };

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return fetch(u, { cache: 'reload' }).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('pb-coach-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// network first (3s), fall back to the copy; keep the copy fresh
function netFirst(req, key) {
  return caches.open(CACHE).then(function (c) {
    var net = fetch(req).then(function (r) { if (r && r.ok && !r.redirected) c.put(key, r.clone()); return r; });
    var timeout = new Promise(function (res) { setTimeout(res, 3000); });
    return Promise.race([net, timeout.then(function () { return c.match(key).then(function (hit) { return hit || net; }); })])
      .catch(function () { return c.match(key); })
      .then(function (r) { return r || net; });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin === self.location.origin) {
    if (u.pathname === '/playbook-admin') {   // the redirect needs the server; offline, open the saved board
      e.respondWith(fetch(req).catch(function () { return caches.match('/playbook-admin.html'); }));
      return;
    }
    if (NET_FIRST[u.pathname]) e.respondWith(netFirst(req, u.pathname));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {   // fonts: keep the first copy
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (hit) { return hit || fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }); });
    }));
  }
});
