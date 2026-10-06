# עלייה יומית — Daily Aliyah

A static site with the questions of the Rishonim and Achronim on each day's
aliyah of the weekly parasha (Eretz Yisrael reading schedule). Browse the 54
parashiyot, open a parasha, pick an aliyah.

Linked from the לימוד יומי home page (`../home-site`).

## Where the content comes from

The "Daily Aliyah" cloud routine runs at 06:00 Israel time. It asks
`scripts/add_brief.py --info <date>` which parasha and aliyah fall on that day
(Sunday = Rishon … Shabbat = Shevi'i, from Sefaria's Israel calendar), reads the
text and mefarshim on Sefaria, emails the brief, and files it here with
`scripts/add_brief.py brief.json`, then commits and pushes. Cloudflare deploys
on push.

```
site/
  index.html, app.css, app.js, icon.svg
  data/parashot.json         the 54 parashiyot and their aliyot (scripts/build_parashot.py)
  data/aliyot/index.json     {"days": [{date, reading, aliyah, range}]}
  data/aliyot/YYYY-MM-DD.json  one day's brief, English and Hebrew
```

Each reading + aliyah keeps one brief: when the cycle comes round next year the
new brief replaces the old one in the index. Weeks with joined parashiyot
(Vayakhel-Pekudei etc.) are filed under the combined reading and shown under
both parashiyot.

The brief's shape (`english` and `hebrew` are the same structure):

```json
{"date": "2026-10-06", "hebrew_date": {"hebrew": "…", "english": "…"},
 "english": {"summary": "…",
   "questions": [{"title": "…",
     "pasuk": {"text": "…", "ref": "Genesis 3:1", "label": "Genesis 3:1"},
     "question": "…",
     "asked_by": [{"name": "Ramban", "ref": "Ramban on Genesis 3:1:1", "era": "rishon"}],
     "answers": [{"text": "…", "sources": [{"name": "…", "ref": "…"}], "synthesis": false}],
     "why": "…"}],
   "sources_consulted": ["…"]},
 "hebrew": {"…": "same shape, in Hebrew"}}
```

## Running locally

```sh
python -m http.server 8129 --directory site
```
