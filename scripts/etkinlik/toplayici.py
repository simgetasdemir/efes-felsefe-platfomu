#!/usr/bin/env python3
"""
İstanbul etkinlik toplayıcı (yalnızca Python standart kütüphanesi).

Her kaynaktan etkinlikleri ortak bir şemaya çevirir:
  title, start, end, venue, district, category, price, ticket_url, source, source_url

Desteklenen kaynak türleri (kaynaklar.json içinde "type"):
  - jsonld_sitemap : sitemap.xml'den etkinlik sayfalarını bulur, sayfadaki
                     schema.org/Event JSON-LD verisini okur (bilet siteleri
                     Google için bunu genelde yayınlar).
  - jsonld_pages   : verilen liste sayfalarındaki JSON-LD Event kayıtlarını okur.
  - wp_rest        : WordPress REST API (/wp-json/wp/v2/<post_type>).
  - ical           : .ics takvim akışı.

Kurallar: robots.txt'e uyulur, istekler arası bekleme vardır, kendini tanıtan
bir User-Agent kullanılır. Kullanım:
  python3 toplayici.py --config kaynaklar.json --out cikti/etkinlikler
  python3 toplayici.py --only kultur_istanbul --limit 20
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.robotparser
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

USER_AGENT = "AntikyolEtkinlikBot/0.1 (+https://antikyol.com/events)"
FIELDS = ["title", "start", "end", "venue", "district", "category",
          "price", "ticket_url", "source", "source_url"]

# ---------------------------------------------------------------- şema


@dataclass
class Event:
    title: str
    start: str | None = None          # ISO 8601
    end: str | None = None
    venue: str | None = None
    district: str | None = None       # İstanbul ilçesi
    category: str | None = None
    price: str | None = None          # "250 TRY", "150-600 TRY", "Ücretsiz"
    ticket_url: str | None = None
    source: str = ""
    source_url: str | None = None
    extra: dict = field(default_factory=dict, repr=False)

    def key(self) -> tuple:
        return (norm(self.title), (self.start or "")[:10], norm(self.venue or ""))


# ---------------------------------------------------------------- ilçe tespiti

ILCELER = [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
    "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
    "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla",
    "Ümraniye", "Üsküdar", "Zeytinburnu",
]

# Sık geçen mahalle / mekân adlarından ilçeye kısayollar (genişletilebilir).
SEMT_ILCE = {
    "harbiye": "Şişli", "nişantaşı": "Şişli", "mecidiyeköy": "Şişli",
    "maslak": "Sarıyer", "istinye": "Sarıyer", "zorlu": "Beşiktaş",
    "ortaköy": "Beşiktaş", "levent": "Beşiktaş", "etiler": "Beşiktaş",
    "taksim": "Beyoğlu", "galata": "Beyoğlu", "karaköy": "Beyoğlu",
    "tophane": "Beyoğlu", "cihangir": "Beyoğlu", "istiklal": "Beyoğlu",
    "moda": "Kadıköy", "bostancı": "Kadıköy", "caddebostan": "Kadıköy",
    "yeldeğirmeni": "Kadıköy", "kalamış": "Kadıköy",
    "sultanahmet": "Fatih", "eminönü": "Fatih", "balat": "Fatih",
    "kuzguncuk": "Üsküdar", "beylerbeyi": "Üsküdar", "çengelköy": "Üsküdar",
    "ataköy": "Bakırköy", "yeşilköy": "Bakırköy",
    "sütlüce": "Beyoğlu", "hasköy": "Beyoğlu", "kasımpaşa": "Beyoğlu",
    "miniatürk": "Beyoğlu", "gazhane": "Kadıköy", "akm": "Beyoğlu",
    "atatürk kültür merkezi": "Beyoğlu", "cemal reşit rey": "Şişli",
    "crr": "Şişli", "volkswagen arena": "Sarıyer", "uniq": "Sarıyer",
    "tüyap": "Büyükçekmece", "harbiye açıkhava": "Şişli",
    "küçükçiftlik": "Şişli", "salt galata": "Beyoğlu",
}


def norm(s: str) -> str:
    s = s.replace("İ", "i").replace("I", "ı").lower()
    return re.sub(r"\s+", " ", s).strip()


def ascii_fold(s: str) -> str:
    s = norm(s).replace("ı", "i")
    return "".join(c for c in unicodedata.normalize("NFKD", s)
                   if not unicodedata.combining(c))


_ILCE_FOLD = {ascii_fold(i): i for i in ILCELER}
_SEMT_FOLD = {ascii_fold(k): v for k, v in SEMT_ILCE.items()}


def detect_district(*texts: str | None) -> str | None:
    blob = " " + ascii_fold(" ".join(t for t in texts if t)) + " "
    for f, ilce in _ILCE_FOLD.items():
        if re.search(rf"\b{re.escape(f)}\b", blob):
            return ilce
    for f, ilce in _SEMT_FOLD.items():
        if re.search(rf"\b{re.escape(f)}\b", blob):
            return ilce
    return None


# ---------------------------------------------------------------- kategori

KATEGORI = [
    ("Konser", ["konser", "concert", "music", "müzik", "musicevent", "caz", "jazz"]),
    ("Tiyatro", ["tiyatro", "theater", "theatre", "oyun", "theaterevent"]),
    ("Stand-up", ["stand-up", "standup", "stand up", "comedy", "comedyevent"]),
    ("Sergi", ["sergi", "exhibition", "exhibitionevent", "galeri", "müze"]),
    ("Festival", ["festival", "festivalevent"]),
    ("Sinema", ["film", "sinema", "screeningevent", "gösterim"]),
    ("Dans & Opera", ["bale", "opera", "dans", "dance", "danceevent"]),
    ("Çocuk", ["çocuk", "children", "kids", "childrensevent"]),
    ("Atölye & Söyleşi", ["atölye", "workshop", "söyleşi", "talk", "educationevent"]),
    ("Spor", ["spor", "sports", "maç", "sportsevent"]),
]


def detect_category(*texts: str | None) -> str | None:
    blob = norm(" ".join(t for t in texts if t))
    for name, keys in KATEGORI:
        if any(k in blob for k in keys):
            return name
    return None


# ---------------------------------------------------------------- HTTP

class Fetcher:
    def __init__(self, delay: float = 2.0, timeout: int = 20):
        self.delay, self.timeout = delay, timeout
        self._robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
        self._last = 0.0

    def allowed(self, url: str) -> bool:
        p = urllib.parse.urlsplit(url)
        base = f"{p.scheme}://{p.netloc}"
        if base not in self._robots:
            rp = urllib.robotparser.RobotFileParser()
            try:
                rp.parse(self._raw(base + "/robots.txt").splitlines())
            except Exception:
                rp = None  # robots.txt okunamadı: temkinli davran
            self._robots[base] = rp
        rp = self._robots[base]
        return bool(rp and rp.can_fetch(USER_AGENT, url))

    def _raw(self, url: str) -> str:
        wait = self.delay - (time.monotonic() - self._last)
        if wait > 0:
            time.sleep(wait)
        req = urllib.request.Request(url, headers={
            "User-Agent": USER_AGENT, "Accept-Language": "tr-TR,tr;q=0.9"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                data = r.read()
                enc = r.headers.get_content_charset() or "utf-8"
        finally:
            self._last = time.monotonic()
        return data.decode(enc, errors="replace")

    def get(self, url: str) -> str:
        if not self.allowed(url):
            raise PermissionError(f"robots.txt izin vermiyor: {url}")
        return self._raw(url)


# ---------------------------------------------------------------- JSON-LD

class _LDParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks: list[str] = []
        self._in = False
        self._buf: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag == "script" and dict(attrs).get("type", "").lower() == "application/ld+json":
            self._in, self._buf = True, []

    def handle_endtag(self, tag):
        if tag == "script" and self._in:
            self.blocks.append("".join(self._buf))
            self._in = False

    def handle_data(self, data):
        if self._in:
            self._buf.append(data)


def _walk(obj):
    if isinstance(obj, list):
        for o in obj:
            yield from _walk(o)
    elif isinstance(obj, dict):
        yield obj
        for k in ("@graph", "itemListElement", "item", "subEvent"):
            if k in obj:
                yield from _walk(obj[k])


def _types(o: dict) -> list[str]:
    t = o.get("@type", [])
    return [t] if isinstance(t, str) else list(t)


def _first(v):
    return v[0] if isinstance(v, list) and v else v


def _price(offers) -> str | None:
    offers = offers if isinstance(offers, list) else [offers] if offers else []
    vals, cur = [], None
    for o in offers:
        if not isinstance(o, dict):
            continue
        for k in ("price", "lowPrice", "highPrice"):
            try:
                vals.append(float(str(o[k]).replace(",", ".")))
            except (KeyError, ValueError):
                pass
        cur = cur or o.get("priceCurrency")
    if not vals:
        return None
    lo, hi = min(vals), max(vals)
    if hi == 0:
        return "Ücretsiz"
    fmt = lambda x: f"{x:.0f}" if x == int(x) else f"{x:.2f}"
    return f"{fmt(lo)}{'' if lo == hi else '-' + fmt(hi)} {cur or 'TRY'}"


def events_from_jsonld(page_html: str, source: str, page_url: str) -> list[Event]:
    p = _LDParser()
    p.feed(page_html)
    out = []
    for block in p.blocks:
        try:
            data = json.loads(block.strip())
        except json.JSONDecodeError:
            continue
        for o in _walk(data):
            types = _types(o)
            if not any(t.endswith("Event") for t in types):
                continue
            loc = _first(o.get("location")) or {}
            if isinstance(loc, str):
                loc = {"name": loc}
            addr = loc.get("address") or {}
            addr_txt = addr if isinstance(addr, str) else " ".join(
                str(addr.get(k, "")) for k in
                ("streetAddress", "addressLocality", "addressRegion"))
            venue = html.unescape(loc.get("name") or "") or None
            offers = o.get("offers")
            first_offer = _first(offers) if offers else None
            ticket = (first_offer or {}).get("url") if isinstance(first_offer, dict) else None
            title = html.unescape(str(o.get("name", ""))).strip()
            if not title:
                continue
            type_hint = " ".join(types)
            out.append(Event(
                title=title,
                start=o.get("startDate"),
                end=o.get("endDate"),
                venue=venue,
                district=detect_district(addr_txt, venue),
                category=detect_category(type_hint, title, str(o.get("description", ""))[:300]),
                price=_price(offers),
                ticket_url=ticket or o.get("url") or page_url,
                source=source,
                source_url=o.get("url") or page_url,
            ))
    return out


# ---------------------------------------------------------------- kaynak türleri

def run_jsonld_sitemap(cfg, f: Fetcher, limit):
    pat = re.compile(cfg.get("url_pattern", ".*"))
    queue, pages = list(cfg["sitemaps"]), []
    while queue and len(pages) < limit:
        root = ET.fromstring(f.get(queue.pop(0)).encode())
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        for sm in root.iter(f"{ns}sitemap"):
            loc = sm.findtext(f"{ns}loc")
            if loc and pat.search(loc) or cfg.get("follow_all_sitemaps"):
                queue.append(loc)
        for u in root.iter(f"{ns}url"):
            loc = u.findtext(f"{ns}loc")
            if loc and pat.search(loc):
                pages.append(loc)
    return _pages(cfg, f, pages[:limit])


def run_jsonld_pages(cfg, f: Fetcher, limit):
    return _pages(cfg, f, cfg["pages"][:limit])


def _pages(cfg, f, pages):
    out = []
    for url in pages:
        try:
            out += events_from_jsonld(f.get(url), cfg["name"], url)
        except Exception as e:
            print(f"  ! {url}: {e}", file=sys.stderr)
    return out


def _strip_tags(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", " ", s or "")).strip()


def run_wp_rest(cfg, f: Fetcher, limit):
    base = cfg["base"].rstrip("/")
    ptype = cfg.get("post_type", "posts")
    out, page = [], 1
    m = cfg.get("meta", {})  # ACF/meta alan adları: {"start": "baslangic", ...}
    while len(out) < limit:
        url = f"{base}/wp-json/wp/v2/{ptype}?per_page=50&page={page}&_embed=1"
        try:
            items = json.loads(f.get(url))
        except Exception as e:
            print(f"  ! {url}: {e}", file=sys.stderr)
            break
        if not items:
            break
        for it in items:
            meta = {**(it.get("acf") or {}), **(it.get("meta") or {})}
            terms = [t.get("name", "") for grp in
                     (it.get("_embedded", {}).get("wp:term") or []) for t in grp]
            title = _strip_tags(it.get("title", {}).get("rendered", ""))
            venue = meta.get(m.get("venue", "mekan")) or None
            out.append(Event(
                title=title,
                start=meta.get(m.get("start", "baslangic")) or None,
                end=meta.get(m.get("end", "bitis")) or None,
                venue=venue,
                district=detect_district(venue, " ".join(terms)),
                category=detect_category(" ".join(terms), title),
                price=meta.get(m.get("price", "fiyat")) or None,
                ticket_url=meta.get(m.get("ticket", "bilet_linki")) or it.get("link"),
                source=cfg["name"],
                source_url=it.get("link"),
            ))
        page += 1
    return out[:limit]


def _ical_dt(v: str) -> str | None:
    v = v.split(":")[-1].strip()
    for fmt in ("%Y%m%dT%H%M%SZ", "%Y%m%dT%H%M%S", "%Y%m%d"):
        try:
            d = datetime.strptime(v, fmt)
            if fmt.endswith("Z"):
                d = d.replace(tzinfo=timezone.utc)
            return d.isoformat()
        except ValueError:
            pass
    return None


def parse_ical(text: str, source: str) -> list[Event]:
    text = re.sub(r"\r?\n[ \t]", "", text)  # satır katlamalarını aç
    out, cur = [], None
    for line in text.splitlines():
        if line == "BEGIN:VEVENT":
            cur = {}
        elif line == "END:VEVENT" and cur is not None:
            loc = cur.get("LOCATION", "").replace("\\,", ",")
            title = cur.get("SUMMARY", "").replace("\\,", ",")
            out.append(Event(
                title=title, start=_ical_dt(cur.get("DTSTART", "")),
                end=_ical_dt(cur.get("DTEND", "")) if cur.get("DTEND") else None,
                venue=loc.split(",")[0] or None, district=detect_district(loc),
                category=detect_category(cur.get("CATEGORIES", ""), title),
                ticket_url=cur.get("URL"), source=source, source_url=cur.get("URL")))
            cur = None
        elif cur is not None and ":" in line:
            k, v = line.split(":", 1)
            cur[k.split(";")[0]] = v if not k.startswith("DT") else line
    return out


def run_ical(cfg, f: Fetcher, limit):
    return parse_ical(f.get(cfg["url"]), cfg["name"])[:limit]


RUNNERS = {"jsonld_sitemap": run_jsonld_sitemap, "jsonld_pages": run_jsonld_pages,
           "wp_rest": run_wp_rest, "ical": run_ical}


# ---------------------------------------------------------------- çıktı

def dedupe(events: list[Event]) -> list[Event]:
    seen, out = {}, []
    for e in events:
        k = e.key()
        if k in seen:
            prev = seen[k]
            for fld in FIELDS:  # boş alanları diğer kaynaktan doldur
                if not getattr(prev, fld) and getattr(e, fld):
                    setattr(prev, fld, getattr(e, fld))
            continue
        seen[k] = e
        out.append(e)
    return out


def write(events: list[Event], out_base: str):
    rows = [{k: asdict(e)[k] for k in FIELDS} for e in events]
    with open(out_base + ".json", "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)
    with open(out_base + ".csv", "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default="kaynaklar.json")
    ap.add_argument("--out", default="cikti/etkinlikler")
    ap.add_argument("--only", help="yalnızca bu kaynak(lar), virgülle")
    ap.add_argument("--limit", type=int, default=200, help="kaynak başına üst sınır")
    ap.add_argument("--delay", type=float, default=2.0, help="istekler arası saniye")
    a = ap.parse_args(argv)

    with open(a.config, encoding="utf-8") as fh:
        sources = json.load(fh)["sources"]
    only = set(a.only.split(",")) if a.only else None
    f = Fetcher(delay=a.delay)
    allev = []
    for cfg in sources:
        if only and cfg["name"] not in only:
            continue
        if not cfg.get("enabled", True) and not only:
            continue
        print(f"→ {cfg['name']} ({cfg['type']})", file=sys.stderr)
        try:
            evs = RUNNERS[cfg["type"]](cfg, f, a.limit)
        except Exception as e:
            print(f"  ! kaynak atlandı: {e}", file=sys.stderr)
            continue
        print(f"  {len(evs)} etkinlik", file=sys.stderr)
        allev += evs
    allev = dedupe(allev)
    allev.sort(key=lambda e: e.start or "9999")
    import os
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    write(allev, a.out)
    print(f"Toplam {len(allev)} etkinlik → {a.out}.json / .csv", file=sys.stderr)


if __name__ == "__main__":
    main()
