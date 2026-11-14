#!/usr/bin/env node
/* Mekân sayfalarını (places/*.html) ve pasaport verisini (yer-veri.js) üretir.
   Veri tek kaynaktan gelir: index.html içindeki YERLER, SANAT, DERIN, ROTALAR... ve felsefe-veri.js.
   Kullanım: node scripts/sayfalar.mjs   (index.html ya da felsefe-veri.js değişince yeniden çalıştır) */
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { fileURLToPath } from 'url';
const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALAN = 'https://antikyol.com';
const html = fs.readFileSync(path.join(KOK, 'index.html'), 'utf8');

/* "var AD = " ile başlayan bir JS değişmezini dengeli parantez sayarak çıkar */
function blok(ad){
  const i = html.indexOf('var ' + ad + ' = '); if (i < 0) throw new Error(ad);
  let j = i + ('var ' + ad + ' = ').length, d = 0, q = null;
  const bas = j;
  for (; j < html.length; j++){
    const c = html[j];
    if (q){ if (c === '\\'){ j++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`'){ q = c; continue; }
    if (c === '{' || c === '[') d++;
    else if (c === '}' || c === ']'){ d--; if (d === 0){ j++; break; } }
  }
  return vm.runInNewContext('(' + html.slice(bas, j) + ')');
}
const YERLER = blok('YERLER'), RENK = blok('RENK'), AMBLEM = blok('AMBLEM'), SANAT = blok('SANAT'), DERIN = blok('DERIN'),
  ROTALAR = blok('ROTALAR'), BAGLAR = blok('BAGLAR'), YER_ARAMA = blok('YER_ARAMA'), SLUG = blok('SLUG');
const kum = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(KOK, 'felsefe-veri.js'), 'utf8'), kum);
const FELSEFE = kum.window.FELSEFE;

const e = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = encodeURIComponent;
const amblem = (id, renk, b = 56) => `<svg viewBox="0 0 64 64" width="${b}" height="${b}" fill="none" stroke="${renk}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AMBLEM[id]}</svg>`;
const ETIKET = { 'plato.stanford.edu':'SEP', 'iep.utm.edu':'IEP', 'mathshistory.st-andrews.ac.uk':'MacTutor', 'britannica.com':'Britannica', 'whc.unesco.org':'UNESCO', 'wikipedia.org':'Wikipedia', 'perseus.tufts.edu':'Perseus', 'gutenberg.org':'Gutenberg', 'constitution.org':'Montesquieu', 'avalon.law.yale.edu':'Federalist', 'britishmuseum.org':'British Museum', 'uchicago.edu':'LacusCurtius' };
const etiket = u => { for (const k in ETIKET) if (u.includes(k)) return ETIKET[k]; return 'Source'; };

function otel(kasaba, baslik){
  const q = enc(kasaba + ', Türkiye');
  return `<div class="cta"><small>Stay nearby</small><b>${e(baslik)}</b><div class="dugmeler">
<a href="https://www.booking.com/searchresults.html?ss=${q}" data-otel="booking" data-kasaba="${e(kasaba)}" target="_blank" rel="sponsored noopener">Booking.com</a>
<a href="https://www.hotels.com/Hotel-Search?destination=${q}" data-otel="hotels" data-kasaba="${e(kasaba)}" target="_blank" rel="sponsored noopener">Hotels.com</a></div></div>`;
}
function tur(sorgu, baslik){
  const q = enc(sorgu);
  return `<div class="cta tur"><small>Tours and tickets</small><b>${e(baslik)}</b><div class="dugmeler">
<a href="https://www.getyourguide.com/s/?q=${q}" data-tur="getyourguide" data-sorgu="${e(sorgu)}" target="_blank" rel="sponsored noopener">GetYourGuide</a>
<a href="https://www.viator.com/searchResults/all?text=${q}" data-tur="viator" data-sorgu="${e(sorgu)}" target="_blank" rel="sponsored noopener">Viator</a></div></div>`;
}
const ACIKLAMA = '<p class="not" data-aciklama hidden>Some links on this page are affiliate links (Booking.com, Hotels.com, GetYourGuide, Viator). If you book through them, this site may earn a commission at no extra cost to you.</p>';

function ust(){
  return `<header class="ust"><a class="marka" href="/">Philosophy Map of Türkiye</a><nav class="ust-nav"><a href="/">Map</a><a href="/passport">Passport</a><a href="/guides/philosophy-trip-turkey">Guides</a></nav></header>`;
}
function bas(baslik, aciklama, adres, ld, ek = ''){
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(baslik)}</title>
<meta name="description" content="${e(aciklama)}">
${ALAN ? `<link rel="canonical" href="${ALAN}${adres}">\n<meta property="og:url" content="${ALAN}${adres}">` : ''}
<meta property="og:type" content="article">
<meta property="og:title" content="${e(baslik)}">
<meta property="og:description" content="${e(aciklama)}">
<meta property="og:image" content="${ALAN}/og-harita.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1F2A36">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<link rel="stylesheet" href="/guides/rehber.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>${ek}
</head>
<body>
${ust()}`;
}
const SON = `<footer>Ideas are summarised in this site's own words from the Stanford Encyclopedia of Philosophy and the other sources linked on each page. Travel times are approximate; check opening hours before you go.</footer>
<script src="/ortaklik.js"></script>
<script>ORTAKLIK.guncelle();</script>`;

const yerBul = id => YERLER.find(y => y.id === id);
fs.mkdirSync(path.join(KOK, 'places'), { recursive: true });
YERLER.forEach((yer, i) => {
  const m = yer.en, F = FELSEFE[yer.id], f = F && F.en, S = SANAT[yer.id], Dr = DERIN[yer.id].en, renk = RENK[yer.id], s = yer.soz, slug = SLUG[yer.id];
  const adres = '/places/' + slug;
  const baslik = `${m.ad}: ${m.kim.split(/[,;]/)[0]}, what to see and where to stay`;
  const aciklama = (m.neden.length > 150 ? m.neden.slice(0, m.neden.lastIndexOf(' ', 150)) + '…' : m.neden);
  const ld = { '@context':'https://schema.org', '@graph':[
    { '@type':'TouristAttraction', name:m.ad, description:m.neden, geo:{ '@type':'GeoCoordinates', latitude:yer.lat, longitude:yer.lon }, address:{ '@type':'PostalAddress', addressRegion:m.il, addressCountry:'TR' } },
    { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Philosophy Map of Türkiye', item:(ALAN || '') + '/' }, { '@type':'ListItem', position:2, name:m.ad, item:(ALAN || '') + adres }] } ] };
  const rotalar = ROTALAR.filter(r => r.duraklar.includes(yer.id));
  const baglar = BAGLAR.filter(b => b.a === yer.id || b.b === yer.id);
  const onceki = YERLER[(i + YERLER.length - 1) % YERLER.length], sonraki = YERLER[(i + 1) % YERLER.length];
  const ara = YER_ARAMA[yer.id];
  const soz = `<figure class="soz-blok" style="--r:${renk}"><small>${s.eser ? 'Key work' : 'In their words'}</small><blockquote>${s.eser ? '' : '“'}${e(s.en)}${s.eser ? '' : '”'}</blockquote><figcaption>${e(s.kaynakEn)}${s.birincil ? ` · <a href="${e(s.birincil[1])}" target="_blank" rel="noopener">primary source</a>` : ''}</figcaption></figure>`;
  const govde = `
<main class="yer-sayfa" style="--r:${renk}">
<nav class="kirinti" aria-label="Breadcrumb"><a href="/">Map</a> › <span>${e(m.ad)}</span></nav>
<div class="yer-bas"><span class="yer-amblem">${amblem(yer.id, renk, 64)}</span><div><div class="etiket">${i + 1} · ${e(yer.yunan)}</div><h1>${e(m.ad)}</h1><p class="yer-alt">${e(m.il)} · ${e(m.donem)}</p></div></div>
<p class="giris">${e(m.neden)}</p>
<p class="kim"><b>Who:</b> ${e(m.kim)}</p>
${soz}
${ara ? otel(ara.kasaba, 'Hotels in and around ' + ara.kasaba) : ''}
${ara ? tur(ara.tur, 'Guided tours and tickets: ' + m.ad) : ''}
${f ? `<h2>Key ideas</h2><ol class="fikir-liste">${f.fikirler.map(k => `<li><b>${e(k[0])}</b><p>${e(k[1])} <a href="${e(k[2])}" target="_blank" rel="noopener">${e(etiket(k[2]))}${k[3] && k[3] !== etiket(k[2]) ? ' ' + e(k[3]) : ''} ↗</a></p></li>`).join('')}</ol>${F.not ? `<p class="not">${e(F.not.en)}</p>` : ''}` : ''}
${S ? `<h2>Art and monuments</h2><ul class="sanat-liste">${S.en.map(x => `<li><b>${e(x[0])}</b><span>${e(x[1])}</span></li>`).join('')}</ul>` : ''}
<h2>A walk on site</h2><ol class="rota-liste">${m.rota.map(x => `<li><b>${e(x[0])}</b> ${e(x[1])}</li>`).join('')}</ol>
<h2>Listen</h2><p>${e(Dr.dinle)}</p>
<div class="dusun"><small>Think</small><p>${e(Dr.soru)}</p></div>
${f ? `<h2>Timeline</h2><ol class="zaman">${f.hayat.map(z => `<li><span>${e(z[0])}</span><p>${e(z[1])}</p></li>`).join('')}</ol>
<h2>What we don't know</h2><p>${e(f.bilinmeyen)}</p>
<h2>Legacy</h2><p>${e(f.miras)}</p>` : ''}
<div class="muhur-cta"><div><small>Philosophy Passport</small><b>Been here? Collect your stamp.</b></div><button type="button" id="muhur-al" data-yer="${yer.id}">Collect stamp</button><a href="/passport">See your badges →</a></div>
${rotalar.length ? `<h2>Routes that include ${e(m.ad)}</h2><div class="ilgili">${rotalar.map(r => `<a href="/?rota=${r.id}#rota-bolum">${e(r.en.ad)} · ${e(r.en.sure)} →</a>`).join('')}</div>` : ''}
${baglar.length ? `<h2>Connections</h2><ul class="bag-liste">${baglar.map(b => { const o = yerBul(b.a === yer.id ? b.b : b.a); return `<li><a href="/places/${SLUG[o.id]}">${e(o.en.ad)}</a>: ${e(b.en)}</li>`; }).join('')}</ul>` : ''}
<h2>Sources</h2><ul class="kaynak-liste">${(F ? F.kaynak.map(k => [k[0] + ', ' + k[1], k[2]]) : []).concat(yer.kaynaklar).map(k => `<li><a href="${e(k[1])}" target="_blank" rel="noopener">${e(k[0])}</a></li>`).join('')}</ul>
${ACIKLAMA}
<nav class="komsu" aria-label="More places"><a href="/places/${SLUG[onceki.id]}">← ${e(onceki.en.ad)}</a><a href="/places/${SLUG[sonraki.id]}">${e(sonraki.en.ad)} →</a></nav>
<p><a href="/#${yer.id}">Open ${e(m.ad)} on the map →</a></p>
</main>
${SON}
<script>
(function(){
  var b = document.getElementById('muhur-al'), id = b.getAttribute('data-yer'), m = {};
  try { m = JSON.parse(localStorage.getItem('fh-muhur')) || {}; } catch(e){}
  function goster(){ if (m[id]){ b.textContent = 'Stamped · ' + m[id]; b.disabled = true; } }
  goster();
  b.addEventListener('click', function(){ m[id] = new Date().toLocaleDateString('en-GB'); try { localStorage.setItem('fh-muhur', JSON.stringify(m)); } catch(e){} goster(); });
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(KOK, 'places', slug + '.html'), bas(baslik + ' | Philosophy Map of Türkiye', aciklama, adres, ld) + govde);
});

/* Pasaport sayfası için hafif veri */
const veri = {
  yerler: YERLER.map(y => ({ id:y.id, slug:SLUG[y.id], renk:RENK[y.id], amblem:AMBLEM[y.id], yunan:y.yunan, mh:y.mh || y.tr.kim.split(',')[0], ad:{ tr:y.tr.ad, en:y.en.ad } })),
  rotalar: ROTALAR.map(r => ({ id:r.id, renk:r.renk, duraklar:r.duraklar, ad:{ tr:r.tr.ad, en:r.en.ad } }))
};
fs.writeFileSync(path.join(KOK, 'yer-veri.js'), '/* scripts/sayfalar.mjs üretir; elle düzenleme. */\nwindow.YER_VERI = ' + JSON.stringify(veri) + ';\n');

/* Mekân dizini sayfası */
const dizin = bas('Philosophy and art places in Türkiye: all ' + YERLER.length + ' stops | Philosophy Map of Türkiye',
  'All ' + YERLER.length + ' places on the Philosophy Map of Türkiye, from Göbekli Tepe and Troy to Ephesus, Cappadocia and Konya, each with its ideas, art and where to stay.',
  '/places/', { '@context':'https://schema.org', '@type':'ItemList', itemListElement: YERLER.map((y, i) => ({ '@type':'ListItem', position:i + 1, name:y.en.ad, url:(ALAN || '') + '/places/' + SLUG[y.id] })) }) + `
<main>
<div class="etiket">All places</div>
<h1>${YERLER.length} places where philosophy and art were born in Türkiye</h1>
<p class="giris">Each page gathers the key ideas, the art and monuments, a short walk on site and where to stay nearby.</p>
<div class="yer-izgara">${YERLER.map((y, i) => `<a href="/places/${SLUG[y.id]}" style="--r:${RENK[y.id]}"><span class="yer-amblem">${amblem(y.id, RENK[y.id], 40)}</span><span><b>${e(y.en.ad)}</b><small>${e(y.en.kim.split(/[,;]/)[0])}</small></span></a>`).join('')}</div>
</main>
${SON}
</body>
</html>
`;
fs.writeFileSync(path.join(KOK, 'places', 'index.html'), dizin);
console.log('places:', YERLER.length, '+ index, yer-veri.js');
