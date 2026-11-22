#!/usr/bin/env python3
"""Toplayıcı çıktısını (etkinlikler.json) sitenin okuduğu etkinlik-canli.js dosyasına çevirir.

Yalnızca olgular aktarılır: başlık, tarih, mekân, ilçe, tür, fiyat, bağlantı, kaynak.
Açıklama ve görsel aktarılmaz. Geçmiş etkinlikler atılır.
Kullanım: python3 donustur.py cikti/etkinlikler.json ../../etkinlik-canli.js
"""
import json, re, sys, unicodedata
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

TR = ZoneInfo("Europe/Istanbul")
TUR = {"Konser": "Konser", "Tiyatro": "Tiyatro", "Stand-up": "Stand-up", "Sergi": "Sergi", "Festival": "Festival",
       "Sinema": "Sinema", "Dans & Opera": "Dans & Opera", "Çocuk": "Çocuk", "Atölye & Söyleşi": "Atölye", "Spor": "Spor"}
KAYNAK = {"kultur_istanbul": "İBB Kültür AŞ", "iksv": "İKSV", "akm": "AKM"}


def slug(s):
    s = unicodedata.normalize("NFKD", s.replace("ı", "i").replace("İ", "i")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def yerel(iso):
    if not iso:
        return None
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None
    if d.tzinfo:
        d = d.astimezone(TR)
    return d.replace(tzinfo=None)


def fiyat(p):
    if not p:
        return None
    if "cretsiz" in p.lower():
        return 0
    m = re.search(r"\d+(?:[.,]\d+)?", p.replace(".", "") if re.search(r"\d\.\d{3}", p) else p)
    return round(float(m.group().replace(",", "."))) if m else None


def donustur(rows, simdi=None):
    simdi = simdi or datetime.now(TR).replace(tzinfo=None)
    bugun = simdi.replace(hour=0, minute=0, second=0, microsecond=0)
    out, gorulen = [], set()
    for r in rows:
        d, son = yerel(r.get("start")), yerel(r.get("end"))
        if not r.get("title") or not d or d > bugun + timedelta(days=120):
            continue
        if d < bugun:
            # Süren etkinlik (ör. sergi): bitişi bugün ya da sonraysa bugünden itibaren göster
            if not son or son < bugun:
                continue
            d = bugun.replace(hour=d.hour, minute=d.minute)
        eid = slug(r["title"]) + "-" + d.strftime("%Y%m%d")
        if eid in gorulen:
            continue
        gorulen.add(eid)
        out.append({
            "id": eid, "ad": r["title"].strip(), "tur": TUR.get(r.get("category") or "", "Etkinlik"),
            "il": "İstanbul", "ilce": r.get("district") or "", "mekan": (r.get("venue") or "").strip(),
            "tarih": d.strftime("%Y-%m-%dT%H:%M"),
            "bitis": son.strftime("%Y-%m-%d") if son and son.date() > d.date() else "",
            "saatYok": "T" not in (r.get("start") or ""),
            "bilet": [{"ad": "Bilet", "fiyat": fiyat(r.get("price")), "not": r.get("price") or "", "kalan": None}],
            "link": r.get("ticket_url") or r.get("source_url") or "",
            "org": KAYNAK.get(r.get("source"), r.get("source") or ""), "kaynak": True, "aciklama": ""
        })
    out.sort(key=lambda e: e["tarih"])
    return out


def main():
    giris, cikis = sys.argv[1], sys.argv[2]
    with open(giris, encoding="utf-8") as fh:
        rows = json.load(fh)
    ev = donustur(rows)
    zaman = datetime.now(TR).strftime("%Y-%m-%d %H:%M")
    with open(cikis, "w", encoding="utf-8") as fh:
        fh.write("/* Otomatik üretildi: scripts/etkinlik (GitHub Actions, her sabah). Elle düzenleme; değişiklikler bir sonraki çalıştırmada silinir.\n"
                 "   Kaynak: İBB Kültür AŞ (kultur.istanbul). Yalnızca olgular (başlık, tarih, mekân, fiyat, bağlantı). Son güncelleme: " + zaman + " */\n")
        fh.write("window.ETKINLIK_CANLI = " + json.dumps(ev, ensure_ascii=False, indent=0).replace("\n", "") + ";\n")
    print(f"{len(ev)} etkinlik → {cikis}", file=sys.stderr)
    for e in ev[:25]:
        print(f"  {e['tarih']}{' → ' + e['bitis'] if e['bitis'] else ''} | {e['tur']} | {e['ilce'] or '-'} | {e['mekan']} | {e['ad']}", file=sys.stderr)


if __name__ == "__main__":
    main()
