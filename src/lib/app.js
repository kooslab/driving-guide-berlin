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
  const $ = (s,p)=> (p||document).querySelector(s);
  const main = $('#main'), nav = $('#nav');
  let player = null;

  class Player {
    constructor(view, ui){ this.view=view; this.ui=ui; this.speed=1; this.playing=false; this.loop=false; this.quiz=false; this.quizAsked=false; this.t=0; this.last=null; this._capIdx=-1; this.render(0);
      if(ui){ ui.play.onclick=()=> this.playing? this.pause(): this.play(); ui.step.onclick=()=> this.step(); ui.replay.onclick=()=> this.replay(); ui.speed.onclick=()=> this.toggleSpeed(); ui.quizBtn.onclick=()=> this.setQuiz(!this.quiz);
        const kf = view.keyframes; ui.tl.innerHTML='<i></i>'+kf.map(k=>`<b style="left:${(k/view.duration*100).toFixed(1)}%"></b>`).join('');
        ui.tl.onclick=(e)=>{ const r=ui.tl.getBoundingClientRect(); this.t = (e.clientX-r.left)/r.width*view.duration; this.render(this.t); }; }
    }
    play(){ if(this.t>=this.view.duration-0.01) this.t=0; this.playing=true; this.last=null; if(this.ui) this.ui.play.innerHTML=ICON.pause+' Pause'; this.raf=requestAnimationFrame(ts=>this.tick(ts)); }
    pause(){ this.playing=false; cancelAnimationFrame(this.raf); if(this.ui) this.ui.play.innerHTML=ICON.play+' Play'; }
    stop(){ this.pause(); }
    replay(){ this.t=0; this.quizAsked=false; this._capIdx=-1; if(this.quiz){ this.view.quizHidden=true; this.ui.quiz.classList.add('hidden'); } this.render(0); this.play(); }
    step(){ const kf=this.view.keyframes; const nxt = kf.find(k=>k>this.t+0.05); this.pause(); this.t = nxt!=null? nxt : this.view.duration; this.render(this.t); }
    toggleSpeed(){ this.speed = this.speed===1? .5 : 1; this.ui.speed.classList.toggle('on', this.speed!==1); }
    setQuiz(on){ this.quiz=on; try{ localStorage.setItem('bk-quiz', on?'1':'0'); }catch(e){} this.ui.quizBtn.classList.toggle('on',on); this.replay(); if(!on){ this.view.quizHidden=false; this.ui.quiz.classList.add('hidden'); this.render(this.t);} }
    tick(ts){ if(!this.playing) return; if(this.last==null) this.last=ts; const dt=(ts-this.last)/1000*this.speed*BASE_RATE; this.last=ts; this.t+=dt;
      if(this.quiz && !this.quizAsked && this.t>=T_ARRIVE+0.3){ this.t=T_ARRIVE+0.3; this.render(this.t); this.askQuiz(); return; }
      if(this.t>=this.view.duration){ this.t=this.view.duration; this.render(this.t); if(this.loop){ this.t=0; } else { this.pause(); return; } }
      this.render(this.t); this.raf=requestAnimationFrame(ts2=>this.tick(ts2)); }
    render(t){ const v=this.view; v.setTime(t); if(!this.ui) return; this.ui.tl.firstChild.style.width=(t/v.duration*100)+'%';
      const caps = v.scene.captions||[]; let ci=0; for(let i=1;i<caps.length;i++){ if(v.capTimes[i]!=null && t>=v.capTimes[i]) ci=i; }
      if(this.quiz && v.quizHidden && ci>0) ci=0;
      const text = caps[ci]||'';
      if(ci !== this._capIdx){ this._capIdx=ci; const cap=this.ui.cap; cap.classList.remove('cap-enter'); const inner=text?'<span class="stepno">'+(ci===0?'start':'step '+ci)+'</span><span>'+text+'</span>':''; cap.textContent=''; if(inner){ cap.insertAdjacentHTML('beforeend',inner); void cap.offsetWidth; cap.classList.add('cap-enter'); } }
    }
    askQuiz(){ this.pause(); this.quizAsked=true; const v=this.view, s=v.scene; const q = s.quiz||{}; const ans = q.answer || (s.order&&s.order[0]) || [];
      const opts = (q.options || v.actors.filter(a=>!a.static && a.def.kind!=='ped').map(a=>a.id));
      this.ui.quiz.classList.remove('hidden');
      this.ui.quiz.innerHTML = `<p>${q.q||'Who goes first?'}</p><div class="opts">${opts.map(id=>{ const a=v.actors.find(x=>x.id===id); return `<button data-id="${id}"><span class="dot" style="background:${a?a.color:'#999'}"></span>${a&&a.def.label?a.def.label:id==='you'?'You (blue)':id}</button>`; }).join('')}</div><div class="fb"></div>`;
      this.ui.quiz.querySelectorAll('button').forEach(b=> b.onclick=()=>{ const ok = ans.length===0 || ans.includes(b.dataset.id); const fb=this.ui.quiz.querySelector('.fb'); fb.className='fb '+(ok?'ok':'no'); fb.textContent = ok? 'Correct. ' + (q.why||'Watch the animation to see the full order.') : 'Not quite. ' + (q.why||'Watch who actually goes first.'); v.quizHidden=false; this.ui.quiz.querySelectorAll('button').forEach(x=>x.disabled=true); setTimeout(()=>this.play(), 900); }); }
  }

  function route(){ const h = location.hash.replace('#','') || 'home'; const [k, v] = h.split('/');
    if(player){ player.stop(); player=null; }
    const fn = document.querySelector('.float-nav'); if(fn) fn.remove();
    if(k==='s') renderScene(v); else if(k==='ch') renderChapter(+v); else if(k==='signs') renderGlossary(); else renderHome();
    main.classList.remove('scene-enter'); void main.offsetWidth; main.classList.add('scene-enter');
    renderNav(k, v); window.scrollTo(0,0); }

  function renderNav(k, v){
    const cur = k==='s' ? SCENES.find(s=>s.id===v) : null; const curCh = k==='ch' ? +v : cur ? cur.ch : null;
    nav.innerHTML = `<button data-h="home" ${k==='home'||k===''?'aria-current="true"':''}><span class="num">Home</span>Start</button>
      <div class="eyebrow">Chapters</div>` +
      CHAPTERS.map(c=>`<button data-h="ch/${c.n}" ${curCh===c.n?'aria-current="true"':''}><span class="num">${c.n}</span><span>${c.title}</span><span class="cnt">${SCENES.filter(s=>s.ch===c.n).length}</span></button>`).join('') +
      `<div class="sep"></div><button data-h="signs" ${k==='signs'?'aria-current="true"':''}><span class="num">Ref</span>Sign glossary</button>`;
    nav.querySelectorAll('button').forEach(b=> b.onclick=()=> location.hash = b.dataset.h);
  }

  function thumb(scene, t){ const svg = document.createElementNS(NS,'svg'); const v = new SceneView(svg, scene); v.quizHidden=true; v.setTime(t==null?T_ARRIVE+0.1:t); v.actors.forEach(a=>{ if(a.intent){ a.intent.setAttribute('opacity',.7); a.intentHead.setAttribute('opacity',.7);} }); return svg; }

  function renderHome(){
    const isAuto = config.guide === 'auto';
    const heroIntro = config.heroIntro.replace('SCENE_COUNT', SCENES.length);
    const legendYou = `<div><i style="background:${config.youColor};border-radius:50%;height:14px"></i>${config.youLabel}</div>`;
    const legendCars = isAuto
      ? `<div><i style="background:${COL.cars[0]}"></i>Other cars</div>`
      : `<div><i style="background:${COL.cars[0]}"></i>Cars</div>`;
    const legendBike = isAuto
      ? `<div><i style="background:${COL.bike};border-radius:50%;height:14px"></i>Cyclist</div>`
      : `<div><i style="background:${COL.bike};border-radius:50%;height:14px"></i>Other cyclists</div>`;
    main.innerHTML = `<div class="hero"><div>
        <div class="crumb">${config.crumb}</div>
        <h2>${config.heroTitle}</h2>
        <p>${heroIntro}</p>
        <p><button class="controls-inline" id="startBtn" style="background:${config.startColor};color:${config.startTextColor};padding:10px 16px;border-radius:8px;font-weight:600;margin-top:6px">Start with chapter 1 &rarr;</button></p>
      </div><div class="stage" id="heroStage"></div></div>
      <div class="card" style="margin-bottom:22px"><h3>How to read the scenes</h3><div class="legend">
        ${legendYou}${legendCars}<div><i style="background:${COL.bvg}"></i>Tram / BVG bus</div>${legendBike}<div><i style="background:${COL.ped};border-radius:50%;height:14px;border:2px solid #444"></i>Pedestrian</div>
        <div><i class="badge" style="background:var(--wait)">WARTEN</i>Must wait</div><div><i class="badge" style="background:var(--go)">1</i>Goes first</div><div><i style="width:22px;height:0;border-top:3px dashed ${COL.cars[3]}"></i>Intended path</div>
      </div></div>
      <div class="section-title">Chapters</div>
      <div class="chapters">${CHAPTERS.map(c=>`<button data-h="ch/${c.n}"><span class="num">CHAPTER ${c.n}</span><span class="t">${c.title}</span><span class="d">${c.desc}</span><span class="c">${SCENES.filter(s=>s.ch===c.n).length} scenes</span></button>`).join('')}</div>`;
    main.querySelectorAll('[data-h]').forEach(b=> b.onclick=()=> location.hash=b.dataset.h);
    $('#startBtn').onclick = ()=> location.hash = 's/'+SCENES.find(s=>s.ch===1).id;
    const demo = SCENES.find(s=>s.id===config.demoSceneId) || SCENES[0];
    const svg = document.createElementNS(NS,'svg'); $('#heroStage').appendChild(svg);
    player = new Player(new SceneView(svg, demo), null); player.loop = true; player.play();
  }

  function renderChapter(n){
    const c = CHAPTERS.find(x=>x.n===n); const list = SCENES.filter(s=>s.ch===n);
    main.innerHTML = `<div class="crumb">Chapter ${n} &middot; <i>${c.de}</i></div><div class="scene-head"><h2>${c.title}</h2><p class="de">${c.desc}</p></div>
      <div class="scenelist" style="margin-top:18px">${list.map(s=>`<button data-id="${s.id}"><div class="th"></div><div class="t">${s.title}<span class="de">${s.de||''}</span></div></button>`).join('')}</div>`;
    main.querySelectorAll('[data-id]').forEach((b,i)=>{ b.querySelector('.th').appendChild(thumb(list[i])); b.onclick=()=> location.hash='s/'+b.dataset.id; });
  }

  function renderGlossary(){
    main.innerHTML = `<div class="crumb">Reference</div><div class="scene-head"><h2>Sign glossary</h2><p class="de">Every sign used in the scenes, with its official number. Tap "used in" to jump to a situation.</p></div>
      <div class="gloss" style="margin-top:18px">${Object.keys(SIGNS).map(code=>{ const s=SIGNS[code]; const used = SCENES.filter(sc=>(sc.signs||[]).some(x=>x.code===code));
        return `<div class="g">${signSVG(code,56)}<div><b>${s.name}</b><span class="code">${/^\d/.test(code)?'Zeichen '+code:''}</span><p><b style="color:var(--ink)">${s.en}.</b> ${s.desc}</p>${used.length?`<p>Used in: ${used.slice(0,3).map(u=>`<a href="#s/${u.id}">${u.title}</a>`).join(' &middot; ')}</p>`:''}</div></div>`; }).join('')}</div>`;
  }

  function renderScene(id){
    const idx = SCENES.findIndex(s=>s.id===id); if(idx<0){ location.hash='home'; return; }
    const s = SCENES[idx], c = CHAPTERS.find(x=>x.n===s.ch); const prev = SCENES[idx-1], next = SCENES[idx+1];
    const chIdx = SCENES.filter(x=>x.ch===s.ch).findIndex(x=>x.id===id)+1, chCount = SCENES.filter(x=>x.ch===s.ch).length;
    try{ localStorage.setItem('bk-last', id); }catch(e){}
    main.innerHTML = `<div class="topbar"><div class="crumb">Chapter ${s.ch} &middot; <b>${c.title}</b></div><div class="progress">scene ${chIdx} / ${chCount} &middot; ${idx+1} of ${SCENES.length}</div></div>
      <div class="scene-head"><h2>${s.title}</h2><p class="de">${s.de||''}</p></div>
      <div class="grid">
        <div>
          <div class="stage"><svg id="stage"></svg>
            <div class="timeline" id="tl"><i></i></div>
            <div class="caption" id="cap"></div>
            <div class="quiz hidden" id="quiz"></div>
            <div class="controls">
              <button class="primary" id="btnPlay">${ICON.play} Play</button>
              <button id="btnStep" title="Jump to the next moment">${ICON.step} Step</button>
              <button id="btnReplay">${ICON.replay} Replay</button>
              <button id="btnSpeed" title="Slow motion">1/2x</button>
              <span class="spacer"></span>
              <button id="btnQuiz" title="Hide the answer and guess first">Quiz mode</button>
            </div>
          </div>
        </div>
        <div class="explain">
          <div class="card rule"><h3>The rule</h3>${s.rule.split('\n').map(p=>`<p>${p}</p>`).join('')}${s.stvo?`<span class="stvo">${s.stvo}</span>`:''}</div>
          ${s.mistake?`<div class="card mistake"><h3>Common mistake</h3><p>${s.mistake}</p></div>`:''}
          ${s.berlin?`<div class="card berlin"><h3>Berlin note</h3><p>${s.berlin}</p></div>`:''}
          ${(s.signs&&s.signs.length)?`<div class="card"><h3>Signs in this scene</h3><div class="signs">${[...new Set(s.signs.map(x=>x.code))].map(code=>`<div class="s">${signSVG(code,38)}<div><b>${SIGNS[code].name}</b><span>${SIGNS[code].en}</span></div></div>`).join('')}</div></div>`:''}
        </div>
      </div>
      <div class="pager">${prev?`<button id="prevBtn"><small>&larr; Previous</small><span>${prev.title}</span></button>`:'<span></span>'}${next?`<button id="nextBtn" class="next"><small>Next &rarr;</small><span>${next.title}</span></button>`:''}</div>`;
    if(prev) $('#prevBtn').onclick=()=> location.hash='s/'+prev.id; if(next) $('#nextBtn').onclick=()=> location.hash='s/'+next.id;
    const fn = document.createElement('div'); fn.className='float-nav';
    if(prev){ const b=document.createElement('button'); b.className='fn-prev'; b.textContent='<- '+prev.title.slice(0,28); b.onclick=()=>location.hash='s/'+prev.id; fn.appendChild(b); }
    if(next){ const b=document.createElement('button'); b.className='fn-next'; b.textContent=next.title.slice(0,28)+' ->'; b.onclick=()=>location.hash='s/'+next.id; fn.appendChild(b); }
    document.body.appendChild(fn);
    const view = new SceneView($('#stage'), s);
    player = new Player(view, { tl:$('#tl'), cap:$('#cap'), quiz:$('#quiz'), play:$('#btnPlay'), step:$('#btnStep'), replay:$('#btnReplay'), speed:$('#btnSpeed'), quizBtn:$('#btnQuiz') });
    try{ if(localStorage.getItem('bk-quiz')==='1') player.setQuiz(true); }catch(e){}
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce) player.play();
  }

  window.addEventListener('hashchange', route);
  route();
}
