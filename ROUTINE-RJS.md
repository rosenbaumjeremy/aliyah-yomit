# Weekly Rabbi Sacks (RJS) routine

Instructions for the cloud routine that runs every Sunday at 06:00 Israel time.
It summarises Rabbi Jonathan Sacks' *Covenant & Conversation* essays on the
parasha read the coming Shabbat — **only the essays as Sefaria has them** — and
publishes the summary to the site's RJS page (the RJS button on each parasha card).

## The rule

**Summarise only what you read in the essay on Sefaria.** Every question and
building block carries a short `quote` copied word for word from that essay,
and `scripts/rjs.py --verify` drops any whose quote is not in its Sefaria ref.
No outside material: not rabbisacks.org, not other books, not your own ideas.

## Modes

- **Weekly** (the normal run): steps 0–5 for today's date.
- **Backfill** (when the prompt names parashot or dates): steps 2–5 for each,
  one commit per parasha. No time guard.

## Step 0 – time guard (weekly only)

The schedule fires on Sunday at 03:00 and 04:00 UTC so one firing lands at 06:00
in Israel year-round. Run `TZ=Asia/Jerusalem date +%H`; if it is `05` or `07`,
print "Off-hour scheduled firing – skipping" and stop. Any other hour, continue.

## Step 1 – this week's parasha

`python3 scripts/rjs.py --info $(TZ=Asia/Jerusalem date +%Y-%m-%d)` prints the
reading of the coming Shabbat (Israel schedule) and, for each parasha in it
(two in a combined week), every essay Sefaria has: the English volume
(`"lang": "english"`) and the Hebrew Edition, שיג ושיח (`"lang": "hebrew"`),
and `published`. Skip any parasha already published; if all are, print
"Already published" and stop. (The essays are the same every year, so a
parasha is done once.)

## Step 2 – read every essay

For each essay listed: `python3 scripts/rjs.py --text "<ref>"`. Read each one
in full — the English essays in English, the Hebrew Edition essays in Hebrew.
(The first essay of each English volume's parasha opens with Rabbi Sacks' own
short overview of the parasha and of the essays; use it for the overview.)

## Step 3 – write the summary

One file per parasha, `/tmp/rjs-<slug>.json`, written with python
`json.dump(..., ensure_ascii=False)`:

```
{"slug": "<slug from --info>",
 "date": "<today, YYYY-MM-DD>",
 "english": {
   "overview": "3–4 sentences: what Rabbi Sacks' essays on this parasha are about, taken together",
   "essays": [{"title": "<title from --info>", "ref": "<ref from --info>",
               "questions": [{"text": "a question the essay asks, in one line",
                              "quote": "<the essay's own words that raise it>"}],
               "blocks": [{"text": "one step of the argument, 1–2 sentences",
                           "quote": "<the essay's own words for that step>"}]}]},
 "hebrew": { the same shape for the Hebrew Edition essays, written in natural Hebrew,
             quotes copied from the Hebrew essay }
}
```

**The user's format (2026-10-19): no prose summaries.** Each essay is:

- `questions` — the 1–3 questions the essay itself asks or starts from
  (stated or clearly implied by the essay), each one short line.
- `blocks` — the building blocks of the idea: 4–7 steps, in the order the
  essay builds its argument (the text, the source it brings — Rashi, a
  midrash, Maimonides, a modern thinker — the problem, the turn), and the
  last block is where it lands, starting "Where it lands:" / "המסקנה:".
  Each block is one step, not a paragraph.

Also:

- Every essay `--info` lists for that language, in the same order, with its
  exact `title` and `ref`.
- English essays come from the English volume and Hebrew essays from the
  Hebrew Edition — they are different essays; do not translate one into the other.
- Say only what the essay says. Nothing that is not in it.
- Every question and block has a `quote`: at least four words copied
  character for character from that essay (no footnote numbers). Plain text
  only: no Markdown, no HTML.

## Step 4 – verify

```sh
python3 scripts/rjs.py --verify /tmp/rjs-<slug>.json
```

It removes every question or block whose quote is not in its essay, then any
essay left without a question or with fewer than 3 blocks, and exits 1 if any
listed essay or either overview is missing. On exit 1, fix the quotes by
copying them exactly from `--text` output (or add what is missing) and run
it again. Never edit the file after it passes, except by re-running it.

## Step 5 – publish

1. `git pull --rebase origin main`.
2. `python3 scripts/rjs.py /tmp/rjs-<slug>.json` — writes
   `site/data/rjs/<slug>.json` and updates `site/data/rjs/index.json`.
3. `git add site/data/rjs` — nothing else — and commit as
   `git -c user.name="RJS routine" -c user.email="rosenbaum.jeremy@gmail.com" commit -m "RJS: <Parasha> (<date>)"`.
4. `git push origin main`; if rejected because main moved, pull --rebase and
   retry (3 tries). If refused for permission, push to `claude/rjs-<slug>` and say so.

Finish with one line per parasha: how many English and Hebrew essays passed
verification and whether the commit was pushed. Do not change any other file,
open PRs, or send any email.
