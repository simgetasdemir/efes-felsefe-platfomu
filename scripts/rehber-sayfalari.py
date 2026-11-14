#!/usr/bin/env python3
"""İngilizce rehber sayfalarını (guides/*.html) üretir.

Kullanım:  python3 scripts/rehber-sayfalari.py
Metni değiştirmek için aşağıdaki SAYFALAR listesini düzenle ve betiği yeniden çalıştır.
Otel ve tur bağlantılarının kimlikleri ortaklik.js dosyasından gelir; burada kimlik yazılmaz.
Alan adı belli olunca ALAN değişkenini doldur: canonical ve paylaşım adresleri tam olur.
"""
import html, json, os, urllib.parse

ALAN = ''  # ör. 'https://www.ornek.com' (sonunda / olmadan)
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'guides')

def e(x): return html.escape(x, quote=True)

def otel(kasaba, baslik, alt='Compare hotels'):
    q = urllib.parse.quote(kasaba + ', Türkiye')
    return f'''<div class="cta"><small>{e(alt)}</small><b>{e(baslik)}</b><div class="dugmeler">
<a href="https://www.booking.com/searchresults.html?ss={q}" data-otel="booking" data-kasaba="{e(kasaba)}" target="_blank" rel="sponsored noopener">Booking.com</a>
<a href="https://www.hotels.com/Hotel-Search?destination={q}" data-otel="hotels" data-kasaba="{e(kasaba)}" target="_blank" rel="sponsored noopener">Hotels.com</a>
</div></div>'''

def tur(sorgu, baslik, alt='Tours and tickets'):
    q = urllib.parse.quote(sorgu)
    return f'''<div class="cta tur"><small>{e(alt)}</small><b>{e(baslik)}</b><div class="dugmeler">
<a href="https://www.getyourguide.com/s/?q={q}" data-tur="getyourguide" data-sorgu="{e(sorgu)}" target="_blank" rel="sponsored noopener">GetYourGuide</a>
<a href="https://www.viator.com/searchResults/all?text={q}" data-tur="viator" data-sorgu="{e(sorgu)}" target="_blank" rel="sponsored noopener">Viator</a>
</div></div>'''

ACIKLAMA = '<p class="not" data-aciklama hidden>Some links on this page are affiliate links (Booking.com, Hotels.com, GetYourGuide, Viator). If you book through them, this site may earn a commission at no extra cost to you.</p>'

def sayfa(slug, baslik, aciklama, etiket, giris, ozet, govde, ilgili):
    adres = (ALAN + '/guides/' + slug) if ALAN else ''
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": baslik, "description": aciklama, "inLanguage": "en",
          "about": {"@type": "Place", "name": etiket}, "isPartOf": {"@type": "WebSite", "name": "Philosophy Map of Türkiye"}}
    if adres: ld["mainEntityOfPage"] = adres
    ilgili_html = ''.join(f'<a href="{a}">{e(b)} →</a>' for a, b in ilgili)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(baslik)} | Philosophy Map of Türkiye</title>
<meta name="description" content="{e(aciklama)}">
{f'<link rel="canonical" href="{adres}">' if adres else ''}
<meta property="og:type" content="article">
<meta property="og:title" content="{e(baslik)}">
<meta property="og:description" content="{e(aciklama)}">
<meta property="og:image" content="{ALAN}/og-harita.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1F2A36">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<link rel="stylesheet" href="/guides/rehber.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="ust"><a class="marka" href="/">Philosophy Map of Türkiye</a><a href="/guides/philosophy-trip-turkey">All guides</a></header>
<main>
<div class="etiket">{e(etiket)}</div>
<h1>{e(baslik)}</h1>
<p class="giris">{giris}</p>
<div class="ozet"><b>In short</b><ul>{''.join('<li>' + x + '</li>' for x in ozet)}</ul></div>
{govde}
{ACIKLAMA}
<h2>Keep exploring</h2>
<div class="ilgili">{ilgili_html}<a href="/">Open the philosophy map →</a></div>
</main>
<footer>Travel times are approximate; check opening hours and tickets before you go. Ideas are summarised from the Stanford Encyclopedia of Philosophy and other scholarly sources linked on the map.</footer>
<script src="/ortaklik.js"></script>
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
  ilgili=[('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days'), ('/#efes', 'Ephesus on the philosophy map')]))

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
  ilgili=[('/guides/where-to-stay-in-ephesus', 'Where to stay for Ephesus'), ('/guides/where-to-stay-in-pamukkale', 'Where to stay in Pamukkale')]))

# ---------------------------------------------------------------- Pamukkale
SAYFALAR.append(dict(
  slug='where-to-stay-in-pamukkale',
  baslik='Where to stay in Pamukkale: village, Karahayıt or Denizli',
  aciklama='Where to stay for Pamukkale and Hierapolis: Pamukkale village at the foot of the travertines, Karahayıt for thermal hotels, or Denizli for transport. With tips and the story of Epictetus.',
  etiket='Hierapolis · Pamukkale, Denizli',
  giris='Pamukkale is best early in the morning and late in the afternoon, when the white terraces glow and the day trippers have gone. Staying nearby is what makes that possible.',
  ozet=['<b>Pamukkale village</b> sits at the foot of the travertines: walk to the entrance, and see the terraces at sunrise.',
        '<b>Karahayıt</b>, a few kilometres north, has larger hotels with thermal pools.',
        '<b>Denizli</b>, the nearby city, is the transport hub, with the bus station and a wider choice of hotels.'],
  govde=f'''
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
  ilgili=[('/guides/ephesus-to-pamukkale-itinerary', 'Ephesus to Pamukkale in 4 days'), ('/#hierapolis', 'Hierapolis on the philosophy map')]))

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
  ilgili=[('/#istanbul', 'Istanbul on the philosophy map'), ('/#iznik', 'İznik on the philosophy map'), ('/guides/where-to-stay-in-cappadocia', 'Where to stay in Cappadocia')]))

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
  ilgili=[('/#kapadokya', 'Cappadocia on the philosophy map'), ('/#konya', 'Konya on the philosophy map'), ('/guides/where-to-stay-in-istanbul', 'Where to stay in Istanbul')]))

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
  ilgili=[('/#antalya', 'Perge and Aspendos on the philosophy map'), ('/guides/where-to-stay-in-cappadocia', 'Where to stay in Cappadocia')]))

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
  ilgili=[('/#likya', 'Lycia on the philosophy map'), ('/guides/antalya-ancient-cities-perge-aspendos', 'Perge, Aspendos and Side from Antalya')]))

# ---------------------------------------------------------------- Merkez sayfa
SAYFALAR.append(dict(
  slug='philosophy-trip-turkey',
  baslik='A philosophy trip through Türkiye: places, routes and guides',
  aciklama='Plan a trip to the places where philosophy and art were born in Türkiye: Ephesus, Istanbul, Cappadocia, Göbekli Tepe, Troy, Lycia, Konya and more, with ten ready-made routes.',
  etiket='Travel guides',
  giris='Many of the first philosophers lived on the coasts of what is now Türkiye. You can still walk through their cities: the theatres where people gathered, the libraries, the harbours. These guides help you plan the trip, choose where to stay and know what you are looking at.',
  ozet=['Twenty-two philosophy and art stops from Göbekli Tepe to Rumi, on one <a href="/">interactive map</a>.',
        'Ten ready-made routes, from Troy and the Aegean coast to Istanbul, Cappadocia, Lycia and Mesopotamia.',
        'Hotel and tour suggestions for every night of every route.'],
  govde=f'''
<h2>Guides</h2>
<div class="ilgili">
<a href="/guides/where-to-stay-in-ephesus">Where to stay for Ephesus: Selçuk, Şirince or Kuşadası →</a>
<a href="/guides/ephesus-to-pamukkale-itinerary">Ephesus to Pamukkale in 4 days →</a>
<a href="/guides/where-to-stay-in-pamukkale">Where to stay in Pamukkale →</a>
<a href="/guides/where-to-stay-in-istanbul">Where to stay in Istanbul for Hagia Sophia →</a>
<a href="/guides/where-to-stay-in-cappadocia">Where to stay in Cappadocia →</a>
<a href="/guides/antalya-ancient-cities-perge-aspendos">Perge, Aspendos and Side from Antalya →</a>
<a href="/guides/lycian-way-xanthos-patara">Lycia and the Lycian Way →</a>
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
<p><a href="/#rota-bolum">See the routes on the map →</a></p>
{otel('Selçuk', 'Start in Selçuk, the base for Ephesus', 'Most trips begin here')}
''',
  ilgili=[]))

os.makedirs(KOK, exist_ok=True)
for s in SAYFALAR:
    with open(os.path.join(KOK, s['slug'] + '.html'), 'w', encoding='utf-8') as f:
        f.write(sayfa(**s))
    print('yazıldı: guides/' + s['slug'] + '.html')
