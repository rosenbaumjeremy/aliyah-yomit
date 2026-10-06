"use strict";

/* Daily Aliyah: browse the 54 parashiyot, pick an aliyah, read the questions
   of the Rishonim and Achronim on it. The briefs are filed every morning by
   the daily routine (scripts/add_brief.py) into data/aliyot/. */

const UI = {
  hebrew: {
    dir: "rtl",
    title: "עלייה יומית",
    subtitle: "שאלות הראשונים והאחרונים על העלייה היומית",
    docTitle: "עלייה יומית — שאלות הראשונים והאחרונים",
    latest: "העלייה האחרונה",
    open: "לשאלות",
    back: "→ כל הפרשות",
    noBriefs: "עדיין לא פורסמו שאלות. הראשונות יופיעו מחר בבוקר בשעה 6:00.",
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
    synthesis: "סינתזה שלנו",
    consulted: "מקורות שנבדקו",
    rishon: "ראשון",
    acharon: "אחרון",
    aliyot: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"],
  },
  english: {
    dir: "ltr",
    title: "Daily Aliyah",
    subtitle: "Questions of the Rishonim & Achronim on each day's aliyah",
    docTitle: "Daily Aliyah — Questions of the Rishonim & Achronim",
    latest: "Latest aliyah",
    open: "Open the questions",
    back: "← All parashiyot",
    noBriefs: "No questions published yet. The first ones arrive tomorrow at 6:00 AM Israel time.",
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
    synthesis: "our synthesis",
    consulted: "Sources consulted",
    rishon: "Rishon",
    acharon: "Acharon",
    aliyot: ["Rishon", "Sheni", "Shlishi", "Revi'i", "Chamishi", "Shishi", "Shevi'i"],
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

/** The source's own words, as quoted in the brief (and checked against Sefaria). */
function sourceQuote(text) {
  const quote = node("q", "srcquote", text);
  quote.dir = "rtl";
  quote.lang = "he";
  return quote;
}

function briefBody(record) {
  const brief = record[state.lang] || record.english || record.hebrew;
  const wrap = node("div", "brief");
  if (brief.summary) wrap.appendChild(node("p", "briefSummary", brief.summary));

  const list = node("ol", "qlist");
  for (const q of brief.questions || []) {
    const item = node("li", "q");
    item.appendChild(node("h4", null, q.title));

    if (q.pasuk) {
      const line = node("p");
      line.appendChild(node("span", "qlabel", `${t().pasuk}: `));
      const quote = node("span", "pasuk", q.pasuk.text);
      quote.dir = "rtl";
      quote.lang = "he";
      line.append(quote, " ");
      if (q.pasuk.ref) line.appendChild(sefariaLink(`(${q.pasuk.label || q.pasuk.ref})`, q.pasuk.ref));
      item.appendChild(line);
    }

    item.appendChild(node("p", null, q.question));

    if (q.asked_by && q.asked_by.length) {
      const asked = node("p");
      asked.appendChild(node("span", "qlabel", `${t().askedBy}: `));
      q.asked_by.forEach((who, i) => {
        if (i) asked.append(", ");
        asked.appendChild(who.ref ? sefariaLink(who.name, who.ref) : node("span", null, who.name));
        if (who.era) asked.append(` (${t()[who.era] || who.era})`);
      });
      item.appendChild(asked);
      for (const who of q.asked_by) if (who.quote) item.appendChild(sourceQuote(who.quote));
    }

    if (q.answers && q.answers.length) {
      item.appendChild(node("p", "qlabel", t().answers));
      const answers = node("ul", "answers");
      for (const answer of q.answers) {
        const li = node("li", null, answer.text);
        if (answer.synthesis) li.appendChild(node("span", "synth", ` — ${t().synthesis}`));
        for (const source of answer.sources || []) {
          li.append(" ");
          li.appendChild(source.ref ? sefariaLink(source.name, source.ref) : node("span", null, source.name));
          if (source.quote) li.appendChild(sourceQuote(source.quote));
        }
        answers.appendChild(li);
      }
      item.appendChild(answers);
    }

    if (q.why) {
      const why = node("p", "why");
      why.appendChild(node("span", "qlabel", `${t().whyMatters}: `));
      why.append(q.why);
      item.appendChild(why);
    }
    list.appendChild(item);
  }
  wrap.appendChild(list);

  if (brief.sources_consulted && brief.sources_consulted.length)
    wrap.appendChild(node("p", "consulted", `${t().consulted}: ${brief.sources_consulted.join(", ")}`));
  return wrap;
}

function renderBrief(reading) {
  const host = el("brief");
  host.innerHTML = "";
  if (!state.aliyah) { host.appendChild(node("p", "empty", t().choose)); return; }

  const day = reading.days.get(state.aliyah);
  const range = reading.aliyot[state.aliyah - 1];
  const card = node("article", "briefcard");
  card.appendChild(node("h3", null, `${t().aliyot[state.aliyah - 1]}${range ? ` — ${rangeLabel(range)}` : ""}`));
  host.appendChild(card);

  if (!day) { card.appendChild(node("p", "empty", t().notYet)); return; }

  const slot = node("div", "empty", t().loading);
  card.appendChild(slot);
  const lang = state.lang;
  const wanted = `${state.parasha}|${reading.key}|${state.aliyah}`;
  loadBrief(day.date).then((record) => {
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
    host.appendChild(block);
  }
  renderBrief(readings.find((r) => r.key === state.reading));
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
  selfWrite = `#${params}`;
  history.replaceState(null, "", selfWrite);
}

function go(parasha, reading, aliyah) {
  const moved = parasha !== state.parasha;
  state.parasha = parasha;
  state.reading = reading;
  state.aliyah = aliyah;
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
  render();
}

window.addEventListener("hashchange", () => { if (location.hash !== selfWrite) readHash(); });

document.querySelectorAll(".langswitch button").forEach((button) => {
  button.onclick = () => { state.lang = button.dataset.lang; writeHash(); render(); };
});
el("back").onclick = () => go(null, null, null);
document.querySelector(".brand").onclick = (event) => { event.preventDefault(); go(null, null, null); };

load().then(readHash);
