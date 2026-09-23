# Berlin Bike Guide — Design Spec

**Date:** 2026-09-23  
**Project:** driving-guide-berlin (Vercel)  
**Status:** Approved

---

## Overview

Add a companion cyclist guide (`bike.html`) to the existing Berlin car driving guide (`index.html`). Both pages live on `driving-guide-berlin.vercel.app` and link to each other via a small navigation pill in the sidebar brand header.

---

## Architecture

### File structure

```
driving-guide-berlin.vercel.app/        → index.html  (auto guide, unchanged except nav pill)
driving-guide-berlin.vercel.app/bike    → bike.html   (new bike guide)
```

### Implementation approach

`bike.html` is a full copy of `index.html`'s engine — styles, CSS variables, sign library, road/actor/player code, scene engine — with its own `SCENES`, `CHAPTERS`, brand name, and color adjustments. No shared JS/CSS files; the engine is self-contained in each HTML file.

### "You" actor

On the bike guide the player's vehicle is always the **green cyclist** (`COL.bike = '#3DAE6B'`), rendered as the existing `bikeIcon` SVG. The home page legend reads "You (cyclist)" in green. All scenes are written from the cyclist's point of view.

---

## Cross-navigation

A small pill link is added inside the brand header in the sidebar of each page:

| Page | Pill label | `href` |
|------|-----------|--------|
| `index.html` (auto) | `🚲 Bike guide →` | `/bike` |
| `bike.html` (bike) | `🚗 Auto guide →` | `/` |

Style: same font/color as `.brand small`, pill shape with `var(--accent-soft)` background. No JS required — plain `<a>` tags.

---

## Chapters and scenes (~24 scenes across 6 chapters)

### Chapter 1 — Right-of-way at crossings (Vorfahrt)
Rules cyclist must follow at unsigned and signed crossings.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-rvl-right` | Car on your right goes first | Rechts-vor-Links: car from the right yields to nobody |
| `bk-rvl-left` | Car on your left waits | You are on the right of the approaching car |
| `bk-rvl-3way` | Three-way crossing | Applying Rechts-vor-Links with three actors |
| `bk-priority-on` | You're on the priority road | Side-street car must yield to you |
| `bk-priority-off` | You're on the side street | You yield to the priority road car |

### Chapter 2 — Bike infrastructure (Radwege & Straßen)
Signs and lane types that define where and how cyclists ride.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-radweg` | Mandatory cycle path | Sign 237: you must use it; cars turning across it yield to you |
| `bk-schutzstreifen` | Dashed lane (Schutzstreifen) | Cars may cross only if necessary; you have priority |
| `bk-radfahrstreifen` | Solid lane (Radfahrstreifen) | Cars may never cross the solid line |
| `bk-fahrradstrasse` | Bicycle street | You set the pace; cars are guests at max 30 km/h |

### Chapter 3 — Turning (Abbiegen)
How cyclists signal and execute turns safely.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-turn-right` | Turning right | Signal right, shoulder check, yield to pedestrians on the crossing |
| `bk-turn-left-direct` | Left turn — direct | Signal left, wait for oncoming, turn when clear |
| `bk-turn-left-indirect` | Left turn — two-stage (indirekt) | Cross straight, wait at far corner, go with the new green |
| `bk-leave-lane` | Leaving the cycle lane to turn left | Check mirror, signal, merge into traffic early |

### Chapter 4 — Traffic lights (Ampeln)
Cyclist-specific signals and advance boxes.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-ampel-bike` | Bike traffic light | Small bike signal controls your phase, not the car signal |
| `bk-aufstellflaeche` | Advance box (Aufstellstreifen) | Filter to the front during red; cars stay behind the line |
| `bk-gruenpfeil` | Green arrow for bikes | Turn right on red after stopping — only if clear |
| `bk-red` | Red means stop | Cyclists must stop at red; Fahrradstraße does not change this |

### Chapter 5 — Trams and dooring (Straßenbahn & Türen)
The two most common Berlin cyclist hazards.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-tram-tracks` | Crossing tram tracks | Cross at a wide angle (≥45°) to avoid wheel trapping |
| `bk-dooring` | The door zone | Ride 1 m from parked cars; a door can open at any moment |
| `bk-tram-stop` | Stopped tram at a stop | Slow to walking pace, yield to passengers boarding/alighting |

### Chapter 6 — Special cases (Sonderfälle)
Edge cases every Berlin cyclist encounters.

| Scene ID | Title | Key rule |
|----------|-------|----------|
| `bk-oneway-free` | One-way open both ways | "Radverkehr frei" plate: you ride against traffic legally |
| `bk-living-street` | Living street | Walking pace; pedestrians and children have full street access |
| `bk-sidewalk` | Sidewalk rules | Forbidden for adults unless signed; children under 8 must use it |
| `bk-railway` | Railway crossing | Dismount if barriers are down; never race a train |

---

## Changes to `index.html`

One addition only: a `🚲 Bike guide →` pill `<a>` inside `.brand`, linking to `/bike`. No other changes.

---

## Out of scope

- Shared JS/CSS extraction (Option B)
- A single-file mode toggle (Option C)
- Night mode or language toggle differences between the two guides
- Adding new scenes to the auto guide
