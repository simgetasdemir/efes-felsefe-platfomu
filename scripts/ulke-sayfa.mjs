// Ülke Atlası sayfalarını üretir: germany.html, uk.html, usa.html (Türkiye: turkey.html, ayrı).
// Kaynak: ulke-veri.js. Çalıştır: node scripts/ulke-sayfa.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, 'ulke-veri.js'), 'utf8'), ctx);
const { ULKE, ULKELER } = ctx.window;
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const surum = f => crypto.createHash('md5').update(fs.readFileSync(path.join(KOK, f), 'utf8')).digest('hex').slice(0, 8);
const V = { ort: surum('ortaklik.js'), veri: surum('ulke-veri.js'), js: surum('ulke.js'), css: surum('ulke.css'), ua: surum('ulke-atlasi.js'), uacss: surum('ulke-atlasi.css') };
const iki = (en, tr) => `<span class="l-en">${en}</span><span class="l-tr" lang="tr">${tr}</span>`;

function madde(u, y, i){
  const dil = d => {
    const m = y[d];
    const L = d === 'tr' ? { fikir: 'Fikir', gor: 'Bugün ne görülür' } : { fikir: 'The idea', gor: 'What to see today' };
    return `<div class="l-${d}"${d === 'tr' ? ' lang="tr"' : ''}>
      <p class="ust">${h(m.bolge)} · ${h(m.donem)}</p>
      <h2>${h(m.ad)}</h2>
      <p class="kim">${h(m.kim)}</p>
      <p class="ozet">${h(m.ozet)}</p>
      <h3>${L.fikir}</h3>
      <p>${h(m.fikir)}</p>
      <h3>${L.gor}</h3>
      <ul>${m.gor.map(g => `<li>${h(g)}</li>`).join('')}</ul>
    </div>`;
  };
  return `<article class="yer" id="yer-${h(y.id)}" data-no="${i + 1}">
    <span class="yer-no" aria-hidden="true">${i + 1}</span>
    ${dil('en')}
    ${dil('tr')}
    <div class="yer-alt">
      <p class="kaynak"><b>${iki('Read further', 'Daha fazla oku')}</b> ${y.kaynak.map(([e, a]) => `<a href="${h(a)}" target="_blank" rel="noopener">${h(e)}</a>`).join(' · ')}</p>
      <p class="plan"><b>${iki('Plan a visit', 'Ziyaret planla')}</b>
        <a data-otel="hotels" data-kasaba="${h(y.kasaba)}" href="#" target="_blank" rel="sponsored noopener">${iki('Stay nearby', 'Yakında kal')} · Hotels.com</a>
        <a data-tur="getyourguide" data-sorgu="${h(y.tur)}" href="#" target="_blank" rel="sponsored noopener">${iki('Tours', 'Turlar')} · GetYourGuide</a>
        <a data-tur="viator" data-sorgu="${h(y.tur)}" href="#" target="_blank" rel="sponsored noopener">Viator</a></p>
    </div>
  </article>`;
}

for (const [id, u] of Object.entries(ULKE)){
  const url = `https://antikyol.com/${u.sayfa}`;
  const ad = u.yerler.map(y => y.en.ad);
  const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: u.en.baslik, description: u.en.giris, url,
    itemListElement: u.yerler.map((y, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: y.en.ad, description: y.en.ozet,
      url: `${url}#${y.id}`, geo: { '@type': 'GeoCoordinates', latitude: y.lat, longitude: y.lon }, address: { '@type': 'PostalAddress', addressRegion: y.en.bolge, addressCountry: u.iso } } })) };
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${h(u.en.baslik)} · Country Atlas · Antikyol</title>
<meta name="description" content="${h(u.en.giris)} ${h(ad.join(', '))}.">
<meta name="theme-color" content="#14202E">
<link rel="canonical" href="${url}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/og-kare.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Antikyol">
<meta property="og:title" content="${h(u.en.baslik)}">
<meta property="og:description" content="${h(u.en.giris)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://antikyol.com/og-dunya.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://api.mapbox.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/ulke.css?v=${V.css}">
<link rel="stylesheet" href="/ulke-atlasi.css?v=${V.uacss}">
<script>try{ if (JSON.parse(localStorage.getItem('fh-dil')) === 'tr') document.documentElement.lang = 'tr'; }catch(e){}</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<!-- Vercel Web Analytics (çerezsiz sayfa görüntüleme sayacı) -->
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body data-ulke="${id}">
<header class="site-ust">
  <a class="marka-ana" href="/" aria-label="Antikyol"><img src="/logo.svg" alt="" width="36" height="36"><span class="marka-yazi">antikyol</span></a>
  <nav class="site-nav" aria-label="Site"><a href="/passport">${iki('Passport', 'Pasaport')}</a></nav>
  <div class="dil" role="group" aria-label="Dil / Language"><button type="button" data-dil="en">EN</button><button type="button" data-dil="tr">TR</button></div>
</header>
<main>
<section class="harita-bolum" aria-labelledby="baslik">
  <div class="harita" id="harita" aria-label="Map"></div>
  <div class="ua" data-ulke-atlasi data-aktif="${id}"></div>
  <div class="bas">
    <p class="etiket">${iki('Country Atlas', 'Ülke Atlası')} · ${iki(h(u.en.ad), h(u.tr.ad))}</p>
    <h1 id="baslik">${iki(h(u.en.baslik), h(u.tr.baslik))}</h1>
    <p class="giris">${iki(h(u.en.giris), h(u.tr.giris))}</p>
    <a class="btn-liste" href="#yerler">${iki(`All ${u.yerler.length} places ↓`, `${u.yerler.length} mekânın hepsi ↓`)}</a>
  </div>
  <aside class="panel" id="panel" hidden aria-live="polite"></aside>
</section>
<section class="yerler" id="yerler" aria-label="Places">
${u.yerler.map((y, i) => madde(u, y, i)).join('\n')}
  <p class="aciklama" data-aciklama hidden>${iki('Some travel links earn us a small commission at no cost to you. It never decides what we write.', 'Bazı seyahat bağlantıları size ek maliyet olmadan bize küçük bir komisyon kazandırır. Ne yazdığımıza hiçbir zaman bu karar vermez.')}</p>
</section>
</main>
<footer class="alt">
  <nav aria-label="Site">${ULKELER.map(x => `<a href="${x.href}">${iki(h(x.ad.en), h(x.ad.tr))}</a>`).join('')}<a href="/">${iki('World route', 'Dünya rotası')}</a><a href="/places/">${iki('All Türkiye places', 'Türkiye mekânları')}</a><a href="/passport">${iki('Passport', 'Pasaport')}</a></nav>
  <p>${iki('Sources: Stanford Encyclopedia of Philosophy and the sites named in each entry.', 'Kaynaklar: Stanford Encyclopedia of Philosophy ve her maddede adı geçen siteler.')} © Antikyol</p>
</footer>
<script src="/ortaklik.js?v=${V.ort}"></script>
<script src="/ulke-veri.js?v=${V.veri}"></script>
<script src="/ulke-atlasi.js?v=${V.ua}"></script>
<script src="/ulke.js?v=${V.js}"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(KOK, `${u.sayfa}.html`), html);
  console.log(`${u.sayfa}.html`, html.length, 'bayt,', u.yerler.length, 'mekân');
}
