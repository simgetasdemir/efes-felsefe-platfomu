#!/usr/bin/env python3
"""Dünya rotası fotoğrafları: ham JPG'leri img/dunya/<ad>.webp (1280) ve -640.webp yapar, dunya-foto.js yazar.
Kullanım: python3 scripts/dunya-foto.py <ham klasörü> <bilgi.json>"""
import json, os, sys
from PIL import Image
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ham, bilgi = sys.argv[1], json.load(open(sys.argv[2]))
BASLIK = {
 'elea': ('Elea\'da Porta Rosa yolu', 'The Porta Rosa street at Elea'),
 'atina': ('Filopappos Tepesi\'nden Akropolis', 'The Acropolis from Philopappos Hill'),
 'sarnath': ('Sarnath\'taki Dhamek Stupası', 'The Dhamek Stupa at Sarnath'),
 'louguantai': ('Louguantai tapınağı', 'The Louguantai temple'),
 'qufu': ('Qufu\'daki Konfüçyüs Tapınağı', 'The Temple of Confucius, Qufu'),
 'iskenderiye': ('Bibliotheca Alexandrina\'nın okuma salonu', 'The reading room of the Bibliotheca Alexandrina'),
 'roma': ('Marcus Aurelius\'un bronz heykeli, Capitolino Müzeleri', 'The bronze Marcus Aurelius, Capitoline Museums'),
 'hippo': ('Hippo kalıntılarının üstünde Aziz Augustinus Bazilikası', 'The Basilica of St Augustine above the ruins of Hippo'),
 'nalanda': ('Nalanda\'da Sariputta Stupası', 'The Sariputta Stupa, Nalanda'),
 'bagdat': ('Bağdat\'ta Müstansıriye Medresesi', 'The Mustansiriya Madrasa, Baghdad'),
 'buhara': ('Buhara\'da Samanîler Türbesi', 'The Samanid Mausoleum, Bukhara'),
 'kurtuba': ('Kurtuba Mescid-i Kebiri\'nin kemerleri', 'Arches of the Great Mosque of Córdoba'),
 'paris': ('Sorbonne\'da "Universités de Paris" yazıtı', '"Universités de Paris" at the Sorbonne'),
 'tunus': ('Tunus\'ta İbn Haldun heykeli', 'The statue of Ibn Khaldun, Tunis'),
 'floransa': ('Katedral terasından Floransa', 'Florence from the cathedral terrace'),
 'timbuktu': ('Timbuktu\'da Sankore Camii', 'The Sankore Mosque, Timbuktu'),
 'isfahan': ('Kayseriye kapısından Nakş-ı Cihan Meydanı', 'Naqsh-e Jahan Square from the Qeysarieh portal'),
 'aksum': ('Aksum\'un dikilitaşları', 'The stelae of Aksum'),
 'meksika': ('Eski San Jerónimo manastırı, bugün Sor Juana Üniversitesi', 'The former convent of San Jerónimo, now the University of the Cloister of Sor Juana'),
 'amsterdam': ('Spinoza\'nın Rijnsburg\'daki evi', 'Spinoza\'s house in Rijnsburg'),
 'edinburgh': ('Royal Mile\'da Hume heykeli (Alexander Stoddart)', 'Hume\'s statue on the Royal Mile, by Alexander Stoddart'),
 'konigsberg': ('Königsberg Katedrali\'nde Kant\'ın mezarı', 'Kant\'s tomb at Königsberg Cathedral'),
 'berlin': ('Humboldt Üniversitesi ana binası', 'The main building of Humboldt University'),
 'kopenhag': ('Kraliyet Kütüphanesi bahçesinde Kierkegaard heykeli', 'Kierkegaard\'s statue in the Royal Library garden'),
 'concord': ('Walden Gölü', 'Walden Pond'),
 'kyoto': ('Filozof Yolu (Tetsugaku no michi)', 'The Philosopher\'s Path (Tetsugaku no michi)'),
}
out = {}
os.makedirs(os.path.join(KOK, 'img', 'dunya'), exist_ok=True)
for ad, (tr, en) in BASLIK.items():
    x = bilgi.get(ad)
    j = os.path.join(ham, ad + '.jpg')
    if not x or not os.path.exists(j): print('EKSİK', ad); continue
    im = Image.open(j).convert('RGB')
    o = min(1, 1280 / im.width, 960 / im.height)
    if o < 1: im = im.resize((round(im.width * o), round(im.height * o)), Image.LANCZOS)
    im.save(os.path.join(KOK, 'img', 'dunya', ad + '.webp'), 'WEBP', quality=72, method=6)
    k = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    k.save(os.path.join(KOK, 'img', 'dunya', ad + '-640.webp'), 'WEBP', quality=74, method=6)
    lic = x['lic'] or ''
    out[ad] = dict(src='/img/dunya/%s.webp' % ad, kucuk='/img/dunya/%s-640.webp' % ad, w=im.width, h=im.height, baslik=dict(tr=tr, en=en),
                   yazar=x['art'][:80] or 'Wikimedia Commons', lisans=lic, lisansUrl=x['licurl'] or x['page'], kaynak=x['page'])
# Türkiye durakları: sitedeki mevcut Commons fotoğrafları
sys.path.insert(0, KOK)
import re
txt = open(os.path.join(KOK, 'foto-veri.js')).read()
F = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
for ad, (yer, i) in {'miletus': ('milet', 1), 'ephesus': ('efes', 4), 'konya': ('konya', 1)}.items():
    f = F[yer][i]
    out[ad] = dict(src=f['src'], kucuk=f['kucuk'], w=f['w'], h=f['h'], baslik=f['baslik'], yazar=f['yazar'], lisans=f['lisans'], lisansUrl=f['lisansUrl'], kaynak=f['kaynak'])
js = '/* Dünya rotası fotoğrafları, Wikimedia Commons, atıflarıyla. Üretici: scripts/dunya-foto.py */\nwindow.DUNYA_FOTO = ' + json.dumps(out, ensure_ascii=False) + ';\n'
open(os.path.join(KOK, 'dunya-foto.js'), 'w').write(js)
print(len(out), 'fotoğraf')
