/* ==========================================================================
   ANA SAYFA: DÜNYA FELSEFE ROTASI. Tam ekran Mapbox küre, 29 durak, beş çağ.
   Sayfa kaymaz: duraklar küre üstündeki panelde, okuma bölümü sayfa sayfa
   çevrilen bir okuyucuda açılır. Metinler ve sayfalar: dunya-sayfalar.js.
   ========================================================================== */
(function(){
  var ANAHTAR = 'pk.eyJ1IjoidGFzZGVtaXJzaW1nZSIsImEiOiJjbXdncmQxMjQwa21uMnlyMG12MHFjc2RkIn0.lFcrHH50LqDEmqO_t8FU3Q';
  var SURUM = '3.34.1';
  var V = window.DUNYA, S = window.DUNYA_SAYFA, T = S.T, CAG = S.CAG, SIRA = S.SIRA, DURAK = V.duraklar;
  var SAYFA = S.sira(), SAYFA_NO = {}; SAYFA.forEach(function(p, k){ SAYFA_NO[p.id] = k; });

  function oku(k, v){ try { var x = JSON.parse(localStorage.getItem(k)); return x == null ? v : x; } catch(e){ return v; } }
  function yaz(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var dil = oku('fh-dil', 'en'); if (dil !== 'tr') dil = 'en';
  var hareket = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(s){ return document.querySelector(s); }
  function h(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function d(x){ return x[dil]; }

  /* ---------- metinler ---------- */
  var cizilenDil = 'en';
  function metinler(){
    var t = T[dil];
    document.documentElement.lang = dil;
    document.title = dil === 'tr' ? 'Antikyol · Dünya Felsefe Rotası: Milet\'ten Kyoto\'ya 29 durak' : 'Antikyol · World Philosophy Route: 29 places from Miletus to Kyoto';
    $('#etiket').textContent = t.etiket; $('#baslik').textContent = t.baslik; $('#alt').textContent = t.alt; $('#giris').textContent = t.giris;
    $('#basla').textContent = t.basla; $('#oku').textContent = t.oku; $('#kure-pasif').textContent = t.kurePasif; $('#ipucu').textContent = t.ipucu;
    $('#o-onceki').setAttribute('aria-label', t.onceki); $('#o-sonraki').setAttribute('aria-label', t.sonraki); $('#o-kapat').setAttribute('aria-label', t.kapat);
    var n = document.querySelectorAll('.site-nav a'); t.nav.forEach(function(x, i){ if (n[i]) n[i].textContent = x; });
    document.querySelectorAll('.dil button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dil') === dil); });
    caglarCiz();
    if (cizilenDil !== dil){ $('#sayfalar').innerHTML = S.sayfalar(dil); cizilenDil = dil; sayfaGoster(sayfaNo, true); }
    if (secili != null) panel(secili);
    if (map && hazir) isaretAdlari();
  }
  function caglarCiz(){
    $('#caglar').innerHTML = '<button type="button" class="cag-cip" data-cag="">' + h(T[dil].tumu) + '</button>' + V.caglar.map(function(c){
      return '<button type="button" class="cag-cip" data-cag="' + c.id + '" style="--c:' + c.renk + '"><i></i>' + h(d(c).ad) + ' <small>' + h(d(c).tarih) + '</small></button>';
    }).join('');
  }

  /* ---------- okuyucu: sayfa sayfa ---------- */
  var okuyucuAcik = false, sayfaNo = 0;
  function sayfaGoster(k, ani){
    k = Math.max(0, Math.min(SAYFA.length - 1, k)); sayfaNo = k;
    var ray = $('#sayfalar');
    ray.style.transition = ani || !hareket ? 'none' : '';
    ray.style.transform = 'translateX(' + (-100 * k) + '%)';
    document.querySelectorAll('.sayfa').forEach(function(el, j){ el.setAttribute('aria-hidden', j !== k); el.inert = j !== k; if (j === k) el.scrollTop = 0; });
    $('#o-onceki').disabled = k === 0; $('#o-sonraki').disabled = k === SAYFA.length - 1;
    $('#o-sayac').textContent = (k + 1) + ' / ' + SAYFA.length;
    $('#o-cubuk').style.width = ((k + 1) / SAYFA.length * 100) + '%';
    var p = SAYFA[k], renk = p.tur === 'durak' ? CAG[p.x.cag].renk : p.tur === 'cag' ? p.cag.renk : '#C9A15B';
    $('#okuyucu').style.setProperty('--c', renk);
    if (okuyucuAcik) try { history.replaceState(null, '', k ? '#oku-' + p.id : '#oku'); } catch(e){}
  }
  function okuyucuAc(k){
    if (secili != null){ secili = null; $('#panel').hidden = true; document.body.classList.remove('panel-acik'); }
    okuyucuAcik = true; document.body.classList.add('okuyucu-acik'); $('#okuyucu').setAttribute('aria-hidden', 'false');
    sayfaGoster(k || 0, true);
    setTimeout(function(){ $('#o-sonraki').focus({ preventScroll: true }); }, 50);
  }
  function okuyucuKapat(){
    okuyucuAcik = false; document.body.classList.remove('okuyucu-acik'); $('#okuyucu').setAttribute('aria-hidden', 'true');
    try { history.replaceState(null, '', location.pathname); } catch(e){}
  }
  /* parmakla kaydırma */
  (function(){
    var x0 = null, y0 = 0;
    document.addEventListener('touchstart', function(e){ if (!okuyucuAcik) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', function(e){
      if (!okuyucuAcik || x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) sayfaGoster(sayfaNo + (dx < 0 ? 1 : -1));
    }, { passive: true });
  })();

  /* ---------- panel ---------- */
  var secili = null;
  function panel(i){
    var x = DURAK[i], m = d(x), c = CAG[x.cag], t = T[dil];
    var p = $('#panel');
    p.style.setProperty('--c', c.renk);
    p.innerHTML = '<button type="button" class="panel-kapat" data-eylem="kapat" aria-label="' + h(t.kapat) + '">×</button>' + S.foto(x, dil, true) +
      '<div class="panel-ic"><div class="madde-ust"><span class="no">' + (i + 1) + '</span>' + h(d(c).ad) + ' · ' + h(m.tarih) + '</div>' +
      '<h2>' + h(m.ad) + ' <small>' + h(m.ulke) + '</small></h2><p class="kim">' + h(m.kim) + '</p>' + S.govde(x, dil) + '</div>' +
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
    if (okuyucuAcik) return;
  }

  /* ---------- harita ---------- */
  var map = null, hazir = false, donuyor = true;
  function webgl(){ try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; } }
  function dar(){ return window.innerWidth < 900; }
  function pasif(){ document.body.classList.add('kure-yok'); if (secili != null){ var k = SAYFA_NO[DURAK[secili].id]; secili = null; $('#panel').hidden = true; document.body.classList.remove('panel-acik'); okuyucuAc(k); } }
  function kureYok(){ return document.body.classList.contains('kure-yok'); }

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
    var sp = e.target.closest('[data-sayfa]');
    if (sp){ sayfaGoster(+sp.getAttribute('data-sayfa')); return; }
    var a = e.target.closest('[data-eylem]');
    if (a){
      var ey = a.getAttribute('data-eylem');
      if (ey === 'basla'){ e.preventDefault(); donuyor = false; if (kureYok()) okuyucuAc(SAYFA_NO[DURAK[0].id]); else { if (okuyucuAcik) okuyucuKapat(); sec(0); } }
      else if (ey === 'okuyucu'){ e.preventDefault(); okuyucuAc(0); }
      else if (ey === 'okuyucu-kapat') okuyucuKapat();
      else if (ey === 'o-sonraki') sayfaGoster(sayfaNo + 1);
      else if (ey === 'o-onceki') sayfaGoster(sayfaNo - 1);
      else if (ey === 'sonraki' && secili != null && secili < DURAK.length - 1) sec(secili + 1);
      else if (ey === 'onceki' && secili > 0) sec(secili - 1);
      else if (ey === 'basa' || ey === 'kapat') kapat();
      return;
    }
    var g = e.target.closest('[data-git]');
    if (g){ okuyucuKapat(); sec(SIRA[g.getAttribute('data-git')], !hazir); return; }
    var c = e.target.closest('[data-cag]');
    if (c){
      var id = c.getAttribute('data-cag');
      document.querySelectorAll('.cag-cip').forEach(function(x){ x.setAttribute('aria-pressed', x === c); });
      if (secili != null){ secili = null; $('#panel').hidden = true; document.body.classList.remove('panel-acik'); if (hazir) rotaVurgu(-1); }
      donuyor = false;
      if (hazir) genel(id); else okuyucuAc(id ? SAYFA_NO['cag-' + id] : 0);
    }
  });
  document.addEventListener('keydown', function(e){
    if (/input|textarea/i.test(e.target.tagName)) return;
    if (okuyucuAcik){
      if (e.key === 'ArrowRight' || e.key === 'PageDown'){ e.preventDefault(); sayfaGoster(sayfaNo + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); sayfaGoster(sayfaNo - 1); }
      else if (e.key === 'Escape') okuyucuKapat();
      return;
    }
    if (secili == null) return;
    if (e.key === 'ArrowRight' && secili < DURAK.length - 1) sec(secili + 1);
    else if (e.key === 'ArrowLeft' && secili > 0) sec(secili - 1);
    else if (e.key === 'Escape') kapat();
  });

  metinler();
  sayfaGoster(0, true);
  var ilk = decodeURIComponent((location.hash || '').slice(1));
  if (ilk === 'oku') okuyucuAc(0);
  else if (ilk.indexOf('oku-') === 0 && SAYFA_NO[ilk.slice(4)] != null) okuyucuAc(SAYFA_NO[ilk.slice(4)]);
  else if (ilk && SIRA[ilk] != null){ secili = SIRA[ilk]; panel(secili); }
  kureKur();
})();
