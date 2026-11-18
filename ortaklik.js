/* ==========================================================================
   ORTAKLIK (AFFILIATE) AYARLARI: TEK AYAR YERİ
   --------------------------------------------------------------------------
   Ana sayfa küresi (index.html), Türkiye haritası (turkey.html), mekân ve rehber sayfaları bu dosyayı okur.
   Bir kimliği boş bırakırsan bağlantı yine çalışır, yalnızca komisyon gelmez.
   Herhangi bir kimlik dolunca sayfalar ortaklık açıklamasını kendiliğinden gösterir.

   Başvuru adresleri ve adımlar README.md içinde, "Gelir ve ortaklıklar" bölümünde.
   ========================================================================== */
window.ORTAKLIK = {
  /* Booking.com: şimdilik kapalı (goster: false); başvurulmadı. Haziran 2025'ten beri ortaklık Awin ağı üzerinden yürüyor.
     awinaffid: Awin yayıncı kimliğin (panelin sağ üstü), awinmid: Booking.com programının Awin kimliği.
     İkisi doluysa bağlantılar Awin üzerinden gider. Eski doğrudan programın "aid" numarası varsa aid'e yaz. */
  booking: { goster: false, aid: '', awinmid: '', awinaffid: '' },

  /* Hotels.com (Expedia Group Travel Creator Program).
     parametreler: Link builder'ın verdiği bağlantıdaki takip kısmı ("destination=..." dışındaki her şey).
     Site her kasaba için Hotels.com aramasını bu parametrelerle kurar.
     baglantilar: bir kasaba için panelden ayrıca bağlantı üretirsen buraya yapıştır; o kasabada bu kullanılır. */
  hotels: { goster: true,
    parametreler: 'clickref=1101lE8SjmCG&rffrid=aff.hcom.US.038.000.1011l444930.kwrd%3D1101lE8SjmCG&affcid=HCOM-US.DIRECT.PHG.1011l444930&afflid=1101lE8SjmCG&affdtl=PHG.1101lE8SjmCG.PZuCgXVVHz',
    baglantilar: {
    'Selçuk': 'https://www.hotels.com/Hotel-Search?destination=Selcuk%2C%20Izmir%2C%20Turkey&clickref=1101lE8SjmCG&rffrid=aff.hcom.US.038.000.1011l444930.kwrd%3D1101lE8SjmCG&affcid=HCOM-US.DIRECT.PHG.1011l444930&afflid=1101lE8SjmCG&affdtl=PHG.1101lE8SjmCG.PZuCgXVVHz', 'Kuşadası': '', 'Şirince': '', 'Didim': '', 'Urla': '', 'Behramkale': '', 'Bergama': '',
    'Pamukkale': '', 'Karahayıt': '', 'Denizli': '', 'Karacasu': '', 'Sinop': '', 'Mersin': '', 'Tarsus': '', 'Konya': '',
    'İstanbul': '', 'İznik': '', 'Göreme': 'https://www.hotels.com/Hotel-Search?destination=Goreme%2C%20Nevsehir%2C%20Turkey&clickref=1101lE8SmXRt&rffrid=aff.hcom.US.038.000.1011l444930.kwrd%3D1101lE8SmXRt&affcid=HCOM-US.DIRECT.PHG.1011l444930&afflid=1101lE8SmXRt&affdtl=PHG.1101lE8SmXRt.PZtxEv0egq', 'Antalya': '', 'Side': '', 'Şanlıurfa': '', 'Gaziantep': '', 'Mardin': '', 'Bodrum': '', 'Ürgüp': '', 'Çanakkale': '', 'Kahta': '', 'Kalkan': '', 'Kaş': ''
  } },

  /* GetYourGuide Partner Program: panelde verilen "partner_id". */
  getyourguide: { goster: true, partner_id: 'FLFFSW2' },

  /* Viator Affiliate Program: panelde verilen "pid" (P00 ile başlar) ve "mcid". */
  viator: { goster: true, pid: 'P00331749', mcid: '42383', campaign: 'antikyol' },

  /* Sesli rehber paketi bekleme listesi: bir form adresi (Tally, Google Forms, Mailchimp...).
     Boşsa bölüm "yakında" olarak görünür ve yalnızca ücretsiz Efes rehberine yönlendirir. */
  sesliRehber: { kayit: '' },

  /* KİTAPLAR: okuma önerilerinin yanındaki "Kitabı bul" bağlantıları.
     Kimlik boşken bağlantılar yine kitap aramasına gider, yalnızca komisyon gelmez.
     amazonTr: Amazon.com.tr Ortaklık Programı'nın verdiği takip kimliği (ör. antikyol-21).
     amazon:   Amazon Associates (amazon.com) takip kimliği (ör. antikyol-20).
     kitapyurdu, dr: bir ortaklık ağının verdiği derin bağlantı şablonu;
               şablonda kitap adresinin geleceği yere {url} yaz. Örnek: 'https://ag.example/r?id=123&ulp={url}'
     bookshop: Bookshop.org affiliate kimliği (panelde "Affiliate ID").
     Amazon kimlikleri (amazonTr.tag, amazon.tag) /shop sayfasındaki "Yol çantası" ürünlerinde de kullanılır:
     Amazon Ortaklık kimliği bütün ürünler için geçerlidir. */
  kitap: {
    amazonTr:   { goster: true, tag: '' },
    kitapyurdu: { goster: true, sablon: '' },
    dr:         { goster: true, sablon: '' },
    amazon:     { goster: true, tag: '' },
    bookshop:   { goster: true, id: '' }
  }
};

(function(O){
  var enc = encodeURIComponent;
  /* Hotels.com'un kendi bağlantıları gibi Türkçe harfsiz yaz: İstanbul → Istanbul */
  function ascii(x){ var m = { 'ç':'c','Ç':'C','ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ş':'s','Ş':'S','ü':'u','Ü':'U','â':'a','Â':'A' }; return x.replace(/[çÇğĞıİöÖşŞüÜâÂ]/g, function(c){ return m[c]; }); }
  O.ad = { booking: 'Booking.com', hotels: 'Hotels.com', getyourguide: 'GetYourGuide', viator: 'Viator' };
  O.oteller = function(){ return ['booking', 'hotels'].filter(function(k){ return O[k] && O[k].goster; }); };
  O.turlar = function(){ return ['getyourguide', 'viator'].filter(function(k){ return O[k] && O[k].goster; }); };
  /* kasaba: "Selçuk" gibi kısa ad; arama metnine ülke eklenir. Virgül içeriyorsa ("Kyoto, Japan")
     ülke zaten yazılmıştır, dokunulmaz (dünya rotası durakları). */
  O.otel = function(saglayici, kasaba){
    var tam = kasaba.indexOf(',') > 0, yer = tam ? kasaba : kasaba + ', Türkiye';
    if (saglayici === 'booking'){
      var b = 'https://www.booking.com/searchresults.html?ss=' + enc(yer) + (O.booking.aid ? '&aid=' + enc(O.booking.aid) : '');
      return (O.booking.awinmid && O.booking.awinaffid) ? 'https://www.awin1.com/cread.php?awinmid=' + enc(O.booking.awinmid) + '&awinaffid=' + enc(O.booking.awinaffid) + '&ued=' + enc(b) : b;
    }
    if (saglayici === 'hotels') return (O.hotels.baglantilar && O.hotels.baglantilar[kasaba]) ||
      ('https://www.hotels.com/Hotel-Search?destination=' + enc(tam ? ascii(kasaba) : ascii(kasaba) + ', Turkey') + (O.hotels.parametreler ? '&' + O.hotels.parametreler : ''));
    return '';
  };
  O.tur = function(saglayici, sorgu){
    if (saglayici === 'getyourguide') return 'https://www.getyourguide.com/s/?q=' + enc(sorgu) + (O.getyourguide.partner_id ? '&partner_id=' + enc(O.getyourguide.partner_id) : '');
    if (saglayici === 'viator') return 'https://www.viator.com/searchResults/all?text=' + enc(sorgu) + (O.viator.pid ? '&pid=' + enc(O.viator.pid) + (O.viator.mcid ? '&mcid=' + enc(O.viator.mcid) : '') + '&medium=link' + (O.viator.campaign ? '&campaign=' + enc(O.viator.campaign) : '') : '');
    return '';
  };
  /* Kitapçılar. dil 'tr': Türkçe kitaplar için Türkiye'deki kitapçılar; 'en': İngilizce kitaplar için. */
  O.kitapAd = { amazonTr: 'Amazon.com.tr', kitapyurdu: 'Kitapyurdu', dr: 'D&R', amazon: 'Amazon', bookshop: 'Bookshop.org' };
  O.kitapcilar = function(dil){
    var K = O.kitap || {};
    return (dil === 'en' ? ['bookshop', 'amazon'] : ['amazonTr', 'kitapyurdu', 'dr']).filter(function(k){ return K[k] && K[k].goster; });
  };
  O.kitapAdres = function(s, sorgu, isbn){
    var K = (O.kitap || {})[s] || {}, q = enc(sorgu);
    function sab(x){ return K.sablon ? K.sablon.replace('{url}', enc(x)) : x; }
    if (s === 'amazonTr') return 'https://www.amazon.com.tr/s?k=' + q + '&i=stripbooks' + (K.tag ? '&tag=' + enc(K.tag) : '');
    if (s === 'amazon') return 'https://www.amazon.com/s?k=' + q + '&i=stripbooks' + (K.tag ? '&tag=' + enc(K.tag) : '');
    if (s === 'kitapyurdu') return sab('https://www.kitapyurdu.com/index.php?route=product/search&filter_name=' + q);
    if (s === 'dr') return sab('https://www.dr.com.tr/search?q=' + q);
    if (s === 'bookshop') return (K.id && isbn) ? 'https://bookshop.org/a/' + enc(K.id) + '/' + enc(isbn) : 'https://bookshop.org/search?keywords=' + q;
    return '';
  };
  /* /shop "Yol çantası": kitap dışı ürünler için Amazon araması (aynı ortaklık kimliğiyle). s: 'amazonTr' ya da 'amazon'. */
  O.urunAdres = function(s, sorgu){
    var K = (O.kitap || {})[s] || {};
    return (s === 'amazon' ? 'https://www.amazon.com/s?k=' : 'https://www.amazon.com.tr/s?k=') + enc(sorgu) + (K.tag ? '&tag=' + enc(K.tag) : '');
  };
  /* "Amazon.com.tr · Kitapyurdu · D&R" bağlantıları (HTML). Sayfa üreticileri de bunu kullanır. */
  O.kitapLinkleri = function(dil, sorgu, isbn){
    function h(x){ return String(x).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    return O.kitapcilar(dil).map(function(k){
      return '<a href="' + h(O.kitapAdres(k, sorgu, isbn)) + '" data-kitap="' + k + '" data-sorgu="' + h(sorgu) + '"' + (isbn ? ' data-isbn="' + h(isbn) + '"' : '') + ' target="_blank" rel="sponsored noopener">' + h(O.kitapAd[k]) + '</a>';
    }).join(' · ');
  };
  /* En az bir ortaklık kimliği dolu mu? (açıklama metnini göstermek için) */
  O.kazanc = function(){
    if (O.booking.aid || (O.booking.awinmid && O.booking.awinaffid) || O.hotels.parametreler || O.getyourguide.partner_id || O.viator.pid) return true;
    var b = O.hotels.baglantilar || {}; for (var k in b) if (b[k]) return true;
    var K = O.kitap || {}; for (var j in K) if (K[j].tag || K[j].sablon || K[j].id) return true;
    return false;
  };
  /* Rehber sayfaları için: data-otel="booking" data-kasaba="Selçuk" ya da data-tur="viator" data-sorgu="Ephesus"
     taşıyan bağlantıların adresini kimlikli hâle getirir; gizlenen sağlayıcıları kaldırır. */
  O.guncelle = function(kok){
    (kok || document).querySelectorAll('a[data-otel]').forEach(function(a){
      var s = a.getAttribute('data-otel'); if (!O[s] || !O[s].goster){ a.remove(); return; }
      a.href = O.otel(s, a.getAttribute('data-kasaba'));
    });
    (kok || document).querySelectorAll('a[data-tur]').forEach(function(a){
      var s = a.getAttribute('data-tur'); if (!O[s] || !O[s].goster){ a.remove(); return; }
      a.href = O.tur(s, a.getAttribute('data-sorgu'));
    });
    (kok || document).querySelectorAll('a[data-kitap]').forEach(function(a){
      var s = a.getAttribute('data-kitap'), K = O.kitap || {}; if (!K[s] || !K[s].goster){ a.remove(); return; }
      a.href = O.kitapAdres(s, a.getAttribute('data-sorgu'), a.getAttribute('data-isbn'));
    });
    (kok || document).querySelectorAll('[data-aciklama]').forEach(function(p){ p.hidden = !O.kazanc(); });
  };
})(window.ORTAKLIK);
