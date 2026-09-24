// src/lib/engine.js
import { signSVG, bikeIcon } from './signs.js';

export const NS = 'http://www.w3.org/2000/svg';
export const VB = '-320 -320 640 640';
export const T_ARRIVE = 1.4, T_FIRST = 2.0, T_GAP = 1.9;
export const TRAVEL = { car: 2.4, you: 2.4, tram: 3.0, bus: 2.8, bike: 2.6, ped: 3.4, ambulance: 1.8 };
export const COL = { you:'#2F6FDB', bvg:'#F2D53C', bike:'#3DAE6B', ped:'#F3EBD3', amb:'#F7F7F7', cars:['#D5D9DE','#D8C39A','#9C7A5A','#7FA5B5'] };
export const ROT = { S:0, W:90, N:180, E:270 };

function rotPt(x,y,deg){ const a=deg*Math.PI/180, c=Math.cos(a), s=Math.sin(a); return [Math.round((x*c - y*s)*100)/100, Math.round((x*s + y*c)*100)/100]; }
function rotPath(cmds, deg){
  return cmds.map(c=>{
    const k=c[0];
    if(k==='A'){ const [x,y]=rotPt(c[6],c[7],deg); return ['A',c[1],c[2],c[3],c[4],c[5],x,y]; }
    const out=[k]; for(let i=1;i<c.length;i+=2){ const [x,y]=rotPt(c[i],c[i+1],deg); out.push(x,y); } return out;
  });
}
function pathStr(cmds){ return cmds.map(c=>c[0]+c.slice(1).join(' ')).join(' '); }

const BASE = {
  straight: { cmds:[['M',30,330],['L',30,-330]], stop:262 },
  right:    { cmds:[['M',30,330],['L',30,72],['Q',30,30,72,30],['L',330,30]], stop:258 },
  left:     { cmds:[['M',30,330],['L',30,72],['C',30,18,-36,8,-72,-30],['L',-330,-30]], stop:258 },
  leftwide: { cmds:[['M',30,330],['L',30,72],['C',30,-10,10,-30,-72,-30],['L',-330,-30]], stop:258 },
  uturn:    { cmds:[['M',30,330],['L',30,72],['C',30,-10,-30,-10,-30,72],['L',-30,330]], stop:258 },
  bike:     { cmds:[['M',82,330],['L',82,-330]], stop:262 },
  bikeright:{ cmds:[['M',82,330],['L',82,110],['Q',82,82,110,82],['L',330,82]], stop:220 },
  ped:      { cmds:[['M',100,132],['L',100,-132]], stop:30 },
  pedfar:   { cmds:[['M',-100,132],['L',-100,-132]], stop:30 },
  r1: { cmds:[['M',30,330],['L',30,150],['Q',30,100,58,69],['A',90,90,0,0,0,69,58],['Q',95,35,150,30],['L',330,30]], stop:180 },
  r2: { cmds:[['M',30,330],['L',30,150],['Q',30,100,58,69],['A',90,90,0,0,0,69,-58],['Q',60,-100,30,-150],['L',30,-330]], stop:180 },
  r3: { cmds:[['M',30,330],['L',30,150],['Q',30,100,58,69],['A',90,90,0,1,0,-58,-69],['Q',-100,-60,-150,-30],['L',-330,-30]], stop:180 },
};
export function actorPath(a){
  if(a.path) return { d:a.path, stop:a.stop==null?258:a.stop };
  const b = BASE[a.turn||'straight']; const deg = ROT[a.from||'S'];
  return { d: pathStr(rotPath(b.cmds, deg)), stop: a.stop==null? b.stop : a.stop };
}
export function ease(x){ x=Math.max(0,Math.min(1,x)); return x<.5? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }
export function easeOut(x){ x=Math.max(0,Math.min(1,x)); return 1-Math.pow(1-x,3); }
export function ease3(x){ x=Math.max(0,Math.min(1,x)); const p=0.22,m=1/(1-p); if(x<p) return m*x*x/(2*p); if(x>1-p) return 1-m*(1-x)*(1-x)/(2*p); return m*(x-p/2); }

export function el(tag, attrs, parent){ const e=document.createElementNS(NS,tag); for(const k in attrs||{}) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
export function txt(parent, x, y, s, attrs){ const t=el('text',Object.assign({x,y,'font-family':'Barlow Condensed, Arial Narrow, sans-serif','font-weight':'600','font-size':'13','text-anchor':'middle',fill:'#fff'},attrs||{}),parent); t.textContent=s; return t; }

export function drawRoad(svg, road){
  const g = el('g',{class:'road'},svg);
  const type = road.type||'cross';
  if(type==='none') return g;
  const arms = (road.arms) || (type==='T' ? ['N','E','S','W'].filter(d=>d!==road.missing) : type==='straight' ? ['N','S'] : ['N','E','S','W']);
  const paint = 'var(--paint)', asphalt = road.calmed ? '#8C8F94' : 'var(--asphalt)';
  const blocks = el('g',{fill:'var(--surface-2)'},g);
  [[-320,-320],[100,-320],[-320,100],[100,100]].forEach(([x,y])=> el('rect',{x,y,width:220,height:220},blocks));
  const sw = el('g',{fill:'var(--kerb)'},g);
  const armRect = (d, w, len, parent, fill) => {
    const r = el('rect',{x:-w/2, y:0, width:w, height:len, fill},parent);
    r.setAttribute('transform', `rotate(${ROT[d]})`);
    return r;
  };
  if(type==='round'){
    el('circle',{cx:0,cy:0,r:158,fill:'var(--kerb)'},g);
    arms.forEach(d=>armRect(d,200,330,sw));
    el('circle',{cx:0,cy:0,r:122,fill:asphalt},g);
    arms.forEach(d=>armRect(d,120,330,g,asphalt));
    el('circle',{cx:0,cy:0,r:122,fill:asphalt},g);
    el('circle',{cx:0,cy:0,r:road.mini?34:58,fill:road.mini?'#B7B4A8':'var(--grass)',stroke:paint,'stroke-width':road.mini?0:3},g);
    if(road.mini) el('circle',{cx:0,cy:0,r:34,fill:'none',stroke:paint,'stroke-width':3,'stroke-dasharray':'8 6'},g);
    arms.forEach(d=>{ const p=el('path',{d:'M4 150 H56',stroke:paint,'stroke-width':5,'stroke-dasharray':'8 6'},g); p.setAttribute('transform',`rotate(${ROT[d]})`); });
    return g;
  }
  if(road.diag){
    const dg = el('g',{transform:`rotate(${road.diag.angle})`},sw);
    armRect(road.diag.dir,200,360,dg);
  }
  const isN = d=> road.narrow && road.narrow.includes(d), isD = d=> road.dirt && road.dirt.includes(d);
  arms.forEach(d=>{ if(road.diag && road.diag.dir===d) return; if(isD(d)) return; armRect(d, isN(d)?150:200, 330, sw); });
  (road.extra||[]).forEach(x=>{ const eg=el('g',{transform:`rotate(${x.angle})`},sw); armRect('S',200,360,eg); });
  el('rect',{x:-100,y:-100,width:200,height:200,fill:'var(--kerb)'},g);
  const asp = el('g',{fill:asphalt},g);
  if(road.diag){ const dg = el('g',{transform:`rotate(${road.diag.angle})`},asp); armRect(road.diag.dir,120,360,dg,asphalt); }
  arms.forEach(d=>{ if(road.diag && road.diag.dir===d) return; if(isD(d)){ const r=armRect(d,64,330,asp,'#8A7A5C'); const dots=el('g',{fill:'#6E5F45',transform:`rotate(${ROT[d]})`},g); for(let y=80;y<330;y+=22){ el('circle',{cx:-14+(y%44?8:0),cy:y,r:2.5},dots); el('circle',{cx:12-(y%44?6:0),cy:y+9,r:2},dots);} return; } armRect(d, isN(d)?72:120, 330, asp, asphalt); });
  (road.extra||[]).forEach(x=>{ const eg=el('g',{transform:`rotate(${x.angle})`},asp); armRect('S',120,360,eg,asphalt); const p=el('path',{d:'M0 66 V330',stroke:paint,'stroke-width':3,'stroke-dasharray':'14 10',fill:'none'},eg); });
  el('rect',{x:-60,y:-60,width:120,height:120,fill:asphalt},asp);
  if(road.calmed){
    const pv = el('g',{fill:'#9EA1A6'},g);
    for(let x=-52;x<=52;x+=16) for(let y=-320;y<=320;y+=16) el('circle',{cx:x,cy:y,r:2},pv);
  }
  const mk = el('g',{stroke:paint,'stroke-width':3,fill:'none'},g);
  arms.forEach(d=>{
    if(road.oneway && road.oneway[d]) return; if(isN(d)||isD(d)) return;
    const solid = road.solid && road.solid.includes(d);
    const p = el('path',{d:'M0 66 V330','stroke-dasharray': solid?'':'14 10'},mk);
    let tr = `rotate(${ROT[d]})`; if(road.diag && road.diag.dir===d) tr = `rotate(${road.diag.angle}) `+tr; p.setAttribute('transform',tr);
  });
  (road.stop||[]).forEach(d=>{ const p=el('path',{d:`M2 68 H${isN(d)?34:58}`,stroke:paint,'stroke-width':6},g); p.setAttribute('transform',`rotate(${ROT[d]})`); });
  (road.wait||[]).forEach(d=>{ const p=el('path',{d:`M2 68 H${isN(d)?34:58}`,stroke:paint,'stroke-width':6,'stroke-dasharray':'9 6'},g); p.setAttribute('transform',`rotate(${ROT[d]})`); });
  if(road.oneway){ for(const d in road.oneway){ const dir=road.oneway[d]; const a=el('g',{fill:paint,opacity:.85},g);
    el('path',{d:'M0 -28 L14 -8 H6 V28 H-6 V-8 H-14 Z'},a);
    a.setAttribute('transform', `rotate(${ROT[d]}) translate(0 200) rotate(${dir==='in'?0:180})`);
  } }
  if(road.tracks){ const tr = el('g',{stroke:'#C9C5B8','stroke-width':1.6,fill:'none',opacity:.9},g);
    const dirs = road.tracks==='NS'?['S']:road.tracks==='EW'?['W']:['S','W'];
    dirs.forEach(d=>{ (road.tracksCenter?[-19,-9,9,19]:[-38,-22,22,38]).forEach(x=>{ const p=el('path',{d:`M${x} -330 V330`},tr); p.setAttribute('transform',`rotate(${ROT[d]})`); }); });
  }
  if(road.bike){ const bk = el('g',{fill:'#B8654F',opacity:.85},g);
    road.bike.forEach(ax=>{ const d = ax==='NS'?'S':'W'; [-1,1].forEach(s=>{ const r=el('rect',{x:s*74-(s<0?16:0),y:-330,width:16,height:660},bk); r.setAttribute('transform',`rotate(${ROT[d]})`); });
      const dd = el('g',{stroke:paint,'stroke-width':2,'stroke-dasharray':'6 6',fill:'none'},g);
      [[-90,-74],[74,90]].forEach(([a,b])=>{ const p=el('path',{d:`M${a} -100 V100 M${b} -100 V100`},dd); p.setAttribute('transform',`rotate(${ROT[d]})`); });
    });
  }
  if(road.bikeLane){ road.bikeLane.forEach(d=>{ const r=el('rect',{x:40,y:66,width:18,height:264,fill:'#B8654F',opacity:.85},g); r.setAttribute('transform',`rotate(${ROT[d]})`);
    const l=el('path',{d:'M40 66 V330',stroke:paint,'stroke-width':2.5,'stroke-dasharray': road.bikeLaneSolid?'':'8 8'},g); l.setAttribute('transform',`rotate(${ROT[d]})`); }); }
  if(road.busLane){ road.busLane.forEach(d=>{ const r=el('rect',{x:4,y:66,width:54,height:264,fill:'#5A5D62'},g); r.setAttribute('transform',`rotate(${ROT[d]})`);
    const l=el('path',{d:'M4 66 V330',stroke:paint,'stroke-width':4},g); l.setAttribute('transform',`rotate(${ROT[d]})`);
    const t=txt(g,30,250,'BUS',{fill:paint,'font-size':20}); t.setAttribute('transform',`rotate(${ROT[d]}) rotate(180 30 250)`); }); }
  const autoZ = (type==='cross'||type==='T') && road.zebra!==false;
  const zebraDirs = road.zebra===false ? [] : (road.zebra||[]).length ? road.zebra : (autoZ ? arms : []);
  zebraDirs.forEach(d=>{ const z=el('g',{fill:paint,opacity:.5},g); for(let i=-54;i<56;i+=16) el('rect',{x:i,y:-112,width:10,height:26},z); z.setAttribute('transform',`rotate(${ROT[d]})`); });
  if(road.driveway){ const dw = el('g',{},g); const y = road.driveway.y||150;
    el('rect',{x:60,y:y-26,width:80,height:52,fill:'var(--kerb)'},dw);
    el('rect',{x:100,y:y-20,width:220,height:40,fill:asphalt,opacity:.9},dw);
    el('rect',{x:60,y:y-20,width:44,height:40,fill:'#9A9D9A'},dw);
    el('path',{d:`M62 ${y-20} V${y+20}`,stroke:'#9A9D9A','stroke-width':4},dw);
    if(road.driveway.label){ txt(dw,210,y+5,road.driveway.label,{fill:paint,'font-size':14}); }
  }
  if(road.busStop){ const bs = el('g',{},g); const d = road.busStop;
    el('path',{d:'M58 120 L44 132 L58 144 L44 156 L58 168 L44 180 L58 192 L44 204 L58 216',stroke:paint,'stroke-width':3,fill:'none'},bs);
    txt(bs,18,180,'BUS',{fill:paint,'font-size':18,'transform':'rotate(-90 18 180)'});
    bs.setAttribute('transform',`rotate(${ROT[d]})`);
    if(d==='S'){ const sg = el('g',{transform:'translate(84 168)'},g); sg.innerHTML = signSVG('224',26).replace('<svg','<svg x="-13" y="-13"'); }
  }
  if(road.fahrrad){ const f = el('g',{fill:paint,opacity:.9},g); [-250,-150,150,250].forEach(y=>{ const b=el('g',{transform:`translate(0 ${y}) scale(.4) translate(-50 -50)`},f); b.innerHTML = bikeIcon('var(--paint)'); }); }
  if(road.bikeBox){ const b=el('g',{},g); el('rect',{x:2,y:50,width:56,height:30,fill:'#3F8F5E',opacity:.9},b); const bi=el('g',{transform:'translate(30 65) scale(.3) translate(-50 -50)'},b); bi.innerHTML=bikeIcon('#fff'); el('path',{d:'M2 84 H58',stroke:paint,'stroke-width':6},b); }
  if(road.rail){ const r = el('g',{},g); el('rect',{x:-330,y:-16,width:660,height:32,fill:'#7B7F86'},r); [-8,8].forEach(y=> el('path',{d:`M-330 ${y} H330`,stroke:'#C9C5B8','stroke-width':2},r)); }
  return g;
}

const SIGN_POS = { S:[86,112], W:[-112,86], N:[-86,-112], E:[112,-86] };
const SIGN_STACK = { S:[0,44], W:[-44,0], N:[0,-44], E:[44,0] };
export function drawSigns(svg, signs){
  const g = el('g',{class:'signs'},svg); const counts = {};
  (signs||[]).forEach(s=>{
    let x,y; if(s.x!=null){ x=s.x; y=s.y; } else { const at=s.at||'S'; const n=counts[at]||0; counts[at]=n+1; x=SIGN_POS[at][0]+SIGN_STACK[at][0]*n; y=SIGN_POS[at][1]+SIGN_STACK[at][1]*n; }
    const size = s.size||40;
    const w = el('g',{transform:`translate(${x-size/2} ${y-size/2})`},g);
    el('circle',{cx:size/2,cy:size/2,r:size/2+3,fill:'rgba(0,0,0,.25)'},w);
    if(s.back){ const k=size/100; w.innerHTML += s.code==='206' ? `<path transform="scale(${k})" d="M30 4 H70 L96 30 V70 L70 96 H30 L4 70 V30 Z" fill="#8E9196" stroke="#6C6F74" stroke-width="4"/>` : `<path transform="scale(${k})" d="M6 12 H94 L50 90 Z" fill="#8E9196" stroke="#6C6F74" stroke-width="6" stroke-linejoin="round"/>`; }
    else w.innerHTML += signSVG(s.code,size);
  });
  return g;
}
const LIGHT_POS = { S:[86,58], W:[-58,86], N:[-86,-58], E:[58,-86] };
export function drawLights(svg, road){
  const heads = {};
  if(!road.lights) return heads;
  const g = el('g',{class:'lights'},svg);
  road.lights.forEach(d=>{
    const [x,y] = LIGHT_POS[d];
    const h = el('g',{transform:`translate(${x} ${y})`},g);
    el('rect',{x:-9,y:-24,width:18,height:48,rx:4,fill:'#111'},h);
    const lamps = { red: el('circle',{cx:0,cy:-14,r:5.5,fill:'#3a1a1a'},h), yellow: el('circle',{cx:0,cy:0,r:5.5,fill:'#3a3418'},h), green: el('circle',{cx:0,cy:14,r:5.5,fill:'#173a22'},h) };
    const arrow = el('path',{d:'M-4 14 H3 M1 11 L4 14 L1 17',stroke:'#0b2a14','stroke-width':1.6,fill:'none',opacity:0},h);
    if(road.gruenpfeil && road.gruenpfeil.includes(d)){ const p=el('g',{transform:'translate(11 -22)'},h); p.innerHTML = signSVG('720',16); }
    heads[d] = { lamps, arrow };
  });
  return heads;
}
export function setLight(head, state, t){
  const L = head.lamps; const off = { red:'#3a1a1a', yellow:'#3a3418', green:'#173a22' };
  L.red.setAttribute('fill', off.red); L.yellow.setAttribute('fill', off.yellow); L.green.setAttribute('fill', off.green); head.arrow.setAttribute('opacity',0);
  const on = { red:'#FF3B30', yellow:'#FFC300', green:'#34D058' };
  if(state==='red') L.red.setAttribute('fill',on.red);
  else if(state==='yellow') L.yellow.setAttribute('fill',on.yellow);
  else if(state==='green') L.green.setAttribute('fill',on.green);
  else if(state==='redyellow'){ L.red.setAttribute('fill',on.red); L.yellow.setAttribute('fill',on.yellow); }
  else if(state==='flash'){ if(Math.floor(t*2)%2===0) L.yellow.setAttribute('fill',on.yellow); }
  else if(state==='arrow'){ L.green.setAttribute('fill',on.green); head.arrow.setAttribute('opacity',1); }
  else if(state==='arrow-left'){ L.green.setAttribute('fill',on.green); head.arrow.setAttribute('opacity',1); head.arrow.setAttribute('transform','scale(-1 1)'); }
}

export function actorColor(a, idx){
  if(a.color) return a.color;
  switch(a.kind){ case 'you': return COL.you; case 'tram': case 'bus': return COL.bvg; case 'bike': return COL.bike; case 'ped': return COL.ped; case 'ambulance': return COL.amb; default: return COL.cars[idx%COL.cars.length]; }
}
// drawVehicle: bike.html version — k==='bike'||k==='you' both render the cyclist SVG shape
export function drawVehicle(g, a, color){
  const k = a.kind;
  if(k==='ped'){ el('circle',{cx:0,cy:0,r:8,fill:color,stroke:'#2b2b2b','stroke-width':2},g); el('circle',{cx:0,cy:-1,r:3.2,fill:'#2b2b2b'},g); return; }
  if(k==='bike'||k==='you'){ el('circle',{cx:0,cy:10,r:7,fill:'none',stroke:'#333','stroke-width':2},g); el('circle',{cx:0,cy:-10,r:7,fill:'none',stroke:'#333','stroke-width':2},g); el('path',{d:'M0 10 L0 -2 L3 -10',fill:'none',stroke:color,'stroke-width':2.5,'stroke-linecap':'round'},g); el('path',{d:'M0 -2 L-3 -10',fill:'none',stroke:color,'stroke-width':2,'stroke-linecap':'round'},g); el('circle',{cx:0,cy:-14,r:3.5,fill:color,stroke:'#1d4d30','stroke-width':1.2},g); return; }
  if(k==='tram'){ el('rect',{x:-13,y:-58,width:26,height:116,rx:8,fill:color,stroke:'#8a7a1a','stroke-width':1.5},g); el('rect',{x:-9,y:-50,width:18,height:100,rx:3,fill:'#4a4630',opacity:.55},g); el('path',{d:'M-9 -20 H9 M-9 20 H9',stroke:color,'stroke-width':3},g); el('rect',{x:-6,y:-57,width:12,height:5,fill:'#ffe9a8'},g); return; }
  if(k==='bus'){ el('rect',{x:-13,y:-40,width:26,height:80,rx:5,fill:color,stroke:'#8a7a1a','stroke-width':1.5},g); el('rect',{x:-10,y:-32,width:20,height:64,rx:2,fill:'#4a4630',opacity:.55},g); el('rect',{x:-8,y:-40,width:16,height:5,fill:'#ffe9a8'},g); return; }
  if(k==='ambulance'){ el('rect',{x:-12,y:-24,width:24,height:48,rx:5,fill:color,stroke:'#b32020','stroke-width':2},g); el('rect',{x:-12,y:-4,width:24,height:8,fill:'#d62828'},g); el('rect',{x:-10,y:-16,width:20,height:7,rx:1,fill:'#6fb8ff',opacity:.9},g); el('circle',{cx:0,cy:-19,r:3.5,fill:'#2f7cff',class:'blue'},g); return; }
  el('path',{d:'M-11 -22 L11 -22 Q13 -22 13 -19 L13 14 Q13 22 10 22 L-10 22 Q-13 22 -13 14 L-13 -19 Q-13 -22 -11 -22 Z',fill:color,stroke:'#3a3d42','stroke-width':1.5},g);
  el('path',{d:'M-8 -20 L8 -20 L8 -9 L-8 -9 Z',fill:'#20242a',opacity:.8},g);
  el('rect',{x:-7,y:11,width:14,height:5,rx:1.5,fill:'#20242a',opacity:.6},g);
  el('rect',{x:-10,y:-23,width:4,height:3,rx:1,fill:'#ffe98a'},g); el('rect',{x:6,y:-23,width:4,height:3,rx:1,fill:'#ffe98a'},g);
  el('rect',{x:-10,y:20,width:4,height:3,rx:1,fill:'#cc2200',opacity:.75},g); el('rect',{x:6,y:20,width:4,height:3,rx:1,fill:'#cc2200',opacity:.75},g);
  const side = (a.turn==='left'||a.turn==='leftwide'||a.turn==='uturn') ? -1 : (a.turn==='right'||a.turn==='bikeright') ? 1 : 0;
  const s = a.indicator!=null ? a.indicator : side;
  if(s){ const ind = el('g',{class:'ind',opacity:0},g); el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},ind); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},ind); }
  if(a.hazard){ const hz = el('g',{class:'ind hazard',opacity:0},g); [-1,1].forEach(s=>{ el('rect',{x:s*9-2,y:-22,width:4,height:3,fill:'#FFB000'},hz); el('rect',{x:s*9-2,y:19,width:4,height:3,fill:'#FFB000'},hz); }); }
}

export function computeLightPhases(scene, goTs){
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

export class SceneView {
  constructor(svg, scene, opts){
    this.svg = svg; this.scene = scene; this.opts = opts||{}; this.quizHidden = false;
    svg.setAttribute('viewBox', VB); svg.innerHTML='';
    el('rect',{x:-320,y:-320,width:640,height:640,fill:'var(--ground)'},svg);
    drawRoad(svg, scene.road||{});
    (scene.extras||[]).forEach(x=>{ const g=el('g',{},svg); g.innerHTML = x; });
    this.heads = drawLights(svg, scene.road||{});
    drawSigns(svg, scene.signs);
    (scene.labels||[]).forEach(l=> txt(svg,l.x,l.y,l.text,{fill:'var(--ink)','font-size':l.size||13,opacity:.85}));
    this.groups = {}; (scene.order||[]).forEach((grp,i)=> grp.forEach(id=> this.groups[id]=i));
    this.intents = el('g',{class:'intents'},svg);
    this.actorsG = el('g',{class:'actors'},svg);
    this.badges = el('g',{class:'badges'},svg);
    this.actors = (scene.actors||[]).map((a,i)=>this.makeActor(a,i));
    const lastGroup = (scene.order||[]).length-1;
    this.goTs = []; { let tg=T_FIRST; (scene.order||[]).forEach(grp=>{ this.goTs.push(tg); const mx=Math.max(1, ...grp.map(id=>{ const d=(scene.actors||[]).find(a=>a.id===id)||{}; return d.travel||TRAVEL[d.kind]||2.4; })); tg += Math.max(T_GAP, mx*0.85+0.3); }); }
    this.lights = scene.lights || null;
    let end = lastGroup>=0 ? this.goTs[lastGroup] + 3.8 : 4.5;
    this.actors.forEach(a=>{ if(a.def.group==null && !a.def.through && a.def.kind==='ped' && a.def.autoGo) end=Math.max(end, 5); });
    this.duration = scene.duration || end;
    this.capTimes = scene.capAt || [0, ...this.goTs.map(g=>g-0.05)];
    this.keyframes = [...new Set([0, T_ARRIVE+0.15, ...this.capTimes.slice(1), ...this.goTs.map(g=>g-0.05), this.duration])].sort((a,b)=>a-b);
    this.setTime(0);
  }
  makeActor(def, i){
    const color = actorColor(def, i);
    const a = { def, color, id:def.id };
    if(def.static){ a.static=true; a.x=def.x; a.y=def.y; a.angle=def.angle||0; }
    else {
      const p = actorPath(def);
      a.pathEl = el('path',{d:p.d,fill:'none',stroke:'none'},this.svg);
      a.total = a.pathEl.getTotalLength(); a.stop = Math.min(p.stop, a.total);
      const pts=[]; for(let k=0;k<=28;k++){ const pt=a.pathEl.getPointAtLength(a.stop + (a.total-a.stop)*k/28); pts.push(pt.x.toFixed(1)+','+pt.y.toFixed(1)); }
      { const e=a.pathEl.getPointAtLength(a.total); a.endOff = Math.abs(e.x)>300 || Math.abs(e.y)>300; }
      a.intent = el('polyline',{points:pts.join(' '),fill:'none',stroke:color,'stroke-width':3,'stroke-dasharray':'7 6',opacity:.7,'stroke-linecap':'round'},this.intents);
      const endPt = a.pathEl.getPointAtLength(a.total), prePt = a.pathEl.getPointAtLength(a.total-6);
      const ang = Math.atan2(endPt.y-prePt.y, endPt.x-prePt.x)*180/Math.PI;
      a.intentHead = el('path',{d:'M-10 -6 L0 0 L-10 6',fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round',transform:`translate(${endPt.x} ${endPt.y}) rotate(${ang})`,opacity:.7},this.intents);
      if(def.kind==='ped' || def.noIntent){ a.intent.setAttribute('opacity',0); a.intentHead.setAttribute('opacity',0); }
    }
    a.g = el('g',{},this.actorsG); drawVehicle(a.g, def, color);
    a.ind = a.g.querySelector('.ind:not(.hazard)'); a.hz = a.g.querySelector('.hazard');
    a.badge = el('g',{opacity:0},this.badges);
    a.badgeBg = el('rect',{x:-30,y:-11,width:60,height:22,rx:11,fill:'#D23B3B'},a.badge);
    a.badgeTx = txt(a.badge,0,4,'WARTEN',{'font-size':12,'letter-spacing':'.06em'});
    a.group = this.groups[def.id]; a.through = !!def.through; a.delay = def.delay||0;
    a.travel = def.travel || TRAVEL[def.kind] || 2.4;
    return a;
  }
  posOf(a, t){
    const goT = a.def.goAt!=null ? a.def.goAt : (a.group!=null ? this.goTs[a.group] : null);
    let len, state;
    if(a.through){
      if(goT==null){ len = Math.min(a.total, a.total*ease3(t/(this.duration))); state='go'; }
      else if(t<goT){ len = a.stop*easeOut(Math.max(0,t-a.delay)/(goT-a.delay)); state='approach'; }
      else { len = a.stop + (a.total-a.stop)*ease3((t-goT)/a.travel); state = t>goT+a.travel ? 'done':'go'; }
    } else {
      const tA = T_ARRIVE + a.delay;
      if(t<tA){ len = a.stop*easeOut(Math.max(0,t-a.delay)/T_ARRIVE); state='approach'; }
      else if(goT==null || t<goT){ len=a.stop; state='wait'; }
      else { len = a.stop + (a.total-a.stop)*ease3((t-goT)/a.travel); state = t>goT+a.travel ? 'done':'go'; }
    }
    return { len, state };
  }
  setTime(t){
    this.t = t; const sc = this.scene;
    if(this.lights && this.heads){ let cur={}; this.lights.forEach(k=>{ if(k.at<=t) cur=Object.assign({},cur,k); }); for(const d in this.heads) setLight(this.heads[d], cur[d]||'off', t); }
    const blink = Math.floor(t*3)%2===0;
    this.actors.forEach(a=>{
      let x,y,ang,state='static';
      if(a.static){ x=a.x; y=a.y; ang=a.angle; state = 'static'; }
      else {
        const r = this.posOf(a,t); state=r.state;
        const p = a.pathEl.getPointAtLength(r.len), q = a.pathEl.getPointAtLength(Math.min(a.total, r.len+2));
        const p0 = a.pathEl.getPointAtLength(Math.max(0, r.len-2));
        x=p.x; y=p.y; ang = Math.atan2(q.y-p0.y, q.x-p0.x)*180/Math.PI + 90;
        const showIntent = state!=='done' && !(a.def.kind==='ped') && !a.def.noIntent && !(a.def.intentOnlyWhenWaiting && state!=='wait');
        a.intent.setAttribute('opacity', showIntent? .7:0); a.intentHead.setAttribute('opacity', showIntent? .7:0);
      }
      a.px=x; a.py=y; a.g.setAttribute('transform',`translate(${x} ${y}) rotate(${ang})`);
      a.g.setAttribute('opacity', state==='done' && (a.def.fadeOut || a.endOff) ? 0 : 1);
      if(a.ind){ let on = (a.def.signalAlways || state==='wait' || state==='go' || (state==='approach' && t>0.6)) && blink && a.def.signal!==false;
        if(a.def.indFrom!=null && !a.static){ const r=this.posOf(a,t); on = blink && (r.len/a.total)>=a.def.indFrom && state!=='done'; }
        a.ind.setAttribute('opacity', on?1:0); }
      if(a.hz){ a.hz.setAttribute('opacity', blink?1:0); }
      const blue = a.g.querySelector('.blue'); if(blue) blue.setAttribute('fill', Math.floor(t*6)%2? '#2f7cff':'#bfe0ff');
      let show=false;
      if(!this.quizHidden && !a.static && !a.def.noBadge){
        if(state==='wait' && !a.through){ show=true; a.badgeBg.setAttribute('fill','#D23B3B'); a.badgeBg.setAttribute('width',60); a.badgeBg.setAttribute('x',-30); a.badgeTx.textContent = a.def.waitText || 'WARTEN'; }
        else if((state==='go') && a.group!=null){ show=true; a.badgeBg.setAttribute('fill','#2A9D5C'); a.badgeBg.setAttribute('width',24); a.badgeBg.setAttribute('x',-12); a.badgeTx.textContent = String(a.group+1); }
      }
      a.badge.setAttribute('opacity', show?1:0);
      if(show) a.badge.setAttribute('transform',`translate(${x} ${y-32})`);
    });
  }
}
