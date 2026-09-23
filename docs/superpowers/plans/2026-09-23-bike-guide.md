# Berlin Bike Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `bike.html` — a cyclist-perspective companion to `index.html` — and add cross-navigation pills between both guides.

**Architecture:** Copy the full engine from `index.html` into `bike.html`, make three targeted engine edits (actor color, actor shape, quiz label), replace `SCENES`/`CHAPTERS` with 24 bike-perspective scenes across 6 chapters, update branding. Add one `<a>` pill to each file. No shared JS/CSS.

**Tech Stack:** Vanilla HTML/CSS/JS, SVG, deployed as static files on Vercel (`driving-guide-berlin.vercel.app`).

## Global Constraints

- `bike.html` must be fully self-contained — no external JS/CSS dependencies added
- The "you" actor must render as a green cyclist (not a blue car) everywhere in bike.html
- `COL.you` in bike.html = `'#3DAE6B'` (same as `COL.bike`)
- Cross-nav link from index.html → `/bike`; from bike.html → `/`
- All scene IDs are prefixed `bk-` to avoid collision with auto guide IDs
- All 24 scenes must animate and play without JS errors

---

### Task 1: Add cross-nav pill to index.html

**Files:**
- Modify: `index.html:163-166`

- [ ] **Step 1: Edit the brand block**

Find this in `index.html` (lines ~163-166):
```html
    <div class="brand">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="6" fill="#F2D53C"/><rect x="9" y="9" width="22" height="22" fill="#fff"/><rect x="13" y="13" width="14" height="14" fill="#F2D53C"/></svg>
      <div><h1>Berlin Kreuzung</h1><small>Who goes first, and why</small></div>
    </div>
```

Replace with:
```html
    <div class="brand">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="6" fill="#F2D53C"/><rect x="9" y="9" width="22" height="22" fill="#fff"/><rect x="13" y="13" width="14" height="14" fill="#F2D53C"/></svg>
      <div><h1>Berlin Kreuzung</h1><small>Who goes first, and why</small></div>
      <a href="/bike" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:4px 10px;border-radius:99px;background:var(--go-soft);color:var(--go);font:600 12px var(--body);text-decoration:none;white-space:nowrap">🚲 Bike guide →</a>
    </div>
```

- [ ] **Step 2: Verify locally**

Open http://localhost:3000 — confirm the green pill appears below the subtitle in the sidebar. Clicking it will 404 until bike.html is created (expected).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add bike guide nav pill to auto guide sidebar"
```

---

### Task 2: Create bike.html

**Files:**
- Create: `bike.html`

This is a copy of `index.html` with 5 categories of changes:
1. Brand block updated + reverse nav pill (→ auto guide)
2. `COL.you` changed to green, `drawVehicle` kind='you' renders as cyclist
3. Quiz label "You (blue)" → "You (cyclist)"
4. `CHAPTERS` array replaced with 6 bike chapters
5. `SCENES` array replaced with 24 bike scenes
6. `renderHome` text updated for cyclist audience

- [ ] **Step 1: Copy index.html to bike.html**

```bash
cp /Users/johnnykoo/repos/koostory/driving-guide/index.html \
   /Users/johnnykoo/repos/koostory/driving-guide/bike.html
```

- [ ] **Step 2: Update `<title>` and meta description**

Find:
```html
<meta name="description" content="Animated guide to Berlin driving rules: who goes first at crossings, signs, turning, trams, cyclists.">
<title>Berlin Kreuzung</title>
```
Replace with:
```html
<meta name="description" content="Animated guide to Berlin cycling rules: right-of-way at crossings, bike infrastructure, turning, traffic lights, trams and dooring.">
<title>Berlin Radfahren</title>
```

- [ ] **Step 3: Update brand block with reverse nav pill**

Find (the brand block just edited in index.html, but still original in bike.html):
```html
    <div class="brand">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="6" fill="#F2D53C"/><rect x="9" y="9" width="22" height="22" fill="#fff"/><rect x="13" y="13" width="14" height="14" fill="#F2D53C"/></svg>
      <div><h1>Berlin Kreuzung</h1><small>Who goes first, and why</small></div>
    </div>
```
Replace with:
```html
    <div class="brand">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="6" fill="#3DAE6B"/><rect x="9" y="9" width="22" height="22" fill="#fff"/><circle cx="20" cy="20" r="7" fill="#3DAE6B"/></svg>
      <div><h1>Berlin Radfahren</h1><small>Rules of the road for cyclists</small></div>
      <a href="/" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:4px 10px;border-radius:99px;background:var(--accent-soft);color:var(--accent);font:600 12px var(--body);text-decoration:none;white-space:nowrap">🚗 Auto guide →</a>
    </div>
```

- [ ] **Step 4: Change `COL.you` to green**

Find:
```js
const COL = { you:'#2F6FDB', bvg:'#F2D53C', bike:'#3DAE6B', ped:'#F3EBD3', amb:'#F7F7F7', cars:['#D5D9DE','#D8C39A','#9C7A5A','#7FA5B5'] };
```
Replace with:
```js
const COL = { you:'#3DAE6B', bvg:'#F2D53C', bike:'#3DAE6B', ped:'#F3EBD3', amb:'#F7F7F7', cars:['#D5D9DE','#D8C39A','#9C7A5A','#7FA5B5'] };
```

- [ ] **Step 5: Update `drawVehicle` to render kind='you' as a cyclist**

Find the full car-rendering block inside `drawVehicle` (starts after the ambulance return):
```js
  // car
  el('rect',{x:-12,y:-22,width:24,height:44,rx:6,fill:color,stroke: k==='you'?'#0f3a86':'#3a3d42','stroke-width': k==='you'?2.2:1.5},g);
  el('rect',{x:-9,y:-14,width:18,height:8,rx:2,fill:'#20242a',opacity:.75},g);   // windscreen
  el('rect',{x:-9,y:12,width:18,height:5,rx:2,fill:'#20242a',opacity:.55},g);      // rear window
  el('rect',{x:-9,y:-22,width:4,height:2.5,fill:'#fff7cf'},g); el('rect',{x:5,y:-22,width:4,height:2.5,fill:'#fff7cf'},g);
  // indicators (front + rear), toggled by the engine
  const side = (a.turn==='left'||a.turn==='leftwide'||a.turn==='uturn') ? -1 : (a.turn==='right'||a.turn==='bikeright') ? 1 : 0;
  const s = a.indicator!=null ? a.indicator : side;
  if(s){ const ind = el('g',{class:'ind',opacity:0},g); el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},ind); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},ind); }
  if(a.hazard){ const hz = el('g',{class:'ind hazard',opacity:0},g); [-1,1].forEach(s=>{ el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},hz); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},hz); }); }
  if(k==='you') txt(g,0,6,'YOU',{'font-size':9,fill:'#fff','font-weight':'700'});
```

Replace with:
```js
  if(k==='you'){
    // cyclist "you" — larger green bike with YOU label
    el('rect',{x:-3,y:-18,width:6,height:36,rx:3,fill:'#1a1a1a'},g);
    el('circle',{cx:0,cy:0,r:9,fill:color,stroke:'#1a5a30','stroke-width':2},g);
    el('circle',{cx:0,cy:-1,r:3.5,fill:'#1a5a30'},g);
    txt(g,0,20,'YOU',{'font-size':9,fill:color,'font-weight':'700'});
    return;
  }
  // car
  el('rect',{x:-12,y:-22,width:24,height:44,rx:6,fill:color,stroke:'#3a3d42','stroke-width':1.5},g);
  el('rect',{x:-9,y:-14,width:18,height:8,rx:2,fill:'#20242a',opacity:.75},g);
  el('rect',{x:-9,y:12,width:18,height:5,rx:2,fill:'#20242a',opacity:.55},g);
  el('rect',{x:-9,y:-22,width:4,height:2.5,fill:'#fff7cf'},g); el('rect',{x:5,y:-22,width:4,height:2.5,fill:'#fff7cf'},g);
  const side = (a.turn==='left'||a.turn==='leftwide'||a.turn==='uturn') ? -1 : (a.turn==='right'||a.turn==='bikeright') ? 1 : 0;
  const s = a.indicator!=null ? a.indicator : side;
  if(s){ const ind = el('g',{class:'ind',opacity:0},g); el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},ind); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},ind); }
  if(a.hazard){ const hz = el('g',{class:'ind hazard',opacity:0},g); [-1,1].forEach(s=>{ el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},hz); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},hz); }); }
```

- [ ] **Step 6: Update quiz label for "you" actor**

Find:
```js
id==='you'?'You (blue)':id
```
Replace with:
```js
id==='you'?'You (cyclist)':id
```

- [ ] **Step 7: Replace CHAPTERS array**

Find the entire CHAPTERS array:
```js
const CHAPTERS = [
  { n:1, title:'Right before left', de:'Rechts vor Links', desc:'The default rule at every crossing without signs — and the cases where it silently switches off.' },
  ...
  { n:10, title:'Berlin parking & local rules', de:'Parken in Berlin', desc:'Resident zones, no-stopping variants, parking direction, the Umweltzone, 30 km/h main roads.' },
];
```

Replace with:
```js
const CHAPTERS = [
  { n:1, title:'Right-of-way at crossings', de:'Vorfahrt', desc:'Rechts-vor-Links, priority roads and give-way triangles — all apply to cyclists exactly as to cars.' },
  { n:2, title:'Bike infrastructure', de:'Radwege & Straßen', desc:'Mandatory cycle paths, dashed and solid lanes, bicycle streets — where you must ride and who yields.' },
  { n:3, title:'Turning', de:'Abbiegen', desc:'Right turns, direct and two-stage left turns, and leaving the cycle lane safely.' },
  { n:4, title:'Traffic lights', de:'Ampeln', desc:'Bike signals, the advance box, the green arrow, and why red always means stop.' },
  { n:5, title:'Trams and dooring', de:'Straßenbahn & Türen', desc:'Crossing tram tracks, the door zone, and what to do at a tram stop without an island.' },
  { n:6, title:'Special cases', de:'Sonderfälle', desc:'One-way streets open both ways, living streets, sidewalk rules, and railway crossings.' },
];
```

- [ ] **Step 8: Replace SCENES array**

Find `const SCENES = [` through the closing `);` before `// ---- App: routing, views, player ----`.

Replace the entire SCENES array with:

```js
const SCENES = [
// ===== Chapter 1: Right-of-way at crossings =====
{ id:'bk-rvl-right', ch:1, title:'Car on your right goes first', de:'Rechts vor Links – Auto von rechts',
  road:{},
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'E',label:'Car from the right'}],
  order:[['a'],['you']],
  captions:['An unsigned crossing. A car comes from your right.','Rechts-vor-Links applies to cyclists too: the car on your right goes first.','The road is clear — you go.'],
  rule:'At an unsigned crossing the vehicle on your right has priority — whether you are in a car or on a bike. Slow down before the edge, look right, and only enter when clear.',
  mistake:'Assuming cyclists have special priority or no priority. You follow the same Rechts-vor-Links rules as every other vehicle.',
  stvo:'§ 8 Abs. 1 StVO' },
{ id:'bk-rvl-left', ch:1, title:'Car on your left waits for you', de:'Auto von links wartet',
  road:{},
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'W',label:'Car from the left'}],
  order:[['you'],['a']],
  captions:['A car comes from your left.','You are on its right: you have priority. Go — confidently.','Make eye contact if possible; smaller vehicles are easier to overlook. Then the car goes.'],
  rule:'When you are to the right of the approaching vehicle, you have priority. Ride assertively rather than hesitating — mixed signals are a common cause of crossing accidents.',
  mistake:'Waving the car through when you have priority. Take your turn; hesitation confuses drivers.',
  stvo:'§ 8 Abs. 1 StVO' },
{ id:'bk-rvl-3way', ch:1, title:'Three vehicles at once', de:'Drei Fahrzeuge gleichzeitig',
  road:{},
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'E',label:'Car from right'},{id:'b',kind:'car',from:'W',label:'Car from left'}],
  order:[['a'],['you'],['b']],
  captions:['Three vehicles arrive at the same time. Apply Rechts-vor-Links in sequence.','The east car has nobody on its right — it goes first.','Now you: the west car is on your left, so you go next.','The west car goes last.'],
  rule:'With three vehicles, work out the order by asking "who has a clear right?" repeatedly. It always produces a clear sequence if everyone reads the same rule.',
  mistake:'Freezing when more than two vehicles arrive. Pick a side, look right, then go or wait.',
  stvo:'§ 8 Abs. 1 StVO' },
{ id:'bk-priority-on', ch:1, title:'You are on the priority road', de:'Auf der Vorfahrtstraße',
  road:{wait:['E','W']}, signs:[{code:'306',at:'S'},{code:'205',at:'E'},{code:'205',at:'W'}],
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'E',label:'Car on side street'}],
  order:[['you'],['a']],
  captions:['Yellow diamond: you are on a priority road. The side street has a give-way triangle.','The car must wait for you — just as it would for any vehicle on the priority road.','Go. Priority roads protect cyclists and cars equally.'],
  rule:'A cyclist on a priority road has the same right of way as a car. Side streets must yield. Ride visibly and at a speed that lets you stop if a driver fails to see you.',
  mistake:'Thinking the car will definitely stop. Priority does not mean safe — always be ready to brake.',
  stvo:'Zeichen 306, § 8 StVO' },
{ id:'bk-priority-off', ch:1, title:'You are on the side street', de:'Aus der Nebenstraße',
  road:{wait:['S']}, signs:[{code:'205',at:'S'}],
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'W',through:true,label:'Car on priority road'}],
  order:[['a'],['you']],
  captions:['A give-way triangle: you must yield to the main road.','Wait for the car to pass. Do not roll out expecting the driver to stop.','When clear, join the main road.'],
  rule:'A give-way triangle means stop or slow to a standstill if necessary — whether you are in a car or on a bike. Cyclists sometimes roll through these at speed. That is a fine and a crash risk.',
  mistake:'Treating the triangle as a "slow down" sign. If a vehicle is close, stop completely.',
  stvo:'Zeichen 205, § 8 StVO' },

// ===== Chapter 2: Bike infrastructure =====
{ id:'bk-radweg', ch:2, title:'Mandatory cycle path: cars must yield', de:'Benutzungspflichtiger Radweg',
  road:{bike:['NS']}, signs:[{code:'237',x:112,y:260,size:32},{code:'209',x:80,y:60,size:28}],
  actors:[{id:'you',kind:'you',from:'S',turn:'bike',through:true,travel:3},{id:'a',kind:'car',from:'S',turn:'right',delay:.8,label:'Car turning right'}],
  order:[['you'],['a']],
  captions:['Sign 237: you must use the cycle path. A car turns right across it.','You are going straight — you have priority over the turning car.','The car must wait for you before crossing the cycle path. Look for it anyway.'],
  rule:'Sign 237 makes the cycle path mandatory. When a car turns across it, you have priority: the turning driver must yield. This applies even if the path runs on the pavement — watch for drivers who do not check far enough.',
  mistake:'Assuming the turning car has seen you. Approach turns at a speed you can stop from.',
  stvo:'Zeichen 237, § 9 Abs. 3 StVO' },
{ id:'bk-schutzstreifen', ch:2, title:'Dashed lane: your space on the road', de:'Schutzstreifen – gestrichelte Linie',
  road:{type:'straight',bikeLane:['S']},
  actors:[{id:'you',kind:'you',path:'M48 330 L48 -330',stop:0,through:true,travel:9},{id:'a',kind:'car',path:'M30 -330 L30 330',stop:0,through:true,travel:9,label:'Car behind'}],
  order:[['you','a']], duration:9,
  captions:['The dashed line is a Schutzstreifen — a recommended cyclist lane on the road.','Cars may cross the dashes only when necessary and must not endanger you. You have priority within the stripe.','Ride in the middle of the stripe, not the edge — the gutter has drains, gravel, and doors.'],
  rule:'The Schutzstreifen (Zeichen 340) is not physically exclusive to cyclists, but you have priority within it. A driver who forces you off your line is liable. Ride confidently in the centre of the stripe.',
  mistake:'Riding at the very right edge of the Schutzstreifen. The space near the kerb and parked cars is the most dangerous part.',
  stvo:'§ 42 StVO, Zeichen 340' },
{ id:'bk-radfahrstreifen', ch:2, title:'Solid lane: cars may never cross', de:'Radfahrstreifen – durchgezogene Linie',
  road:{type:'straight',bikeLane:['S']},
  actors:[{id:'you',kind:'you',path:'M48 330 L48 -330',stop:0,through:true,travel:9},{id:'a',kind:'car',path:'M30 -330 L30 330',stop:0,through:true,travel:9,label:'Car beside'}],
  order:[['you','a']], duration:9,
  captions:['A solid white line marks a Radfahrstreifen — a protected cycle lane. You must use it.','Unlike the dashed Schutzstreifen, cars may never cross this line. The lane is legally yours.','Ride with confidence; a driver who enters the solid lane is breaking the law.'],
  rule:'The Radfahrstreifen (solid line, Zeichen 237 combined) is legally exclusive to cyclists. Cars cannot enter. You must ride in it. It offers stronger protection than the dashed Schutzstreifen.',
  mistake:'Mixing up solid and dashed lanes. The solid line is harder to see from the bike — look for the sign.',
  stvo:'§ 41 StVO, Zeichen 237, § 2 Abs. 4 StVO' },
{ id:'bk-fahrradstrasse', ch:2, title:'Bicycle street: you set the pace', de:'Fahrradstraße',
  road:{type:'straight'}, signs:[{code:'244.1',x:86,y:260,size:34},{'code':'kfzfrei',x:86,y:220,size:28}],
  actors:[{id:'you',kind:'you',from:'S',through:true,travel:9},{id:'b1',kind:'bike',from:'S',through:true,travel:9,delay:.3,label:'Another cyclist'},{id:'a',kind:'car',from:'S',through:true,travel:9,delay:.8,label:'Car (guest)'}],
  order:[['you','b1','a']], duration:11,
  captions:['A Fahrradstraße. The plate says cars are allowed — as guests.','You and other cyclists own the lane; you may ride side by side.','The car follows at your pace — max 30 km/h. It may not overtake unless 1.5 m clearance is possible.'],
  rule:'In a bicycle street you set the tempo. Cyclists may ride two abreast. Cars (if the plate allows them) drive at most 30 km/h and must not push or overtake at less than 1.5 m. Honking is a fine.',
  mistake:'Riding single file to let the car pass. You have priority here — hold your line.',
  berlin:'Berlin has dozens of bicycle streets: Linienstraße, Bergmannstraße, Stargarder Straße and many Kiez streets. Most say "Anlieger frei" — only local traffic by car.',
  stvo:'§ 41 StVO, Zeichen 244.1' },

// ===== Chapter 3: Turning =====
{ id:'bk-turn-right', ch:3, title:'Turning right: signal and check', de:'Rechtsabbiegen',
  road:{}, signs:[{code:'306',at:'S'},{code:'306',at:'E'}],
  actors:[{id:'you',kind:'you',from:'S',turn:'right'},{id:'p',kind:'ped',path:'M132 100 L-100 100',stop:0,noIntent:true,label:'Pedestrian crossing'}],
  order:[['p'],['you']],
  captions:['You want to turn right. A pedestrian is crossing the road you are entering.','Signal right early. Slow down and look right — pedestrians crossing the entry road have priority.','When the crossing is clear, turn.'],
  rule:'Turning right, you must yield to pedestrians crossing the road you are entering. Signal early (right hand out or using a bell-button if fitted). Look behind you before moving right — overtaking cyclists may come from behind.',
  mistake:'Cutting the corner tightly. Swing wide enough to see into the pavement before committing to the turn.',
  stvo:'§ 9 Abs. 3 StVO' },
{ id:'bk-turn-left-direct', ch:3, title:'Left turn: direct', de:'Linksabbiegen – direkt',
  road:{bike:['NS']}, signs:[{code:'306',at:'S'},{code:'306',at:'N'},{code:'306',at:'W'}],
  actors:[{id:'you',kind:'you',from:'S',turn:'left'},{id:'b',kind:'car',from:'N',through:true,label:'Oncoming car'},{id:'bk',kind:'bike',from:'N',turn:'bike',through:true,delay:.5,label:'Oncoming cyclist'}],
  order:[['b','bk'],['you']],
  captions:['You want to turn left. Oncoming traffic — a car and a cyclist — comes toward you.','Everything coming straight toward you goes first: cars, cyclists on the cycle path.','Signal left (extend left arm). Wait until the road is clear, then turn.'],
  rule:'Turning left, yield to all oncoming traffic: cars, cyclists on the cycle path beside the road, and trams. The oncoming cyclist is easy to miss — they are faster than they look and often on a path hidden by parked cars.',
  mistake:'Watching only the car lane and missing the oncoming cycle path.',
  stvo:'§ 9 Abs. 3 StVO' },
{ id:'bk-turn-left-indirect', ch:3, title:'Left turn: two-stage (indirekt)', de:'Indirektes Linksabbiegen',
  road:{lights:['S','N','E','W']},
  actors:[{id:'you',kind:'you',from:'S',turn:'left'}],
  order:[['you']], duration:8,
  captions:['At a busy junction, the indirect left turn is safer: go straight through with the green, then wait at the far corner.','Turn your bike to face the new direction and wait for the green on that signal.','When the new light turns green, go. You have completed a safe two-stage left turn.'],
  rule:'The indirect left turn (indirektes Linksabbiegen) is always allowed and often safer. Cross straight first, wait at the far corner facing your new direction, then go with the next green. No cutting across traffic.',
  mistake:'Starting the two-stage turn too late — ending up in the middle of the junction. Cross all the way to the far kerb before stopping.',
  stvo:'§ 9 StVO' },
{ id:'bk-leave-lane', ch:3, title:'Leave the cycle lane to turn left', de:'Radweg verlassen zum Linksabbiegen',
  road:{bike:['NS']}, signs:[{code:'237',x:112,y:260,size:30}],
  actors:[{id:'you',kind:'you',from:'S',turn:'left'},{id:'a',kind:'car',from:'S',through:true,delay:.3,label:'Following car'}],
  order:[['you'],['a']],
  captions:['You are on the cycle path and want to turn left. You must merge onto the road early.','Signal left, check behind you for cars and cyclists. When safe, move to the left-turn position on the road.','Wait for oncoming traffic, then complete the left turn. The following car continues past you.'],
  rule:'To turn left from a cycle path, merge onto the road and position yourself at the centre-line well before the junction. Signal clearly and check behind. Alternatively, use the two-stage indirect turn.',
  mistake:'Turning left from the cycle path without merging — crossing oncoming traffic diagonally.',
  stvo:'§ 9 Abs. 1 StVO' },

// ===== Chapter 4: Traffic lights =====
{ id:'bk-ampel-red', ch:4, title:'Red light means stop — for cyclists too', de:'Rotlicht gilt auch für Radfahrer',
  road:{lights:['S']},
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'E',through:true,label:'Crossing traffic'}],
  order:[['a'],['you']],
  captions:['The light is red. Crossing traffic has a green.','You must stop at the line — red applies to cyclists as much as to cars.','Running a red light is a significant fine and a crash risk. Wait for green.'],
  rule:'A red traffic light is binding for cyclists. There are no exceptions — not even at 3 a.m. on an empty road. Running red costs €60-100 and doubles if you endanger someone.',
  mistake:'Rolling slowly through a red because "the road is clear". Even a slow roll-through is a violation.',
  stvo:'§ 37 StVO' },
{ id:'bk-ampel-bike', ch:4, title:'Bike traffic light controls your phase', de:'Radfahrampel',
  road:{lights:['S']}, signs:[{code:'237',x:112,y:260,size:30}],
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'S',through:true,delay:.6,label:'Car (separate phase)'}],
  order:[['you'],['a']],
  captions:['A separate bike traffic light (small signal with a bicycle symbol) controls your phase.','When the bike signal turns green you may go — even if the car signal is still red.','The car signal controls cars. Do not go until your own bike signal is green.'],
  rule:'A dedicated bike signal (Radfahrampel) takes precedence over the adjacent car signal for cyclists. Go when your signal is green. If there is no bike signal, the regular car signal applies to you.',
  mistake:'Following the car signal when a separate bike signal exists. You may hold up car traffic — or go when you should not.',
  stvo:'§ 37 StVO' },
{ id:'bk-aufstellflaeche', ch:4, title:'Advance box: filter to the front', de:'Aufstellfläche für Radfahrer',
  road:{lights:['S']},
  actors:[{id:'you',kind:'you',from:'S'},{id:'a',kind:'car',from:'S',delay:.5,label:'Car behind you'}],
  order:[['you','a']], duration:8,
  captions:['A red light with a marked advance box for cyclists. The box is in front of the car stop line.','During red you may filter to the front and wait in the box. Cars stop behind the rear line.','When green, you set off first — before the cars.'],
  rule:'The advance box (Aufstellfläche, Zeichen 297) lets cyclists filter to the front during red. Stop within the box, not in front of it. You are not required to use it, but it puts you in a visible position.',
  mistake:'Stopping in front of the advance box — that is still running the red. The front line of the box is the stop line for cyclists.',
  stvo:'§ 41 StVO, Zeichen 297' },
{ id:'bk-gruenpfeil', ch:4, title:'Green arrow: turn right on red', de:'Grüner Pfeil für Radfahrer',
  road:{lights:['S'],gruenpfeil:['S']}, signs:[{code:'720',x:112,y:58,size:30}],
  actors:[{id:'you',kind:'you',from:'S',turn:'right'},{id:'a',kind:'car',from:'W',through:true,label:'Car on green'}],
  order:[['a'],['you']],
  captions:['A small green arrow plate next to the red light.','You may turn right on red — but only after a full stop, and only if no one is hindered: not pedestrians, not the crossing traffic.','Stop, look, turn when clear.'],
  rule:'The Grünpfeil (Zeichen 720) allows a right turn on red after a complete stop. It applies to cyclists and cars. You must yield to everyone — crossing traffic and pedestrians. A rolling stop is a violation.',
  mistake:'Treating the green arrow as a general permission to go. You must stop, look both ways, and turn only when clear.',
  stvo:'§ 37 Abs. 2 StVO, Zeichen 720' },

// ===== Chapter 5: Trams and dooring =====
{ id:'bk-tram-tracks', ch:5, title:'Cross tram tracks at a wide angle', de:'Straßenbahnschienen queren',
  road:{type:'straight'}, extras:[`<g><rect x="-320" y="-8" width="640" height="6" fill="#888" opacity=".5"/><rect x="-320" y="6" width="640" height="6" fill="#888" opacity=".5"/></g>`],
  actors:[{id:'you',kind:'you',path:'M-300 300 L100 -300',stop:0,through:true,travel:8}],
  order:[['you']], duration:8,
  captions:['Tram tracks cross your path. Approach at a wide angle — at least 45 degrees.','A narrow angle lets the track slot swallow your front wheel, and you go over the handlebars.','The wider the angle, the more your tyre rolls over the groove rather than into it.'],
  rule:'Cross tram tracks at a minimum 45-degree angle. If you must cross at a shallow angle, slow right down, cross quickly, and do not brake on the tracks — wet metal is very slippery.',
  mistake:'Crossing at a shallow angle because it feels faster. Many Berlin cycling injuries happen on tram tracks.',
  berlin:'Central Berlin and the east have dense tram networks. Friedrichstraße, Torstraße, Schönhauser Allee, Rosa-Luxemburg-Platz — all have tracks cyclists cross daily.',
  stvo:'§ 1 StVO (general duty of care)' },
{ id:'bk-dooring', ch:5, title:'The door zone: ride 1 metre out', de:'Dooring — die Türfalle',
  road:{type:'straight'},
  extras:[`<rect x="100" y="-320" width="60" height="640" fill="#6b7280" opacity=".18"/>`],
  actors:[{id:'you',kind:'you',path:'M48 330 L48 -330',stop:0,through:true,travel:9},{id:'a',kind:'car',path:'M140 200 L140 200',stop:0,static:true,x:140,y:80,angle:180,label:'Parked car'}],
  order:[['you']], duration:9,
  captions:['Parked cars line the right side of the road. The grey zone is the door swing radius — about 1 metre.','Ride at least 1 metre from parked cars. A door can open without warning at any moment.','A door hit at cycling speed causes serious injuries. Give yourself room to react.'],
  rule:'Ride at least 1 m from the sides of parked cars. Look for movement inside — someone with a seatbelt off or a head turning is about to open a door. If you must pass closer, slow right down.',
  mistake:'Riding in the Schutzstreifen stripe while it hugs the parking lane. The stripe is sometimes in the door zone — move left if needed.',
  berlin:'Dooring is one of the leading causes of serious cycling injury in Berlin. Most streets with parking have doors swinging into the cycle lane.',
  stvo:'§ 14 StVO (obligation of the opener), § 1 StVO (duty of care for the cyclist)' },
{ id:'bk-tram-stop', ch:5, title:'Tram stop without an island', de:'Haltestelle ohne Mittelinsel',
  road:{type:'straight'}, signs:[{code:'224',x:86,y:200,size:34}],
  actors:[{id:'t',kind:'tram',from:'S',through:true,travel:4},{id:'you',kind:'you',path:'M82 330 L82 60',stop:80}],
  order:[['t'],['you']],
  captions:['A tram stops ahead. Passengers will step from the tram directly onto the road — there is no island.','You must stop or slow to walking pace. Passengers alighting have priority over you.','Only continue once the doors are closed and passengers are clear.'],
  rule:'At a tram stop without a raised island, pedestrians cross the cycle path and road to board or alight. You must yield to them. If the tram shows hazard lights, it is stopping — slow immediately.',
  mistake:'Squeezing past a stopped tram at speed. People step off expecting the cycle path to be clear.',
  berlin:'Tram stops without islands are common on narrower streets in Prenzlauer Berg, Mitte and Friedrichshain. Many have a painted waiting area on the road.',
  stvo:'§ 20 StVO' },

// ===== Chapter 6: Special cases =====
{ id:'bk-oneway-free', ch:6, title:'One-way street open both ways', de:'Einbahnstraße, Radverkehr frei',
  road:{oneway:{E:'out'}}, signs:[{code:'267',x:112,y:86,size:34},{code:'1022-10',x:112,y:130,size:30}],
  actors:[{id:'you',kind:'you',path:'M330 -30 L-330 -30',stop:262,through:true,label:''},{id:'a',kind:'car',from:'S',turn:'right',delay:.3,label:'Car turning in'}],
  order:[['you'],['a']],
  captions:['"No entry" — but the plate says "Radverkehr frei": you may ride against the one-way direction.','The car turning in must yield to you coming out the wrong way.','Look for cars turning in and approach the entry with care — drivers may not expect you.'],
  rule:'"Radverkehr frei" under a no-entry sign opens the one-way for cyclists in the wrong direction. You may use it; everyone turning in must yield to you. Most Berlin residential one-way streets have this plate.',
  mistake:'Assuming all one-way streets are open to cyclists. Check for the plate — if it is missing, you must go the same way as cars.',
  berlin:'The majority of one-way streets inside the Ring are open to cyclists in both directions. Assume it unless the plate is absent.',
  stvo:'§ 41 StVO, Zusatzzeichen 1022-10' },
{ id:'bk-living-street', ch:6, title:'Living street: walking pace', de:'Verkehrsberuhigter Bereich',
  road:{type:'straight',calmed:true}, signs:[{code:'325.1',x:86,y:260}],
  actors:[{id:'you',kind:'you',from:'S',through:true,travel:9},{id:'k1',kind:'ped',path:'M-90 -40 L60 -60 L90 -160',stop:0,through:true,travel:9,noIntent:true,label:'Child'},{id:'k2',kind:'ped',path:'M70 120 L-40 40 L-90 -120',stop:0,through:true,travel:9,noIntent:true,label:'Child'}],
  order:[['you']], duration:11,
  captions:['A living street. Children play in the road. No pavement — the whole street is shared.','Walking pace only (about 7 km/h). Pedestrians and children may use the full width; you must yield to them.','When you leave the area you must yield to everyone on the main road.'],
  rule:'In a living street (Zeichen 325.1) you ride at walking pace — about 7 km/h. Pedestrians have full right of way. When exiting, you give way to all road users. Parking is only in marked spaces.',
  mistake:'Riding at 15 km/h because the road looks empty. Children appear suddenly.',
  stvo:'§ 42 StVO, Zeichen 325.1, § 10 StVO' },
{ id:'bk-sidewalk', ch:6, title:'Pavement riding is generally forbidden', de:'Fahren auf dem Gehweg',
  road:{type:'straight'}, signs:[{code:'239',x:86,y:260,size:34}],
  actors:[{id:'you',kind:'you',path:'M30 330 L30 -330',stop:0,through:true,travel:9},{id:'p',kind:'ped',path:'M132 100 L-132 100',stop:0,through:true,noIntent:true,travel:9,label:'Pedestrian'}],
  order:[['you']], duration:9,
  captions:['As an adult cyclist you must ride on the road or a signed cycle path — not the pavement.','The exception: a "Gehweg, Radfahrer frei" sign (white on blue) explicitly allows cyclists at walking pace.','Children under 8 must use the pavement; children 8–10 may. Adults must not.'],
  rule:'Cycling on the pavement is forbidden for adults unless a sign explicitly permits it (Zeichen 239 with "Radfahrer frei" plate). If you are allowed, walk pace only and pedestrians have priority.',
  mistake:'Using the pavement to avoid a busy road. Pedestrians do not expect cyclists behind them — it causes collisions and is a €25 fine.',
  stvo:'§ 2 Abs. 1 StVO, Zeichen 239, § 21a StVO' },
{ id:'bk-railway', ch:6, title:'Railway crossing', de:'Bahnübergang',
  road:{type:'straight'}, signs:[{code:'201',x:86,y:240,size:36}],
  actors:[{id:'you',kind:'you',from:'S',stop:40}],
  order:[['you']], duration:7,
  captions:['An Andreaskreuz: a railway or tram crossing ahead.','Stop before the barrier or the line on the road. Never enter if you would have to wait on the tracks.','Trains and trams always have right of way. Do not race the barrier.'],
  rule:'At a railway or tram crossing on its own track, trains have absolute priority. Stop before the barrier. If no barriers, stop at the cross sign or the painted line and proceed only when you can see clearly in both directions.',
  mistake:'Rushing across when the barrier starts to come down. Barriers come down before the train is visible.',
  stvo:'§ 19 StVO, Zeichen 201' },
);
```

- [ ] **Step 9: Update `renderHome` text**

Find inside `renderHome`:
```js
      <h2>Who goes first at a Berlin crossing?</h2>
      <p>${SCENES.length} animated situations from the streets of Berlin. Your car is always the <b style="color:var(--accent)">blue one</b>. Press play, watch who waits and who goes, then try quiz mode and guess before the answer appears.</p>
      <p>Rules follow the German StVO as of 2026; the Berlin notes cover what is typical here — trams in the east, bicycle streets, 30 km/h main roads, parking zones.</p>
      <p><button class="controls-inline" id="startBtn" style="background:var(--accent);color:var(--accent-ink);padding:10px 16px;border-radius:8px;font-weight:600;margin-top:6px">Start with chapter 1 →</button></p>
```

Replace with:
```js
      <h2>Rules of the road for Berlin cyclists</h2>
      <p>${SCENES.length} animated situations from the streets of Berlin. <b style="color:var(--go)">You are always the green cyclist</b>. Press play, watch who waits and who goes, then try quiz mode.</p>
      <p>Rules follow the German StVO as of 2026; the Berlin notes cover what is specific to cycling here — tram tracks, door zones, one-way streets open both ways, and bicycle streets.</p>
      <p><button class="controls-inline" id="startBtn" style="background:var(--go);color:#fff;padding:10px 16px;border-radius:8px;font-weight:600;margin-top:6px">Start with chapter 1 →</button></p>
```

- [ ] **Step 10: Update the legend in `renderHome`**

Find:
```js
      <div><i style="background:${COL.you}"></i>You</div><div><i style="background:${COL.cars[0]}"></i>Other cars</div>
```
Replace with:
```js
      <div><i style="background:${COL.you};border-radius:50%;height:14px"></i>You (cyclist)</div><div><i style="background:${COL.cars[0]}"></i>Cars</div>
```

- [ ] **Step 11: Verify in browser**

Open http://localhost:3000/bike.html

Check:
- Green mark in sidebar, "Berlin Radfahren" title
- "🚗 Auto guide →" pill links back to `/`
- Home page shows "You are always the green cyclist"
- Chapter 1 scene `bk-rvl-right` plays: green cyclist stops, car goes first, cyclist goes
- No JS errors in browser console

- [ ] **Step 12: Fix the missing sign 239 in SIGNS**

`bk-sidewalk` uses sign `239` (Gehweg). Add it to the SIGNS object if it is not already present.

Find in the SIGNS object the last entry before `};` and add:
```js
  '239': { name:'Gehweg', en:'Pavement / footpath', desc:'Pedestrians only. Cyclists may ride here only if a "Radfahrer frei" plate is attached.', svg: () => rectBlue(`${pedIcon(50,50,1,'#fff')}`) },
```

- [ ] **Step 13: Commit**

```bash
git add bike.html
git commit -m "feat: add Berlin bike guide (bike.html) with 24 scenes across 6 chapters"
```

---

### Task 3: Smoke-test both guides

- [ ] **Step 1: Open both guides**

- http://localhost:3000 — auto guide, green bike pill in sidebar
- http://localhost:3000/bike.html — bike guide, blue auto pill in sidebar

- [ ] **Step 2: Verify cross-nav pills**

Click "🚲 Bike guide →" from auto guide → lands on bike guide home.
Click "🚗 Auto guide →" from bike guide → lands on auto guide home.

- [ ] **Step 3: Play one scene from each chapter in the bike guide**

Navigate to each chapter, click a scene, press Play. Confirm:
- Green cyclist appears as "you" actor
- Animation plays without errors
- Captions update correctly
- Rule card shows on the right

- [ ] **Step 4: Check console for JS errors**

Open DevTools → Console. Reload both pages. Zero errors expected.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: bike guide scene and sign corrections"
```
