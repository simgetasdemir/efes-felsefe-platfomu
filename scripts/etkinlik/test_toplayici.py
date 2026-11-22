import sys, json; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import toplayici as T
html_page = '''<html><head><script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"MusicEvent","name":"Caz Gecesi &amp; Trio",
"startDate":"2026-12-05T21:00:00+03:00","location":{"@type":"Place","name":"Zorlu PSM",
"address":{"streetAddress":"Levazım Mah.","addressLocality":"Beşiktaş","addressRegion":"İstanbul"}},
"offers":[{"@type":"Offer","price":"450","priceCurrency":"TRY","url":"https://ex.com/bilet/1"},
{"@type":"Offer","price":"900","priceCurrency":"TRY"}]},
{"@type":"TheaterEvent","name":"Hamlet","startDate":"2026-12-07T20:00","location":{"name":"Kadıköy Haldun Taner Sahnesi"},
"offers":{"price":"0","priceCurrency":"TRY"}}]}</script></head></html>'''
ev = T.events_from_jsonld(html_page, "test", "https://ex.com/e")
for e in ev: print(e)
assert ev[0].district == "Beşiktaş" and ev[0].price == "450-900 TRY" and ev[0].category == "Konser"
assert ev[0].title == "Caz Gecesi & Trio" and ev[0].ticket_url == "https://ex.com/bilet/1"
assert ev[1].district == "Kadıköy" and ev[1].price == "Ücretsiz" and ev[1].category == "Tiyatro"
assert T.detect_district("Harbiye Cemil Topuzlu Açıkhava") == "Şişli"
assert T.detect_district("USKUDAR Nevmekan") == "Üsküdar"
ics = "BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Resim Sergisi\nDTSTART;TZID=Europe/Istanbul:20261210T100000\nLOCATION:Salt Galata\\, Bankalar Cd.\nURL:https://ex.com/s\nEND:VEVENT\nEND:VCALENDAR"
iv = T.parse_ical(ics, "ical"); print(iv[0])
assert iv[0].district == "Beyoğlu" and iv[0].start.startswith("2026-12-10T10") and iv[0].category == "Sergi"
d = T.dedupe(ev + [T.Event(title="caz gecesi & trio", start="2026-12-05T21:00", venue="Zorlu PSM", source="b")])
assert len(d) == 2
T.write(d, "/tmp/etkinlik_test"); print(open("/tmp/etkinlik_test.csv").read())
print("OK")
