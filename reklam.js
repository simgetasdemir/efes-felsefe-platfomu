/* ==========================================================================
   REKLAM (GOOGLE ADSENSE) AYARLARI: TEK AYAR YERİ
   --------------------------------------------------------------------------
   Bu dosya yalnızca mekân sayfalarında (/places/...) ve rehber yazılarında (/guides/...) yüklenir.
   Ana sayfa küresi, Türkiye haritası, ülke sayfaları, /efes, /passport ve /walk sayfalarında
   reklam YOKTUR; küre ve kaydırma/klavye gezintisi etkilenmez.

   yayinci boşken hiçbir şey yüklenmez, sayfalar bugünkü gibi kalır.
   Adımlar README.md içinde, "Reklamlar (Google AdSense)" bölümünde.
   ========================================================================== */
window.REKLAM = {
  /* AdSense yayıncı kimliği: AdSense → Hesap → Hesap bilgileri → "Yayıncı kimliği".
     "ca-pub-" ile başlar, ör. 'ca-pub-1234567890123456'. ads.txt dosyasına da aynı numara yazılır. */
  yayinci: '',

  /* Elle yerleştirilen "yazı içi" reklam birimi (isteğe bağlı).
     AdSense → Reklamlar → Reklam birimine göre → "Makale içi" → oluştur; verilen koddaki
     data-ad-slot numarasını buraya yaz. Boşsa yalnızca Otomatik reklamlar (panelden açılırsa) çalışır. */
  yaziIci: '',

  /* Bir sayfaya en fazla kaç elle reklam konsun. */
  enFazla: 2
};

(function(R){
  if (!R.yayinci || !/^ca-pub-\d{10,20}$/.test(R.yayinci)) return;

  var s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + R.yayinci;
  document.head.appendChild(s);

  if (!R.yaziIci) return;

  var main = document.querySelector('main');
  if (!main) return;

  /* Reklamlar ara başlıkların (h2) önüne girer: en fazla iki tane, biri yazının ilk yarısında, biri sona doğru. */
  var basliklar = [].slice.call(main.querySelectorAll(':scope > h2'));
  if (basliklar.length < 3) return;
  /* Uygun yer: ilk iki bölümden sonra, en sondaki kapanış bölümünden ("Keep exploring", "Sources") önce değil,
     ve hemen önünde otel/tur kutusu yok: ortaklık kutusu ile reklam yan yana gelmesin. */
  function ctaMi(el){ return !!el && (el.classList.contains('cta') || !!el.querySelector('.cta')); }
  var uygun = [];
  for (var i = 2; i < basliklar.length - 1; i++) if (!ctaMi(basliklar[i].previousElementSibling)) uygun.push(i);
  var secim = uygun.length ? [uygun[0]] : [];
  if (uygun.length > 1 && uygun[uygun.length - 1] - uygun[0] >= 3) secim.push(uygun[uygun.length - 1]);
  var adaylar = secim.slice(0, R.enFazla).map(function(i){ return basliklar[i]; });
  if (!adaylar.length) return;

  var css = document.createElement('style');
  css.textContent = '.reklam{margin:2rem 0;padding-top:.4rem;border-top:1px solid rgba(127,127,127,.25);min-height:120px}' +
    '.reklam small{display:block;font:600 .68rem/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.55;margin-bottom:.5rem}';
  document.head.appendChild(css);

  adaylar.forEach(function(h){
    var kutu = document.createElement('aside');
    kutu.className = 'reklam';
    kutu.setAttribute('aria-label', 'Advertisement');
    kutu.innerHTML = '<small>Advertisement</small><ins class="adsbygoogle" style="display:block;text-align:center"' +
      ' data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="' + R.yayinci + '" data-ad-slot="' + R.yaziIci + '"></ins>';
    h.parentNode.insertBefore(kutu, h);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
})(window.REKLAM);
