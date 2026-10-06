"""Report how widely a verified brief draws on Sefaria, and fail if it leans
on too few sources.

    python3 scripts/source_breadth.py <brief.json> [<Sefaria range> ...]

Run it after verify_brief.py. Each cited ref is matched to its Sefaria
category through the links of the studied text (the ranges given, else the
brief's "refs" or "range"). Exit 1 means the brief needs more voices (see
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
MIN_OTHER_CATS = 2     # categories besides Commentary (Talmud, Midrash, Thought…)


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


def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        brief = json.load(f)

    ranges = sys.argv[2:] or [r["sefaria"] for r in brief.get("refs", [])]
    if not ranges and brief.get("range"):
        ranges = [brief["range"]]
    category = {}
    for ref in ranges:
        for link in links(ref):
            category.setdefault(link.get("index_title", ""), link.get("category", "Other"))

    def cat(ref):
        best = max((t for t in category if t and ref.startswith(t)), key=len, default="")
        return category.get(best, "Other")

    questions = brief["english"]["questions"]
    cites, asks, cats = collections.Counter(), collections.Counter(), collections.Counter()
    for q in questions:
        askers = {a["name"] for a in q["asked_by"]}
        if len(askers) == 1:
            asks.update(askers)
        for who in q["asked_by"] + [s for a in q["answers"] for s in a["sources"]]:
            cites[who["name"]] += 1
            cats[cat(who["ref"])] += 1

    total = sum(cites.values()) or 1
    print("works:", ", ".join(f"{n} ({c})" for n, c in cites.most_common()))
    print("categories:", ", ".join(f"{n} ({c})" for n, c in cats.most_common()))

    problems = []
    if len(cites) < MIN_WORKS:
        problems.append(f"only {len(cites)} distinct works cited (need {MIN_WORKS})")
    for name, n in asks.items():
        if n > MAX_ASKS:
            problems.append(f"{name} is the only asker of {n} questions (max {MAX_ASKS})")
    for name, n in cites.items():
        if n / total > MAX_SHARE:
            problems.append(f"{name} has {n} of {total} citations (max {MAX_SHARE:.0%})")
    other = [c for c in cats if c not in ("Commentary", "Reference")]
    if len(other) < MIN_OTHER_CATS:
        problems.append(f"only {len(other)} categories besides Commentary (need {MIN_OTHER_CATS})")

    print("\n".join(problems) or "source breadth ok")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
