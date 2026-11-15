/* Dünya Felsefe Rotası: metinler ve okuyucu sayfalarının HTML'i. Hem tarayıcıda (dunya.js) hem
   scripts/dunya-sayfa.mjs içinde (statik, taranabilir İngilizce sürüm) aynı kodla üretilir. */
(function(){
  var V = window.DUNYA, F = window.DUNYA_FOTO || {};
  var ROMA = ['I', 'II', 'III', 'IV', 'V'];
  var CAG = {}; V.caglar.forEach(function(c, i){ c.no = i; CAG[c.id] = c; });
  var SIRA = {}; V.duraklar.forEach(function(x, i){ SIRA[x.id] = i; });

  var T = {
    en: { etiket: 'ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ', baslik: 'World Philosophy Route', alt: 'From Miletus to Kyoto: 2,600 years of thought in 29 places', giris: 'Philosophy began on the Anatolian coast, but it was never only Greek. Follow the questions as they travel: to India and China, through the houses of wisdom of Baghdad and Córdoba, to Timbuktu, Isfahan and Mexico, and on to Königsberg and Kyoto.',
      basla: 'Begin the journey', oku: 'Read the route', fikir: 'Key idea', dusun: 'Think', kaynak: 'Read further', arslan: 'In Turkish: Ahmet Arslan, İlkçağ Felsefe Tarihi (İstanbul Bilgi University Press)', arslanCilt: { 1: 'the volume on the Presocratics', 2: 'the volumes on Socrates, Plato and Aristotle', 4: 'the volume on Hellenistic philosophy' },
      yer: 'Visit this place in Türkiye', bag: 'Related place in Türkiye', onceki: 'Previous', sonraki: 'Next', kapat: 'Close', kurede: 'Show on the globe', bitis: 'Back to the globe', tumu: 'Whole world', foto: 'Photo', kapakH: 'The route, era by era', kapakAlt: 'Each stop is a short, sourced entry. Summaries are written for this site from the Stanford Encyclopedia of Philosophy and the other linked sources. Turn the pages with the arrows, by swiping, or with the arrow keys.', durakSay: '{n} stops', kurePasif: 'The 3D globe needs WebGL. You can still read the whole route.', ipucu: 'Drag to turn the globe', turkiye: 'Philosophy Map of Türkiye', turkiyeAlt: '22 places in Anatolia, with routes and a passport', fotoH: 'Photo credits', fotoNot: 'Photographs from Wikimedia Commons under the licences shown. Map data © Mapbox © OpenStreetMap.', sayfa: 'Page', nav: ['Passport'], ust: ['Explore', 'Understand', 'Experience'], icindekiler: 'Contents',
      plan: 'Plan your visit', planKisa: 'Plan', planNerede: 'Where are you going?', planKal: 'Stay nearby', planTur: 'Tours and tickets', planOtel: 'Hotels in {k}', planTurlar: 'Tours: {k}', planDunya: 'World route', planTr: 'Türkiye', planSayfa: 'Practical notes for {k} →',
      planAcik: 'Hotels.com, GetYourGuide and Viator links are affiliate links: if you book through them, this site may earn a commission at no extra cost to you. They never change what we write.',
      planYok: 'We do not list bookings for this place. Check your government\'s current travel advice before planning a visit. You can still read about it on the route.', planIcin: 'Plan a visit to {k}',
      trCip: 'Türkiye · {n} places', trH: 'Philosophy Map of Türkiye', trGiris: 'Philosophy began on this coast. Zoom in to {n} places across Anatolia, from Göbeklitepe to Mevlânâ, each with a short entry, a walking route and a passport stamp.', trTam: 'Open the full Türkiye map: routes, passport →', trYakin: 'Zoom into Türkiye: {n} places', trGeri: 'All of Türkiye', yerSayfa: 'Read the full entry →', yerHarita: 'On the Türkiye map →', rotada: 'On the world route' },
    tr: { etiket: 'ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ', baslik: 'Dünya Felsefe Rotası', alt: 'Milet\'ten Kyoto\'ya: 29 yerde 2.600 yıllık düşünce', giris: 'Felsefe Anadolu kıyısında başladı ama hiçbir zaman yalnız Yunan değildi. Soruların yolculuğunu izle: Hindistan\'a ve Çin\'e, Bağdat\'ın ve Kurtuba\'nın hikmet evlerinden Timbuktu\'ya, İsfahan\'a ve Meksika\'ya, oradan Königsberg\'e ve Kyoto\'ya.',
      basla: 'Yolculuğa başla', oku: 'Rotayı oku', fikir: 'Ana fikir', dusun: 'Düşün', kaynak: 'Daha fazlası', arslan: 'Türkçe okuma önerisi: Ahmet Arslan, İlkçağ Felsefe Tarihi (İstanbul Bilgi Üniversitesi Yayınları)', arslanCilt: { 1: 'Sokrates öncesi filozoflar cildi', 2: 'Sokrates, Platon ve Aristoteles ciltleri', 4: 'Helenistik dönem cildi' },
      yer: 'Bu yeri Türkiye\'de gez', bag: 'Türkiye\'de ilgili yer', onceki: 'Önceki', sonraki: 'Sonraki', kapat: 'Kapat', kurede: 'Kürede göster', bitis: 'Küreye dön', tumu: 'Bütün dünya', foto: 'Fotoğraf', kapakH: 'Çağ çağ rota', kapakAlt: 'Her durak kısa ve kaynaklı bir madde. Özetler Stanford Encyclopedia of Philosophy ve bağlantısı verilen kaynaklardan bu site için yazılmıştır. Sayfaları oklarla, kaydırarak ya da klavyenin ok tuşlarıyla çevir.', durakSay: '{n} durak', kurePasif: '3D küre için WebGL gerekiyor. Rotanın tamamını yine de okuyabilirsin.', ipucu: 'Küreyi çevirmek için sürükle', turkiye: 'Türkiye Felsefe Haritası', turkiyeAlt: 'Anadolu\'da 22 yer, rotalar ve pasaport', fotoH: 'Fotoğraf atıfları', fotoNot: 'Fotoğraflar Wikimedia Commons\'tan, gösterilen lisanslarla. Harita verisi © Mapbox © OpenStreetMap.', sayfa: 'Sayfa', nav: ['Pasaport'], ust: ['Keşfet', 'Anla', 'Deneyimle'], icindekiler: 'İçindekiler',
      plan: 'Ziyaretini planla', planKisa: 'Planla', planNerede: 'Nereye gidiyorsun?', planKal: 'Yakında kal', planTur: 'Turlar ve biletler', planOtel: '{k} otelleri', planTurlar: 'Turlar: {k}', planDunya: 'Dünya rotası', planTr: 'Türkiye', planSayfa: '{k} için pratik notlar →',
      planAcik: 'Hotels.com, GetYourGuide ve Viator bağlantıları ortaklık bağlantısıdır: bunlar üzerinden rezervasyon yaparsan site, sana ek maliyeti olmadan komisyon kazanabilir. Yazdıklarımızı hiçbir zaman etkilemez.',
      planYok: 'Bu yer için rezervasyon bağlantısı vermiyoruz. Bir ziyaret planlamadan önce ülkenin güncel seyahat uyarılarına bak. Rotada bu yeri okumaya devam edebilirsin.', planIcin: '{k} ziyaretini planla',
      trCip: 'Türkiye · {n} yer', trH: 'Türkiye Felsefe Haritası', trGiris: 'Felsefe bu kıyıda başladı. Göbeklitepe\'den Mevlânâ\'ya, Anadolu\'daki {n} yere yakınlaş: her birinde kısa bir madde, bir yürüyüş rotası ve bir pasaport mührü var.', trTam: 'Türkiye haritasının tamamı: rotalar, pasaport →', trYakin: 'Türkiye\'ye yakınlaş: {n} yer', trGeri: 'Bütün Türkiye', yerSayfa: 'Maddenin tamamını oku →', yerHarita: 'Türkiye haritasında →', rotada: 'Dünya rotasında' }
  };
  function h(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function foto(x, dil, buyuk){
    var f = F[x.foto]; if (!f) return '';
    return '<figure class="foto"><img src="' + h(buyuk ? f.src : f.kucuk) + '" srcset="' + h(f.kucuk) + ' 640w, ' + h(f.src) + ' ' + f.w + 'w" sizes="(max-width: 900px) 100vw, 50vw" width="' + f.w + '" height="' + f.h + '" alt="' + h(f.baslik ? f.baslik[dil] : x[dil].ad) + '" loading="lazy" decoding="async">' +
      '<figcaption>' + h(f.baslik ? f.baslik[dil] : '') + ' <a href="' + h(f.kaynak) + '" target="_blank" rel="noopener">' + h(T[dil].foto) + ': ' + h(f.yazar) + '</a>, <a href="' + h(f.lisansUrl) + '" target="_blank" rel="noopener license">' + h(f.lisans) + '</a></figcaption></figure>';
  }
  function govde(x, dil){
    var t = T[dil], m = x[dil], s = '';
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
  /* Sayfa sırası: kapak, her çağ için bir giriş sayfası ve durakları, en sonda fotoğraf atıfları */
  function sira(){
    var s = [{ tur: 'kapak', id: 'oku' }];
    V.caglar.forEach(function(c){ s.push({ tur: 'cag', id: 'cag-' + c.id, cag: c }); V.duraklar.forEach(function(x){ if (x.cag === c.id) s.push({ tur: 'durak', id: x.id, x: x }); }); });
    s.push({ tur: 'atif', id: 'atif' });
    return s;
  }
  function sayfalar(dil){
    var t = T[dil], S = sira(), ilkSayfa = {};
    S.forEach(function(p, k){ if (p.tur === 'cag') ilkSayfa[p.cag.id] = k; });
    return S.map(function(p, k){
      var ic = '';
      if (p.tur === 'kapak'){
        ic = '<div class="kapak"><div class="etiket">' + h(t.etiket) + '</div><h2>' + h(t.kapakH) + '</h2><p class="kapak-alt">' + h(t.kapakAlt) + '</p>' +
          '<h3>' + h(t.icindekiler) + '</h3><ol class="icindekiler">' + V.caglar.map(function(c){
            var n = V.duraklar.filter(function(x){ return x.cag === c.id; }).length;
            return '<li style="--c:' + c.renk + '"><button type="button" data-sayfa="' + ilkSayfa[c.id] + '"><span class="cag-no">' + ROMA[c.no] + '</span><b>' + h(c[dil].ad) + '</b><small>' + h(c[dil].tarih) + ' · ' + h(t.durakSay.replace('{n}', n)) + '</small></button></li>';
          }).join('') + '</ol><a class="tr-kart" href="/turkey"><b>' + h(t.turkiye) + ' →</b><small>' + h(t.turkiyeAlt) + '</small></a></div>';
      } else if (p.tur === 'cag'){
        var c = p.cag;
        ic = '<div class="cag-sayfa" style="--c:' + c.renk + '"><span class="cag-no">' + ROMA[c.no] + '</span><h2>' + h(c[dil].ad) + '</h2><p class="cag-tarih">' + h(c[dil].tarih) + '</p><p class="cag-alt">' + h(c[dil].alt) + '</p><ol class="cag-duraklar">' +
          V.duraklar.map(function(x, i){ return x.cag === c.id ? '<li><button type="button" data-sayfa="' + (k + 1 + V.duraklar.filter(function(y, j){ return y.cag === c.id && j < i; }).length) + '"><span class="no">' + (i + 1) + '</span>' + h(x[dil].ad) + ' <small>' + h(x[dil].kim) + '</small></button></li>' : ''; }).join('') + '</ol></div>';
      } else if (p.tur === 'durak'){
        var x = p.x, m = x[dil], i = SIRA[x.id];
        ic = '<article class="madde" style="--c:' + CAG[x.cag].renk + '"><div class="madde-foto">' + foto(x, dil) + '</div><div class="madde-ic">' +
          '<div class="madde-ust"><span class="no">' + (i + 1) + '</span>' + h(CAG[x.cag][dil].ad) + ' · ' + h(m.ulke) + ' · ' + h(m.tarih) + '</div>' +
          '<h2>' + h(m.ad) + '</h2><p class="kim">' + h(m.kim) + '</p>' + govde(x, dil) +
          '<button type="button" class="kurede" data-git="' + x.id + '">' + h(t.kurede) + '</button></div></article>';
      } else {
        ic = '<div class="atif-sayfa"><h2>' + h(t.fotoH) + '</h2><ol class="atiflar">' + V.duraklar.map(function(x, i){ var f = F[x.foto]; return f ? '<li>' + (i + 1) + '. ' + h(x[dil].ad) + ': <a href="' + h(f.kaynak) + '" target="_blank" rel="noopener">' + h(f.yazar) + '</a>, <a href="' + h(f.lisansUrl) + '" target="_blank" rel="noopener license">' + h(f.lisans) + '</a></li>' : ''; }).join('') + '</ol><p>' + h(t.fotoNot) + '</p><button type="button" class="kurede" data-eylem="okuyucu-kapat">' + h(t.bitis) + '</button></div>';
      }
      return '<section class="sayfa sayfa-' + p.tur + '" id="s-' + p.id + '" data-n="' + k + '" aria-roledescription="page">' + ic + '</section>';
    }).join('\n');
  }
  window.DUNYA_SAYFA = { T: T, foto: foto, govde: govde, sira: sira, sayfalar: sayfalar, CAG: CAG, SIRA: SIRA, ROMA: ROMA };
})();
