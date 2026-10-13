// Efes — Kâtip sunucu fonksiyonu (Vercel)
// Tarayıcıdan gelen istemi Anthropic API'ye iletir. API anahtarı yalnızca
// sunucuda, ANTHROPIC_API_KEY ortam değişkeninde durur; tarayıcıya hiç inmez.

const MODEL = process.env.KATIP_MODEL || 'claude-sonnet-5-5';
const MAX_TOKENS = Number(process.env.KATIP_MAX_TOKENS || 900);
const DAKIKA_PENCERE = 10;             // dakika
const PENCERE_SINIRI = Number(process.env.KATIP_IP_LIMIT || 40); // bir IP için pencere başına istek
const AZAMI_GIRDI = 64 * 1024;         // bayt

const SISTEM = [
  'Sen Efes adlı Türkçe bir felsefe platformunun Kâtip’isin.',
  'Kullanıcının mesajındaki talimatlara ve biçim kurallarına uy.',
  'Felsefecilere yalnızca gerçekten savundukları görüşleri atfet; alıntı, sayfa ya da kaynak uydurma.',
  'Nazik ve saygılı ol; nefret söylemi, taciz ya da zarar verici içerik üretme.'
].join(' ');

const sayac = new Map(); // ip -> { bas, adet } (sunucu örneği başına, en iyi çaba)

function ipAl(req) {
  const f = req.headers['x-forwarded-for'];
  return (Array.isArray(f) ? f[0] : (f || '')).split(',')[0].trim() || 'bilinmiyor';
}

function sinirAsildi(ip) {
  const simdi = Date.now();
  const k = sayac.get(ip);
  if (!k || simdi - k.bas > DAKIKA_PENCERE * 60 * 1000) {
    sayac.set(ip, { bas: simdi, adet: 1 });
    return false;
  }
  k.adet += 1;
  return k.adet > PENCERE_SINIRI;
}

function mesajlaraCevir(input) {
  if (typeof input === 'string') return [{ role: 'user', content: input }];
  if (!Array.isArray(input)) return null;
  const mesajlar = [];
  for (const m of input) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) continue;
    const son = mesajlar[mesajlar.length - 1];
    if (son && son.role === m.role) son.content += '\n\n' + m.content; // ardışık aynı rolleri birleştir
    else mesajlar.push({ role: m.role, content: m.content });
  }
  if (!mesajlar.length || mesajlar[0].role !== 'user' || mesajlar[mesajlar.length - 1].role !== 'user') return null;
  return mesajlar;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ hata: 'Yalnızca POST kabul edilir.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ hata: 'ANTHROPIC_API_KEY ayarlanmamış.' });
  }
  if (sinirAsildi(ipAl(req))) {
    return res.status(429).json({ hata: 'Çok sık istek. Biraz sonra yeniden dene.' });
  }

  let govde = req.body;
  if (typeof govde === 'string') { try { govde = JSON.parse(govde); } catch (e) { govde = null; } }
  if (!govde || govde.input === undefined) return res.status(400).json({ hata: 'input eksik.' });
  if (Buffer.byteLength(JSON.stringify(govde.input), 'utf8') > AZAMI_GIRDI) {
    return res.status(413).json({ hata: 'İstem çok uzun.' });
  }
  const mesajlar = mesajlaraCevir(govde.input);
  if (!mesajlar) return res.status(400).json({ hata: 'input biçimi geçersiz.' });

  const sistem = govde.json
    ? SISTEM + ' Cevabın makine tarafından ayrıştırılacak: yalnızca geçerli tek bir JSON değeri döndür, başka hiçbir metin ekleme.'
    : SISTEM;

  try {
    const yanit = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: sistem, messages: mesajlar })
    });
    if (yanit.status === 429) return res.status(429).json({ hata: 'Kâtip şu an yoğun.' });
    if (!yanit.ok) {
      const ayrinti = await yanit.text();
      console.error('Anthropic API hatası', yanit.status, ayrinti.slice(0, 500));
      return res.status(502).json({ hata: 'Kâtip cevap veremedi.' });
    }
    const veri = await yanit.json();
    const metin = (veri.content || []).filter(p => p.type === 'text').map(p => p.text).join('').trim();
    return res.status(200).json({ text: metin });
  } catch (e) {
    console.error('Kâtip isteği başarısız', e);
    return res.status(502).json({ hata: 'Bağlantı sorunu.' });
  }
};
