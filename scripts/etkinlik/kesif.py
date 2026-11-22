#!/usr/bin/env python3
"""Kaynak sitelerin yapısını keşfetmek için tanı betiği (yalnızca okuma, sınırlı istek).
Pull request çalıştırmalarında kaynak adreslerini doğrulamak için kullanılır."""
import json, re, sys, urllib.request

UA = {"User-Agent": "AntikyolEtkinlikBot/0.1 (+https://antikyol.com/events)"}


def al(url, n=400000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
            return r.status, r.read(n).decode("utf-8", "replace")
    except Exception as e:
        return getattr(e, "code", "ERR"), str(e)


def bas(t):
    print("\n=== " + t, flush=True)


bas("kultur.istanbul types")
s, b = al("https://kultur.istanbul/wp-json/wp/v2/types")
print(s)
try:
    for k, v in json.loads(b).items():
        print(f"  {k}: rest_base={v.get('rest_base')} name={v.get('name')}")
except Exception:
    print(b[:500])
for rb in ("event", "events", "etkinlikler", "tribe_events"):
    s, b = al(f"https://kultur.istanbul/wp-json/wp/v2/{rb}?per_page=1")
    print(f"  /{rb}: {s} {b[:300].replace(chr(10), ' ')}")
s, b = al("https://kultur.istanbul/wp-json/tribe/events/v1/events?per_page=1")
print("  tribe:", s, b[:300])
s, b = al("https://kultur.istanbul/wp-json/")
try:
    print("  namespaces:", json.loads(b).get("namespaces"))
except Exception:
    print("  root:", s, b[:200])

for ad, url in (("iksv", "https://www.iksv.org/tr"), ("akm", "https://www.akmistanbul.gov.tr/tr/etkinlikler"), ("kultur.istanbul ana", "https://kultur.istanbul/")):
    bas(ad + " " + url)
    s, b = al(url)
    print(s, "len", len(b))
    print("  ld+json blok:", len(re.findall(r"application/ld\+json", b)))
    for m in re.findall(r"\"@type\"\s*:\s*\"([A-Za-z]+)\"", b)[:10]:
        print("   type", m)
    links = sorted(set(re.findall(r"href=\"([^\"]*(?:etkinlik|event|takvim|program)[^\"]*)\"", b, re.I)))[:25]
    for l in links:
        print("   link", l)
