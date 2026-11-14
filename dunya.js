/* ==========================================================================
   DÜNYA FELSEFE ROTASI (/world): Mapbox GL küre, 29 durak, beş çağ.
   Veri: dunya-veri.js (metinler), dunya-foto.js (Commons fotoğrafları).
   WebGL ya da Mapbox yoksa küre gizlenir; sayfadaki okuma bölümü yine çalışır.
   ========================================================================== */
(function(){
  var ANAHTAR = 'pk.eyJ1IjoidGFzZGVtaXJzaW1nZSIsImEiOiJjbXdncmQxMjQwa21uMnlyMG12MHFjc2RkIn0.lFcrHH50LqDEmqO_t8FU3Q';
  var SURUM = '3.34.1';
  var V = window.DUNYA, F = window.DUNYA_FOTO || {};
  var CAG = {}; V.caglar.forEach(function(c, i){ c.no = i; CAG[c.id] = c; });
  var DURAK = V.duraklar, SIRA = {}; DURAK.forEach(function(d, i){ SIRA[d.id] = i; });

  function oku(k, v){ try { var x = JSON.parse(localStorage.getItem(k)); return x == null ? v : x; } catch(e){ return v; } }
  function yaz(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var dil = oku('fh-dil', 'en'); if (dil !== 'tr') dil = 'en';
  var hareket = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(s){ return document.querySelector(s); }
  function h(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function d(x){ return x[dil]; }

  var T = {
    en: { etiket: 'ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ', baslik: 'World Philosophy Route', alt: 'From Miletus to Kyoto: 2,600 years of thought in 29 places', giris: 'Philosophy began on the Anatolian coast, but it was never only Greek. Follow the questions as they travel: to India and China, through the houses of wisdom of Baghdad and Córdoba, to Timbuktu, Isfahan and Mexico, and on to Königsberg and Kyoto.',
      basla: 'Begin the journey', oku: 'Read the route', durak: 'Stop', fikir: 'Key idea', dusun: 'Think', kaynak: 'Read further', arslan: 'In Turkish: Ahmet Arslan, İlkçağ Felsefe Tarihi (İstanbul Bilgi University Press)', arslanCilt: { 1: 'the volume on the Presocratics', 2: 'the volumes on Socrates, Plato and Aristotle', 4: 'the volume on Hellenistic philosophy' },
      yer: 'Visit this place in Türkiye', bag: 'Related place in Türkiye', onceki: 'Previous', sonraki: 'Next', kapat: 'Close', kurede: 'Show on the globe', bitis: 'Back to the start', tumu: 'Whole world', foto: 'Photo', bolumH: 'The route, era by era', bolumAlt: 'Each stop is a short, sourced entry. Summaries are written for this site from the Stanford Encyclopedia of Philosophy and the other linked sources.', kurePasif: 'The 3D globe needs WebGL. The whole route is below.', ipucu: 'Drag to turn the globe', turkiye: 'Philosophy Map of Türkiye', fotoH: 'Photo credits', nav: ['Türkiye', 'World route', 'Places', 'Passport'] },
    tr: { etiket: 'ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ', baslik: 'Dünya Felsefe Rotası', alt: 'Milet\'ten Kyoto\'ya: 29 yerde 2.600 yıllık düşünce', giris: 'Felsefe Anadolu kıyısında başladı ama hiçbir zaman yalnız Yunan değildi. Soruların yolculuğunu izle: Hindistan\'a ve Çin\'e, Bağdat\'ın ve Kurtuba\'nın hikmet evlerinden Timbuktu\'ya, İsfahan\'a ve Meksika\'ya, oradan Königsberg\'e ve Kyoto\'ya.',
      basla: 'Yolculuğa başla', oku: 'Rotayı oku', durak: 'Durak', fikir: 'Ana fikir', dusun: 'Düşün', kaynak: 'Daha fazlası', arslan: 'Türkçe okuma önerisi: Ahmet Arslan, İlkçağ Felsefe Tarihi (İstanbul Bilgi Üniversitesi Yayınları)', arslanCilt: { 1: 'Sokrates öncesi filozoflar cildi', 2: 'Sokrates, Platon ve Aristoteles ciltleri', 4: 'Helenistik dönem cildi' },
      yer: 'Bu yeri Türkiye\'de gez', bag: 'Türkiye\'de ilgili yer', onceki: 'Önceki', sonraki: 'Sonraki', kapat: 'Kapat', kurede: 'Kürede göster', bitis: 'Başa dön', tumu: 'Bütün dünya', foto: 'Fotoğraf', bolumH: 'Çağ çağ rota', bolumAlt: 'Her durak kısa ve kaynaklı bir madde. Özetler Stanford Encyclopedia of Philosophy ve bağlantısı verilen kaynaklardan bu site için yazılmıştır.', kurePasif: '3D küre için WebGL gerekiyor. Rotanın tamamı aşağıda.', ipucu: 'Küreyi çevirmek için sürükle', turkiye: 'Türkiye Felsefe Haritası', fotoH: 'Fotoğraf atıfları', nav: ['Türkiye', 'Dünya rotası', 'Mekânlar', 'Pasaport'] }
  };

  /* ---------- metinler ---------- */
  function metinler(){
    var t = T[dil];
    document.documentElement.lang = dil;
    document.title = dil === 'tr' ? 'Dünya Felsefe Rotası: Milet\'ten Kyoto\'ya 29 durak | Antikyol' : 'World Philosophy Route: 29 places from Miletus to Kyoto | Antikyol';
    $('#etiket').textContent = t.etiket; $('#baslik').textContent = t.baslik; $('#alt').textContent = t.alt; $('#giris').textContent = t.giris;
    $('#basla').textContent = t.basla; $('#oku').textContent = t.oku; $('#bolum-h').textContent = t.bolumH; $('#bolum-alt').textContent = t.bolumAlt;
    $('#foto-h').textContent = t.fotoH; $('#kure-pasif').textContent = t.kurePasif; $('#ipucu').textContent = t.ipucu;
    var n = document.querySelectorAll('.site-nav a'); t.nav.forEach(function(x, i){ if (n[i]) n[i].textContent = x; });
    document.querySelectorAll('.dil button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dil') === dil); });
    caglarCiz(); maddeler(); if (secili != null) panel(secili);
    if (map && hazir) isaretAdlari();
  }
  function caglarCiz(){
    $('#caglar').innerHTML = '<button type="button" class="cag-cip" data-cag="">' + h(T[dil].tumu) + '</button>' + V.caglar.map(function(c){
      return '<button type="button" class="cag-cip" data-cag="' + c.id + '" style="--c:' + c.renk + '"><i></i>' + h(d(c).ad) + ' <small>' + h(d(c).tarih) + '</small></button>';
    }).join('');
  }
  function fotoHTML(x, buyuk){
    var f = F[x.foto]; if (!f) return '';
    return '<figure class="foto"><img src="' + h(buyuk ? f.src : f.kucuk) + '" srcset="' + h(f.kucuk) + ' 640w, ' + h(f.src) + ' ' + f.w + 'w" sizes="(max-width: 900px) 100vw, 440px" width="' + f.w + '" height="' + f.h + '" alt="' + h(f.baslik ? f.baslik[dil] : d(x).ad) + '" loading="lazy" decoding="async">' +
      '<figcaption>' + h(f.baslik ? f.baslik[dil] : '') + ' <a href="' + h(f.kaynak) + '" target="_blank" rel="noopener">' + h(T[dil].foto) + ': ' + h(f.yazar) + '</a>, <a href="' + h(f.lisansUrl) + '" target="_blank" rel="noopener license">' + h(f.lisans) + '</a></figcaption></figure>';
  }
  function govdeHTML(x){
    var t = T[dil], m = d(x), s = '';
    s += '<p class="fikir"><span>' + h(t.fikir) + '</span>' + h(m.fikir) + '</p>';
    s += '<p class="metin">' + h(m.metin) + '</p>';
    s += '<p class="soru"><span>' + h(t.dusun) + '</span>' + h(m.soru) + '</p>';
    s += '<div class="kaynaklar"><span>' + h(t.kaynak) + '</span><ul>' + x.kaynak.map(function(k){ return '<li><a href="' + h(k.url) + '" target="_blank" rel="noopener">' + h(k.ad) + '</a></li>'; }).join('');
    if (x.arslan) s += '<li class="arslan">' + h(t.arslan) + ': ' + h(t.arslanCilt[x.arslan]) + '</li>';
    s += '</ul></div>';
    if (x.yer) s += '<a class="tr-yer" href="' + x.yer + '">' + h(t.yer) + ' →</a>';
    else if (x.bag) s += '<a class="tr-yer" href="' + x.bag + '">' + h(t.bag) + ' →</a>';
    return s;
  }
  function maddeler(){
    $('#maddeler').innerHTML = V.caglar.map(function(c){
      var ic = DURAK.filter(function(x){ return x.cag === c.id; }).map(function(x){
        var m = d(x), i = SIRA[x.id];
        return '<article class="madde" id="madde-' + x.id + '" style="--c:' + c.renk + '"><div class="madde-foto">' + fotoHTML(x) + '</div><div class="madde-ic">' +
          '<div class="madde-ust"><span class="no">' + (i + 1) + '</span>' + h(m.ulke) + ' · ' + h(m.tarih) + '</div>' +
          '<h3>' + h(m.ad) + '</h3><p class="kim">' + h(m.kim) + '</p>' + govdeHTML(x) +
          '<button type="button" class="kurede" data-git="' + x.id + '">' + h(T[dil].kurede) + '</button></div></article>';
      }).join('');
      return '<section class="cag-bolum" id="cag-' + c.id + '" style="--c:' + c.renk + '"><header><span class="cag-no">' + ['I', 'II', 'III', 'IV', 'V'][c.no] + '</span><div><h2>' + h(d(c).ad) + '</h2><p class="cag-tarih">' + h(d(c).tarih) + '</p><p>' + h(d(c).alt) + '</p></div></header>' + ic + '</section>';
    }).join('');
  }

  /* ---------- panel ---------- */
  var secili = null;
  function panel(i){
    var x = DURAK[i], m = d(x), c = CAG[x.cag], t = T[dil];
    var p = $('#panel');
    p.style.setProperty('--c', c.renk);
    p.innerHTML = '<button type="button" class="panel-kapat" data-eylem="kapat" aria-label="' + h(t.kapat) + '">×</button>' + fotoHTML(x, true) +
      '<div class="panel-ic"><div class="madde-ust"><span class="no">' + (i + 1) + '</span>' + h(d(c).ad) + ' · ' + h(m.tarih) + '</div>' +
      '<h2>' + h(m.ad) + ' <small>' + h(m.ulke) + '</small></h2><p class="kim">' + h(m.kim) + '</p>' + govdeHTML(x) + '</div>' +
      '<div class="panel-alt"><button type="button" data-eylem="onceki"' + (i === 0 ? ' disabled' : '') + '>← ' + h(t.onceki) + '</button><span>' + (i + 1) + ' / ' + DURAK.length + '</span>' +
      (i === DURAK.length - 1 ? '<button type="button" data-eylem="basa">' + h(t.bitis) + '</button>' : '<button type="button" class="ileri" data-eylem="sonraki">' + h(t.sonraki) + ' →</button>') + '</div>';
    p.hidden = false; p.scrollTop = 0;
    document.body.classList.add('panel-acik');
  }
  function sec(i, ucma){
    secili = i;
    panel(i);
    try { history.replaceState(null, '', '#' + DURAK[i].id); } catch(e){}
    if (map && hazir){
      document.querySelectorAll('.k-isaret').forEach(function(el){ el.classList.toggle('secili', +el.getAttribute('data-i') === i); });
      if (!ucma) uc(DURAK[i]);
      rotaVurgu(i);
    }
  }
  function kapat(){
    secili = null; $('#panel').hidden = true; document.body.classList.remove('panel-acik');
    try { history.replaceState(null, '', location.pathname); } catch(e){}
    document.querySelectorAll('.k-isaret.secili').forEach(function(el){ el.classList.remove('secili'); });
    if (map && hazir){ rotaVurgu(-1); genel(); }
  }

  /* ---------- harita ---------- */
  var map = null, hazir = false, donuyor = true;
  function webgl(){ try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; } }
  function dar(){ return window.innerWidth < 900; }
  function pasif(){ document.body.classList.add('kure-yok'); }

  function kureKur(){
    if (!webgl()) return pasif();
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.js'; js.async = true;
    js.onload = kur; js.onerror = pasif; document.head.appendChild(js);
  }
  function stil(){
    return {
      version: 8, glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      sources: { sokak: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' }, ulke: { type: 'vector', url: 'mapbox://mapbox.country-boundaries-v1' } },
      fog: { color: '#1A2A3D', 'high-color': '#0E1A2A', 'horizon-blend': 0.06, 'space-color': '#060B12', 'star-intensity': 0.45, range: [1, 12] },
      layers: [
        { id: 'kara', type: 'background', paint: { 'background-color': '#22344B' } },
        { id: 'su', type: 'fill', source: 'sokak', 'source-layer': 'water', paint: { 'fill-color': '#0A121C' } },
        { id: 'tr', type: 'fill', source: 'ulke', 'source-layer': 'country_boundaries', filter: ['all', ['==', ['get', 'iso_3166_1'], 'TR'], ['match', ['get', 'worldview'], ['all', 'US'], true, false]], paint: { 'fill-color': '#C9A15B', 'fill-opacity': 0.16 } },
        { id: 'sinir', type: 'line', source: 'sokak', 'source-layer': 'admin', filter: ['all', ['==', ['get', 'admin_level'], 0], ['==', ['get', 'maritime'], 0], ['match', ['get', 'worldview'], ['all', 'US'], true, false]],
          paint: { 'line-color': '#C9A15B', 'line-opacity': 0.35, 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 6, 1.2] } },
        { id: 'kent', type: 'symbol', source: 'sokak', 'source-layer': 'place_label', minzoom: 5, filter: ['all', ['==', ['get', 'class'], 'settlement'], ['<=', ['get', 'symbolrank'], 8]],
          layout: { 'text-field': ['coalesce', ['get', 'name_en'], ['get', 'name']], 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-size': 11, 'text-optional': true },
          paint: { 'text-color': '#B9AE98', 'text-opacity': 0.7, 'text-halo-color': '#14202E', 'text-halo-width': 1.2 } }
      ]
    };
  }
  /* İki nokta arasında büyük daire yayı */
  function yay(a, b){
    var r = Math.PI / 180, f1 = a[1] * r, l1 = a[0] * r, f2 = b[1] * r, l2 = b[0] * r;
    var dd = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((f2 - f1) / 2), 2) + Math.cos(f1) * Math.cos(f2) * Math.pow(Math.sin((l2 - l1) / 2), 2)));
    if (dd === 0) return [a, b];
    var out = [], n = Math.max(8, Math.ceil(dd / r / 2));
    for (var i = 0; i <= n; i++){
      var u = i / n, A = Math.sin((1 - u) * dd) / Math.sin(dd), B = Math.sin(u * dd) / Math.sin(dd);
      var x = A * Math.cos(f1) * Math.cos(l1) + B * Math.cos(f2) * Math.cos(l2), y = A * Math.cos(f1) * Math.sin(l1) + B * Math.cos(f2) * Math.sin(l2), z = A * Math.sin(f1) + B * Math.sin(f2);
      out.push([Math.atan2(y, x) / r, Math.atan2(z, Math.sqrt(x * x + y * y)) / r]);
    }
    for (var j = 1; j < out.length; j++){ while (out[j][0] - out[j - 1][0] > 180) out[j][0] -= 360; while (out[j][0] - out[j - 1][0] < -180) out[j][0] += 360; }
    return out;
  }
  function rotaVeri(){
    var fs = [];
    for (var i = 1; i < DURAK.length; i++){
      var a = DURAK[i - 1], b = DURAK[i];
      fs.push({ type: 'Feature', properties: { i: i, renk: CAG[b.cag].renk }, geometry: { type: 'LineString', coordinates: yay([a.lon, a.lat], [b.lon, b.lat]) } });
    }
    return { type: 'FeatureCollection', features: fs };
  }
  function kur(){
    if (!window.mapboxgl) return pasif();
    mapboxgl.accessToken = ANAHTAR;
    try {
      map = new mapboxgl.Map({ container: 'kure', style: stil(), projection: 'globe', center: [40, 30], zoom: dar() ? 0.9 : 1.55, minZoom: 0.6, maxZoom: 9,
        cooperativeGestures: dar(), attributionControl: false, logoPosition: 'bottom-left' });
    } catch(e){ return pasif(); }
    if (dar()) map.setPadding({ top: 230, bottom: 40, left: 0, right: 0 });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    var zaman = setTimeout(function(){ if (!hazir) pasif(); }, 30000);
    map.on('error', function(e){ if (!hazir && e && e.error && /40[13]|Unauthorized|Forbidden/i.test(String(e.error.message || e.error.status))) pasif(); });
    map.on('load', function(){
      hazir = true; clearTimeout(zaman); document.body.classList.add('kure-hazir');
      map.addSource('rota', { type: 'geojson', data: rotaVeri() });
      map.addLayer({ id: 'rota-alt', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'renk'], 'line-opacity': 0.18, 'line-width': 7 } });
      map.addLayer({ id: 'rota-ust', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'renk'], 'line-opacity': 0.9, 'line-width': 2.2, 'line-dasharray': [2, 2] } });
      isaretler();
      if (secili != null){ uc(DURAK[secili]); rotaVurgu(secili); document.querySelectorAll('.k-isaret').forEach(function(el){ el.classList.toggle('secili', +el.getAttribute('data-i') === secili); }); }
      else if (hareket) don();
      akis();
    });
    map.on('zoom', function(){ document.body.classList.toggle('kure-yakin', map.getZoom() >= 2.6); });
    ['mousedown', 'touchstart', 'wheel', 'dragstart'].forEach(function(o){ map.on(o, function(){ donuyor = false; var ip = $('#ipucu'); if (ip) ip.classList.add('gizli'); }); });
  }
  var ETIKET = { miletus: 'alt', hippo: 'sol', edinburgh: 'sol', copenhagen: 'sol', sarnath: 'sol', louguantai: 'sol' };
  function isaretler(){
    DURAK.forEach(function(x, i){
      var el = document.createElement('button'); el.type = 'button'; el.className = 'k-isaret'; el.setAttribute('data-i', i);
      el.style.setProperty('--c', CAG[x.cag].renk);
      if (ETIKET[x.id]) el.classList.add('k-' + ETIKET[x.id]);
      el.innerHTML = '<span class="k-no">' + (i + 1) + '</span><span class="k-ad"></span>';
      el.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); donuyor = false; sec(i); });
      new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([x.lon, x.lat]).addTo(map);
    });
    isaretAdlari();
  }
  function isaretAdlari(){
    document.querySelectorAll('.k-isaret').forEach(function(el){ var x = DURAK[+el.getAttribute('data-i')]; el.querySelector('.k-ad').textContent = d(x).ad; el.setAttribute('aria-label', (+el.getAttribute('data-i') + 1) + '. ' + d(x).ad + ', ' + d(x).kim); });
  }
  function rotaVurgu(i){
    if (!map.getLayer('rota-ust')) return;
    map.setPaintProperty('rota-ust', 'line-opacity', i < 0 ? 0.9 : ['case', ['<=', ['get', 'i'], i], 0.95, 0.25]);
    map.setPaintProperty('rota-alt', 'line-opacity', i < 0 ? 0.18 : ['case', ['==', ['get', 'i'], i], 0.4, 0.1]);
  }
  /* Akan çizgi */
  var DASH = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
  function akis(){
    if (!hareket) return;
    var adim = -1;
    (function kare(s){ if (!map) return; var a = Math.floor(s / 110) % DASH.length; if (a !== adim){ adim = a; map.setPaintProperty('rota-ust', 'line-dasharray', DASH[a]); } requestAnimationFrame(kare); })(performance.now());
  }
  function don(){
    if (!donuyor || !map || secili != null) return;
    var c = map.getCenter(); c.lng -= 6;
    map.easeTo({ center: c, duration: 1000, easing: function(n){ return n; } });
    map.once('moveend', function(){ setTimeout(don, 0); });
  }
  function ortu(){ return dar() ? { top: 0, bottom: Math.round(window.innerHeight * 0.45), left: 0, right: 0 } : { top: 0, bottom: 0, left: 0, right: Math.min(480, window.innerWidth * 0.42) }; }
  function uc(x){
    donuyor = false;
    var o = { center: [x.lon, x.lat], zoom: dar() ? 3.4 : 4.4, pitch: 35, bearing: 0, padding: ortu(), essential: true };
    if (hareket){ o.duration = 2600; o.curve = 1.6; map.flyTo(o); } else map.jumpTo(o);
  }
  function genel(c){
    var noktalar = DURAK.filter(function(x){ return !c || x.cag === c; });
    if (!c){ var o = { center: [40, 30], zoom: dar() ? 0.9 : 1.55, pitch: 0, bearing: 0, padding: dar() ? { top: 230, bottom: 40, left: 0, right: 0 } : { top: 0, bottom: 0, left: 0, right: 0 } }; if (hareket) map.flyTo(Object.assign(o, { duration: 2000 })); else map.jumpTo(o); return; }
    var b = new mapboxgl.LngLatBounds([noktalar[0].lon, noktalar[0].lat], [noktalar[0].lon, noktalar[0].lat]);
    noktalar.forEach(function(x){ b.extend([x.lon, x.lat]); });
    var cam = map.cameraForBounds(b, { padding: dar() ? 40 : 90 });
    if (!cam) return;
    cam.zoom = Math.min(cam.zoom, 5); cam.pitch = 20; cam.bearing = 0;
    if (hareket) map.flyTo(Object.assign(cam, { duration: 2200 })); else map.jumpTo(cam);
  }

  /* ---------- olaylar ---------- */
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-dil]');
    if (b){ dil = b.getAttribute('data-dil'); yaz('fh-dil', dil); metinler(); return; }
    var a = e.target.closest('[data-eylem]');
    if (a){
      var ey = a.getAttribute('data-eylem');
      if (ey === 'basla'){ donuyor = false; if (!hazir) { location.hash = DURAK[0].id; } window.scrollTo({ top: 0, behavior: hareket ? 'smooth' : 'auto' }); sec(0); }
      else if (ey === 'sonraki' && secili != null && secili < DURAK.length - 1) sec(secili + 1);
      else if (ey === 'onceki' && secili > 0) sec(secili - 1);
      else if (ey === 'basa'){ kapat(); }
      else if (ey === 'kapat') kapat();
      return;
    }
    var g = e.target.closest('[data-git]');
    if (g){ if (hazir){ window.scrollTo({ top: 0, behavior: hareket ? 'smooth' : 'auto' }); sec(SIRA[g.getAttribute('data-git')]); } else location.hash = g.getAttribute('data-git'); return; }
    var c = e.target.closest('[data-cag]');
    if (c){
      var id = c.getAttribute('data-cag');
      document.querySelectorAll('.cag-cip').forEach(function(x){ x.setAttribute('aria-pressed', x === c); });
      if (secili != null){ secili = null; $('#panel').hidden = true; document.body.classList.remove('panel-acik'); rotaVurgu(-1); }
      donuyor = false;
      if (hazir) genel(id); else { var el = document.getElementById(id ? 'cag-' + id : 'maddeler'); if (el) el.scrollIntoView(); }
    }
  });
  document.addEventListener('keydown', function(e){
    if (secili == null || /input|textarea/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' && secili < DURAK.length - 1) sec(secili + 1);
    else if (e.key === 'ArrowLeft' && secili > 0) sec(secili - 1);
    else if (e.key === 'Escape') kapat();
  });

  metinler();
  var ilk = decodeURIComponent((location.hash || '').slice(1));
  if (ilk && SIRA[ilk] != null){ secili = SIRA[ilk]; panel(secili); }
  kureKur();
})();
