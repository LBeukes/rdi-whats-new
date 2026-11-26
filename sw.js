/* RDI Iris hub service worker.
   Lives at the site root so it can serve the hub AND the RDI page loaded in the hub's iframe.
   Bump VERSION on every deploy so the new precache rolls out and old caches are removed. */
const VERSION = "yt-hub-v14-2026-11-26";
const CACHE = VERSION;
const BASE = new URL("./", self.location).href;          // e.g. https://<user>.github.io/rdi-whats-new/
const PRECACHE = [
  "hub/", "hub/index.html", "hub/manifest.webmanifest",
  "hub/icons/icon-192.png", "hub/icons/icon-512.png", "hub/icons/icon-maskable-192.png", "hub/icons/icon-maskable-512.png",
  "hub/icons/apple-touch-icon.png", "hub/icons/favicon-32.png", "hub/icons/favicon.svg",
  "", "index.html",
  "assets/yt-template.css",
  "assets/yellotec-logo-landscape-black.svg", "assets/yellotec-logo-landscape-white.svg",
  "assets/rdi-technologies-logo.svg"
].map(function (p) { return BASE + p; });

// Paths retired from this site. Never precache, never cache, never serve from cache.
const REMOVED_PREFIXES = [
  "flir-selector/",
  "fluke-cm/",
  "atten2/",
  "shim-builder/",
  "training/"
];
const REMOVED_FILES = [
  "02_flir_recommend.png",
  "03_flir_browse_all.png",
  "04_flir_fov_generic.png",
  "05_flir_fov_upload.png",
  "TEMPLATE.md",
  "assets/atten2-logo.svg",
  "assets/fluke-logo.svg",
  "assets/teledyne-flir-logo-horizontal.svg",
  "assets/budget-engineering-logo.png"
];

function relPath(url) {
  var href = url.href;
  if (!href.startsWith(BASE)) return null;
  return href.slice(BASE.length).split("?")[0].split("#")[0];
}
function isRemoved(url) {
  var rel = relPath(url);
  if (!rel) return false;
  if (REMOVED_FILES.indexOf(rel) >= 0) return true;
  for (var i = 0; i < REMOVED_PREFIXES.length; i++) {
    if (rel.indexOf(REMOVED_PREFIXES[i]) === 0) return true;
  }
  return false;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(PRECACHE.map(function (u) { return new Request(u, { cache: "reload" }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf("yt-hub-") === 0 && k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isHtml(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").indexOf("text/html") >= 0;
}
function cacheMatch(req) {
  return caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      var u = new URL(req.url); u.search = ""; u.hash = "";
      if (u.pathname.endsWith("/")) return c.match(u.href + "index.html");
      if (u.pathname.endsWith("/index.html")) return c.match(u.href.replace(/index\.html$/, ""));
      return undefined;
    });
  });
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || !req.url.startsWith(BASE)) return;   // leave OEM links, mailto etc. alone

  // Retired product pages and assets: always hit the network (404) and never use or write the cache.
  if (isRemoved(url)) {
    event.respondWith(fetch(req));
    return;
  }

  if (isHtml(req)) {
    // Network-first for pages: fresh content when online, cached copy when offline.
    if (self.navigator && self.navigator.onLine === false) {
      event.respondWith(cacheMatch(req).then(function (hit) { return hit || cacheMatch(new Request(BASE + "hub/")); }));
      return;
    }
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone(); var key = new URL(req.url); key.search = ""; key.hash = "";
          caches.open(CACHE).then(function (c) { c.put(key.href, copy); });
        }
        return res;
      }).catch(function () {
        return cacheMatch(req).then(function (hit) { return hit || cacheMatch(new Request(BASE + "hub/")); });
      })
    );
    return;
  }
  // Cache-first for static assets (CSS, SVG, PNG, manifest).
  event.respondWith(
    cacheMatch(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
