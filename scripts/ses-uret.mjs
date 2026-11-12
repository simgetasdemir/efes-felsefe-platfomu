// Gezi duraklarının sesli anlatılarını ElevenLabs ile üretir.
// Kullanım:  ELEVENLABS_API_KEY=... node scripts/ses-uret.mjs [--yeniden]
// Ayarlar (isteğe bağlı): ELEVENLABS_VOICE_TR, ELEVENLABS_VOICE_EN, ELEVENLABS_MODEL
// Çıktı: ses/<durak>-<dil>.mp3 ve ses/sesler.json (uygulamanın okuduğu liste)
import { readFile, writeFile, access } from 'node:fs/promises';

const anahtar = process.env.ELEVENLABS_API_KEY;
if (!anahtar) { console.error('ELEVENLABS_API_KEY ayarlanmamış.'); process.exit(1); }
const yeniden = process.argv.includes('--yeniden');
const model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
// Varsayılan: ElevenLabs'ın hazır seslerinden "George" (çok dilli). Kendi seçtiğin sesin kimliğini ortam değişkeniyle ver.
const sesler = { tr: process.env.ELEVENLABS_VOICE_TR || 'JBFqnCBsd6RMkjVDRZzb', en: process.env.ELEVENLABS_VOICE_EN || 'JBFqnCBsd6RMkjVDRZzb' };

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/var DURAKLAR = (\[[\s\S]*?\]);\nvar GM = /);
if (!m) { console.error('index.html içinde DURAKLAR bulunamadı.'); process.exit(1); }
const duraklar = JSON.parse(m[1]);

const var_mi = async (p) => { try { await access(p); return true; } catch { return false; } };
const liste = [];
let harcanan = 0;
for (const d of duraklar) {
  for (const dil of ['tr', 'en']) {
    const ad = `${d.id}-${dil}.mp3`, yol = new URL(`../ses/${ad}`, import.meta.url);
    if (!yeniden && await var_mi(yol)) { liste.push(ad); console.log('var, atlandı:', ad); continue; }
    const metin = d[dil].dinle;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${sesler[dil]}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': anahtar, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: metin, model_id: model, language_code: dil, voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    });
    if (!r.ok) { console.error(`HATA ${ad}: ${r.status} ${await r.text()}`); process.exitCode = 1; continue; }
    await writeFile(yol, Buffer.from(await r.arrayBuffer()));
    harcanan += metin.length; liste.push(ad); console.log('üretildi:', ad, metin.length, 'karakter');
  }
}
await writeFile(new URL('../ses/sesler.json', import.meta.url), JSON.stringify({ kaynak: 'ElevenLabs', dosyalar: liste.sort() }, null, 2) + '\n');
console.log(`Bitti. ${liste.length} dosya, bu çalıştırmada yaklaşık ${harcanan} karakter harcandı.`);
