// Türkiye haritasının SVG yollarını üretir (bir kez çalıştırılır, çıktı turkiye/harita-veri.js).
// Veri: Natural Earth (kamu malı) üzerinden world-atlas@2.0.2 countries-50m.json.
// Kullanım: node scripts/harita-ciz.mjs <countries-50m.json> <topojson-client.js>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const [,, atlasYol, tcYol] = process.argv;
const require = createRequire(import.meta.url);
const topojson = require(tcYol);
const atlas = JSON.parse(fs.readFileSync(atlasYol, 'utf8'));
const ulkeler = topojson.feature(atlas, atlas.objects.countries).features;

// Görünür alan (boylam/enlem) ve eşdikdörtgen izdüşüm, 39° enlemde düzeltilmiş.
const B = { b0: 24.6, b1: 45.4, e0: 34.9, e1: 42.6 };
const K = Math.cos(39 * Math.PI / 180);
const G = 1000, S = G / ((B.b1 - B.b0) * K);
const Y = Math.round((B.e1 - B.e0) * S);
const xy = (lon, lat) => [((lon - B.b0) * K * S), ((B.e1 - lat) * S)];

function halka(h, esik, kirp) {
  let s = '', onc = null;
  for (let [lon, lat] of h) {
    // Komşu ülkeleri görünür alanın biraz dışında kırp (dikdörtgene sıkıştırmak dolguyu bozmaz).
    if (kirp) { lon = Math.min(Math.max(lon, B.b0 - 1), B.b1 + 1); lat = Math.min(Math.max(lat, B.e0 - 1), B.e1 + 1); }
    const [x, y] = xy(lon, lat);
    const p = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    if (onc && Math.hypot(p[0] - onc[0], p[1] - onc[1]) < esik) continue;
    s += (s ? 'L' : 'M') + p[0] + ' ' + p[1];
    onc = p;
  }
  return s + 'Z';
}
function yol(f, esik, kirp) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys.map(p => p.map(h => halka(h, esik, kirp)).filter(r => (r.match(/L/g) || []).length > 2).join('')).join('');
}
const kutu = f => { let m = [1e9, 1e9, -1e9, -1e9]; JSON.stringify(f.geometry.coordinates).replace(/\[(-?[\d.]+),(-?[\d.]+)\]/g, (_, a, b) => { a = +a; b = +b; m = [Math.min(m[0], a), Math.min(m[1], b), Math.max(m[2], a), Math.max(m[3], b)]; }); return m; };
const kesisir = m => !(m[2] < B.b0 - 2 || m[0] > B.b1 + 2 || m[3] < B.e0 - 2 || m[1] > B.e1 + 2);

const tr = ulkeler.find(f => f.id === '792');
const komsu = ulkeler.filter(f => f.id !== '792' && kesisir(kutu(f))).map(f => yol(f, 0.9, true)).join('');
const out = `/* Otomatik üretildi: scripts/harita-ciz.mjs. Kaynak: Natural Earth (kamu malı). */
window.HARITA = ${JSON.stringify({ g: G, y: Y, b0: B.b0, e1: B.e1, k: K, s: S, turkiye: yol(tr, 0.35, false), komsu })};
`;
fs.writeFileSync(new URL('../harita-veri.js', import.meta.url), out);
console.log('genişlik', G, 'yükseklik', Y, 'bayt', out.length);
