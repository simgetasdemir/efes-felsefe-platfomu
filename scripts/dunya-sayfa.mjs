// index.html (ana sayfa) üretir (Dünya Felsefe Rotası). Kaynak: dunya-veri.js + dunya-foto.js.
// Çalıştır: node scripts/dunya-sayfa.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['dunya-veri.js', 'dunya-foto.js', 'dunya-sayfalar.js']) vm.runInContext(fs.readFileSync(path.join(KOK, f), 'utf8'), ctx);
const V = ctx.window.DUNYA, F = ctx.window.DUNYA_FOTO;
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const CAG = Object.fromEntries(V.caglar.map((c, i) => [c.id, { ...c, no: i }]));
const ROMA = ['I', 'II', 'III', 'IV', 'V'];

const S = ctx.window.DUNYA_SAYFA;
/* ortaklik.js değişince tarayıcı eski kopyayı kullanmasın (sayfalar.mjs ile aynı sürüm) */
const ORT_SURUM = crypto.createHash('md5').update(fs.readFileSync(path.join(KOK, 'ortaklik.js'), 'utf8')).digest('hex').slice(0, 8);
const IKON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>';
const sayfalar = S.sayfalar('en');

const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'World Philosophy Route', description: '29 places where philosophy was made, from Miletus to Kyoto, in five eras.', url: 'https://antikyol.com/',
  itemListElement: V.duraklar.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: x.en.ad, description: x.en.fikir, geo: { '@type': 'GeoCoordinates', latitude: x.lat, longitude: x.lon }, address: { '@type': 'PostalAddress', addressCountry: x.en.ulke } } })) };

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Antikyol · World Philosophy Route: 29 places from Miletus to Kyoto</title>
<meta name="description" content="A 3D globe route through 2,600 years of philosophy: Miletus, Ephesus, Athens, Varanasi, Qufu, Alexandria, Baghdad, Córdoba, Timbuktu, Isfahan, Königsberg, Kyoto and more. Short sourced entries, Commons photos and a question to think about at every stop, plus a philosophy map of Türkiye.">
<meta name="theme-color" content="#14202E">
<link rel="canonical" href="https://antikyol.com/">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/og-kare.png">
<link rel="manifest" href="/harita.webmanifest">
<script>/* Eski Türkiye haritası adresleri (/#efes, /#kesfet, /#gez-...) artık /turkey'de */
(function(){ var h = location.hash.slice(1), dunya = ${JSON.stringify(V.duraklar.map(x => x.id))};
  if (h && h !== 'oku' && h.indexOf('oku-') !== 0 && h.indexOf('turkiye') !== 0 && dunya.indexOf(decodeURIComponent(h)) < 0) location.replace('/turkey' + location.hash); })();</script>
<meta property="og:type" content="website">
<meta property="og:site_name" content="Antikyol">
<meta property="og:locale" content="en_GB">
<meta property="og:locale:alternate" content="tr_TR">
<meta property="og:title" content="World Philosophy Route: from Miletus to Kyoto">
<meta property="og:description" content="29 places, five eras, 2,600 years of thought on a 3D globe.">
<meta property="og:url" content="https://antikyol.com/">
<meta property="og:image" content="https://antikyol.com/og-dunya.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://api.mapbox.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/dunya.css">
<link rel="stylesheet" href="/ulke-atlasi.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Antikyol', url: 'https://antikyol.com/', inLanguage: ['en', 'tr'], alternateName: ['World Philosophy Route', 'Dünya Felsefe Rotası'] })}</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="ev">
<header class="site-ust">
  <a class="marka-ana" href="/" aria-label="Antikyol"><img src="/logo.svg" alt="" width="36" height="36"><span class="marka-yazi">antikyol</span></a>
  <nav class="site-nav" aria-label="Site"><a href="/passport">Passport</a></nav>
  <div class="dil" role="group" aria-label="Dil / Language"><button type="button" data-dil="en">EN</button><button type="button" data-dil="tr">TR</button></div>
</header>
<main class="kure-bolum" id="kure-bolum" aria-labelledby="baslik">
  <div class="kure" id="kure" aria-label="Globe"></div>
  <div class="ua" data-ulke-atlasi data-aktif=""></div>
  <div class="ust-dugmeler" role="group" aria-label="Menu"><button type="button" class="ust-ana" data-eylem="kesfet">Explore</button><button type="button" data-eylem="okuyucu">Understand</button><button type="button" data-eylem="basla">Experience</button></div>
  <div class="kure-bas">
    <div class="etiket" id="etiket">ΦΙΛΟΣΟΦΙΑ · ΚΟΣΜΟΣ</div>
    <h1 id="baslik">World Philosophy Route</h1>
    <p class="alt" id="alt">From Miletus to Kyoto: 2,600 years of thought in 29 places</p>
    <p class="giris" id="giris"></p>
    <p class="kure-pasif" id="kure-pasif"></p>
  </div>
  <span class="ipucu" id="ipucu" aria-hidden="true"></span>
  <div class="caglar" id="caglar" role="group" aria-label="Eras"></div>
  <aside class="panel" id="panel" hidden aria-live="polite"></aside>
  <button type="button" class="plan-dugme" id="plan-dugme" data-eylem="plan" aria-haspopup="dialog" aria-controls="plan">${IKON}<span>Plan your visit</span></button>
</main>
<div class="okuyucu" id="okuyucu" role="dialog" aria-modal="true" aria-label="World Philosophy Route" aria-hidden="true">
  <div class="o-ust"><span class="o-cubuk-yol"><span class="o-cubuk" id="o-cubuk"></span></span><span class="o-sayac" id="o-sayac"></span><button type="button" class="o-plan" id="o-plan" data-eylem="plan" aria-haspopup="dialog" aria-controls="plan" aria-label="Plan your visit">${IKON}<span>Plan</span></button><button type="button" class="o-kapat" id="o-kapat" data-eylem="okuyucu-kapat" aria-label="Close">×</button></div>
  <div class="o-pencere"><div class="sayfalar" id="sayfalar">
${sayfalar}
  </div></div>
  <button type="button" class="o-ok o-onceki" id="o-onceki" data-eylem="o-onceki" aria-label="Previous">‹</button>
  <button type="button" class="o-ok o-sonraki" id="o-sonraki" data-eylem="o-sonraki" aria-label="Next">›</button>
</div>
<div class="plan-ort" id="plan-ort" data-eylem="plan-kapat" hidden></div>
<aside class="plan" id="plan" role="dialog" aria-modal="true" aria-labelledby="plan-baslik" aria-hidden="true"></aside>
<script src="/ortaklik.js?v=${ORT_SURUM}"></script>
<script src="/yer-veri.js"></script>
<script src="/dunya-veri.js"></script>
<script src="/dunya-foto.js"></script>
<script src="/dunya-sayfalar.js"></script>
<script src="/dunya.js"></script>
<script src="/ulke-veri.js"></script>
<script src="/ulke-atlasi.js"></script>
<script>if ('serviceWorker' in navigator) window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });</script>
</body>
</html>
`;
fs.writeFileSync(path.join(KOK, 'index.html'), html);
console.log('index.html', html.length, 'bayt');
