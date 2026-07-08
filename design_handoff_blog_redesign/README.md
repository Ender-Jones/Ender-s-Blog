# Handoff: Personal Blog Redesign — "Ender Jones, research notebook"

## Overview
Complete redesign of a personal researcher blog (5 pages): homepage, article page, all-writing index, public worklog, and a private worklog entry console. The site's thesis: a **research notebook that proves its owner is still working** — an ADHD-friendly worklog system (one-line capture → day-close ritual → git push → public "NOW" line) is woven through every page.

Target codebase: `Ender-Jones/personal_blog_astro` (Astro + Cloudflare Pages). Content lives in `content/posts/*.mdx` and `content/worklogs/*.md`.

## About the Design Files
The files in `pages/` are **design references created in HTML** (custom single-file component format, `*.dc.html`). They are prototypes showing intended look and behavior — **not production code to copy directly**. The task is to **recreate these designs in the Astro codebase** using its established patterns (Astro components, content collections, scoped styles). Open each `.dc.html` in a browser (keep `support.js` in the same folder) to see the live design.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate pixel-perfectly. All design values are centralized in `styles/tokens.css` — port it as-is (it is plain CSS custom properties + keyframes).

## Global System (applies to every page)

### Design tokens — `styles/tokens.css`
- Fonts: `--ej-serif` Newsreader (display/quotes, often italic), `--ej-mono` Geist Mono (labels/meta/UI), `--ej-sans` Geist (body). Google Fonts, weights 400–700 + Newsreader italics.
- Ink grays: `--ej-text #f5f5f6 · --ej-text-2 #c8c8cd · --ej-text-3 #a6a6ae · --ej-mut #8a8a94 · --ej-mut-2 #7c7c86 · --ej-dim #6a6a73`.
- **Semantic accents (strict, do not mix):** pink `#ff7ac0` = proof/public/alive (notes, NOW line, caret, published work) · blue `#4cc2ff` = signal/data/decision · amber `#f59e0b` = today/next/action · rose `#ff9d9d` = risk. Hover-bright variants: `--ej-pink-2 #ffb3d9`, `--ej-blue-2 #9ed9ff`, `--ej-amber-2 #fcd34d`.
- Neon glows (`--ej-neon-*`), ease `cubic-bezier(0.2, 0, 0, 1)`, shared keyframes (`ej-caret`, `ej-pulse`, `ej-blink`, `ej-rise`, `ej-drift-a/b/c`).
- ⚠ SVG **presentation attributes** (`stroke="…"`) cannot take `var()` — set stroke via inline `style` or a literal hex.

### Page chrome
- Background `#030305`; fixed 56px micro-grid overlay (`rgba(148,163,184,0.019)` lines) + 2–3 tiny neon drift dots (4px, blur, 34–44s `ej-drift-*` loops).
- **Background parallax:** grid `background-position-y` and each dot translate at 0.05–0.14 × scrollY (rAF-throttled scroll listener) — much slower than content.
- Nav: sticky 46px, `rgba(4,4,7,0.5)` + `backdrop-filter: blur(9px) saturate(1.4)`, 1px bottom hairline + 210px white fade accent, logo "Ender Jones ▂ research notebook" (serif italic + blinking pink caret + mono suffix), links mono 12px uppercase, EN/中 pill toggle (visual only for now).
- Footer: "© 2026 Ender Jones — still working." + GitHub/X/Email pills (hover fills blue/white/pink respectively).
- Entrance: sections/cards rise in with `ej-rise` 520–560ms, staggered 90–270ms.
- Links default `a { color:#a6a6ae }`, hover `#f5f5f6`.

### Signature hover vocabulary (rows)
Used by homepage Writing rows, article-list rows: 2px accent bar on the left grows in (scaleY 0.55→1, 220ms) with neon glow; title translateX(4px) and brightens to white; date brightens; meta fades to 12%; a 92×58 thumbnail (7px radius, accent-tinted border, deep shadow) fades/slides in at right with 40ms delay. Accent color per item: pink or blue (`tone` field).

## Screens / Views

### 1. Homepage (`pages/主页v3.dc.html`) — route `/`
- **Intro splash** (once per session via `sessionStorage['ej-splash-seen']`): black screen → serif italic "Hi, I am Ender Jones." (780ms rise) → huge serif claim "Teaching machines how a body *feels*" + blinking pink caret (650ms delay) → a pink rPPG pulse line draws itself once (SVG `stroke-dashoffset` 1→0, 1.25s, starts 1.35s) → bottom-left: 120px auto-enter progress hairline (fills over **4.4s**, `scaleX`) + "AUTO — CLICK OR ANY KEY TO SKIP". Auto-finishes at **4.4s**; click/Enter/Esc/Space skips; exit = 380ms fade + translateY(-12px).
- **Hero** (2-col: text + 380px card): mono kicker "AFFECTIVE COMPUTING — TOKYO / CHIBA", serif claim clamp(44–76px) with italic last word + pink caret block, body paragraph, buttons "research & cv →" (filled subtle) + "reach me →" (underline, pink hover).
- **Subject readout card** (aside): viewfinder corner ticks (9px, 0.24 white); header "SUBJECT READOUT" + **live JST clock** (HH:MM, tabular, blue blinking ▍); identity block — 54×54 rounded-9px grayscale portrait with a 1px pink scan-line at top, serif italic name 20px, mono "PhD candidate · Affective Computing"; dashed divider; 2 dotted-leader rows (`measures: rPPG · EDA · landmarks`, `langs: Chinese · English · Japanese`) + `status` row with pink pulse dot "writing the J-BHI draft" (hover: keys/values brighten); footer "synced <date>" + "worklog →".
- **LIVE strip**: "LIVE — REMOTE PPG, RECONSTRUCTED" + ≈62 bpm (random 60–64 every 2.6s); full-width ECG SVG: dim blue full path + bright traveling dash segment (6.2s loop) + glowing dot via `animateMotion`.
- **Research**: 3 paper panels in one card (Published/Under review/In writing). Status dot colors: **pink (published) / blue (review, pulsing) / amber (writing)**. Hover: faint bg + a 2px **top bar in the same status color** grows scaleX 0.4→1. Right: "Headline metric" card `0.73 → 0.83` macro-F1. Below: mono keyword line.
- **Writing**: featured card "Who Am I?" (340px dusk photo left, grayscale-ish, hover: lift −2px, pink border glow, img scale 1.025; ESSAY · PINNED chip) + 3 rows using the signature row hover; "LATEST" outline chip on newest.
- **Proof of work — 26 weeks**: full-width card. Grid 26×7 of 17px cells (3.5px gap, 3.5px radius) + month labels under column of each month's 1st. **Semantics: any-push day = pink ramp (0 → `rgba(255,122,192,0.18/0.36)` → `rgba(255,138,199,0.6)` → `#ffcfe7`, thresholds 0/≤2/≤5/≤10/more); today = 1px amber frame + glow (fill still shows its level); empty = `rgba(255,255,255,0.045)`. No streaks, no worklog-note distinction.** Right column: caption ("any push — code, experiments, this site — turns the day pink. history needs no color, and gaps count against nothing."), less→more legend + framed "today" swatch. Below: NOW line (pink NOW chip + latest public sentence + "upd <date>") linking to worklog `#resume-here`.
- **Coda**: random quote (serif italic clamp 22–28px) + source + "⟳ again" pill (hover: pink border/text/glow). Reroll: quote fades out + sinks 8px (220ms), swaps, fades back; source cross-fades.

### 2. Article page (`pages/文章页.dc.html`) — route `/posts/[slug]/` (mock: regression-metrics post)
- Reading progress: 2px pink→blue gradient line pinned to nav's bottom edge, width = scroll %.
- Two ambient orbs (520/560px radial, pink/blue ≤5% alpha) + 2 dots, all parallax at 0.03–0.09.
- Breadcrumb "← writing | ● RESEARCH NOTE | date · EN · 7 min read"; serif title clamp ~34–44px; serif italic dek; full-bleed hero image (16:7, rounded 14px).
- **Epigraph**: 2px pink gradient bar left; original quote (serif italic 17.5px) → translation (sans 13.5px) → attribution row (18px hairline + mono "STENDHAL" + serif italic source + bordered "FR" chip).
- Body: sans 15.5px/1.75 ~68ch; serif §-numbered H2s; INFO/TIP callouts — quiet panel `rgba(255,255,255,0.018→0.005)` with header row: 4px colored dot (blue=INFO, amber=TIP) + mono label + gradient hairline.
- **ToC** (sticky right rail): "ON THIS PAGE" + "READ n%"; hairline rail whose **fill tracks the active section link's offset** (pink→blue gradient); items: mono 11px, §numbers, active = pink + 3px glow bar, hover indent 2px.
- **Coda**: quote block matching epigraph anatomy (pink→blue bar, original/translation/source + lang chip) + "⟳ another" pill (apply the same fade-swap + pink hover as homepage coda — pending polish).

### 3. All writing (`pages/文章列表页.dc.html`) — route `/posts/`
Header "Writing." + caret; filter chips ALL/ESSAYS/POEMS/STUDIES/NOTES (pill, active = pink border/text/glow) + "n of 4 posts" counter; year-grouped rows (year mono label + hairline + count). Rows = signature hover + one-line dim description under title; PINNED/LATEST chips. Footer line: "the archive grows slowly, on purpose…". 4 real posts from `content/posts/*.mdx` frontmatter. No RSS.

### 4. Public worklog (`pages/Worklog公开页.dc.html`) — route `/worklog/`
- Header "Still working." + caret; sub: "One line at a time… Days with nothing logged are just days — they count against nothing."
- **NOW bar** (pink chip + latest public sentence + upd date) and **SAVE POINT bar** (amber chip + latest `> next` + "where tomorrow starts", `id="resume-here"`).
- **LOG TRAIL — 26 WEEKS** card: 13px cells, binary pink `rgba(255,122,192,0.38)` = day with a note, amber frame = today, neutral gray otherwise; legend "note / today / a day, neutrally".
- **Weeks**: per week — "WEEK 28 [OPEN chip] · date range ─ digest" (digest auto-assembled: "3 done · 1 decision · 1 dropped — 2/7 days"); day rows (hover: faint bg) — left column weekday + 5-cell energy meter (amber-filled 1–5); entries with colored glyphs ✓ = ! > ~ (dropped = strikethrough gray); optional public line in serif italic with pink dot.
- SYMBOLS legend row at bottom. "earlier weeks → archive" link.

### 5. Entry console (`pages/Worklog录入.dc.html`) — private route, gated to @Ender-Jones
ADHD-first rules baked into the UI (keep them): **capture ≤10s** (one line + Enter, auto time-stamp, no required fields); prefix glyphs `@ project · = decision · ! risk · > next · ~ dropped · no prefix = done`; **carry-over triage** with three exits — done / still next / **drop** (drop leaves a gray "DROPPED —" trace: abandoning is a decision, not a failure); **day close ritual** (button "close the day" opens amber panel: recap counts "…— proof, not memory", save-point input if no `> next` yet, 140-char public line input, optional 1–5 energy dots "patterns, not grades", then "push now →"); **no streaks anywhere**.
Layout: header (date/weekday/last-note/JST clock) → input row (pink ▸ prompt, live type-preview chip) → prefix chips → today's entries (badge/text/time/×) → carry-over card → SYNTAX legend row (colored glyphs, "same glyphs work in the markdown"). Right column: file card — "WHERE THIS GOES" plain-words strip ("every line appends to content/worklogs/2026-07.md · **close the day** pushes it to git · your one public sentence becomes the homepage **NOW**" — the two bold phrases light up amber/pink as they become true) → file head (path · main · diffstat) → live markdown preview (frontmatter `public_thread.summary` + `energy`, `### Done/Decision/Risk/Next/Dropped` sections, dropped as `~~strikethrough~~`) → commit bar (message `worklog: YYYY-MM-DD (n entries)`; states: close the day → push now → pushing… → ✓ committed <sha>) → LOG TRAIL card. Auth overlay when signed out ("This console writes to the notebook. Only @Ender-Jones can commit.").

## Interactions & Behavior
- Route-hint statusbar (homepage/console): bottom-left mono chip showing target on hover of any link.
- All transitions 120–260ms with `--ej-ease`; entrance `ej-rise` staggers; nothing moves at rest except: caret blinks, one pulse dot, LIVE trace, drift dots.
- Splash: see §1 (4.4s auto, skippable, once per session).
- Parallax listener: rAF-throttled, `{ passive: true }`, cleaned up on unmount.

## State Management (console)
- Persist per-day draft in `localStorage['ej-console-' + YYYY-MM-DD]` (JST date): `{ entries[{type,text,time}], usedCarry[], droppedCarry[], committed, summary, sha, energy }`.
- Carry-over source: yesterday's `> next` items. Commit = real git push via GitHub API in production; on success mark today committed + store sha; homepage NOW + worklog-days update from pushed data.

## Data Contracts (`data/`)
- `github-activity.json`: `{ generatedAt, login, days: [{ date: "YYYY-MM-DD", count: n }] }` — currently 12 weeks static; production should fetch/build-time-generate 26 weeks. Wall pads missing days to 182 with count 0 (back-computed dates for month labels).
- `worklog-days.json`: `{ days: ["YYYY-MM-DD", …] }` — days that have a worklog note (pink cells on worklog trails).
- `quotes.json`: `{ quotes: [{ text, trans?, source, lang }] }` — coda quotes; `lang` renders as bordered chip, `trans` as translation line (article page).

## Assets (`assets/`)
`ang.JPG` (portrait), `whoami-dusk.jpg`, `cherry-blossom-wide.jpg`, `chatgpt-plus.jpg`, `regression-title.png` — post images match `content/posts/*.mdx` frontmatter `image` fields (production paths `/img/posts/…`).

## Files
- `pages/主页v3.dc.html` — homepage
- `pages/文章页.dc.html` — article page
- `pages/文章列表页.dc.html` — all writing index
- `pages/Worklog公开页.dc.html` — public worklog
- `pages/Worklog录入.dc.html` — entry console
- `pages/support.js` — runtime for the .dc.html format (reference only; do NOT port)
- `styles/tokens.css` — **port as-is**
- `data/*.json` — data contracts · `assets/*` — images
