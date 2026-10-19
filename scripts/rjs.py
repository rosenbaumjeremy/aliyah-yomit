"""Rabbi Jonathan Sacks on the parasha: his Covenant & Conversation essays as
Sefaria has them, summarised for the site's RJS page.

    python3 scripts/rjs.py --info YYYY-MM-DD
        The parasha(s) read on the Shabbat after that date (Israel), each with
        every essay Sefaria has for it: the English volume (Genesis ...
        Deuteronomy) and the Hebrew Edition (שיג ושיח), and whether the site
        already has its RJS page.

    python3 scripts/rjs.py --text "<essay ref>"
        The essay as plain text, one paragraph per line.

    python3 scripts/rjs.py --verify rjs.json
        Drops every question or building block whose "quote" is not word for
        word in its essay, and exits 1 unless every essay --info lists for the
        parasha still has at least one question and three building blocks.

    python3 scripts/rjs.py rjs.json
        Files it as site/data/rjs/<slug>.json and adds it to index.json.

rjs.json = {"slug": "vayera",
            "english": {"overview": "...", "essays": [ESSAY, ...]},
            "hebrew":  {"overview": "...", "essays": [ESSAY, ...]}}
ESSAY = {"title", "ref",
         "questions": [{"text": "a question the essay asks", "quote": "<its words>"}],
         "blocks": [{"text": "one step of the argument", "quote": "<its words>"}, ...]}
The blocks are the building blocks of the idea, in the order the essay builds
it; the last one is where it lands. English essays come from the English
volume, Hebrew ones from the Hebrew Edition.
"""

import datetime
import html
import json
import re
import sys
import urllib.parse
from pathlib import Path

from add_brief import DATA, fetch, info
from verify_brief import norm

VOLUMES = {
    "Genesis": "Covenant and Conversation; Genesis; The Book of the Beginnings",
    "Exodus": "Covenant and Conversation; Exodus; The Book of Redemption",
    "Leviticus": "Covenant and Conversation; Leviticus; The Book of Holiness",
    "Numbers": "Covenant and Conversation; Numbers; The Wilderness Years",
    "Deuteronomy": "Covenant and Conversation; Deuteronomy; Renewal of the Sinai Covenant",
}
HEBREW = "Covenant and Conversation; Hebrew Edition"
# parashot.json name -> the Hebrew Edition's node name, where they differ
HEBREW_NAMES = {"Chayei Sara": "Chayei Sarah", "Vayetzei": "Vayeitze"}
API = "https://www.sefaria.org/api"
_schemas = {}


def q(text):
    return urllib.parse.quote(text, safe="")


def schema(title):
    if title not in _schemas:
        _schemas[title] = fetch(f"{API}/v2/index/{q(title)}")["schema"]
    return _schemas[title]


def parashot():
    books = json.loads((DATA / "parashot.json").read_text(encoding="utf-8"))["books"]
    return {p["slug"]: {**p, "book": b["en"]} for b in books for p in b["parashot"]}


def essays(slug):
    """Every essay on this parasha: [{"lang", "title", "ref"}]."""
    p = parashot()[slug]
    out = []
    for lang, volume, name in (("english", VOLUMES[p["book"]], p["en"]),
                               ("hebrew", HEBREW, HEBREW_NAMES.get(p["en"], p["en"]))):
        node = next((n for n in schema(volume)["nodes"] if n.get("key") == name), None)
        for i, essay in enumerate((node or {}).get("nodes", []), 1):
            if lang == "english":
                out.append({"lang": lang, "title": essay["key"], "ref": f"{volume}, {name}, {essay['key']}"})
            else:
                out.append({"lang": lang, "title": essay["heTitle"], "ref": f"{volume}, {name}, {i}"})
    return out


def text(ref):
    lang = "hebrew" if ref.startswith(HEBREW) else "english"
    data = fetch(f"{API}/v3/texts/{q(ref)}?version={lang}")
    paragraphs = []
    for version in data.get("versions", []):
        for para in version["text"] if isinstance(version["text"], list) else [version["text"]]:
            para = re.sub(r"<\s*br\s*/?>", "\n", para, flags=re.I)
            para = html.unescape(re.sub(r"<[^>]+>", "", para)).strip()
            if para:
                paragraphs.append(para)
    return "\n".join(paragraphs)


def published():
    path = DATA / "rjs" / "index.json"
    return {d["slug"]: d for d in json.loads(path.read_text(encoding="utf-8"))["days"]} if path.exists() else {}


def show_info(date):
    reading = info(date)["reading"]
    done = published()
    p = parashot()
    out = {"date": date, "reading": reading, "parashot": [
        {"slug": s, "en": p[s]["en"], "he": p[s]["he"], "published": s in done, "essays": essays(s)}
        for s in reading["slugs"]]}
    print(json.dumps(out, ensure_ascii=False, indent=1))


def verify(path):
    record = json.loads(Path(path).read_text(encoding="utf-8"))
    wanted = essays(record["slug"])
    ok = True
    for lang in ("english", "hebrew"):
        kept = []
        for essay in record[lang].get("essays", []):
            source = norm(text(essay["ref"]))
            for part in ("questions", "blocks"):
                good = []
                for item in essay.get(part, []):
                    quote = norm(item.get("quote", ""))
                    if item.get("text") and len(quote.split()) >= 4 and quote in source:
                        good.append(item)
                    else:
                        print(f"[{lang}] {essay.get('title')}: {part[:-1]} quote not found - removed: {item.get('quote')!r}")
                essay[part] = good
            if essay["questions"] and len(essay["blocks"]) >= 3:
                kept.append(essay)
            else:
                print(f"[{lang}] {essay.get('title')}: needs a question and 3 building blocks - removed")
        record[lang]["essays"] = kept
        missing = [e["ref"] for e in wanted if e["lang"] == lang and e["ref"] not in {k["ref"] for k in kept}]
        for ref in missing:
            print(f"[{lang}] missing: {ref}")
        if missing or not record[lang].get("overview"):
            ok = False
        print(f"[{lang}] {len(kept)} essays verified")
    Path(path).write_text(json.dumps(record, ensure_ascii=False, indent=1), encoding="utf-8")
    sys.exit(0 if ok else 1)


def add(path):
    record = json.loads(Path(path).read_text(encoding="utf-8"))
    p = parashot()[record["slug"]]
    for lang in ("english", "hebrew"):
        if not record[lang].get("essays"):
            sys.exit(f"no {lang} essays")
    record = {"slug": p["slug"], "parasha": {"en": p["en"], "he": p["he"]},
              "date": record.get("date") or datetime.date.today().isoformat(),
              "english": record["english"], "hebrew": record["hebrew"]}
    folder = DATA / "rjs"
    folder.mkdir(exist_ok=True)
    (folder / f"{p['slug']}.json").write_text(json.dumps(record, ensure_ascii=False, indent=1), encoding="utf-8")
    days = published()
    days[p["slug"]] = {"slug": p["slug"], "date": record["date"]}
    (folder / "index.json").write_text(
        json.dumps({"days": sorted(days.values(), key=lambda d: d["date"])}, ensure_ascii=False,
                   separators=(",", ":")), encoding="utf-8")
    print(f"filed RJS on {p['en']}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == "--info":
        show_info(args[1])
    elif len(args) == 2 and args[0] == "--text":
        print(text(args[1]))
    elif len(args) == 2 and args[0] == "--verify":
        verify(args[1])
    elif len(args) == 1:
        add(args[0])
    else:
        sys.exit(__doc__)
