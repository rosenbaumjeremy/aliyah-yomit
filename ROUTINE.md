# Daily Aliyah routine

Instructions for the cloud routine that runs every morning at 06:00 Israel time.
It researches the day's aliyah of the weekly parasha (Eretz Yisrael schedule) on
Sefaria, emails the user a brief of the questions of the Rishonim and
Achronim, and publishes it to this site.

## The rule

**Only quote a source that you link to on Sefaria — and only with words that
are actually in it.** Every question, every asker and every answer is tied to
a Sefaria ref plus the exact words quoted from that ref. `scripts/verify_brief.py`
downloads each ref and removes anything whose quote is not there. Nothing you
did not read goes in: no answers of your own, no paraphrased "quotes", no
sources you did not open.

## Modes

- **Daily** (the normal run): steps 0–7 for today's date.
- **Backfill** (when the prompt lists dates): steps 1–5 and 7 for each listed
  date in turn, one commit per date. No time guard, and **no email**.

## Step 0 – time guard (daily only)

The schedule fires at 03:00 and 04:00 UTC so one firing lands at 06:00 in
Israel year-round. Run `TZ=Asia/Jerusalem date +%H`; if it is `05` or `07`,
print "Off-hour scheduled firing – skipping" and stop. Any other hour, continue.

## Step 1 – the day's aliyah

1. Date: `TZ=Asia/Jerusalem date +%Y-%m-%d` (or the backfill date).
2. `python3 scripts/add_brief.py --info <date>` prints the reading (parasha
   en/he, whole ref, slugs), the aliyah (Sunday = Rishon … Shabbat = Shevi'i),
   its Sefaria `range`, `maftir` on Shabbat, and a `note` when this week's
   Shabbat has a special reading so the next regular parasha is used. Study
   exactly that `range`; the site files the brief under it.
3. Hebrew date: `curl -s "https://www.hebcal.com/converter?cfg=json&date=YYYY-MM-DD&g2h=1"`
   (`hebrew`, and an English form like "25 Tishrei 5787" from hd/hm/hy).

## Step 2 – read the text

`curl -s "https://www.sefaria.org/api/v3/texts/<range with dots, e.g. Genesis.2.20-3.21>?version=hebrew&version=english"`

## Step 3 – read the commentaries

`curl -s "https://www.sefaria.org/api/links/<range>?with_text=0"` lists every
linked source (category, collectiveTitle, ref, anchorRef). Retry transient 504s.
Ignore category "Reference". Read category "Commentary" first: Rashi, Ramban,
Ibn Ezra, Rashbam, Sforno, Chizkuni, Bekhor Shor, Rabbeinu Bahya, Radak,
Abarbanel, Ohr HaChaim, Kli Yakar, Gur Aryeh, Mizrachi, Siftei Chakhamim,
Haamek Davar, Malbim, Meshech Chochmah, Rav Hirsch, HaKtav VeHaKabalah, Torah
Temimah, Alshich, Tur HaAroch, Chatam Sofer, and others present; then Talmud and
Midrash where a mefaresh builds on them. Fetch the actual text of each one you
use (`https://www.sefaria.org/api/v3/texts/Ramban_on_Genesis.3.1?version=hebrew`;
the link's `ref` field gives the exact title, e.g. "Abarbanel on Torah, Genesis 1:1",
"Alshekh on Torah, Genesis 1:1"). Aim for 15–30 passages. Abarbanel and Alshich
open sections with numbered שאלות — read those. Look for קשה, יש לשאול,
צריך עיון, תימה, למה, מדוע, ואם תאמר, הקשה, לכאורה, צ"ע.

## Step 4 – write the brief as JSON

Choose the 5–10 strongest questions actually asked in what you read (prefer
ones several mefarshim raise, or that drive a machlokes), in pasuk order. Write
`/tmp/brief.json` with python `json.dump(..., ensure_ascii=False)`:

```
{"date": "YYYY-MM-DD",
 "hebrew_date": {"hebrew": "…", "english": "…"},
 "english": {
   "summary": "3–5 sentences on what happens in the aliyah (from the text itself; mention the note if there is one)",
   "questions": [{
     "title": "short title",
     "pasuk": {"text": "<exact Hebrew words from the verse>", "ref": "Genesis 3:1", "label": "Genesis 3:1"},
     "question": "the question, clearly stated",
     "asked_by": [{"name": "Ramban", "ref": "Ramban on Genesis 3:1:1", "era": "rishon",
                   "quote": "<the asker's own words, copied exactly from that ref>"}],
     "answers": [{"text": "the answer, as that source gives it",
                  "sources": [{"name": "Rashi", "ref": "Rashi on Genesis 3:1:1",
                               "quote": "<the words in that ref that give this answer>"}]}],
     "why": "one line on why it matters"}]},
 "hebrew": { the same questions in the same order, written as natural Hebrew study
             prose; names in Hebrew (רש"י, רמב"ן, אבן עזרא, ספורנו, אור החיים…);
             pasuk.label like "בראשית ג, א"; every ref and every quote identical to the English }
}
```

Quotes: copy them from the Sefaria text you fetched, at least three words in
a row (two excerpts may be joined with "…", each at least two words, in the
order they appear). `pasuk.text` must come from the verse in `pasuk.ref`, and
`ref` must name a single verse or range that contains it — not a neighbouring
verse. `era` is `rishon` or `acharon`. Plain text only: no Markdown, no HTML.
Do not write answers that no source gives.

## Step 5 – verify

```sh
python3 scripts/verify_brief.py /tmp/brief.json
```

It removes every pasuk, asker or answer whose quote is not in its linked
source, and any question left without a pasuk, an asker or an answer. If it
exits 1 (fewer than 5 verified questions), go back to steps 3–4: read more,
add questions, fix quotes by copying them exactly, and run it again. Never
edit the file after the check passes, except by re-running the check.

## Step 6 – email (daily only)

Send the English brief built from the **verified** JSON to
rosenbaum.jeremy@gmail.com with the Gmail connector:

- Subject: `Daily Aliyah: <Parasha> – <Aliyah name> (<range>) – <date>`
- HTML body (inline styles only): title with parasha (Hebrew / English), aliyah,
  weekday, Hebrew and Gregorian date; the range with its Sefaria link (and
  maftir on Shabbat); the summary; each question with its pasuk, the question,
  who asks it with their quote, the answers each with their source and quote,
  and why it matters; then "Sources consulted". Hebrew in
  `<span dir="rtl" lang="he">`; every ref a link to
  `https://www.sefaria.org/<ref with spaces as underscores>`.
- One email per run; retry once on failure. A failed email must not stop step 7.

## Step 7 – publish

1. `git pull --rebase origin main`.
2. `python3 scripts/add_brief.py /tmp/brief.json` — writes
   `site/data/aliyot/<date>.json` and updates `index.json`.
3. `git add site/data/aliyot` — nothing else — and commit as
   `git -c user.name="Daily Aliyah routine" -c user.email="rosenbaum.jeremy@gmail.com" commit -m "Aliyah: <Parasha> <Aliyah name> (<date>)"`.
4. `git push origin main`; if rejected because main moved, pull --rebase and
   retry (3 tries). If refused for permission, push to `claude/aliyah-<date>`
   and say so.

Finish with one line per date: how many questions passed verification, whether
the email was sent, and whether the commit was pushed. Do not change any other
file, open PRs, or send any other email.
