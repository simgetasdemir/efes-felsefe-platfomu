/* ==========================================================================
   ORTAKLIK (AFFILIATE) AYARLARI: TEK AYAR YERİ
   --------------------------------------------------------------------------
   Harita (index.html) ve rehber sayfaları (guides/) bu dosyayı okur.
   Bir kimliği boş bırakırsan bağlantı yine çalışır, yalnızca komisyon gelmez.
   Herhangi bir kimlik dolunca sayfalar ortaklık açıklamasını kendiliğinden gösterir.

   Başvuru adresleri ve adımlar README.md içinde, "Gelir ve ortaklıklar" bölümünde.
   ========================================================================== */
window.ORTAKLIK = {
  /* Booking.com Affiliate Partner Programme: panelde verilen "aid" numarası (yalnızca rakam). */
  booking: { goster: true, aid: '' },

  /* Hotels.com (Expedia Group Travel Creator Program): her kasaba için panelde
     "Links > Create link" ile üretilen bağlantıyı ilgili satıra yapıştır. */
  hotels: { goster: true, baglantilar: {
    'Selçuk': '', 'Kuşadası': '', 'Şirince': '', 'Didim': '', 'Urla': '', 'Behramkale': '', 'Bergama': '',
    'Pamukkale': '', 'Karahayıt': '', 'Denizli': '', 'Karacasu': '', 'Sinop': '', 'Mersin': '', 'Tarsus': '', 'Konya': '',
    'İstanbul': '', 'İznik': '', 'Göreme': '', 'Antalya': '', 'Side': '', 'Şanlıurfa': '', 'Gaziantep': '', 'Mardin': '', 'Bodrum': '', 'Ürgüp': '', 'Çanakkale': '', 'Kahta': '', 'Kalkan': '', 'Kaş': ''
  } },

  /* GetYourGuide Partner Program: panelde verilen "partner_id". */
  getyourguide: { goster: true, partner_id: '' },

  /* Viator Affiliate Program: panelde verilen "pid" (P00 ile başlar) ve "mcid". */
  viator: { goster: true, pid: '', mcid: '' },

  /* Sesli rehber paketi bekleme listesi: bir form adresi (Tally, Google Forms, Mailchimp...).
     Boşsa bölüm "yakında" olarak görünür ve yalnızca ücretsiz Efes rehberine yönlendirir. */
  sesliRehber: { kayit: '' }
};

(function(O){
  var enc = encodeURIComponent;
  O.ad = { booking: 'Booking.com', hotels: 'Hotels.com', getyourguide: 'GetYourGuide', viator: 'Viator' };
  O.oteller = function(){ return ['booking', 'hotels'].filter(function(k){ return O[k] && O[k].goster; }); };
  O.turlar = function(){ return ['getyourguide', 'viator'].filter(function(k){ return O[k] && O[k].goster; }); };
  /* kasaba: "Selçuk" gibi kısa ad; arama metnine ülke eklenir */
  O.otel = function(saglayici, kasaba){
    var yer = kasaba + ', Türkiye';
    if (saglayici === 'booking') return 'https://www.booking.com/searchresults.html?ss=' + enc(yer) + (O.booking.aid ? '&aid=' + enc(O.booking.aid) : '');
    if (saglayici === 'hotels') return (O.hotels.baglantilar && O.hotels.baglantilar[kasaba]) || ('https://www.hotels.com/Hotel-Search?destination=' + enc(yer));
    return '';
  };
  O.tur = function(saglayici, sorgu){
    if (saglayici === 'getyourguide') return 'https://www.getyourguide.com/s/?q=' + enc(sorgu) + (O.getyourguide.partner_id ? '&partner_id=' + enc(O.getyourguide.partner_id) : '');
    if (saglayici === 'viator') return 'https://www.viator.com/searchResults/all?text=' + enc(sorgu) + (O.viator.pid ? '&pid=' + enc(O.viator.pid) + (O.viator.mcid ? '&mcid=' + enc(O.viator.mcid) : '') + '&medium=link' : '');
    return '';
  };
  /* En az bir ortaklık kimliği dolu mu? (açıklama metnini göstermek için) */
  O.kazanc = function(){
    if (O.booking.aid || O.getyourguide.partner_id || O.viator.pid) return true;
    var b = O.hotels.baglantilar || {}; for (var k in b) if (b[k]) return true;
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
    (kok || document).querySelectorAll('[data-aciklama]').forEach(function(p){ p.hidden = !O.kazanc(); });
  };
})(window.ORTAKLIK);
