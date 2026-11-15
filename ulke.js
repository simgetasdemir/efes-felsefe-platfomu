/* ==========================================================================
   ÜLKE ATLASI sayfası: dil, 3D Mapbox haritası, numaralı işaretler, panel.
   İçerik sayfada hazır (scripts/ulke-sayfa.mjs); panel maddenin kopyasını gösterir.
   WebGL ya da Mapbox yoksa harita gizlenir, liste olduğu gibi kalır.
   ========================================================================== */
(function(){
  var ANAHTAR = 'pk.eyJ1IjoidGFzZGVtaXJzaW1nZSIsImEiOiJjbXdncmQxMjQwa21uMnlyMG12MHFjc2RkIn0.lFcrHH50LqDEmqO_t8FU3Q';
  var SURUM = '3.34.1';
  var LACI = '#14202E', LACI_DERIN = '#0A121C', ALTIN = '#C9A15B';
  var id = document.body.getAttribute('data-ulke'), U = window.ULKE && ULKE[id];
  if (!U) return;
  var Y = U.yerler, kok = document.documentElement, panel = document.getElementById('panel');
  var map = null, isaret = {}, secili = -1;

  /* ---------- dil ---------- */
  function oku(k, v){ try { var x = JSON.parse(localStorage.getItem(k)); return x == null ? v : x; } catch(e){ return v; } }
  function yaz(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var dil = oku('fh-dil', 'en') === 'tr' ? 'tr' : 'en';
  function dilKur(d){
    dil = d; kok.lang = d;
    document.title = U[d].baslik + (d === 'tr' ? ' · Ülke Atlası · Antikyol' : ' · Country Atlas · Antikyol');
    document.querySelectorAll('.dil button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dil') === d); });
    Y.forEach(function(y){ var m = isaret[y.id]; if (m) m.getElement().querySelector('.ad').textContent = y[d].ad; });
  }
  document.querySelectorAll('.dil button').forEach(function(b){ b.addEventListener('click', function(){ yaz('fh-dil', b.getAttribute('data-dil')); dilKur(b.getAttribute('data-dil')); }); });
  dilKur(dil);
  if (window.ORTAKLIK) ORTAKLIK.guncelle(document);

  /* ---------- panel ---------- */
  function ac(i, uc){
    var y = Y[i], madde = y && document.getElementById('yer-' + y.id);
    if (!y || !madde) return;
    secili = i;
    panel.innerHTML = '<button type="button" class="panel-kapat" aria-label="Close">×</button>' + madde.innerHTML +
      '<div class="panel-gez"><button type="button" data-git="-1">‹ <span class="l-en">Previous</span><span class="l-tr" lang="tr">Önceki</span></button>' +
      '<button type="button" data-git="1"><span class="l-en">Next</span><span class="l-tr" lang="tr">Sonraki</span> ›</button></div>';
    panel.hidden = false; panel.scrollTop = 0;
    document.body.classList.add('panel-acik');
    Object.keys(isaret).forEach(function(k){ isaret[k].getElement().classList.toggle('sec', k === y.id); });
    try { history.replaceState(null, '', '#' + y.id); } catch(e){}
    if (map && uc !== false){
      var dar = window.innerWidth < 760;
      map.flyTo({ center: [y.lon, y.lat], zoom: Math.max(map.getZoom(), 8.5), pitch: 55, bearing: -12, essential: true,
        padding: dar ? { top: 0, bottom: Math.round(window.innerHeight * 0.5), left: 0, right: 0 } : { top: 0, bottom: 0, left: 0, right: Math.min(480, window.innerWidth * 0.44) } });
    }
  }
  function kapat(){
    panel.hidden = true; secili = -1; document.body.classList.remove('panel-acik');
    Object.keys(isaret).forEach(function(k){ isaret[k].getElement().classList.remove('sec'); });
    try { history.replaceState(null, '', location.pathname); } catch(e){}
    if (map) tumu();
  }
  panel.addEventListener('click', function(e){
    if (e.target.closest('.panel-kapat')) return kapat();
    var g = e.target.closest('[data-git]');
    if (g) ac((secili + Number(g.getAttribute('data-git')) + Y.length) % Y.length);
  });
  document.addEventListener('keydown', function(e){
    if (panel.hidden) return;
    if (e.key === 'Escape') kapat();
    else if (e.key === 'ArrowRight') ac((secili + 1) % Y.length);
    else if (e.key === 'ArrowLeft') ac((secili - 1 + Y.length) % Y.length);
  });

  /* ---------- harita ---------- */
  function webgl(){ try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; } }
  function haritaYok(){ kok.classList.add('harita-yok'); try { if (map) map.remove(); } catch(e){} map = null; }
  /* harita yoksa #jena gibi adresler listedeki maddeye götürsün */
  function adresMadde(){ var m = document.getElementById('yer-' + decodeURIComponent(location.hash.slice(1))); if (m) m.scrollIntoView(); }
  if (!webgl()){ haritaYok(); return adresMadde(); }

  function sinir(){
    var b = [[180, 90], [-180, -90]];
    Y.forEach(function(y){ b[0][0] = Math.min(b[0][0], y.lon); b[0][1] = Math.min(b[0][1], y.lat); b[1][0] = Math.max(b[1][0], y.lon); b[1][1] = Math.max(b[1][1], y.lat); });
    return b;
  }
  function dolgu(){
    var dar = window.innerWidth < 760;
    return dar ? { top: 90, bottom: 260, left: 40, right: 40 } : { top: 110, bottom: 90, left: Math.min(580, window.innerWidth * 0.44), right: 220 };
  }
  function tumu(){ map.fitBounds(sinir(), { padding: dolgu(), pitch: 35, bearing: 0, maxZoom: 7.5, duration: 1600 }); }

  function stil(){
    var yaziK = ['DIN Pro Medium', 'Arial Unicode MS Regular'];
    return {
      version: 8,
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      sources: {
        sokak: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' },
        ulke: { type: 'vector', url: 'mapbox://mapbox.country-boundaries-v1' },
        dem: { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 },
        golge: { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 }
      },
      terrain: { source: 'dem', exaggeration: 1.5 },
      fog: { color: '#1A2A3D', 'high-color': '#0E1A2A', 'horizon-blend': 0.08, 'space-color': '#060B12', 'star-intensity': 0.35, range: [1.5, 12] },
      layers: [
        { id: 'kara', type: 'background', paint: { 'background-color': '#21334A' } },
        { id: 'su', type: 'fill', source: 'sokak', 'source-layer': 'water', paint: { 'fill-color': LACI_DERIN } },
        { id: 'komsu', type: 'fill', source: 'ulke', 'source-layer': 'country_boundaries',
          filter: ['all', ['!=', ['get', 'iso_3166_1'], U.iso], ['match', ['get', 'worldview'], ['all', 'US'], true, false]],
          paint: { 'fill-color': '#0E1824', 'fill-opacity': 0.6 } },
        { id: 'kabartma', type: 'hillshade', source: 'golge',
          paint: { 'hillshade-shadow-color': '#05090F', 'hillshade-highlight-color': 'rgba(201,161,91,0.5)', 'hillshade-accent-color': '#2A2618', 'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 4, 0.35, 8, 0.6], 'hillshade-illumination-direction': 315 } },
        { id: 'irmak', type: 'line', source: 'sokak', 'source-layer': 'waterway', minzoom: 5, filter: ['==', ['get', 'class'], 'river'],
          paint: { 'line-color': '#2C4A68', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.6] } },
        { id: 'yol', type: 'line', source: 'sokak', 'source-layer': 'road', minzoom: 6.5, filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
          paint: { 'line-color': ALTIN, 'line-opacity': 0.14, 'line-width': ['interpolate', ['linear'], ['zoom'], 6.5, 0.4, 12, 1.5] } },
        { id: 'sinir', type: 'line', source: 'sokak', 'source-layer': 'admin', filter: ['all', ['==', ['get', 'admin_level'], 0], ['==', ['get', 'maritime'], 0], ['match', ['get', 'worldview'], ['all', 'US'], true, false]],
          paint: { 'line-color': ALTIN, 'line-opacity': 0.55, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 9, 1.6] } },
        { id: 'eyalet', type: 'line', source: 'sokak', 'source-layer': 'admin', filter: ['all', ['==', ['get', 'admin_level'], 1], ['==', ['get', 'maritime'], 0], ['==', ['get', 'iso_3166_1'], U.iso]],
          paint: { 'line-color': ALTIN, 'line-opacity': 0.18, 'line-dasharray': [2, 2], 'line-width': 0.8 } },
        { id: 'kent', type: 'symbol', source: 'sokak', 'source-layer': 'place_label', minzoom: 5.5,
          filter: ['all', ['==', ['get', 'iso_3166_1'], U.iso], ['==', ['get', 'class'], 'settlement'], ['<=', ['get', 'symbolrank'], 9]],
          layout: { 'text-field': ['get', 'name'], 'text-font': yaziK, 'text-size': 11, 'text-letter-spacing': 0.06, 'text-optional': true },
          paint: { 'text-color': '#B9AE98', 'text-opacity': 0.7, 'text-halo-color': LACI, 'text-halo-width': 1.2 } }
      ]
    };
  }

  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.css'; document.head.appendChild(css);
  var js = document.createElement('script'); js.src = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.js'; js.async = true;
  js.onload = kur; js.onerror = function(){ haritaYok(); adresMadde(); }; document.head.appendChild(js);

  function kur(){
    if (!window.mapboxgl) return haritaYok();
    mapboxgl.accessToken = ANAHTAR;
    try {
      map = new mapboxgl.Map({ container: 'harita', style: stil(), projection: 'mercator', bounds: sinir(), fitBoundsOptions: { padding: dolgu(), maxZoom: 7.5 },
        pitch: 35, maxPitch: 70, cooperativeGestures: true, attributionControl: false,
        locale: { 'ScrollZoomBlocker.CtrlMessage': dil === 'tr' ? 'Yakınlaştırmak için Ctrl + kaydır' : 'Use ctrl + scroll to zoom', 'ScrollZoomBlocker.CmdMessage': dil === 'tr' ? 'Yakınlaştırmak için ⌘ + kaydır' : 'Use ⌘ + scroll to zoom', 'TouchPanBlocker.Message': dil === 'tr' ? 'Haritayı iki parmakla hareket ettir' : 'Use two fingers to move the map' } });
    } catch(e){ return haritaYok(); }
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    var hazir = false;
    var zaman = setTimeout(function(){ if (!hazir) haritaYok(); }, 30000);
    map.on('error', function(e){ if (!hazir && e && e.error && /40[13]|Unauthorized|Forbidden/i.test(String(e.error.message || e.error.status))) haritaYok(); });
    map.on('load', function(){
      hazir = true; clearTimeout(zaman);
      Y.forEach(function(y, i){
        var yon = y.etiket || 'sag', AN = { sag: ['left', [-15, 0]], sol: ['right', [15, 0]], ust: ['bottom', [0, 15]], alt: ['top', [0, -15]] }[yon];
        var el = document.createElement('button'); el.type = 'button'; el.className = 'isaret e-' + yon;
        el.innerHTML = '<span class="no">' + (i + 1) + '</span><span class="ad"></span>';
        el.querySelector('.ad').textContent = y[dil].ad;
        el.setAttribute('aria-label', (i + 1) + '. ' + y.en.ad);
        el.addEventListener('click', function(e){ e.stopPropagation(); ac(i); });
        isaret[y.id] = new mapboxgl.Marker({ element: el, anchor: AN[0], offset: AN[1] }).setLngLat([y.lon, y.lat]).addTo(map);
      });
      var h = decodeURIComponent(location.hash.slice(1)), k = Y.map(function(y){ return y.id; }).indexOf(h);
      if (k >= 0) ac(k);
    });
  }

  /* listedeki maddeye tıklayınca haritada aç (bağlantılar hariç) */
  document.getElementById('yerler').addEventListener('click', function(e){
    if (!map || e.target.closest('a')) return;
    var m = e.target.closest('.yer'); if (!m) return;
    var i = Y.map(function(y){ return 'yer-' + y.id; }).indexOf(m.id);
    if (i >= 0){ document.getElementById('harita').scrollIntoView({ behavior: 'smooth' }); ac(i); }
  });
})();
