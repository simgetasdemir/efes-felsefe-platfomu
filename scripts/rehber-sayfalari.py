#!/usr/bin/env python3
"""İngilizce rehber sayfalarını (guides/*.html) üretir.

Kullanım:  python3 scripts/rehber-sayfalari.py
Metni değiştirmek için aşağıdaki SAYFALAR listesini düzenle ve betiği yeniden çalıştır.
Otel ve tur bağlantılarının kimlikleri ortaklik.js dosyasından gelir; burada kimlik yazılmaz.
Alan adı belli olunca ALAN değişkenini doldur: canonical ve paylaşım adresleri tam olur.
"""
import html, json, os, re, subprocess, urllib.parse

ALAN = 'https://antikyol.com'
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'guides')
BETIK = os.path.dirname(os.path.abspath(__file__))
# Ortaklık bağlantılarını ortaklik.js'in kendisi üretir (node gerekir); statik adresler JS'siz de takip kodlu olur.
def _ort(saglayici, kasaba, islev='otel'):
    kod = "global.window={};require(process.argv[1]);process.stdout.write(window.ORTAKLIK." + islev + "(process.argv[2],process.argv[3]))"
    return subprocess.run(['node', '-e', kod, os.path.join(BETIK, '..', 'ortaklik.js'), saglayici, kasaba], capture_output=True, text=True, check=True).stdout
ORT_SURUM = open(os.path.join(BETIK, 'ortaklik-surum.txt')).read().strip()  # scripts/sayfalar.mjs yazar

def e(x): return html.escape(x, quote=True)

def otel(kasaba, baslik, alt='Compare hotels'):
    return f'''<div class="cta"><small>{e(alt)}</small><b>{e(baslik)}</b><div class="dugmeler">
<a href="{e(_ort('hotels', kasaba))}" data-otel="hotels" data-kasaba="{e(kasaba)}" target="_blank" rel="sponsored noopener">Hotels.com</a>
</div></div>'''

def tur(sorgu, baslik, alt='Tours and tickets'):
    return f'''<div class="cta tur"><small>{e(alt)}</small><b>{e(baslik)}</b><div class="dugmeler">
<a href="{e(_ort('getyourguide', sorgu, 'tur'))}" data-tur="getyourguide" data-sorgu="{e(sorgu)}" target="_blank" rel="sponsored noopener">GetYourGuide</a>
<a href="{e(_ort('viator', sorgu, 'tur'))}" data-tur="viator" data-sorgu="{e(sorgu)}" target="_blank" rel="sponsored noopener">Viator</a>
</div></div>'''

def planla(baslik, geceler, turlar=()):
    """Rehber sonu 'Plan this route' kutusu: her gece için otel düğmesi, isteğe bağlı tur düğmeleri."""
    oteller = ''.join(f'<a href="{e(_ort("hotels", k))}" data-otel="hotels" data-kasaba="{e(k)}" target="_blank" rel="sponsored noopener"><span>{e(g)}</span>{e(k)}</a>' for g, k in geceler)
    tur_html = ''.join(f'<a href="{e(_ort("getyourguide", q, "tur"))}" data-tur="getyourguide" data-sorgu="{e(q)}" target="_blank" rel="sponsored noopener"><span>Tickets</span>{e(ad)}</a>' for ad, q in turlar)
    return f'''<div class="cta plan"><small>Plan this route</small><b>{e(baslik)}</b>
<p>A hotel for each night on Hotels.com, and tickets for the three big sites. Book the busy stops first: in spring and autumn, small hotels in Selçuk and Pamukkale fill up early.</p>
<div class="dugmeler">{oteller}</div>{f'<div class="dugmeler">{tur_html}</div>' if tur_html else ''}</div>'''

ACIKLAMA = '<p class="not" data-aciklama hidden>Some links on this page are affiliate links (Hotels.com, GetYourGuide, Viator). If you book through them, this site may earn a commission at no extra cost to you.</p>'

def sayfa(slug, baslik, aciklama, etiket, giris, ozet, govde, ilgili, sss=()):
    adres = (ALAN + '/guides/' + slug) if ALAN else ''
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": baslik, "description": aciklama, "inLanguage": "en",
          "about": {"@type": "Place", "name": etiket}, "isPartOf": {"@type": "WebSite", "name": "Antikyol", "url": "https://antikyol.com/"}}
    if adres: ld["mainEntityOfPage"] = adres
    sss_html = ''
    if sss:
        sss_html = '<h2>Frequently asked questions</h2><div class="sss">' + ''.join(f'<details><summary>{e(q)}</summary><p>{a}</p></details>' for q, a in sss) + '</div>'
        sss_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": html.unescape(re.sub('<[^>]+>', '', a))}} for q, a in sss]}
        sss_ld = f'<script type="application/ld+json">{json.dumps(sss_ld, ensure_ascii=False)}</script>'
    else:
        sss_ld = ''
    ilgili_html = ''.join(f'<a href="{a}">{e(b)} →</a>' for a, b in ilgili)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<title>{e(baslik)} | Antikyol</title>
<meta name="description" content="{e(aciklama)}">
{f'<link rel="canonical" href="{adres}"><meta property="og:url" content="{adres}">' if adres else ''}
<meta property="og:type" content="article">
<meta property="og:title" content="{e(baslik)}">
<meta property="og:description" content="{e(aciklama)}">
<meta property="og:image" content="{ALAN}/og-harita.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1F2A36">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/guides/rehber.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{sss_ld}
<!-- Vercel Web Analytics (çerezsiz sayfa görüntüleme sayacı) -->
<script>window.va=window.va||function(){{(window.vaq=window.vaq||[]).push(arguments)}};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<header class="ust"><a class="marka" href="/"><img src="/logo.svg" alt="" width="34" height="34"><span>Antikyol</span></a><nav class="ust-nav"><a href="/turkey#kesfet">Explore</a><a href="/places/">Places</a><a href="/passport">Passport</a><a href="/guides/philosophy-trip-turkey">All guides</a></nav></header>
<main>
<div class="etiket">{e(etiket)}</div>
<h1>{e(baslik)}</h1>
<p class="giris">{giris}</p>
<div class="ozet"><b>In short</b><ul>{''.join('<li>' + x + '</li>' for x in ozet)}</ul></div>
{govde}
{sss_html}
{ACIKLAMA}
<h2>Keep exploring</h2>
<div class="ilgili">{ilgili_html}<a href="/places/">All 30 places, one page each →</a><a href="/turkey">Open the philosophy map of Türkiye →</a></div>
</main>
<footer>Travel times are approximate; check opening hours and tickets before you go. Ideas are summarised from the Stanford Encyclopedia of Philosophy and other scholarly sources linked on the map.</footer>
<script src="/ortaklik.js?v={ORT_SURUM}"></script>
<script>ORTAKLIK.guncelle();</script>
</body>
</html>
'''

SAYFALAR = []

# ---------------------------------------------------------------- Efes
SAYFALAR.append(dict(
  slug='where-to-stay-in-ephesus',
  baslik='Where to stay for Ephesus: Selçuk, Şirince or Kuşadası',
  aciklama='The best base for visiting Ephesus: Selçuk for walking distance, Şirince for a quiet village, Kuşadası for the sea. With tips for the ruins and the philosophy of Heraclitus.',
  etiket='Ephesus · Selçuk, İzmir',
  giris='Ephesus is the city of Heraclitus, the philosopher who said you cannot step into the same river twice. To see it at its best you want to be at the gate early, before the heat and the tour buses. That makes where you sleep the first decision of the trip.',
  ozet=['<b>Selçuk</b> is the practical choice: the ruins are about 3 km away, and the town has the Ephesus Museum, the Basilica of St John and the last column of the Temple of Artemis.',
        '<b>Şirince</b>, a hillside village about 8 km above Selçuk, is the quiet, romantic choice with stone houses and local wine.',
        '<b>Kuşadası</b>, about 20 km away on the coast, has the most hotels, beaches and restaurants, and the cruise port.'],
  govde=f'''
<h2>Selçuk: closest to the ruins</h2>
<p>Selçuk is a small, easy town at the foot of the Ayasuluk hill. From here a short taxi ride, or a long walk, takes you to the ancient city, so you can be there when the gates open. In the evening you can walk to the Basilica of St John on the hill and to the single standing column of the Temple of Artemis, once one of the Seven Wonders. The Ephesus Museum, with the statues of Artemis found in the city, is in the town centre.</p>
<p>Selçuk also has a railway station with regional trains from İzmir, which makes it the easiest base if you are not driving.</p>
{otel('Selçuk', 'Hotels in Selçuk')}
<h2>Şirince: a village in the hills</h2>
<p>Şirince is a former Greek village of whitewashed stone houses in the hills above Selçuk, known for its fruit wines and olive oil. It is quieter and greener, and many guesthouses are restored village homes. You will need a short drive or a taxi down to Ephesus each morning.</p>
{otel('Şirince', 'Guesthouses and hotels in Şirince')}
<h2>Kuşadası: by the sea</h2>
<p>Kuşadası is a busy resort town on the coast, about half an hour from Ephesus by car. Choose it if you want beaches, a wide choice of hotels and restaurants, or if you are combining Ephesus with a cruise. Many day tours to Ephesus start from here.</p>
{otel('Kuşadası', 'Hotels in Kuşadası')}
<h2>How to see Ephesus</h2>
<p>The site has two entrances, an upper and a lower gate. Many visitors start at the upper gate and walk downhill along Curetes Street to the Library of Celsus and the Great Theatre, which held about 25,000 people. The Terrace Houses, the homes of wealthy Roman families with their wall paintings and mosaic floors, are under a protective roof and need a separate ticket. Go early in the morning, bring water and a hat, and allow at least three hours.</p>
{tur('Ephesus', 'Guided tours and tickets for Ephesus')}
<h2>The philosopher of Ephesus</h2>
<p>Heraclitus lived here around 500 BC. Only fragments of his book survive, quoted by later writers. He taught that everything is in flux, held together by an underlying order he called the <i>logos</i>.</p>
<blockquote>Upon those who step into the same rivers, different and again different waters flow.</blockquote>
<p class="not">Heraclitus, fragment DK B12. See the Stanford Encyclopedia of Philosophy entry on Heraclitus for the debate about what he meant.</p>
''',
  ilgili=[('/guides/how-to-visit-ephesus', 'How to visit Ephesus'), ('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days'), ('/turkey#efes', 'Ephesus on the philosophy map')]))

# ---------------------------------------------------------------- Efes-Pamukkale rotası
SAYFALAR.append(dict(
  slug='ephesus-to-pamukkale-itinerary',
  baslik='Ephesus to Pamukkale in 4 days: a philosophy itinerary',
  aciklama='A four-day route from Ephesus to Pamukkale through Miletus and Aphrodisias, with where to sleep each night, travel times and the philosophers behind each stop.',
  etiket='Aegean and Pamukkale · 4 days, 3 nights',
  giris='This route follows Greek philosophy inland, from the city of Heraclitus to the birthplace of Epictetus. It is easiest by car, and each day has one main site, so you have time to stop, read and look.',
  ozet=['<b>Day 1</b> Ephesus, night in Selçuk.', '<b>Day 2</b> Miletus, night in Didim.', '<b>Day 3</b> Aphrodisias, night in Pamukkale.', '<b>Day 4</b> Hierapolis and the travertines.',
        'Short on time? Skip Miletus and do it in three days.'],
  govde=f'''
<h2>The route, day by day</h2>
<div class="gun"><h3>Day 1 · Ephesus</h3>
<p>Start at the gate when it opens. Walk down Curetes Street to the Library of Celsus, whose façade niches hold copies of statues of Wisdom, Virtue, Thought and Knowledge, then on to the Great Theatre. In the afternoon visit the Ephesus Museum in Selçuk and, at sunset, the lone column of the Temple of Artemis.</p>
<p><b>Philosophy:</b> Heraclitus and the river that is never the same.</p></div>
{otel('Selçuk', 'Night 1 · Selçuk')}
{tur('Ephesus', 'Ephesus tours and tickets')}
<div class="gun"><h3>Day 2 · Miletus</h3>
<p>About an hour south of Selçuk. Miletus was the home of Thales, Anaximander and Anaximenes, often called the first philosophers. Its great theatre faces what was once the harbour, and the Baths of Faustina still have their statues of a river god and a lion. Priene and the Temple of Apollo at Didyma are close by if you want a fuller day.</p>
<p><b>Philosophy:</b> the first attempts to explain nature without myth.</p></div>
{otel('Didim', 'Night 2 · Didim')}
{tur('Miletus Priene Didyma', 'Tours to Miletus, Priene and Didyma')}
<div class="gun"><h3>Day 3 · Aphrodisias</h3>
<p>About two and a half hours from Didim. Aphrodisias had marble quarries nearby and famous sculpture workshops. See the Sebasteion reliefs in the museum, and the stadium, one of the best preserved in the ancient world. Drive on to Pamukkale, about an hour and a half away, for the night.</p>
<p><b>Philosophy:</b> Alexander of Aphrodisias, the great ancient commentator on Aristotle.</p></div>
{otel('Pamukkale', 'Night 3 · Pamukkale')}
{tur('Aphrodisias', 'Aphrodisias tours')}
<div class="gun"><h3>Day 4 · Hierapolis and Pamukkale</h3>
<p>Walk up the white travertine terraces early in the morning, barefoot, before the crowds. At the top, Hierapolis has a theatre whose stage reliefs tell the stories of Apollo and Artemis, and a museum inside the Roman baths.</p>
<p><b>Philosophy:</b> Epictetus, born here as a slave, who taught that some things are up to us and some are not.</p></div>
{tur('Pamukkale', 'Pamukkale tours, balloon flights and tickets')}
<h2>Getting around</h2>
<p>A rental car gives you the most freedom on this route. Without a car, buses connect Selçuk with Denizli, the city nearest to Pamukkale, and day tours run to most of the sites. Drive times above are approximate.</p>
''',
  ilgili=[('/guides/where-to-stay-in-ephesus', 'Where to stay for Ephesus'), ('/guides/where-to-stay-in-pamukkale', 'Where to stay in Pamukkale'), ('/guides/how-to-get-to-pamukkale', 'How to get to Pamukkale')]))

# ---------------------------------------------------------------- Pamukkale
SAYFALAR.append(dict(
  slug='where-to-stay-in-pamukkale',
  baslik='Where to stay in Pamukkale: the best areas near the travertines',
  aciklama='Pamukkale village, Karahayıt or Denizli? Where to sleep to walk the white terraces at sunrise, which area suits you, how many nights you need and what to see in Hierapolis.',
  etiket='Hierapolis · Pamukkale, Denizli',
  giris='Pamukkale is best early in the morning and late in the afternoon, when the white terraces glow and the day trippers have gone. Staying nearby is what makes that possible.',
  ozet=['<b>Pamukkale village</b> sits at the foot of the travertines: walk to the entrance, and see the terraces at sunrise.',
        '<b>Karahayıt</b>, a few kilometres north, has larger hotels with thermal pools.',
        '<b>Denizli</b>, the nearby city, is the transport hub, with the bus station and a wider choice of hotels.'],
  govde=f'''
{otel('Pamukkale', 'Check tonight\'s prices in Pamukkale', 'Short on time?')}
<h2>Pamukkale village</h2>
<p>The small village below the terraces is mostly guesthouses and family hotels, many with a view of the white slopes. From here you can walk up the travertines from the lower entrance as soon as the site opens, and come back down for sunset.</p>
{otel('Pamukkale', 'Hotels in Pamukkale village')}
<h2>Karahayıt</h2>
<p>Karahayıt is a spa village just north of Hierapolis, known for its reddish, iron-rich thermal springs. It has bigger resort hotels with thermal pools, which make a good rest day on a longer trip.</p>
{otel('Karahayıt', 'Thermal hotels in Karahayıt')}
<h2>Denizli</h2>
<p>Denizli is the city in the valley below, about half an hour away. It has the main bus station, city hotels and restaurants, and is a practical stop if you arrive late or travel on by bus.</p>
{otel('Denizli', 'Hotels in Denizli')}
<h2>What to see</h2>
<p>Walk the travertines barefoot, as shoes are not allowed on the terraces. At the top, the ancient city of Hierapolis has a large theatre with carved stage reliefs, a long necropolis, and an archaeology museum inside the Roman baths. The Antique Pool, with its warm water over fallen columns, is a separate ticket. Aphrodisias, with its sculpture and stadium, is about an hour and a half away and makes an excellent day trip.</p>
{tur('Pamukkale', 'Pamukkale tours, balloon flights and tickets')}
{tur('Aphrodisias', 'Day trips to Aphrodisias')}
<h2>The philosopher of Hierapolis</h2>
<p>Epictetus was born in Hierapolis in the first century AD and grew up as a slave in Rome. Freed, he became one of the most widely read Stoic teachers. His pupil Arrian wrote down his lessons in the <i>Discourses</i> and the short <i>Handbook</i>.</p>
<blockquote>Some things are up to us and some are not up to us.</blockquote>
<p class="not">Epictetus, Handbook 1. See the Stanford Encyclopedia of Philosophy entry on Epictetus.</p>
''',
  sss=[('Is it better to stay in Pamukkale or Denizli?', 'Stay in Pamukkale village if you want to walk onto the travertines at sunrise or sunset without a bus or taxi. Denizli makes sense if you arrive late, leave early by bus, or want a bigger choice of hotels; it is about 30 minutes away by minibus.'),
       ('How many nights do you need in Pamukkale?', 'One night is enough for most people: arrive in the afternoon, see the terraces at sunset, and visit Hierapolis early the next morning. Stay two nights to add a day trip to Aphrodisias.'),
       ('Can you walk from Pamukkale village to the travertines?', 'Yes. The lower entrance to the terraces is at the edge of the village, so most guesthouses are a short walk away.'),
       ('Is Karahayıt worth it?', 'Choose Karahayıt for a resort hotel with thermal pools. It is a few kilometres north of Hierapolis, so you will need a car, taxi or minibus to reach the site.')],
  ilgili=[('/guides/how-to-get-to-pamukkale', 'How to get to Pamukkale'), ('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days'), ('/turkey#hierapolis', 'Hierapolis on the philosophy map')]))

# ---------------------------------------------------------------- İstanbul
SAYFALAR.append(dict(
  slug='where-to-stay-in-istanbul',
  baslik='Where to stay in Istanbul for Hagia Sophia and Byzantine history',
  aciklama='Sultanahmet, Sirkeci or Karaköy: the best bases for Hagia Sophia, the Archaeology Museums and Chora, with a 3-day route that ends in İznik, the city of Hipparchus.',
  etiket='Istanbul · Byzantium',
  giris='For a thousand years Constantinople was the capital of Byzantium, and its scholars copied and taught the Greek philosophers. Most of the Plato and Aristotle we read today reached us through Byzantine manuscripts. If you come for that history, stay close to the old peninsula.',
  ozet=['<b>Sultanahmet</b> puts Hagia Sophia, the Archaeology Museums and the Basilica Cistern within a short walk.',
        '<b>Sirkeci</b>, just downhill, is a little cheaper and close to the tram, the ferries and Marmaray.',
        '<b>Karaköy</b>, across the Galata Bridge, is livelier in the evening and one tram stop from the old city.'],
  govde=f'''
<h2>Sultanahmet: under the dome</h2>
<p>Sultanahmet is the heart of the historic peninsula on the UNESCO World Heritage list. From here you can walk to Hagia Sophia, dedicated in 537, early in the morning before the queues. The historian Procopius wrote that its dome seemed not to rest on masonry but to hang from heaven. The Istanbul Archaeology Museums, a few minutes away in the grounds of Topkapı, hold the painted sarcophagi of Clazomenae, another stop on our map.</p>
{otel('İstanbul', 'Hotels in Sultanahmet and the old city')}
<h2>Sirkeci and Karaköy</h2>
<p>Sirkeci sits between Sultanahmet and the Golden Horn and has good transport links. Karaköy, across the Galata Bridge, has cafés, galleries and views back to the old city. Both make sense if you want more choice or a lower price.</p>
<h2>Chora and the land walls</h2>
<p>Give a second day to the Chora (Kariye) with its 14th-century mosaics and frescoes, then walk a stretch of the Theodosian land walls. The Süleymaniye Mosque, named with Hagia Sophia in UNESCO's listing, is a good place to end the day.</p>
{tur('Istanbul Hagia Sophia', 'Guided tours and tickets in Istanbul')}
<h2>On to İznik</h2>
<p>İznik, ancient Nicaea, is about two to two and a half hours away. It was the birthplace of the astronomer Hipparchus, the meeting place of two great church councils in 325 and 787, and in the 16th century the centre of Ottoman tile making. One night there is enough.</p>
{otel('İznik', 'Hotels in İznik')}
''',
  ilgili=[('/turkey#istanbul', 'Istanbul on the philosophy map'), ('/turkey#iznik', 'İznik on the philosophy map'), ('/guides/where-to-stay-in-cappadocia', 'Where to stay in Cappadocia')]))

# ---------------------------------------------------------------- Kapadokya
SAYFALAR.append(dict(
  slug='where-to-stay-in-cappadocia',
  baslik='Where to stay in Cappadocia: Göreme, Uçhisar or Ürgüp',
  aciklama='The best base in Cappadocia for the rock churches of Göreme, the valleys and the underground cities, with the philosophers behind the landscape and a route on to Konya.',
  etiket='Cappadocia · Nevşehir',
  giris='In the 4th century three thinkers from this region, the Cappadocian Fathers, brought Greek philosophy into Christian thought. Centuries later monks painted the rock churches of Göreme. Where you stay decides how easily you reach the valleys at sunrise.',
  ozet=['<b>Göreme</b> is the most central: the Open Air Museum is a short walk away and most balloon flights pick up here.',
        '<b>Uçhisar</b>, on the highest point, is quieter and has wide views over the valleys.',
        '<b>Ürgüp</b> is a real town with more restaurants and a slightly slower pace.'],
  govde=f'''
<h2>Göreme: in the middle of it all</h2>
<p>Göreme sits among the fairy chimneys, the cones left by the erosion of volcanic tuff. UNESCO describes its rock-cut churches as unique evidence of Byzantine art after the period of Iconoclasm. Many hotels here are cave rooms cut into the rock.</p>
{otel('Göreme', 'Hotels in Göreme')}
<h2>Uçhisar and Ürgüp</h2>
<p>Uçhisar, a few kilometres away, climbs up to its rock castle and has the widest views. Ürgüp is a larger town with wineries and restaurants, about fifteen minutes by car from Göreme.</p>
{otel('Ürgüp', 'Hotels in Ürgüp')}
<h2>What to see</h2>
<p>Start at the Göreme Open Air Museum early in the morning. Walk one of the valleys in the afternoon light and visit an underground city such as Derinkuyu or Kaymaklı, multi-storey refuges cut into the rock.</p>
{tur('Cappadocia', 'Tours, balloon flights and tickets in Cappadocia')}
<h2>The Cappadocian Fathers</h2>
<p>Basil of Caesarea, his brother Gregory of Nyssa and their friend Gregory of Nazianzus were all trained in Greek philosophy. Basil urged the young to take what was useful from pagan poets and philosophers. Gregory of Nyssa argued that God cannot be fully grasped and that growth toward the good never ends.</p>
<p class="not">See the Internet Encyclopedia of Philosophy entry on Gregory of Nyssa.</p>
<h2>On to Konya</h2>
<p>Konya, the city of Rumi, is about three hours away by road. A night there completes our three-day Cappadocia and Konya route.</p>
{otel('Konya', 'Hotels in Konya')}
''',
  ilgili=[('/turkey#kapadokya', 'Cappadocia on the philosophy map'), ('/turkey#konya', 'Konya on the philosophy map'), ('/guides/where-to-stay-in-istanbul', 'Where to stay in Istanbul')]))

# ---------------------------------------------------------------- Antalya
SAYFALAR.append(dict(
  slug='antalya-ancient-cities-perge-aspendos',
  baslik='Perge, Aspendos and Side from Antalya: where to stay and what to see',
  aciklama='A three-day plan for the ancient cities near Antalya: Perge, birthplace of the geometer Apollonius, the theatre of Aspendos and Side, with the best bases for each.',
  etiket='Antalya · Pamphylia',
  giris='Perge was the home of Apollonius, "the Great Geometer", who gave us the words ellipse, parabola and hyperbola. A short drive away, the theatre of Aspendos is one of the best preserved of the ancient world. Antalya makes an easy base for both.',
  ozet=['<b>Antalya</b>, especially the old town of Kaleiçi, is about 20 minutes from Perge and 45 minutes from Aspendos.',
        '<b>Side</b>, about an hour to an hour and a half east, has its own ruins and the Temple of Apollo by the sea.',
        'Visit the Antalya Museum to see the statues found at Perge.'],
  govde=f'''
<h2>Antalya: the base for Perge and Aspendos</h2>
<p>Stay in or near Kaleiçi, the walled old town above the harbour. In the morning drive to Perge for its colonnaded street, stadium and city gates, then on to Aspendos. Its theatre was built in the 2nd century AD by the architect Zeno and is still used for performances.</p>
{otel('Antalya', 'Hotels in Antalya')}
{tur('Aspendos Perge', 'Tours to Perge and Aspendos')}
<h2>Side: ruins by the sea</h2>
<p>Side combines a beach town with an ancient city. Watch the sunset at the columns of the Temple of Apollo on the last evening of the route.</p>
{otel('Side', 'Hotels in Side')}
<h2>The geometer of Perge</h2>
<p>Apollonius was born in Perge around 262 BC and worked in Alexandria. In his <i>Conics</i> he studied the curves made by cutting a cone, and named them. Of its eight books, four survive in Greek and three only in Arabic translation.</p>
<p class="not">See the MacTutor History of Mathematics biography of Apollonius.</p>
''',
  ilgili=[('/turkey#antalya', 'Perge and Aspendos on the philosophy map'), ('/guides/where-to-stay-in-cappadocia', 'Where to stay in Cappadocia')]))

# ---------------------------------------------------------------- Likya
SAYFALAR.append(dict(
  slug='lycian-way-xanthos-patara',
  baslik='Lycia and the Lycian Way: Xanthos, Letoon, Patara and where to stay',
  aciklama='A three-day plan for ancient Lycia: the pillar tombs of Xanthos, the Letoon, the assembly hall and beach of Patara, a day on the Lycian Way, and the best bases in Kalkan and Kaş.',
  etiket='Lycia · Antalya and Muğla',
  giris='The cities of Lycia governed themselves as a league with a common council, in which large cities had three votes, middling ones two and small towns one. Montesquieu called it the model of an excellent confederate republic, and Alexander Hamilton quoted him in the Federalist Papers. Today the same coast is walked on the Lycian Way.',
  ozet=['<b>Kalkan</b> is the closest small town to Patara and Xanthos, with sea-view hotels.',
        '<b>Kaş</b>, a little further east, is livelier and a good base for diving, boat trips and the coastal path.',
        'Xanthos and the Letoon are a UNESCO World Heritage site; Patara has the league\'s assembly hall and a long beach.'],
  govde=f'''
<h2>Kalkan: closest to the ruins</h2>
<p>Kalkan is a former fishing village of white houses above a small harbour. Patara and Xanthos are both a short drive away, so you can be at the sites early and on the beach in the afternoon.</p>
{otel('Kalkan', 'Hotels in Kalkan')}
<h2>Kaş: by the sea</h2>
<p>Kaş has a small ancient theatre facing the sea, many restaurants and boat trips along the coast. It suits a longer stay and a day or two on the Lycian Way.</p>
{otel('Kaş', 'Hotels in Kaş')}
<h2>Xanthos and the Letoon</h2>
<p>Xanthos was the capital of Lycia. UNESCO calls its rock tombs, pillar tombs and pillar-mounted sarcophagi a novel type of funerary architecture, and notes that the Nereid Monument found here directly influenced the Mausoleum of Halicarnassus. The longest and most important texts in the Lycian language were found here and at the nearby Letoon, the league's sanctuary.</p>
{tur('Xanthos Patara', 'Tours and tickets for Xanthos and Patara')}
<h2>Patara</h2>
<p>Patara held the assembly hall of the Lycian League, built in the early first century BC. Nearby stand a Roman lighthouse and one of the longest beaches in Türkiye. Saint Nicholas was born here, according to tradition, in the third century.</p>
<h2>The Lycian Way</h2>
<p>The Lycian Way is a long-distance walking route along the coast, established in 1999, from near Fethiye towards Antalya. You do not need to walk all of it: a single coastal stretch between Kalkan and Kaş is a good taste of the path.</p>
<h2>The model republic</h2>
<blockquote>Were I to give a model of an excellent confederate republic, I should pitch upon that of Lycia.</blockquote>
<p class="not">Montesquieu, The Spirit of the Laws, Book IX, 3 (Nugent translation). Quoted by Alexander Hamilton in Federalist No. 9.</p>
''',
  ilgili=[('/turkey#likya', 'Lycia on the philosophy map'), ('/guides/antalya-ancient-cities-perge-aspendos', 'Perge, Aspendos and Side from Antalya')]))

# ---------------------------------------------------------------- SEO yazıları (anahtar kelime hedefli)
# Her yazının hedef anahtar kelimesi yorum satırında. Başlık, açıklama, ilk paragraf ve en az bir H2 bu kelimeyi içerir.

# Hedef: "things to do in Ephesus"
SAYFALAR.append(dict(
  slug='things-to-do-in-ephesus',
  baslik='12 things to do in Ephesus and Selçuk (beyond the Library of Celsus)',
  aciklama='The best things to do in Ephesus and Selçuk: the Library of Celsus, the Terrace Houses, the Great Theatre, the Temple of Artemis, the Basilica of St John, Şirince and more, with tips on timing and tickets.',
  etiket='Ephesus · Selçuk, İzmir',
  giris='Most visitors give Ephesus three hours and leave. That is a pity, because the ruins are only half of it. Here are the best things to do in Ephesus and in Selçuk, the small town next to it, in the order that makes a good day or two.',
  ozet=['Arrive when the gates open and walk downhill from the upper gate.',
        'Pay the extra ticket for the <b>Terrace Houses</b>: they are the highlight for many visitors.',
        'Keep the afternoon for Selçuk: the Ephesus Museum, the Basilica of St John and the Temple of Artemis.',
        'Sleep in Selçuk or Şirince so you can start early.'],
  govde=f'''
<h2>Things to do inside ancient Ephesus</h2>
<h3>1. Walk Curetes Street from the upper gate</h3>
<p>Start at the upper (Magnesian) gate and walk downhill. Curetes Street runs past fountains, honorific monuments and the Temple of Hadrian, with its carved arch, to the lower city. Walking downhill saves your legs and gives you the best view of the Library of Celsus as it comes into sight.</p>
<h3>2. See the Library of Celsus</h3>
<p>The two-storey façade of the Library of Celsus, built in the 2nd century AD as a library and a tomb for a Roman governor, is the image everyone knows. Look for the four niches with statues of Wisdom, Virtue, Thought and Knowledge (the ones on site are copies).</p>
<h3>3. Step inside the Terrace Houses</h3>
<p>Under a modern roof on the slope above Curetes Street are the homes of wealthy Roman families, with wall paintings, mosaic floors and marble panels still being pieced together. It is a separate ticket, and worth it.</p>
<h3>4. Sit in the Great Theatre</h3>
<p>The Great Theatre held about 25,000 people. It is where, according to the Acts of the Apostles, the silversmiths rioted against Paul. From the top rows you can see the Harbour Street running towards what was once the sea.</p>
<h3>5. Stand where Heraclitus lived</h3>
<p>Ephesus was the home of Heraclitus, around 500 BC, the philosopher of change and the <i>logos</i>. Nothing of his house survives, but reading a few of his fragments in the city makes the visit different. Our <a href="/places/ephesus">Ephesus page</a> has his key ideas, with sources.</p>
{tur('Ephesus Terrace Houses', 'Guided tours of Ephesus and the Terrace Houses')}
<h2>Things to do in Selçuk, next to Ephesus</h2>
<h3>6. The Ephesus Museum</h3>
<p>In the centre of Selçuk, the museum holds the famous statues of Artemis of Ephesus found in the city, and finds from the Terrace Houses. Visit it after the ruins, when you know what you are looking at.</p>
<h3>7. The Temple of Artemis</h3>
<p>One of the Seven Wonders of the ancient world is now a single re-erected column in a marshy field, often with a stork's nest on top. It is a quiet, strange and moving place at sunset.</p>
<h3>8. The Basilica of St John and Ayasuluk Hill</h3>
<p>On the hill above the town are the ruins of the great basilica built over the traditional tomb of John the Apostle, and a Byzantine and Turkish fortress. The views over the plain are wide.</p>
<h3>9. The İsa Bey Mosque</h3>
<p>At the foot of the hill stands a 14th-century mosque of the Aydınoğulları, built partly with reused ancient columns: a good place to see how one civilisation builds on another.</p>
<h3>10. The House of the Virgin Mary</h3>
<p>On Bülbül Mountain above Ephesus is a small chapel venerated by Christians and Muslims as the last home of Mary. It is a pilgrimage site, so dress modestly.</p>
<h2>Around Ephesus</h2>
<h3>11. Şirince village</h3>
<p>A hillside village of stone houses about 8 km above Selçuk, known for fruit wines, olive oil and lunch in a garden.</p>
<h3>12. Day trips to Priene, Miletus and Didyma</h3>
<p>Within about an hour to the south are three more great sites: Priene on its terraces, Miletus, the city of the first philosophers, and the Temple of Apollo at Didyma. See our <a href="/places/priene-didyma">Priene and Didyma</a> and <a href="/places/miletus">Miletus</a> pages.</p>
{tur('Priene Miletus Didyma', 'Day tours to Priene, Miletus and Didyma')}
{otel('Selçuk', 'Hotels in Selçuk, walking distance to the town sights', 'Where to stay')}
''',
  sss=[('How long do you need in Ephesus?', 'Allow at least three hours for the ancient city, and four with the Terrace Houses. Add half a day for the museum, the Temple of Artemis and the Basilica of St John in Selçuk.'),
       ('What is the best time to visit Ephesus?', 'Spring (April to early June) and autumn (September and October). In any season, go as soon as the gates open: by late morning the site is hot and busy with tour groups.'),
       ('Are the Terrace Houses worth it?', 'Yes, for most visitors. They are the best-preserved Roman houses in the region, with paintings and mosaics, and they are less crowded than the main street.'),
       ('Where should I stay for Ephesus?', 'Selçuk is the closest town, about 3 km from the ruins. Şirince is a quiet village above it, and Kuşadası is a beach resort about 20 km away. See <a href="/guides/where-to-stay-in-ephesus">where to stay for Ephesus</a>.')],
  ilgili=[('/guides/how-to-visit-ephesus', 'How to visit Ephesus: gates, tickets and timing'), ('/guides/where-to-stay-in-ephesus', 'Where to stay for Ephesus'), ('/places/ephesus', 'Ephesus and Heraclitus')]))

# Hedef: "Cappadocia itinerary", "3 days in Cappadocia"
SAYFALAR.append(dict(
  slug='cappadocia-3-day-itinerary',
  baslik='Cappadocia itinerary: 3 days of rock churches, valleys and balloons',
  aciklama='A 3-day Cappadocia itinerary: Göreme Open-Air Museum, a sunrise balloon flight, the Rose and Red Valleys, an underground city, Ihlara Valley and Avanos, with where to stay each night.',
  etiket='Cappadocia · Nevşehir',
  giris='Three days is the right amount of time for Cappadocia: enough for a balloon morning, the painted rock churches, a walk through the valleys and one underground city, without rushing. This Cappadocia itinerary assumes you sleep in Göreme or Ürgüp and have a car or book day tours.',
  ozet=['<b>Day 1</b> Göreme Open-Air Museum, Uçhisar, sunset over the Rose Valley.',
        '<b>Day 2</b> Sunrise balloon flight, then Paşabağ, Zelve and Avanos.',
        '<b>Day 3</b> An underground city and the Ihlara Valley walk.',
        'Book the balloon for your first morning: flights are often cancelled by wind, so you keep a spare day.'],
  govde=f'''
<h2>Day 1: Göreme and the painted churches</h2>
<p>Start at the <b>Göreme Open-Air Museum</b>, a valley of monastic churches cut into the rock and painted between roughly the 10th and 12th centuries. Pay the extra ticket for the <b>Dark Church</b>, whose frescoes kept their colours because so little light reaches them, and do not miss the <b>Tokalı Church</b> just below the entrance. In the afternoon climb <b>Uçhisar Castle</b>, the highest rock in the area, and end the day on the ridge above the <b>Rose and Red Valleys</b> for sunset.</p>
<p><b>Philosophy:</b> this was the land of the Cappadocian Fathers, Basil of Caesarea, Gregory of Nazianzus and Gregory of Nyssa, who used Greek philosophy to think about God, the soul and the care of the poor. See our <a href="/places/cappadocia">Cappadocia page</a>.</p>
{tur('Cappadocia red tour Göreme Open Air Museum', 'Göreme and northern Cappadocia day tours')}
<h2>Day 2: A balloon at sunrise, then the fairy chimneys</h2>
<p>Hot-air balloons lift off around dawn when the weather allows. Prices change with the season, and flights are cancelled on windy mornings, which is why it pays to book for day 1 or 2 and keep a spare. After breakfast, drive to <b>Paşabağ</b> (Monks' Valley) for the mushroom-capped chimneys, then to the <b>Zelve Open-Air Museum</b>, a village abandoned in the 1950s. Spend the afternoon in <b>Avanos</b> on the Kızılırmak river, the pottery town.</p>
{tur('Cappadocia hot air balloon', 'Hot-air balloon flights in Cappadocia')}
<h2>Day 3: Underground city and the Ihlara Valley</h2>
<p>Go down into <b>Derinkuyu</b> or <b>Kaymaklı</b>, underground cities with several levels of rooms, stables, chapels and ventilation shafts, used as refuges over many centuries. Then drive to the <b>Ihlara Valley</b>, a canyon with a stream and rock churches along its walls. The walk from Ihlara village to Belisırma is about 4 km. Finish at <b>Selime Monastery</b>, a rock-cut complex at the end of the valley.</p>
{tur('Cappadocia green tour Ihlara Derinkuyu', 'Underground city and Ihlara Valley tours')}
<h2>Where to stay in Cappadocia</h2>
<p><b>Göreme</b> is at the centre of everything and has the most cave hotels. <b>Uçhisar</b> is quieter, with the best views. <b>Ürgüp</b> is a real town with more restaurants. For the details, read <a href="/guides/where-to-stay-in-cappadocia">where to stay in Cappadocia</a>.</p>
{otel('Göreme', 'Cave hotels in Göreme')}
{otel('Ürgüp', 'Hotels in Ürgüp')}
<h2>Add Konya on day 4</h2>
<p>Konya, the city of Rumi and the Mevlana Museum, is about two and a half to three hours west by road. It makes a natural fourth day. Our <a href="/places/konya">Konya page</a> explains Rumi's thought.</p>
''',
  sss=[('How many days do you need in Cappadocia?', 'Three days is ideal: one for the Göreme Open-Air Museum and valleys, one for the balloon and the fairy chimneys, and one for an underground city and the Ihlara Valley. Two days is possible if you skip Ihlara.'),
       ('What is the best base in Cappadocia?', 'Göreme is the most central and has the most cave hotels. Uçhisar is quieter with wide views; Ürgüp is a larger town with more restaurants.'),
       ('Which underground city is best, Derinkuyu or Kaymaklı?', 'Derinkuyu goes deeper; Kaymaklı is wider and usually a little less crowded. One is enough for most visitors.'),
       ('How do you get to Cappadocia?', 'Fly to Kayseri or Nevşehir (Kapadokya) airport, both about an hour or less from Göreme, or take an overnight bus from Istanbul.')],
  ilgili=[('/guides/where-to-stay-in-cappadocia', 'Where to stay in Cappadocia'), ('/places/cappadocia', 'Cappadocia and the Cappadocian Fathers'), ('/places/konya', 'Konya and Rumi')]))

# Hedef: "Göbekli Tepe tour", "how to visit Göbekli Tepe"
SAYFALAR.append(dict(
  slug='how-to-visit-gobekli-tepe',
  baslik='How to visit Göbekli Tepe: getting there from Şanlıurfa and what to see',
  aciklama='Göbekli Tepe is 15 km from Şanlıurfa, about 25 minutes by taxi. How to get there, how long you need, what to look for on the 11,000-year-old pillars, and adding Karahan Tepe and Harran.',
  etiket='Göbekli Tepe · Şanlıurfa',
  giris='Göbekli Tepe is a hilltop of great stone enclosures built by hunter-gatherers some eleven thousand years ago, thousands of years before writing or the wheel. It is easy to visit from the city of Şanlıurfa. Here is how to visit Göbekli Tepe, and what to see around it.',
  ozet=['Göbekli Tepe is about 15 km northeast of Şanlıurfa, roughly 20 to 30 minutes by car or taxi.',
        'UNESCO dates its use to around 9600 to 8200 BC. It is a World Heritage Site since 2018.',
        'See the <b>Şanlıurfa Archaeology Museum</b> too: it holds many of the finds.',
        'Stay in Şanlıurfa and add <b>Karahan Tepe</b> and <b>Harran</b>.'],
  govde=f'''
<h2>What Göbekli Tepe is</h2>
<p>The site is a series of round and oval enclosures ringed by T-shaped limestone pillars, some over five metres tall. Many are carved with foxes, boars, snakes, vultures and scorpions, and some have arms and hands, as if the pillars were people. It was built by people who did not yet farm, which surprised archaeologists: monumental building had been thought to come after agriculture.</p>
<p class="not">What the enclosures were for is still debated. They were first described as temples; more recent work has found evidence of daily life nearby, and some researchers now see them as large communal buildings. Our <a href="/places/gobekli-tepe-sanliurfa">Göbekli Tepe page</a> sets out what is known and what is not.</p>
<h2>How to get to Göbekli Tepe</h2>
<p>The site is about 15 km northeast of the Şanlıurfa city centre. The simplest way is a taxi or a rental car. There are also shuttle services from the visitor centre and organised tours from Şanlıurfa, some of which include Karahan Tepe and Harran. Şanlıurfa has an airport (GAP) with flights from Istanbul and Ankara.</p>
{tur('Gobekli Tepe', 'Göbekli Tepe tours from Şanlıurfa')}
<h2>What to see at the site</h2>
<p>From the visitor centre a short walk or shuttle takes you up to the main excavation, covered by a large membrane roof. Walkways circle the enclosures so you can look down on the pillars. Look for the fox carved on the pillars of Enclosure D and for the hands on the central pillars. Allow about one to two hours.</p>
<h2>Karahan Tepe and the Taş Tepeler</h2>
<p>Göbekli Tepe is not alone. It belongs to a group of related sites in the hills around Şanlıurfa, known as the <i>Taş Tepeler</i> ("Stone Hills"). The best known, <b>Karahan Tepe</b>, has a room of pillars carved out of the bedrock and a striking carved human head. It is about an hour from the city.</p>
<h2>The Şanlıurfa Archaeology Museum and Balıklıgöl</h2>
<p>Back in the city, the <b>Şanlıurfa Archaeology Museum</b> is one of the largest in Türkiye and shows finds from Göbekli Tepe and from the region, including the "Urfa Man", a life-size stone figure dated to the same period. Next door, the <b>Haleplibahçe Mosaic Museum</b> protects Roman villa mosaics. In the evening walk to <b>Balıklıgöl</b>, the pools of sacred carp linked to the story of Abraham.</p>
<h2>Harran</h2>
<p>About 45 km south of the city, Harran has beehive-shaped mud-brick houses and the ruins of a medieval mosque and university. It was a centre of learning in late antiquity and the early Islamic period.</p>
{otel('Şanlıurfa', 'Hotels in Şanlıurfa', 'Where to stay')}
''',
  sss=[('How old is Göbekli Tepe?', 'UNESCO dates the site to around 9600 to 8200 BC, in the Pre-Pottery Neolithic. That makes it one of the oldest known monumental sites in the world.'),
       ('How far is Göbekli Tepe from Şanlıurfa?', 'About 15 km northeast of the city centre, usually 20 to 30 minutes by car or taxi.'),
       ('How long do you need at Göbekli Tepe?', 'One to two hours at the site. Add half a day for the Şanlıurfa Archaeology Museum and Balıklıgöl, and a further half day for Karahan Tepe or Harran.'),
       ('Is Göbekli Tepe a temple?', 'That is debated. It was first described as a temple; newer research suggests the enclosures may also have been communal buildings used by people who lived nearby.')],
  ilgili=[('/places/gobekli-tepe-sanliurfa', 'Göbekli Tepe and Şanlıurfa'), ('/guides/mount-nemrut-sunrise', 'Mount Nemrut at sunrise'), ('/places/mardin', 'Mardin')]))

# Hedef: "Mount Nemrut sunrise"
SAYFALAR.append(dict(
  slug='mount-nemrut-sunrise',
  baslik='Mount Nemrut at sunrise: how to visit the stone heads',
  aciklama='How to see the sunrise or sunset on Mount Nemrut: the colossal statues of Antiochus I of Commagene, when to go, how to get there from Kahta, Malatya or Şanlıurfa, and where to stay.',
  etiket='Mount Nemrut · Adıyaman',
  giris='On top of Mount Nemrut, over 2,100 metres up, a king of the first century BC built himself a burial mound and surrounded it with giant statues of gods and of himself. Their heads now sit on the ground, and they turn gold at dawn. Seeing the Mount Nemrut sunrise takes some planning. Here is how.',
  ozet=['Sunrise is seen from the <b>east terrace</b>, sunset from the <b>west terrace</b>.',
        'The summit road is generally open from spring to autumn; check before you go in winter.',
        'Most people stay in <b>Kahta</b> or the village of <b>Karadut</b> and leave before dawn.',
        'Bring warm clothes even in summer: it is cold on the top before sunrise.'],
  govde=f'''
<h2>What you will see</h2>
<p>Mount Nemrut (Nemrut Dağı) was the tomb-sanctuary of <b>Antiochus I</b>, king of Commagene in the first century BC. On the peak is an artificial mound of loose stones. On its east and west terraces stood rows of seated colossal statues: the king, Greek and Persian gods merged into one (Zeus-Oromasdes, Apollo-Mithras-Helios-Hermes, Heracles-Artagnes-Ares) and the goddess of Commagene. Earthquakes toppled the heads, which now stand in a row at the foot of the bodies. The site has been on the UNESCO World Heritage List since 1987.</p>
<p>The king also left a long inscription explaining what he had built and why. Our <a href="/places/mount-nemrut">Mount Nemrut page</a> explains how this mixing of Greek and Persian gods fits into the history of ideas.</p>
<h2>Sunrise or sunset on Mount Nemrut?</h2>
<p>Both are beautiful. <b>Sunrise</b> is the classic: you climb in the dark, wait on the east terrace, and watch the first light hit the faces. <b>Sunset</b> on the west terrace is easier, warmer and has fewer early starts. If you can, stay a night nearby and do both.</p>
<p>From the car park it is a walk of about 600 metres, steep in places, up to the terraces. Allow 20 to 30 minutes.</p>
{tur('Mount Nemrut sunrise', 'Mount Nemrut sunrise and sunset tours')}
<h2>How to get to Mount Nemrut</h2>
<p>The usual bases are <b>Kahta</b> (in Adıyaman province) and the small village of <b>Karadut</b>, which is closer to the top. Tours also leave from Şanlıurfa, Malatya and Cappadocia, but those are long nights. The nearest airport is Adıyaman. In winter, snow can close the road to the summit, so the usual season is roughly May to October.</p>
<h2>On the way: Arsameia, Cendere Bridge and Karakuş</h2>
<p>Many tours stop at <b>Arsameia</b>, the old Commagene capital, where a relief shows the king shaking hands with Heracles; at the Roman <b>Cendere Bridge</b>; and at <b>Karakuş</b>, a burial mound for the royal women, with a column topped by an eagle.</p>
{otel('Kahta', 'Hotels in Kahta for Mount Nemrut', 'Where to stay')}
<h2>Combine with Göbekli Tepe and Zeugma</h2>
<p>Mount Nemrut sits well in a five-day route through Mesopotamia: the Zeugma mosaics in Gaziantep, Nemrut, Göbekli Tepe and Mardin. See <a href="/places/zeugma-gaziantep">Zeugma</a> and <a href="/guides/how-to-visit-gobekli-tepe">how to visit Göbekli Tepe</a>.</p>
''',
  sss=[('What time is sunrise on Mount Nemrut?', 'It depends on the season: roughly 5 am in early summer and 6 to 7 am in autumn. Tours from Kahta usually leave two to three hours before sunrise.'),
       ('Is it cold on Mount Nemrut?', 'Yes. The summit is over 2,100 metres high and the wind is strong before dawn. Bring a warm jacket, even in July.'),
       ('When is Mount Nemrut open?', 'The summit road is usually open from about May to October. In winter, snow can close it; check locally before you go.'),
       ('Who built Mount Nemrut?', 'Antiochus I, king of Commagene, in the first century BC, as his tomb-sanctuary. The burial chamber itself has never been found.')],
  ilgili=[('/places/mount-nemrut', 'Mount Nemrut on the map'), ('/guides/how-to-visit-gobekli-tepe', 'How to visit Göbekli Tepe'), ('/places/zeugma-gaziantep', 'Zeugma and Gaziantep')]))

# Hedef: "visiting Troy Turkey", "Troy ruins"
SAYFALAR.append(dict(
  slug='visiting-troy-turkey',
  baslik='Visiting Troy, Turkey: how to get there, what to see and the Troy Museum',
  aciklama='Troy is 30 km from Çanakkale. How to get there by minibus or car, what to see among the nine cities on the mound, why the Troy Museum is a must, how long you need and where to stay.',
  etiket='Troy · Çanakkale',
  giris='The ruins of Troy are on a low mound called Hisarlık, near the Dardanelles. What you find there is not one city but many, built on top of each other for over four thousand years. Visiting Troy in Türkiye is easy from Çanakkale. Here is what to see, and how to make sense of it.',
  ozet=['Troy is about 30 km south of Çanakkale, roughly 30 to 40 minutes by car or bus.',
        'See the <b>Troy Museum</b> as well as the ruins: it explains the layers.',
        'Allow two hours for the site and one to two for the museum.',
        'Combine with <b>Assos</b> to the south and the <b>Gallipoli</b> battlefields across the strait.'],
  govde=f'''
<h2>Why Troy is many cities</h2>
<p>Archaeologists count at least nine main settlements at Troy, from the early Bronze Age to the Roman city of Ilion. Each was built on the ruins of the one before, so a walk around the mound is a walk through time. Which layer, if any, matches the Troy of Homer's <i>Iliad</i> is still debated; many scholars point to the Late Bronze Age levels known as Troy VI and VIIa. The site has been on the UNESCO World Heritage List since 1998.</p>
<h2>What to see on the site</h2>
<p>A marked path takes you round the mound. Highlights are the sloping <b>walls and towers of Troy VI</b>, the <b>ramp of Troy II</b>, the deep trench dug by Heinrich Schliemann in the 1870s, which cut through several layers, and the small <b>Roman theatre</b> (odeon) and council house. Near the entrance stands a modern wooden horse that children can climb.</p>
{tur('Troy Turkey', 'Troy tours from Çanakkale and Istanbul')}
<h2>The Troy Museum</h2>
<p>The Troy Museum, opened in 2018 near the entrance to the site, is one of the best archaeology museums in the country. It shows finds from Troy and from the region of the Troad, and makes the layers of the city easy to follow. Do not skip it.</p>
<h2>Troy and the poets</h2>
<p>For the ancient Greeks Troy was the setting of the <i>Iliad</i>, the first great poem of their tradition, and Homer was often called the teacher of Greece. Plato, in the <i>Republic</i>, argued about whether poets like Homer should be allowed in the ideal city. Our <a href="/places/troy">Troy page</a> tells the story, with sources.</p>
<h2>Getting there and where to stay</h2>
<p><b>Çanakkale</b> is the natural base, with hotels on the waterfront and a lively student town. Buses and minibuses run to Troy, and many tours include it. Çanakkale is about five to six hours by road from Istanbul, and there is a small airport.</p>
{otel('Çanakkale', 'Hotels in Çanakkale', 'Where to stay')}
<h2>Combine Troy with Assos and Gallipoli</h2>
<p>Assos, where Aristotle lived for some years, is about an hour and a half south and makes a beautiful stop on the way down the coast. Across the Dardanelles are the Gallipoli battlefields of 1915. See <a href="/places/assos">Assos and Aristotle</a>.</p>
''',
  sss=[('Is Troy worth visiting?', 'Yes, especially if you visit the Troy Museum as well. The ruins are less spectacular than Ephesus, but the layers of so many cities on one hill, and the link to Homer, make it unique.'),
       ('How far is Troy from Istanbul?', 'About five to six hours by road to Çanakkale, then 30 to 40 minutes to the site. Day tours from Istanbul exist but are long; one night in Çanakkale is better.'),
       ('Was the Trojan War real?', 'No one knows for sure. Troy was a real, large Bronze Age city that was destroyed more than once; whether a war like the one in the Iliad happened is still debated.'),
       ('How long do you need at Troy?', 'About two hours on the site and one to two hours in the Troy Museum.')],
  ilgili=[('/places/troy', 'Troy and Homer'), ('/guides/turkey-ancient-sites-7-day-itinerary', 'Troy to Pamukkale in 7 days'), ('/places/assos', 'Assos and Aristotle')]))

# Hedef: "best ancient ruins in Turkey"
SAYFALAR.append(dict(
  slug='best-ancient-ruins-in-turkey',
  baslik='The 15 best ancient ruins in Türkiye, and the ideas behind them',
  aciklama='The best ancient ruins in Turkey, from Göbekli Tepe and Troy to Ephesus, Pergamon, Aphrodisias, Hierapolis, Aspendos, Xanthos and Mount Nemrut, with where to stay for each.',
  etiket='Ancient sites · Türkiye',
  giris='Türkiye has more Greek and Roman cities than Greece, and some of the oldest monumental sites on earth. This list of the best ancient ruins in Turkey picks fifteen, and adds what most guides leave out: the people who thought and wrote there.',
  ozet=['<b>For a first trip:</b> Ephesus, Hierapolis-Pamukkale, Aphrodisias and the Göreme valleys.',
        '<b>For deep time:</b> Göbekli Tepe and Troy.',
        '<b>For drama:</b> Mount Nemrut at sunrise and the theatre of Aspendos.',
        'Every place below has its own page with sources, and a hotel suggestion.'],
  govde=f'''
<h2>The Aegean: the cities of the first philosophers</h2>
<h3>1. Ephesus</h3>
<p>The most complete Roman city in the eastern Mediterranean, with the Library of Celsus, the Great Theatre and the Terrace Houses. Home of Heraclitus. <a href="/guides/things-to-do-in-ephesus">Things to do in Ephesus</a>.</p>
<h3>2. Pergamon</h3>
<p>An acropolis on a steep hill above Bergama with one of the steepest theatres of antiquity, a great library and the Asklepion healing sanctuary where the physician Galen trained. <a href="/places/pergamon">Pergamon</a>.</p>
<h3>3. Aphrodisias</h3>
<p>A city of sculptors with a huge, well-preserved stadium and the Sebasteion reliefs. Home of Alexander of Aphrodisias, the great commentator on Aristotle. <a href="/places/aphrodisias">Aphrodisias</a>.</p>
<h3>4. Hierapolis and Pamukkale</h3>
<p>A Roman spa city on top of white travertine terraces, with a fine theatre and a museum in the old baths. Birthplace of Epictetus. <a href="/places/hierapolis-pamukkale">Hierapolis</a>.</p>
<h3>5. Miletus, Priene and Didyma</h3>
<p>Three sites within an hour of each other: Miletus, home of Thales and Anaximander; Priene, a planned city on terraces; and the vast Temple of Apollo at Didyma. <a href="/places/miletus">Miletus</a>, <a href="/places/priene-didyma">Priene and Didyma</a>.</p>
{otel('Selçuk', 'Base for Ephesus, Miletus and Priene: Selçuk')}
<h3>6. Assos</h3>
<p>A temple of Athena on a volcanic hill above the sea, where Aristotle lived for some years. <a href="/places/assos">Assos</a>.</p>
<h3>7. Troy</h3>
<p>Nine cities on one mound, and the setting of Homer's <i>Iliad</i>, with an excellent museum. <a href="/guides/visiting-troy-turkey">Visiting Troy</a>.</p>
<h2>The south coast: theatres and tombs</h2>
<h3>8. Aspendos</h3>
<p>Probably the best-preserved Roman theatre in the world, still used for performances. Near Antalya. <a href="/guides/antalya-ancient-cities-perge-aspendos">Perge, Aspendos and Side</a>.</p>
<h3>9. Perge</h3>
<p>Colonnaded streets, a huge stadium and the Hellenistic gate towers. Home of Apollonius, the geometer of the conic sections. <a href="/places/perge-aspendos">Perge</a>.</p>
<h3>10. Xanthos, Letoon and Patara</h3>
<p>Pillar tombs and the assembly hall of the Lycian League, which Montesquieu praised as a model republic. <a href="/guides/lycian-way-xanthos-patara">Lycia</a>.</p>
<h3>11. Halicarnassus (Bodrum)</h3>
<p>The site of the Mausoleum, one of the Seven Wonders, and the castle museum of underwater archaeology. Birthplace of Herodotus. <a href="/places/bodrum">Bodrum</a>.</p>
{tur('Aspendos Perge', 'Tours of Aspendos, Perge and Side')}
<h2>Central and eastern Anatolia: deep time</h2>
<h3>12. Göbekli Tepe</h3>
<p>Stone enclosures built by hunter-gatherers about eleven thousand years ago. <a href="/guides/how-to-visit-gobekli-tepe">How to visit Göbekli Tepe</a>.</p>
<h3>13. Mount Nemrut</h3>
<p>Colossal heads of gods and a king on a mountain top, at their best at sunrise. <a href="/guides/mount-nemrut-sunrise">Mount Nemrut at sunrise</a>.</p>
<h3>14. Zeugma</h3>
<p>A Roman city on the Euphrates whose mosaics, including the "Gypsy Girl", are in the Zeugma Mosaic Museum in Gaziantep. <a href="/places/zeugma-gaziantep">Zeugma</a>.</p>
<h3>15. The rock churches of Cappadocia</h3>
<p>Not Greek or Roman, but some of the most beautiful ancient and medieval sites in the country, in the land of the Cappadocian Fathers. <a href="/guides/cappadocia-3-day-itinerary">Cappadocia in 3 days</a>.</p>
{otel('Göreme', 'Cave hotels in Göreme')}
<h2>How to see them in one trip</h2>
<p>You cannot see all fifteen in one holiday. For a first trip of ten days, combine Istanbul, Cappadocia and the Aegean: see our <a href="/guides/turkey-history-itinerary-10-days">10-day Turkey history itinerary</a>. Or pick one of the <a href="/turkey#rota-bolum">ten routes on the map</a>.</p>
''',
  sss=[('What is the most impressive ancient site in Turkey?', 'For most visitors, Ephesus: it is the most complete Roman city in the region. For age, Göbekli Tepe; for setting, Mount Nemrut at sunrise.'),
       ('Does Turkey have more Greek ruins than Greece?', 'Many guides say so. Western Türkiye, ancient Ionia, Aeolis, Caria and Lycia, was full of Greek cities, and many are well preserved because they were abandoned rather than built over.'),
       ('Which ruins can you combine in one trip?', 'Ephesus, Miletus, Priene, Didyma, Aphrodisias and Hierapolis are all within a few hours of each other on the Aegean side, and make a good four- or five-day route.')],
  ilgili=[('/guides/turkey-ancient-sites-7-day-itinerary', 'A 7-day ancient sites road trip'), ('/guides/turkey-history-itinerary-10-days', 'A 10-day history itinerary'), ('/guides/ancient-greek-philosophers-from-turkey', 'Philosophers from Türkiye')]))

# Hedef: "Turkey itinerary 10 days"
SAYFALAR.append(dict(
  slug='turkey-history-itinerary-10-days',
  baslik='Turkey itinerary for 10 days: Istanbul, Cappadocia, Ephesus and Pamukkale',
  aciklama='A 10-day Turkey itinerary for history lovers: three days in Istanbul, two in Cappadocia, then Ephesus, Priene, Miletus, Aphrodisias and Pamukkale, with where to sleep each night and how to travel.',
  etiket='Türkiye · 10 days',
  giris='Ten days is enough for the classic triangle of Istanbul, Cappadocia and the Aegean coast, if you fly the long legs. This Turkey itinerary for 10 days is built for people who want history and ideas, with one main place each day and time to look.',
  ozet=['<b>Days 1 to 3</b> Istanbul. Fly to Cappadocia.',
        '<b>Days 4 to 5</b> Cappadocia. Fly to İzmir.',
        '<b>Days 6 to 8</b> Ephesus, Priene, Miletus and Didyma from Selçuk.',
        '<b>Days 9 to 10</b> Aphrodisias and Pamukkale. Fly home via Denizli or İzmir.'],
  govde=f'''
<h2>Days 1 to 3: Istanbul</h2>
<p><b>Day 1:</b> Hagia Sophia, the Blue Mosque and the Basilica Cistern, all within a few minutes' walk in Sultanahmet. <b>Day 2:</b> Topkapı Palace and the <b>Istanbul Archaeology Museums</b> next door, among the richest collections of ancient art in the world. <b>Day 3:</b> the Chora (Kariye) mosaics, the Süleymaniye Mosque and a ferry on the Bosphorus.</p>
<p>Istanbul was Byzantium and Constantinople, where for a thousand years scholars copied and taught the ancient texts. See our <a href="/places/istanbul">Istanbul page</a>.</p>
{otel('İstanbul', 'Hotels in Istanbul (Sultanahmet and around)')}
{tur('Istanbul Hagia Sophia Topkapi', 'Istanbul tours and skip-the-line tickets')}
<h2>Days 4 to 5: Cappadocia</h2>
<p>Fly to Kayseri or Nevşehir in about an hour and a half. <b>Day 4:</b> the Göreme Open-Air Museum and sunset over the Rose Valley. <b>Day 5:</b> a sunrise balloon, then an underground city. If you can spare a third day, follow our <a href="/guides/cappadocia-3-day-itinerary">3-day Cappadocia itinerary</a>.</p>
{otel('Göreme', 'Cave hotels in Göreme')}
<h2>Days 6 to 8: Ephesus and the Ionian coast</h2>
<p>Fly to İzmir (usually via Istanbul or Ankara), then take the train or a car to Selçuk, about an hour. <b>Day 7:</b> Ephesus early, the Terrace Houses, then the museum and the Temple of Artemis. <b>Day 8:</b> Priene, Miletus and Didyma, the cities of the first philosophers. See <a href="/guides/things-to-do-in-ephesus">things to do in Ephesus</a>.</p>
{otel('Selçuk', 'Hotels in Selçuk')}
{tur('Ephesus', 'Ephesus tours and tickets')}
<h2>Days 9 to 10: Aphrodisias and Pamukkale</h2>
<p><b>Day 9:</b> drive inland to Aphrodisias, city of sculptors, then on to Pamukkale for the night. <b>Day 10:</b> walk the travertine terraces at dawn and explore Hierapolis, birthplace of Epictetus, before flying home from Denizli (via Istanbul) or driving back to İzmir.</p>
{otel('Pamukkale', 'Hotels in Pamukkale')}
<h2>Getting around</h2>
<p>Domestic flights are frequent and usually cheap if booked early. On the Aegean side a rental car gives the most freedom; trains run from İzmir to Selçuk and Denizli, and intercity buses go everywhere. Leave buffer time around balloon flights, which are often cancelled by wind.</p>
<h2>Other ways to spend 10 days</h2>
<p>Swap Cappadocia for the south: Antalya, Perge and Aspendos, then the Lycian coast. Or go east to Göbekli Tepe, Mount Nemrut and Mardin. All ten of our routes are on the <a href="/turkey#rota-bolum">philosophy map</a>.</p>
''',
  sss=[('Is 10 days enough for Turkey?', 'Ten days is enough for Istanbul, Cappadocia and the Aegean coast if you fly between them. It is not enough to add the east as well.'),
       ('What is the best order for a Turkey itinerary?', 'Istanbul first (most international flights land there), then fly to Cappadocia, then fly to İzmir for the Aegean. End in Pamukkale or İzmir.'),
       ('What is the best time of year?', 'April to June and September to October: warm, but not too hot for walking around ruins.')],
  ilgili=[('/guides/best-ancient-ruins-in-turkey', 'The 15 best ancient ruins'), ('/guides/where-to-stay-in-istanbul', 'Where to stay in Istanbul'), ('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days')]))

# Hedef: "ancient Greek philosophers from Turkey", "Ionian philosophers"
SAYFALAR.append(dict(
  slug='ancient-greek-philosophers-from-turkey',
  baslik='Ancient Greek philosophers from Türkiye, and where to find their cities',
  aciklama='Thales, Anaximander, Heraclitus, Anaxagoras, Diogenes, Epictetus and more were born on the coasts of today\'s Türkiye. A guide to the Ionian philosophers and the ruins you can visit.',
  etiket='Philosophy · Ionia and beyond',
  giris='Western philosophy began in Ionia, the Greek cities on the Aegean coast of what is now Türkiye. Many of the most famous ancient Greek philosophers were born here, and you can still walk through their cities. This is who they were and where to go.',
  ozet=['<b>Miletus:</b> Thales, Anaximander and Anaximenes, often called the first philosophers.',
        '<b>Ephesus:</b> Heraclitus. <b>Clazomenae:</b> Anaxagoras. <b>Sinop:</b> Diogenes the Cynic.',
        '<b>Assos, Soli, Hierapolis:</b> Aristotle\'s years in Assos, the Stoics Cleanthes and Chrysippus, and Epictetus.',
        'Each name links to a page with the main ideas and sources.'],
  govde=f'''
<h2>The Ionian philosophers of Miletus</h2>
<p><b>Thales</b> (early 6th century BC) is traditionally the first Greek philosopher. He is said to have held that water is the origin of things. <b>Anaximander</b>, his younger fellow citizen, proposed a boundless, indefinite source (the <i>apeiron</i>) and is credited with an early map of the world. <b>Anaximenes</b> chose air. What unites them is the attempt to explain nature by nature, not by myth.</p>
<p class="not">Almost everything we know about them comes from later writers, especially Aristotle. Even the famous story that Thales predicted a solar eclipse, usually dated to 585 BC, comes from Herodotus and is debated.</p>
<p>Visit: <a href="/places/miletus">Miletus</a>, with its great theatre and the Baths of Faustina.</p>
{tur('Miletus Priene Didyma', 'Tours to Miletus, Priene and Didyma')}
<h2>Heraclitus of Ephesus</h2>
<p>Around 500 BC Heraclitus wrote that everything flows and that opposites are bound together by a hidden order, the <i>logos</i>. He was famous for being hard to understand. Visit: <a href="/places/ephesus">Ephesus</a>, and read <a href="/guides/things-to-do-in-ephesus">things to do in Ephesus</a>.</p>
{otel('Selçuk', 'Stay in Selçuk for Ephesus')}
<h2>Anaxagoras of Clazomenae</h2>
<p>Anaxagoras, from Clazomenae near today's Urla, brought philosophy to Athens in the 5th century BC. He said that Mind (<i>nous</i>) set the world in motion, and that the sun was a fiery stone, which got him prosecuted for impiety. Visit: <a href="/places/clazomenae">Clazomenae</a>, with its ancient olive-oil workshop.</p>
<h2>Bias of Priene, one of the Seven Sages</h2>
<p>Priene, on the slopes of Mount Mykale, was the city of Bias, counted among the Seven Sages of Greece. Visit: <a href="/places/priene-didyma">Priene</a>, a planned Hellenistic town on terraces.</p>
<h2>Aristotle in Assos</h2>
<p>Aristotle was born in Stagira in northern Greece, but after Plato's death he spent some years at Assos, at the court of Hermias, around 347 to 345 BC, before moving to Lesbos. Assos was also the birthplace of <b>Cleanthes</b>, the second head of the Stoic school. Visit: <a href="/places/assos">Assos</a>.</p>
<h2>Diogenes of Sinope</h2>
<p>Diogenes the Cynic, who lived in a jar and called himself a citizen of the world, was born in Sinope, today's Sinop on the Black Sea. Visit: <a href="/places/sinop">Sinop</a>.</p>
<h2>The Stoics: Chrysippus and Epictetus</h2>
<p><b>Chrysippus</b>, who gave Stoic logic and ethics their system, came from Soli near today's Mersin. <b>Epictetus</b>, born a slave in Hierapolis, taught that we should care only about what is up to us. Visit: <a href="/places/soli-tarsus">Soli</a> and <a href="/places/hierapolis-pamukkale">Hierapolis</a>.</p>
{otel('Pamukkale', 'Stay in Pamukkale for Hierapolis')}
<h2>And more</h2>
<p><b>Herodotus</b>, the first historian, was from Halicarnassus (<a href="/places/bodrum">Bodrum</a>). <b>Galen</b>, the physician-philosopher, from <a href="/places/pergamon">Pergamon</a>. <b>Alexander of Aphrodisias</b>, the commentator on Aristotle, from <a href="/places/aphrodisias">Aphrodisias</a>. The astronomer <b>Hipparchus</b> from Nicaea (<a href="/places/iznik">İznik</a>) and the geometer <b>Apollonius</b> from <a href="/places/perge-aspendos">Perge</a>. Later, <b>Rumi</b> taught in <a href="/places/konya">Konya</a>.</p>
<p>Collect a stamp for each of them in your <a href="/passport">Philosophy Passport</a>: visit four Ionian cities and you earn the Ionian School badge.</p>
''',
  sss=[('Who was the first Greek philosopher?', 'By tradition, Thales of Miletus, in the early 6th century BC. Miletus is on the Aegean coast of today\'s Türkiye, near Didim.'),
       ('Which Greek philosophers were born in Turkey?', 'Among others: Thales, Anaximander and Anaximenes (Miletus), Heraclitus (Ephesus), Anaxagoras (Clazomenae), Bias (Priene), Diogenes (Sinope), Cleanthes (Assos), Chrysippus (Soli) and Epictetus (Hierapolis).'),
       ('Was Aristotle from Turkey?', 'No. He was born in Stagira in northern Greece, but he lived in Assos, on the coast of today\'s Türkiye, for some years around 347 to 345 BC.'),
       ('What was the Ionian school?', 'The name given to the early philosophers of Ionia, especially Thales, Anaximander and Anaximenes of Miletus, who tried to explain the world through natural causes.')],
  ilgili=[('/places/', 'All 30 places'), ('/passport', 'Your Philosophy Passport'), ('/guides/best-ancient-ruins-in-turkey', 'The 15 best ancient ruins')]))

# Hedef: "how to visit Ephesus", "Ephesus tickets", "Ephesus from Kuşadası"
SAYFALAR.append(dict(
  slug='how-to-visit-ephesus',
  baslik='How to visit Ephesus: getting there, which gate, tickets and timing',
  aciklama='How to visit Ephesus from Selçuk, Kuşadası or İzmir: the upper and lower gates, tickets and the Terrace Houses, the best time of day to beat the heat and cruise crowds, and how long you need.',
  etiket='Ephesus · Selçuk, İzmir',
  giris='Ephesus is the best preserved Roman city in the eastern Mediterranean, and one of the busiest sites in Türkiye. A little planning changes the visit completely: which gate you use, what time you arrive and whether you buy the extra ticket for the Terrace Houses. Here is how to visit Ephesus well.',
  ozet=['The ruins are about 3 km from <b>Selçuk</b>, 20 km from <b>Kuşadası</b> and about an hour by car or train from <b>İzmir airport</b>.',
        'Start at the <b>upper gate</b> and walk downhill to the Library of Celsus and the Great Theatre.',
        'Arrive at <b>opening time</b>: it is cooler and the cruise groups come later in the morning.',
        'Allow <b>three hours</b>, or four with the Terrace Houses, which need a separate ticket.'],
  govde=f'''
<h2>How to get to Ephesus</h2>
<p><b>From Selçuk.</b> Selçuk is the town next to the ruins. A taxi to either gate takes a few minutes, and the lower gate is within walking distance, about 3 km along a tree-lined road. Selçuk is the easiest base, with the Ephesus Museum, the Basilica of St John and the Temple of Artemis in town.</p>
<p><b>From Kuşadası.</b> Kuşadası is about 30 minutes away by car. Minibuses (<i>dolmuş</i>) run often between Kuşadası and Selçuk, and many taxis and tours wait at the cruise port.</p>
<p><b>From İzmir and the airport.</b> İzmir Adnan Menderes Airport is about 60 km north of Selçuk. Regional trains run from the airport station and from İzmir to Selçuk, which takes about an hour and a half; by car it is about an hour.</p>
{otel('Selçuk', 'Stay in Selçuk, next to the ruins', 'Where to stay')}
{tur('Ephesus from Kusadasi', 'Ephesus tours with pick-up from Kuşadası and İzmir', 'No car? Go with a tour')}
<h2>Upper gate or lower gate?</h2>
<p>Ephesus has two entrances. The <b>upper gate</b> (south) sits near the State Agora and the Odeon; the <b>lower gate</b> (north) is by the Great Theatre and the old harbour road. The site lies on a slope, so most people start at the upper gate and walk downhill along Curetes Street to the Library of Celsus and out through the lower gate. Taxis wait at both, and drivers know the routine: they drop you at the top and pick you up at the bottom.</p>
<h2>Tickets and the Terrace Houses</h2>
<p>You can buy tickets at the gate or online from the official museum ticket service of the Turkish Ministry of Culture. The <b>Terrace Houses</b> (Yamaç Evler), the homes of wealthy Roman families with wall paintings and mosaic floors, are under a protective roof halfway down Curetes Street and need a separate ticket. They are worth it: this is where Ephesus feels lived in. If you plan to see many sites in Türkiye, compare the price of the <b>Museum Pass</b> with single tickets. Prices and opening hours change each season, so check them before you go.</p>
{tur('Ephesus', 'Skip-the-line tickets and guided tours of Ephesus')}
<h2>When to go</h2>
<p>The best months are April to early June and September to October. In July and August the heat is strong by late morning and there is little shade on the marble streets. Whatever the season, go at <b>opening time</b> or in the late afternoon: cruise ship groups usually arrive mid-morning. Bring water, a hat and shoes with grip, since the old paving stones are smooth.</p>
<h2>A route through the city</h2>
<div class="gun"><h3>Upper city</h3>
<p>From the upper gate, pass the State Agora, the small <b>Odeon</b> where the council met, and the Memmius monument, then turn down <b>Curetes Street</b>.</p></div>
<div class="gun"><h3>Curetes Street</h3>
<p>Look for the <b>Temple of Hadrian</b> with its carved arch, the public latrines and the entrance to the <b>Terrace Houses</b>.</p></div>
<div class="gun"><h3>The Library of Celsus</h3>
<p>At the bottom stands the façade of the <b>Library of Celsus</b>, built in the 2nd century AD. Its niches hold copies of statues of Wisdom, Virtue, Thought and Knowledge.</p></div>
<div class="gun"><h3>The Great Theatre</h3>
<p>Walk along Marble Street to the <b>Great Theatre</b>, which held about 25,000 people, then out by the Harbour Street towards the lower gate.</p></div>
<p>For more ideas, see <a href="/guides/things-to-do-in-ephesus">12 things to do in Ephesus and Selçuk</a>.</p>
<h2>After the ruins</h2>
<p>In Selçuk, the <b>Ephesus Museum</b> holds the statues of Artemis found in the city. On the hill, the <b>Basilica of St John</b> has views over the plain, and below it stands the single column of the <b>Temple of Artemis</b>, once one of the Seven Wonders. The hillside village of <b>Şirince</b> is a good place for dinner.</p>
<h2>The philosopher of Ephesus</h2>
<p>Heraclitus lived in Ephesus around 500 BC. He taught that everything flows, and that the world is held together by a hidden order he called the <i>logos</i>. Read more on our <a href="/places/ephesus">Ephesus page</a>.</p>
''',
  sss=[('How long do you need at Ephesus?', 'About three hours for the ancient city, four with the Terrace Houses. Add half a day for the Ephesus Museum, the Basilica of St John and the Temple of Artemis in Selçuk.'),
       ('Which entrance is best at Ephesus?', 'Most visitors start at the upper (south) gate and walk downhill to the Library of Celsus and the Great Theatre, leaving by the lower (north) gate. Taxis wait at both gates.'),
       ('Are the Terrace Houses worth it?', 'Yes, for most visitors. They are the best preserved Roman houses in the city, with wall paintings and mosaics, and they are under a roof, which is welcome on a hot day. They need a separate ticket.'),
       ('Can you visit Ephesus without a tour?', 'Yes. The site is well signposted and easy to visit on your own from Selçuk or Kuşadası. A guide or audio guide helps you understand what you are seeing.'),
       ('What is the best time to visit Ephesus?', 'Spring and autumn, at opening time or in the late afternoon. Summer middays are very hot, and cruise groups usually arrive mid-morning.')],
  ilgili=[('/guides/things-to-do-in-ephesus', '12 things to do in Ephesus and Selçuk'), ('/guides/where-to-stay-in-ephesus', 'Where to stay for Ephesus'), ('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days')]))

# Hedef: "how to get to Pamukkale", "Pamukkale from Ephesus / Antalya / Istanbul"
SAYFALAR.append(dict(
  slug='how-to-get-to-pamukkale',
  baslik='How to get to Pamukkale from Istanbul, Selçuk, Antalya and Cappadocia',
  aciklama='How to get to Pamukkale by plane, bus, train or car: from Denizli, Selçuk and Ephesus, Antalya, Istanbul, İzmir and Cappadocia, with travel times, the minibus from Denizli and which gate to use.',
  etiket='Hierapolis · Pamukkale, Denizli',
  giris='Pamukkale, the white terraces with the ancient city of Hierapolis on top, is inland, about 20 km from the city of Denizli. Every route to Pamukkale runs through Denizli, by plane, bus or train, and the last stretch is a short minibus or taxi ride. Here is how to get there from wherever you are.',
  ozet=['The gateway is <b>Denizli</b>: its bus station and railway station are in the city, its airport (Çardak) about an hour away.',
        'From the Denizli bus station, <b>minibuses</b> run to Pamukkale village in about 30 to 40 minutes.',
        'From <b>Selçuk</b> (Ephesus) it is about 3 hours by train, bus or car; from <b>Antalya</b> about 4 hours.',
        'From <b>Istanbul</b>, fly to Denizli or take an overnight bus.'],
  govde=f'''
<h2>The last step: Denizli to Pamukkale</h2>
<p>Almost every journey ends at the <b>Denizli bus station</b> (<i>otogar</i>), which is next to the railway station. From the lower level, minibuses (<i>dolmuş</i>) leave regularly for Pamukkale village and take about 30 to 40 minutes. Some long-distance bus companies also include a free shuttle from Denizli to Pamukkale: ask when you buy your ticket. A taxi is faster and still affordable for a group.</p>
<h2>From Selçuk and Ephesus</h2>
<p>This is the most popular way to arrive, as many people pair Ephesus with Pamukkale. <b>Regional trains</b> run from Selçuk to Denizli several times a day and take about three hours, with views of the Meander valley. <b>Buses</b> take a similar time. By <b>car</b> it is about 190 km, roughly three hours, and you can stop at Aphrodisias on the way. See our <a href="/guides/ephesus-to-pamukkale-itinerary">four-day route from Ephesus to Pamukkale</a>.</p>
{tur('Pamukkale from Selcuk', 'Day trips to Pamukkale from Selçuk and Kuşadası')}
<h2>From Istanbul</h2>
<p>The quickest way is a <b>flight from Istanbul to Denizli Çardak Airport</b>, about an hour and ten minutes. From the airport, shuttle buses and taxis go to Denizli and Pamukkale, about an hour by road. <b>Overnight buses</b> from Istanbul take about ten to twelve hours.</p>
{tur('Denizli airport transfer Pamukkale', 'Airport transfers and day tours from Denizli', 'Arriving by plane')}
<h2>From Antalya</h2>
<p>Buses from Antalya to Denizli take about four hours over the Taurus Mountains. By car it is about 240 km. Many hotels in Antalya sell long day tours to Pamukkale, but staying a night is much more relaxed.</p>
<h2>From İzmir</h2>
<p>Trains from İzmir (Basmane) to Denizli pass through Selçuk and take about four to five hours. Buses are a little faster. İzmir airport has more international flights than Denizli, so it is a good arrival point for a trip that combines Ephesus and Pamukkale.</p>
<h2>From Cappadocia</h2>
<p>Overnight buses run from Göreme and Nevşehir to Denizli and take about nine to ten hours. If you prefer to fly, connect through Istanbul.</p>
<h2>By car, and which gate to use</h2>
<p>Pamukkale has three entrances. The <b>town gate</b>, at the foot of the travertines in Pamukkale village, lets you walk up the white terraces barefoot. The <b>north</b> and <b>south gates</b>, on the plateau above, are best if you come by car or taxi and want to start with Hierapolis; both have parking. A good plan is to enter at the top in the morning, walk down through the terraces and leave by the town gate.</p>
{otel('Pamukkale', 'Hotels in Pamukkale village', 'Where to stay')}
<h2>How long to stay</h2>
<p>One night is enough to see the terraces at sunset and Hierapolis early the next morning, before the day tours arrive. Stay two nights to add <a href="/places/aphrodisias">Aphrodisias</a>, about an hour and a half away. See <a href="/guides/where-to-stay-in-pamukkale">where to stay in Pamukkale</a>.</p>
<h2>The philosopher of Hierapolis</h2>
<p>Hierapolis was the birthplace of <b>Epictetus</b>, the Stoic teacher who grew up a slave and taught that our freedom lies in what is up to us. See our <a href="/places/hierapolis-pamukkale">Hierapolis page</a>.</p>
''',
  sss=[('What is the nearest airport to Pamukkale?', 'Denizli Çardak Airport, about an hour by road, with flights from Istanbul. İzmir airport, about three to four hours away, has more international flights.'),
       ('How do I get from Denizli to Pamukkale?', 'By minibus (dolmuş) from the lower level of the Denizli bus station, in about 30 to 40 minutes, or by taxi.'),
       ('How far is Pamukkale from Ephesus?', 'About 190 km, or roughly three hours by car, train or bus from Selçuk, the town next to Ephesus.'),
       ('Can you do Pamukkale as a day trip?', 'Yes, from Selçuk, Kuşadası or even Antalya, but it means six to eight hours on the road. One night in Pamukkale lets you see the terraces at sunset and early morning, when they are at their best.')],
  ilgili=[('/guides/where-to-stay-in-pamukkale', 'Where to stay in Pamukkale'), ('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days'), ('/places/hierapolis-pamukkale', 'Hierapolis and Epictetus')]))

# Hedef: "Turkey 7 day itinerary ancient sites", "Turkey ruins road trip"
SAYFALAR.append(dict(
  slug='turkey-ancient-sites-7-day-itinerary',
  baslik='Troy to Pamukkale in 7 days: an ancient sites road trip in Türkiye',
  aciklama='A 7-day road trip through the best ancient sites of western Türkiye: Troy, Assos, Pergamon, Ephesus, Aphrodisias and Pamukkale, with drive times, where to sleep each night and the philosophers behind each stop.',
  etiket='Aegean coast · 7 days, 6 nights',
  giris='The Aegean coast of Türkiye is lined with ancient cities, and they follow each other neatly from north to south. This seven-day route visits them by car, from Homer\'s Troy to the white terraces of Pamukkale, with one or two main sites a day and a night in a different town each evening.',
  ozet=['<b>Day 1</b> Troy, night in Çanakkale.', '<b>Day 2</b> Assos, night in Behramkale.', '<b>Day 3</b> Pergamon, night in Bergama.',
        '<b>Day 4</b> Selçuk, and <b>Day 5</b> Ephesus, nights in Selçuk.', '<b>Day 6</b> Aphrodisias, and <b>Day 7</b> Pamukkale, nights in Pamukkale.',
        'Start from Istanbul or Çanakkale; finish at Denizli airport or continue to Antalya.'],
  govde=f'''
<h2>Before you go</h2>
<p>This route is easiest with a <b>rental car</b>: the drives are two to three hours a day on good roads, and several sites are outside towns. You can pick up a car in Istanbul or Çanakkale and drop it at Denizli airport. Without a car, buses link all the towns, but plan an extra day or two. The best seasons are spring and autumn; in summer, visit the sites early and drive in the afternoon.</p>
<h2>The route, day by day</h2>
<div class="gun"><h3>Day 1 · Troy</h3>
<p>From Istanbul the drive to Çanakkale takes about four to five hours, over the 1915 Çanakkale Bridge. Troy is 30 km south of the town. Walk round the mound, where at least nine cities were built on top of each other, then see the excellent <b>Troy Museum</b> by the entrance.</p>
<p><b>Ideas:</b> Homer, and Plato's quarrel with the poets.</p></div>
{otel('Çanakkale', 'Night 1 · Çanakkale')}
<div class="gun"><h3>Day 2 · Assos</h3>
<p>About an hour and a half south. The <b>Temple of Athena</b> sits on a volcanic hilltop above the sea, facing the island of Lesbos, and the village of Behramkale climbs up to it. Below, the old harbour has stone hotels and fish restaurants.</p>
<p><b>Ideas:</b> Aristotle lived here for some years around 347 to 345 BC; Cleanthes, head of the Stoic school, was born here.</p></div>
{otel('Assos', 'Night 2 · Assos and Behramkale')}
<div class="gun"><h3>Day 3 · Pergamon</h3>
<p>About two hours to Bergama. Take the cable car up to the <b>Acropolis</b>, with the steepest theatre of the ancient world and the foundations of the Great Altar. Below the town, the <b>Asklepieion</b> was a healing sanctuary where patients slept in the hope of a curing dream.</p>
<p><b>Ideas:</b> Galen, the physician-philosopher, was born in Pergamon. The city's great library rivalled Alexandria's.</p></div>
{otel('Bergama', 'Night 3 · Bergama')}
<div class="gun"><h3>Day 4 · Selçuk</h3>
<p>About two and a half hours south. Arrive for the afternoon: see the <b>Ephesus Museum</b>, climb to the <b>Basilica of St John</b>, and watch the sunset by the lone column of the <b>Temple of Artemis</b>. Have dinner in the hillside village of Şirince.</p></div>
<div class="gun"><h3>Day 5 · Ephesus</h3>
<p>Be at the upper gate at opening time and walk down Curetes Street to the Library of Celsus and the Great Theatre. Buy the extra ticket for the <b>Terrace Houses</b>. In the afternoon, rest, or drive 45 minutes to <a href="/places/priene-didyma">Priene</a>, a planned Hellenistic town on the slopes of Mount Mykale.</p>
<p><b>Ideas:</b> Heraclitus and the river that is never the same.</p></div>
{otel('Selçuk', 'Nights 4 and 5 · Selçuk')}
{tur('Ephesus', 'Ephesus tickets and guided tours')}
<div class="gun"><h3>Day 6 · Aphrodisias</h3>
<p>About two hours inland. Aphrodisias was a city of sculptors: see the reliefs of the Sebasteion in the museum, the Tetrapylon gate and one of the best preserved stadiums of the ancient world. Drive on to Pamukkale, about an hour and a half, and walk onto the travertines at sunset.</p>
<p><b>Ideas:</b> Alexander of Aphrodisias, the great ancient commentator on Aristotle.</p></div>
<div class="gun"><h3>Day 7 · Hierapolis and Pamukkale</h3>
<p>Go early, before the day tours. Walk barefoot over the white terraces, then explore <b>Hierapolis</b> above them: the theatre, the long necropolis and the museum in the Roman baths. Swim in the Antique Pool if you like. In the evening, fly home from Denizli or continue to Antalya.</p>
<p><b>Ideas:</b> Epictetus, born here a slave, who taught that some things are up to us and some are not.</p></div>
{otel('Pamukkale', 'Nights 6 and 7 · Pamukkale')}
{tur('Pamukkale', 'Pamukkale tours, balloon flights and tickets')}
<h2>Shorter or longer</h2>
<p><b>Five days:</b> skip Assos and Pergamon, start in İzmir and do days 4 to 7. <b>Ten days:</b> add a day for Miletus and Didyma, the cities of the first philosophers (see <a href="/guides/ephesus-to-pamukkale-itinerary">Ephesus to Pamukkale in 4 days</a>), and begin with two days in Istanbul (see <a href="/guides/turkey-history-itinerary-10-days">Turkey in 10 days</a>).</p>
{planla('Troy to Pamukkale in 7 days', [('Night 1', 'Çanakkale'), ('Night 2', 'Assos'), ('Night 3', 'Bergama'), ('Nights 4–5', 'Selçuk'), ('Nights 6–7', 'Pamukkale')], [('Troy', 'Troy Turkey'), ('Ephesus', 'Ephesus'), ('Pamukkale', 'Pamukkale')])}
<p class="not">Drive times are approximate and assume no long stops. Check opening hours and ticket prices before you go: they change each season.</p>
''',
  sss=[('Is 7 days enough to see the ancient sites of Turkey?', 'Seven days is enough for the western coast: Troy, Assos, Pergamon, Ephesus, Aphrodisias and Pamukkale. Sites further east, such as Cappadocia, Mount Nemrut and Göbekli Tepe, need a separate trip or a flight.'),
       ('Do I need a car for this route?', 'A car makes it much easier, as Troy, Assos, the Asklepieion and Aphrodisias are outside the towns. Without one, buses connect Çanakkale, Bergama, Selçuk and Denizli, but you will need more time and some taxis.'),
       ('Where should I start and finish?', 'Start in Istanbul or Çanakkale and finish at Denizli, which has flights back to Istanbul. You can also do the route in reverse, or start in İzmir for a shorter version.'),
       ('Which is the best ancient site on this route?', 'Ephesus is the most complete city, but many visitors are most moved by Aphrodisias, which is quieter, or by the theatre of Pergamon on its steep hillside.')],
  ilgili=[('/guides/best-ancient-ruins-in-turkey', 'The 15 best ancient ruins in Türkiye'), ('/guides/visiting-troy-turkey', 'Visiting Troy'), ('/guides/how-to-visit-ephesus', 'How to visit Ephesus'), ('/guides/how-to-get-to-pamukkale', 'How to get to Pamukkale')]))

# ---------------------------------------------------------------- Merkez sayfa
SAYFALAR.append(dict(
  slug='philosophy-trip-turkey',
  baslik='A philosophy trip through Türkiye: places, routes and guides',
  aciklama='Plan a trip to the places where philosophy and art were born in Türkiye: Ephesus, Istanbul, Cappadocia, Göbekli Tepe, Troy, Lycia, Konya and more, with ten ready-made routes.',
  etiket='Travel guides',
  giris='Many of the first philosophers lived on the coasts of what is now Türkiye. You can still walk through their cities: the theatres where people gathered, the libraries, the harbours. These guides help you plan the trip, choose where to stay and know what you are looking at.',
  ozet=['Twenty-two philosophy and art stops from Göbekli Tepe to Rumi, on one <a href="/turkey">interactive map</a>.',
        'Ten ready-made routes, from Troy and the Aegean coast to Istanbul, Cappadocia, Lycia and Mesopotamia.',
        'Hotel and tour suggestions for every night of every route.'],
  govde=f'''
<h2>Guides</h2>
<div class="ilgili">
<a href="/guides/how-to-visit-ephesus">How to visit Ephesus: getting there, gates and timing →</a>
<a href="/guides/where-to-stay-in-ephesus">Where to stay for Ephesus: Selçuk, Şirince or Kuşadası →</a>
<a href="/guides/ephesus-to-pamukkale-itinerary">Ephesus to Pamukkale in 4 days →</a>
<a href="/guides/how-to-get-to-pamukkale">How to get to Pamukkale →</a>
<a href="/guides/where-to-stay-in-pamukkale">Where to stay in Pamukkale →</a>
<a href="/guides/where-to-stay-in-istanbul">Where to stay in Istanbul for Hagia Sophia →</a>
<a href="/guides/where-to-stay-in-cappadocia">Where to stay in Cappadocia →</a>
<a href="/guides/antalya-ancient-cities-perge-aspendos">Perge, Aspendos and Side from Antalya →</a>
<a href="/guides/lycian-way-xanthos-patara">Lycia and the Lycian Way →</a>
</div>
<h2>Plan by topic</h2>
<div class="ilgili">
<a href="/guides/best-ancient-ruins-in-turkey">The 15 best ancient ruins in Türkiye →</a>
<a href="/guides/turkey-ancient-sites-7-day-itinerary">Troy to Pamukkale: 7-day ancient sites road trip →</a>
<a href="/guides/turkey-history-itinerary-10-days">Turkey itinerary for 10 days →</a>
<a href="/guides/things-to-do-in-ephesus">12 things to do in Ephesus and Selçuk →</a>
<a href="/guides/cappadocia-3-day-itinerary">Cappadocia itinerary: 3 days →</a>
<a href="/guides/how-to-visit-gobekli-tepe">How to visit Göbekli Tepe →</a>
<a href="/guides/mount-nemrut-sunrise">Mount Nemrut at sunrise →</a>
<a href="/guides/visiting-troy-turkey">Visiting Troy →</a>
<a href="/guides/ancient-greek-philosophers-from-turkey">Ancient Greek philosophers from Türkiye →</a>
<a href="/places/">All 30 places, one page each →</a>
<a href="/passport">Your Philosophy Passport: stamps and badges →</a>
</div>
<h2>The ten routes</h2>
<h3>Aegean and Pamukkale · 4 days</h3>
<p>Ephesus, Miletus, Aphrodisias and Hierapolis: from Heraclitus to Epictetus. Nights in Selçuk, Didim and Pamukkale.</p>
<h3>Northern Aegean and Troy · 4 days</h3>
<p>Clazomenae near Urla, Pergamon, Assos and Troy: the shores of Anaxagoras, Galen, Aristotle and Homer. Nights in Urla, Bergama, Behramkale and Çanakkale.</p>
<h3>Konya and the Mediterranean · 2 days</h3>
<p>The Mevlana Museum and Seljuk tilework in Konya, then Tarsus and Soli, home of the Stoic Chrysippus. Nights in Konya and Mersin.</p>
<h3>Diogenes' Sinop · 2 days</h3>
<p>The Black Sea town where Diogenes the Cynic was born. Two nights in Sinop.</p>
<h3>Istanbul and İznik · 3 days</h3>
<p>Hagia Sophia, the Archaeology Museums and Chora, then İznik, birthplace of Hipparchus. Two nights in Istanbul, one in İznik.</p>
<h3>Cappadocia and Konya · 3 days</h3>
<p>The rock churches of Göreme and the land of the Cappadocian Fathers, then Rumi's Konya. Two nights in Göreme, one in Konya.</p>
<h3>The ancient cities of Antalya · 3 days</h3>
<p>Perge, home of Apollonius, the theatre of Aspendos and Side. Two nights in Antalya, one in Side.</p>
<h3>Mesopotamia: Zeugma, Nemrut, Göbekli Tepe, Mardin · 5 days</h3>
<p>The Zeugma mosaics, the colossal statues of Mount Nemrut, Göbekli Tepe, one of the earliest known monumental sites, Harran and the Syriac monasteries of Mardin. Nights in Gaziantep, Kahta, Şanlıurfa and Mardin.</p>
<h3>Priene, Miletus and Bodrum · 3 days</h3>
<p>Priene, city of Bias, one of the Seven Sages, the oracle of Apollo at Didyma, the first philosophers at Miletus, then Herodotus and the Mausoleum at Halicarnassus. A night in Didim, two in Bodrum.</p>
<h3>Lycia: Xanthos, Letoon, Patara · 3 days</h3>
<p>Montesquieu's model republic: pillar tombs, the league's assembly hall at Patara and a day on the Lycian Way. Two nights in Kalkan, one in Kaş.</p>
<p><a href="/turkey#rota-bolum">See the routes on the map →</a></p>
{otel('Selçuk', 'Start in Selçuk, the base for Ephesus', 'Most trips begin here')}
''',
  ilgili=[]))

os.makedirs(KOK, exist_ok=True)
for s in SAYFALAR:
    with open(os.path.join(KOK, s['slug'] + '.html'), 'w', encoding='utf-8') as f:
        f.write(sayfa(**s))
    print('yazıldı: guides/' + s['slug'] + '.html')
