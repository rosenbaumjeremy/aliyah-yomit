"""Sefaria's Parasha alt-structure -> site/data/parashot.json

All 54 parashiyot with their seven aliyot, straight from the "Parasha" alt
structure on each book's Sefaria index. Run once; the list never changes.
"""

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = [("Genesis", "בראשית"), ("Exodus", "שמות"), ("Leviticus", "ויקרא"),
         ("Numbers", "במדבר"), ("Deuteronomy", "דברים")]


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


def main():
    books = []
    for en, he in BOOKS:
        with urllib.request.urlopen(f"https://www.sefaria.org/api/v2/index/{en}") as response:
            index = json.load(response)
        parashot = [{
            "slug": slugify(node["title"]),
            "en": node["title"],
            "he": node["heTitle"],
            "ref": node["wholeRef"],
            "aliyot": node["refs"],
        } for node in index["alts"]["Parasha"]["nodes"]]
        books.append({"en": en, "he": he, "parashot": parashot})
    out = ROOT / "site" / "data" / "parashot.json"
    out.write_text(json.dumps({"books": books}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(sum(len(b["parashot"]) for b in books), "parashot ->", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
