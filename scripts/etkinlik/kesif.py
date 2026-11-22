#!/usr/bin/env python3
"""Kaynak sitelerin yapısını keşfetmek için tanı betiği (yalnızca okuma, birkaç istek).
Pull request çalıştırmalarında kaynak adreslerini doğrulamak için kullanılır."""
import json, re, urllib.request

UA = {"User-Agent": "AntikyolEtkinlikBot/0.1 (+https://antikyol.com/events)"}


def al(url, n=600000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
            return r.status, r.read(n).decode("utf-8", "replace")
    except Exception as e:
        return getattr(e, "code", "ERR"), str(e)


print("=== robots", al("https://kultur.istanbul/robots.txt")[1][:600])
s, b = al("https://kultur.istanbul/wp-json/wp/v2/event_listing?per_page=2&_embed=1")
print("=== event_listing", s)
try:
    it = json.loads(b)
    for x in it:
        print("keys:", sorted(x.keys()))
        print("meta:", json.dumps(x.get("meta"), ensure_ascii=False)[:800])
        print("acf:", json.dumps(x.get("acf"), ensure_ascii=False)[:400])
        print("title:", x["title"]["rendered"], "link:", x["link"], "date:", x.get("date"))
        print("taxonomies:", {k: v for k, v in x.items() if isinstance(v, list) and k not in ("meta",)})
        terms = [(t.get("taxonomy"), t.get("name")) for g in (x.get("_embedded", {}).get("wp:term") or []) for t in g]
        print("terms:", terms)
    link = it[0]["link"]
except Exception as e:
    print("parse hata", e, b[:400]); link = "https://kultur.istanbul/etkinlik/terasta-caz/"
s, b = al(link)
print("=== sayfa", link, s, len(b))
print("ld+json:", re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', b, re.S)[:2])
i = b.find("wpem")
for kw in ("event-date", "wpem-event-date", "Başlangıç", "Tarih", "Mekan", "Mekân", "Saat", "Bilet", "Ücret", "event_start", "wpem-event-location", "wpem-heading"):
    j = b.find(kw)
    if j >= 0:
        print(f"--- {kw} @ {j}:", re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " | ", b[j - 200:j + 500]))[:500])
s, b = al("https://www.akmistanbul.gov.tr/tr/takvim")
print("=== akm takvim", s, len(b), "ld", len(re.findall("ld\\+json", b)))
print(sorted(set(re.findall(r'href="(/tr/etkinlik[^"]+)"', b)))[:10])
for u in re.findall(r'(?:src|href)="([^"]*api[^"]*)"', b)[:10]:
    print(" api?", u)
