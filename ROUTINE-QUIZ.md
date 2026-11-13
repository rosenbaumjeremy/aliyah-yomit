# Weekly parasha quiz routine

Instructions for the cloud task that runs every Sunday morning (Israel time). It writes
a 75-question multiple-choice question bank, in Hebrew, on the parasha read the coming Shabbat
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

   - 75 questions, in the order of the parasha, spread over all of it, none repeating another.
     (The reader picks how many to play and which types; they are drawn at random.)
   - Answerable from the plain text alone (pshat), not from midrash or Rashi.
   - Mix, roughly: 12–18 "מי אמר אל מי" (quoting the pasuk), 5–8 "על מי / על מה נאמר",
     5–8 השלמת פסוק, and the rest about content (people, places, numbers, events, mitzvot),
     so that every type has enough questions to play on its own.
   - `"o"`: exactly 4 different answers, **the right one first** (the script shuffles them).
     Distractors are plausible and clearly wrong by the text; none of them may also be true.
   - `"r"`: the pasuk or pesukim (`27:12-13`, `31:54-32:3`) that answer it, inside the parasha.
   - Quotes go between “ ” and may be typed without nikud. Each must appear word for word
     in the pesukim of `"r"` (`...` skips words, `___` leaves a blank). The script replaces
     them with the pasuk's own words with nikud. Write the divine name ה׳ / אלקים outside quotes.
   - Ask about the content, never about where something is in the text. The reader does not
     know the parasha by verse numbers or layout, so no "לפי 16:29", "בפסוק 19:11", "בסוף פרק טז",
     "בפתיחת הפרשה", "בפסוק האחרון", "באיזה פסוק מסתיימת". Identify the moment by what is
     happening ("כשטען משה למה הרעתה", "אחרי מלחמת עוג"), not by its place.
   - No vague "מה נאמר על X?" whose answer is just the next words of the pasuk, and no question
     whose answer everyone knows without the parasha (that Yom Kippur is a fast, that Moshe
     did what Hashem commanded). Every question should test something learned from reading it.
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
