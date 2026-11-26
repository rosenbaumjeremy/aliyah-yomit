#!/usr/bin/env python3
"""Build notes.json for the "Ask Claude · פרשת השבוע" page from site/data.

Usage: python3 scripts/build_ask_notes.py OUT.json
Writes every aliyah brief (ids like a20261126) and every Rabbi Sacks
parasha summary (ids like rjs-noach), in the format the Ask page reads.
"""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site" / "data"
MAX = 9000  # the page never reads past this
SKIP = {"ref", "era", "slugs", "slug", "date"}


def flat(v, out):
    if isinstance(v, str):
        if v.strip():
            out.append(v)
    elif isinstance(v, list):
        for i in v:
            flat(i, out)
    elif isinstance(v, dict):
        for k, i in v.items():
            if k in SKIP:
                continue
            if k == "title" and isinstance(i, str):
                out.append("## " + i)
            else:
                flat(i, out)
    return out


def text(section):
    return "\n".join(flat(section, []))[:MAX] if section else ""


def main(out_path):
    notes = []
    for f in sorted((ROOT / "aliyot").glob("20*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        r, n = d["reading"], d["aliyah_name"]
        notes.append({
            # catch-up files (2026-10-07-5.json) share a date with that day's brief, so keep the suffix
            "id": "a" + f.stem.replace("-", "", 2),
            "w": {"he": f'{r["he"]} · {n["he"]}', "en": f'{r["en"]} · {n["en"]}'},
            "t": {"he": f'{r["he"]}, עלייה {n["he"]}', "en": f'{r["en"]}, {n["en"]} aliyah ({d["range"]})'},
            "x": {"he": text(d.get("hebrew")), "en": text(d.get("english"))},
            "h": f'lang={{lang}}&p={r["slugs"][0]}&a={d["aliyah"]}',
        })
    idx = json.loads((ROOT / "rjs" / "index.json").read_text(encoding="utf-8"))
    order = sorted({day["slug"] for day in idx["days"]})
    for slug in order:
        f = ROOT / "rjs" / f"{slug}.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        p = d["parasha"]
        notes.append({
            "id": f"rjs-{slug}",
            "w": {"he": f'{p["he"]} · הרב זקס', "en": f'{p["en"]} · Rabbi Sacks'},
            "t": {"he": f'הרב זקס על פרשת {p["he"]}', "en": f'Rabbi Sacks on {p["en"]}'},
            "x": {"he": text(d.get("hebrew")), "en": text(d.get("english"))},
            "h": f"lang={{lang}}&rjs={slug}",
        })
    pathlib.Path(out_path).write_text(
        "[\n" + ",\n".join(json.dumps(n, ensure_ascii=False) for n in notes) + "\n]\n", encoding="utf-8")
    print(f"{len(notes)} notes -> {out_path}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "notes.json")
