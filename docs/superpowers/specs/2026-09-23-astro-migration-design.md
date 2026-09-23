# Astro Migration — Design Spec

**Date:** 2026-09-23  
**Project:** driving-guide-berlin (Vercel)  
**Status:** Approved

---

## Overview

Migrate the Berlin driving guide (currently two standalone HTML files) to an Astro static site. The site expands beyond driving to cover daily-life conversation guides for foreigners living in Berlin — all scenes presented as DE/EN dialogues with phrase variations.

---

## Architecture

### Tech stack

- **Astro** with `output: 'static'` — zero adapter, zero server
- **Plain JS** — no Svelte, no React; the existing canvas engine stays vanilla
- **Vercel** — auto-detects Astro, deploys `dist/` as static files, existing domain unchanged

### File structure

```
driving-guide-berlin/
├── astro.config.mjs
├── src/
│   ├── lib/
│   │   ├── engine.js          ← canvas scene engine (extracted from index.html/bike.html)
│   │   └── signs.js           ← SVG sign library (extracted)
│   ├── data/
│   │   ├── scenes-auto.js     ← SCENES + CHAPTERS for car guide
│   │   ├── scenes-bike.js     ← SCENES + CHAPTERS for bike guide
│   │   ├── doner.js           ← döner dialogue steps
│   │   ├── gas.js             ← gas station dialogue steps
│   │   ├── restaurant.js      ← restaurant dialogue steps
│   │   ├── supermarket.js
│   │   ├── bakery.js
│   │   ├── cafe.js
│   │   ├── transport.js       ← U-Bahn/S-Bahn, Uber/Bolt, taxi, bus
│   │   ├── postamt.js         ← post office
│   │   ├── pharmacy.js
│   │   ├── bank.js
│   │   ├── doctor.js          ← doctor appointment + phone call to clinic
│   │   ├── admin.js           ← Termin, Bürgeramt, forms
│   │   ├── housing.js         ← landlord call, repair request
│   │   └── airport.js         ← check-in, security, gate, lost luggage
│   ├── layouts/
│   │   └── GuideLayout.astro  ← shared shell: head, NavBar, theme CSS vars
│   ├── components/
│   │   ├── NavBar.astro       ← grouped dropdown nav (see Navigation section)
│   │   ├── SceneGuide.astro   ← sidebar + canvas shell for driving guides
│   │   └── DialogueGuide.astro← card-deck layout for conversation guides
│   └── pages/
│       ├── index.astro        ← redirect → /auto
│       ├── auto.astro
│       ├── bike.astro
│       └── daily/
│           ├── food.astro
│           ├── transport.astro
│           ├── errands.astro
│           ├── health.astro
│           ├── admin.astro
│           ├── housing.astro
│           └── airport.astro
└── public/
    └── favicon.svg
```

---

## URLs

| Page | URL |
|------|-----|
| Car guide | `/auto` |
| Bike guide | `/bike` |
| Food & drink | `/daily/food` |
| Transport | `/daily/transport` |
| Errands | `/daily/errands` |
| Health | `/daily/health` |
| Admin | `/daily/admin` |
| Housing | `/daily/housing` |
| Airport | `/daily/airport` |
| Root | `/` → redirect to `/auto` |

---

## Navigation

Top nav bar — two grouped dropdowns plus a language toggle placeholder:

```
[ Driving ▾ ]   [ Daily Life ▾ ]
  • Auto           • Food & drink
  • Bike           • Transport
                   • Errands
                   • Health
                   • Admin
                   • Housing
                   • Airport
```

Plain HTML `<details>`/`<summary>` dropdowns (no JS required). Active page highlighted. Same `NavBar.astro` rendered on every page via `GuideLayout.astro`.

---

## Dialogue content format

Each daily-life data file exports `meta` and `steps`:

```js
// src/data/doner.js
export const meta = {
  title: 'Döner Kebab',
  emoji: '🥙',
  description: 'How to order at a Döner stand',
  category: 'food',
};

export const steps = [
  {
    speaker: 'staff',        // 'staff' | 'you'
    de: 'Was darf es sein?',
    en: 'What can I get you?',
    alts: [
      { de: 'Bitte schön?', en: 'Yes please?' },
      { de: 'Was kann ich Ihnen bringen?', en: 'What can I bring you?' },
    ],
  },
  {
    speaker: 'you',
    de: 'Einen Döner, bitte.',
    en: 'A döner, please.',
    alts: [
      { de: 'Ich hätte gerne einen Döner.', en: 'I would like a döner.' },
    ],
  },
];
```

`DialogueGuide.astro` renders steps as chat bubbles — staff left, you right. German text large, English translation small below. An inline "▾ variations" toggle (CSS-only `<details>`) reveals `alts` beneath each bubble. No JS required.

---

## Driving guide migration

`SceneGuide.astro` outputs the sidebar + `<canvas>` HTML shell. A `<script>` tag at the bottom imports `engine.js` and `signs.js` from `src/lib/` and initialises the scene player with the imported scene data. The engine code is identical to the current HTML files — no rewrite, extraction only.

`scenes-auto.js` and `scenes-bike.js` are the `SCENES` and `CHAPTERS` arrays cut verbatim from `index.html` and `bike.html`.

---

## Vercel deployment

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://driving-guide-berlin.vercel.app',
});
```

No `vercel.json` needed. Vercel auto-detects Astro, runs `astro build`, deploys `dist/`. Existing domain and `/bike` URL are preserved.

---

## Out of scope

- Language toggle / i18n routing (UI placeholder only, no implementation)
- Night mode
- Animations or interactive elements in dialogue guides
- Any backend, database, or server-side rendering
- Sharing or saving phrases
