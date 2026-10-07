"""Work out a day's aliyah, and file that day's brief into the site.

    python3 scripts/add_brief.py --info YYYY-MM-DD
        Print the day's reading as JSON: parasha (Israel schedule), aliyah
        number and name, Sefaria range, maftir with Shevi'i. The daily routine
        uses this so it researches exactly what the site will file it under.

    python3 scripts/add_brief.py brief.json
        brief.json = {"date", "hebrew_date", "english": {...}, "hebrew": {...}}
        Writes site/data/aliyot/<date>.json and adds it to index.json.

Shabbat is Rishon through Friday Shevi'i: on Shabbat the coming week's
parasha starts (the one read the following Shabbat, as at Mincha), and it is
finished on the Friday before it is read. A week whose Shabbat is a Yom Tov
has no "Parashat Hashavua" entry with aliyot, so the next regular parasha
(found by looking ahead in the calendar) is used, and flagged as such.
"""

import datetime
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "site" / "data"
BOOK_ORDER = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]
NAMES_EN = ["Rishon", "Sheni", "Shlishi", "Revi'i", "Chamishi", "Shishi", "Shevi'i"]
NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"]


def fetch(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                return json.load(response)
        except Exception:  # Sefaria returns the odd transient 504
            if attempt == 3:
                raise
            time.sleep(3)


def parasha_entry(day):
    url = (f"https://www.sefaria.org/api/calendars?diaspora=0&year={day.year}"
           f"&month={day.month}&day={day.day}&timezone=Asia/Jerusalem")
    for item in fetch(url)["calendar_items"]:
        if item["title"]["en"] == "Parashat Hashavua" and (item.get("extraDetails") or {}).get("aliyot"):
            return item
    return None


def span(ref):
    """'Genesis 2:20-3:21' -> ((book, 2, 20), (book, 3, 21))"""
    match = re.fullmatch(r"(.+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?", ref.strip())
    book = BOOK_ORDER.index(match.group(1))
    start = (book, int(match.group(2)), int(match.group(3)))
    end_chapter = int(match.group(4) or match.group(2))
    end = (book, end_chapter, int(match.group(5) or match.group(3)))
    return start, end


def info(date_text):
    day = datetime.date.fromisoformat(date_text)
    aliyah = (day.weekday() - 5) % 7 + 1  # Shabbat -> 1, Sunday -> 2 ... Friday -> 7
    # the parasha read on the next Shabbat after today; a Yom Tov Shabbat has none, so look ahead
    entry, note = None, None
    shabbat = day + datetime.timedelta((5 - day.weekday()) % 7 or 7)
    for offset in range(0, 21, 7):
        entry = parasha_entry(shabbat + datetime.timedelta(offset))
        if entry:
            if offset:
                note = "This week's Shabbat has a special reading, so the next regular parasha is used."
            break
    if not entry:
        sys.exit(f"no parasha with aliyot found near {date_text}")

    week_start, week_end = span(entry["ref"])
    parashot = json.loads((DATA / "parashot.json").read_text(encoding="utf-8"))
    slugs = [p["slug"] for b in parashot["books"] for p in b["parashot"]
             if week_start <= span(p["ref"])[0] and span(p["ref"])[1] <= week_end]

    aliyot = entry["extraDetails"]["aliyot"]
    out = {
        "date": date_text,
        "reading": {"en": entry["displayValue"]["en"], "he": entry["displayValue"]["he"],
                    "ref": entry["ref"], "slugs": slugs},
        "aliyah": aliyah,
        "aliyah_name": {"en": NAMES_EN[aliyah - 1], "he": NAMES_HE[aliyah - 1]},
        "range": aliyot[aliyah - 1],
    }
    if aliyah == 7 and len(aliyot) > 7:
        out["maftir"] = aliyot[7]
    if note:
        out["note"] = note
    return out


def add(brief_path):
    brief = json.loads(Path(brief_path).read_text(encoding="utf-8"))
    day = info(brief["date"])
    record = {**day, "hebrew_date": brief["hebrew_date"],
              "english": brief["english"], "hebrew": brief["hebrew"]}
    for lang in ("english", "hebrew"):
        if not record[lang].get("questions"):
            sys.exit(f"brief has no {lang} questions")

    folder = DATA / "aliyot"
    folder.mkdir(exist_ok=True)
    (folder / f"{day['date']}.json").write_text(
        json.dumps(record, ensure_ascii=False, indent=1), encoding="utf-8")

    index_path = folder / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {"days": []}
    entry = {k: day[k] for k in ("date", "reading", "aliyah", "range")}
    # one brief per reading + aliyah: next year's run replaces this year's in the index
    index["days"] = [d for d in index["days"]
                     if d["date"] != day["date"]
                     and not (d["reading"]["slugs"] == day["reading"]["slugs"] and d["aliyah"] == day["aliyah"])]
    index["days"].append(entry)
    index["days"].sort(key=lambda d: d["date"])
    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"filed {day['reading']['en']} {day['aliyah_name']['en']} ({day['range']}) for {day['date']}")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--info":
        print(json.dumps(info(sys.argv[2]), ensure_ascii=False, indent=1))
    elif len(sys.argv) == 2:
        add(sys.argv[1])
    else:
        sys.exit(__doc__)
