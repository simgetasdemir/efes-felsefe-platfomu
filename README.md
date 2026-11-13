# Efes — felsefe platformu (bağımsız site)

Antik Efes’i canlandıran felsefe platformu: Celsus’ta oku, Büyük Tiyatro’da bir filozofla tartış, Artemis’te düşün.
Bu paket, Claude dışında kendi alan adında, herkese açık yayınlamak içindir.

## Paketin içi

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Ana sayfa: Türkiye Felsefe Haritası. |
| `efes.html` | Efes uygulaması (`/efes` adresinde): ekranlar, metinler, görseller. |
| `harita-veri.js`, `felsefe-veri.js` | Harita çizgileri ve Düşünce sekmesi içerikleri. |
| `vercel.json` | Kısa adresler (`/efes`), eski `/turkiye/` adresinin ana sayfaya yönlendirilmesi, önbellek ayarları. |
| `robots.txt`, `og-harita.jpg`, `harita.webmanifest` | Arama motorları, harita paylaşım görseli, haritayı telefona ekleme. |
| `api/katip.js` | Kâtip’i Anthropic API’ye bağlayan küçük sunucu fonksiyonu. API anahtarı yalnızca burada, sunucuda durur. |
| `package.json` | Proje bilgisi. Ek paket kurulumu gerekmez. |
| `og.jpg`, `og-kare.png` | Paylaşım önizleme görseli ve telefon ana ekranı ikonu. |
| `manifest.webmanifest`, `ikon-192.png`, `ikon-512.png` | Siteyi telefona uygulama gibi eklemek için. |
| `sw.js` | İnternetsiz çalışma: site bir kez açılınca telefona kaydedilir. |

## Gezi rehberi (ören yeri için)

- **Gezi** sekmesi, Efes'i gezen ziyaretçi içindir. Kişi hangi kapıdan girdiğini seçer, altı duraklık rota ona göre sıralanır. Artemis Tapınağı ve Matematik Köyü "ayrı bir günde" bölümündedir.
- Her durakta dört adım var: **Bak**, **Dinle** (telefonun kendi yapay sesiyle, internetsiz de çalışır), **Düşün** (tek soru, isteğe bağlı not) ve **Mühür al**.
- Mühürler **Efes Pasaportu**'nda toplanır, pasaport paylaşılabilir bir görsel karta dönüşür.
- Gezi ekranları Türkçe ve İngilizcedir; sitenin geri kalanı şimdilik Türkçedir.
- Durak metinleri `index.html` içindeki `DURAKLAR` listesindedir. Yayından önce sahada yürünüp bir uzmana okutulmalıdır.
- `sw.js` içindeki `KAYIT` adını (ör. `efes-v2`) her büyük güncellemede değiştir; böylece eski kopyalar temizlenir.

## Nasıl çalışıyor?

- **Kâtip:** Tarayıcı, sorularını `/api/katip` adresine gönderir. Sunucu fonksiyonu bunları senin API anahtarınla Anthropic’e iletir ve cevabı geri döndürür.
- **İlerleme ve defter:** Her kullanıcının kendi tarayıcısında (localStorage) saklanır. Giriş gerekmez. Kullanıcı başka bir cihaza geçerse ilerlemesi oraya taşınmaz. Bu, ilk pilot için yeterlidir. Hesap ve ortak tartışma (Odeion, Agora) için sonraki adım Supabase eklemektir.

## Yayınlama (yaklaşık 20 dakika)

### 1. Anthropic API anahtarı al
1. https://console.anthropic.com adresinde hesap aç.
2. **Billing** bölümünden ödeme yöntemi ekle ve küçük bir bakiye yükle. Kullanım kadar ödersin.
3. **Settings → Limits** bölümünden aylık harcama sınırı koy. Pilot için düşük bir sınır yeterli, sürpriz faturayı bu önler.
4. **API Keys** bölümünden yeni bir anahtar oluştur ve kopyala. Bu anahtarı kimseyle paylaşma, koda yazma.

### 2. Siteyi Vercel’de yayınla
1. https://vercel.com adresinde ücretsiz hesap aç (GitHub hesabıyla girmek en kolayı).
2. Bu klasörü bir GitHub deposuna yükle (GitHub’da **New repository → uploading an existing file**; tüm dosyaları sürükle bırak).
3. Vercel’de **Add New → Project** de, depoyu seç.
4. **Environment Variables** bölümüne ekle:
   - `ANTHROPIC_API_KEY` = 1. adımda kopyaladığın anahtar
5. **Deploy**’a bas. Bir dakika içinde `https://proje-adin.vercel.app` gibi bir adres alırsın.

### 3. Dene
- Siteyi aç, Liman’dan geç, Büyük Tiyatro’da bir argüman sun.
- Hakem notu geliyorsa her şey çalışıyor.
- Gelmiyorsa Vercel’de projeyi aç → **Logs** bölümüne bak. “ANTHROPIC_API_KEY ayarlanmamış” ya da “Anthropic API hatası” satırları sorunu gösterir.

### 4. (İsteğe bağlı) Kendi alan adın
Vercel’de **Settings → Domains** bölümünden kendi alan adını (ör. `efes.org.tr`) bağlayabilirsin.

### 5. Paylaşım önizlemesini tamamla
Site WhatsApp, X ya da Instagram’da paylaşılınca `og.jpg` görseli çıkar. Bazı uygulamalar görselin tam adresini ister. Adresin belli olunca `index.html` içinde `<meta property="og:image" content="og.jpg">` satırını `https://senin-adresin/og.jpg` olarak değiştir.

## Ayarlar (Vercel ortam değişkenleri)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Zorunlu. |
| `KATIP_MODEL` | `claude-sonnet-5-5` | Kâtip’in kullandığı model. Maliyeti düşürmek için `claude-haiku-5-5` yapılabilir. |
| `KATIP_MAX_TOKENS` | `900` | Bir cevabın en fazla uzunluğu. |
| `KATIP_IP_LIMIT` | `40` | Bir IP adresinin 10 dakikada gönderebileceği en fazla istek. Kötüye kullanımı sınırlar. |

## Maliyet hakkında

Her Kâtip cevabı birkaç kuruşluk API kullanımıdır. Bir münazara turu, bir okuma sorusu ya da bir tutanak birer istektir.
Gerçek maliyeti ilk günlerde Anthropic Console’daki **Usage** ekranından izle ve harcama sınırını buna göre ayarla.

## Bilmen gerekenler

- Görseller yapay zekâyla üretildi; bazı mimari ayrıntılar gerçek kalıntılardan farklıdır.
- Okuma odalarındaki bağlam ve yorum bölümleri Stanford Encyclopedia of Philosophy maddelerine dayanır ve kaynaklar uygulamada gösterilir. Tarih ve arkeoloji hikâyeleri ise ayrıca bir uzmanca kontrol edilmemiştir.
- Kâtip bir yapay zekâdır ve hata yapabilir. Herkese açık yayında, uygunsuz bir cevabı bildirmek için bir iletişim adresi eklemen iyi olur.
- Kişisel veri toplanmaz; ilerleme yalnızca kullanıcının tarayıcısında durur. Kâtip’e yazılanlar cevap üretmek için Anthropic’e gönderilir. Bunu bir gizlilik notunda belirtmelisin (Play Store için de gerekecek).

## Türkiye Felsefe Haritası (ana sayfa `/`)

- `index.html`: Herakleitos'tan Mevlânâ'ya on mekânlık harita. Her mekânda filozof, söz kartı (indirilebilir PNG), yürüyüş rotası, pasaport mührü, çevre otelleri ve kaynaklar var. TR + EN.
- Mekân metinleri aynı dosyadaki `YERLER` listesindedir. Kaynak dosyası: proje klasöründeki `efes/turkiye-felsefe-mekanlari.md`. Sitedeki tüm sözler kaynakta doğrulandı; `dogrulandi:false` yapılan bir söz sayfada "kontrol ediliyor" diye etiketlenir. Birincil metin bağlantıları `birincil` alanındadır.
- `DERIN`: her mekânın sesli anlatımı (Dinle, cihazın yapay sesiyle) ve düşünme sorusu (Düşün). Notlar yalnızca kullanıcının tarayıcısında saklanır.
- `felsefe-veri.js`: her mekânın Düşünce sekmesi (temel fikirler, hayat çizgisi, bilmediklerimiz, mirası). Stanford Encyclopedia of Philosophy maddelerinin kendi sözlerimizle özetidir; her fikir ilgili SEP bölümüne bağlanır. SEP maddesi olmayan Diogenes için IEP, Mevlânâ için SEP'in İslam mistisizmi maddesi ve Britannica kullanıldı.
- Haritadaki dağ sıraları, ırmaklar ve göller (`SIRALAR`, `IRMAKLAR`, `GOLLER`) elle yerleştirilmiş üsluplu çizimlerdir; atlas doğruluğunda değildir.
- `SANAT`: her mekânın görülecek eserleri (tiyatro, heykel, mozaik, müze); panelin "Gezi ve sanat" sekmesinde görünür.
- `ROTALAR`: çok günlük hazır rotalar. Her gün bir durak ve o gece kalınacak kasaba (`OTEL` ayarındaki yer adıyla) yazılır; gece kartı o kasabanın otel bağlantısını açar. Sürüş süreleri yaklaşıktır.
- `BAGLAR`: filozoflar arası hoca-öğrenci (düz çizgi) ve etki (kesikli çizgi) ilişkileri. Yeni bir bağ eklemek için listeye bir satır yeterli.
- Harita çizgisi Natural Earth (kamu malı) verisinden `scripts/harita-ciz.mjs` ile bir kez üretildi (`harita-veri.js`). Tüm amblem ve mühür çizimleri bu site için özgün SVG'dir.

### Gelir ve ortaklıklar (tek ayar yeri: `ortaklik.js`)

Haritadaki ve rehber sayfalarındaki tüm otel ve tur düğmeleri `ortaklik.js` dosyasından beslenir. Bir kimlik boşsa bağlantı yine çalışır, yalnızca komisyon gelmez. İlk kimlik eklendiğinde sayfalar ortaklık açıklamasını kendiliğinden gösterir.

| Program | Nereden başvurulur | `ortaklik.js` içinde nereye yazılır |
|---|---|---|
| Booking.com Affiliate Partner Programme | booking.com/affiliate-program | `booking.aid` |
| Hotels.com (Expedia Group Travel Creator Program) | creator.expediagroup.com | `hotels.baglantilar['Kasaba']`: her kasaba için panelde "Links → Create link" ile üretilen bağlantı |
| GetYourGuide Partner Program | partner.getyourguide.com | `getyourguide.partner_id` |
| Viator Affiliate Program | partnerresources.viator.com | `viator.pid` ve `viator.mcid` |
| Sesli rehber bekleme listesi | Tally, Google Forms ya da Mailchimp'te ücretsiz bir form | `sesliRehber.kayit` (formun adresi) |

Bir sağlayıcıyı tamamen gizlemek için `goster: false` yap.

### Rehber yazıları (`guides/`)

İngilizce, arama motoru için yazılmış sayfalar: `/guides/philosophy-trip-turkey`, `/guides/where-to-stay-in-ephesus`, `/guides/ephesus-to-pamukkale-itinerary`, `/guides/where-to-stay-in-pamukkale`. Metinler `scripts/rehber-sayfalari.py` içinde; değiştirdikten sonra `python3 scripts/rehber-sayfalari.py` çalıştır. Alan adı belli olunca betikteki `ALAN` değişkenini doldur.

## Alan adını bağlama (Vercel)

**En kolay yol: alan adını Vercel'den almak.** Vercel'de proje → **Settings → Domains → Buy**. Alınan ad projeye kendiliğinden bağlanır, DNS ayarı gerekmez, HTTPS sertifikası otomatik gelir.

**Başka yerden (Cloudflare, Namecheap) aldıysan:**

1. Vercel'de proje → **Settings → Domains → Add**, alan adını yaz (ör. `ornek.com`). `www.ornek.com` için de ekle; birini diğerine yönlendirmeyi Vercel önerir.
2. Vercel o ekranda girilecek kayıtları gösterir. Genelde:
   - kök ad (`@`) için bir **A** kaydı, Vercel'in gösterdiği IP adresine,
   - `www` için bir **CNAME** kaydı, Vercel'in gösterdiği hedefe.
   Değerleri o ekrandan kopyala; Vercel bunları zaman zaman değiştirir.
3. Bu kayıtları alan adını aldığın yerin DNS ayarlarına gir. Cloudflare'de bu iki kaydın bulutunu (proxy) **kapalı (DNS only)** tut.
4. Birkaç dakika ile birkaç saat içinde Vercel'de ad yeşil "Valid Configuration" olur.

Alan adı belli olunca `index.html` ve `efes.html` içine `canonical` bağlantısı, paylaşım görsellerine tam adres ve bir `sitemap.xml` eklenmeli.
