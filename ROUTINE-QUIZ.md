# Weekly parasha quiz routine

Instructions for the cloud task that runs every Sunday morning (Israel time). It writes
a 25-question multiple-choice quiz, in Hebrew, on the parasha read the coming Shabbat
(Israel schedule) and publishes it to the site's quiz page (the חידון button on each
parasha card).

## Steps

1. **Which parasha.** `python3 scripts/rjs.py --info $(TZ=Asia/Jerusalem date +%Y-%m-%d)`
   prints the coming Shabbat's reading and its slug(s). In a combined week, write one quiz
   per parasha. Skip any slug already listed in `site/data/quiz/index.json`; if all are,
   print "Already published" and stop.
2. **Read the pesukim** of the parasha: `site/data/text/<Book>.<chapter>.json` (`"he"`).
3. **Write the draft**, `/tmp/quiz-<slug>.json`, with python `json.dump(..., ensure_ascii=False)`:

   ```
   {"slug": "<slug>", "questions": [
     {"q": "מי אמר אל מי: “הקל קול יעקב והידים ידי עשו”?",
      "o": ["יצחק", "רבקה", "עשו", "יעקב"],
      "e": "יצחק אמר זאת לאחר שמישש את יעקב...",
      "r": "27:22",
      "h": "optional hint",
      "t": "said"}]}
   ```

   - 25 questions, in the order of the parasha, spread over all of it.
   - Answerable from the plain text alone (pshat), not from midrash or Rashi.
   - Mix: about 6–8 "מי אמר אל מי" (quoting the pasuk), a few "על מי / על מה נאמר",
     the rest about content (names, places, numbers, events, laws).
   - `"o"`: exactly 4 different answers, **the right one first** (the script shuffles them).
     Distractors are plausible and clearly wrong by the text; none of them may also be true.
   - `"r"`: the pasuk or pesukim (`27:12-13`, `31:54-32:3`) that answer it, inside the parasha.
   - Quotes go between “ ” and may be typed without nikud. Each must appear word for word
     in the pesukim of `"r"` (`...` skips words, `___` leaves a blank). The script replaces
     them with the pasuk's own words with nikud. Write the divine name ה׳ / אלקים outside quotes.
   - A hint (`"h"`) on a few of the harder questions.
   - `"t"`: the question's type, one of `said` (מי אמר אל מי), `about` (על מי / על מה נאמר),
     `complete` (השלמת פסוק, with `___` in the quote), `people` (names, who did something),
     `places`, `numbers` (numbers, years, ages, days), `events` (what happened, why), `mitzvot`.
     The reader can choose which types to play, so tag each one by what it asks.
4. **Check and publish:** `python3 scripts/quiz.py /tmp/quiz-<slug>.json`
   (`--append` adds a draft to a quiz already published instead of replacing it). It refuses a draft
   whose quote is not in its pesukim or whose ref is outside the parasha; fix and rerun.
   Then reread every question with its pasuk and make sure the answer is right.
5. **Commit and push** to `main` (Cloudflare deploys on push):
   `git add site/data/quiz && git commit -m "Quiz: <Parasha>" && git push`.
