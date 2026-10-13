# Efes — felsefe platformu (bağımsız site)

Antik Efes’i canlandıran felsefe platformu: Celsus’ta oku, Büyük Tiyatro’da bir filozofla tartış, Artemis’te düşün.
Bu paket, Claude dışında kendi alan adında, herkese açık yayınlamak içindir.

## Paketin içi

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Uygulamanın tamamı: ekranlar, metinler, görseller (görseller dosyanın içine gömülü). |
| `api/katip.js` | Kâtip’i Anthropic API’ye bağlayan küçük sunucu fonksiyonu. API anahtarı yalnızca burada, sunucuda durur. |
| `package.json` | Proje bilgisi. Ek paket kurulumu gerekmez. |

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
