# Yellotec Product-Selector Template

Shared stylesheet: `assets/yt-template.css`. Pages in sub-folders link it with `../assets/yt-template.css`; the root page uses `assets/yt-template.css`. Everything runs in the browser: no build step and no server code.

Reference implementations:
- `index.html` (RDI Iris "what's new")
- `flir-selector/index.html` (FLIR camera selector)

## Brand rules (mandatory)

| # | Rule |
|---|------|
| 1 | **Dark background means white text.** Wherever the background is black or near-black (wheel segments, results banner, tags, dark FOV panels, canvas/SVG labels), text is `#FFFFFF`. Yellow `#FFD100` and orange `#FF6600` are only used as accents: borders, rings, dots, strokes, frame lines, and buttons that carry **black** text. |
| 2 | **Yellotec landscape logo sits top-left** in `.yt-header` (`assets/yellotec-logo-landscape-black.svg` on a white header; use `yellotec-logo-landscape-white.svg` on a dark header). |
| 3 | **Partner (OEM) logo sits top-right** in `.yt-partner`, downloaded from the OEM's official site into `assets/`. No home-made text badges. |
| 4 | **The application selector on Browse-style views is a dropdown below the wheel** (`.wheel-dropdown`). Include an **All** option that lists every product sorted smallest to largest, with a visible `.sort-label` that states the sort basis. |
| 5 | **Every notes box (caveats or explanations) uses `.yt-note` with a Hide/Show button, hidden by default.** |
| 6 | Views that need a single "mode" choice use a segmented control (`.yt-seg`) and show **only** the chosen view. |
| 7 | **All OEM data comes from the OEM's website or datasheets.** Flag anything the OEM doesn't publish ("Not published", "estimated"). Never invent figures. Link the source for each product. |
| 8 | When a product was checked against yellotec.co.za and isn't listed there, add the small grey tag `.yt-notlisted`: "Not listed on yellotec.co.za, ask sales". If you're unsure, don't tag it. |

Palette: `#FFD100` yellow, `#FF6600` orange, `#000` black, `#FFF` white, plus greys (`#F2F2F2`, `#E4E4E4`, `#6B6B6B`, `#3F3F3F`). Font: Arial. **No blue.**

## Page skeleton

```html
<link rel="stylesheet" href="../assets/yt-template.css"/>
<div class="topbar"></div>
<header class="yt-header">
  <img class="yt-logo" src="../assets/yellotec-logo-landscape-black.svg" alt="Yellotec"/>
  <div class="titles"><h1>Title</h1><p class="sub">Subtitle</p></div>
  <div class="yt-partner"><img src="../assets/<oem>-logo.svg" alt="OEM"/><small>Yellotec · OEM partner</small></div>
</header>
<nav class="tabs"> <button class="tab is-on">Recommend</button> … </nav>   <!-- optional -->
<main class="wrap" id="mainWrap">            <!-- add .two-col to hide .col-apps -->
  <section class="panel">  wheel (.lens-svg) + .clear-btn + .wheel-dropdown </section>
  <section class="panel col-apps"> application list (optional column) </section>
  <section class="panel"> <div class="results-head"><p class="count"></p><p class="hint"></p></div> results … <a class="cta">Ask Yellotec<small>sales@yellotec.com</small></a></section>
</main>
<footer class="footer"><span>Source statement</span><span>Yellotec</span></footer>
<div class="bottombar"></div>
```

## Components

| Component | Class(es) | Notes |
|---|---|---|
| Header | `.yt-header`, `.yt-logo`, `.titles`, `.yt-partner` | Yellotec logo on the left, OEM logo on the right; the titles block has a yellow left rule. |
| Tabs | `.tabs`, `.tab`, `.tab.is-on` | The active tab is yellow with black text. |
| Layout | `.wrap` (3 columns), `.wrap.two-col` (wheel + results) | `.col-apps` is hidden in two-column mode. |
| Lens wheel | `.lens-svg`, `.seg`, `.seg-label`, `.seg-sub`, `.lens-ring`, `.lens-hub`, `.lens-hub-i` | Segments are #1a1a1a with a yellow stroke; the selected segment gets an orange stroke. **Labels are white.** The wedge maths (`polar`, `wedgePath`, `labelPos`) is copied as-is. |
| Dropdown under wheel | `.wheel-dropdown` + `<select>` | Used for applications, "All", and the FOV application. |
| Results banner | `.results-head .count/.hint` | Black with a yellow left border and white text. |
| Cards | `.card`, `.card.best` (yellow left border), `.card.runner` (orange left border), `.card .tag` (black pill, white text) | |
| Spec table | `table.spec` | Light header row. |
| Notes | `noteBox(key, title, html, dark)` produces `.yt-note` | Hidden by default. A document-level click handler toggles `.is-open` and remembers it per key. Use `.yt-note.dark` inside dark panels. |
| Segmented | `.yt-seg button.is-on` | For example "Generic scale image" vs "Upload your photo". |
| Sort label | `.sort-label` | States the sort basis for "All". |
| Not-listed tag | `.yt-notlisted` | Set `ytListed:false` in the data and render `notListedTag(c)`. |
| CTA | `.cta` | Yellow with black text; hover turns orange with black text. |

## Data conventions

- Each product record has `id, name, category, wheel, apps[], specs…, source (OEM URL), status?, notes?, ytListed?`.
- `notes` holds verification caveats and renders inside a collapsed `.yt-note`.
- Use a `VERIFY` table for page-level caveats, also rendered collapsed.
- Mark discontinued products with `status` and keep them only for installed-base comparison.

## Test hooks

Pages can read the URL hash so headless screenshots don't need clicks, for example `#tab=browse&app=all` or `#tab=fov&view=upload&app=machine`.

## Checklist for a new page (e.g. Fluke CM, Atten2)

1. Copy the skeleton and link `yt-template.css`.
2. Download the OEM logo from the OEM's official site into `assets/`.
3. Build the data from the OEM site only. Add a source URL for each product and flag anything unpublished.
4. Check each product against yellotec.co.za and tag only confirmed absences.
5. Run `node --check` on the extracted scripts, then take headless screenshots and confirm there is no yellow or orange text on black.
