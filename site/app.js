"use strict";

/* Daily Aliyah: browse the 54 parashiyot, pick an aliyah, read the questions
   of the Rishonim and Achronim on it. The briefs are filed every morning by
   the daily routine (scripts/add_brief.py) into data/aliyot/. */

const UI = {
  hebrew: {
    dir: "rtl",
    title: "פרשת השבוע",
    subtitle: "שאלות הראשונים והאחרונים על העלייה היומית",
    docTitle: "פרשת השבוע — שאלות הראשונים והאחרונים",
    latest: "העלייה האחרונה",
    open: "לשאלות",
    back: "→ כל הפרשות",
    noBriefs: "עדיין לא פורסמו שאלות. הראשונות יופיעו מחר בבוקר בשעה 3:00.",
    notYet: "השאלות לעלייה זו יתפרסמו כשתגיע בלוח הקריאה.",
    choose: "בחרו עלייה כדי לראות את השאלות.",
    combined: (name) => `קריאה מחוברת: ${name}`,
    published: "פורסם",
    sefaria: "הטקסט בספריא",
    loading: "טוען…",
    loadFailed: "לא ניתן היה לטעון את השאלות.",
    maftir: "מפטיר",
    pasuk: "פסוק",
    askedBy: "שואלים",
    answers: "תשובות",
    whyMatters: "למה זה חשוב",
    summaryTitle: "סיכום העלייה",
    questionsTitle: "שאלות ותשובות",
    pdfQuestions: "שאלות",
    openAll: "פתח הכל",
    closeAll: "סגור הכל",
    answerN: (i) => `תירוץ ${"אבגדהוזחטי"[i] || i + 1}`,
    synthesis: "סינתזה שלנו",
    consulted: "מקורות שנבדקו",
    rishon: "ראשון",
    acharon: "אחרון",
    chazal: "חז״ל",
    aliyot: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"],
    views: { summaries: "סיכומי העליות", questions: "שאלות ותשובות", all: "סיכומים ושאלות" },
    wholeParasha: "כל הפרשה",
    noneYet: "עדיין לא פורסמו עליות בפרשה זו.",
    missing: (names) => `טרם פורסמו: ${names}`,
    rjs: "RJS",
    rjsHint: "הרב יונתן זקס על הפרשה",
    rjsTitle: (name) => `הרב יונתן זקס — פרשת ${name}`,
    rjsSub: "סיכום המסות מתוך ״שיג ושיח״ (המהדורה העברית), כפי שהן בספריא",
    rjsOverview: "סיכום",
    rjsEssays: "המסות",
    rjsNotYet: "סיכום מסות הרב זקס על פרשה זו יתפרסם ביום ראשון בבוקר של השבוע שבו קוראים אותה.",
    rjsRead: "למסה המלאה בספריא",
    rjsSummary: "סיכום המסה",
    rjsQuestions: "השאלות",
    rjsBlocks: "אבני הבניין של הרעיון",
    rjsLands: "המסקנה",
    rjsCredit: "שיג ושיח, תרגום צור ארליך, הוצאת מגיד (CC-BY-NC), באתר ספריא",
    quiz: "חידון",
    quizHint: "חידון על הפרשה",
    quizTitle: (name) => `חידון — פרשת ${name}`,
    quizSub: "שאלות אמריקאיות מתוך פשט הכתובים",
    quizNotYet: "החידון על פרשה זו יתפרסם ביום ראשון בבוקר של השבוע שבו קוראים אותה.",
    quizRules: (p, from, bonus) => `${p} נקודות על כל תשובה נכונה, ועוד ${bonus} נקודות בונוס מהתשובה ה־${from} ברצף.`,
    quizPoints: (n) => `${n} נק׳`,
    quizCount: (right, done, total) => `${right}/${done} נכונות · ${done} מתוך ${total}`,
    quizStreakToast: (n, total) => (n === total ? `🏆 ${n} ברצף — בלי אף טעות!` : n >= 10 ? `🔥🔥 ${n} ברצף! מדהים!` : `🔥 ${n} ברצף!`),
    quizRank: (right, total, sefer) => { const w = sefer ? "בספר" : "בפרשה"; return right === total ? `מושלם! בקיא ${w} כמו תלמיד חכם` : right / total >= 0.9 ? "תלמיד חכם!" : right / total >= 0.7 ? `בקיא ${w}!` : right / total >= 0.5 ? "בדרך הנכונה" : `כדאי לחזור על ${sefer ? "הספר" : "הפרשה"} ולנסות שוב`; },
    quizLongest: (n) => `הרצף הארוך ביותר: ${n}`,
    quizBest: "השיא שלך",
    quizBestShort: (right, total) => `${right} מתוך ${total}`,
    quizNewBest: "🎉 שיא אישי חדש!",
    quizReview: "לחזרה על הטעויות:",
    quizAgain: "לשחק שוב",
    quizRight: ["נכון!", "יפה מאוד!", "מצוין!", "בדיוק!", "כל הכבוד!", "אלוף!"],
    quizWrong: ["לא בדיוק.", "כמעט.", "לא הפעם.", "טעות קטנה."],
    quizHintBtn: (n) => `רמז (השאלה תהיה שווה ${n} נק׳)`,
    quizReset: "התחל מחדש",
    quizPasuk: "לפסוק בספריא",
    quizNote: "",
    seferQuiz: "חידון על כל הספר",
    seferTitle: (name) => `חידון — ספר ${name}`,
    seferSub: "שאלות אמריקאיות מכל פרשיות הספר, מתוך מאגר השאלות של החידונים על הפרשות",
    seferHowMany: "כמה שאלות?",
    seferFrom: "מאילו פרשיות?",
    seferAll: "כולן",
    seferNoneBtn: "נקה",
    seferPick: "בחרו לפחות פרשה אחת.",
    seferWillDraw: (n, k, max) => `ייבחרו ${n} שאלות באקראי, מפוזרות באופן שווה על ${k === 1 ? "פרשה אחת" : `${k} פרשיות`} (יש במאגר ${max}).`,
    seferPartial: (have, all) => `יש חידון ל־${have} מתוך ${all} הפרשיות בספר; השאר יתווספו כשיתפרסמו.`,
    seferNone: "עדיין אין חידונים על פרשיות הספר הזה.",
    seferStart: "התחילו את החידון",
    seferAgain: "שאלות חדשות",
    seferChange: "שינוי ההגדרות",
    textTitle: "פסוקי העלייה — לחצו על פסוק לביאור שטיינזלץ",
    pdfText: "הפסוקים",
    chapter: (n) => `פרק ${hebrewNumber(n)}`,
    showAllExplain: "הצג את כל הביאורים",
    hideAllExplain: "הסתר את כל הביאורים",
    showAllRashi: "הצג את כל רש״י",
    hideAllRashi: "הסתר את כל רש״י",
    rashi: "רש״י",
    rashiOn: (n) => `רש״י על פסוק ${hebrewNumber(n)}`,
    noExplain: "אין ביאור לפסוק זה.",
    fontDown: "הקטן את הפסוקים",
    fontUp: "הגדל את הפסוקים",
    hideOthers: "הסתר סיכום ושאלות",
    showOthers: "הצג סיכום ושאלות",
    textCredit: "ביאור: תנ״ך קורן שטיינזלץ המבואר. רש״י: מהדורת רוזנבוים וזילברמן. מתוך ספריא",
    prevAliyah: (name) => `→ העלייה הקודמת: ${name}`,
    nextAliyah: (name) => `העלייה הבאה: ${name} ←`,
    fullScreen: "מסך מלא",
    exitFullScreen: "יציאה ממסך מלא",
  },
  english: {
    dir: "ltr",
    title: "Parashat HaShavua",
    subtitle: "Questions of the Rishonim & Achronim on each day's aliyah",
    docTitle: "Parashat HaShavua — Questions of the Rishonim & Achronim",
    latest: "Latest aliyah",
    open: "Open the questions",
    back: "← All parashiyot",
    noBriefs: "No questions published yet. The first ones arrive tomorrow at 3:00 AM Israel time.",
    notYet: "The questions for this aliyah will be published when it comes round in the reading cycle.",
    choose: "Choose an aliyah to see its questions.",
    combined: (name) => `Combined reading: ${name}`,
    published: "Published",
    sefaria: "Text on Sefaria",
    loading: "Loading…",
    loadFailed: "Couldn't load the questions.",
    maftir: "Maftir",
    pasuk: "Pasuk",
    askedBy: "Asked by",
    answers: "Answers",
    whyMatters: "Why it matters",
    summaryTitle: "Summary of the aliyah",
    questionsTitle: "Questions & answers",
    pdfQuestions: "Questions",
    openAll: "Expand all",
    closeAll: "Collapse all",
    answerN: (i) => `Answer ${i + 1}`,
    synthesis: "our synthesis",
    consulted: "Sources consulted",
    rishon: "Rishon",
    acharon: "Acharon",
    chazal: "Chazal",
    aliyot: ["Rishon", "Sheni", "Shlishi", "Revi'i", "Chamishi", "Shishi", "Shevi'i"],
    views: { summaries: "Aliyah summaries", questions: "Questions & answers", all: "Summaries & questions" },
    wholeParasha: "Whole parasha",
    noneYet: "No aliyot of this parasha have been published yet.",
    missing: (names) => `Not yet published: ${names}`,
    rjs: "RJS",
    rjsHint: "Rabbi Jonathan Sacks on the parasha",
    rjsTitle: (name) => `Rabbi Jonathan Sacks — Parashat ${name}`,
    rjsSub: "Summaries of his Covenant & Conversation essays, as they appear on Sefaria",
    rjsOverview: "Overview",
    rjsEssays: "The essays",
    rjsNotYet: "The summary of Rabbi Sacks' essays on this parasha will be published on the Sunday morning of the week it is read.",
    rjsRead: "Read the full essay on Sefaria",
    rjsSummary: "Summary",
    rjsQuestions: "The questions",
    rjsBlocks: "Building blocks of the idea",
    rjsLands: "Where it lands",
    rjsCredit: "Covenant & Conversation, Maggid Books and the Orthodox Union (CC-BY-NC), on Sefaria",
    quiz: "Quiz",
    quizHint: "Quiz on the parasha",
    quizTitle: (name) => `Quiz — Parashat ${name}`,
    quizSub: "Multiple-choice questions on the plain text of the parasha",
    quizNotYet: "The quiz on this parasha will be published on the Sunday morning of the week it is read.",
    quizRules: (p, from, bonus) => `${p} points for each right answer, plus a ${bonus}-point bonus from the ${from}rd in a row.`,
    quizPoints: (n) => `${n} pts`,
    quizCount: (right, done, total) => `${right}/${done} right · ${done} of ${total}`,
    quizStreakToast: (n, total) => (n === total ? `🏆 ${n} in a row — not a single mistake!` : n >= 10 ? `🔥🔥 ${n} in a row! Amazing!` : `🔥 ${n} in a row!`),
    quizRank: (right, total, sefer) => { const w = sefer ? "the sefer" : "the parasha"; return right === total ? `Perfect! You know ${w} like a talmid chacham` : right / total >= 0.9 ? "Talmid chacham!" : right / total >= 0.7 ? `You know ${w}!` : right / total >= 0.5 ? "On the right track" : `Worth reviewing ${w} and trying again`; },
    quizLongest: (n) => `Longest streak: ${n}`,
    quizBest: "Your best",
    quizBestShort: (right, total) => `${right} of ${total}`,
    quizNewBest: "🎉 New personal best!",
    quizReview: "Review your mistakes:",
    quizAgain: "Play again",
    quizRight: ["Correct!", "Very good!", "Excellent!", "Exactly!", "Well done!", "Champion!"],
    quizWrong: ["Not quite.", "Almost.", "Not this time.", "A small slip."],
    quizHintBtn: (n) => `Hint (this question will be worth ${n} pts)`,
    quizReset: "Start over",
    quizPasuk: "The pasuk on Sefaria",
    quizNote: "The questions are in Hebrew.",
    seferQuiz: "Quiz on the whole sefer",
    seferTitle: (name) => `Quiz — Sefer ${name}`,
    seferSub: "Multiple-choice questions from every parasha in the sefer, drawn from the parasha quizzes' question bank",
    seferHowMany: "How many questions?",
    seferFrom: "From which parashiyot?",
    seferAll: "All",
    seferNoneBtn: "Clear",
    seferPick: "Choose at least one parasha.",
    seferWillDraw: (n, k, max) => `${n} questions will be drawn at random, spread evenly over ${k === 1 ? "1 parasha" : `${k} parashiyot`} (${max} in the bank).`,
    seferPartial: (have, all) => `${have} of the ${all} parashiyot in this sefer have a quiz so far; the rest are added as they are published.`,
    seferNone: "There are no quizzes on this sefer's parashiyot yet.",
    seferStart: "Start the quiz",
    seferAgain: "New questions",
    seferChange: "Change settings",
    textTitle: "The pesukim of the aliyah — click a pasuk for the Steinsaltz explanation",
    pdfText: "The text",
    chapter: (n) => `Chapter ${n}`,
    showAllExplain: "Show all explanations",
    hideAllExplain: "Hide all explanations",
    showAllRashi: "Show all Rashi",
    hideAllRashi: "Hide all Rashi",
    rashi: "Rashi",
    rashiOn: (n) => `Rashi on pasuk ${n}`,
    noExplain: "No explanation for this pasuk.",
    fontDown: "Smaller pesukim",
    fontUp: "Larger pesukim",
    hideOthers: "Hide summary & questions",
    showOthers: "Show summary & questions",
    textCredit: "Explanation: The Steinsaltz Tanakh (Koren). Rashi: translated by M. Rosenbaum and A.M. Silbermann. Via Sefaria",
    prevAliyah: (name) => `← Previous aliyah: ${name}`,
    nextAliyah: (name) => `Next aliyah: ${name} →`,
    fullScreen: "Full screen",
    exitFullScreen: "Exit full screen",
  },
};

const BOOK_HE = { Genesis: "בראשית", Exodus: "שמות", Leviticus: "ויקרא", Numbers: "במדבר", Deuteronomy: "דברים" };

const state = {
  lang: "hebrew",
  books: [],          // parashot.json
  days: [],           // aliyot/index.json
  parasha: null,      // slug of the parasha being viewed
  reading: null,      // which reading's tabs are active (its slugs joined)
  aliyah: null,       // 1..7
  view: null,         // whole-parasha view: "summaries" | "questions" | "all"
  rjs: null,          // slug of the parasha whose Rabbi Sacks page is open
  rjsDays: new Set(), // parashot that have a Rabbi Sacks page (rjs/index.json)
  quiz: null,         // the open quiz: a parasha slug, or "sefer:<Book>" for a whole sefer
  quizDays: new Set(),// parashot that have a quiz (quiz/index.json)
  briefs: new Map(),  // date -> fetch promise
};

const el = (id) => document.getElementById(id);
const t = () => UI[state.lang];
const node = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/** Marks a heading that goes into the PDF with the sections under it (pdf.js). */
const pdfHead = (n) => { n.dataset.pdfHead = ""; return n; };

/** Where pdf.js puts the PDF and Print buttons. */
const pdfTools = () => { const d = document.createElement("div"); d.dataset.pdfTools = ""; return d; };

/* ---------- references ---------- */

const HEB_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const HEB_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];

function hebrewNumber(n) {
  let letters = "";
  if (n >= 100) { letters += "ק".repeat(Math.floor(n / 100)); n %= 100; }
  if (n === 15 || n === 16) letters += "ט" + HEB_ONES[n - 9];
  else letters += HEB_TENS[Math.floor(n / 10)] + HEB_ONES[n % 10];
  return letters;
}

/** "Genesis 2:20-3:21" -> "Genesis 2:20–3:21" or "בראשית ב, כ – ג, כא" */
function rangeLabel(ref) {
  const m = ref.replace(/–/g, "-").match(/^(.+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/);
  if (!m) return ref;
  const [, book, c1, v1, c2, v2] = m;
  if (state.lang === "english") {
    const end = v2 ? `–${c2 ? `${c2}:` : ""}${v2}` : "";
    return `${book} ${c1}:${v1}${end}`;
  }
  const he = (n) => hebrewNumber(Number(n));
  const start = `${he(c1)}, ${he(v1)}`;
  const end = v2 ? (c2 && c2 !== c1 ? ` – ${he(c2)}, ${he(v2)}` : `–${he(v2)}`) : "";
  return `${BOOK_HE[book] || book} ${start}${end}`;
}

/** short form for the tabs: "2:20–3:21" / "ב, כ – ג, כא" without the book name */
function shortRange(ref) {
  return rangeLabel(ref).replace(/^\S+\s/, "");
}

const sefariaUrl = (ref) => `https://www.sefaria.org/${encodeURIComponent(ref.replace(/ /g, "_")).replace(/%3A/g, ":")}`;

function sefariaLink(label, ref) {
  const a = node("a", null, label);
  a.href = sefariaUrl(ref);
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

/* ---------- data ---------- */

async function load() {
  const get = (path, fallback) => fetch(path).then((r) => (r.ok ? r.json() : fallback)).catch(() => fallback);
  const [parashot, index, rjs, quiz] = await Promise.all([
    get("data/parashot.json", { books: [] }), get("data/aliyot/index.json", { days: [] }),
    get("data/rjs/index.json", { days: [] }), get("data/quiz/index.json", { days: [] })]);
  state.books = parashot.books;
  state.days = index.days;
  state.rjsDays = new Set(rjs.days.map((d) => d.slug));
  state.quizDays = new Set(quiz.days.map((d) => d.slug));
}

function loadBrief(date) {
  if (!state.briefs.has(date)) {
    state.briefs.set(date, fetch(`data/aliyot/${date}.json`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((error) => { state.briefs.delete(date); throw error; }));
  }
  return state.briefs.get(date);
}

function findParasha(slug) {
  for (const book of state.books)
    for (const parasha of book.parashot)
      if (parasha.slug === slug) return parasha;
  return null;
}

const parashaName = (p) => (state.lang === "hebrew" ? p.he : p.en);
const readingName = (r) => (state.lang === "hebrew" ? r.he : r.en);

/** Readings a parasha appears in: its own seven aliyot, plus any year it was
    read joined to its neighbour (Vayakhel-Pekudei etc.), whose aliyot differ. */
function readingsFor(parasha) {
  const own = { key: parasha.slug, name: null, aliyot: parasha.aliyot, days: new Map() };
  const combined = new Map();
  for (const day of state.days) {
    if (!day.reading.slugs.includes(parasha.slug)) continue;
    if (day.reading.slugs.length === 1) { own.days.set(day.aliyah, day); continue; }
    const key = day.reading.slugs.join("+");
    if (!combined.has(key)) combined.set(key, { key, name: day.reading, aliyot: [], days: new Map() });
    const reading = combined.get(key);
    reading.days.set(day.aliyah, day);
    reading.aliyot[day.aliyah - 1] = day.range;
  }
  return [own, ...combined.values()];
}

/* ---------- brief ---------- */

/* ---------- brief: laid out like the Mishnah Yomit site ---------- */

/** A collapsible section: title, an optional count, and its body. */
function box(title, count, open) {
  const details = node("details", "box");
  details.open = open;
  const summary = node("summary", null, title);
  if (count != null) summary.appendChild(node("span", "count", String(count)));
  const body = node("div", "body");
  details.append(summary, body);
  return { details, body };
}

/** One source: its name, era, Sefaria link, and its own words (checked against Sefaria). */
function cite(who) {
  const line = node("div", "cite");
  line.appendChild(node("b", null, who.name));
  if (who.era) line.appendChild(node("span", "era", t()[who.era] || who.era));
  if (who.ref) {
    line.append(" (");
    line.appendChild(sefariaLink(t().sefaria, who.ref));
    line.append(")");
  }
  if (who.quote) {
    line.append(": ");
    const quote = node("q", "srcquote", who.quote);
    quote.dir = "rtl";
    quote.lang = "he";
    line.appendChild(quote);
  }
  return line;
}

/** One question in its own box: the title shows; click to open the rest. */
function questionBox(q, i) {
  const details = node("details", "qitem");
  const summary = node("summary");
  summary.append(node("span", "n", `${i + 1}.`), node("span", "ttl", q.title));
  const at = q.pasuk && (q.pasuk.label || q.pasuk.ref);
  if (at) summary.appendChild(node("span", "pref", at));
  const body = node("div", "body");

  if (q.pasuk) {
    const pasuk = node("p", "pasuk");
    const words = node("span", null, q.pasuk.text);
    words.dir = "rtl";
    words.lang = "he";
    pasuk.append(words, " ");
    if (q.pasuk.ref) pasuk.appendChild(sefariaLink(`(${at})`, q.pasuk.ref));
    body.appendChild(pasuk);
  }
  body.appendChild(node("p", "qtext", q.question));

  if (q.asked_by && q.asked_by.length) {
    const askers = node("div", "askers");
    askers.dataset.pdfDetail = "answers";   // printed only together with the answers (pdf.js)
    askers.appendChild(node("div", "label", t().askedBy));
    q.asked_by.forEach((who) => askers.appendChild(cite(who)));
    body.appendChild(askers);
  }
  (q.answers || []).forEach((answer, n) => {
    const block = node("div", "answer");
    block.dataset.pdfDetail = "answers";   // can be left out of the PDF (pdf.js)
    block.appendChild(node("div", "label", t().answerN(n)));
    const text = node("p", null, answer.text);
    if (answer.synthesis) text.appendChild(node("span", "synth", ` — ${t().synthesis}`));
    block.appendChild(text);
    (answer.sources || []).forEach((who) => block.appendChild(cite(who)));
    body.appendChild(block);
  });
  if (q.why) {
    const why = node("p", "why", `${t().whyMatters}: ${q.why}`);
    why.dataset.pdfDetail = "answers";
    body.appendChild(why);
  }

  details.append(summary, body);
  return details;
}

/* ---------- the aliyah's text: pesukim, Steinsaltz, Rashi (as on the Shnayim LaYom site) ---------- */

const texts = new Map();  // "Genesis.12" -> fetch promise (scripts/fetch_text.py writes the files)

function loadText(book, n) {
  const path = `data/text/${book}.${n}.json`;
  if (!texts.has(path)) {
    texts.set(path, fetch(path)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((error) => { texts.delete(path); throw error; }));
  }
  return texts.get(path);
}

/** "Genesis 15:7-17:6" -> [{book, chapter: 15, from: 7, to: null}, {.., 16, 1, null}, {.., 17, 1, 6}]
    (to: null = to the end of the chapter) */
function rangeChapters(ref) {
  const m = ref.replace(/–/g, "-").match(/^(.+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/);
  if (!m) return [];
  const book = m[1], c1 = Number(m[2]), v1 = Number(m[3]);
  const c2 = m[4] ? Number(m[4]) : c1, v2 = m[5] ? Number(m[5]) : v1;
  const parts = [];
  for (let c = c1; c <= c2; c++) parts.push({ book, chapter: c, from: c === c1 ? v1 : 1, to: c === c2 ? v2 : null });
  return parts;
}

/** Text whose only markup is <b>/<i> (fetch_text.py strips the rest), built as nodes. */
function marked(html) {
  const out = document.createDocumentFragment();
  const open = { b: false, i: false };
  for (const part of html.split(/(<\/?[bi]>)/)) {
    const tag = part.match(/^<(\/?)([bi])>$/);
    if (tag) { open[tag[2]] = !tag[1]; continue; }
    if (!part) continue;
    // fetch_text.py escapes only these three
    const text = part.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    let n = document.createTextNode(text);
    if (open.i) { const i = document.createElement("i"); i.appendChild(n); n = i; }
    if (open.b) { const b = document.createElement("b"); b.appendChild(n); n = b; }
    out.appendChild(n);
  }
  return out;
}

const pasukNumber = (n) => (state.lang === "hebrew" ? hebrewNumber(n) : String(n));

/** One pasuk: click it to show or hide its Steinsaltz explanation underneath;
    the Rashi button beside it (when Rashi comments on it) shows his words. */
function pasukLine(chapter, i, lang) {
  const line = node("div", "pline");
  const button = node("button", "ptext");
  button.type = "button";
  button.setAttribute("aria-expanded", "false");
  button.dir = "rtl";
  button.lang = "he";
  button.append(node("span", "pnum", pasukNumber(i + 1)), chapter.he[i]);
  const note = chapter.steinsaltz[lang][i];
  const explain = node("div", "explain");
  explain.dir = lang === "hebrew" ? "rtl" : "ltr";
  explain.lang = lang === "hebrew" ? "he" : "en";
  if (note) explain.appendChild(marked(note));
  else explain.textContent = t().noExplain;
  explain.hidden = true;
  button.onclick = () => {
    explain.hidden = !explain.hidden;
    button.setAttribute("aria-expanded", String(!explain.hidden));
  };
  const row = node("div", "prow");
  row.appendChild(button);
  line.appendChild(row);

  const comments = (chapter.rashi && chapter.rashi[lang][i]) || [];
  if (comments.length) {
    const toggle = node("button", "rashibtn", t().rashi);
    toggle.type = "button";
    toggle.title = t().rashiOn(i + 1);
    toggle.setAttribute("aria-expanded", "false");
    const rashi = node("div", "rashi");
    rashi.dir = lang === "hebrew" ? "rtl" : "ltr";
    rashi.lang = lang === "hebrew" ? "he" : "en";
    rashi.appendChild(node("div", "label", t().rashi));
    comments.forEach((c) => { const p = node("p"); p.appendChild(marked(c)); rashi.appendChild(p); });
    rashi.hidden = true;
    toggle.onclick = () => {
      rashi.hidden = !rashi.hidden;
      toggle.setAttribute("aria-expanded", String(!rashi.hidden));
    };
    row.appendChild(toggle);
    line.append(explain, rashi);
  } else {
    row.appendChild(node("span", "rashibtn none"));
    line.appendChild(explain);
  }
  return line;
}

// size of the aliyah's text (A−/A+ in the text box): --fs in app.css; remembered on this device
const FONT_KEY = "aliyah-font-scale";
const FONT_STEPS = [1, 1.15, 1.3, 1.5, 1.75];
let fontStep = 0;
function setFontStep(step) {
  fontStep = Math.max(0, Math.min(FONT_STEPS.length - 1, step));
  document.documentElement.style.setProperty("--fs", String(FONT_STEPS[fontStep]));
  document.querySelectorAll(".fontsize").forEach(fontButtonsState);
}
function fontButtonsState(group) {
  group.querySelector(".down").disabled = fontStep === 0;
  group.querySelector(".up").disabled = fontStep === FONT_STEPS.length - 1;
}
function fontButtons() {
  const group = node("span", "fontsize");
  group.dir = "ltr";
  const down = node("button", "down", "A−"), up = node("button", "up", "A+");
  [[down, t().fontDown, -1], [up, t().fontUp, 1]].forEach(([b, label, delta]) => {
    b.type = "button";
    b.title = label;
    b.setAttribute("aria-label", label);
    b.onclick = () => {
      setFontStep(fontStep + delta);
      try { localStorage.setItem(FONT_KEY, String(fontStep)); } catch (err) { /* private mode */ }
    };
  });
  group.append(down, up);
  fontButtonsState(group);
  return group;
}
try { setFontStep(Number(localStorage.getItem(FONT_KEY)) || 0); } catch (err) { setFontStep(0); }

// with the text open beside the other boxes, those boxes can fold into a strip
const OTHERS_FOLDED_KEY = "aliyah-others-folded";
try { document.body.classList.toggle("others-folded", localStorage.getItem(OTHERS_FOLDED_KEY) === "1"); } catch (err) { /* private mode */ }
function othersLabels(buttons = document.querySelectorAll(".sidetoggle")) {
  const folded = document.body.classList.contains("others-folded");
  const label = folded ? t().showOthers : t().hideOthers;
  buttons.forEach((b) => {
    b.title = label;
    b.setAttribute("aria-expanded", folded ? "false" : "true");
    b.querySelector(".text").textContent = label;
  });
}
function sideToggle() {
  const button = node("button", "sidetoggle");
  button.type = "button";
  button.append(node("span", "text"), node("span", "arrow", "❯"));
  button.querySelector(".arrow").setAttribute("aria-hidden", "true");
  button.onclick = () => {
    const folded = !document.body.classList.contains("others-folded");
    document.body.classList.toggle("others-folded", folded);
    try { localStorage.setItem(OTHERS_FOLDED_KEY, folded ? "1" : "0"); } catch (err) { /* private mode */ }
    othersLabels();
  };
  othersLabels([button]);
  return button;
}

// the top bar's height, for what sticks just under it (it wraps on phones)
if (window.ResizeObserver) {
  const topbar = document.querySelector(".topbar");
  new ResizeObserver(() => document.documentElement.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`)).observe(topbar);
}

/* ---------- moving on from the text to the aliyah before or after ---------- */

let textStaysOpen = false;  // set by the buttons below: the next aliyah's text opens where the reader was

const readingKey = (day) => day.reading.slugs.join("+");

/** Every aliyah of the Torah in order, Bereshit Rishon to V'Zot HaBerachah Shevi'i, shaped like
    a day of the index ({reading, aliyah, range}). */
let torahOrder = null;
function aliyahOrder() {
  if (!torahOrder) {
    torahOrder = [];
    for (const book of state.books)
      for (const p of book.parashot)
        p.aliyot.forEach((range, i) => torahOrder.push({ reading: { en: p.en, he: p.he, slugs: [p.slug] }, aliyah: i + 1, range }));
  }
  return torahOrder;
}

/** The aliyot just before and after this one; null at either end. A parasha's own aliyot follow
    the Torah's order; a joined reading (Vayakhel-Pekudei etc.) the order its days were filed. */
function neighbours(day) {
  const list = day.reading.slugs.length === 1 ? aliyahOrder() : state.days;
  const i = list.findIndex((d) => readingKey(d) === readingKey(day) && d.aliyah === day.aliyah);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

/** How a neighbouring aliyah is named on its button: within the same reading just the aliyah,
    across to another parasha with its name too. */
function neighbourName(day, from) {
  const aliyah = t().aliyot[day.aliyah - 1];
  return readingKey(day) === readingKey(from) ? aliyah : `${readingName(day.reading)} — ${aliyah}`;
}

function openNeighbour(day) {
  textStaysOpen = true;
  go(day.reading.slugs[0], readingKey(day), day.aliyah);
}

/** The buttons at the top (back only) and the end (back and on) of the pesukim. */
function aliyahNav(day, { next = true } = {}) {
  const bar = node("div", "aliyahnav");
  const { prev, next: after } = neighbours(day);
  const add = (target, label, cls) => {
    const b = node("button", cls, label);
    b.type = "button";
    b.onclick = () => openNeighbour(target);
    bar.appendChild(b);
  };
  if (prev) add(prev, t().prevAliyah(neighbourName(prev, day)), "prev");
  if (next && after) add(after, t().nextAliyah(neighbourName(after, day)), "next");
  return bar.children.length ? bar : null;
}

/** The aliyah, pasuk by pasuk. Starts closed (unless the reader came from the aliyah before or
    after); on tablets and computers, opening it puts it beside the other boxes (app.css). */
function textBox(range, day = null) {
  const { details, body } = box(t().textTitle, null, textStaysOpen);
  if (textStaysOpen) {
    // once it is on the page, bring the new aliyah's card into view
    requestAnimationFrame(() => { const card = details.closest(".briefcard"); if (card) card.scrollIntoView(); });
  }
  textStaysOpen = false;
  details.dataset.pdf = t().pdfText;
  details.classList.add("textbox");
  const bar = node("div", "toolbar");
  // one button each for all the explanations and all of Rashi: shows them all, or hides them if all are showing
  const toggleAll = (cls, panel, toggleCls, showLabel, hideLabel) => {
    const b = node("button", cls, showLabel);
    b.type = "button";
    b.onclick = () => {
      const lines = [...body.querySelectorAll(".pline")].filter((l) => l.querySelector(panel));
      const show = lines.some((l) => l.querySelector(panel).hidden);
      lines.forEach((l) => {
        l.querySelector(panel).hidden = !show;
        l.querySelector(toggleCls).setAttribute("aria-expanded", String(show));
      });
      b.textContent = show ? hideLabel : showLabel;
    };
    return b;
  };
  bar.append(toggleAll("allexplain", ".explain", ".ptext", t().showAllExplain, t().hideAllExplain),
    toggleAll("allrashi", ".rashi", ".rashibtn", t().showAllRashi, t().hideAllRashi), fontButtons());
  body.appendChild(bar);
  // the toolbar sticks just under the title, whose height depends on the width (app.css)
  if (window.ResizeObserver) {
    const title = details.querySelector("summary");
    new ResizeObserver(() => details.style.setProperty("--summary-h", `${title.offsetHeight}px`)).observe(title);
  }

  const lang = state.lang;
  const parts = rangeChapters(range);
  const before = day && aliyahNav(day, { next: false });
  if (before) body.appendChild(before);
  for (const part of parts) {
    const section = node("section", "chaptertext");
    if (parts.length > 1) section.appendChild(pdfHead(node("h4", "chapterHead", t().chapter(part.chapter))));
    const slot = node("div", "empty", t().loading);
    section.appendChild(slot);
    body.appendChild(section);
    loadText(part.book, part.chapter).then((chapter) => {
      const lines = node("div", "pesukim");
      const last = Math.min(part.to || chapter.he.length, chapter.he.length);
      for (let i = part.from - 1; i < last; i++) lines.appendChild(pasukLine(chapter, i, lang));
      slot.replaceWith(lines);
    }).catch(() => { slot.textContent = t().loadFailed; });
  }
  const after = day && aliyahNav(day);
  if (after) body.appendChild(after);
  body.appendChild(node("p", "credit", t().textCredit));
  return details;
}

function briefBody(record, { summary = true, questions = true, text = null, day = null } = {}) {
  const brief = record[state.lang] || record.english || record.hebrew;
  const wrap = node("div", "brief");
  if (text) wrap.appendChild(sideToggle());
  if (summary && brief.summary) {
    const sum = box(t().summaryTitle, null, true);
    sum.details.dataset.pdf = t().summaryTitle;
    sum.body.appendChild(node("p", "sumPara", brief.summary));
    wrap.appendChild(sum.details);
  }
  if (text) wrap.appendChild(textBox(text, day));
  if (!questions) return wrap;

  const list = brief.questions || [];
  const qs = box(t().questionsTitle, list.length, true);
  qs.details.dataset.pdf = t().pdfQuestions;   // the answers are their own choice (pdf.js)
  qs.details.dataset.pdfShort = t().pdfQuestions;   // its heading when they are left out
  const bar = node("div", "toolbar");
  const expand = node("button", null, t().openAll), collapse = node("button", null, t().closeAll);
  expand.type = collapse.type = "button";
  expand.onclick = () => qs.body.querySelectorAll("details.qitem").forEach((d) => { d.open = true; });
  collapse.onclick = () => qs.body.querySelectorAll("details.qitem").forEach((d) => { d.open = false; });
  bar.append(expand, collapse);
  qs.body.appendChild(bar);
  list.forEach((q, i) => qs.body.appendChild(questionBox(q, i)));
  wrap.appendChild(qs.details);

  if (brief.sources_consulted && brief.sources_consulted.length) {
    const src = box(t().consulted, null, false);
    src.details.dataset.pdf = t().consulted;
    src.body.appendChild(node("p", "consulted", brief.sources_consulted.join(" · ")));
    wrap.appendChild(src.details);
  }
  return wrap;
}

/* ---------- full screen: just the aliyah, without the top bar and the parasha's tabs ---------- */
/* The page hides them itself (body.fullread, app.css) and also asks the browser for full screen
   where it can, so its own bars go too; where it can't (iPhone), the page alone still works. */

let browserFull = false;  // whether we asked the browser for full screen

function fullButtonsState() {
  const on = document.body.classList.contains("fullread");
  document.querySelectorAll(".fullbtn").forEach((b) => {
    b.querySelector(".text").textContent = on ? t().exitFullScreen : t().fullScreen;
    b.title = on ? t().exitFullScreen : t().fullScreen;
    b.setAttribute("aria-pressed", String(on));
  });
}

function setFullRead(on) {
  document.body.classList.toggle("fullread", on);
  const root = document.documentElement;
  const current = document.fullscreenElement || document.webkitFullscreenElement;
  if (on && !current) {
    const ask = root.requestFullscreen || root.webkitRequestFullscreen;
    if (ask) {
      try {
        const asked = ask.call(root);
        browserFull = true;
        if (asked && asked.catch) asked.catch(() => { browserFull = false; });
      } catch (err) { browserFull = false; }
    }
  } else if (!on && current && browserFull) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
  if (!on) browserFull = false;
  fullButtonsState();
}

// leaving the browser's full screen (Esc, or the system's own control) leaves the page's too
["fullscreenchange", "webkitfullscreenchange"].forEach((name) => document.addEventListener(name, () => {
  if (!(document.fullscreenElement || document.webkitFullscreenElement) && browserFull) setFullRead(false);
}));

function fullButton() {
  const button = node("button", "fullbtn");
  button.type = "button";
  button.append(node("span", "icon", "⛶"), node("span", "text"));
  button.querySelector(".icon").setAttribute("aria-hidden", "true");
  button.onclick = () => {
    const on = !document.body.classList.contains("fullread");
    setFullRead(on);
    if (on) el("brief").scrollIntoView();
  };
  return button;
}

function renderBrief(reading) {
  const host = el("brief");
  host.innerHTML = "";
  if (!state.aliyah) { host.appendChild(node("p", "empty", t().choose)); return; }

  const day = reading.days.get(state.aliyah);
  const range = reading.aliyot[state.aliyah - 1];
  const card = node("article", "briefcard");
  const head = node("div", "briefhead");
  head.appendChild(pdfHead(node("h3", null, `${t().aliyot[state.aliyah - 1]}${range ? ` — ${rangeLabel(range)}` : ""}`)));
  card.appendChild(head);
  card.appendChild(pdfTools());
  host.appendChild(card);

  if (!range && !day) { card.appendChild(node("p", "empty", t().notYet)); return; }
  head.appendChild(fullButton());
  fullButtonsState();

  // where this aliyah stands in the reading order, for the buttons to the one before and after
  const parasha = findParasha(state.parasha);
  const here = day || { reading: { en: parasha.en, he: parasha.he, slugs: [parasha.slug] }, aliyah: state.aliyah, range };
  if (!day) {
    // not published yet: the text is already here, the summary and questions come on its day
    const wrap = node("div", "brief");
    wrap.append(sideToggle(), node("p", "empty notyet", t().notYet), textBox(range, here));
    card.appendChild(wrap);
    return;
  }

  const slot = node("div", "empty", t().loading);
  card.appendChild(slot);
  const lang = state.lang;
  const wanted = `${state.parasha}|${reading.key}|${state.aliyah}`;
  loadBrief(day.file || day.date).then((record) => {
    if (state.lang !== lang || `${state.parasha}|${state.reading}|${state.aliyah}` !== wanted) return;
    const meta = node("p", "meta");
    meta.append(sefariaLink(t().sefaria, record.range));
    if (record.maftir) {
      meta.append(` · ${t().maftir}: `);
      meta.appendChild(sefariaLink(rangeLabel(record.maftir), record.maftir));
    }
    const hebrewDate = record.hebrew_date && record.hebrew_date[state.lang];
    meta.append(` · ${t().published} ${hebrewDate || ""} (${record.date})`);
    card.insertBefore(meta, card.querySelector("[data-pdf-tools]"));
    if (record.note && state.lang === "english") card.insertBefore(node("p", "note", record.note), slot);
    slot.replaceWith(briefBody(record, { text: record.range, day: here }));
  }).catch(() => { slot.textContent = t().loadFailed; });
}

/** The whole parasha at once: every published aliyah of the reading, in order,
    each under its own heading, showing its summary, its questions, or both. */
function renderWhole(reading) {
  const host = el("brief");
  host.innerHTML = "";
  const parts = { summaries: { questions: false }, questions: { summary: false }, all: {} }[state.view];
  const published = [], missing = [];
  for (let n = 1; n <= 7; n++) {
    if (reading.days.has(n)) published.push(n);
    else if (reading.aliyot[n - 1]) missing.push(t().aliyot[n - 1]);
  }
  const card = node("article", "briefcard whole");
  card.appendChild(pdfHead(node("h3", null, `${t().views[state.view]} — ${t().wholeParasha}`)));
  card.appendChild(pdfTools());
  host.appendChild(card);
  if (!published.length) { card.appendChild(node("p", "empty", t().noneYet)); return; }
  if (missing.length) card.appendChild(node("p", "meta", t().missing(missing.join(", "))));

  const lang = state.lang;
  const wanted = `${state.parasha}|${reading.key}|${state.view}`;
  for (const n of published) {
    const day = reading.days.get(n);
    const section = node("section", "aliyahPart");
    const heading = pdfHead(node("h4", "aliyahHead", `${t().aliyot[n - 1]} — `));
    heading.appendChild(sefariaLink(rangeLabel(day.range), day.range));
    section.appendChild(heading);
    const slot = node("div", "empty", t().loading);
    section.appendChild(slot);
    card.appendChild(section);
    loadBrief(day.file || day.date).then((record) => {
      if (state.lang !== lang || `${state.parasha}|${state.reading}|${state.view}` !== wanted) return;
      slot.replaceWith(briefBody(record, parts));
    }).catch(() => { slot.textContent = t().loadFailed; });
  }
}

/* ---------- views ---------- */

function renderLatest() {
  const host = el("latest");
  host.innerHTML = "";
  if (state.parasha || state.rjs || state.quiz) return;
  const box = node("div", "latest");
  const day = state.days[state.days.length - 1];
  if (!day) {
    box.appendChild(node("p", "label", t().latest));
    box.appendChild(node("p", "muted", t().noBriefs));
  } else {
    box.appendChild(node("p", "label", t().latest));
    box.appendChild(node("h2", null, `${readingName(day.reading)} — ${t().aliyot[day.aliyah - 1]}`));
    box.appendChild(node("p", "range", `${rangeLabel(day.range)} · ${day.date}`));
    const open = node("button", "button", t().open);
    open.type = "button";
    open.onclick = () => go(day.reading.slugs[0], day.reading.slugs.join("+") === day.reading.slugs[0]
      ? day.reading.slugs[0] : day.reading.slugs.join("+"), day.aliyah);
    box.appendChild(open);
  }
  host.appendChild(box);
}

function renderBooks() {
  const host = el("books");
  host.innerHTML = "";
  host.hidden = !!(state.parasha || state.rjs || state.quiz);
  if (host.hidden) return;

  for (const book of state.books) {
    const section = node("div", "book");
    const heading = node("h3", null, state.lang === "hebrew" ? `ספר ${book.he}` : book.en);
    if (quizParashot(book).length) {
      const seferBtn = node("button", "seferbtn", t().seferQuiz);
      seferBtn.type = "button";
      seferBtn.onclick = () => openQuiz(seferKey(book));
      heading.appendChild(seferBtn);
    }
    section.appendChild(heading);
    const grid = node("div", "grid");
    for (const parasha of book.parashot) {
      const tile = node("button", "ptile");
      tile.type = "button";
      tile.appendChild(node("span", "name", parashaName(parasha)));
      tile.appendChild(node("span", "alt", state.lang === "hebrew" ? parasha.en : parasha.he));
      const published = new Set(state.days.filter((d) => d.reading.slugs.includes(parasha.slug)).map((d) => d.aliyah));
      const dots = node("span", "dots");
      for (let n = 1; n <= 7; n++) dots.appendChild(node("i", published.has(n) ? "on" : null));
      tile.appendChild(dots);
      tile.onclick = () => go(parasha.slug, parasha.slug, null);
      const card = node("div", "pcard");
      card.append(tile, rjsButton(parasha, "rjsbtn"), quizButton(parasha, "quizbtn"));
      grid.appendChild(card);
    }
    section.appendChild(grid);
    host.appendChild(section);
  }
}

function renderParasha() {
  const view = el("parasha");
  const parasha = state.parasha && findParasha(state.parasha);
  view.hidden = !parasha;
  if (!parasha) return;

  el("back").textContent = t().back;
  el("parashaTitle").textContent = state.lang === "hebrew" ? `פרשת ${parasha.he}` : `Parashat ${parasha.en}`;
  el("parashaRef").textContent = rangeLabel(parasha.ref);

  const readings = readingsFor(parasha);
  if (!readings.some((r) => r.key === state.reading)) state.reading = readings[0].key;

  const host = el("readings");
  host.innerHTML = "";
  for (const reading of readings) {
    const block = node("div", "reading");
    if (reading.name) block.appendChild(node("p", "readingLabel", t().combined(readingName(reading.name))));
    const tabs = node("div", "tabs");
    for (let n = 1; n <= 7; n++) {
      const range = reading.aliyot[n - 1];
      if (!range && !reading.days.has(n)) continue;
      const tab = node("button", "tab");
      tab.type = "button";
      tab.appendChild(node("span", "n", t().aliyot[n - 1]));
      if (range) tab.appendChild(node("span", "r", shortRange(range)));
      tab.classList.toggle("has", reading.days.has(n));
      tab.classList.toggle("on", reading.key === state.reading && state.aliyah === n);
      tab.onclick = () => go(parasha.slug, reading.key, n);
      tabs.appendChild(tab);
    }
    block.appendChild(tabs);
    const views = node("div", "views");
    for (const view of ["summaries", "questions", "all"]) {
      const button = node("button", "viewbtn", t().views[view]);
      button.type = "button";
      button.classList.toggle("on", reading.key === state.reading && state.view === view);
      button.onclick = () => go(parasha.slug, reading.key, null, view);
      views.appendChild(button);
    }
    views.appendChild(rjsButton(parasha, "viewbtn rjsview"));
    views.appendChild(quizButton(parasha, "viewbtn quizview"));
    block.appendChild(views);
    host.appendChild(block);
  }
  const active = readings.find((r) => r.key === state.reading);
  if (state.view) renderWhole(active);
  else renderBrief(active);
}

/* ---------- Rabbi Sacks (RJS): summaries of his Covenant & Conversation essays ---------- */

const rjsFiles = new Map();  // slug -> fetch promise

function loadRjs(slug) {
  if (!rjsFiles.has(slug)) {
    rjsFiles.set(slug, fetch(`data/rjs/${slug}.json`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((error) => { rjsFiles.delete(slug); throw error; }));
  }
  return rjsFiles.get(slug);
}

/** The RJS button on a parasha card (and on the parasha page): opens his essays on it. */
function rjsButton(parasha, cls) {
  const button = node("button", cls, t().rjs);
  button.type = "button";
  button.title = `${t().rjsHint} — ${parashaName(parasha)}`;
  button.setAttribute("aria-label", button.title);
  button.classList.toggle("has", state.rjsDays.has(parasha.slug));
  button.onclick = () => openRjs(parasha.slug);
  return button;
}

function renderRjs() {
  const view = el("rjs");
  const parasha = state.rjs && findParasha(state.rjs);
  view.hidden = !parasha;
  if (!parasha) return;
  el("rjsBack").textContent = t().back;
  el("rjsTitle").textContent = t().rjsTitle(parashaName(parasha));
  el("rjsSub").textContent = t().rjsSub;
  const host = el("rjsBody");
  host.innerHTML = "";
  if (!state.rjsDays.has(parasha.slug)) { host.appendChild(node("p", "empty", t().rjsNotYet)); return; }

  const slot = node("div", "empty", t().loading);
  host.append(pdfTools(), slot);
  const lang = state.lang, wanted = parasha.slug;
  loadRjs(parasha.slug).then((record) => {
    if (state.lang !== lang || state.rjs !== wanted) return;
    const part = record[state.lang] || record.english;
    const wrap = node("div", "brief");
    if (part.overview) {
      const sum = box(t().rjsOverview, null, true);
      sum.details.dataset.pdf = t().rjsOverview;
      sum.body.appendChild(node("p", "sumPara", part.overview));
      wrap.appendChild(sum.details);
    }
    const list = part.essays || [];
    const essays = box(t().rjsEssays, list.length, true);
    essays.details.dataset.pdf = t().rjsEssays;
    const bar = node("div", "toolbar");
    const expand = node("button", null, t().openAll), collapse = node("button", null, t().closeAll);
    expand.type = collapse.type = "button";
    expand.onclick = () => essays.body.querySelectorAll("details.qitem").forEach((d) => { d.open = true; });
    collapse.onclick = () => essays.body.querySelectorAll("details.qitem").forEach((d) => { d.open = false; });
    bar.append(expand, collapse);
    essays.body.appendChild(bar);
    list.forEach((essay, i) => {
      const item = node("details", "qitem");
      const summary = node("summary");
      summary.append(node("span", "n", `${i + 1}.`), node("span", "ttl", essay.title));
      const body = node("div", "body");
      // a summary of the essay; the questions it asks; the building blocks of its idea, in
      // order; and where it lands (the last block). The questions and blocks each carry
      // Rabbi Sacks' own words (checked against Sefaria by scripts/rjs.py)
      const said = (item) => {
        const quote = node("q", "rjsquote", item.quote);
        quote.dir = "auto";
        return quote;
      };
      if (essay.summary) {
        body.appendChild(node("div", "label", t().rjsSummary));
        essay.summary.split(/\n\s*\n/).forEach((para) => body.appendChild(node("p", "sumPara", para)));
      }
      body.appendChild(node("div", "label", t().rjsQuestions));
      const questions = node("ul", "rjsqs");
      (essay.questions || []).forEach((q) => {
        const li = node("li", null, q.text);
        if (q.quote) li.append(" ", said(q));
        questions.appendChild(li);
      });
      body.appendChild(questions);
      body.appendChild(node("div", "label", t().rjsBlocks));
      const blocks = node("ol", "rjsblocks");
      const line = (b, text) => {
        const li = node("li", null, text);
        if (b.quote) { li.appendChild(document.createElement("br")); li.appendChild(said(b)); }
        return li;
      };
      const steps = essay.blocks || [];
      const landing = /^(Where it lands|המסקנה):\s*/;
      const last = steps[steps.length - 1];
      const lands = last && landing.test(last.text) ? last : null;
      (lands ? steps.slice(0, -1) : steps).forEach((b) => blocks.appendChild(line(b, b.text)));
      body.appendChild(blocks);
      if (lands) {
        body.appendChild(node("div", "label", t().rjsLands));
        const text = lands.text.replace(landing, "");
        const end = node("ul", "rjslands");
        end.appendChild(line(lands, text.charAt(0).toUpperCase() + text.slice(1)));
        body.appendChild(end);
      }
      body.appendChild(sefariaLink(t().rjsRead, essay.ref));
      item.append(summary, body);
      essays.body.appendChild(item);
    });
    wrap.appendChild(essays.details);
    wrap.appendChild(node("p", "credit", t().rjsCredit));
    slot.replaceWith(wrap);
  }).catch(() => { slot.textContent = t().loadFailed; });
}

function openRjs(slug) {
  state.parasha = state.reading = state.aliyah = state.view = null;
  state.rjs = slug;
  state.quiz = null;
  writeHash();
  render();
  window.scrollTo(0, 0);
}

/* ---------- quiz: multiple-choice questions on the parasha (scripts/quiz.py) ---------- */

// Scoring: 10 points for a right answer (5 if the hint was opened), +5 for every right answer
// that is the 3rd or more in a row.
const QUIZ_POINTS = 10, QUIZ_HINTED = 5, QUIZ_STREAK_BONUS = 5, QUIZ_STREAK_FROM = 3;
// A sefer quiz draws its questions from the parashiyot' question banks; these are the sizes offered.
const SEFER_SIZES = [10, 20, 30, 50, 100];
const SEFER_DEFAULT = 20;

const quizFiles = new Map();  // slug -> fetch promise
const quizRuns = new Map();   // quiz key -> this visit's run: {chosen: Map(i -> option), hinted: Set(i), questions?}
const seferSetups = new Map();// book en name -> {count, slugs: Set} last chosen on this visit

function loadQuiz(slug) {
  if (!quizFiles.has(slug)) {
    quizFiles.set(slug, fetch(`data/quiz/${slug}.json`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((error) => { quizFiles.delete(slug); throw error; }));
  }
  return quizFiles.get(slug);
}

/* a quiz key is a parasha slug, or "sefer:<Book>" for a quiz on a whole sefer */
const seferKey = (book) => `sefer:${book.en}`;
const seferOf = (key) => (key && key.startsWith("sefer:") ? state.books.find((b) => b.en === key.slice(6)) || null : null);
const quizParashot = (book) => book.parashot.filter((p) => state.quizDays.has(p.slug));

/* the best result on this device, per parasha (only a convenience: it may be missing) */
function quizBest(key) {
  try { return JSON.parse(localStorage.getItem(`quiz-best:${key}`)) || null; } catch { return null; }
}
function saveQuizBest(key, result) {
  try { localStorage.setItem(`quiz-best:${key}`, JSON.stringify(result)); } catch { /* not saved */ }
}

const calm = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const shuffled = (list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Draw `count` questions spread evenly over the parashiyot (in order), each tagged with its parasha. */
function drawSefer(banks, count) {
  const want = banks.map(() => 0);
  let left = Math.min(count, banks.reduce((s, b) => s + b.questions.length, 0));
  // deal one at a time, round-robin from a random start, to parashiyot that still have questions
  const order = shuffled(banks.map((_, i) => i));
  while (left > 0) {
    for (const i of order) {
      if (left > 0 && want[i] < banks[i].questions.length) { want[i]++; left--; }
    }
  }
  const out = [];
  banks.forEach((bank, i) => {
    const picks = shuffled(bank.questions.map((_, k) => k)).slice(0, want[i]).sort((x, y) => x - y);
    picks.forEach((k) => out.push({ ...bank.questions[k], parasha: bank.parasha }));
  });
  return out;
}

/** Score a run: points, right answers, current and longest streak, the questions missed. */
function quizTally(questions, run) {
  let points = 0, right = 0, streak = 0, longest = 0;
  const missed = [];
  questions.forEach((q, i) => {
    if (!run.chosen.has(i)) return;
    if (run.chosen.get(i) === q.a) {
      right++; streak++; longest = Math.max(longest, streak);
      points += run.hinted.has(i) ? QUIZ_HINTED : QUIZ_POINTS;
      if (streak >= QUIZ_STREAK_FROM) points += QUIZ_STREAK_BONUS;
    } else { streak = 0; missed.push(i); }
  });
  return { points, right, streak, longest, missed, done: run.chosen.size };
}

/** The quiz button on a parasha card (and on the parasha page). */
function quizButton(parasha, cls) {
  const best = state.quizDays.has(parasha.slug) ? quizBest(parasha.slug) : null;
  const button = node("button", cls, t().quiz);
  button.type = "button";
  button.title = `${t().quizHint} — ${parashaName(parasha)}` + (best ? ` · ${t().quizBest}: ${t().quizBestShort(best.right, best.total)}` : "");
  button.setAttribute("aria-label", button.title);
  button.classList.toggle("has", state.quizDays.has(parasha.slug));
  button.onclick = () => openQuiz(parasha.slug);
  return button;
}

/** a burst of confetti over the page */
function confetti() {
  if (calm()) return;
  const layer = node("div", "confetti");
  layer.setAttribute("aria-hidden", "true");
  const colors = ["#b8924a", "#16305c", "#2e7d4f", "#d0675c", "#6f93cf", "#e8c46a"];
  for (let n = 0; n < 90; n++) {
    const bit = node("i");
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[n % colors.length];
    bit.style.animationDelay = `${Math.random() * 0.6}s`;
    bit.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
    bit.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    bit.style.setProperty("--spin", `${(Math.random() - 0.5) * 1440}deg`);
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4600);
}

/** a short line that floats up from an element: "+15" */
function floatUp(anchor, text, cls) {
  if (calm()) return;
  const tag = node("span", `quizfloat ${cls || ""}`, text);
  tag.dir = "ltr";
  anchor.appendChild(tag);
  setTimeout(() => tag.remove(), 1300);
}

/** a banner under the score bar for a moment: "🔥 5 in a row!" */
function quizToast(host, text) {
  const old = host.querySelector(".quiztoast");
  if (old) old.remove();
  const toast = node("div", "quiztoast", text);
  toast.setAttribute("role", "status");
  host.appendChild(toast);
  setTimeout(() => toast.classList.add("out"), 1800);
  setTimeout(() => toast.remove(), 2400);
}

function renderQuiz() {
  const view = el("quiz");
  const book = seferOf(state.quiz);
  const parasha = !book && state.quiz && findParasha(state.quiz);
  view.hidden = !(book || parasha);
  if (!book && !parasha) { document.querySelectorAll(".confetti").forEach((layer) => layer.remove()); return; }
  el("quizBack").textContent = t().back;
  const host = el("quizBody");
  host.innerHTML = "";

  if (book) {
    const name = state.lang === "hebrew" ? book.he : book.en;
    el("quizTitle").textContent = t().seferTitle(name);
    el("quizSub").textContent = t().seferSub;
    const run = quizRuns.get(state.quiz);
    if (run && run.questions) renderQuizRun(host, state.quiz, run.questions, { sefer: book });
    else renderSeferSetup(host, book);
    return;
  }

  el("quizTitle").textContent = t().quizTitle(parashaName(parasha));
  el("quizSub").textContent = `${t().quizSub} · ${rangeLabel(parasha.ref)}`;
  if (!state.quizDays.has(parasha.slug)) { host.appendChild(node("p", "empty", t().quizNotYet)); return; }
  const slot = node("div", "empty", t().loading);
  host.appendChild(slot);
  const lang = state.lang, wanted = parasha.slug;
  loadQuiz(parasha.slug).then((record) => {
    if (state.lang !== lang || state.quiz !== wanted) return;
    const box = node("div");
    slot.replaceWith(box);
    renderQuizRun(box, wanted, record.questions || [], {});
  }).catch(() => { slot.textContent = t().loadFailed; });
}

/** The sefer quiz's first screen: how many questions, and from which parashiyot. */
function renderSeferSetup(host, book) {
  const ui = t();
  const key = seferKey(book);
  const available = quizParashot(book);
  if (!available.length) { host.appendChild(node("p", "empty", ui.seferNone)); return; }
  if (!seferSetups.has(book.en)) seferSetups.set(book.en, { count: SEFER_DEFAULT, slugs: new Set(available.map((p) => p.slug)) });
  const setup = seferSetups.get(book.en);
  // a parasha whose quiz was published since: include it
  setup.slugs = new Set([...setup.slugs].filter((s) => available.some((p) => p.slug === s)));

  const form = node("div", "sefersetup");
  if (ui.quizNote) form.appendChild(node("p", "muted", ui.quizNote));
  form.appendChild(node("p", "quizintro", ui.quizRules(QUIZ_POINTS, QUIZ_STREAK_FROM, QUIZ_STREAK_BONUS)));

  // how many questions
  form.appendChild(node("div", "label", ui.seferHowMany));
  const sizes = node("div", "sefersizes");
  const input = node("input");
  input.type = "number";
  input.min = "1";
  input.inputMode = "numeric";
  input.setAttribute("aria-label", ui.seferHowMany);
  const sizeButtons = [];
  // questions in each parasha's bank (25 until the files load and give the real count)
  const counts = new Map();
  const bankSize = () => available.filter((p) => setup.slugs.has(p.slug)).reduce((n, p) => n + (counts.get(p.slug) ?? 25), 0);
  const syncSizes = () => {
    sizeButtons.forEach((b) => b.classList.toggle("on", Number(b.dataset.n) === setup.count));
    if (Number(input.value) !== setup.count) input.value = String(setup.count);
  };
  for (const n of SEFER_SIZES) {
    const b = node("button", "chip", String(n));
    b.type = "button";
    b.dataset.n = n;
    b.onclick = () => { setup.count = n; syncSizes(); refresh(); };
    sizeButtons.push(b);
    sizes.appendChild(b);
  }
  input.oninput = () => { const n = Math.floor(Number(input.value)); if (n > 0) { setup.count = n; syncSizes(); refresh(); } };
  sizes.appendChild(input);
  form.appendChild(sizes);

  // from which parashiyot
  const head = node("div", "label sefershead");
  head.appendChild(node("span", null, ui.seferFrom));
  const all = node("button", "linkish", ui.seferAll);
  all.type = "button";
  const none = node("button", "linkish", ui.seferNoneBtn);
  none.type = "button";
  head.append(all, none);
  form.appendChild(head);
  const chips = node("div", "seferparashot");
  const chipButtons = available.map((p) => {
    const b = node("button", "chip", parashaName(p));
    b.type = "button";
    b.onclick = () => { setup.slugs.has(p.slug) ? setup.slugs.delete(p.slug) : setup.slugs.add(p.slug); refresh(); };
    chips.appendChild(b);
    return [p, b];
  });
  all.onclick = () => { setup.slugs = new Set(available.map((p) => p.slug)); refresh(); };
  none.onclick = () => { setup.slugs = new Set(); refresh(); };
  form.appendChild(chips);
  const missing = book.parashot.length - available.length;
  if (missing) form.appendChild(node("p", "muted small", ui.seferPartial(available.length, book.parashot.length)));

  const note = node("p", "sefernote");
  const start = node("button", "button", ui.seferStart);
  start.type = "button";
  const refresh = () => {
    chipButtons.forEach(([p, b]) => b.classList.toggle("on", setup.slugs.has(p.slug)));
    const max = bankSize();
    const n = Math.min(setup.count, max);
    start.disabled = !max;
    note.textContent = !max ? ui.seferPick : ui.seferWillDraw(n, setup.slugs.size, max);
  };
  form.append(note, start);
  host.appendChild(form);
  syncSizes();
  refresh();
  available.forEach((p) => loadQuiz(p.slug).then((r) => { counts.set(p.slug, (r.questions || []).length); if (start.isConnected) refresh(); }).catch(() => {}));

  const best = quizBest(`${key}:${setup.count}`);
  if (best) form.insertBefore(node("p", "quizbestline", `${ui.quizBest} (${setup.count}): ${ui.quizBestShort(best.right, best.total)} · ${ui.quizPoints(best.points)}`), note);

  start.onclick = () => {
    const chosen = available.filter((p) => setup.slugs.has(p.slug));
    if (!chosen.length) return;
    start.disabled = true;
    note.textContent = ui.loading;
    const wanted = state.quiz;
    Promise.all(chosen.map((p) => loadQuiz(p.slug).then((r) => ({ parasha: p, questions: r.questions || [] }))))
      .then((banks) => {
        if (state.quiz !== wanted) return;
        const questions = drawSefer(banks, setup.count);
        quizRuns.set(key, { chosen: new Map(), hinted: new Set(), questions, size: setup.count });
        renderQuiz();
        window.scrollTo(0, 0);
      })
      .catch(() => { note.textContent = ui.loadFailed; start.disabled = false; });
  };
}

/** One quiz, question after question, with the score bar and the results card. */
function renderQuizRun(host, key, questions, { sefer }) {
  if (!quizRuns.has(key)) quizRuns.set(key, { chosen: new Map(), hinted: new Set() });
  const run = quizRuns.get(key);
  const total = questions.length;
  const bestKey = sefer ? `${key}:${run.size}` : key;
  const ui = t();
  const wrap = node("div", "quizwrap");
  if (ui.quizNote) wrap.appendChild(node("p", "muted", ui.quizNote));

  // how it scores, and the best so far on this device
  const intro = node("div", "quizintro");
  intro.appendChild(node("p", null, ui.quizRules(QUIZ_POINTS, QUIZ_STREAK_FROM, QUIZ_STREAK_BONUS)));
  const best = quizBest(bestKey);
  if (best) intro.appendChild(node("p", "quizbestline", `${ui.quizBest}: ${ui.quizBestShort(best.right, best.total)} · ${ui.quizPoints(best.points)}`));
  wrap.appendChild(intro);

  // the score bar: progress, points, streak
  const bar = node("div", "quizbar");
  const stats = node("div", "quizstats");
  const pointsBox = node("span", "quizpts");
  const streakBox = node("span", "quizstreak");
  const countBox = node("span", "quizcount");
  stats.append(pointsBox, streakBox, countBox);
  const restart = () => { quizRuns.delete(key); renderQuiz(); window.scrollTo(0, 0); };
  const reset = node("button", null, sefer ? ui.seferChange : ui.quizReset);
  reset.type = "button";
  reset.onclick = restart;
  const track = node("div", "quizprogress");
  const fill = node("div", "fill");
  track.appendChild(fill);
  bar.append(stats, reset, track);
  wrap.appendChild(bar);

  const list = node("ol", "quizlist");
  list.dir = "rtl";
  list.lang = "he";
  const items = [];
  const results = node("div", "quizresults");
  results.hidden = true;

  const update = () => {
    const tally = quizTally(questions, run);
    pointsBox.textContent = ui.quizPoints(tally.points);
    streakBox.textContent = tally.streak >= 2 ? `🔥 ${tally.streak}` : "";
    streakBox.classList.toggle("hot", tally.streak >= QUIZ_STREAK_FROM);
    countBox.textContent = ui.quizCount(tally.right, tally.done, total);
    fill.style.width = `${(tally.done / total) * 100}%`;
    return tally;
  };

  const finish = (fresh) => {
    const tally = quizTally(questions, run);
    const prior = quizBest(bestKey);
    const record = !prior || tally.points > prior.points;
    if (fresh && record) saveQuizBest(bestKey, { right: tally.right, total, points: tally.points });
    results.innerHTML = "";
    results.hidden = false;
    results.appendChild(node("h3", null, ui.quizRank(tally.right, total, !!sefer)));
    results.appendChild(node("p", "quizfinal", `${ui.quizBestShort(tally.right, total)} · ${ui.quizPoints(tally.points)}`));
    const facts = node("p", "quizfacts");
    facts.textContent = ui.quizLongest(tally.longest);
    results.appendChild(facts);
    if (fresh && record && prior) results.appendChild(node("p", "quizrecord", ui.quizNewBest));
    else if (prior && !record) results.appendChild(node("p", "muted", `${ui.quizBest}: ${ui.quizPoints(prior.points)}`));
    if (tally.missed.length) {
      const again = node("div", "quizmissed");
      again.appendChild(node("span", null, ui.quizReview));
      tally.missed.forEach((i) => {
        const b = node("button", null, String(i + 1));
        b.type = "button";
        b.onclick = () => items[i].scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" });
        again.appendChild(b);
      });
      results.appendChild(again);
    }
    const replay = node("button", "button", sefer ? ui.seferAgain : ui.quizAgain);
    replay.type = "button";
    // a sefer quiz plays again with a fresh draw of the same size from the same parashiyot
    replay.onclick = sefer ? () => {
      const setup = seferSetups.get(sefer.en);
      const chosen = quizParashot(sefer).filter((p) => !setup || setup.slugs.has(p.slug));
      Promise.all(chosen.map((p) => loadQuiz(p.slug).then((r) => ({ parasha: p, questions: r.questions || [] }))))
        .then((banks) => {
          quizRuns.set(key, { chosen: new Map(), hinted: new Set(), questions: drawSefer(banks, run.size), size: run.size });
          renderQuiz();
          window.scrollTo(0, 0);
        });
    } : restart;
    results.appendChild(replay);
    if (sefer) {
      const change = node("button", "button ghost", ui.seferChange);
      change.type = "button";
      change.onclick = restart;
      results.appendChild(change);
    }
    if (fresh) {
      if (tally.right / total >= 0.7) confetti();
      setTimeout(() => results.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" }), 350);
    }
  };

  questions.forEach((q, i) => {
    const li = node("li", "quizq");
    items.push(li);
    if (q.parasha) li.appendChild(node("span", "quiztag", `פרשת ${q.parasha.he}`));
    li.appendChild(node("p", "quizprompt", q.q));
    const opts = node("div", "quizopts");
    const after = node("div", "quizafter");
    const buttons = q.o.map((text, k) => {
      const b = node("button", "quizopt", text);
      b.type = "button";
      b.onclick = () => {
        if (run.chosen.has(i)) return;
        run.chosen.set(i, k);
        show(true);
        const tally = update();
        if (k === q.a) {
          let gained = run.hinted.has(i) ? QUIZ_HINTED : QUIZ_POINTS;
          if (tally.streak >= QUIZ_STREAK_FROM) gained += QUIZ_STREAK_BONUS;
          floatUp(b, `+${gained}`, "good");
          if (tally.streak === total || [3, 5, 10, 15, 20, 25, 50].includes(tally.streak)) quizToast(bar, ui.quizStreakToast(tally.streak, total));
        }
        if (tally.done === total) finish(true);
      };
      opts.appendChild(b);
      return b;
    });
    let hint = null;
    if (q.h) {
      hint = node("button", "quizhint", ui.quizHintBtn(QUIZ_HINTED));
      hint.type = "button";
      hint.onclick = () => { run.hinted.add(i); hint.replaceWith(node("p", "quizhinttext", q.h)); };
    }
    const show = (fresh) => {
      const pick = run.chosen.get(i);
      const good = pick === q.a;
      buttons.forEach((b, k) => {
        b.disabled = true;
        b.classList.toggle("right", k === q.a);
        b.classList.toggle("wrong", k === pick && !good);
      });
      li.classList.add(good ? "got" : "missed");
      if (fresh && !calm()) {
        li.classList.add(good ? "pop" : "shake");
        setTimeout(() => li.classList.remove("pop", "shake"), 600);
      }
      if (hint && hint.isConnected) hint.remove();
      after.innerHTML = "";
      const verdict = node("p", "quizverdict " + (good ? "ok" : "no"));
      verdict.appendChild(node("b", null, good ? ui.quizRight[i % ui.quizRight.length] : ui.quizWrong[i % ui.quizWrong.length]));
      verdict.append(" ", q.e);
      after.appendChild(verdict);
      const ref = node("p", "quizref");
      ref.appendChild(sefariaLink(`${rangeLabel(q.ref)} — ${ui.quizPasuk}`, q.ref));
      after.appendChild(ref);
    };
    li.appendChild(opts);
    if (hint) li.appendChild(hint);
    li.appendChild(after);
    if (run.chosen.has(i)) show(false);
    list.appendChild(li);
  });
  wrap.append(list, results);
  const tally = update();
  if (tally.done === total) finish(false);
  host.appendChild(wrap);
}

function openQuiz(key) {
  state.parasha = state.reading = state.aliyah = state.view = null;
  state.rjs = null;
  state.quiz = key;
  writeHash();
  render();
  window.scrollTo(0, 0);
}

function render() {
  const ui = t();
  // full screen belongs to one aliyah: anywhere else, the page comes back
  if (!(state.parasha && state.aliyah) && document.body.classList.contains("fullread")) setFullRead(false);
  document.documentElement.lang = state.lang === "hebrew" ? "he" : "en";
  document.documentElement.dir = ui.dir;
  document.title = ui.docTitle;
  el("title").textContent = ui.title;
  el("subtitle").textContent = ui.subtitle;
  document.querySelectorAll(".langswitch button").forEach((b) =>
    b.classList.toggle("on", b.dataset.lang === state.lang));
  renderLatest();
  renderParasha();
  renderRjs();
  renderQuiz();
  renderBooks();
}

/* ---------- navigation (all state lives in the hash, so links can be shared) ---------- */

let selfWrite = "";

function writeHash() {
  const params = new URLSearchParams();
  params.set("lang", state.lang);
  if (state.parasha) params.set("p", state.parasha);
  if (state.reading && state.reading !== state.parasha) params.set("r", state.reading);
  if (state.aliyah) params.set("a", state.aliyah);
  if (state.view) params.set("v", state.view);
  if (state.rjs) params.set("rjs", state.rjs);
  if (state.quiz) params.set("quiz", state.quiz);
  selfWrite = `#${params}`;
  history.replaceState(null, "", selfWrite);
}

function go(parasha, reading, aliyah, view = null) {
  const moved = parasha !== state.parasha;
  state.parasha = parasha;
  state.reading = reading;
  state.aliyah = aliyah;
  state.view = view;
  state.rjs = null;
  state.quiz = null;
  writeHash();
  render();
  if (moved) window.scrollTo(0, 0);
}

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  state.lang = params.get("lang") === "english" ? "english" : "hebrew";
  state.parasha = findParasha(params.get("p")) ? params.get("p") : null;
  state.reading = params.get("r") || state.parasha;
  state.aliyah = Number(params.get("a")) || null;
  state.view = ["summaries", "questions", "all"].includes(params.get("v")) ? params.get("v") : null;
  if (state.view) state.aliyah = null;
  state.rjs = !state.parasha && findParasha(params.get("rjs")) ? params.get("rjs") : null;
  const quiz = params.get("quiz");
  state.quiz = !state.parasha && !state.rjs && (findParasha(quiz) || seferOf(quiz)) ? quiz : null;
  render();
}

window.addEventListener("hashchange", () => { if (location.hash !== selfWrite) readHash(); });

document.querySelectorAll(".langswitch button").forEach((button) => {
  button.onclick = () => { state.lang = button.dataset.lang; writeHash(); render(); };
});
el("back").onclick = () => go(null, null, null);
el("rjsBack").onclick = () => go(null, null, null);
el("quizBack").onclick = () => go(null, null, null);
document.querySelector(".brand").onclick = (event) => { event.preventDefault(); go(null, null, null); };

load().then(readHash);
