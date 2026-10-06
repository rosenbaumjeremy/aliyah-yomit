"""Report which sources a verified brief draws on, and fail if it leans on too
few of them or cites anything other than mefarshim and midrashim.

    python3 scripts/source_breadth.py <brief.json> [<Sefaria range> ...]

Run it after verify_brief.py. Each cited ref is matched to its Sefaria
category through the links of the studied text (the ranges given, else the
brief's "refs" or "range"). Exit 1 means the brief needs fixing (see
ROUTINE.md step 5). The same file is used by tanach-summaries and aliyah-yomit.
"""
import collections
import json
import sys
import time
import urllib.parse
import urllib.request

MIN_WORKS = 8          # distinct works cited, askers and answers together
MAX_ASKS = 3           # questions any one work may be the (sole) asker of
MAX_SHARE = 0.4        # share of all citations any one work may take
MIN_MIDRASH = 1        # citations from Midrash

# Only mefarshim and midrashim. "Quoting Commentary" counts only when it is a
# commentary on a book of Tanach (e.g. "Ramban on Deuteronomy", "Rabbeinu Bahya,
# Bereshit"); Torah books may carry their Hebrew names.
TANAKH = [b.replace("_", " ") for b in """Torah Genesis Exodus Leviticus
Numbers Deuteronomy Joshua Judges I_Samuel II_Samuel I_Kings II_Kings Isaiah
Jeremiah Ezekiel Hosea Joel Amos Obadiah Jonah Micah Nahum Habakkuk Zephaniah
Haggai Zechariah Malachi Psalms Proverbs Job Song_of_Songs Ruth Lamentations
Ecclesiastes Esther Daniel Ezra Nehemiah I_Chronicles II_Chronicles
Bereshit Bereishit Shemot Vayikra Bamidbar Devarim""".split()]


def allowed(category, title):
    if category in ("Commentary", "Midrash"):
        return True
    if category == "Quoting Commentary":
        # "Ramban on Deuteronomy", "Gur Aryeh on Bereishit", "Rabbeinu Bahya, Bereshit"
        for sep in (" on ", ", "):
            if sep in title:
                book = title.split(sep, 1)[1]
                if any(book == b or book.startswith(b + ",") for b in TANAKH):
                    return True
    return False


def links(ref):
    url = ("https://www.sefaria.org/api/links/"
           + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-")
           + "?with_text=0")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as response:
                return json.load(response)
        except Exception:
            time.sleep(3)
    return []


def own_category(ref):
    """Category of a ref that is not among the studied text's links, from
    Sefaria's own index: "Commentary" only for commentaries on Tanach."""
    url = ("https://www.sefaria.org/api/v3/texts/"
           + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-"))
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as response:
                data = json.load(response)
            break
        except Exception:
            time.sleep(3)
    else:
        return "Other"
    primary, cats = data.get("primary_category") or "Other", data.get("categories") or []
    if primary == "Commentary" and cats[:1] != ["Tanakh"]:
        return f"Commentary on {cats[0] if cats else 'other works'}"
    return primary


def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        brief = json.load(f)

    ranges = sys.argv[2:] or [r["sefaria"] for r in brief.get("refs", [])]
    if not ranges and brief.get("range"):
        ranges = [brief["range"]]
    # One work can be linked under several categories (Rabbeinu Bahya is
    # "Commentary" on these verses and "Quoting Commentary" elsewhere); keep the
    # Commentary or Midrash one when there is one.
    rank = {"Commentary": 0, "Midrash": 1}
    category = {}
    for ref in ranges:
        for link in links(ref):
            title, cat = link.get("index_title", ""), link.get("category", "Other")
            if rank.get(cat, 9) < rank.get(category.get(title), 9) or title not in category:
                category[title] = cat

    def work(ref):
        """(Sefaria category, index title) of a cited ref."""
        best = max((t for t in category if t and ref.startswith(t)), key=len, default="")
        if not best:
            return own_category(ref), ""
        if not allowed(category[best], best):
            return own_category(ref), best
        return category[best], best

    questions = brief["english"]["questions"]
    cites, asks, cats = collections.Counter(), collections.Counter(), collections.Counter()
    outside = []
    for q in questions:
        askers = {a["name"] for a in q["asked_by"]}
        if len(askers) == 1:
            asks.update(askers)
        for who in q["asked_by"] + [s for a in q["answers"] for s in a["sources"]]:
            cites[who["name"]] += 1
            cat, title = work(who["ref"])
            cats[cat] += 1
            if not allowed(cat, title):
                outside.append(f"{who['ref']} ({cat})")

    total = sum(cites.values()) or 1
    print("works:", ", ".join(f"{n} ({c})" for n, c in cites.most_common()))
    print("categories:", ", ".join(f"{n} ({c})" for n, c in cats.most_common()))

    problems = [f"not a mefaresh or midrash: {o}" for o in outside]
    if len(cites) < MIN_WORKS:
        problems.append(f"only {len(cites)} distinct works cited (need {MIN_WORKS})")
    for name, n in asks.items():
        if n > MAX_ASKS:
            problems.append(f"{name} is the only asker of {n} questions (max {MAX_ASKS})")
    for name, n in cites.items():
        if n / total > MAX_SHARE:
            problems.append(f"{name} has {n} of {total} citations (max {MAX_SHARE:.0%})")
    if cats["Midrash"] < MIN_MIDRASH:
        problems.append(f"only {cats['Midrash']} Midrash citations (need {MIN_MIDRASH})")

    print("\n".join(problems) or "source breadth ok")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
