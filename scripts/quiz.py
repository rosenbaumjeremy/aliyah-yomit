#!/usr/bin/env python3
"""Weekly parasha quiz: check a draft quiz against the pesukim and publish it.

    python3 scripts/quiz.py draft.json [more.json ...]   check, then write site/data/quiz/<slug>.json
    python3 scripts/quiz.py --check draft.json           check only, write nothing

A draft is
    {"slug": "toldot", "questions": [
       {"q": "מי אמר אל מי: “הקל קול יעקב והידים ידי עשו”?",
        "o": ["the right answer", "wrong", "wrong", "wrong"],     # right answer first
        "e": "why, quoting the pasuk: “...”",
        "r": "27:22",                                           # chapter:verse or a range, 27:12-13
        "h": "optional hint"}]}

Every “quote” in the question and the explanation may be typed without nikud; it must be
found word for word (letters only) in the pesukim of "r", and is replaced by the pasuk's own
words with nikud, from site/data/text. Each "r" must fall inside the parasha. The divine
name is written ה׳ and אלקים. The answers are shuffled (fixed order per question) and the
right one is recorded in "a".
"""
import hashlib
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
OUT = SITE / "data" / "quiz"

MARK = "[֑-ׇ]"          # nikud and te'amim
TEAMIM = re.compile("[֑-ֽ֯׀׃]")
FINALS = str.maketrans("ךםןףץ", "כמנפצ")
QUOTE = re.compile("“([^”]+)”")


def parashot():
    data = json.loads((SITE / "data" / "parashot.json").read_text())
    return {p["slug"]: (book, p) for book in data["books"] for p in book["parashot"]}


def pos(cv):
    c, v = cv.split(":")
    return int(c), int(v)


def parse_range(r):
    """'27:12-13' / '25:29-26:2' / '27:22' -> ((c1,v1),(c2,v2))"""
    a, _, b = r.partition("-")
    start = pos(a)
    if not b:
        return start, start
    end = pos(b) if ":" in b else (start[0], int(b))
    return start, end


_chapters = {}


def pesukim(book, start, end):
    words = []
    for c in range(start[0], end[0] + 1):
        if (book, c) not in _chapters:
            _chapters[(book, c)] = json.loads((SITE / "data" / "text" / f"{book}.{c}.json").read_text())["he"]
        verses = _chapters[(book, c)]
        lo = start[1] if c == start[0] else 1
        hi = end[1] if c == end[0] else len(verses)
        if hi > len(verses):
            raise ValueError(f"{book} {c}:{hi} does not exist")
        for v in range(lo, hi + 1):
            words += tokens(verses[v - 1])
    return words


def tokens(verse):
    """the pasuk's words with nikud (no te'amim), each with the separator that follows it"""
    # ketiv (in round brackets) is dropped and the qere [in square brackets] read
    verse = re.sub(r"\([^)]*\)\s*", "", re.sub(r"\{.\}|<[^>]+>", "", verse)).replace("[", "").replace("]", "")
    text = TEAMIM.sub("", verse).replace("׀", " ")
    out = []
    for m in re.finditer(r"([^\s־]+)([\s־]*)", text.strip()):
        out.append((m.group(1), "־" if "־" in m.group(2) else " "))
    return out


def letters(s):
    return re.sub("[^א-ת]", "", s).translate(FINALS)


def holy(word):
    word = re.sub(f"י{MARK}*ה{MARK}*ו{MARK}*ה{MARK}*", "ה׳", word)
    return re.sub(f"(א{MARK}*ל{MARK}*)ה({MARK}*י{MARK}*ם)", r"\1ק\2", word)


def vocalize(quote, words):
    """a quote may skip words with '...', or leave a blank ___ for the answer: each part is
    found, in order"""
    if "___" in quote:
        said = [vocalize(p, words) if letters(p) else "" for p in quote.split("___")]
        return None if None in said else " ___ ".join(s.strip() for s in said).strip()
    parts = [p for p in re.split(r"\.\.\.|…", quote) if letters(p)]
    if len(parts) > 1:
        said = [vocalize_part(p, words) for p in parts]
        return None if None in said else "... ".join(said)
    return vocalize_part(quote, words)


def vocalize_part(quote, words):
    want = [letters(w) for w in re.split(r"[\s־]+", quote) if letters(w)]
    have = [letters(w) for w, _ in words]
    for i in range(len(have) - len(want) + 1):
        if have[i:i + len(want)] == want:
            span = words[i:i + len(want)]
            text = "".join(holy(w) + sep for w, sep in span).rstrip(" ־")
            return text.replace("׃", "")
    return None


def check(draft, table):
    book, parasha = table[draft["slug"]]
    m = re.match(r"^(\w+) (\d+:\d+)-(\d+:\d+)$", parasha["ref"])
    bookname, lo, hi = m.group(1), pos(m.group(2)), pos(m.group(3))
    problems, out = [], []
    for n, q in enumerate(draft["questions"], 1):
        where = f'{draft["slug"]} #{n}'
        try:
            start, end = parse_range(q["r"])
            if not (lo <= start <= end <= hi):
                problems.append(f"{where}: {q['r']} is outside {parasha['ref']}")
                continue
            words = pesukim(bookname, start, end)
        except (ValueError, KeyError, IndexError) as error:
            problems.append(f"{where}: bad ref {q.get('r')}: {error}")
            continue
        if len(q["o"]) != 4 or len(set(q["o"])) != 4:
            problems.append(f"{where}: needs 4 different answers")
        fixed = {}
        for field in ("q", "e"):
            def sub(mo):
                said = vocalize(mo.group(1), words)
                if said is None:
                    problems.append(f"{where} ({field}): “{mo.group(1)}” is not in {q['r']}")
                    return mo.group(0)
                return f"“{said}”"
            fixed[field] = QUOTE.sub(sub, q[field])
        options = list(q["o"])
        rng = random.Random(hashlib.sha256(f'{draft["slug"]}{n}'.encode()).hexdigest())
        order = list(range(4))
        rng.shuffle(order)
        c1, v1 = start
        c2, v2 = end
        ref = f"{bookname} {c1}:{v1}" + ("" if end == start else f"-{c2}:{v2}" if c2 != c1 else f"-{v2}")
        item = {"q": fixed["q"], "o": [options[i] for i in order], "a": order.index(0),
                "e": fixed["e"], "ref": ref}
        if q.get("h"):
            item["h"] = q["h"]
        out.append(item)
    return problems, {"slug": draft["slug"], "ref": parasha["ref"], "questions": out}


def main(args):
    only_check = "--check" in args
    files = [a for a in args if not a.startswith("--")]
    table = parashot()
    failed = False
    for path in files:
        draft = json.loads(Path(path).read_text())
        problems, quiz = check(draft, table)
        for p in problems:
            print("✗", p)
        if problems:
            failed = True
            continue
        print(f"✓ {draft['slug']}: {len(quiz['questions'])} questions")
        if not only_check:
            OUT.mkdir(parents=True, exist_ok=True)
            (OUT / f"{draft['slug']}.json").write_text(json.dumps(quiz, ensure_ascii=False, indent=1) + "\n")
    if not only_check and not failed:
        slugs = {p.stem for p in OUT.glob("*.json") if p.stem != "index"}
        order = [s for s in table if s in slugs]
        (OUT / "index.json").write_text(json.dumps({"days": [{"slug": s} for s in order]}) + "\n")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main(sys.argv[1:])
