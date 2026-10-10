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
  const m = ref.match(/^(.+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/);
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
  const [parashot, index] = await Promise.all([
    get("data/parashot.json", { books: [] }), get("data/aliyot/index.json", { days: [] })]);
  state.books = parashot.books;
  state.days = index.days;
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
    body.appendChild(node("div", "label", t().askedBy));
    q.asked_by.forEach((who) => body.appendChild(cite(who)));
  }
  (q.answers || []).forEach((answer, n) => {
    const block = node("div", "answer");
    block.appendChild(node("div", "label", t().answerN(n)));
    const text = node("p", null, answer.text);
    if (answer.synthesis) text.appendChild(node("span", "synth", ` — ${t().synthesis}`));
    block.appendChild(text);
    (answer.sources || []).forEach((who) => block.appendChild(cite(who)));
    body.appendChild(block);
  });
  if (q.why) body.appendChild(node("p", "why", `${t().whyMatters}: ${q.why}`));

  details.append(summary, body);
  return details;
}

function briefBody(record, { summary = true, questions = true } = {}) {
  const brief = record[state.lang] || record.english || record.hebrew;
  const wrap = node("div", "brief");
  if (summary && brief.summary) {
    const sum = box(t().summaryTitle, null, true);
    sum.details.dataset.pdf = t().summaryTitle;
    sum.body.appendChild(node("p", "sumPara", brief.summary));
    wrap.appendChild(sum.details);
  }
  if (!questions) return wrap;

  const list = brief.questions || [];
  const qs = box(t().questionsTitle, list.length, true);
  qs.details.dataset.pdf = t().questionsTitle;
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

function renderBrief(reading) {
  const host = el("brief");
  host.innerHTML = "";
  if (!state.aliyah) { host.appendChild(node("p", "empty", t().choose)); return; }

  const day = reading.days.get(state.aliyah);
  const range = reading.aliyot[state.aliyah - 1];
  const card = node("article", "briefcard");
  card.appendChild(pdfHead(node("h3", null, `${t().aliyot[state.aliyah - 1]}${range ? ` — ${rangeLabel(range)}` : ""}`)));
  host.appendChild(card);

  if (!day) { card.appendChild(node("p", "empty", t().notYet)); return; }

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
    card.insertBefore(meta, slot);
    if (record.note && state.lang === "english") card.insertBefore(node("p", "note", record.note), slot);
    slot.replaceWith(briefBody(record));
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
  if (state.parasha) return;
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
  host.hidden = !!state.parasha;
  if (state.parasha) return;

  for (const book of state.books) {
    const section = node("div", "book");
    section.appendChild(node("h3", null, state.lang === "hebrew" ? `ספר ${book.he}` : book.en));
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
      grid.appendChild(tile);
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
    block.appendChild(views);
    host.appendChild(block);
  }
  const active = readings.find((r) => r.key === state.reading);
  if (state.view) renderWhole(active);
  else renderBrief(active);
}

function render() {
  const ui = t();
  document.documentElement.lang = state.lang === "hebrew" ? "he" : "en";
  document.documentElement.dir = ui.dir;
  document.title = ui.docTitle;
  el("title").textContent = ui.title;
  el("subtitle").textContent = ui.subtitle;
  document.querySelectorAll(".langswitch button").forEach((b) =>
    b.classList.toggle("on", b.dataset.lang === state.lang));
  renderLatest();
  renderParasha();
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
  selfWrite = `#${params}`;
  history.replaceState(null, "", selfWrite);
}

function go(parasha, reading, aliyah, view = null) {
  const moved = parasha !== state.parasha;
  state.parasha = parasha;
  state.reading = reading;
  state.aliyah = aliyah;
  state.view = view;
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
  render();
}

window.addEventListener("hashchange", () => { if (location.hash !== selfWrite) readHash(); });

document.querySelectorAll(".langswitch button").forEach((button) => {
  button.onclick = () => { state.lang = button.dataset.lang; writeHash(); render(); };
});
el("back").onclick = () => go(null, null, null);
document.querySelector(".brand").onclick = (event) => { event.preventDefault(); go(null, null, null); };

load().then(readHash);
