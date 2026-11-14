#!/usr/bin/env python3
"""sitemap.xml üretir. Yeni sayfa ekledikten sonra çalıştır: python3 scripts/sitemap.py"""
import datetime, glob, os
ALAN = 'https://antikyol.com'
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
bugun = datetime.date.today().isoformat()
adresler = [('/', '1.0'), ('/places/', '0.9'), ('/passport', '0.5'), ('/efes', '0.7')]
for d, onc in (('places', '0.8'), ('guides', '0.8'), ('walk', '0.6')):
    for f in sorted(glob.glob(os.path.join(KOK, d, '*.html'))):
        ad = os.path.basename(f)[:-5]
        if ad != 'index': adresler.append((f'/{d}/{ad}', onc))
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
xml += [f'  <url><loc>{ALAN}{a}</loc><lastmod>{bugun}</lastmod><priority>{p}</priority></url>' for a, p in adresler]
xml.append('</urlset>')
open(os.path.join(KOK, 'sitemap.xml'), 'w').write('\n'.join(xml) + '\n')
print(len(adresler), 'adres')
