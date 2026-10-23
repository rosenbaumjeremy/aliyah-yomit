"use strict";
// Offline copy of the site. The first online visit saves it on the device, along with every
// published day; later online visits add the new days. Online, files still come from the
// network first (up to 4s), so updates show up; the saved copy is the fallback.
const CACHE = "site-v4";
const SHELL = ["./", "app.css", "app.js", "apple-touch-icon.png", "icon-home.svg", "icon.svg", "index.html", "mail.css", "mail.js", "offline.js", "pdf.css", "pdf.js", "share.css", "share.js", "data/parashot.json"];
const DAYS = [["data/aliyot/index.json", d => [`data/aliyot/${d.file || d.date}.json`, ...chapters(d.range)]],
              ["data/rjs/index.json", d => [`data/rjs/${d.slug}.json`]]];  // [day index, its days -> file paths]

// "Genesis 15:7-17:6" -> the text of its chapters, data/text/Genesis.15.json .. Genesis.17.json
function chapters(range) {
  const m = (range || "").match(/^(.+?) (\d+):\d+(?:-(?:(\d+):)?\d+)?$/);
  if (!m) return [];
  const paths = [];
  for (let c = Number(m[2]); c <= Number(m[3] || m[2]); c++) paths.push(`data/text/${m[1]}.${c}.json`);
  return paths;
}

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()).then(saveDays));
});
// the page asks for this on every online visit (offline.js)
self.addEventListener("message", e => { if (e.data === "sync") e.waitUntil(saveDays()); });

// Save each published day not yet on the device.
async function saveDays() {
  const c = await caches.open(CACHE);
  for (const [index, file] of DAYS) {
    try {
      const res = await fetch(index, { cache: "no-store" });
      if (!res.ok) continue;
      await c.put(index, res.clone());
      for (const d of (await res.json()).days || []) {
        for (const path of file(d)) {
          if (await c.match(path)) continue;
          const day = await fetch(path);
          if (day.ok) await c.put(path, day);
        }
      }
    } catch (err) { /* offline or a bad day file: try again next visit */ }
  }
}

// Network first, but give up after a few seconds (a weak signal shouldn't stall the page).
function fresh(req) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("slow")), 4000);
    fetch(req).then(res => {
      clearTimeout(t);
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      resolve(res);
    }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fresh(req).catch(() =>
    caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html"))));
});
