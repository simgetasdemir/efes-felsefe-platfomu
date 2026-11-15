/* ==========================================================================
   ÜLKE ATLASI düğmesi: antik madalyon + açılan ülke panosu.
   Kullanım: <div class="ua" data-ulke-atlasi data-aktif="de"></div> ve ulke-veri.js'ten sonra bu dosya.
   Dil, <html lang> değişince kendiliğinden güncellenir.
   ========================================================================== */
(function(){
  if (!window.ULKELER) return;
  var G = '#5A3C15';
  var MAD = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="' + G + '" stroke-width="1.3" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="12.5" stroke-dasharray="1 2.2"/><path d="M4 20h32M20 4v32" stroke-width=".7"/><ellipse cx="20" cy="20" rx="6" ry="16" stroke-width=".8"/><path d="M20 7l2.6 13L20 33l-2.6-13z" fill="' + G + '" fill-opacity=".85"/><path d="M7 20l13-2.6L33 20l-13 2.6z" fill="' + G + '" fill-opacity=".35"/><circle cx="20" cy="20" r="1.6" fill="#E9D29C"/></svg>';
  var EM = {
    sutun: '<path d="M4 6h16M5 4h14M6 6v13M10 6v13M14 6v13M18 6v13M3 20h18"/>',
    baykus: '<path d="M12 4c-4 0-7 3-7 7 0 5 3 9 7 9s7-4 7-9c0-4-3-7-7-7z"/><circle cx="9.3" cy="10" r="1.8"/><circle cx="14.7" cy="10" r="1.8"/><path d="M12 12l-1 2h2zM7 4.5l2 2.5M17 4.5l-2 2.5"/>',
    kalem: '<path d="M19 3C11 5 7 11 6 19l2-1c1-4 3-7 6-9M6 19l-2 2"/><path d="M19 3c-1 6-4 10-9 12"/>',
    kulube: '<path d="M3 20h18M5 20v-7l7-6 7 6v7M10 20v-5h4v5"/><path d="M19 9V5h-2v2.5"/>'
  };
  var T = {
    tr: { ad: 'ÜLKE ATLASI', alt: 'Felsefenin haritaları', sec: 'BİR ÜLKE SEÇ', burada: 'buradasın', mekan: 'Türkiye mekânları listesi', dunya: 'Dünya rotası' },
    en: { ad: 'COUNTRY ATLAS', alt: 'Maps of philosophy', sec: 'CHOOSE A COUNTRY', burada: 'you are here', mekan: 'List of Türkiye places', dunya: 'World route' }
  };
  function h(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dil(){ return document.documentElement.lang === 'tr' ? 'tr' : 'en'; }

  document.querySelectorAll('[data-ulke-atlasi]').forEach(function(kok, n){
    var aktif = kok.getAttribute('data-aktif') || '', acik = false, pid = 'ua-pano-' + n;
    function ciz(){
      var d = dil(), t = T[d];
      kok.innerHTML = '<button type="button" class="ua-btn" aria-expanded="' + acik + '" aria-controls="' + pid + '">' +
        '<span class="ua-mad">' + MAD + '</span><span class="ua-yazi"><b>' + t.ad + '</b><i>' + t.alt + '</i></span><span class="ua-ok" aria-hidden="true">▾</span></button>' +
        '<nav class="ua-pano" id="' + pid + '"' + (acik ? '' : ' hidden') + ' aria-label="' + h(t.ad) + '"><h4>' + t.sec + '</h4>' +
        ULKELER.map(function(u){
          var bu = u.id === aktif;
          return '<a class="ua-ulke' + (bu ? ' sec' : '') + '" href="' + u.href + '"' + (bu ? ' aria-current="page"' : '') + '>' +
            '<span class="em"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' + EM[u.em] + '</svg></span>' +
            '<span><b>' + h(u.ad[d]) + '</b><small>' + h(bu ? t.burada : u.alt[d]) + '</small></span></a>';
        }).join('') + '<p class="ua-alt"><a href="/places/">' + t.mekan + '</a>' + (location.pathname === '/' || location.pathname === '/index.html' ? '' : ' · <a href="/">' + t.dunya + '</a>') + '</p></nav>';
    }
    function ac(v){ acik = v; kok.querySelector('.ua-btn').setAttribute('aria-expanded', v); kok.querySelector('.ua-pano').hidden = !v; kok.classList.toggle('acik', v); }
    ciz();
    kok.addEventListener('click', function(e){ if (e.target.closest('.ua-btn')){ e.stopPropagation(); ac(!acik); } });
    document.addEventListener('click', function(e){ if (acik && !kok.contains(e.target)) ac(false); });
    document.addEventListener('keydown', function(e){ if (acik && e.key === 'Escape'){ ac(false); kok.querySelector('.ua-btn').focus(); } });
    new MutationObserver(function(){ ciz(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  });
})();
