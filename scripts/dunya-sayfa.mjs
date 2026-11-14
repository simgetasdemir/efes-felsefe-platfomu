// world.html üretir (Dünya Felsefe Rotası). Kaynak: dunya-veri.js + dunya-foto.js.
// Çalıştır: node scripts/dunya-sayfa.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['dunya-veri.js', 'dunya-foto.js']) vm.runInContext(fs.readFileSync(path.join(KOK, f), 'utf8'), ctx);
const V = ctx.window.DUNYA, F = ctx.window.DUNYA_FOTO;
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const CAG = Object.fromEntries(V.caglar.map((c, i) => [c.id, { ...c, no: i }]));
const ROMA = ['I', 'II', 'III', 'IV', 'V'];

const madde = (x, i) => {
  const m = x.en, f = F[x.foto];
  return `<article class="madde" id="madde-${x.id}" style="--c:${CAG[x.cag].renk}"><div class="madde-foto">${f ? `<figure class="foto"><img src="${h(f.kucuk)}" width="${f.w}" height="${f.h}" alt="${h(f.baslik.en)}" loading="lazy" decoding="async"><figcaption>${h(f.baslik.en)} <a href="${h(f.kaynak)}">Photo: ${h(f.yazar)}</a>, <a href="${h(f.lisansUrl)}" rel="license">${h(f.lisans)}</a></figcaption></figure>` : ''}</div><div class="madde-ic">
<div class="madde-ust"><span class="no">${i + 1}</span>${h(m.ulke)} · ${h(m.tarih)}</div><h3>${h(m.ad)}</h3><p class="kim">${h(m.kim)}</p>
<p class="fikir"><span>Key idea</span>${h(m.fikir)}</p><p class="metin">${h(m.metin)}</p><p class="soru"><span>Think</span>${h(m.soru)}</p>
<div class="kaynaklar"><span>Read further</span><ul>${x.kaynak.map(k => `<li><a href="${h(k.url)}">${h(k.ad)}</a></li>`).join('')}</ul></div>${x.yer ? `<a class="tr-yer" href="${x.yer}">Visit this place in Türkiye →</a>` : ''}</div></article>`;
};
const bolumler = V.caglar.map((c, ci) => `<section class="cag-bolum" id="cag-${c.id}" style="--c:${c.renk}"><header><span class="cag-no">${ROMA[ci]}</span><div><h2>${h(c.en.ad)}</h2><p class="cag-tarih">${h(c.en.tarih)}</p><p>${h(c.en.alt)}</p></div></header>
${V.duraklar.map((x, i) => [x, i]).filter(([x]) => x.cag === c.id).map(([x, i]) => madde(x, i)).join('\n')}</section>`).join('\n');

const atiflar = V.duraklar.map((x, i) => { const f = F[x.foto]; return f ? `<li>${i + 1}. ${h(x.en.ad)}: <a href="${h(f.kaynak)}">${h(f.yazar)}</a>, <a href="${h(f.lisansUrl)}" rel="license">${h(f.lisans)}</a></li>` : ''; }).join('');

const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'World Philosophy Route', description: '29 places where philosophy was made, from Miletus to Kyoto, in five eras.', url: 'https://antikyol.com/world',
  itemListElement: V.duraklar.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: x.en.ad, description: x.en.fikir, geo: { '@type': 'GeoCoordinates', latitude: x.lat, longitude: x.lon }, address: { '@type': 'PostalAddress', addressCountry: x.en.ulke } } })) };

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>World Philosophy Route: 29 places from Miletus to Kyoto | Antikyol</title>
<meta name="description" content="A 3D globe route through 2,600 years of philosophy: Miletus, Ephesus, Athens, Varanasi, Qufu, Alexandria, Baghdad, Córdoba, Timbuktu, Isfahan, Königsberg, Kyoto and more. Short sourced entries, Commons photos and a question to think about at every stop.">
<meta name="theme-color" content="#14202E">
<link rel="canonical" href="https://antikyol.com/world">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/og-kare.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Antikyol">
<meta property="og:title" content="World Philosophy Route: from Miletus to Kyoto">
<meta property="og:description" content="29 places, five eras, 2,600 years of thought on a 3D globe.">
<meta property="og:url" content="https://antikyol.com/world">
<meta property="og:image" content="https://antikyol.com/og-dunya.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://api.mapbox.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/dunya.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<header class="site-ust">
  <a class="marka-ana" href="/" aria-label="Antikyol"><img src="/logo.svg" alt="" width="36" height="36"><span class="marka-yazi">antikyol</span></a>
  <nav class="site-nav" aria-label="Site"><a href="/">Türkiye</a><a href="/world" aria-current="page">World route</a><a href="/places/">Places</a><a href="/passport">Passport</a></nav>
  <div class="dil" role="group" aria-label="Dil / Language"><button type="button" data-dil="en">EN</button><button type="button" data-dil="tr">TR</button></div>
</header>
<main>
<section class="kure-bolum" id="kure-bolum" aria-labelledby="baslik">
  <div class="kure" id="kure" aria-label="Globe"></div>
  <div class="kure-bas">
    <div class="etiket" id="etiket">ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ</div>
    <h1 id="baslik">World Philosophy Route</h1>
    <p class="alt" id="alt">From Miletus to Kyoto: 2,600 years of thought in 29 places</p>
    <p class="giris" id="giris"></p>
    <div class="dugmeler"><button type="button" class="btn btn-altin" data-eylem="basla" id="basla">Begin the journey</button><a class="btn btn-hayalet" href="#maddeler" id="oku">Read the route</a></div>
  </div>
  <p class="kure-pasif" id="kure-pasif"></p>
  <span class="ipucu" id="ipucu" aria-hidden="true"></span>
  <div class="caglar" id="caglar" role="group" aria-label="Eras"></div>
  <aside class="panel" id="panel" hidden aria-live="polite"></aside>
</section>
<section class="okuma" aria-labelledby="bolum-h">
  <div class="okuma-bas"><h2 id="bolum-h">The route, era by era</h2><p id="bolum-alt"></p></div>
  <div id="maddeler">
${bolumler}
  </div>
</section>
</main>
<footer class="alt-bilgi">
  <h2 id="foto-h">Photo credits</h2>
  <ol class="atiflar">${atiflar}</ol>
  <p>Photographs from Wikimedia Commons under the licences shown. Map data © Mapbox © OpenStreetMap. <a href="/">Antikyol · Philosophy Map of Türkiye</a></p>
</footer>
<script src="/dunya-veri.js"></script>
<script src="/dunya-foto.js"></script>
<script src="/dunya.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(KOK, 'world.html'), html);
console.log('world.html', html.length, 'bayt');
