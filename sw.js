/* Felsefe Haritası + Efes: ören yerinde internet zayıf olabilir. Önce ağdan dener, olmazsa kayıtlı kopyayı açar. */
var KAYIT = 'felsefe-v7';
var TEMEL = ['/', '/efes', '/ortaklik.js', '/harita-veri.js', '/felsefe-veri.js', '/manifest.webmanifest', '/harita.webmanifest', '/ikon-192.png', '/og-kare.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(KAYIT).then(function(c){ return c.addAll(TEMEL); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== KAYIT; }).map(function(k){ return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.pathname.indexOf('/api/') === 0) return;
  var yazi = u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com';
  if (u.origin !== self.location.origin && !yazi) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if (r && (r.ok || r.type === 'opaque')) { var k = r.clone(); caches.open(KAYIT).then(function(c){ c.put(e.request, k); }); }
      return r;
    }).catch(function(){
      return caches.match(e.request, { ignoreSearch: true }).then(function(m){
        if (m) return m;
        if (e.request.mode === 'navigate') return caches.match(u.pathname.indexOf('/efes') === 0 ? '/efes' : '/');
      });
    })
  );
});
