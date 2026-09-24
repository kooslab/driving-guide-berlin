# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the two standalone HTML driving guides to an Astro static site, and add daily-life DE/EN dialogue guides covering food, transport, errands, health, admin, housing, and airport.

**Architecture:** Astro `output: 'static'` with plain vanilla JS. The canvas engine (SceneView, Player) is extracted from the monolithic HTML files into ES modules (`signs.js`, `engine.js`, `app.js`). Each page either loads the driving engine via a `<script>` import, or renders static dialogue cards with no JS.

**Tech Stack:** Astro 5.x, Vanilla JS (no framework), Vite (bundled by Astro), Vercel static hosting.

## Global Constraints

- `output: 'static'` in astro.config.mjs — no server, no adapter
- `site: 'https://driving-guide-berlin.vercel.app'` in astro.config.mjs
- No Svelte, no React — plain JS only
- Engine code is extraction-only — no logic rewrites, only add `export` statements and wrap app logic in `initApp()`
- URL `/auto` for car guide, `/bike` for bike guide, `/daily/food` … `/daily/airport` for daily guides
- NavBar uses `<details>`/`<summary>` dropdowns — no JS required
- Dialogue `steps[]` shape: `{ speaker: 'staff'|'you', de: string, en: string, alts?: {de,en}[] }`
- All dialogue data files export `meta` (object) and `scenes` (array)
- Fonts loaded from Google Fonts: Barlow Condensed 600/700, Source Sans 3, IBM Plex Mono 500

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `src/` directory structure
- Create: `public/favicon.svg`
- Modify: `.gitignore`

**Interfaces:**
- Produces: Working `npm run dev` and `npm run build` commands

- [ ] **Step 1: Install Astro**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git
npm install
```

Or manually create files if the interactive prompt is not available in an agent context.

- [ ] **Step 2: Write package.json**

```json
{
  "name": "driving-guide-berlin",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

Run: `npm install`

- [ ] **Step 3: Write astro.config.mjs**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://driving-guide-berlin.vercel.app',
});
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p src/lib src/data src/layouts src/components src/pages/daily public scripts
```

- [ ] **Step 5: Write public/favicon.svg**

Copy the SVG from the `.brand .mark` SVG in index.html:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect x="2" y="2" width="36" height="36" rx="6" fill="#F2D53C"/>
  <rect x="9" y="9" width="22" height="22" fill="#fff"/>
  <rect x="13" y="13" width="14" height="14" fill="#F2D53C"/>
</svg>
```

- [ ] **Step 6: Update .gitignore** — add `node_modules/`, `dist/`, `.astro/`

- [ ] **Step 7: Create placeholder index page and verify build**

```astro
---
// src/pages/index.astro
---
<html><body><p>placeholder</p></body></html>
```

Run: `npm run build`
Expected: `dist/` created, exit 0.

- [ ] **Step 8: Commit**

```bash
git add package.json astro.config.mjs src/ public/ .gitignore
git commit -m "chore: scaffold Astro static site"
```

---

### Task 2: Extract signs library

**Files:**
- Create: `src/lib/signs.js`

**Interfaces:**
- Produces: `export const SIGNS`, `export function signSVG(code, size, extraClass)`, `export function bikeIcon(fill)`, `export function pedIcon(x,y,s,fill)`, `export function carIcon(x,y,s,fill)`

- [ ] **Step 1: Create src/lib/signs.js**

Copy lines 193–256 from `index.html` verbatim. Then:
1. Add `export` to `SIGNS` and `signSVG`
2. Add `export` to `bikeIcon`, `pedIcon`, `carIcon` (used by engine.js for actor drawing)
3. All other helpers (`triDown`, `triUp`, `circleBlue`, etc.) remain private — no export needed

File template:

```js
// src/lib/signs.js
const SIGN_RED = '#C8102E', SIGN_BLUE = '#0F4C9A', SIGN_WHITE = '#FFFFFF',
      SIGN_BLACK = '#111111', SIGN_YELLOW = '#F5C400', SIGN_GREEN = '#1E9E4A';

function triDown(fill, stroke){ /* paste from index.html */ }
function triUp(inner){ /* paste from index.html */ }
// ... all private helpers ...

export function bikeIcon(fill){ return /* paste from index.html */; }
export function pedIcon(x,y,s,fill){ return /* paste from index.html */; }
export function carIcon(x,y,s,fill){ return /* paste from index.html */; }

export const SIGNS = {
  '205': { name:'Vorfahrt gewähren', en:'Give way', /* paste from index.html */ },
  // ... all signs ...
};

export function signSVG(code, size, extraClass){
  const s = SIGNS[code]; if(!s) return '';
  return `<svg viewBox="0 0 100 100" width="${size||40}" height="${size||40}" class="${extraClass||''}" role="img" aria-label="${s.name}">${s.svg()}</svg>`;
}
```

- [ ] **Step 2: Verify module**

```bash
node -e "import('./src/lib/signs.js').then(m => { console.log('SIGNS keys:', Object.keys(m.SIGNS).length); console.log('signSVG:', typeof m.signSVG); })"
```

Expected: `SIGNS keys: 38` (or the actual count), `signSVG: function`

- [ ] **Step 3: Commit**

```bash
git add src/lib/signs.js
git commit -m "feat: extract signs library to ES module"
```

---

### Task 3: Extract scene engine

**Files:**
- Create: `src/lib/engine.js`

**Interfaces:**
- Consumes: `signSVG` from `./signs.js`
- Produces: `export const NS, VB, T_ARRIVE, T_FIRST, T_GAP, TRAVEL, COL, ROT`; `export function el, txt, ease, ease3, easeOut, drawRoad, drawSigns, drawLights, setLight, actorColor, drawVehicle, computeLightPhases, actorPath`; `export class SceneView`

- [ ] **Step 1: Check engine differences between index.html and bike.html**

```bash
diff <(sed -n '193,600p' index.html) <(sed -n '193,600p' bike.html)
```

The only difference should be in `drawVehicle` — bike.html adds `if(k==='bike'||k==='you')` so cyclists get the bike shape. Use the **bike.html version** of `drawVehicle` in `engine.js` so both guides render cyclists correctly.

- [ ] **Step 2: Create src/lib/engine.js**

Copy lines 257–600 from `index.html`, then:
1. Add at top: `import { signSVG } from './signs.js';`
2. Add `export` keyword to every top-level `const`, `function`, and `class`
3. Replace `drawVehicle` with the version from `bike.html` (lines 464–483 of bike.html)

File structure:
```js
// src/lib/engine.js
import { signSVG } from './signs.js';

export const NS = 'http://www.w3.org/2000/svg';
export const VB = '-320 -320 640 640';
export const T_ARRIVE = 1.4, T_FIRST = 2.0, T_GAP = 1.9;
export const TRAVEL = { car:2.4, you:2.4, tram:3.0, bus:2.8, bike:2.6, ped:3.4, ambulance:1.8 };
export const COL = { you:'#2F6FDB', bvg:'#F2D53C', bike:'#3DAE6B', ped:'#F3EBD3', amb:'#F7F7F7', cars:['#D5D9DE','#D8C39A','#9C7A5A','#7FA5B5'] };
export const ROT = { S:0, W:90, N:180, E:270 };

export function el(tag, attrs, parent){ /* paste from index.html */ }
export function txt(parent, x, y, s, attrs){ /* paste from index.html */ }
// ... rotPt, rotPath, pathStr, BASE, actorPath, ease, easeOut, easeIn, ease3 ...
// ... drawRoad (lines 304–414) ...
// ... SIGN_POS, SIGN_STACK, drawSigns, LIGHT_POS, drawLights, setLight ...
// ... actorColor, drawVehicle (bike.html version!), computeLightPhases ...

export class SceneView {
  /* paste from index.html lines 501–600 */
}
```

- [ ] **Step 3: Verify**

```bash
node -e "import('./src/lib/engine.js').then(m => { console.log('SceneView:', typeof m.SceneView); console.log('COL.bike:', m.COL.bike); })"
```

Expected: `SceneView: function`, `COL.bike: #3DAE6B`

- [ ] **Step 4: Commit**

```bash
git add src/lib/engine.js
git commit -m "feat: extract scene engine to ES module"
```

---

### Task 4: Extract app logic

**Files:**
- Create: `src/lib/app.js`

**Interfaces:**
- Consumes: `SceneView, NS, COL, T_ARRIVE` from `./engine.js`; `signSVG, SIGNS` from `./signs.js`
- Produces: `export function initApp(SCENES, CHAPTERS, config)`

Config object shape:
```js
{
  guide: 'auto',              // 'auto' | 'bike'
  crumb: string,              // breadcrumb text
  heroTitle: string,
  heroIntro: string,          // use SCENE_COUNT as placeholder for SCENES.length
  youLabel: string,           // 'You' or 'You (cyclist)'
  youColor: string,           // hex color
  startColor: string,         // button background
  startTextColor: string,     // button text color
  demoSceneId: string,        // id of demo scene in hero loop
}
```

- [ ] **Step 1: Create src/lib/app.js**

```js
// src/lib/app.js
import { SceneView, NS, COL, T_ARRIVE } from './engine.js';
import { signSVG, SIGNS } from './signs.js';

const BASE_RATE = 0.7;
const ICON = {
  play:   '<svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z"/></svg>',
  pause:  '<svg viewBox="0 0 16 16"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg>',
  step:   '<svg viewBox="0 0 16 16"><path d="M3 2l8 6-8 6zM12 2h2v12h-2z"/></svg>',
  replay: '<svg viewBox="0 0 16 16"><path d="M8 3a5 5 0 1 1-4.5 2.8l1.8.9A3 3 0 1 0 8 5v2L4 4l4-3z"/></svg>',
};

export function initApp(SCENES, CHAPTERS, config) {
  // All locals are scoped to initApp so SCENES/CHAPTERS are available to all inner functions.
  const $ = (s,p)=> (p||document).querySelector(s);
  const main = $('#main'), nav = $('#nav');
  let player = null;

  class Player {
    // Paste verbatim from index.html lines 1351–1379
    // Player reads SCENES via renderScene's closure — that's fine.
  }

  function route(){
    // Paste verbatim from index.html lines 1251–1256
    // References renderScene, renderChapter, renderGlossary, renderHome — all defined below
  }

  function renderNav(k, v){
    // Paste verbatim from index.html lines 1259–1266
  }

  function thumb(scene, t){
    // Paste verbatim from index.html line 1268
  }

  function renderHome(){
    // Parameterised version — use config values
    const isAuto = config.guide === 'auto';
    const heroIntro = config.heroIntro.replace('SCENE_COUNT', SCENES.length);
    // Build legend HTML based on guide type:
    const legendYou = `<div><i style="background:${config.youColor};border-radius:50%;height:14px"></i>${config.youLabel}</div>`;
    const legendCars = isAuto
      ? `<div><i style="background:${COL.cars[0]}"></i>Other cars</div>`
      : `<div><i style="background:${COL.cars[0]}"></i>Cars</div>`;
    const legendBike = isAuto
      ? `<div><i style="background:${COL.bike};border-radius:50%;height:14px"></i>Cyclist</div>`
      : `<div><i style="background:${COL.bike};border-radius:50%;height:14px"></i>Other cyclists</div>`;
    // Render — structure identical to index.html renderHome(); only strings differ
    // Use CHAPTERS.map(...) and SCENES.length exactly as in index.html
    // Start button color uses config.startColor / config.startTextColor
    // Hero demo uses SCENES.find(s=>s.id===config.demoSceneId)||SCENES[0]
  }

  function renderChapter(n){
    // Paste verbatim from index.html lines 1291–1296
  }

  function renderGlossary(){
    // Paste verbatim from index.html lines 1298–1302
  }

  function renderScene(id){
    // Paste verbatim from index.html lines 1307–1349
  }

  window.addEventListener('hashchange', route);
  route();
}
```

The comments above mark where to paste code from index.html. The `SCENES`, `CHAPTERS`, `player`, `$`, `main`, `nav`, `BASE_RATE`, `ICON`, `Player`, and all render functions are in scope within `initApp` — no globals needed.

- [ ] **Step 2: Verify**

```bash
node -e "import('./src/lib/app.js').then(m => console.log('initApp:', typeof m.initApp))"
```

Expected: `initApp: function`

- [ ] **Step 3: Commit**

```bash
git add src/lib/app.js
git commit -m "feat: extract app routing logic to initApp ES module"
```

---

### Task 5: Extract scene data

**Files:**
- Create: `src/data/scenes-auto.js`
- Create: `src/data/scenes-bike.js`

**Interfaces:**
- Produces: `export const SCENES` and `export const CHAPTERS` in each file

- [ ] **Step 1: Create src/data/scenes-auto.js**

Copy from index.html:
- Lines 607–1233: `const SCENES = [...]` (chapters 1–5 start at 607, chapters 6–10 start at 986 — it's one array, paste both blocks)
- Lines 1235–1246: `const CHAPTERS = [...]`

Add `export` to both:

```js
// src/data/scenes-auto.js
export const SCENES = [
  /* paste verbatim from index.html lines 607–1233 */
];

export const CHAPTERS = [
  /* paste verbatim from index.html lines 1235–1246 */
];
```

- [ ] **Step 2: Create src/data/scenes-bike.js**

Copy from bike.html:
- Lines 606–916: `const SCENES = [...]`
- Lines 917–924: `const CHAPTERS = [...]`

```js
// src/data/scenes-bike.js
export const SCENES = [
  /* paste verbatim from bike.html lines 606–916 */
];

export const CHAPTERS = [
  /* paste verbatim from bike.html lines 917–924 */
];
```

- [ ] **Step 3: Verify**

```bash
node -e "
Promise.all([
  import('./src/data/scenes-auto.js'),
  import('./src/data/scenes-bike.js')
]).then(([a, b]) => {
  console.log('Auto SCENES:', a.SCENES.length, 'CHAPTERS:', a.CHAPTERS.length);
  console.log('Bike SCENES:', b.SCENES.length, 'CHAPTERS:', b.CHAPTERS.length);
})
"
```

Expected: Auto SCENES > 80, Auto CHAPTERS: 10, Bike SCENES ~24, Bike CHAPTERS: 6.

- [ ] **Step 4: Commit**

```bash
git add src/data/scenes-auto.js src/data/scenes-bike.js
git commit -m "feat: extract scene data to ES modules"
```

---

### Task 6: GuideLayout and NavBar

**Files:**
- Create: `src/layouts/GuideLayout.astro`
- Create: `src/components/NavBar.astro`

**Interfaces:**
- Produces: `GuideLayout` (props: `title`, `description`, `currentPage`) and `NavBar` (prop: `currentPage`)

- [ ] **Step 1: Create src/layouts/GuideLayout.astro**

The layout wraps every page. The `<style>` block is the entire CSS from index.html lines 10–176, plus new NavBar CSS rules added below it:

```astro
---
import NavBar from '../components/NavBar.astro';
interface Props { title: string; description?: string; currentPage?: string; }
const { title, description = 'Berlin guides — driving, cycling, and daily life in German.', currentPage = '' } = Astro.props;
---
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content={description}>
<title>{title}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* === paste entire <style> block from index.html lines 10–176 === */
/* Then add: */

/* --- top nav --- */
.topnav{display:flex;align-items:center;gap:0;background:var(--surface);border-bottom:1px solid var(--line);padding:0 16px;position:sticky;top:0;z-index:100;height:40px}
.topnav-brand{font:700 15px/40px var(--display);padding:0 16px 0 0;border-right:1px solid var(--line);margin-right:8px;white-space:nowrap;color:var(--ink)}
.topnav-group{position:relative}
.topnav-group summary{list-style:none;cursor:pointer;padding:0 14px;line-height:40px;font:600 13px var(--body);color:var(--muted);user-select:none}
.topnav-group summary::-webkit-details-marker{display:none}
.topnav-group[open] summary{color:var(--ink)}
.topnav-dropdown{position:absolute;top:40px;left:0;min-width:160px;background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:6px;z-index:200}
.topnav-dropdown a{display:block;padding:7px 12px;border-radius:5px;font:600 13px var(--body);color:var(--ink);text-decoration:none}
.topnav-dropdown a:hover{background:var(--surface-2)}
.topnav-dropdown a[aria-current="page"]{background:var(--accent-soft);color:var(--accent)}
.topnav-group:not([open]) .topnav-dropdown{display:none}
/* driving guide grid accounts for 40px nav height */
.app{display:grid;grid-template-columns:256px minmax(0,1fr);min-height:calc(100vh - 40px)}
</style>
</head>
<body>
<NavBar currentPage={currentPage} />
<slot />
</body>
</html>
```

- [ ] **Step 2: Create src/components/NavBar.astro**

```astro
---
interface Props { currentPage?: string; }
const { currentPage = '' } = Astro.props;

const driving = [
  { href: '/auto', label: 'Auto guide' },
  { href: '/bike', label: 'Bike guide' },
];
const daily = [
  { href: '/daily/food',      label: 'Food & drink' },
  { href: '/daily/transport', label: 'Transport' },
  { href: '/daily/errands',   label: 'Errands' },
  { href: '/daily/health',    label: 'Health' },
  { href: '/daily/admin',     label: 'Admin' },
  { href: '/daily/housing',   label: 'Housing' },
  { href: '/daily/airport',   label: 'Airport' },
];
const drivingOpen = driving.some(p => currentPage.startsWith(p.href));
const dailyOpen   = daily.some(p => currentPage.startsWith(p.href));
---
<nav class="topnav" aria-label="Site navigation">
  <span class="topnav-brand">Berlin Guides</span>
  <details class="topnav-group" open={drivingOpen || undefined}>
    <summary>Driving</summary>
    <div class="topnav-dropdown">
      {driving.map(p => (
        <a href={p.href} aria-current={currentPage === p.href ? 'page' : undefined}>{p.label}</a>
      ))}
    </div>
  </details>
  <details class="topnav-group" open={dailyOpen || undefined}>
    <summary>Daily Life</summary>
    <div class="topnav-dropdown">
      {daily.map(p => (
        <a href={p.href} aria-current={currentPage === p.href ? 'page' : undefined}>{p.label}</a>
      ))}
    </div>
  </details>
</nav>
```

- [ ] **Step 3: Test build**

Run: `npm run build`
Expected: Exit 0, `dist/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/GuideLayout.astro src/components/NavBar.astro
git commit -m "feat: add GuideLayout shell and NavBar dropdown nav"
```

---

### Task 7: SceneGuide component + auto and bike pages

**Files:**
- Create: `src/components/SceneGuide.astro`
- Create: `src/pages/auto.astro`
- Create: `src/pages/bike.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `GuideLayout`, `initApp` from `../lib/app.js`, scene data from `../data/`
- Produces: Working `/auto` and `/bike` pages

- [ ] **Step 1: Create src/components/SceneGuide.astro**

```astro
---
interface Props { title: string; subtitle: string; }
const { title, subtitle } = Astro.props;
---
<div class="app">
  <aside class="rail">
    <div class="brand">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="2" y="2" width="36" height="36" rx="6" fill="#F2D53C"/>
        <rect x="9" y="9" width="22" height="22" fill="#fff"/>
        <rect x="13" y="13" width="14" height="14" fill="#F2D53C"/>
      </svg>
      <div><h1>{title}</h1><small>{subtitle}</small></div>
    </div>
    <nav id="nav" aria-label="Chapters"></nav>
  </aside>
  <main class="main" id="main"></main>
</div>
```

Note: The cross-guide link pill that was in `.brand` in the original HTML files is removed — the top NavBar handles cross-guide navigation.

- [ ] **Step 2: Create src/pages/auto.astro**

```astro
---
import GuideLayout from '../layouts/GuideLayout.astro';
import SceneGuide from '../components/SceneGuide.astro';
---
<GuideLayout
  title="Berlin Kreuzung — Auto guide"
  description="Animated guide to Berlin driving rules: who goes first at crossings, signs, turning, trams, cyclists."
  currentPage="/auto"
>
  <SceneGuide title="Berlin Kreuzung" subtitle="Who goes first, and why" />
</GuideLayout>

<script>
import { initApp } from '../lib/app.js';
import { SCENES, CHAPTERS } from '../data/scenes-auto.js';

initApp(SCENES, CHAPTERS, {
  guide: 'auto',
  crumb: 'Berlin · driving guide for the family',
  heroTitle: 'Who goes first at a Berlin crossing?',
  heroIntro: 'SCENE_COUNT animated situations from the streets of Berlin. Your car is always the <b style="color:var(--accent)">blue one</b>. Press play, watch who waits and who goes, then try quiz mode.',
  youLabel: 'You',
  youColor: '#2F6FDB',
  startColor: 'var(--accent)',
  startTextColor: 'var(--accent-ink)',
  demoSceneId: 'rvl-3',
});
</script>
```

- [ ] **Step 3: Create src/pages/bike.astro**

```astro
---
import GuideLayout from '../layouts/GuideLayout.astro';
import SceneGuide from '../components/SceneGuide.astro';
---
<GuideLayout
  title="Berlin Radfahren — Bike guide"
  description="Animated guide to Berlin cycling rules: right-of-way, bike lanes, traffic lights, trams, and special cases."
  currentPage="/bike"
>
  <SceneGuide title="Berlin Radfahren" subtitle="Cycling rules for the streets of Berlin" />
</GuideLayout>

<script>
import { initApp } from '../lib/app.js';
import { SCENES, CHAPTERS } from '../data/scenes-bike.js';

initApp(SCENES, CHAPTERS, {
  guide: 'bike',
  crumb: 'Berlin · cycling guide',
  heroTitle: 'Rules of the road for Berlin cyclists',
  heroIntro: 'SCENE_COUNT animated situations. <b style="color:var(--go)">You are always the green cyclist.</b> Press play, watch who waits and who goes, then try quiz mode.',
  youLabel: 'You (cyclist)',
  youColor: '#3DAE6B',
  startColor: 'var(--go)',
  startTextColor: '#fff',
  demoSceneId: 'bk-rvl-3way',
});
</script>
```

- [ ] **Step 4: Update src/pages/index.astro to redirect**

```astro
---
return Astro.redirect('/auto');
---
```

- [ ] **Step 5: Build and browser test**

Run: `npm run build`
Expected: `dist/auto/index.html` and `dist/bike/index.html` exist.

Run: `npm run preview`

Verify at `http://localhost:4321/auto`:
- Sidebar lists chapters
- Hero canvas animates a demo scene on loop
- Clicking any chapter shows scene thumbnails
- Clicking a scene renders the canvas + controls + Play works
- Quiz mode activates with the Quiz mode button

Verify at `http://localhost:4321/bike`:
- Same structure but with green cyclist in hero
- NavBar "Driving → Bike guide" is highlighted

Verify at `http://localhost:4321/` → redirects to `/auto`

- [ ] **Step 6: Commit**

```bash
git add src/components/SceneGuide.astro src/pages/auto.astro src/pages/bike.astro src/pages/index.astro
git commit -m "feat: add auto and bike guide pages wired to engine"
```

---

### Task 8: DialogueGuide component

**Files:**
- Create: `src/components/DialogueGuide.astro`

**Interfaces:**
- Produces: `DialogueGuide` (props: `pageTitle`, `pageEmoji`, `pageDesc`, `scenes: Scene[]`) — renders static chat-bubble layout with CSS-only variations toggle

- [ ] **Step 1: Create src/components/DialogueGuide.astro**

```astro
---
interface Step { speaker: 'staff'|'you'; de: string; en: string; alts?: {de:string;en:string}[]; }
interface Scene { id: string; title: string; steps: Step[]; }
interface Props { pageTitle: string; pageEmoji: string; pageDesc: string; scenes: Scene[]; }
const { pageTitle, pageEmoji, pageDesc, scenes } = Astro.props;
---
<style>
.dlg-page{max-width:720px;margin:0 auto;padding:28px 20px 60px}
.dlg-page-head{margin-bottom:32px}
.dlg-page-head h1{font:700 clamp(32px,5vw,48px)/1 var(--display);margin:0 0 8px}
.dlg-page-head p{font-size:16px;color:var(--muted);margin:0}
.dlg-scene{margin-bottom:48px}
.dlg-scene-title{font:700 18px/1 var(--display);letter-spacing:.01em;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid var(--accent-soft)}
.bubble{display:flex;gap:10px;margin-bottom:12px}
.bubble.you{flex-direction:row-reverse}
.bubble-body{max-width:80%}
.bubble-role{font:600 10px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin-bottom:3px}
.bubble.you .bubble-role{text-align:right}
.bubble-text{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px}
.bubble.you .bubble-text{background:var(--accent-soft);border-color:transparent}
.bubble-de{font:600 17px/1.4 var(--body);color:var(--ink)}
.bubble-en{font:400 13px/1.4 var(--body);color:var(--muted);margin-top:2px}
.bubble-alts{margin-top:6px}
.bubble-alts summary{font:500 12px var(--body);color:var(--faint);cursor:pointer;list-style:none;padding:2px 0}
.bubble-alts summary::-webkit-details-marker{display:none}
.bubble-alts summary::before{content:'▶ ';font-size:9px}
details[open] .bubble-alts summary::before{content:'▼ '}
.bubble-alts-list{margin-top:6px;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.bubble-alt{background:var(--surface-2);border-radius:8px;padding:7px 12px}
.bubble-alt-de{font:400 15px/1.3 var(--body);color:var(--ink)}
.bubble-alt-en{font:400 12px/1.3 var(--body);color:var(--muted)}
@media(max-width:600px){.dlg-page{padding:16px 12px 40px}.bubble-body{max-width:90%}}
</style>

<div class="dlg-page">
  <div class="dlg-page-head">
    <h1>{pageEmoji} {pageTitle}</h1>
    <p>{pageDesc}</p>
  </div>
  {scenes.map(scene => (
    <section class="dlg-scene" id={scene.id}>
      <h2 class="dlg-scene-title">{scene.title}</h2>
      {scene.steps.map(step => (
        <div class={`bubble ${step.speaker}`}>
          <div class="bubble-body">
            <div class="bubble-role">{step.speaker === 'you' ? 'You' : 'Staff / Locals'}</div>
            <div class="bubble-text">
              <div class="bubble-de">{step.de}</div>
              <div class="bubble-en">{step.en}</div>
            </div>
            {step.alts && step.alts.length > 0 && (
              <details class="bubble-alts">
                <summary>variations ({step.alts.length})</summary>
                <ul class="bubble-alts-list">
                  {step.alts.map(alt => (
                    <li class="bubble-alt">
                      <div class="bubble-alt-de">{alt.de}</div>
                      <div class="bubble-alt-en">{alt.en}</div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      ))}
    </section>
  ))}
</div>
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors (component is not yet used by a page — Astro won't error on unused components).

- [ ] **Step 3: Commit**

```bash
git add src/components/DialogueGuide.astro
git commit -m "feat: add DialogueGuide chat-bubble component"
```

---

### Task 9: Dialogue data files

**Files:**
- Create: `src/data/doner.js`, `src/data/restaurant.js`, `src/data/supermarket.js`, `src/data/bakery.js`, `src/data/cafe.js`
- Create: `src/data/transport.js`, `src/data/postamt.js`, `src/data/pharmacy.js`, `src/data/bank.js`
- Create: `src/data/doctor.js`, `src/data/admin.js`, `src/data/housing.js`, `src/data/airport.js`
- Create: `scripts/validate-dialogue.mjs`

**Interfaces:**
- Each file exports `meta: { title, emoji, description, category }` and `scenes: Scene[]`
- Scene: `{ id, title, steps: [{ speaker, de, en, alts? }] }`

- [ ] **Step 1: Write the test script first**

```js
// scripts/validate-dialogue.mjs
import { pathToFileURL } from 'url';
import { join } from 'path';

const DATA_DIR = new URL('../src/data/', import.meta.url).pathname;
const FILES = ['doner','restaurant','supermarket','bakery','cafe',
  'transport','postamt','pharmacy','bank','doctor','admin','housing','airport'];

let errors = 0;
for (const name of FILES) {
  let mod;
  try { mod = await import(pathToFileURL(join(DATA_DIR, `${name}.js`))); }
  catch(e) { console.error(`FAIL ${name}.js: ${e.message}`); errors++; continue; }

  if (typeof mod.meta?.title !== 'string') { console.error(`FAIL ${name}.js: meta.title missing`); errors++; }
  if (!Array.isArray(mod.scenes) || !mod.scenes.length) { console.error(`FAIL ${name}.js: scenes must be a non-empty array`); errors++; continue; }

  for (const sc of mod.scenes) {
    if (!sc.id || !sc.title || !Array.isArray(sc.steps)) { console.error(`FAIL ${name}.js scene ${sc.id}: missing id/title/steps`); errors++; }
    for (const st of sc.steps) {
      if (!['staff','you'].includes(st.speaker) || !st.de || !st.en) { console.error(`FAIL ${name}.js ${sc.id}: step missing speaker/de/en`); errors++; }
    }
  }
  const totalSteps = mod.scenes.reduce((s,sc)=>s+sc.steps.length, 0);
  console.log(`OK  ${name}.js — ${mod.scenes.length} scene(s), ${totalSteps} steps`);
}
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
else console.log('\nAll dialogue files valid.');
```

Run: `node scripts/validate-dialogue.mjs`
Expected: All 13 files FAIL with "Cannot find module" — correct, they don't exist yet.

- [ ] **Step 2: Create src/data/doner.js**

```js
export const meta = { title: 'Döner Kebab', emoji: '🥙', description: 'Ordering at a Döner stand.', category: 'food' };
export const scenes = [{
  id: 'doner-order', title: 'Ordering a Döner',
  steps: [
    { speaker:'staff', de:'Was darf es sein?', en:'What can I get you?',
      alts:[{de:'Bitte schön?',en:'Yes, please?'},{de:'Was kann ich Ihnen bringen?',en:'What can I bring you?'}] },
    { speaker:'you', de:'Einen Döner, bitte.', en:'A döner, please.',
      alts:[{de:'Ich hätte gerne einen Döner.',en:'I would like a döner.'},{de:'Einen Döner mit allem, bitte.',en:'A döner with everything, please.'}] },
    { speaker:'staff', de:'Mit allem?', en:'With everything?',
      alts:[{de:'Scharf oder nicht scharf?',en:'Spicy or not spicy?'}] },
    { speaker:'you', de:'Ja, aber ohne Zwiebeln, bitte.', en:'Yes, but without onions, please.',
      alts:[{de:'Nicht zu scharf, bitte.',en:'Not too spicy, please.'},{de:'Mit Knoblauchsauce, bitte.',en:'With garlic sauce, please.'},{de:'Ohne Schafskäse, bitte.',en:'Without feta, please.'}] },
    { speaker:'staff', de:'Zum Mitnehmen oder hierbleiben?', en:'To take away or to eat here?',
      alts:[{de:'Für hier oder zum Mitnehmen?',en:'For here or to go?'}] },
    { speaker:'you', de:'Zum Mitnehmen, bitte.', en:'To take away, please.',
      alts:[{de:'Für hier, bitte.',en:'To eat here, please.'}] },
    { speaker:'staff', de:'Das macht fünf Euro, bitte.', en:'That's five euros, please.' },
    { speaker:'you', de:'Kann ich mit Karte zahlen?', en:'Can I pay by card?',
      alts:[{de:'Stimmt so.',en:'Keep the change.'}] },
  ],
}];
```

- [ ] **Step 3: Create src/data/restaurant.js**

```js
export const meta = { title: 'Restaurant', emoji: '🍽️', description: 'Entering, ordering, and asking for the bill.', category: 'food' };
export const scenes = [
  { id:'restaurant-table', title:'Getting a table', steps:[
    { speaker:'staff', de:'Guten Abend! Haben Sie reserviert?', en:'Good evening! Do you have a reservation?',
      alts:[{de:'Guten Tag! Für wie viele Personen?',en:'Good afternoon! For how many people?'}] },
    { speaker:'you', de:'Nein, aber haben Sie noch einen Tisch für zwei?', en:'No, do you have a table for two?',
      alts:[{de:'Ja, auf den Namen Müller.',en:'Yes, under the name Müller.'}] },
    { speaker:'staff', de:'Ja, bitte folgen Sie mir.', en:'Yes, please follow me.',
      alts:[{de:'Es tut mir leid, wir sind voll besetzt.',en:'I'm sorry, we are fully booked.'}] },
  ]},
  { id:'restaurant-order', title:'Ordering food and drinks', steps:[
    { speaker:'staff', de:'Was darf ich Ihnen bringen?', en:'What can I bring you?',
      alts:[{de:'Haben Sie schon gewählt?',en:'Have you chosen yet?'}] },
    { speaker:'you', de:'Ich nehme das Schnitzel, bitte.', en:'I'll have the Schnitzel, please.',
      alts:[{de:'Was empfehlen Sie?',en:'What do you recommend?'},{de:'Ich hätte gerne den Salat als Vorspeise.',en:'I would like the salad as a starter.'}] },
    { speaker:'staff', de:'Und was möchten Sie trinken?', en:'And what would you like to drink?' },
    { speaker:'you', de:'Ein Wasser, bitte.', en:'A water, please.',
      alts:[{de:'Ein Bier, bitte.',en:'A beer, please.'},{de:'Ein Glas Wein, bitte.',en:'A glass of wine, please.'}] },
    { speaker:'staff', de:'Still oder mit Kohlensäure?', en:'Still or sparkling?' },
    { speaker:'you', de:'Still, bitte.', en:'Still, please.' },
  ]},
  { id:'restaurant-bill', title:'Asking for the bill', steps:[
    { speaker:'you', de:'Entschuldigung, die Rechnung, bitte.', en:'Excuse me, the bill, please.',
      alts:[{de:'Wir würden gerne zahlen.',en:'We would like to pay.'},{de:'Könnten wir bitte zahlen?',en:'Could we pay, please?'}] },
    { speaker:'staff', de:'Zusammen oder getrennt?', en:'Together or separately?' },
    { speaker:'you', de:'Zusammen, bitte.', en:'Together, please.',
      alts:[{de:'Getrennt, bitte.',en:'Separately, please.'}] },
    { speaker:'staff', de:'Das macht 38 Euro 50.', en:'That's 38 euros 50.' },
    { speaker:'you', de:'Stimmt so.', en:'Keep the change.',
      alts:[{de:'Kann ich mit Karte zahlen?',en:'Can I pay by card?'}] },
  ]},
];
```

- [ ] **Step 4: Create src/data/supermarket.js**

```js
export const meta = { title: 'Supermarket', emoji: '🛒', description: 'Finding items and checking out.', category: 'food' };
export const scenes = [
  { id:'supermarket-find', title:'Finding something in the store', steps:[
    { speaker:'you', de:'Entschuldigung, wo finde ich die Milch?', en:'Excuse me, where can I find the milk?',
      alts:[{de:'Entschuldigung, haben Sie Hafermilch?',en:'Excuse me, do you have oat milk?'}] },
    { speaker:'staff', de:'Die Milch ist hinten links, neben den Käseprodukten.', en:'The milk is in the back left, next to the cheese.',
      alts:[{de:'Gang drei, auf der rechten Seite.',en:'Aisle three, on the right side.'}] },
    { speaker:'you', de:'Vielen Dank!', en:'Thank you very much!' },
  ]},
  { id:'supermarket-checkout', title:'At the checkout', steps:[
    { speaker:'staff', de:'Haben Sie eine Payback-Karte?', en:'Do you have a Payback card?' },
    { speaker:'you', de:'Nein, danke.', en:'No, thank you.',alts:[{de:'Ja, bitte.',en:'Yes, please.'}] },
    { speaker:'staff', de:'Möchten Sie eine Tüte?', en:'Would you like a bag?' },
    { speaker:'you', de:'Nein danke, ich habe meinen eigenen Beutel.', en:'No thanks, I have my own bag.',
      alts:[{de:'Ja, eine bitte.',en:'Yes, one please.'}] },
    { speaker:'staff', de:'Das macht 12 Euro 80.', en:'That's 12 euros 80.' },
    { speaker:'you', de:'Mit Karte, bitte.', en:'By card, please.',
      alts:[{de:'Hier ist ein Zwanzig-Euro-Schein.',en:'Here is a twenty-euro note.'}] },
  ]},
];
```

- [ ] **Step 5: Create src/data/bakery.js**

```js
export const meta = { title: 'Bakery (Bäckerei)', emoji: '🥐', description: 'Ordering bread and pastries.', category: 'food' };
export const scenes = [{ id:'bakery-order', title:'Ordering at the counter', steps:[
  { speaker:'staff', de:'Guten Morgen! Was darf es sein?', en:'Good morning! What can I get you?' },
  { speaker:'you', de:'Ein Mischbrot, bitte.', en:'A mixed-grain loaf, please.',
    alts:[{de:'Zwei Brötchen, bitte.',en:'Two bread rolls, please.'},{de:'Ein Vollkornbrot, geschnitten, bitte.',en:'A wholegrain loaf, sliced, please.'}] },
  { speaker:'staff', de:'Darf es noch etwas sein?', en:'Anything else?' },
  { speaker:'you', de:'Und ein Croissant, bitte.', en:'And a croissant, please.',
    alts:[{de:'Nein danke, das ist alles.',en:'No thank you, that's all.'},{de:'Haben Sie auch Laugenstangen?',en:'Do you have pretzel sticks?'}] },
  { speaker:'staff', de:'Zusammen 3 Euro 20.', en:'That's 3 euros 20 together.' },
]}];
```

- [ ] **Step 6: Create src/data/cafe.js**

```js
export const meta = { title: 'Café', emoji: '☕', description: 'Ordering coffee and drinks.', category: 'food' };
export const scenes = [{ id:'cafe-order', title:'Ordering a coffee', steps:[
  { speaker:'staff', de:'Was kann ich für Sie tun?', en:'What can I do for you?',
    alts:[{de:'Was hätten Sie gerne?',en:'What would you like?'}] },
  { speaker:'you', de:'Einen Kaffee, bitte.', en:'A coffee, please.',
    alts:[{de:'Einen Cappuccino, bitte.',en:'A cappuccino, please.'},{de:'Einen Flat White, bitte.',en:'A flat white, please.'},{de:'Einen Tee mit Milch, bitte.',en:'A tea with milk, please.'}] },
  { speaker:'staff', de:'Groß oder klein?', en:'Large or small?',alts:[{de:'Mit Milch?',en:'With milk?'}] },
  { speaker:'you', de:'Groß, bitte. Zum Mitnehmen.', en:'Large, please. To take away.',alts:[{de:'Klein, für hier.',en:'Small, to drink here.'}] },
  { speaker:'staff', de:'Darf ich Ihren Namen für den Becher?', en:'May I have your name for the cup?' },
  { speaker:'you', de:'Alex.', en:'Alex.' },
]}];
```

- [ ] **Step 7: Create src/data/transport.js**

```js
export const meta = { title: 'Transport', emoji: '🚇', description: 'U-Bahn tickets, Uber/Bolt, taxis, and buses.', category: 'transport' };
export const scenes = [
  { id:'ubahn-ticket', title:'Buying a U-Bahn / S-Bahn ticket', steps:[
    { speaker:'you', de:'Entschuldigung, wie kaufe ich eine Fahrkarte?', en:'Excuse me, how do I buy a ticket?' },
    { speaker:'staff', de:'Am Automaten. Drücken Sie auf "Einzelfahrschein", dann Zone AB.', en:'At the machine. Press "Single ticket", then select zone AB.',
      alts:[{de:'Sie können auch die BVG-App nutzen.',en:'You can also use the BVG app.'}] },
    { speaker:'you', de:'Was kostet eine Einzelfahrt?', en:'How much is a single journey?' },
    { speaker:'staff', de:'Drei Euro 50 für Zone AB.', en:'Three euros 50 for zone AB.' },
    { speaker:'you', de:'Muss ich den Fahrschein entwerten?', en:'Do I need to validate the ticket?' },
    { speaker:'staff', de:'Ja, stecken Sie ihn in den gelben Entwerter am Eingang.', en:'Yes, insert it into the yellow validator at the entrance.' },
  ]},
  { id:'uber-bolt', title:'Taking an Uber or Bolt', steps:[
    { speaker:'you', de:'Sind Sie Max für die Fahrt nach Mitte?', en:'Are you Max for the ride to Mitte?',
      alts:[{de:'Ich habe eine Fahrt gebucht auf den Namen Schmidt.',en:'I have a ride booked under the name Schmidt.'}] },
    { speaker:'staff', de:'Ja, genau. Steigen Sie ein, bitte.', en:'Yes, exactly. Please get in.' },
    { speaker:'you', de:'Könnten Sie bitte die Klimaanlage etwas leiser stellen?', en:'Could you please turn the air conditioning down a bit?',
      alts:[{de:'Könnten Sie bitte das Fenster öffnen?',en:'Could you please open the window?'}] },
  ]},
  { id:'taxi', title:'Taking a taxi', steps:[
    { speaker:'you', de:'Zum Hauptbahnhof, bitte.', en:'To the main train station, please.',alts:[{de:'In die Torstraße 20, bitte.',en:'To Torstraße 20, please.'}] },
    { speaker:'staff', de:'Kein Problem. Ungefähr 15 Minuten.', en:'No problem. About 15 minutes.' },
    { speaker:'you', de:'Was kostet das ungefähr?', en:'How much will that cost roughly?' },
    { speaker:'staff', de:'Etwa 12 bis 15 Euro, je nach Verkehr.', en:'About 12 to 15 euros, depending on traffic.' },
    { speaker:'you', de:'Kann ich mit Karte zahlen?', en:'Can I pay by card?' },
    { speaker:'staff', de:'Ja, kein Problem.', en:'Yes, no problem.',alts:[{de:'Nur Bargeld, leider.',en:'Cash only, I'm afraid.'}] },
  ]},
  { id:'bus', title:'Asking about the bus', steps:[
    { speaker:'you', de:'Fährt dieser Bus zum Alexanderplatz?', en:'Does this bus go to Alexanderplatz?',
      alts:[{de:'Hält dieser Bus am Prenzlauer Allee?',en:'Does this bus stop at Prenzlauer Allee?'}] },
    { speaker:'staff', de:'Ja, in etwa 10 Minuten.', en:'Yes, in about 10 minutes.',
      alts:[{de:'Nein, Sie müssen in die andere Richtung.',en:'No, you need to go in the other direction.'}] },
    { speaker:'you', de:'Gibt es eine Ansage?', en:'Is there an announcement?' },
    { speaker:'staff', de:'Ja, die Haltestellen werden angesagt.', en:'Yes, the stops are announced.' },
  ]},
];
```

- [ ] **Step 8: Create src/data/postamt.js**

```js
export const meta = { title: 'Post office (Postamt)', emoji: '📮', description: 'Sending and picking up packages.', category: 'errands' };
export const scenes = [
  { id:'paket-senden', title:'Sending a package', steps:[
    { speaker:'staff', de:'Guten Tag! Was kann ich für Sie tun?', en:'Good day! What can I do for you?' },
    { speaker:'you', de:'Ich möchte dieses Paket nach England schicken.', en:'I would like to send this package to England.',
      alts:[{de:'Ich möchte einen Brief nach Frankreich schicken.',en:'I would like to send a letter to France.'}] },
    { speaker:'staff', de:'Haben Sie es schon verpackt und beschriftet?', en:'Have you already packed and labelled it?' },
    { speaker:'you', de:'Ja, hier ist die Adresse.', en:'Yes, here is the address.' },
    { speaker:'staff', de:'Möchten Sie Einschreiben oder normal?', en:'Registered post or normal?',
      alts:[{de:'Wie schnell soll es ankommen?',en:'How quickly should it arrive?'}] },
    { speaker:'you', de:'Normal ist gut. Was kostet das?', en:'Normal is fine. How much does that cost?' },
    { speaker:'staff', de:'Sechs Euro 80 für Päckchen S nach Großbritannien.', en:'Six euros 80 for a small parcel to Great Britain.' },
  ]},
  { id:'paket-abholen', title:'Picking up a package', steps:[
    { speaker:'you', de:'Ich habe eine Benachrichtigung bekommen. Ich möchte ein Paket abholen.', en:'I received a notification. I would like to pick up a package.' },
    { speaker:'staff', de:'Haben Sie die Benachrichtigungskarte und einen Ausweis?', en:'Do you have the notification card and an ID?' },
    { speaker:'you', de:'Ja, hier bitte.', en:'Yes, here you go.' },
    { speaker:'staff', de:'Einen Moment, ich hole das Paket.', en:'One moment, I'll get the package.' },
    { speaker:'staff', de:'Bitte unterschreiben Sie hier.', en:'Please sign here.' },
  ]},
];
```

- [ ] **Step 9: Create src/data/pharmacy.js**

```js
export const meta = { title: 'Pharmacy (Apotheke)', emoji: '💊', description: 'Getting medication with or without a prescription.', category: 'errands' };
export const scenes = [
  { id:'apotheke-rezept', title:'Collecting a prescription', steps:[
    { speaker:'you', de:'Ich habe ein Rezept von meinem Arzt.', en:'I have a prescription from my doctor.' },
    { speaker:'staff', de:'Darf ich das Rezept sehen?', en:'May I see the prescription?' },
    { speaker:'you', de:'Hier bitte.', en:'Here you go.' },
    { speaker:'staff', de:'Das Medikament ist vorrätig. Haben Sie eine Krankenkassenkarte?', en:'The medication is in stock. Do you have your health insurance card?' },
    { speaker:'you', de:'Ja, hier ist meine Karte.', en:'Yes, here is my card.' },
    { speaker:'staff', de:'Dann zahlen Sie nur die Zuzahlung: 5 Euro.', en:'Then you only pay the co-payment: 5 euros.' },
  ]},
  { id:'apotheke-freiverkauf', title:'Buying over-the-counter medication', steps:[
    { speaker:'you', de:'Ich brauche etwas gegen Kopfschmerzen.', en:'I need something for headaches.',
      alts:[{de:'Haben Sie etwas gegen Erkältung?',en:'Do you have something for a cold?'},{de:'Ich suche ein Mittel gegen Übelkeit.',en:'I'm looking for something for nausea.'}] },
    { speaker:'staff', de:'Haben Sie eine Allergie gegen Ibuprofen oder Paracetamol?', en:'Do you have an allergy to ibuprofen or paracetamol?' },
    { speaker:'you', de:'Nein, keine Allergien.', en:'No, no allergies.' },
    { speaker:'staff', de:'Dann empfehle ich Ibuprofen 400. Das macht 4 Euro 95.', en:'Then I recommend Ibuprofen 400. That's 4 euros 95.' },
  ]},
];
```

- [ ] **Step 10: Create src/data/bank.js**

```js
export const meta = { title: 'Bank', emoji: '🏦', description: 'Opening an account and using ATMs.', category: 'errands' };
export const scenes = [
  { id:'konto-eroffnen', title:'Opening a bank account', steps:[
    { speaker:'you', de:'Ich würde gerne ein Girokonto eröffnen.', en:'I would like to open a current account.' },
    { speaker:'staff', de:'Sind Sie in Deutschland gemeldet?', en:'Are you registered in Germany?' },
    { speaker:'you', de:'Ja, hier ist meine Meldebestätigung.', en:'Yes, here is my registration confirmation.' },
    { speaker:'staff', de:'Und Ihren Personalausweis oder Reisepass, bitte.', en:'And your ID or passport, please.' },
    { speaker:'you', de:'Hier ist mein Reisepass.', en:'Here is my passport.' },
    { speaker:'staff', de:'Ich erkläre Ihnen die verschiedenen Kontomodelle.', en:'I will explain the different account models.' },
  ]},
  { id:'geldautomat', title:'At the ATM (Geldautomat)', steps:[
    { speaker:'you', de:'Entschuldigung, wo ist der nächste Geldautomat?', en:'Excuse me, where is the nearest ATM?' },
    { speaker:'staff', de:'Da drüben, neben dem Eingang.', en:'Over there, next to the entrance.' },
    { speaker:'you', de:'Kann ich hier mit ausländischer Karte abheben?', en:'Can I withdraw with a foreign card here?' },
    { speaker:'staff', de:'Ja, aber es können Gebühren anfallen.', en:'Yes, but there may be fees.' },
  ]},
];
```

- [ ] **Step 11: Create src/data/doctor.js**

```js
export const meta = { title: 'Doctor (Arzt)', emoji: '🩺', description: 'Making an appointment and visiting the doctor.', category: 'health' };
export const scenes = [
  { id:'arzt-telefon', title:'Making an appointment by phone', steps:[
    { speaker:'staff', de:'Praxis Dr. Schneider, guten Morgen.', en:'Dr. Schneider's practice, good morning.' },
    { speaker:'you', de:'Guten Morgen. Ich würde gerne einen Termin vereinbaren.', en:'Good morning. I would like to make an appointment.',
      alts:[{de:'Ich bin neu hier und suche einen Hausarzt.',en:'I'm new here and looking for a GP.'}] },
    { speaker:'staff', de:'Was ist Ihr Anliegen?', en:'What is your concern?' },
    { speaker:'you', de:'Ich habe seit drei Tagen Halsschmerzen.', en:'I have had a sore throat for three days.',
      alts:[{de:'Ich brauche eine Überweisung zum Facharzt.',en:'I need a referral to a specialist.'},{de:'Ich benötige eine Krankschreibung.',en:'I need a sick note.'}] },
    { speaker:'staff', de:'Können Sie am Dienstag um 10 Uhr?', en:'Can you come on Tuesday at 10 o'clock?' },
    { speaker:'you', de:'Ja, das passt. Auf welchen Namen?', en:'Yes, that works. Under which name?' },
    { speaker:'staff', de:'Ihren Namen, bitte, und Versicherungskarte mitbringen.', en:'Your name, please, and bring your insurance card.' },
  ]},
  { id:'arzt-rezeption', title:'At the reception desk', steps:[
    { speaker:'staff', de:'Guten Tag. Haben Sie einen Termin?', en:'Good day. Do you have an appointment?' },
    { speaker:'you', de:'Ja, um 10 Uhr, auf den Namen Kim.', en:'Yes, at 10 o'clock, under the name Kim.' },
    { speaker:'staff', de:'Ihre Versicherungskarte, bitte.', en:'Your insurance card, please.' },
    { speaker:'you', de:'Hier bitte. Ich bin neu — ich habe eine EHIC-Karte.', en:'Here you go. I'm new — I have an EHIC card.',
      alts:[{de:'Ich habe eine gesetzliche Versicherung.',en:'I have statutory health insurance.'},{de:'Ich bin privat versichert.',en:'I have private health insurance.'}] },
    { speaker:'staff', de:'Bitte füllen Sie diesen Fragebogen aus und nehmen Sie Platz.', en:'Please fill in this questionnaire and have a seat.' },
  ]},
];
```

- [ ] **Step 12: Create src/data/admin.js**

```js
export const meta = { title: 'Admin & Registration', emoji: '📋', description: 'Making appointments, Bürgeramt, and forms.', category: 'admin' };
export const scenes = [
  { id:'termin-machen', title:'Making an appointment (Termin)', steps:[
    { speaker:'you', de:'Ich würde gerne einen Termin beim Bürgeramt machen.', en:'I would like to make an appointment at the residents\' office.',
      alts:[{de:'Ich brauche einen Termin zur Ummeldung.',en:'I need an appointment to re-register my address.'}] },
    { speaker:'staff', de:'Termine buchen Sie online unter service.berlin.de.', en:'Appointments are booked online at service.berlin.de.' },
    { speaker:'you', de:'Gibt es auch Termine ohne Voranmeldung?', en:'Are there also walk-in appointments?' },
    { speaker:'staff', de:'Manchmal, aber meistens nur für dringende Fälle. Online ist sicherer.', en:'Sometimes, but mostly only for urgent cases. Online is safer.' },
  ]},
  { id:'buergeramt', title:'At the Bürgeramt', steps:[
    { speaker:'staff', de:'Ticket Nummer B42, Schalter 3 bitte.', en:'Ticket number B42, counter 3 please.' },
    { speaker:'you', de:'Guten Tag. Ich möchte mich anmelden. Hier sind meine Unterlagen.', en:'Good day. I would like to register my address. Here are my documents.',
      alts:[{de:'Ich möchte meinen Personalausweis verlängern.',en:'I would like to renew my ID card.'}] },
    { speaker:'staff', de:'Haben Sie die Wohnungsgeberbestätigung vom Vermieter?', en:'Do you have the landlord's address confirmation form?' },
    { speaker:'you', de:'Ja, hier ist das Formular.', en:'Yes, here is the form.' },
    { speaker:'staff', de:'Gut. Bitte unterschreiben Sie hier. Die Bestätigung kommt per Post.', en:'Good. Please sign here. The confirmation will come by post.' },
  ]},
  { id:'formular-ausfuellen', title:'Filling in a form', steps:[
    { speaker:'you', de:'Entschuldigung, was bedeutet dieses Feld?', en:'Excuse me, what does this field mean?' },
    { speaker:'staff', de:'Das ist das Geburtsdatum. Tag, Monat, Jahr.', en:'That is the date of birth. Day, month, year.' },
    { speaker:'you', de:'Und hier — was bedeutet "Staatsangehörigkeit"?', en:'And here — what does "Staatsangehörigkeit" mean?' },
    { speaker:'staff', de:'Das ist Ihre Nationalität. Zum Beispiel "Britisch".', en:'That is your nationality. For example "British".' },
  ]},
];
```

- [ ] **Step 13: Create src/data/housing.js**

```js
export const meta = { title: 'Housing', emoji: '🏠', description: 'Dealing with your landlord and moving in.', category: 'housing' };
export const scenes = [
  { id:'vermieter-reparatur', title:'Reporting a repair to your landlord', steps:[
    { speaker:'you', de:'Guten Tag, hier spricht Mia aus der dritten Etage. Ich habe ein Problem mit der Heizung.', en:'Good day, this is Mia from the third floor. I have a problem with the heating.',
      alts:[{de:'Es gibt ein Wasserleck in meiner Wohnung.',en:'There is a water leak in my flat.'},{de:'Meine Spülmaschine ist kaputt.',en:'My dishwasher is broken.'}] },
    { speaker:'staff', de:'Seit wann haben Sie das Problem?', en:'Since when have you had this problem?' },
    { speaker:'you', de:'Seit gestern Abend. Die Wohnung wird nicht warm.', en:'Since yesterday evening. The flat is not getting warm.' },
    { speaker:'staff', de:'Ich schicke morgen früh einen Handwerker. Wann sind Sie zu Hause?', en:'I'll send a tradesperson tomorrow morning. When will you be at home?' },
    { speaker:'you', de:'Ich bin ab 9 Uhr zu Hause.', en:'I'll be home from 9 o'clock.' },
  ]},
  { id:'einzug', title:'Moving in — collecting the keys', steps:[
    { speaker:'staff', de:'Willkommen! Hier sind Ihre Schlüssel — zwei für die Haustür, einer für die Wohnung.', en:'Welcome! Here are your keys — two for the front door, one for the flat.' },
    { speaker:'you', de:'Danke. Gibt es auch einen Briefkastenschlüssel?', en:'Thank you. Is there also a letterbox key?' },
    { speaker:'staff', de:'Ja, natürlich. Und bitte das Übergabeprotokoll unterschreiben.', en:'Yes, of course. And please sign the handover protocol.' },
    { speaker:'you', de:'Gibt es Besonderheiten bei der Mülltrennung?', en:'Are there any specifics about recycling?' },
    { speaker:'staff', de:'Ja, gelbe Tonne für Verpackungen, blaue für Papier, graue für Restmüll.', en:'Yes, yellow bin for packaging, blue for paper, grey for general waste.' },
  ]},
];
```

- [ ] **Step 14: Create src/data/airport.js**

```js
export const meta = { title: 'Airport (BER)', emoji: '✈️', description: 'Navigating Berlin Brandenburg Airport.', category: 'airport' };
export const scenes = [
  { id:'check-in', title:'At the check-in counter', steps:[
    { speaker:'staff', de:'Darf ich Ihren Reisepass und Ihre Buchungsbestätigung sehen?', en:'May I see your passport and booking confirmation?' },
    { speaker:'you', de:'Hier bitte.', en:'Here you go.' },
    { speaker:'staff', de:'Haben Sie Gepäck aufzugeben?', en:'Do you have any luggage to check in?' },
    { speaker:'you', de:'Ja, einen Koffer.', en:'Yes, one suitcase.',alts:[{de:'Nein, nur Handgepäck.',en:'No, only carry-on luggage.'}] },
    { speaker:'staff', de:'Bitte legen Sie den Koffer auf das Band.', en:'Please place the suitcase on the belt.' },
    { speaker:'staff', de:'Ihr Gate ist B14. Boarding beginnt um 14:30 Uhr.', en:'Your gate is B14. Boarding starts at 14:30.' },
  ]},
  { id:'sicherheitskontrolle', title:'Going through security', steps:[
    { speaker:'staff', de:'Bitte legen Sie alle Flüssigkeiten in den durchsichtigen Beutel.', en:'Please put all liquids in the transparent bag.' },
    { speaker:'staff', de:'Laptop und Tablets bitte separat in eine Wanne.', en:'Laptops and tablets please separately in a tray.' },
    { speaker:'you', de:'Muss ich auch die Schuhe ausziehen?', en:'Do I need to take my shoes off as well?' },
    { speaker:'staff', de:'Ja, bitte. Und den Gürtel auch.', en:'Yes, please. And the belt too.' },
    { speaker:'staff', de:'Bitte gehen Sie durch den Scanner.', en:'Please walk through the scanner.' },
  ]},
  { id:'gate', title:'At the boarding gate', steps:[
    { speaker:'staff', de:'Boarding für Flug EW 123 nach London, Gate B14.', en:'Boarding for flight EW 123 to London, Gate B14.' },
    { speaker:'you', de:'Ist das der Flug nach London Gatwick?', en:'Is this the flight to London Gatwick?' },
    { speaker:'staff', de:'Ja, genau. Ihre Bordkarte, bitte.', en:'Yes, exactly. Your boarding pass, please.' },
    { speaker:'you', de:'Ich habe eine digitale Bordkarte auf dem Handy.', en:'I have a digital boarding pass on my phone.' },
  ]},
  { id:'gepaeck-verloren', title:'Lost luggage', steps:[
    { speaker:'you', de:'Entschuldigung, mein Koffer ist nicht angekommen.', en:'Excuse me, my suitcase hasn't arrived.' },
    { speaker:'staff', de:'Tut mir leid. Haben Sie Ihre Gepäckquittung?', en:'I'm sorry. Do you have your baggage receipt?' },
    { speaker:'you', de:'Ja, hier bitte.', en:'Yes, here you go.' },
    { speaker:'staff', de:'Können Sie den Koffer beschreiben? Farbe und Marke?', en:'Can you describe the suitcase? Colour and brand?' },
    { speaker:'you', de:'Schwarz, Samsonite, mit einem orangefarbenen Band.', en:'Black, Samsonite, with an orange strap.' },
    { speaker:'staff', de:'Bitte füllen Sie dieses Formular aus. Wir melden uns innerhalb von 24 Stunden.', en:'Please fill in this form. We will get back to you within 24 hours.' },
  ]},
];
```

- [ ] **Step 15: Run validation**

```bash
node scripts/validate-dialogue.mjs
```

Expected: All 13 files print `OK`, then `All dialogue files valid.`

- [ ] **Step 16: Commit**

```bash
git add src/data/ scripts/validate-dialogue.mjs
git commit -m "feat: add all dialogue data files for 7 daily-life categories"
```

---

### Task 10: Daily pages and redirect

**Files:**
- Create: `src/pages/daily/food.astro`, `transport.astro`, `errands.astro`, `health.astro`, `admin.astro`, `housing.astro`, `airport.astro`

**Interfaces:**
- Consumes: `GuideLayout`, `DialogueGuide`, all dialogue data files
- Produces: 7 static `/daily/*` pages, full build succeeds

- [ ] **Step 1: Create src/pages/daily/food.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as doner from '../../data/doner.js';
import * as restaurant from '../../data/restaurant.js';
import * as supermarket from '../../data/supermarket.js';
import * as bakery from '../../data/bakery.js';
import * as cafe from '../../data/cafe.js';
const scenes = [...doner.scenes, ...restaurant.scenes, ...supermarket.scenes, ...bakery.scenes, ...cafe.scenes];
---
<GuideLayout title="Food & Drink — Berlin Daily Guides" description="Ordering at Döner stands, restaurants, supermarkets, bakeries, and cafés in German." currentPage="/daily/food">
  <DialogueGuide pageTitle="Food & Drink" pageEmoji="🍽️"
    pageDesc="Common conversations at Berlin food spots — Döner, restaurants, supermarkets, bakeries, and cafés."
    scenes={scenes} />
</GuideLayout>
```

- [ ] **Step 2: Create src/pages/daily/transport.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as transport from '../../data/transport.js';
---
<GuideLayout title="Transport — Berlin Daily Guides" description="U-Bahn tickets, Uber/Bolt, taxis, and buses in German." currentPage="/daily/transport">
  <DialogueGuide pageTitle="Transport" pageEmoji="🚇"
    pageDesc="U-Bahn tickets, Uber & Bolt, taxis, and asking about the bus — all in German."
    scenes={transport.scenes} />
</GuideLayout>
```

- [ ] **Step 3: Create src/pages/daily/errands.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as postamt from '../../data/postamt.js';
import * as pharmacy from '../../data/pharmacy.js';
import * as bank from '../../data/bank.js';
const scenes = [...postamt.scenes, ...pharmacy.scenes, ...bank.scenes];
---
<GuideLayout title="Errands — Berlin Daily Guides" description="Post office, pharmacy, and bank in German." currentPage="/daily/errands">
  <DialogueGuide pageTitle="Errands" pageEmoji="🏪"
    pageDesc="Post office (Postamt), pharmacy (Apotheke), and bank — getting things done in German."
    scenes={scenes} />
</GuideLayout>
```

- [ ] **Step 4: Create src/pages/daily/health.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as doctor from '../../data/doctor.js';
---
<GuideLayout title="Health — Berlin Daily Guides" description="Doctor appointments and visits in German." currentPage="/daily/health">
  <DialogueGuide pageTitle="Health" pageEmoji="🩺"
    pageDesc="Making appointments by phone and visiting the doctor — in German."
    scenes={doctor.scenes} />
</GuideLayout>
```

- [ ] **Step 5: Create src/pages/daily/admin.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as admin from '../../data/admin.js';
---
<GuideLayout title="Admin — Berlin Daily Guides" description="Bürgeramt, appointments, and forms in German." currentPage="/daily/admin">
  <DialogueGuide pageTitle="Admin & Registration" pageEmoji="📋"
    pageDesc="Termins, Bürgeramt registration, and form-filling — bureaucracy in German."
    scenes={admin.scenes} />
</GuideLayout>
```

- [ ] **Step 6: Create src/pages/daily/housing.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as housing from '../../data/housing.js';
---
<GuideLayout title="Housing — Berlin Daily Guides" description="Landlord calls and moving in, in German." currentPage="/daily/housing">
  <DialogueGuide pageTitle="Housing" pageEmoji="🏠"
    pageDesc="Reporting repairs, collecting keys, and moving in — landlord conversations in German."
    scenes={housing.scenes} />
</GuideLayout>
```

- [ ] **Step 7: Create src/pages/daily/airport.astro**

```astro
---
import GuideLayout from '../../layouts/GuideLayout.astro';
import DialogueGuide from '../../components/DialogueGuide.astro';
import * as airport from '../../data/airport.js';
---
<GuideLayout title="Airport — Berlin Daily Guides" description="Check-in, security, and more at BER, in German." currentPage="/daily/airport">
  <DialogueGuide pageTitle="Airport (BER)" pageEmoji="✈️"
    pageDesc="Check-in, security, boarding gate, and lost luggage — navigating BER in German."
    scenes={airport.scenes} />
</GuideLayout>
```

- [ ] **Step 8: Full build**

Run: `npm run build`
Expected: Build succeeds, `dist/` contains all pages:
```
dist/index.html
dist/auto/index.html
dist/bike/index.html
dist/daily/food/index.html
dist/daily/transport/index.html
dist/daily/errands/index.html
dist/daily/health/index.html
dist/daily/admin/index.html
dist/daily/housing/index.html
dist/daily/airport/index.html
```

- [ ] **Step 9: Browser verification**

Run: `npm run preview`

Check each URL:
- `/` → redirects to `/auto` ✓
- `/auto` → driving guide, canvas works, scenes play, NavBar shows ✓
- `/bike` → bike guide, green cyclist, NavBar shows ✓
- `/daily/food` → Döner + restaurant + supermarket + bakery + café bubbles ✓
- `/daily/transport` → U-Bahn + Uber + taxi + bus bubbles ✓
- `/daily/errands` → Postamt + pharmacy + bank bubbles ✓
- `/daily/health` → Doctor phone + reception bubbles ✓
- `/daily/admin` → Termin + Bürgeramt + form bubbles ✓
- `/daily/housing` → Landlord call + moving-in bubbles ✓
- `/daily/airport` → Check-in + security + gate + lost luggage bubbles ✓
- Click "▶ variations" on any bubble → alts expand inline (CSS-only) ✓
- NavBar: active page highlighted in dropdown ✓

- [ ] **Step 10: Final commit**

```bash
git add src/pages/daily/
git commit -m "feat: add all daily life guide pages — food, transport, errands, health, admin, housing, airport"
```
