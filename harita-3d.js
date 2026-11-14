/* ==========================================================================
   3D HARİTA (Mapbox GL): gerçek arazi, gölgeli kabartma, lacivert + altın tema.
   index.html'deki SVG haritanın yerini alır; WebGL yoksa, Mapbox yüklenemezse
   ya da adres ?harita=klasik ise eski SVG harita olduğu gibi kalır.
   Anahtar public (pk.) bir anahtardır; Mapbox hesabında antikyol.com ile
   sınırlandırılmalıdır.
   ========================================================================== */
(function(){
  var ANAHTAR = 'pk.eyJ1IjoidGFzZGVtaXJzaW1nZSIsImEiOiJjbXdncmQxMjQwa21uMnlyMG12MHFjc2RkIn0.lFcrHH50LqDEmqO_t8FU3Q';
  var SURUM = '3.34.1';
  var LACI = '#14202E', LACI_DERIN = '#0A121C', ALTIN = '#C9A15B', KREM = '#F3E7CF';
  var TUM = [[25.4, 35.55], [45.0, 42.35]], EGE_S = [[25.9, 36.95], [29.6, 40.05]];

  if (!window.YERLER || !document.getElementById('harita')) return;
  try { if (new URLSearchParams(location.search).get('harita') === 'klasik') return; } catch(e){}
  if (!webgl()) return;

  var eskiCiz = window.haritaCiz, eskiZum = window.zumla;
  var kutu = document.getElementById('harita');
  var map = null, hazir = false, bitti = false, son = {}, isaret = {}, kume = null, gemiler = [], kervan = null, animKimlik = 0;

  function webgl(){
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; }
  }
  function dar(){ return kutu.clientWidth < 600; }
  function hareket(){ return typeof HAREKET === 'undefined' ? true : HAREKET; }

  /* Mapbox kütüphanesini sonradan yükle: sayfa hemen açılsın, SVG harita bu arada görünsün */
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.css'; document.head.appendChild(css);
  var js = document.createElement('script'); js.src = 'https://api.mapbox.com/mapbox-gl-js/v' + SURUM + '/mapbox-gl.js'; js.async = true;
  js.onload = kur; js.onerror = geriDon;
  document.head.appendChild(js);

  function geriDon(){
    if (bitti) return; bitti = true;
    try { if (map) map.remove(); } catch(e){}
    window.haritaCiz = eskiCiz; window.zumla = eskiZum;
    kutu.classList.remove('uc'); kutu.innerHTML = ''; eskiCiz();
  }

  /* ---------- stil: kendi stilimiz, Mapbox Streets verisi + arazi ---------- */
  function stil(){
    var yazi = ['DIN Pro Italic', 'Arial Unicode MS Regular'], yaziK = ['DIN Pro Medium', 'Arial Unicode MS Regular'];
    return {
      version: 8,
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      sources: {
        sokak: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' },
        ulke: { type: 'vector', url: 'mapbox://mapbox.country-boundaries-v1' },
        dem: { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 },
        golge: { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 }
      },
      terrain: { source: 'dem', exaggeration: 1.6 },
      fog: { color: '#1A2A3D', 'high-color': '#0E1A2A', 'horizon-blend': 0.08, 'space-color': '#060B12', 'star-intensity': 0.35, range: [1.5, 12] },
      layers: [
        { id: 'kara', type: 'background', paint: { 'background-color': '#21334A' } },
        { id: 'su', type: 'fill', source: 'sokak', 'source-layer': 'water', paint: { 'fill-color': LACI_DERIN } },
        { id: 'komsu', type: 'fill', source: 'ulke', 'source-layer': 'country_boundaries',
          filter: ['all', ['!=', ['get', 'iso_3166_1'], 'TR'], ['match', ['get', 'worldview'], ['all', 'US'], true, false]],
          paint: { 'fill-color': '#0E1824', 'fill-opacity': 0.6 } },
        { id: 'kabartma', type: 'hillshade', source: 'golge',
          paint: { 'hillshade-shadow-color': '#05090F', 'hillshade-highlight-color': 'rgba(201,161,91,0.55)', 'hillshade-accent-color': '#2A2618', 'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 4, 0.35, 8, 0.6], 'hillshade-illumination-direction': 315 } },
        { id: 'irmak', type: 'line', source: 'sokak', 'source-layer': 'waterway', minzoom: 5, filter: ['==', ['get', 'class'], 'river'],
          paint: { 'line-color': '#2C4A68', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.6] } },
        { id: 'yol', type: 'line', source: 'sokak', 'source-layer': 'road', minzoom: 6.5, filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
          paint: { 'line-color': ALTIN, 'line-opacity': 0.14, 'line-width': ['interpolate', ['linear'], ['zoom'], 6.5, 0.4, 12, 1.5] } },
        { id: 'sinir', type: 'line', source: 'sokak', 'source-layer': 'admin', filter: ['all', ['==', ['get', 'admin_level'], 0], ['==', ['get', 'maritime'], 0], ['match', ['get', 'worldview'], ['all', 'US'], true, false]],
          paint: { 'line-color': ALTIN, 'line-opacity': 0.55, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 9, 1.6] } },
        { id: 'kent', type: 'symbol', source: 'sokak', 'source-layer': 'place_label', minzoom: 5.5,
          filter: ['all', ['==', ['get', 'iso_3166_1'], 'TR'], ['==', ['get', 'class'], 'settlement'], ['<=', ['get', 'symbolrank'], 9]],
          layout: { 'text-field': ['get', 'name'], 'text-font': yaziK, 'text-size': 11, 'text-letter-spacing': 0.06, 'text-optional': true },
          paint: { 'text-color': '#B9AE98', 'text-opacity': 0.75, 'text-halo-color': LACI, 'text-halo-width': 1.2 } },
        { id: 'deniz-ad', type: 'symbol', source: 'denizler-kaynak',
          layout: { 'text-field': ['get', 'ad'], 'text-font': yazi, 'text-size': 13, 'text-letter-spacing': 0.5, 'text-rotate': ['get', 'don'], 'text-allow-overlap': true },
          paint: { 'text-color': '#6F8BA6', 'text-opacity': 0.8 } }
      ]
    };
  }
  var DENIZ = [
    { n: [34.6, 42.75], tr: 'KARADENİZ', en: 'BLACK SEA', don: 0 },
    { n: [31.6, 35.25], tr: 'AKDENİZ', en: 'MEDITERRANEAN', don: 0 },
    { n: [25.25, 38.6], tr: 'EGE', en: 'AEGEAN', don: -90 }
  ];
  function denizVeri(){
    return { type: 'FeatureCollection', features: DENIZ.map(function(d){ return { type: 'Feature', properties: { ad: d[D.dil], don: d.don }, geometry: { type: 'Point', coordinates: d.n } }; }) };
  }

  /* ---------- kurulum ---------- */
  function kur(){
    if (bitti || !window.mapboxgl) return geriDon();
    mapboxgl.accessToken = ANAHTAR;
    var s = stil();
    s.sources['denizler-kaynak'] = { type: 'geojson', data: denizVeri() };
    kutu.classList.add('uc'); kutu.innerHTML = '';
    var ac = hareket();
    try {
      map = new mapboxgl.Map({
        container: kutu, style: s, projection: 'mercator',
        bounds: ac ? [[22, 33], [48, 44]] : TUM, fitBoundsOptions: { padding: 20 },
        pitch: ac ? 0 : 42, maxPitch: 70, minZoom: 3.2, maxZoom: 13,
        cooperativeGestures: true, attributionControl: false, logoPosition: 'bottom-left',
        locale: { 'ScrollZoomBlocker.CtrlMessage': t3('Yakınlaştırmak için Ctrl + kaydır', 'Use ctrl + scroll to zoom'), 'ScrollZoomBlocker.CmdMessage': t3('Yakınlaştırmak için ⌘ + kaydır', 'Use ⌘ + scroll to zoom'), 'TouchPanBlocker.Message': t3('Haritayı iki parmakla hareket ettir', 'Use two fingers to move the map') }
      });
    } catch(e){ return geriDon(); }
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    var zaman = setTimeout(function(){ if (!hazir) geriDon(); }, 15000);
    map.on('error', function(e){ if (!hazir && e && e.error && /40[13]|Unauthorized|Forbidden/i.test(String(e.error.message || e.error.status))) geriDon(); });
    map.on('load', function(){
      hazir = true; clearTimeout(zaman);
      katmanlar();
      window.haritaCiz = ciz; window.zumla = zumla3;
      ciz();
      var ipucu = document.getElementById('kaydir-ipucu'); if (ipucu) ipucu.classList.add('gizli');
      if (ac) gemiYola();
    });
    map.on('zoom', etiketler);
  }
  function t3(tr, en){ return D.dil === 'tr' ? tr : en; }

  function katmanlar(){
    map.addSource('baglar', { type: 'geojson', data: bos() });
    map.addSource('rota', { type: 'geojson', data: bos() });
    map.addLayer({ id: 'bag-hoca', type: 'line', source: 'baglar', filter: ['==', ['get', 'tur'], 'hoca'], layout: { 'line-cap': 'round' },
      paint: { 'line-color': '#7FB0D8', 'line-width': ['case', ['get', 'ilgili'], 3, 1.8], 'line-opacity': ['case', ['get', 'soluk'], 0.12, 0.9] } });
    map.addLayer({ id: 'bag-etki', type: 'line', source: 'baglar', filter: ['==', ['get', 'tur'], 'etki'], layout: { 'line-cap': 'round' },
      paint: { 'line-color': ALTIN, 'line-width': ['case', ['get', 'ilgili'], 3, 1.8], 'line-dasharray': [2, 2], 'line-opacity': ['case', ['get', 'soluk'], 0.12, 0.9] } });
    map.addLayer({ id: 'rota-alt', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': KREM, 'line-opacity': 0.25, 'line-width': 9 } });
    map.addLayer({ id: 'rota-ust', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ALTIN, 'line-width': 3.2, 'line-dasharray': [0, 3, 3] } });
  }
  function bos(){ return { type: 'FeatureCollection', features: [] }; }

  /* ---------- işaretler ---------- */
  function yerAd(yer){ return (window.HARITA_AD && HARITA_AD[yer.id]) ? HARITA_AD[yer.id][D.dil] : y(yer).ad; }
  function isaretler(){
    YERLER.forEach(function(yer, i){
      var m = isaret[yer.id];
      if (!m){
        var el = document.createElement('button');
        el.type = 'button'; el.className = 'm3 pin'; el.setAttribute('data-yer', yer.id); el.style.setProperty('--r', RENK[yer.id]);
        el.innerHTML = '<span class="m3-no">' + (i + 1) + '</span><span class="m3-ad"></span>';
        if (window.ETIKET_KONUM && ETIKET_KONUM[yer.id]) el.classList.add('k-' + ETIKET_KONUM[yer.id]);
        if (window.ETIKET_DAR && ETIKET_DAR[yer.id]) el.classList.add('kd-' + ETIKET_DAR[yer.id]);
        m = isaret[yer.id] = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([yer.lon, yer.lat]).addTo(map);
      }
      var e = m.getElement();
      e.classList.toggle('secili', D.secili === yer.id);
      e.classList.toggle('muhurlu', !!D.muhur[yer.id]);
      e.classList.toggle('disari', typeof uyuyor === 'function' && !uyuyor(yer));
      e.classList.toggle('ege-yer', egede(yer));
      e.querySelector('.m3-ad').textContent = yerAd(yer);
      e.setAttribute('aria-label', (i + 1) + '. ' + y(yer).ad + ', ' + y(yer).kim);
      e.setAttribute('aria-pressed', D.secili === yer.id);
    });
    if (!kume){
      var k = document.createElement('button'); k.type = 'button'; k.id = 'ege-kume'; k.className = 'm3-kume';
      var ege = YERLER.filter(egede);
      k.textContent = '+' + ege.length;
      kume = new mapboxgl.Marker({ element: k }).setLngLat([27.75, 38.5]).addTo(map);
    }
    kume.getElement().setAttribute('aria-label', t('ege'));
    etiketler();
  }
  /* Uzakta Ege'deki 10 durak üst üste biner: tek rozet; telefonda uzaktayken adlar gizli, numara ve liste yeter */
  function etiketler(){
    if (!map) return;
    var z = map.getZoom(), yakin = z >= 6.2, kumele = z < 5.9;
    kutu.classList.toggle('m3-yakin', yakin);
    kutu.classList.toggle('m3-kumeli', kumele);
    kutu.classList.toggle('m3-uzak', dar() && z < 5.4);
  }

  /* ---------- bağlar ve rota ---------- */
  function kavis(a, b){
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bk = Math.min(L * 0.18, 2.2);
    var K = [(a[0] + b[0]) / 2 - dy / L * bk, (a[1] + b[1]) / 2 + dx / L * bk], out = [];
    for (var i = 0; i <= 24; i++){ var u = i / 24, v = 1 - u; out.push([v * v * a[0] + 2 * v * u * K[0] + u * u * b[0], v * v * a[1] + 2 * v * u * K[1] + u * u * b[1]]); }
    return out;
  }
  function bagVeri(){
    if (!D.bag || D.rota) return bos();
    return { type: 'FeatureCollection', features: BAGLAR.map(function(b){
      var A = bul(b.a), B = bul(b.b), ilgili = !!D.secili && (b.a === D.secili || b.b === D.secili);
      return { type: 'Feature', properties: { tur: b.tur, ilgili: ilgili, soluk: !!D.secili && !ilgili }, geometry: { type: 'LineString', coordinates: kavis([A.lon, A.lat], [B.lon, B.lat]) } };
    }) };
  }
  function rotaNoktalar(){ var R = rotaBul(D.rota); return R ? R.duraklar.map(function(id){ var x = bul(id); return [x.lon, x.lat]; }) : []; }
  function rotaVeri(){
    var n = rotaNoktalar();
    return n.length > 1 ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: n } }] } : bos();
  }

  /* Rota çizgisi akar, kervan durakların arasında yürür */
  var DASH = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
  function rotaCanlandir(){
    var kim = ++animKimlik, n = rotaNoktalar();
    if (kervan){ kervan.remove(); kervan = null; }
    if (n.length < 2 || !hareket()){ map.setPaintProperty('rota-ust', 'line-dasharray', [2, 2]); return; }
    var el = document.createElement('div'); el.className = 'm3-kervan';
    kervan = new mapboxgl.Marker({ element: el }).setLngLat(n[0]).addTo(map);
    var uz = [0]; for (var i = 1; i < n.length; i++) uz.push(uz[i - 1] + Math.hypot(n[i][0] - n[i - 1][0], n[i][1] - n[i - 1][1]));
    var top = uz[uz.length - 1], sure = Math.max(6, n.length * 2.6) * 1000, t0 = performance.now(), adim = -1;
    (function kare(s){
      if (kim !== animKimlik || !map) return;
      var a = Math.floor(s / 90) % DASH.length; if (a !== adim){ adim = a; map.setPaintProperty('rota-ust', 'line-dasharray', DASH[a]); }
      var hedef = ((s - t0) % sure) / sure * top, j = 1; while (j < uz.length - 1 && uz[j] < hedef) j++;
      var k = (hedef - uz[j - 1]) / ((uz[j] - uz[j - 1]) || 1);
      kervan.setLngLat([n[j - 1][0] + (n[j][0] - n[j - 1][0]) * k, n[j - 1][1] + (n[j][1] - n[j - 1][1]) * k]);
      requestAnimationFrame(kare);
    })(performance.now());
  }

  /* Ege'de ve Karadeniz'de süzülen iki yelkenli */
  function gemiYola(){
    if (typeof GEMI_YOL === 'undefined') return;
    GEMI_YOL.forEach(function(g){
      var el = document.createElement('div'); el.className = 'm3-gemi';
      el.innerHTML = '<svg viewBox="-12 -15 24 22" width="26" height="24" aria-hidden="true">' + (window.GEMI || '') + '</svg>';
      var mk = new mapboxgl.Marker({ element: el }).setLngLat(g.d[0]).addTo(map);
      var uz = [0]; for (var i = 1; i < g.d.length; i++) uz.push(uz[i - 1] + Math.hypot(g.d[i][0] - g.d[i - 1][0], g.d[i][1] - g.d[i - 1][1]));
      gemiler.push({ mk: mk, el: el, n: g.d, uz: uz, sure: g.sure * 1000, gec: g.gec * 1000 });
    });
    var t0 = performance.now();
    (function kare(s){
      if (!map) return;
      gemiler.forEach(function(g){
        var top = g.uz[g.uz.length - 1], p = (((s - t0 - g.gec) % g.sure) + g.sure) % g.sure / g.sure, hedef = p * top, j = 1;
        while (j < g.uz.length - 1 && g.uz[j] < hedef) j++;
        var k = (hedef - g.uz[j - 1]) / ((g.uz[j] - g.uz[j - 1]) || 1);
        g.mk.setLngLat([g.n[j - 1][0] + (g.n[j][0] - g.n[j - 1][0]) * k, g.n[j - 1][1] + (g.n[j][1] - g.n[j - 1][1]) * k]);
        g.el.style.opacity = p < 0.06 ? p / 0.06 : p > 0.94 ? (1 - p) / 0.06 : 1;
      });
      requestAnimationFrame(kare);
    })(t0);
  }

  /* ---------- kamera ---------- */
  function kamera(sinir, aci, yon, sure){
    var pad = dar() ? 4 : 36;
    var c = map.cameraForBounds(sinir, { padding: pad, pitch: aci, bearing: yon });
    if (!c) return;
    var o = { center: c.center, zoom: c.zoom, pitch: aci, bearing: yon || 0, padding: { top: 0, bottom: 0, left: 0, right: 0 }, duration: hareket() ? sure : 0, essential: false };
    if (hareket()) map.flyTo(o); else map.jumpTo(o);
  }
  function gorunum(){
    var R = rotaBul(D.rota);
    if (R){
      var n = rotaNoktalar(), b = new mapboxgl.LngLatBounds(n[0], n[0]);
      n.forEach(function(p){ b.extend(p); });
      if (n.length === 1){ map.flyTo({ center: n[0], zoom: 8, pitch: 60, bearing: -15, duration: hareket() ? 2000 : 0 }); return; }
      return kamera(b, 50, -8, 2000);
    }
    if (D.zum === 'ege') return kamera(EGE_S, 52, -12, 1800);
    return kamera(dar() ? [[26.2, 35.8], [44.8, 42.1]] : TUM, dar() ? 36 : 42, 0, son.ilk ? 1800 : 3200);
  }
  /* Masaüstünde sağdan açılan çekmece haritanın bir kısmını örter: yeri görünen kısmın ortasına getir */
  function ortu(){
    var c = document.querySelector('.cekmece'), acik = document.querySelector('.cekmece-acik');
    if (!c || !acik || window.innerWidth <= 900) return 0;
    var k = kutu.getBoundingClientRect();
    return Math.max(0, Math.min(k.width * 0.6, k.right - (window.innerWidth - c.offsetWidth)));
  }
  function yereUc(yer){
    setTimeout(function(){
      var o = { center: [yer.lon, yer.lat], zoom: Math.max(map.getZoom(), 8.2), pitch: 62, bearing: -18, padding: { top: 0, bottom: 0, left: 0, right: ortu() }, essential: false };
      if (hareket()){ o.duration = 2200; map.flyTo(o); } else map.jumpTo(o);
    }, 60);
  }

  /* ---------- index.html'deki haritaCiz'in yerine ---------- */
  function ciz(){
    if (!map) return;
    map.resize();
    isaretler();
    map.getSource('baglar').setData(bagVeri());
    map.getSource('rota').setData(rotaVeri());
    if (son.dil !== D.dil){ map.getSource('denizler-kaynak').setData(denizVeri()); map.setLayoutProperty('kent', 'text-field', D.dil === 'tr' ? ['get', 'name'] : ['coalesce', ['get', 'name_en'], ['get', 'name']]); }
    if (son.rota !== D.rota) rotaCanlandir();
    var ilk = !son.ilk, yeniSecim = D.secili && son.secili !== D.secili && !D.rota;
    if (ilk){ gorunum(); if (D.secili && !D.rota) setTimeout(function(){ if (D.secili) yereUc(bul(D.secili)); }, hareket() ? 3400 : 0); }
    else if (yeniSecim) yereUc(bul(D.secili));
    else if (son.zum !== D.zum || son.rota !== D.rota) gorunum();
    son = { ilk: true, zum: D.zum, rota: D.rota, secili: D.secili, dil: D.dil };
    var zb = document.getElementById('z-bag'), zt = document.getElementById('z-tum'), ze = document.getElementById('z-ege');
    if (zb) zb.setAttribute('aria-pressed', !!D.bag); if (zt) zt.setAttribute('aria-pressed', D.zum === 'tum'); if (ze) ze.setAttribute('aria-pressed', D.zum === 'ege');
  }
  function zumla3(z){
    if (z === D.zum && son.zum === z){ son.zum = null; }
    D.zum = z; if (typeof metinCiz === 'function') metinCiz();
    ciz();
  }
})();
