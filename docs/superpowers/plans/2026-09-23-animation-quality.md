# Animation Quality — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the animation engine and UI quality of both `index.html` and `bike.html` with working traffic lights, smooth 3-phase actor easing, caption slide transitions, automatic zebra crossings, improved vehicle graphics, and mobile polish.

**Architecture:** All engine code is duplicated in the two HTML files — every engine change must be applied to both. No shared files. Changes are surgical: find-replace the specific function bodies, add new helpers before them, and add CSS in the existing `<style>` block.

**Tech Stack:** Vanilla JS, SVG, CSS animations. No build step. No dependencies.

## Global Constraints

- Every change applies to **both** `index.html` **and** `bike.html`.
- Never extract code to a shared file — both files must remain self-contained.
- Never change scene data (SCENES arrays) unless explicitly instructed.
- Never add npm/yarn or a build step.
- Test by opening `index.html` and `bike.html` directly in a browser (or via live server).

---

### Task 1: 3-phase actor easing (accelerate → cruise → brake)

**Files:**
- Modify: `index.html` (near line 286, `ease()` function and `posOf()`)
- Modify: `bike.html` (same — grep for `function ease(x)`)

**Interfaces:**
- Produces: `ease3(x: number): number` — smooth 3-phase curve replacing `ease()` in `posOf()`
- The existing `ease`, `easeOut`, `easeIn` helpers at ~line 286 remain; `ease3` is added after them

The current `ease(x)` is quadratic ease-in-out. The 3-phase version: short acceleration burst, long cruise, braking. Looks far more realistic.

**Math:** with `p = 0.22`, the cruise speed is `m = 1/(1-p)`.
- x in [0, p]:     `m*x*x/(2*p)`           — quadratic ramp up to cruise speed
- x in [p, 1-p]:   `m*(x - p/2)`           — constant velocity
- x in [1-p, 1]:   `1 - m*(1-x)*(1-x)/(2*p)` — symmetric brake

- [ ] **Step 1: Add `ease3` after the existing easing helpers in `index.html`**

Find this exact block (around line 286):
```
function ease(x){ x=Math.max(0,Math.min(1,x)); return x<.5? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }
function easeOut(x){ x=Math.max(0,Math.min(1,x)); return 1-Math.pow(1-x,3); }
function easeIn(x){ x=Math.max(0,Math.min(1,x)); return x*x; }
```

Add this line immediately after:
```
function ease3(x){ x=Math.max(0,Math.min(1,x)); const p=0.22,m=1/(1-p); if(x<p) return m*x*x/(2*p); if(x>1-p) return 1-m*(1-x)*(1-x)/(2*p); return m*(x-p/2); }
```

- [ ] **Step 2: Replace `ease()` with `ease3()` in `posOf()` in `index.html`**

In `posOf()` (around line 521) there are three `ease(` calls (in the `go` state). Replace each with `ease3(`:

Line ~525: `len = Math.min(a.total, a.total*ease(t/(this.duration)));`
Line ~527: `len = a.stop + (a.total-a.stop)*ease((t-goT)/a.travel);`
Line ~532: `len = a.stop + (a.total-a.stop)*ease((t-goT)/a.travel);`

Change all three from `ease(` to `ease3(`. Do NOT change the `easeOut(` calls — those are for the approach phase and are correct.

- [ ] **Step 3: Apply the same two edits to `bike.html`**

Grep for `function ease(x)` in bike.html, add `ease3` after it. Grep for `posOf` and replace the three `ease(` calls in the go states.

- [ ] **Step 4: Visual test**

Open both files. Play any scene with cars. Vehicles should accelerate quickly, cruise, then slow gently to stop — more physical than the old symmetric curve.

- [ ] **Step 5: Commit**

```
git add index.html bike.html
git commit -m "feat: 3-phase actor easing — accelerate, cruise, brake"
```

---

### Task 2: Working traffic lights (auto-compute light phases)

**Files:**
- Modify: `index.html` (add `computeLightPhases()` before `SceneView`, update constructor and `setTime`)
- Modify: `bike.html` (same)

**Interfaces:**
- Produces: `computeLightPhases(scene, goTs)` returning an array of `{at, S?, N?, E?, W?}` objects or null
- SceneView stores `this.lights` (computed or from scene.lights)
- `setTime()` reads `this.lights` instead of `sc.lights`

**Root cause:** `setTime()` checks `if(sc.lights && this.heads)` but no scene ever defines `scene.lights` — only `scene.road.lights` (just direction strings for drawing housings). So lights are always dark.

**Auto-compute logic:**
- One keyframe at `at: -1` — all red (initial state)
- For each `goTs[i]` group: collect `from:` directions of actors in that group. N/S axis → N/S get green; E/W axis → E/W get green; others red.
- Keyframe `at: goTs[i] - 0.4` (lights turn green just before actors move)

- [ ] **Step 1: Add `computeLightPhases` before `class SceneView` in `index.html`**

Find the exact line `class SceneView {` and insert this function immediately before it:

```
function computeLightPhases(scene, goTs){
  if(!scene.road || !scene.road.lights || !scene.road.lights.length) return null;
  const dirs = scene.road.lights;
  const kf = [{ at:-1 }]; dirs.forEach(d=>{ kf[0][d]='red'; });
  (scene.order||[]).forEach((grp,i)=>{
    const fromDirs = new Set();
    grp.forEach(id=>{ const a=(scene.actors||[]).find(x=>x.id===id); if(a && a.from) fromDirs.add(a.from); });
    const ns = fromDirs.has('S')||fromDirs.has('N');
    const ew = fromDirs.has('E')||fromDirs.has('W');
    const phase = { at:(goTs[i]||2)-0.4 };
    dirs.forEach(d=>{ phase[d] = (ns&&(d==='S'||d==='N'))||(ew&&(d==='E'||d==='W')) ? 'green' : 'red'; });
    kf.push(phase);
  });
  return kf;
}
```

- [ ] **Step 2: Set `this.lights` in the `SceneView` constructor in `index.html`**

In the `SceneView` constructor, find the line that computes `this.goTs` (the line starting with `this.goTs = [];`). Add this line immediately after:

```
    this.lights = scene.lights || computeLightPhases(scene, this.goTs);
```

- [ ] **Step 3: Update `setTime()` in `index.html`**

Find this line in `setTime()` (around line 539):
```
    if(sc.lights && this.heads){ let cur={}; sc.lights.forEach(k=>{ if(k.at<=t) cur=Object.assign({},cur,k); }); for(const d in this.heads) setLight(this.heads[d], cur[d]||'off', t); }
```

Replace with (change `sc.lights` to `this.lights` in both places):
```
    if(this.lights && this.heads){ let cur={}; this.lights.forEach(k=>{ if(k.at<=t) cur=Object.assign({},cur,k); }); for(const d in this.heads) setLight(this.heads[d], cur[d]||'off', t); }
```

- [ ] **Step 4: Apply the same three changes to `bike.html`**

Same: add `computeLightPhases` before `class SceneView`, add `this.lights =` in constructor, replace `sc.lights` with `this.lights` in `setTime`.

- [ ] **Step 5: Visual test**

`index.html`: go to a scene with traffic lights (Chapter 4, e.g. `ampel-green`). Play it. Lights should cycle red → green as actors start moving. Not all dark.

`bike.html`: go to `bk-ampel-bike` (Chapter 4). Same test.

- [ ] **Step 6: Commit**

```
git add index.html bike.html
git commit -m "feat: auto-compute traffic light phases from actor groups"
```

---

### Task 3: Caption slide-in animation

**Files:**
- Modify: `index.html` (CSS block + `Player.render()` method)
- Modify: `bike.html` (same)

**Interfaces:**
- CSS class `cap-enter` triggers a 300ms slide-up fade
- `Player._capIdx` tracks the last rendered caption index; animation fires only on change

- [ ] **Step 1: Add caption animation CSS in `index.html`**

Find `@media (prefers-reduced-motion: reduce)` (around line 164). Add these two rules immediately before it:

```
@keyframes capEnter { from{ opacity:0; transform:translateY(7px); } to{ opacity:1; transform:translateY(0); } }
.caption.cap-enter { animation: capEnter .3s ease-out both; }
```

- [ ] **Step 2: Add `_capIdx` to `Player` constructor in `index.html`**

In the `Player` constructor (around line 1320), find `this.t=0; this.last=null;` and add after it:
```
this._capIdx = -1;
```

- [ ] **Step 3: Animate caption change in `Player.render()` in `index.html`**

In `render(t)` (around line 1336), find:
```
    const text = caps[ci]||''; this.ui.cap.innerHTML = text? `<span class="stepno">${ci===0?'start':'step '+ci}</span><span>${text}</span>`:'';
```

Replace with:
```
    const text = caps[ci]||'';
    if(ci !== this._capIdx){
      this._capIdx = ci;
      const cap = this.ui.cap;
      cap.classList.remove('cap-enter');
      const inner = text ? '<span class="stepno">'+(ci===0?'start':'step '+ci)+'</span><span>'+text+'</span>' : '';
      cap.textContent = '';
      if(inner){ cap.insertAdjacentHTML('beforeend', inner); void cap.offsetWidth; cap.classList.add('cap-enter'); }
    }
```

- [ ] **Step 4: Reset `_capIdx` on replay in `index.html`**

In `Player.replay()` (around line 1328), find `this.t=0; this.quizAsked=false;` and add `this._capIdx = -1;` on the same line or just before `this.render(0)`.

- [ ] **Step 5: Apply the same four changes to `bike.html`**

Add keyframes CSS, add `this._capIdx = -1` in constructor, replace the caption update block in `render()`, add `this._capIdx = -1` in `replay()`.

- [ ] **Step 6: Visual test**

Play any scene. Caption text should slide up and fade in each time it changes step. Playing the same frame continuously should NOT re-trigger the animation.

- [ ] **Step 7: Commit**

```
git add index.html bike.html
git commit -m "feat: caption slide-in animation on step change"
```

---

### Task 4: Automatic zebra crossings at junctions

**Files:**
- Modify: `index.html` (`drawRoad()` around line 377)
- Modify: `bike.html` (same)

Zebra crossings already exist in the code (`(road.zebra||[])...`) but no scene enables them. Adding them automatically to `cross` and `T` junctions requires a one-line logic change.

- [ ] **Step 1: Update zebra logic in `drawRoad()` in `index.html`**

Find this line (around line 377):
```
  (road.zebra||[]).forEach(d=>{ const z=el('g',{fill:paint},g); for(let i=-56;i<60;i+=16) el('rect',{x:i,y:-112,width:9,height:24},z); z.setAttribute('transform',`rotate(${ROT[d]})`); });
```

Replace with:
```
  const autoZ = (type==='cross'||type==='T') && road.zebra!==false;
  const zebraDirs = road.zebra===false ? [] : (road.zebra||[]).length ? road.zebra : (autoZ ? arms : []);
  zebraDirs.forEach(d=>{ const z=el('g',{fill:paint,opacity:.5},g); for(let i=-54;i<56;i+=16) el('rect',{x:i,y:-112,width:10,height:26},z); z.setAttribute('transform',`rotate(${ROT[d]})`); });
```

Logic:
- `road.zebra === false` → no zebra (opt-out)
- `road.zebra` is an array with items → use them explicitly
- otherwise, auto-draw on all `arms` for `cross`/`T` junctions

- [ ] **Step 2: Apply the same change to `bike.html`**

Find the identical line in `bike.html`'s `drawRoad()` and replace.

- [ ] **Step 3: Visual test**

`index.html` → `rvl-1`: should show faint white zebra stripes at all four arms. On a `type:'straight'` scene: no zebra. On a `type:'round'` scene: no zebra.

- [ ] **Step 4: Commit**

```
git add index.html bike.html
git commit -m "feat: auto zebra crossings on cross/T junctions"
```

---

### Task 5: Better vehicle graphics

**Files:**
- Modify: `index.html` (`drawVehicle()` around line 451)
- Modify: `bike.html` (same, plus: `you` actor uses bike shape)

**Goal:** Replace the minimal car rectangle and the invisible bike rectangle with recognizable SVG shapes. Bounding box stays the same — path collision logic is not affected.

- [ ] **Step 1: Replace the car drawing block in `drawVehicle()` in `index.html`**

Find the `// car` comment (around line 458) and the four lines that follow (body rect, windscreen, rear window, headlights). Replace those four lines with:

```
  // car — body with shoulder-line taper
  el('path',{d:'M-11 -22 L11 -22 Q13 -22 13 -19 L13 14 Q13 22 10 22 L-10 22 Q-13 22 -13 14 L-13 -19 Q-13 -22 -11 -22 Z',fill:color,stroke:k==='you'?'#0f3a86':'#3a3d42','stroke-width':k==='you'?2.2:1.5},g);
  el('path',{d:'M-7 -20 Q-7 -9 -7 -9 L7 -9 Q7 -10 7 -20 Z',fill:'#20242a',opacity:.8},g); // windscreen
  el('rect',{x:-7,y:11,width:14,height:5,rx:1.5,fill:'#20242a',opacity:.6},g);  // rear window
  el('rect',{x:-10,y:-23,width:4,height:3,rx:1,fill:'#ffe98a'},g); el('rect',{x:6,y:-23,width:4,height:3,rx:1,fill:'#ffe98a'},g); // headlights
  el('rect',{x:-10,y:20,width:4,height:3,rx:1,fill:'#cc2200',opacity:.75},g); el('rect',{x:6,y:20,width:4,height:3,rx:1,fill:'#cc2200',opacity:.75},g); // taillights
```

- [ ] **Step 2: Replace the `bike` kind drawing block in `index.html`**

Find:
```
  if(k==='bike'){ el('rect',{x:-3,y:-16,width:6,height:32,rx:3,fill:'#222'},g); el('circle',{cx:0,cy:0,r:6.5,fill:color,stroke:'#1d4d30','stroke-width':1.5},g); el('circle',{cx:0,cy:-1,r:2.6,fill:'#1d4d30'},g); return; }
```

Replace with:
```
  if(k==='bike'){ el('circle',{cx:0,cy:10,r:7,fill:'none',stroke:'#333','stroke-width':2},g); el('circle',{cx:0,cy:-10,r:7,fill:'none',stroke:'#333','stroke-width':2},g); el('path',{d:'M0 10 L0 -2 L3 -10',fill:'none',stroke:color,'stroke-width':2.5,'stroke-linecap':'round'},g); el('path',{d:'M0 -2 L-3 -10',fill:'none',stroke:color,'stroke-width':2,'stroke-linecap':'round'},g); el('circle',{cx:0,cy:-14,r:3.5,fill:color,stroke:'#1d4d30','stroke-width':1.2},g); return; }
```

- [ ] **Step 3: Apply the same car and bike changes to `bike.html`**

Same as steps 1 and 2. But additionally in `bike.html` only:

Change the `if(k==='bike')` condition to `if(k==='bike'||k==='you')` — because in the bike guide the YOU actor is a cyclist.

Also in `bike.html` only, remove the YOU label line:
```
  if(k==='you') txt(g,0,6,'YOU',{'font-size':9,fill:'#fff','font-weight':'700'});
```
Delete or comment it out — it looks wrong on a bicycle shape.

- [ ] **Step 4: Verify `index.html` still draws YOU as a car**

In `index.html`, confirm `if(k==='bike')` does NOT have `||k==='you'`. The blue YOU car should still use the car drawing code. And the `if(k==='you') txt(...)` line should remain.

- [ ] **Step 5: Visual test**

`index.html` → `rvl-1`: Blue YOU car and gray opponent car should both look like cars with visible windscreens, taillights.

`bike.html` → `bk-turn-right`: Green YOU should look like a bicycle (two circles + frame + head dot). Other `bike` actors same.

- [ ] **Step 6: Commit**

```
git add index.html bike.html
git commit -m "feat: improved car and cyclist SVG shapes in drawVehicle"
```

---

### Task 6: UI and mobile polish

**Files:**
- Modify: `index.html` (CSS block + `route()` function)
- Modify: `bike.html` (same)

**Changes:**
1. Scene content fades in on navigation
2. Caption: slightly larger, better contrast
3. Mobile: controls wrap + stage max-height

- [ ] **Step 1: Add scene fade-in CSS in `index.html`**

Find `@media (prefers-reduced-motion: reduce)` (around line 164). Add before it:

```
@keyframes mainFade { from{ opacity:0; transform:translateY(5px); } to{ opacity:1; transform:translateY(0); } }
.main.scene-enter { animation: mainFade .22s ease-out both; }
```

- [ ] **Step 2: Trigger fade in `route()` in `index.html`**

In `route()` (around line 1220), after the `if(k==='s')...else renderHome();` line, add:

```
  main.classList.remove('scene-enter'); void main.offsetWidth; main.classList.add('scene-enter');
```

- [ ] **Step 3: Improve caption CSS in `index.html`**

Find the `.caption` CSS rule. Replace it entirely with:

```
.caption{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:10px 14px;font-size:14px;line-height:1.5;min-height:3.4em;display:flex;align-items:flex-start;gap:10px}
.caption .stepno{font:600 10px var(--mono);letter-spacing:.06em;color:var(--faint);text-transform:uppercase;flex:none;padding-top:3px;min-width:36px}
```

- [ ] **Step 4: Fix mobile controls in `index.html`**

In the `@media (max-width:900px)` block (around line 155), add:

```
  .controls{flex-wrap:wrap;gap:6px}
  .controls button{padding:7px 10px;font-size:12px}
  .stage > svg{max-height:280px}
```

- [ ] **Step 5: Apply the same four CSS/JS changes to `bike.html`**

Same: add `@keyframes mainFade` + `.main.scene-enter`, add `main.classList` line in `route()`, replace `.caption` CSS, add mobile controls wrap.

- [ ] **Step 6: Visual test**

Click between scenes in both files — content should fade in smoothly. Captions should be readable. On mobile (or narrow browser), the Play/Step/Replay/Speed/Quiz buttons should wrap to two rows instead of overflowing.

- [ ] **Step 7: Commit**

```
git add index.html bike.html
git commit -m "feat: scene fade-in, caption polish, mobile controls wrap"
```

---

## Self-Review

| Spec item | Task |
|-----------|------|
| Working traffic lights | Task 2 |
| Smooth actor easing | Task 1 |
| Better vehicle graphics | Task 5 |
| Zebra crossings | Task 4 |
| Caption slide transitions | Task 3 |
| UI/layout polish | Task 6 |

All 6 spec items covered. No TBDs. No placeholder text. Type consistency verified — `ease3`, `computeLightPhases`, `this.lights`, `_capIdx` all used consistently within their task scope.
