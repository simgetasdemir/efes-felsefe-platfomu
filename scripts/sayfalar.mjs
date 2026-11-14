#!/usr/bin/env node
/* Mekân sayfalarını (places/*.html) ve pasaport verisini (yer-veri.js) üretir.
   Veri tek kaynaktan gelir: index.html içindeki YERLER, SANAT, DERIN, ROTALAR... ve felsefe-veri.js.
   Kullanım: node scripts/sayfalar.mjs   (index.html ya da felsefe-veri.js değişince yeniden çalıştır) */
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { fileURLToPath } from 'url';
const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALAN = 'https://antikyol.com';
let html = fs.readFileSync(path.join(KOK, 'index.html'), 'utf8');

/* Ortaklık bağlantıları: ortaklik.js'i burada da çalıştır, statik adresler JS'siz de takip kodlu olsun.
   Sürüm (ORT_SURUM) değişince tarayıcılar eski ortaklik.js kopyasını kullanmaz. */
const ortKod = fs.readFileSync(path.join(KOK, 'ortaklik.js'), 'utf8');
const ortBaglam = { window: {} }; vm.runInNewContext(ortKod, ortBaglam);
const ORT = ortBaglam.window.ORTAKLIK;
const ORT_SURUM = (await import('crypto')).createHash('md5').update(ortKod).digest('hex').slice(0, 8);
const yeniHtml = html.replace(/<script src="\/?ortaklik\.js(\?v=[0-9a-f]+)?"><\/script>/, '<script src="/ortaklik.js?v=' + ORT_SURUM + '"></script>');
if (yeniHtml !== html) { fs.writeFileSync(path.join(KOK, 'index.html'), yeniHtml); html = yeniHtml; }
fs.writeFileSync(path.join(KOK, 'scripts', 'ortaklik-surum.txt'), ORT_SURUM + '\n');

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
const FELSEFE = kum.window.FELSEFE, OKUMA = kum.window.OKUMA_ARSLAN || {};

const e = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = encodeURIComponent;
const amblem = (id, renk, b = 56) => `<svg viewBox="0 0 64 64" width="${b}" height="${b}" fill="none" stroke="${renk}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AMBLEM[id]}</svg>`;
const ETIKET = { 'plato.stanford.edu':'SEP', 'iep.utm.edu':'IEP', 'mathshistory.st-andrews.ac.uk':'MacTutor', 'britannica.com':'Britannica', 'whc.unesco.org':'UNESCO', 'wikipedia.org':'Wikipedia', 'perseus.tufts.edu':'Perseus', 'gutenberg.org':'Gutenberg', 'constitution.org':'Montesquieu', 'avalon.law.yale.edu':'Federalist', 'britishmuseum.org':'British Museum', 'uchicago.edu':'LacusCurtius' };
const etiket = u => { for (const k in ETIKET) if (u.includes(k)) return ETIKET[k]; return 'Source'; };

function otel(kasaba, baslik){
  return `<div class="cta"><small>Stay nearby</small><b>${e(baslik)}</b><div class="dugmeler">
<a href="${e(ORT.otel('booking', kasaba))}" data-otel="booking" data-kasaba="${e(kasaba)}" target="_blank" rel="sponsored noopener">Booking.com</a>
<a href="${e(ORT.otel('hotels', kasaba))}" data-otel="hotels" data-kasaba="${e(kasaba)}" target="_blank" rel="sponsored noopener">Hotels.com</a></div></div>`;
}
function tur(sorgu, baslik){
  const q = enc(sorgu);
  return `<div class="cta tur"><small>Tours and tickets</small><b>${e(baslik)}</b><div class="dugmeler">
<a href="https://www.getyourguide.com/s/?q=${q}" data-tur="getyourguide" data-sorgu="${e(sorgu)}" target="_blank" rel="sponsored noopener">GetYourGuide</a>
<a href="https://www.viator.com/searchResults/all?text=${q}" data-tur="viator" data-sorgu="${e(sorgu)}" target="_blank" rel="sponsored noopener">Viator</a></div></div>`;
}
const ACIKLAMA = '<p class="not" data-aciklama hidden>Some links on this page are affiliate links (Booking.com, Hotels.com, GetYourGuide, Viator). If you book through them, this site may earn a commission at no extra cost to you.</p>';

function ust(){
  return `<header class="ust"><a class="marka" href="/"><img src="/logo.svg" alt="" width="34" height="34"><span>Antikyol</span></a><nav class="ust-nav"><a href="/#kesfet">Explore</a><a href="/places/">Places</a><a href="/guides/philosophy-trip-turkey">Guides</a><a href="/passport">Passport</a></nav></header>`;
}
function bas(baslik, aciklama, adres, ld, ek = ''){
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<title>${e(baslik)}</title>
<meta name="description" content="${e(aciklama)}">
${ALAN ? `<link rel="canonical" href="${ALAN}${adres}">\n<meta property="og:url" content="${ALAN}${adres}">` : ''}
<meta property="og:type" content="article">
<meta property="og:title" content="${e(baslik)}">
<meta property="og:description" content="${e(aciklama)}">
<meta property="og:image" content="${ALAN}/og-harita.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14202E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/guides/rehber.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>${ek}
</head>
<body>
${ust()}`;
}
const SON = `<footer>Ideas are summarised in this site's own words from the Stanford Encyclopedia of Philosophy and the other sources linked on each page. Travel times are approximate; check opening hours before you go.</footer>
<script src="/ortaklik.js?v=${ORT_SURUM}"></script>
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
    { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Antikyol', item:(ALAN || '') + '/' }, { '@type':'ListItem', position:2, name:m.ad, item:(ALAN || '') + adres }] } ] };
  const rotalar = ROTALAR.filter(r => r.duraklar.includes(yer.id));
  const baglar = BAGLAR.filter(b => b.a === yer.id || b.b === yer.id);
  const onceki = YERLER[(i + YERLER.length - 1) % YERLER.length], sonraki = YERLER[(i + 1) % YERLER.length];
  const ara = YER_ARAMA[yer.id];
  const soz = `<figure class="soz-blok" style="--r:${renk}"><small>${s.eser ? 'Key work' : 'In their words'}</small><blockquote>${s.eser ? '' : '“'}${e(s.en)}${s.eser ? '' : '”'}</blockquote><figcaption>${e(s.kaynakEn)}${s.birincil ? ` · <a href="${e(s.birincil[1])}" target="_blank" rel="noopener">primary source</a>` : ''}</figcaption></figure>`;
  const govde = `
<section class="yer-kapak" style="--r:${renk}"><div class="yk-ic">
<nav class="kirinti" aria-label="Breadcrumb"><a href="/">Map</a> › <a href="/places/">Places</a> › <span>${e(m.ad)}</span></nav>
<div class="yer-bas"><span class="yer-amblem">${amblem(yer.id, renk, 64)}</span><div><div class="etiket">${i + 1} · ${e(yer.yunan)}</div><h1>${e(m.ad)}</h1><p class="yer-alt">${e(m.il)} · ${e(m.donem)}</p></div></div>
<div class="yk-dugmeler"><a class="yk-gezi" href="/walk/${slug}">Walk through ${e(m.ad)} →</a><a class="yk-harita" href="/#${yer.id}">See it on the map</a>${f ? '<a class="yk-harita" href="#key-ideas">Key ideas ↓</a>' : ''}</div>
</div></section>
<div class="yer-duzen">
<aside class="icindekiler" aria-label="On this page">@@ICINDEKILER@@</aside>
<main class="yer-sayfa" style="--r:${renk}">
<p class="giris">${e(m.neden)}</p>
<p class="kim"><b>Who:</b> ${e(m.kim)}</p>
${soz}

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
${ara ? `<h2>If you want to go</h2><p>${e(m.ad)} is a place you can still walk through. If reading about ${e(m.kim.split(/[,;]/)[0])} makes you want to see it, these are the nearest places to stay and the guided visits on offer.</p>${otel(ara.kasaba, 'Stay in or near ' + ara.kasaba)}${tur(ara.tur, 'Guided visits: ' + m.ad)}` : ''}
${yer.id in OKUMA ? `<aside class="okuma"><small>Further reading in Turkish</small><b>Ahmet Arslan, <i>İlkçağ Felsefe Tarihi</i></b><span>${OKUMA[yer.id] ? e(OKUMA[yer.id].replace('Cilt', 'Vol.')) + ' · ' : ''}İstanbul Bilgi Üniversitesi Yayınları</span><p>The standard Turkish history of ancient philosophy, by the philosopher Ahmet Arslan. A natural next step after this page for Turkish readers.</p></aside>` : ''}
<h2>Sources</h2><ul class="kaynak-liste">${(F ? F.kaynak.map(k => [k[0] + ', ' + k[1], k[2]]) : []).concat(yer.kaynaklar).map(k => `<li><a href="${e(k[1])}" target="_blank" rel="noopener">${e(k[0])}</a></li>`).join('')}</ul>
${ACIKLAMA}
<nav class="komsu" aria-label="More places"><a href="/places/${SLUG[onceki.id]}">← ${e(onceki.en.ad)}</a><a href="/places/${SLUG[sonraki.id]}">${e(sonraki.en.ad)} →</a></nav>
<p><a href="/#${yer.id}">Open ${e(m.ad)} on the map →</a></p>
</main>
</div>
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
  const kim = t => t.replace(/<[^>]+>/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const basliklar = [];
  let g = govde.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, x) => { const id = kim(x); basliklar.push([id, x]); return `<h2 id="${id}">${x}</h2>`; });
  g = g.replace('@@ICINDEKILER@@', '<small>On this page</small><ol>' + basliklar.map(b => `<li><a href="#${b[0]}">${b[1]}</a></li>`).join('') + '</ol>');
  fs.writeFileSync(path.join(KOK, 'places', slug + '.html'), bas(baslik + ' | Antikyol', aciklama, adres, ld) + g);
});

/* Pasaport sayfası için hafif veri */
const veri = {
  yerler: YERLER.map(y => ({ id:y.id, slug:SLUG[y.id], renk:RENK[y.id], amblem:AMBLEM[y.id], yunan:y.yunan, mh:y.mh || y.tr.kim.split(',')[0], ad:{ tr:y.tr.ad, en:y.en.ad } })),
  rotalar: ROTALAR.map(r => ({ id:r.id, renk:r.renk, duraklar:r.duraklar, ad:{ tr:r.tr.ad, en:r.en.ad } }))
};
fs.writeFileSync(path.join(KOK, 'yer-veri.js'), '/* scripts/sayfalar.mjs üretir; elle düzenleme. */\nwindow.YER_VERI = ' + JSON.stringify(veri) + ';\n');

/* Mekân dizini sayfası */
const dizin = bas('Philosophy and art places in Türkiye: all ' + YERLER.length + ' stops | Antikyol',
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

/* ==========================================================================
   SANAL GEZİ: /walk/<slug>. Durak durak yürüyüş: giriş, yerinde duraklar
   (her biri bir ana fikirle), düşünme sorusu ve okuma önerisi.
   Fotoğraflar gezi-foto.js'ten; yoksa özgün çizim.
   ========================================================================== */
/* foto-veri.js (varsa): window.FOTOLAR = { <yer.id>: [ { src, kucuk, w, h, baslik:{tr,en}, yazar, lisans, lisansUrl, kaynak }, ... ] }
   Sıra = gezi sırası: 0 giriş, 1..n yerindeki duraklar, n+1 kapanış. */
const fvYol = path.join(KOK, 'foto-veri.js'), gfKum = { window: {} };
if (fs.existsSync(fvYol)) vm.runInNewContext(fs.readFileSync(fvYol, 'utf8'), gfKum);
const FOTOLAR = gfKum.window.FOTOLAR || {};
fs.mkdirSync(path.join(KOK, 'walk'), { recursive: true });
YERLER.forEach((yer, i) => {
  const m = yer.en, F = FELSEFE[yer.id], f = F && F.en, Dr = DERIN[yer.id].en, renk = RENK[yer.id], slug = SLUG[yer.id], s = yer.soz;
  const fotolar = FOTOLAR[yer.id] || [];
  const gorsel = n => { const ft = fotolar[n];
    if (ft) return `<div class="gz-gorsel foto"><img src="${e(ft.src)}"${ft.kucuk ? ` srcset="${e(ft.kucuk)} 640w, ${e(ft.src)} ${ft.w || 1600}w" sizes="100vw"` : ''}${ft.w ? ` width="${ft.w}" height="${ft.h}"` : ''} alt="${e(ft.baslik ? ft.baslik.en : '')}" ${n ? 'loading="lazy"' : ''} decoding="async"></div><small class="gz-atif">Photo: <a href="${e(ft.kaynak)}" target="_blank" rel="noopener">${e(ft.yazar)}</a> · ${ft.lisansUrl ? `<a href="${e(ft.lisansUrl)}" target="_blank" rel="noopener">${e(ft.lisans)}</a>` : e(ft.lisans)}</small>`;
    return `<div class="gz-gorsel cizim" aria-hidden="true"><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="g${n}" cx="${70 - n * 9}%" cy="${30 + n * 6}%" r="80%"><stop offset="0" stop-color="#E8D3A6" stop-opacity=".35"/><stop offset="1" stop-color="#E8D3A6" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="${renk}"/><rect width="1600" height="900" fill="#14202E" opacity=".55"/><rect width="1600" height="900" fill="url(#g${n})"/><path d="M0 ${700 - n * 14} Q400 ${640 - n * 10} 800 ${690 - n * 6} T1600 ${660 + n * 8} V900 H0z" fill="#0B141F" opacity=".55"/><g transform="translate(1080 ${180 + n * 20}) scale(5.5)" fill="none" stroke="#F6EBD4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".22">${AMBLEM[yer.id]}</g></svg></div>`; };
  const fikir = k => f && f.fikirler[k] ? `<div class="gz-fikir"><small>Idea</small><b>${e(f.fikirler[k][0])}</b><p>${e(f.fikirler[k][1])} <a href="${e(f.fikirler[k][2])}" target="_blank" rel="noopener">${e(etiket(f.fikirler[k][2]))} ↗</a></p></div>` : '';
  const duraklar = [];
  duraklar.push(`<section class="durak giris-durak" id="d0">${gorsel(0)}<div class="gz-metin"><small class="gz-no">${e(yer.yunan)}</small><h1>Walk through ${e(m.ad)}</h1><p class="gz-alt">${e(m.kim)} · ${e(m.donem)} · ${e(m.il)}</p><p>${e(m.neden)}</p>${s && !s.eser ? `<blockquote>“${e(s.en)}”<cite>${e(s.kaynakEn || s.kaynak)}</cite></blockquote>` : ''}<a class="gz-basla" href="#d1">Begin the walk ↓</a></div></section>`);
  m.rota.forEach((r, k) => duraklar.push(`<section class="durak" id="d${k + 1}">${gorsel(k + 1)}<div class="gz-metin"><small class="gz-no">Stop ${k + 1} of ${m.rota.length}</small><h2>${e(r[0])}</h2><p class="gz-ilk">${e(r[1])}</p>${fikir(k)}</div></section>`));
  const son = m.rota.length + 1;
  duraklar.push(`<section class="durak son-durak" id="d${son}">${gorsel(son)}<div class="gz-metin"><small class="gz-no">Before you leave</small><h2>Sit for a moment</h2><p>${e(Dr.dinle)}</p><div class="gz-fikir dusun"><small>Think</small><p>${e(Dr.soru)}</p></div>${yer.id in OKUMA ? `<p class="gz-okuma">Further reading in Turkish: Ahmet Arslan, <i>İlkçağ Felsefe Tarihi</i>${OKUMA[yer.id] ? ', ' + e(OKUMA[yer.id].replace('Cilt', 'Vol.')) : ''}.</p>` : ''}<div class="gz-son-linkler"><a href="/places/${slug}">Read the full entry →</a>${yer.rehber ? '<a href="/efes">Open the full Ephesus experience →</a>' : ''}<a href="/#${yer.id}">Back to the map</a></div></div></section>`);
  const adres = '/walk/' + slug;
  const baslik = `Virtual walk through ${m.ad}: ${m.kim.split(/[,;]/)[0]} stop by stop`;
  const ld = { '@context':'https://schema.org', '@type':'Article', headline:baslik, about:m.ad, isPartOf:(ALAN || '') + '/places/' + slug };
  const sayfa = bas(baslik + ' | Antikyol', `A stop-by-stop virtual walk through ${m.ad} and the ideas of ${m.kim}.`, adres, ld, '\n<link rel="stylesheet" href="/guides/gezi.css">').replace('<body>', '<body class="gezi-govde">') + `
<main class="gezi" style="--r:${renk}">
<nav class="gz-ilerleme" aria-label="Stops">${duraklar.map((_, k) => `<a href="#d${k}" aria-label="Stop ${k}"></a>`).join('')}</nav>
${duraklar.join('\n')}
</main>
<script>
(function(){ var n = document.querySelectorAll('.gz-ilerleme a'), d = document.querySelectorAll('.durak');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting){ var k = [].indexOf.call(d, x.target); n.forEach(function(a, j){ a.classList.toggle('su', j === k); }); x.target.classList.add('gorundu'); } }); }, { threshold:.55 });
  d.forEach(function(x){ io.observe(x); });
  document.addEventListener('keydown', function(e){ if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return; var k = [].findIndex.call(n, function(a){ return a.classList.contains('su'); }); var h = d[Math.max(0, Math.min(d.length - 1, k + (e.key === 'ArrowDown' ? 1 : -1)))]; if (h){ e.preventDefault(); h.scrollIntoView({ behavior:'smooth' }); } });
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(KOK, 'walk', slug + '.html'), sayfa);
});
console.log('walk:', YERLER.length);
