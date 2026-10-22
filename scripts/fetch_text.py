"""Download the text of every chapter of the Torah from Sefaria.

Writes site/data/text/<Book>.<chapter>.json, one file per chapter:
  {"ref": "Genesis 12", "he": [pasuk, ...],
   "steinsaltz": {"hebrew": [...], "english": [...]},
   "rashi": {"hebrew": [[comment, ...], ...], "english": [[...], ...]}}
The pesukim are the Masorah text (Miqra according to the Masorah) as plain
text; the Steinsaltz explanation (Koren Steinsaltz Tanakh HaMevoar, Hebrew and
English) and Rashi (Hebrew, and the Rosenbaum & Silbermann English) keep only
their <b>/<i> markup, which app.js turns into bold/italic. Every list is
indexed by pasuk; Rashi has a list of comments (often empty) for each pasuk.
The site cuts each day's aliyah out of these chapters.

Usage:
  python scripts/fetch_text.py            # every chapter not yet saved
  python scripts/fetch_text.py --force    # re-download all of them
  python scripts/fetch_text.py "Genesis 12" # just these chapters
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "data" / "text"
API = "https://www.sefaria.org/api/v3/texts/"
MASORAH = "hebrew|Miqra according to the Masorah"
RASHI = "Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann, 1929-1934"
CHAPTERS = {"Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34}


def get(ref, *versions):
    query = "&".join("version=" + urllib.parse.quote(v) for v in versions)
    url = API + urllib.parse.quote(ref.replace(" ", "_")) + "?" + query
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "aliyah-yomit-site"})
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


def flat(segment):
    return " ".join(flat(s) for s in segment) if isinstance(segment, list) else (segment or "")


def plain(segment):
    """The pasuk without markup: Sefaria's spans, footnotes and entities removed."""
    text = re.sub(r"<sup[^>]*>.*?</sup>|<i class=\"footnote\">.*?</i>", "", flat(segment), flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", "", text))
    return re.sub(r"\s+", " ", text.replace(" ", " ")).strip()


def keep_bold(segment):
    """The explanation with only <b> and <i> left (everything else stripped)."""
    text = re.sub(r"<sup[^>]*>.*?</sup>|<i class=\"footnote\">.*?</i>", "", flat(segment), flags=re.S)
    text = re.sub(r"<(?!/?[bi]>)[^>]+>", "", text)
    # unescape, then escape again, so the only markup in the file is <b>/<i>
    parts = re.split(r"(</?[bi]>)", text)
    out = "".join(p if re.fullmatch(r"</?[bi]>", p) else html.escape(html.unescape(p), quote=False) for p in parts)
    return re.sub(r"\s+", " ", out.replace(" ", " ")).strip()


def lead(comment):
    """Bold the words Rashi comments on, when the English has them unmarked ("לך לך GET THEE OUT —")."""
    if "<b>" in comment:
        return comment
    # the Hebrew words, then their translation in capitals
    match = re.match(r"[֐-׿][^A-Za-z<]*?\s(?:means\s+)?(?:[A-Z][A-Z’'\-]*[,;:.!?]?(?:\s+|$))+", comment)
    if not match:
        match = re.match(r"[֐-׿][^—<]{0,200}?(?=\s*—)", comment)
    if not match:
        return comment
    return f"<b>{match.group(0).strip()}</b> {comment[match.end():].lstrip()}".strip()


def fit(notes, length, empty):
    """Pad or trim so the indices always line up with the pesukim."""
    return (notes + [empty] * length)[:length]


def chapter(book, number):
    ref = f"{book} {number}"
    text = get(ref, MASORAH)["versions"]
    if not text:
        raise RuntimeError(f"{ref}: no Masorah text")
    pesukim = [plain(s) for s in text[0]["text"]]
    explained = {"hebrew": [], "english": []}
    for version in get(f"Steinsaltz on {ref}", "hebrew", "english")["versions"]:
        lang = "hebrew" if version["language"] == "he" else "english"
        if not explained[lang]:
            explained[lang] = [keep_bold(s) for s in version["text"]]
    rashi = {"hebrew": [], "english": []}
    for version in get(f"Rashi on {ref}", "hebrew|" + RASHI, "english|" + RASHI)["versions"]:
        lang = "hebrew" if version["language"] == "he" else "english"
        if not rashi[lang]:
            rashi[lang] = [[lead(keep_bold(c)) for c in (comments or []) if keep_bold(c)] for comments in version["text"]]
    if not any(rashi["hebrew"]):
        # that edition has no Hebrew for Bamidbar: take Sefaria's main Hebrew Rashi
        for version in get(f"Rashi on {ref}", "hebrew")["versions"]:
            rashi["hebrew"] = [[keep_bold(c) for c in (comments or []) if keep_bold(c)] for comments in version["text"]]
    n = len(pesukim)
    return {"ref": ref, "he": pesukim,
            "steinsaltz": {lang: fit(notes, n, "") for lang, notes in explained.items()},
            "rashi": {lang: fit(notes, n, []) for lang, notes in rashi.items()}}


def path_for(book, number):
    return OUT / f"{book}.{number}.json"


def main(args):
    force = "--force" in args
    named = [a for a in args if not a.startswith("--")]
    wanted = ([(a.rsplit(" ", 1)[0], int(a.rsplit(" ", 1)[1])) for a in named] if named
              else [(book, n) for book, count in CHAPTERS.items() for n in range(1, count + 1)])
    todo = [(b, n) for b, n in wanted if force or named or not path_for(b, n).exists()]
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"{len(todo)} chapters to download")

    problems = []

    def one(item):
        book, number = item
        try:
            data = chapter(book, number)
        except Exception as error:
            problems.append(f"{book} {number}: {error}")
            return
        missing = [f"Steinsaltz {lang}" for lang, notes in data["steinsaltz"].items() if not any(notes)]
        missing += [f"Rashi {lang}" for lang, notes in data["rashi"].items() if not any(notes)]
        if missing:
            problems.append(f"{book} {number}: no {', '.join(missing)}")
        path_for(book, number).write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    with ThreadPoolExecutor(6) as pool:
        for i, _ in enumerate(pool.map(one, todo), 1):
            if i % 25 == 0:
                print(f"  {i}/{len(todo)}")
    print("\n".join(problems) if problems else "all chapters complete")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
