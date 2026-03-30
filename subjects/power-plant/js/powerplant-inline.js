// ═══════════════════════════════════════════════════════
//  REACTOR ANIMATIONS — JS-driven SVG element spawning
// ═══════════════════════════════════════════════════════
const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('plant');
const CORE_X = 170, CORE_Y = 268, CORE_R = 32;
const VESSEL_X1=114, VESSEL_X2=226, VESSEL_Y1=150, VESSEL_Y2=368;

function rand(a, b){ return a + Math.random()*(b-a); }
function randInt(a,b){ return Math.floor(rand(a,b)); }

// 1. NEUTRON PARTICLES
const neutronLayer = document.getElementById('neutron-layer');
const neutronColors = ['#ffffff','#aaffee','#ccffcc','#88ffcc','#ffff88'];

function spawnNeutron(){
  const ox = rand(148, 198);
  const oy = rand(237, 295);
  const angle = rand(0, Math.PI*2);
  const dist  = rand(25, 75);
  const tx    = ox + Math.cos(angle)*dist;
  const ty    = oy + Math.sin(angle)*dist;
  const dur   = rand(0.4, 0.9);
  const color = neutronColors[randInt(0,neutronColors.length)];

  const line = document.createElementNS(SVG_NS,'line');
  line.setAttribute('x1', ox); line.setAttribute('y1', oy);
  line.setAttribute('x2', ox); line.setAttribute('y2', oy);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', rand(1,2.2).toFixed(1));
  line.setAttribute('stroke-linecap','round');
  line.setAttribute('opacity','0.9');
  neutronLayer.appendChild(line);

  let start = null;
  const durMs = dur*1000;
  function step(ts){
    if(!start) start=ts;
    const p = Math.min((ts-start)/durMs, 1);
    const ease = p<.5 ? 2*p*p : -1+(4-2*p)*p;
    line.setAttribute('x2', ox + (tx-ox)*ease);
    line.setAttribute('y2', oy + (ty-oy)*ease);
    if(p<.6) line.setAttribute('opacity', (0.9*(p/0.6)).toFixed(2));
    else      line.setAttribute('opacity', (0.9*(1-(p-.6)/.4)).toFixed(2));
    if(p<1) requestAnimationFrame(step);
    else neutronLayer.removeChild(line);
  }
  requestAnimationFrame(step);
}
function neutronLoop(){ spawnNeutron(); setTimeout(neutronLoop, rand(35,120)); }
neutronLoop();

// 2. FISSION BURST FLASHES
const fissionLayer = document.getElementById('fission-layer');
const fissionColors=['#ffffff','#ffff44','#aaffaa','#ff8800','#44ffff'];

function spawnFission(){
  const cx = rand(148, 200);
  const cy = rand(238, 297);
  const r0 = rand(3,8);
  const color = fissionColors[randInt(0,fissionColors.length)];
  const dur = rand(250,500);

  const circle = document.createElementNS(SVG_NS,'circle');
  circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
  circle.setAttribute('r', r0*.1);
  circle.setAttribute('fill', color);
  circle.setAttribute('opacity','0');
  fissionLayer.appendChild(circle);

  let start=null;
  function step(ts){
    if(!start) start=ts;
    const p = Math.min((ts-start)/dur,1);
    let r, op;
    if(p < .35){ r=r0*(p/.35); op=p/.35; }
    else { r=r0*(1-(p-.35)/.65); op=1-(p-.35)/.65; }
    circle.setAttribute('r', Math.max(r,0));
    circle.setAttribute('opacity', Math.max(op,0));
    if(p<1) requestAnimationFrame(step);
    else fissionLayer.removeChild(circle);
  }
  requestAnimationFrame(step);
}
function fissionLoop(){ spawnFission(); setTimeout(fissionLoop, rand(80,300)); }
fissionLoop();

// 3. HEAT SHIMMER WAVE
const heatLines = [];
for(let i=0;i<5;i++){
  const hl = document.createElementNS(SVG_NS,'path');
  hl.setAttribute('fill','none'); hl.setAttribute('stroke','#ff4400');
  hl.setAttribute('stroke-width','1.2'); hl.setAttribute('opacity','0');
  hl.setAttribute('clip-path','url(#vesselClip)');
  neutronLayer.parentNode.insertBefore(hl, neutronLayer);
  heatLines.push({el:hl, phase:rand(0,Math.PI*2), y: rand(230,310)});
}
function drawHeatLines(ts){
  heatLines.forEach((h,i)=>{
    const t = ts*.0015 + h.phase;
    const amp = rand(1,4);
    let d = "M 120 " + h.y;
    for(let x=120;x<=228;x+=4){
      const dy = Math.sin((x-120)*.18 + t)*amp;
      d += " L " + x + " " + (h.y+dy);
    }
    h.el.setAttribute('d',d);
    h.y += (Math.sin(t*.7)*.15);
    if(h.y<220) h.y=220; if(h.y>320) h.y=320;
    const op = 0.08 + 0.1*Math.abs(Math.sin(t*.4));
    h.el.setAttribute('opacity', op.toFixed(3));
  });
  requestAnimationFrame(drawHeatLines);
}
requestAnimationFrame(drawHeatLines);

// 4. COOLANT RISING BUBBLES
const bubbleLayer = document.getElementById('coolant-bubbles');
function spawnBubble(){
  const x = rand(120, 225);
  const y0 = rand(330, 365);
  const r  = rand(1.5, 4);
  const dur = rand(1.8, 4.0)*1000;
  const travelY = rand(110,160);
  const color = Math.random()>.5 ? '#44aaff':'#66ccff';

  const c = document.createElementNS(SVG_NS,'circle');
  c.setAttribute('cx', x); c.setAttribute('cy', y0);
  c.setAttribute('r', r); c.setAttribute('fill', color);
  c.setAttribute('opacity','0'); c.setAttribute('stroke','#99ddff');
  c.setAttribute('stroke-width','.5');
  bubbleLayer.appendChild(c);

  let start=null;
  const drift = rand(-12,12);
  function step(ts){
    if(!start) start=ts;
    const p = Math.min((ts-start)/dur,1);
    const ease = 1-Math.pow(1-p,2);
    const newY = y0 - travelY*ease;
    const newX = x + drift*p;
    c.setAttribute('cy', newY); c.setAttribute('cx', newX);
    let op;
    if(p<.15) op=p/.15 * 0.7; else if(p>.75) op=(1-(p-.75)/.25)*0.7; else op=0.7;
    c.setAttribute('opacity', op.toFixed(3));
    if(p<1) requestAnimationFrame(step); else bubbleLayer.removeChild(c);
  }
  requestAnimationFrame(step);
}
function bubbleLoop(){ spawnBubble(); setTimeout(bubbleLoop, rand(120,400)); }
bubbleLoop();

// 5. DYNAMIC TEMPERATURE READOUT
const tempEl = document.getElementById('temp-val');
let baseTemp = 320;
function updateTemp(){
  baseTemp += rand(-.8, .8);
  if(baseTemp<316) baseTemp=316; if(baseTemp>325) baseTemp=325;
  tempEl.textContent = baseTemp.toFixed(0) + ' °C';
  setTimeout(updateTemp, rand(600,1400));
}
updateTemp();

// 6. POWER BAR dynamic % label
const panelG = document.getElementById('reactor-panel');
const panelTexts = panelG.querySelectorAll('text');
let pwrPct = 97;
function updatePwr(){
  pwrPct += rand(-.5,.5);
  if(pwrPct<95) pwrPct=95; if(pwrPct>99) pwrPct=99;
  if(panelTexts[3]) panelTexts[3].textContent = pwrPct.toFixed(0)+'%';
  setTimeout(updatePwr, rand(800,2000));
}
updatePwr();

// ══════════════════════════════════════════════════════
//  TURBINE ANIMATION
// ══════════════════════════════════════════════════════
const turbStages = [
  { id:'tblades-hp', cx:535, cy:170, rHub:8,  rTip:19, nBlades:11, degSec:480, angle:0,
    color:'#44aacc', highlight:'#88ddf0', strokeColor:'#1a4a60' },
  { id:'tblades-ip', cx:577, cy:170, rHub:10, rTip:23, nBlades:10, degSec:390, angle:60,
    color:'#3399bb', highlight:'#77ccee', strokeColor:'#1a4460' },
  { id:'tblades-lp', cx:619, cy:170, rHub:13, rTip:27, nBlades:9,  degSec:310, angle:20,
    color:'#2288aa', highlight:'#66bbd8', strokeColor:'#143a50' },
];

function buildTurbineBlades(stage) {
  const el = document.getElementById(stage.id);
  el.innerHTML = '';
  const { cx, cy, rHub, rTip, nBlades, color, highlight, strokeColor } = stage;
  const step = (Math.PI * 2) / nBlades;
  for (let i = 0; i < nBlades; i++) {
    const a0 = i * step;
    const aH1 = a0;
    const aT1 = a0 + step * 0.12;
    const aT2 = a0 + step * 0.72;
    const aH2 = a0 + step * 0.58;
    const pts = [
      [cx + rHub * Math.cos(aH1), cy + rHub * Math.sin(aH1)],
      [cx + rTip * Math.cos(aT1), cy + rTip * Math.sin(aT1)],
      [cx + rTip * Math.cos(aT2), cy + rTip * Math.sin(aT2)],
      [cx + rHub * Math.cos(aH2), cy + rHub * Math.sin(aH2)],
    ];
    const d = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ')+' Z';
    const blade = document.createElementNS(SVG_NS,'path');
    blade.setAttribute('d',d); blade.setAttribute('fill',color);
    blade.setAttribute('stroke',strokeColor); blade.setAttribute('stroke-width','0.8');
    blade.setAttribute('opacity','0.92');
    el.appendChild(blade);
    const tipLine = document.createElementNS(SVG_NS,'line');
    tipLine.setAttribute('x1',pts[1][0].toFixed(2)); tipLine.setAttribute('y1',pts[1][1].toFixed(2));
    tipLine.setAttribute('x2',pts[2][0].toFixed(2)); tipLine.setAttribute('y2',pts[2][1].toFixed(2));
    tipLine.setAttribute('stroke',highlight); tipLine.setAttribute('stroke-width','1.2');
    tipLine.setAttribute('opacity','0.55');
    el.appendChild(tipLine);
  }
}
turbStages.forEach(buildTurbineBlades);

let tLast = 0;
function animateTurbineBlades(ts) {
  const dt = Math.min((ts - tLast) / 1000, 0.05);
  tLast = ts;
  turbStages.forEach(s => {
    s.angle += s.degSec * dt;
    const el = document.getElementById(s.id);
    el.setAttribute('transform', "rotate("+s.angle.toFixed(2)+","+s.cx+","+s.cy+")");
  });
  requestAnimationFrame(animateTurbineBlades);
}
requestAnimationFrame(ts => { tLast = ts; requestAnimationFrame(animateTurbineBlades); });

const turbSteamFXEl = document.getElementById('turb-steam-fx');
function spawnTurbineSteam() {
  const yStart = rand(130, 168);
  const xStart = 512, xEnd = 644;
  const dur = rand(500, 1100);
  const r = rand(1.2, 3.2);
  const opacity = rand(0.35, 0.75);
  const c = document.createElementNS(SVG_NS,'circle');
  c.setAttribute('cx', xStart); c.setAttribute('cy', yStart);
  c.setAttribute('r',  r); c.setAttribute('fill','#a8e8f8');
  c.setAttribute('opacity','0');
  turbSteamFXEl.appendChild(c);
  let tss = null;
  function step(ts) {
    if (!tss) tss = ts;
    const p = Math.min((ts - tss) / dur, 1);
    const ease = p < .5 ? 2*p*p : -1+(4-2*p)*p;
    c.setAttribute('cx', (xStart + (xEnd-xStart)*ease).toFixed(1));
    c.setAttribute('cy', (yStart + p*6).toFixed(1));
    const op = p < .15 ? (p/.15)*opacity : p > .82 ? ((1-(p-.82)/.18)*opacity) : opacity;
    c.setAttribute('opacity', op.toFixed(3));
    if (p < 1) requestAnimationFrame(step);
    else { try { turbSteamFXEl.removeChild(c); } catch(e){} }
  }
  requestAnimationFrame(step);
}
(function turbSteamLoop() { spawnTurbineSteam(); setTimeout(turbSteamLoop, rand(55,160)); })();

function spawnBladeBlur(stageIdx) {
  const s = turbStages[stageIdx];
  const blurCirc = document.createElementNS(SVG_NS,'circle');
  blurCirc.setAttribute('cx', s.cx); blurCirc.setAttribute('cy', s.cy);
  blurCirc.setAttribute('r', s.rTip);
  blurCirc.setAttribute('fill','none'); blurCirc.setAttribute('stroke', s.highlight);
  blurCirc.setAttribute('stroke-width','2'); blurCirc.setAttribute('opacity','0');
  blurCirc.setAttribute('filter','url(#bladeBlur)');
  turbSteamFXEl.appendChild(blurCirc);
  let ts0 = null;
  (function fade(ts) {
    if (!ts0) ts0 = ts;
    const p = Math.min((ts-ts0)/350,1);
    blurCirc.setAttribute('opacity', (p<.3 ? p/.3*.45 : (1-(p-.3)/.7)*.45).toFixed(3));
    if (p<1) requestAnimationFrame(fade);
    else { try { turbSteamFXEl.removeChild(blurCirc); } catch(e){} }
  })();
}
(function blurLoop() { spawnBladeBlur(randInt(0,3)); setTimeout(blurLoop, rand(180, 450)); })();

const turbRpmEl = document.getElementById('turb-rpm');
let turbRpm = 3000;
(function updateTurbRpm() {
  turbRpm += rand(-4,4);
  turbRpm = Math.max(2990, Math.min(3010, turbRpm));
  if (turbRpmEl) turbRpmEl.textContent = Math.round(turbRpm).toLocaleString();
  setTimeout(updateTurbRpm, rand(500,1300));
})();

// ══════════════════════════════════════════════════════
//  GENERATOR ANIMATION
// ══════════════════════════════════════════════════════
const GEN_CX = 737, GEN_CY = 171;
const ST_OUTER = 52, ST_INNER_TOOTH = 44, ST_POLE_BASE = 36;
const ROTOR_R = 28, ROTOR_POLE_R = 32;
const N_STATOR_POLES = 6;

const genStatorSVG  = document.getElementById('gen-stator-svg');
const genFieldSVG   = document.getElementById('gen-field-svg');
const genRotorSVG   = document.getElementById('gen-rotor-svg');
const genCoilGlowEl = document.getElementById('gen-coil-glow');
const genSparkLayer = document.getElementById('gen-spark-layer');

function buildStator() {
  genStatorSVG.innerHTML = '';
  for (let i = 0; i < N_STATOR_POLES; i++) {
    const aMid = (i / N_STATOR_POLES) * Math.PI * 2;
    const SHOE_HALF = 0.30;
    const STEM_HALF = 0.14;
    const shoePts = [
      [GEN_CX + ST_INNER_TOOTH * Math.cos(aMid - SHOE_HALF), GEN_CY + ST_INNER_TOOTH * Math.sin(aMid - SHOE_HALF)],
      [GEN_CX + ST_INNER_TOOTH * Math.cos(aMid + SHOE_HALF), GEN_CY + ST_INNER_TOOTH * Math.sin(aMid + SHOE_HALF)],
      [GEN_CX + ST_POLE_BASE   * Math.cos(aMid + STEM_HALF), GEN_CY + ST_POLE_BASE   * Math.sin(aMid + STEM_HALF)],
      [GEN_CX + ST_POLE_BASE   * Math.cos(aMid - STEM_HALF), GEN_CY + ST_POLE_BASE   * Math.sin(aMid - STEM_HALF)],
    ];
    const shoeD = shoePts.map((p,j)=>(j===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+' Z';
    const shoe = document.createElementNS(SVG_NS,'path');
    shoe.setAttribute('d', shoeD); shoe.setAttribute('fill','#1a2e48');
    shoe.setAttribute('stroke','#2a4a68'); shoe.setAttribute('stroke-width','1');
    genStatorSVG.appendChild(shoe);

    const coilColors = ['#8a3a00','#c05800','#e07010','#c05800','#8a3a00'];
    for (let ci = 0; ci < 5; ci++) {
      const cr = ST_POLE_BASE + 2 + ci * 1.8;
      const coil = document.createElementNS(SVG_NS,'line');
      const x1 = GEN_CX + cr * Math.cos(aMid - STEM_HALF * 0.9);
      const y1 = GEN_CY + cr * Math.sin(aMid - STEM_HALF * 0.9);
      const x2 = GEN_CX + cr * Math.cos(aMid + STEM_HALF * 0.9);
      const y2 = GEN_CY + cr * Math.sin(aMid + STEM_HALF * 0.9);
      coil.setAttribute('x1', x1.toFixed(1)); coil.setAttribute('y1', y1.toFixed(1));
      coil.setAttribute('x2', x2.toFixed(1)); coil.setAttribute('y2', y2.toFixed(1));
      coil.setAttribute('stroke', coilColors[ci]); coil.setAttribute('stroke-width','2.8');
      coil.setAttribute('stroke-linecap','round'); coil.setAttribute('opacity','.9');
      genStatorSVG.appendChild(coil);
    }
    const slotAngle = aMid + Math.PI / N_STATOR_POLES;
    const slotLine = document.createElementNS(SVG_NS,'line');
    slotLine.setAttribute('x1', (GEN_CX + ST_INNER_TOOTH * Math.cos(slotAngle)).toFixed(1));
    slotLine.setAttribute('y1', (GEN_CY + ST_INNER_TOOTH * Math.sin(slotAngle)).toFixed(1));
    slotLine.setAttribute('x2', (GEN_CX + ST_OUTER * Math.cos(slotAngle)).toFixed(1));
    slotLine.setAttribute('y2', (GEN_CY + ST_OUTER * Math.sin(slotAngle)).toFixed(1));
    slotLine.setAttribute('stroke','#0a1020'); slotLine.setAttribute('stroke-width','3');
    genStatorSVG.appendChild(slotLine);
  }
  const airRing = document.createElementNS(SVG_NS,'circle');
  airRing.setAttribute('cx', GEN_CX); airRing.setAttribute('cy', GEN_CY);
  airRing.setAttribute('r', ST_INNER_TOOTH - 1);
  airRing.setAttribute('fill','none'); airRing.setAttribute('stroke','#2a4060');
  airRing.setAttribute('stroke-width','.8');
  genStatorSVG.appendChild(airRing);
}
buildStator();

function buildRotorOnce() {
  genRotorSVG.innerHTML = '';
  const disk = document.createElementNS(SVG_NS,'circle');
  disk.setAttribute('cx',GEN_CX); disk.setAttribute('cy',GEN_CY); disk.setAttribute('r',ROTOR_R);
  disk.setAttribute('fill','url(#genRotorGrad)');
  disk.setAttribute('stroke','#3a5a70'); disk.setAttribute('stroke-width','1.5');
  genRotorSVG.appendChild(disk);

  for (let p = 0; p < 2; p++) {
    const baseAngle = p * Math.PI;
    const POLE_HALF = 0.45;
    const pts = [];
    const STEM_HALF = 0.2;
    pts.push([GEN_CX + ROTOR_R * Math.cos(baseAngle - STEM_HALF), GEN_CY + ROTOR_R * Math.sin(baseAngle - STEM_HALF)]);
    for (let k = 0; k <= 6; k++) {
      const a = baseAngle - POLE_HALF + k * (POLE_HALF*2/6);
      pts.push([GEN_CX + ROTOR_POLE_R * Math.cos(a), GEN_CY + ROTOR_POLE_R * Math.sin(a)]);
    }
    pts.push([GEN_CX + ROTOR_R * Math.cos(baseAngle + STEM_HALF), GEN_CY + ROTOR_R * Math.sin(baseAngle + STEM_HALF)]);
    const d = pts.map((pt,i)=>(i===0?'M':'L')+pt[0].toFixed(2)+','+pt[1].toFixed(2)).join(' ')+' Z';
    const polePath = document.createElementNS(SVG_NS,'path');
    polePath.setAttribute('d', d);
    polePath.setAttribute('fill', p===0 ? '#1e3858' : '#1e2e50');
    polePath.setAttribute('stroke', p===0 ? '#ffaa30' : '#5599ff');
    polePath.setAttribute('stroke-width','1.2');
    genRotorSVG.appendChild(polePath);

    for (let fw = -1; fw <= 1; fw++) {
      const fwAngle = baseAngle + fw * 0.16;
      const fwR1 = ROTOR_R + 1, fwR2 = ROTOR_POLE_R - 1;
      const fwLine = document.createElementNS(SVG_NS,'line');
      fwLine.setAttribute('x1', (GEN_CX + fwR1 * Math.cos(fwAngle)).toFixed(2));
      fwLine.setAttribute('y1', (GEN_CY + fwR1 * Math.sin(fwAngle)).toFixed(2));
      fwLine.setAttribute('x2', (GEN_CX + fwR2 * Math.cos(fwAngle)).toFixed(2));
      fwLine.setAttribute('y2', (GEN_CY + fwR2 * Math.sin(fwAngle)).toFixed(2));
      fwLine.setAttribute('stroke', p===0 ? '#ffcc66' : '#88aaff');
      fwLine.setAttribute('stroke-width','1.4'); fwLine.setAttribute('opacity','.75');
      genRotorSVG.appendChild(fwLine);
    }
    const lx = GEN_CX + (ROTOR_POLE_R - 4) * Math.cos(baseAngle);
    const ly = GEN_CY + (ROTOR_POLE_R - 4) * Math.sin(baseAngle);
    const label = document.createElementNS(SVG_NS,'text');
    label.setAttribute('x', lx.toFixed(1)); label.setAttribute('y', ly.toFixed(1));
    label.setAttribute('font-family','Orbitron,sans-serif'); label.setAttribute('font-size','7');
    label.setAttribute('fill', p===0 ? '#ffcc55' : '#88aaff');
    label.setAttribute('text-anchor','middle'); label.setAttribute('dominant-baseline','middle');
    label.textContent = p===0 ? 'N' : 'S';
    genRotorSVG.appendChild(label);
  }
  const hub = document.createElementNS(SVG_NS,'circle');
  hub.setAttribute('cx',GEN_CX); hub.setAttribute('cy',GEN_CY); hub.setAttribute('r','5');
  hub.setAttribute('fill','#c0ccd8'); hub.setAttribute('stroke','#ffe66d'); hub.setAttribute('stroke-width','1.2');
  genRotorSVG.appendChild(hub);
}
buildRotorOnce();

function updateFieldAndGlow(angle) {
  genFieldSVG.innerHTML = '';
  genCoilGlowEl.innerHTML = '';

  for (let p = 0; p < 2; p++) {
    const poleAngle = angle + p * Math.PI;
    const polarity  = p === 0 ? '#ff8800' : '#4499ff';
    const N_FIELD   = 5;

    for (let fi = 0; fi < N_FIELD; fi++) {
      const spreadFrac = (fi - (N_FIELD-1)/2) / ((N_FIELD-1)/2);
      const spreadAngle = spreadFrac * 0.6;
      const startA = poleAngle + spreadAngle * 0.4;
      const endA   = poleAngle + spreadAngle;

      const x1 = GEN_CX + (ROTOR_POLE_R + 1) * Math.cos(startA);
      const y1 = GEN_CY + (ROTOR_POLE_R + 1) * Math.sin(startA);
      const x2 = GEN_CX + (ST_INNER_TOOTH - 1) * Math.cos(endA);
      const y2 = GEN_CY + (ST_INNER_TOOTH - 1) * Math.sin(endA);
      const cpR = (ROTOR_POLE_R + 1 + ST_INNER_TOOTH - 1) / 2 * 1.08;
      const cpA = poleAngle + spreadAngle * 0.7;
      const cpx = GEN_CX + cpR * Math.cos(cpA);
      const cpy = GEN_CY + cpR * Math.sin(cpA);

      const fl = document.createElementNS(SVG_NS,'path');
      fl.setAttribute('d', "M"+x1.toFixed(1)+","+y1.toFixed(1)+" Q"+cpx.toFixed(1)+","+cpy.toFixed(1)+" "+x2.toFixed(1)+","+y2.toFixed(1));
      fl.setAttribute('fill','none'); fl.setAttribute('stroke', polarity);
      fl.setAttribute('stroke-width', fi === Math.floor(N_FIELD/2) ? '1.8' : '0.9');
      const op = 0.15 + 0.45 * (1 - Math.abs(spreadFrac));
      fl.setAttribute('opacity', op.toFixed(2));
      genFieldSVG.appendChild(fl);

      if (fi === Math.floor(N_FIELD/2)) {
        const mt = 0.5;
        const ax = GEN_CX + (ROTOR_POLE_R + 1 + (ST_INNER_TOOTH - 1 - ROTOR_POLE_R - 1)*mt) * Math.cos(poleAngle);
        const ay = GEN_CY + (ROTOR_POLE_R + 1 + (ST_INNER_TOOTH - 1 - ROTOR_POLE_R - 1)*mt) * Math.sin(poleAngle);
        const arr = document.createElementNS(SVG_NS,'polygon');
        const s = 3.5;
        const apx1 = ax + s*Math.cos(poleAngle), apy1 = ay + s*Math.sin(poleAngle);
        const apx2 = ax + s*Math.cos(poleAngle+2.5), apy2 = ay + s*Math.sin(poleAngle+2.5);
        const apx3 = ax + s*Math.cos(poleAngle-2.5), apy3 = ay + s*Math.sin(poleAngle-2.5);
        arr.setAttribute('points', apx1.toFixed(1)+","+apy1.toFixed(1)+" "+apx2.toFixed(1)+","+apy2.toFixed(1)+" "+apx3.toFixed(1)+","+apy3.toFixed(1));
        arr.setAttribute('fill', polarity); arr.setAttribute('opacity','.55');
        genFieldSVG.appendChild(arr);
      }
    }
  }

  for (let i = 0; i < N_STATOR_POLES; i++) {
    const statorA = (i / N_STATOR_POLES) * Math.PI * 2;
    let minDist = Math.PI;
    for (let p = 0; p < 2; p++) {
      let d = Math.abs(statorA - (angle + p * Math.PI));
      d = d % (Math.PI * 2);
      if (d > Math.PI) d = Math.PI * 2 - d;
      minDist = Math.min(minDist, d);
    }
    const intensity = Math.pow(Math.max(0, 1 - minDist / (Math.PI * 0.45)), 2.5);
    if (intensity > 0.04) {
      const gr = (ST_POLE_BASE + ST_INNER_TOOTH) / 2;
      const glowEl = document.createElementNS(SVG_NS,'ellipse');
      glowEl.setAttribute('cx', (GEN_CX + gr * Math.cos(statorA)).toFixed(1));
      glowEl.setAttribute('cy', (GEN_CY + gr * Math.sin(statorA)).toFixed(1));
      glowEl.setAttribute('rx', (intensity * 10).toFixed(1));
      glowEl.setAttribute('ry', (intensity * 5).toFixed(1));
      glowEl.setAttribute('transform', "rotate("+((statorA * 180 / Math.PI) + 90).toFixed(1)+","+(GEN_CX + gr*Math.cos(statorA)).toFixed(1)+","+(GEN_CY + gr*Math.sin(statorA)).toFixed(1)+")");
      glowEl.setAttribute('fill','#ffe66d');
      glowEl.setAttribute('opacity', (intensity * 0.55).toFixed(2));
      glowEl.setAttribute('filter','url(#glow)');
      genCoilGlowEl.appendChild(glowEl);
    }
  }
}

let genAngle = 0, gLast = 0;
const GEN_DEG_SEC = 360 * 1.5;
function animateGenerator(ts) {
  const dt = Math.min((ts - gLast) / 1000, 0.05);
  gLast = ts;
  genAngle += GEN_DEG_SEC * dt;
  const rad = genAngle * Math.PI / 180;
  genRotorSVG.setAttribute('transform', "rotate("+genAngle.toFixed(2)+","+GEN_CX+","+GEN_CY+")");
  updateFieldAndGlow(rad);
  requestAnimationFrame(animateGenerator);
}
requestAnimationFrame(ts => { gLast = ts; requestAnimationFrame(animateGenerator); });

function spawnGenSpark() {
  const spark = document.createElementNS(SVG_NS,'circle');
  spark.setAttribute('cx', (818 + rand(-2,2)).toFixed(1));
  spark.setAttribute('cy', (154 + rand(0,24)).toFixed(1));
  spark.setAttribute('r',  rand(1.5,4).toFixed(1));
  spark.setAttribute('fill','#ffe66d');
  spark.setAttribute('filter','url(#glow)');
  spark.setAttribute('opacity','0.95');
  genSparkLayer.appendChild(spark);
  let ts0=null;
  (function fade(ts){
    if(!ts0) ts0=ts;
    const p=Math.min((ts-ts0)/220,1);
    spark.setAttribute('opacity',(p<.2 ? p/.2 : (1-(p-.2)/.8)).toFixed(3));
    if(p<1) requestAnimationFrame(fade);
    else { try{genSparkLayer.removeChild(spark);}catch(e){} }
  })();
  if (Math.random() > 0.6) {
    const arc = document.createElementNS(SVG_NS,'line');
    const ax = 818 + rand(-4,4), ay = 154 + rand(0,24);
    arc.setAttribute('x1',ax.toFixed(1)); arc.setAttribute('y1',ay.toFixed(1));
    arc.setAttribute('x2',(ax+rand(-5,5)).toFixed(1)); arc.setAttribute('y2',(ay+rand(-5,5)).toFixed(1));
    arc.setAttribute('stroke','#fffaaa'); arc.setAttribute('stroke-width','1.2');
    arc.setAttribute('opacity','0.8');
    genSparkLayer.appendChild(arc);
    setTimeout(()=>{ try{genSparkLayer.removeChild(arc);}catch(e){} }, rand(80,200));
  }
}
(function sparkLoop(){ spawnGenSpark(); setTimeout(sparkLoop, rand(250,1200)); })();

const genVoltEl = document.getElementById('gen-volt');
const genHzEl   = document.getElementById('gen-hz');
let genHz = 50.0, genVolt = 11.0;
(function updateGenReadout(){
  genHz   += rand(-0.025, 0.025);
  genVolt += rand(-0.06, 0.06);
  genHz   = Math.max(49.88, Math.min(50.12, genHz));
  genVolt = Math.max(10.8,  Math.min(11.2,  genVolt));
  if(genVoltEl) genVoltEl.textContent = genVolt.toFixed(1) + ' kV';
  if(genHzEl)   genHzEl.textContent   = genHz.toFixed(1);
  setTimeout(updateGenReadout, rand(350,900));
})();


  // Particles
  const ppContainer = document.getElementById('pp-particles');
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'pp-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 10}s;
      --dx: ${(Math.random() - 0.5) * 100}px;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      background: ${['#00d4ff','#ff6b00','#00ff88'][Math.floor(Math.random()*3)]};
      opacity: 0;
    `;
    ppContainer.appendChild(p);
  }

  // Intersection observer for card animations
  const ppObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = '0.1s';
        entry.target.classList.add('visible');
        ppObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.pp-card').forEach(c => ppObserver.observe(c));

  // Animate bars when in view
  const ppBarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.pp-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
        ppBarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const ppBarChart = document.getElementById('ppBarChart');
  if (ppBarChart) ppBarObserver.observe(ppBarChart);

  // Scroll to top button
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('ppScrollTop');
    if (btn) btn.classList.toggle('show', window.scrollY > 400);
  });

  // ══════════════════════════════════════════
  // COPY LATEX UTILITY
  // ══════════════════════════════════════════
  function copyLatex(tex) {
    navigator.clipboard.writeText(tex).then(() => {
      const toast = document.createElement('div');
      toast.textContent = '✅ LaTeX copied!';
      Object.assign(toast.style, {
        position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)',
        background:'rgba(0,255,136,0.15)', border:'1px solid #00ff88', color:'#00ff88',
        padding:'8px 20px', borderRadius:'6px', fontFamily:'"Share Tech Mono",monospace',
        fontSize:'12px', zIndex:'9999', animation:'ppFadeInDown 0.3s ease'
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1500);
    });
  }

  // ══════════════════════════════════════════
  // CARD 1: ENERGY FLOW CHAIN ANIMATION
  // ══════════════════════════════════════════
  (function initFlowChain() {
    const stages = [0,1,2,3,4];
    const tooltips = [
      'Fuel → Chemical/potential energy source',
      'Convert → Turbine converts to mechanical energy',
      'Step-Up → Voltage raised for long-distance transmission',
      'HV Line → 132kV–765kV transmission lines',
      'Distribute → Step-down transformer → consumer load'
    ];

    // Sequential pulse animation
    function pulseSequence() {
      stages.forEach((i, idx) => {
        const pulse = document.getElementById('fp-' + i);
        if (!pulse) return;
        setTimeout(() => {
          pulse.style.transition = 'opacity 0.3s';
          pulse.style.opacity = '1';
          setTimeout(() => { pulse.style.opacity = '0'; }, 600);
        }, idx * 400);
      });
    }

    // Auto-pulse on card visible
    const c1 = document.getElementById('c1');
    if (c1) {
      const flowObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(pulseSequence, 500);
            flowObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      flowObs.observe(c1);
    }

    // Click tooltip
    stages.forEach(i => {
      const stage = document.getElementById('flow-stage-' + i);
      if (stage) {
        stage.addEventListener('click', () => {
          const tip = document.getElementById('flow-tooltip');
          if (tip) {
            tip.textContent = tooltips[i];
            tip.style.transition = 'opacity 0.3s';
            tip.style.opacity = '1';
            setTimeout(() => { tip.style.opacity = '0'; }, 3000);
          }
        });
      }
    });
  })();

  // ══════════════════════════════════════════
  // CARD 1: STORAGE TYPE SELECTOR
  // ══════════════════════════════════════════
  (function initStorage() {
    const storeData = {
      smes: { shape:'circle', cx:100, cy:30, r:22, stroke:'#a78bfa', inner:'M85,30 Q85,15 100,15 Q115,15 115,30', label:'E = ½LI²' },
      air:  { shape:'rect', x:70, y:10, w:60, h:40, rx:6, stroke:'#60a5fa', inner:'M80,30 L90,20 L100,30 L110,20 L120,30', label:'W = ∫PdV' },
      flywheel: { shape:'circle', cx:100, cy:30, r:22, stroke:'#facc15', inner:'M85,30 A15,15 0 1,1 115,30', label:'E = ½Iω²' },
      ups: { shape:'rect', x:75, y:10, w:50, h:40, rx:4, stroke:'#00ff88', inner:'M85,18 L85,42 M90,22 L90,38 M95,18 L95,42 M100,22 L100,38 M105,18 L105,42', label:'V·I·t' }
    };

    document.querySelectorAll('.pp-storage-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pp-storage-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.store;
        const d = storeData[type];
        if (!d) return;

        const shape = document.getElementById('store-shape');
        const inner = document.getElementById('store-inner');
        const label = document.getElementById('store-label');

        if (d.shape === 'circle') {
          shape.setAttribute('cx', d.cx); shape.setAttribute('cy', d.cy);
          shape.setAttribute('r', d.r);
          shape.removeAttribute('x'); shape.removeAttribute('y');
          shape.removeAttribute('width'); shape.removeAttribute('height');
          shape.removeAttribute('rx');
          // SVG circle doesn't have x/y so we replaceWith
          const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
          c.setAttribute('cx',d.cx); c.setAttribute('cy',d.cy); c.setAttribute('r',d.r);
          c.setAttribute('fill','none'); c.setAttribute('stroke',d.stroke); c.setAttribute('stroke-width','2');
          c.id = 'store-shape';
          shape.replaceWith(c);
        } else {
          const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
          r.setAttribute('x',d.x); r.setAttribute('y',d.y);
          r.setAttribute('width',d.w); r.setAttribute('height',d.h);
          r.setAttribute('rx',d.rx); r.setAttribute('fill','none');
          r.setAttribute('stroke',d.stroke); r.setAttribute('stroke-width','2');
          r.id = 'store-shape';
          shape.replaceWith(r);
        }
        inner.setAttribute('d', d.inner);
        inner.setAttribute('stroke', d.stroke);
        label.setAttribute('fill', d.stroke);
        label.textContent = d.label;
      });
    });
  })();

  // ══════════════════════════════════════════
  // CARD 2: GEN-ITEM HOVER FORMULA
  // ══════════════════════════════════════════
  (function initGenHover() {
    const hoverEl = document.getElementById('gen-hover-formula');
    document.querySelectorAll('.pp-gen-item[data-formula]').forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (hoverEl) {
          hoverEl.textContent = item.dataset.formula;
          hoverEl.style.opacity = '1';
        }
      });
      item.addEventListener('mouseleave', () => {
        if (hoverEl) hoverEl.style.opacity = '0';
      });
    });
  })();

  // ══════════════════════════════════════════
  // CARD 2: WIND POWER CALCULATOR
  // ══════════════════════════════════════════
  (function initWindCalc() {
    const vSlider = document.getElementById('wind-v');
    const dSlider = document.getElementById('wind-d');
    const vVal = document.getElementById('wind-v-val');
    const dVal = document.getElementById('wind-d-val');
    const result = document.getElementById('wind-result');
    if (!vSlider || !dSlider) return;

    function calc() {
      const v = parseFloat(vSlider.value);
      const d = parseFloat(dSlider.value);
      vVal.textContent = v;
      dVal.textContent = d;
      const rho = 1.225;
      const A = Math.PI * (d/2) * (d/2);
      const Cp = 0.4; // typical Cp
      const P = 0.5 * rho * A * Math.pow(v, 3) * Cp / 1000; // kW
      result.innerHTML = `P = <strong>${P.toFixed(1)}</strong> kW &nbsp;(Cp=0.4, ρ=1.225)`;
    }
    vSlider.addEventListener('input', calc);
    dSlider.addEventListener('input', calc);
    calc();
  })();

  // ══════════════════════════════════════════
  // CARD 2: HYDRO POWER CALCULATOR
  // ══════════════════════════════════════════
  (function initHydroCalc() {
    const qS = document.getElementById('hydro-q');
    const hS = document.getElementById('hydro-h');
    const eS = document.getElementById('hydro-e');
    if (!qS || !hS || !eS) return;

    function calc() {
      document.getElementById('hydro-q-val').textContent = qS.value;
      document.getElementById('hydro-h-val').textContent = hS.value;
      document.getElementById('hydro-e-val').textContent = eS.value;
      const Q = parseFloat(qS.value), H = parseFloat(hS.value), eta = parseFloat(eS.value)/100;
      const P = (1000 * 9.81 * Q * H * eta) / 1e6; // MW
      document.getElementById('hydro-result').innerHTML = `P = <strong>${P.toFixed(2)}</strong> MW`;
    }
    qS.addEventListener('input', calc);
    hS.addEventListener('input', calc);
    eS.addEventListener('input', calc);
    calc();
  })();

  // ══════════════════════════════════════════
  // CARD 2: SOLAR POWER CALCULATOR
  // ══════════════════════════════════════════
  (function initSolarCalc() {
    const gS = document.getElementById('solar-g');
    const aS = document.getElementById('solar-a');
    const eS = document.getElementById('solar-e');
    if (!gS || !aS || !eS) return;

    function calc() {
      document.getElementById('solar-g-val').textContent = gS.value;
      document.getElementById('solar-a-val').textContent = aS.value;
      document.getElementById('solar-e-val').textContent = eS.value;
      const G = parseFloat(gS.value), A = parseFloat(aS.value), eta = parseFloat(eS.value)/100;
      const P = (G * A * eta) / 1000; // kW
      document.getElementById('solar-result').innerHTML = `P = <strong>${P.toFixed(2)}</strong> kW`;
    }
    gS.addEventListener('input', calc);
    aS.addEventListener('input', calc);
    eS.addEventListener('input', calc);
    calc();
  })();

  // ══════════════════════════════════════════
  // CARD 3: BAR CHART OBSERVERS (SECTOR TOO)
  // ══════════════════════════════════════════
  const ppSectorChart = document.getElementById('ppSectorChart');
  if (ppSectorChart) {
    const sectorObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.pp-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
          });
          sectorObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    sectorObs.observe(ppSectorChart);
  }

  // ══════════════════════════════════════════
  // CARD 3: GREEN POWER CALCULATOR
  // ══════════════════════════════════════════
  (function initGreenCalc() {
    const btn = document.getElementById('btn-green-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const thermal = parseFloat(document.getElementById('mix-thermal').value) || 0;
      const hydro = parseFloat(document.getElementById('mix-hydro').value) || 0;
      const nuclear = parseFloat(document.getElementById('mix-nuclear').value) || 0;
      const renew = parseFloat(document.getElementById('mix-renew').value) || 0;
      const total = thermal + hydro + nuclear + renew;
      if (total === 0) return;
      const greenPct = ((hydro + renew) / total * 100).toFixed(1);
      // CO₂: ~0.9 kg/kWh for thermal, others ~0
      const co2Saved = ((100 - thermal) / 100 * 0.9).toFixed(2);
      const res = document.getElementById('green-calc-result');
      res.style.display = 'block';
      res.innerHTML = `🟢 Green share: <strong>${greenPct}%</strong> &nbsp;|&nbsp; CO₂ offset: <strong>${co2Saved} kg/kWh</strong> vs 100% thermal`;
    });
  })();

  // ══════════════════════════════════════════
  // CARD 4: 24-HOUR LOAD CURVE (Chart.js)
  // ══════════════════════════════════════════
  (function initLoadCurve() {
    const canvas = document.getElementById('loadCurveChart');
    if (!canvas) return;

    // Typical 24-hour load data (MW)
    const loadData = [40,35,32,30,32,38,55,70,85,90,88,82,78,80,75,72,80,92,95,88,75,60,50,42];
    const labels = Array.from({length:24}, (_,i) => i + ':00');
    const peak = Math.max(...loadData);
    const avg = loadData.reduce((a,b) => a+b, 0) / loadData.length;
    const lf = (avg / peak * 100).toFixed(1);
    const units = (avg * 24).toFixed(0);

    // Update stats
    const setPeakEl = document.getElementById('lc-peak');
    const setAvgEl = document.getElementById('lc-avg');
    const setLfEl = document.getElementById('lc-lf');
    const setUnitsEl = document.getElementById('lc-units');
    if (setPeakEl) setPeakEl.textContent = peak;
    if (setAvgEl) setAvgEl.textContent = avg.toFixed(1);
    if (setLfEl) setLfEl.textContent = lf + '%';
    if (setUnitsEl) setUnitsEl.textContent = units;

    // Load Chart.js from CDN if not already loaded
    function buildChart() {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Load (MW)',
            data: loadData,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#f97316',
            pointBorderColor: '#f97316',
            borderWidth: 2
          }, {
            label: 'Average',
            data: Array(24).fill(avg),
            borderColor: '#00f5ff',
            borderDash: [5,5],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 10 } } }
          },
          scales: {
            x: {
              ticks: { color: '#5a8aaa', font: { size: 9 }, maxRotation: 45 },
              grid: { color: 'rgba(26,58,85,0.3)' }
            },
            y: {
              ticks: { color: '#5a8aaa', font: { size: 10 } },
              grid: { color: 'rgba(26,58,85,0.3)' },
              title: { display: true, text: 'MW', color: '#5a8aaa', font: { size: 10 } }
            }
          }
        }
      });
    }

    if (typeof Chart !== 'undefined') {
      buildChart();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = buildChart;
      document.head.appendChild(script);
    }
  })();

  // ══════════════════════════════════════════
  // CARD 4: PERFORMANCE CALCULATOR
  // ══════════════════════════════════════════
  (function initPerfCalc() {
    const btn = document.getElementById('btn-perf-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const CL = parseFloat(document.getElementById('perf-cl').value) || 0;
      const MD = parseFloat(document.getElementById('perf-md').value) || 0;
      const AL = parseFloat(document.getElementById('perf-al').value) || 0;
      const PC = parseFloat(document.getElementById('perf-pc').value) || 0;
      const hrs = parseFloat(document.getElementById('perf-hrs').value) || 0;
      const sumMD = parseFloat(document.getElementById('perf-sum').value) || 0;

      if (CL === 0 || MD === 0 || PC === 0) return;

      const DF = (MD / CL).toFixed(4);
      const LF = (AL / MD).toFixed(4);
      const DivF = (sumMD / MD).toFixed(4);
      const kWh = AL * 8760;
      const PCF = (kWh / (PC * 8760)).toFixed(4);
      const PUF = hrs > 0 ? (kWh / (PC * hrs)).toFixed(4) : '—';
      const reserve = PC - MD;
      const units = kWh.toFixed(0);

      const res = document.getElementById('perf-result');
      res.style.display = 'block';
      res.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div style="background:rgba(249,115,22,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#f97316; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${DF}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Demand Factor</div>
          </div>
          <div style="background:rgba(0,255,136,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#00ff88; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${LF}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Load Factor</div>
          </div>
          <div style="background:rgba(167,139,250,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#a78bfa; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${DivF}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Diversity Factor</div>
          </div>
          <div style="background:rgba(250,204,21,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#facc15; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${PCF}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Plant Capacity Factor</div>
          </div>
          <div style="background:rgba(0,245,255,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#00f5ff; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${PUF}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Plant Use Factor</div>
          </div>
          <div style="background:rgba(251,113,133,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#fb7185; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${reserve} kW</div>
            <div style="color:var(--pp-muted); font-size:10px;">Reserve Capacity</div>
          </div>
        </div>
        <div style="text-align:center; margin-top:8px; font-size:12px; color:var(--pp-text);">
          Units/annum: <strong style="color:#f97316;">${Number(units).toLocaleString()} kWh</strong>
        </div>
      `;
    });
  })();

  // ══════════════════════════════════════════
  // CARD 4: TARIFF CALCULATOR
  // ══════════════════════════════════════════
  (function initTariffCalc() {
    let tariffType = 'simple';

    // Tariff type switcher
    document.querySelectorAll('.pp-tariff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pp-tariff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tariffType = btn.dataset.tariff;
        const cWrap = document.getElementById('tariff-c-wrap');
        if (cWrap) cWrap.style.display = tariffType === 'three' ? '' : 'none';
      });
    });
    // Hide 'c' field initially
    const cWrap = document.getElementById('tariff-c-wrap');
    if (cWrap) cWrap.style.display = 'none';

    const calcBtn = document.getElementById('btn-tariff-calc');
    if (!calcBtn) return;
    calcBtn.addEventListener('click', () => {
      const MD = parseFloat(document.getElementById('tariff-md').value) || 0;
      const kWh = parseFloat(document.getElementById('tariff-kwh').value) || 0;
      const a = parseFloat(document.getElementById('tariff-a').value) || 0;
      const b = parseFloat(document.getElementById('tariff-b').value) || 0;
      const c = parseFloat(document.getElementById('tariff-c').value) || 0;

      let bill = 0, formula = '';
      if (tariffType === 'simple') {
        bill = b * kWh;
        formula = `₹${b}/kWh × ${kWh.toLocaleString()} kWh`;
      } else if (tariffType === 'two') {
        bill = a * MD + b * kWh;
        formula = `₹${a}×${MD} + ₹${b}×${kWh.toLocaleString()}`;
      } else {
        bill = a * MD + b * kWh + c;
        formula = `₹${a}×${MD} + ₹${b}×${kWh.toLocaleString()} + ₹${c.toLocaleString()}`;
      }

      const res = document.getElementById('tariff-result');
      res.style.display = 'block';
      res.innerHTML = `💰 Bill = <strong>₹${bill.toLocaleString()}</strong><br><span style="font-size:11px; color:var(--pp-muted);">${formula}</span>`;
    });
  })();

  // ══════════════════════════════════════════
  // CARD 5: GREEN GAUGE ANIMATION
  // ══════════════════════════════════════════
  (function initGauge() {
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugePct = document.getElementById('gauge-pct');
    const targetProgress = document.getElementById('target-progress');
    const targetPctEl = document.getElementById('target-pct');
    if (!gaugeFill) return;

    const renewablePct = 25.6; // ~(hydro 12.3 + renewable 23.8 minus overlap, or simplified)
    // Arc dasharray = 220, so dashoffset = 220 * (1 - pct/100)
    const offset = 220 * (1 - renewablePct / 100);

    const c5 = document.getElementById('c5');
    if (!c5) return;

    const gaugeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate gauge
          setTimeout(() => {
            gaugeFill.style.transition = 'stroke-dashoffset 1.5s ease';
            gaugeFill.setAttribute('stroke-dashoffset', offset);
          }, 300);

          // Animate target progress bar (372/500 = 74.4%)
          if (targetProgress) {
            setTimeout(() => { targetProgress.style.width = '74.4%'; }, 500);
          }
          if (targetPctEl) {
            let count = 0;
            const interval = setInterval(() => {
              count += 1;
              if (count >= 74) { clearInterval(interval); count = 74; }
              targetPctEl.textContent = count;
            }, 20);
          }

          gaugeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    gaugeObs.observe(c5);
  })();

  // ══════════════════════════════════════════════════════
  // MODULE 1 PART 2 — HYDRO POWER PLANT JAVASCRIPT
  // ══════════════════════════════════════════════════════

  // ──────── CARD 4: Component Hover Info ────────
  (function initHydroElemHover() {
    const infoEl = document.getElementById('hydro-elem-info');
    document.querySelectorAll('.pp-hydro-elem[data-info]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (infoEl) { infoEl.textContent = el.dataset.info; infoEl.style.opacity = '1'; }
      });
      el.addEventListener('mouseleave', () => {
        if (infoEl) infoEl.style.opacity = '0';
      });
    });
  })();

  // ──────── CARD 4: Water Flow Particles ────────
  (function initWaterParticles() {
    const g = document.getElementById('hydro-water-particles');
    if (!g) return;
    function spawnParticle() {
      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('r','2');
      c.setAttribute('fill','#06b6d4');
      c.setAttribute('opacity','0.7');
      // Start at reservoir area
      const startX = 180 + Math.random()*40;
      const startY = 100 + Math.random()*20;
      c.setAttribute('cx', startX);
      c.setAttribute('cy', startY);
      g.appendChild(c);
      // Animate along penstock to turbine
      const dur = 2000 + Math.random()*1000;
      const start = performance.now();
      function animate(now) {
        const t = Math.min((now - start) / dur, 1);
        const x = startX + (530 - startX) * t;
        const y = startY + (250 - startY) * t;
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('opacity', String(0.7 * (1 - t*0.5)));
        if (t < 1) requestAnimationFrame(animate);
        else c.remove();
      }
      requestAnimationFrame(animate);
    }
    // Observe card visibility
    const c6 = document.getElementById('c6');
    if (!c6) return;
    let waterInterval;
    const waterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !waterInterval) {
          waterInterval = setInterval(spawnParticle, 300);
        } else if (!entry.isIntersecting && waterInterval) {
          clearInterval(waterInterval);
          waterInterval = null;
        }
      });
    }, { threshold: 0.1 });
    waterObs.observe(c6);
  })();

  // ──────── CARD 4: Energy Conversion Bars Animation ────────
  (function initEnergyBars() {
    const c6 = document.getElementById('c6');
    if (!c6) return;
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const pe = document.getElementById('pe-bar');
            const ke = document.getElementById('ke-bar');
            const me = document.getElementById('me-bar');
            const ee = document.getElementById('ee-bar');
            if (pe) pe.style.height = '70px';
            setTimeout(() => { if (ke) ke.style.height = '58px'; }, 400);
            setTimeout(() => { if (me) me.style.height = '48px'; }, 800);
            setTimeout(() => { if (ee) ee.style.height = '40px'; }, 1200);
          }, 500);
          barObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    barObs.observe(c6);
  })();

  // ──────── CARD 4: Hydro Power Calculator ────────
  (function initHydroPowerCalc() {
    const qS = document.getElementById('hp-q');
    const hS = document.getElementById('hp-h');
    const eS = document.getElementById('hp-e');
    if (!qS || !hS || !eS) return;

    let unit = 'kw';
    const kwBtn = document.getElementById('hp-unit-kw');
    const hpBtn = document.getElementById('hp-unit-hp');

    function calc() {
      document.getElementById('hp-q-val').textContent = qS.value;
      document.getElementById('hp-h-val').textContent = hS.value;
      document.getElementById('hp-e-val').textContent = eS.value;
      const W = 1000, Q = parseFloat(qS.value), H = parseFloat(hS.value), eta = parseFloat(eS.value)/100;
      const PkW = 9.81e-3 * W * Q * H * eta;
      const PHP = W * Q * H * eta / 75;
      const res = document.getElementById('hp-result');
      if (unit === 'kw') {
        res.innerHTML = `P = <strong>${PkW.toFixed(1)}</strong> kW &nbsp;<span style="color:var(--pp-muted); font-size:11px;">(${(PkW/1000).toFixed(2)} MW)</span>`;
      } else {
        res.innerHTML = `P = <strong>${PHP.toFixed(1)}</strong> HP &nbsp;<span style="color:var(--pp-muted); font-size:11px;">(${(PHP*0.746/1000).toFixed(2)} MW)</span>`;
      }
    }

    [qS, hS, eS].forEach(s => s.addEventListener('input', calc));

    if (kwBtn) kwBtn.addEventListener('click', () => {
      unit = 'kw'; kwBtn.classList.add('active'); hpBtn.classList.remove('active'); calc();
    });
    if (hpBtn) hpBtn.addEventListener('click', () => {
      unit = 'hp'; hpBtn.classList.add('active'); kwBtn.classList.remove('active'); calc();
    });
    calc();
  })();

  // ──────── CARD 5: Plant Type Tabs ────────
  (function initPlantTabs() {
    const scenes = { runoff:'scene-runoff', pondage:'scene-pondage', reservoir:'scene-reservoir' };
    document.querySelectorAll('.pp-plant-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pp-plant-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.values(scenes).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        const target = document.getElementById(scenes[btn.dataset.plant]);
        if (target) target.style.display = 'block';
      });
    });
  })();

  // ──────── CARD 5: Head Classification Slider ────────
  (function initHeadClassifier() {
    const slider = document.getElementById('head-class-slider');
    if (!slider) return;

    function update() {
      const H = parseFloat(slider.value);
      document.getElementById('head-class-val').textContent = H;

      const low = document.getElementById('head-bar-low');
      const med = document.getElementById('head-bar-med');
      const high = document.getElementById('head-bar-high');
      const res = document.getElementById('head-class-result');

      low.style.opacity = '0.3'; med.style.opacity = '0.3'; high.style.opacity = '0.3';

      if (H < 30) {
        low.style.opacity = '1';
        res.innerHTML = '<span style="color:#60a5fa;">LOW Head</span> → Francis / Propeller / Kaplan turbine';
        res.style.background = 'rgba(96,165,250,0.08)';
      } else if (H <= 300) {
        med.style.opacity = '1';
        res.innerHTML = '<span style="color:#00f5ff;">MEDIUM Head</span> → Francis / Propeller / Kaplan turbine';
        res.style.background = 'rgba(0,245,255,0.08)';
      } else {
        high.style.opacity = '1';
        res.innerHTML = '<span style="color:#facc15;">HIGH Head</span> → Pelton Wheel (impulse) + Surge tank needed';
        res.style.background = 'rgba(250,204,21,0.08)';
      }
    }
    slider.addEventListener('input', update);
    update();
  })();

  // ──────── CARD 5: Water Hammer Calculator ────────
  (function initWaterHammer() {
    const btn = document.getElementById('btn-wh-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const rho = parseFloat(document.getElementById('wh-rho').value) || 1000;
      const a = parseFloat(document.getElementById('wh-a').value) || 1400;
      const dv = parseFloat(document.getElementById('wh-dv').value) || 3;
      const dP = rho * a * dv;
      const dPbar = (dP / 1e5).toFixed(2);

      const res = document.getElementById('wh-result');
      res.style.display = 'block';
      document.getElementById('wh-result-text').innerHTML = `ΔP = <strong>${dP.toLocaleString()} Pa</strong> = <strong>${dPbar} bar</strong>`;

      // Animate bars
      const noSurge = document.getElementById('wh-no-surge');
      const surge = document.getElementById('wh-surge');
      noSurge.style.width = '0%'; surge.style.width = '0%';
      setTimeout(() => { noSurge.style.width = '95%'; }, 100);
      setTimeout(() => { surge.style.width = '25%'; }, 300);
    });
  })();

  // ──────── CARD 6: Load Duration Curve ────────
  (function initLoadDuration() {
    const canvas = document.getElementById('loadDurationChart');
    if (!canvas) return;

    const loadData = [40,35,32,30,32,38,55,70,85,90,88,82,78,80,75,72,80,92,95,88,75,60,50,42];
    const labels = Array.from({length:24}, (_,i) => i+':00');
    const peak = Math.max(...loadData);
    const baseLevel = 40;
    const intermediateLevel = 70;

    function buildChart() {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Base Load Zone',
              data: Array(24).fill(baseLevel),
              backgroundColor: 'rgba(96,165,250,0.15)',
              borderColor: 'rgba(96,165,250,0.4)',
              borderWidth: 1,
              borderDash: [4,4],
              fill: 'origin',
              pointRadius: 0,
              order: 0
            },
            {
              label: 'Intermediate Zone',
              data: Array(24).fill(intermediateLevel),
              backgroundColor: 'rgba(250,204,21,0.1)',
              borderColor: 'rgba(250,204,21,0.4)',
              borderWidth: 1,
              borderDash: [4,4],
              fill: '-1',
              pointRadius: 0,
              order: 1
            },
            {
              label: 'Peak Zone',
              data: Array(24).fill(peak),
              backgroundColor: 'rgba(251,113,133,0.08)',
              borderColor: 'rgba(251,113,133,0.3)',
              borderWidth: 1,
              borderDash: [4,4],
              fill: '-1',
              pointRadius: 0,
              order: 2
            },
            {
              label: 'Load (MW)',
              data: loadData,
              borderColor: '#60a5fa',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              tension: 0.4,
              pointRadius: 2,
              pointBackgroundColor: '#60a5fa',
              fill: false,
              order: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 9 } } }
          },
          scales: {
            x: { ticks: { color: '#5a8aaa', font: { size: 8 }, maxRotation: 45 }, grid: { color: 'rgba(26,58,85,0.3)' } },
            y: { ticks: { color: '#5a8aaa', font: { size: 9 } }, grid: { color: 'rgba(26,58,85,0.3)' }, title: { display: true, text: 'MW', color: '#5a8aaa', font: { size: 10 } } }
          }
        }
      });
    }

    if (typeof Chart !== 'undefined') buildChart();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = buildChart;
      document.head.appendChild(s);
    }
  })();

  // ──────── CARD 6: Pumped Storage Toggle ────────
  (function initPumpedStorage() {
    const offBtn = document.getElementById('pump-offpeak');
    const peakBtn = document.getElementById('pump-peak');
    if (!offBtn || !peakBtn) return;

    const arrow = document.getElementById('pump-arrow');
    const modeText = document.getElementById('pump-mode-text');
    const upper = document.getElementById('pump-upper-water');
    const lower = document.getElementById('pump-lower-water');
    const label = document.getElementById('pump-label');

    function setMode(mode) {
      document.querySelectorAll('.pp-pump-btn').forEach(b => b.classList.remove('active'));
      if (mode === 'offpeak') {
        offBtn.classList.add('active');
        arrow.setAttribute('points', '180,55 190,45 200,55');
        arrow.setAttribute('fill', '#60a5fa');
        modeText.textContent = '⚡ CHARGING — Pumping water UP';
        modeText.setAttribute('fill', '#60a5fa');
        if (upper) { upper.setAttribute('height', '25'); upper.style.transition = 'height 0.5s'; }
        if (lower) { lower.setAttribute('height', '15'); lower.style.transition = 'height 0.5s'; }
        if (label) { label.textContent = 'PUMP'; label.setAttribute('fill', '#60a5fa'); }
      } else {
        peakBtn.classList.add('active');
        arrow.setAttribute('points', '180,85 190,95 200,85');
        arrow.setAttribute('fill', '#00ff88');
        modeText.textContent = '⚡ DISCHARGING — Generating power';
        modeText.setAttribute('fill', '#00ff88');
        if (upper) { upper.setAttribute('height', '15'); }
        if (lower) { lower.setAttribute('height', '25'); }
        if (label) { label.textContent = 'TURB'; label.setAttribute('fill', '#00ff88'); }
      }
    }

    offBtn.addEventListener('click', () => setMode('offpeak'));
    peakBtn.addEventListener('click', () => setMode('peak'));
  })();

  // ──────── CARD 6: Load Factor Calculator ────────
  (function initLFCalc() {
    const btn = document.getElementById('btn-lf-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const avg = parseFloat(document.getElementById('lf-avg').value) || 0;
      const max = parseFloat(document.getElementById('lf-max').value) || 1;
      const lf = avg / max;
      const res = document.getElementById('lf-result');
      res.style.display = 'block';
      if (lf > 0.8) {
        res.style.background = 'rgba(96,165,250,0.08)';
        res.style.color = '#60a5fa';
        res.innerHTML = `LF = <strong>${lf.toFixed(4)}</strong> → <span style="color:#00ff88;">Base Load Plant ✓</span> (LF &gt; 0.8)`;
      } else if (lf < 0.3) {
        res.style.background = 'rgba(251,113,133,0.08)';
        res.style.color = '#fb7185';
        res.innerHTML = `LF = <strong>${lf.toFixed(4)}</strong> → <span style="color:#fb7185;">Peak Load Plant ✓</span> (LF &lt; 0.3)`;
      } else {
        res.style.background = 'rgba(250,204,21,0.08)';
        res.style.color = '#facc15';
        res.innerHTML = `LF = <strong>${lf.toFixed(4)}</strong> → <span style="color:#facc15;">Intermediate Load</span> (0.3 &lt; LF &lt; 0.8)`;
      }
    });
  })();

  // ──────── CARD 6: Pumped Storage Efficiency ────────
  (function initPSCalc() {
    const btn = document.getElementById('btn-ps-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const ep = parseFloat(document.getElementById('ps-pump').value) / 100 || 0;
      const et = parseFloat(document.getElementById('ps-turb').value) / 100 || 0;
      const er = ep * et;
      const res = document.getElementById('ps-result');
      res.style.display = 'block';
      res.innerHTML = `η_round = ${(ep*100).toFixed(0)}% × ${(et*100).toFixed(0)}% = <strong>${(er*100).toFixed(1)}%</strong>`;
    });
  })();

  // ──────── CARD 7: Turbine Tabs ────────
  (function initTurbineTabs() {
    const scenes = { pelton:'turb-pelton', francis:'turb-francis', kaplan:'turb-kaplan' };
    document.querySelectorAll('.pp-turbine-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pp-turbine-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.values(scenes).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        const target = document.getElementById(scenes[btn.dataset.turb]);
        if (target) target.style.display = 'block';
      });
    });
  })();

  // ──────── CARD 7: Specific Speed Calculator ────────
  (function initNsCalc() {
    const btn = document.getElementById('btn-ns-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const N = parseFloat(document.getElementById('ns-n').value) || 0;
      const P = parseFloat(document.getElementById('ns-p').value) || 0;
      const H = parseFloat(document.getElementById('ns-h').value) || 1;
      const Ns = N * Math.sqrt(P) / Math.pow(H, 5/4);
      const res = document.getElementById('ns-result');
      res.style.display = 'block';
      let type, color;
      if (Ns <= 50) { type = 'Pelton Wheel (Impulse)'; color = '#facc15'; }
      else if (Ns <= 300) { type = 'Francis Turbine (Reaction)'; color = '#00f5ff'; }
      else { type = 'Kaplan Turbine (Reaction)'; color = '#60a5fa'; }
      res.style.background = `rgba(${color === '#facc15'?'250,204,21':color === '#00f5ff'?'0,245,255':'96,165,250'},0.08)`;
      res.style.color = color;
      res.innerHTML = `Ns = <strong>${Ns.toFixed(1)}</strong> → <span style="font-weight:bold;">${type}</span>`;
    });
  })();

  // ──────── CARD 7: Pelton Efficiency Curve ────────
  (function initPeltonCurve() {
    const canvas = document.getElementById('peltonEtaChart');
    if (!canvas) return;

    const beta = 165 * Math.PI / 180; // typical deflection angle
    const points = [];
    for (let r = 0; r <= 1; r += 0.02) {
      const eta = 2 * r * (1 - r) * (1 + Math.cos(Math.PI - beta));
      points.push({ x: r, y: eta * 100 });
    }

    function buildChart() {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: points.map(p => p.x.toFixed(2)),
          datasets: [{
            label: 'η_hyd (%)',
            data: points.map(p => p.y),
            borderColor: '#facc15',
            backgroundColor: 'rgba(250,204,21,0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 9 } } },
            annotation: undefined
          },
          scales: {
            x: {
              title: { display: true, text: 'u / vⱼ', color: '#facc15', font: { size: 10 } },
              ticks: { color: '#5a8aaa', font: { size: 8 }, maxTicksLimit: 11 },
              grid: { color: 'rgba(26,58,85,0.3)' }
            },
            y: {
              title: { display: true, text: 'η (%)', color: '#facc15', font: { size: 10 } },
              ticks: { color: '#5a8aaa', font: { size: 9 } },
              grid: { color: 'rgba(26,58,85,0.3)' },
              max: 100
            }
          }
        }
      });
    }

    if (typeof Chart !== 'undefined') buildChart();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = buildChart;
      document.head.appendChild(s);
    }
  })();

  // ──────── CARD 8: Master Hydro Calculator ────────
  (function initMasterCalc() {
    const btn = document.getElementById('btn-master-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const Q = parseFloat(document.getElementById('master-q').value) || 0;
      const H = parseFloat(document.getElementById('master-h').value) || 0;
      const eta = parseFloat(document.getElementById('master-eta').value) / 100 || 0;
      const N = parseFloat(document.getElementById('master-n').value) || 0;
      const W = 1000;

      const PkW = 9.81e-3 * W * Q * H * eta;
      const PHP = W * Q * H * eta / 75;
      const PkW_net = PkW;
      const Ns = N > 0 && H > 0 ? N * Math.sqrt(PHP) / Math.pow(H, 5/4) : 0;

      let turbine, tColor;
      if (H < 30) { turbine = 'Kaplan'; tColor = '#60a5fa'; }
      else if (H <= 300) { turbine = 'Francis'; tColor = '#00f5ff'; }
      else { turbine = 'Pelton'; tColor = '#facc15'; }

      let headClass;
      if (H < 30) headClass = '<span style="color:#60a5fa;">LOW</span>';
      else if (H <= 300) headClass = '<span style="color:#00f5ff;">MEDIUM</span>';
      else headClass = '<span style="color:#facc15;">HIGH</span>';

      const res = document.getElementById('master-result');
      res.style.display = 'block';
      res.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
          <div style="background:rgba(96,165,250,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#60a5fa; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${PkW.toFixed(1)}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Power (kW)</div>
          </div>
          <div style="background:rgba(249,115,22,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#f97316; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${PHP.toFixed(1)}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Power (HP)</div>
          </div>
          <div style="background:rgba(0,255,136,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#00ff88; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${(PkW/1000).toFixed(2)}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Power (MW)</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
          <div style="background:rgba(250,204,21,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="font-size:12px; color:var(--pp-text);">Head: ${headClass}</div>
            <div style="color:${tColor}; font-family:'Orbitron',monospace; font-size:14px; font-weight:bold; margin-top:2px;">${turbine}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Recommended Turbine</div>
          </div>
          <div style="background:rgba(167,139,250,0.08); padding:8px; border-radius:6px; text-align:center;">
            <div style="color:#a78bfa; font-family:'Orbitron',monospace; font-size:16px; font-weight:bold;">${Ns.toFixed(1)}</div>
            <div style="color:var(--pp-muted); font-size:10px;">Specific Speed (Ns)</div>
          </div>
        </div>
      `;
    });
  })();

  // ──────── CARD 8: Plant Type Quiz ────────
  (function initHydroQuiz() {
    const questions = [
      { q: 'River has no pondage, seasonal flow. What type of plant?', opts: ['Run-off without pondage','Run-off with pondage','Reservoir plant'], ans: 0 },
      { q: 'Need to supply peak load demand. Which plant type?', opts: ['Run-off (no pondage)','Pondage / Reservoir plant','Neither'], ans: 1 },
      { q: 'H = 500 m. Which turbine?', opts: ['Kaplan','Francis','Pelton'], ans: 2 },
      { q: 'H = 20 m, large discharge. Which turbine?', opts: ['Pelton','Francis','Kaplan'], ans: 2 },
      { q: 'Base load plant has load factor:', opts: ['LF > 0.8','LF < 0.3','LF = 0.5'], ans: 0 },
      { q: 'What does a surge tank reduce?', opts: ['Voltage drop','Water hammer pressure','Turbine speed'], ans: 1 },
      { q: 'Ns = 150. Which turbine type?', opts: ['Pelton','Francis','Kaplan'], ans: 1 },
      { q: 'During off-peak, pumped storage plant operates as:', opts: ['Generator','Motor (pump)','Neither'], ans: 1 },
    ];
    let qIdx = -1;
    const qEl = document.getElementById('quiz-q');
    const optEl = document.getElementById('quiz-options');
    const fbEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('btn-quiz-next');
    if (!nextBtn || !qEl) return;

    function showQuestion() {
      qIdx = (qIdx + 1) % questions.length;
      const q = questions[qIdx];
      qEl.textContent = q.q;
      fbEl.textContent = '';
      optEl.innerHTML = '';
      q.opts.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'pp-quiz-opt';
        b.textContent = opt;
        b.addEventListener('click', () => {
          optEl.querySelectorAll('.pp-quiz-opt').forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
          });
          if (i === q.ans) {
            b.classList.add('correct');
            fbEl.style.color = '#00ff88';
            fbEl.textContent = '✅ Correct!';
          } else {
            b.classList.add('wrong');
            optEl.children[q.ans].classList.add('correct');
            fbEl.style.color = '#ef4444';
            fbEl.textContent = '❌ Wrong — see correct answer highlighted';
          }
        });
        optEl.appendChild(b);
      });
    }

    nextBtn.addEventListener('click', showQuestion);
    showQuestion();
  })();

  // ══════════════════════════════════════════
  // MODULE 1 PART 3 — CARDS 9–13 INTERACTIVITY
  // ══════════════════════════════════════════

  // ──────── CARD 9: η vs Load Chart ────────
  (function initEtaVsLoad() {
    function buildChart() {
      const ctx = document.getElementById('eta-vs-load-chart');
      if (!ctx) return;
      const loads = [];
      for (let l = 0; l <= 120; l += 5) loads.push(l);

      function peltonEta(l) { if (l < 10) return 0; return 90 * Math.exp(-0.5 * Math.pow((l - 80) / 40, 2)); }
      function francisEta(l) { if (l < 10) return 0; return 92 * Math.exp(-0.5 * Math.pow((l - 100) / 35, 2)); }
      function kaplanEta(l) { if (l < 10) return 0; const peak = 90; return peak - 0.002 * Math.pow(l - 70, 2); }
      function propellerEta(l) { if (l < 10) return 0; return 92 * Math.exp(-0.5 * Math.pow((l - 100) / 18, 2)); }

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: loads.map(l => l + '%'),
          datasets: [
            { label: 'Pelton', data: loads.map(peltonEta), borderColor: '#facc15', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0 },
            { label: 'Francis', data: loads.map(francisEta), borderColor: '#00f5ff', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0 },
            { label: 'Kaplan', data: loads.map(l => Math.max(0, kaplanEta(l))), borderColor: '#60a5fa', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0 },
            { label: 'Propeller', data: loads.map(propellerEta), borderColor: '#a78bfa', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { ticks: { color: '#5a8aaa', font: { size: 8 }, maxTicksLimit: 13 }, grid: { color: 'rgba(26,58,85,0.3)' }, title: { display: true, text: '% Load', color: '#5a8aaa', font: { size: 9 } } },
            y: { min: 0, max: 100, ticks: { color: '#5a8aaa', font: { size: 9 } }, grid: { color: 'rgba(26,58,85,0.3)' }, title: { display: true, text: 'η (%)', color: '#5a8aaa', font: { size: 9 } } }
          }
        }
      });
    }
    if (typeof Chart !== 'undefined') buildChart();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = buildChart;
      document.head.appendChild(s);
    }
  })();

  // ──────── CARD 9: Head Range Selector ────────
  (function initHeadRange() {
    const slider = document.getElementById('head-range-slider');
    const valEl = document.getElementById('head-range-val');
    const resultEl = document.getElementById('head-range-result');
    if (!slider || !valEl || !resultEl) return;

    function update() {
      const h = parseFloat(slider.value);
      valEl.textContent = h + ' m';
      if (h < 30) {
        resultEl.textContent = 'Kaplan Turbine — Ns: 300–900 — Low Head';
        resultEl.style.background = 'rgba(96,165,250,0.1)';
        resultEl.style.borderColor = 'rgba(96,165,250,0.3)';
        resultEl.style.color = '#60a5fa';
      } else if (h <= 300) {
        resultEl.textContent = 'Francis Turbine — Ns: 50–300 — Medium Head';
        resultEl.style.background = 'rgba(0,245,255,0.1)';
        resultEl.style.borderColor = 'rgba(0,245,255,0.3)';
        resultEl.style.color = '#00f5ff';
      } else {
        resultEl.textContent = 'Pelton Wheel — Ns: 10–50 — High Head';
        resultEl.style.background = 'rgba(250,204,21,0.1)';
        resultEl.style.borderColor = 'rgba(250,204,21,0.3)';
        resultEl.style.color = '#facc15';
      }
    }
    slider.addEventListener('input', update);
    update();
  })();

  // ──────── CARD 10: Site Radar Chart ────────
  (function initSiteRadar() {
    let radarChart = null;
    function buildRadar() {
      const ctx = document.getElementById('site-radar-chart');
      if (!ctx) return;
      const ids = ['radar-water','radar-head','radar-transport','radar-land','radar-catchment'];
      const labels = ['Water','Head','Transport','Land','Catchment'];

      function getData() { return ids.map(id => { const el = document.getElementById(id); return el ? parseFloat(el.value) : 50; }); }

      radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [{ label: 'Site Score', data: getData(), backgroundColor: 'rgba(96,165,250,0.2)', borderColor: '#60a5fa', borderWidth: 2, pointBackgroundColor: '#60a5fa', pointRadius: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: { min: 0, max: 100, ticks: { stepSize: 20, color: '#5a8aaa', backdropColor: 'transparent', font: { size: 8 } }, grid: { color: 'rgba(26,58,85,0.4)' }, pointLabels: { color: '#60a5fa', font: { size: 10 } } }
          }
        }
      });

      function updateRadar() {
        const data = getData();
        radarChart.data.datasets[0].data = data;
        radarChart.update();
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const scoreEl = document.getElementById('radar-score');
        if (scoreEl) {
          scoreEl.textContent = 'Site Score: ' + avg.toFixed(0) + '% — ' + (avg >= 70 ? 'Good' : avg >= 50 ? 'Moderate' : 'Poor');
          scoreEl.style.color = avg >= 70 ? '#00ff88' : avg >= 50 ? '#facc15' : '#ef4444';
        }
      }

      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateRadar);
      });
    }
    if (typeof Chart !== 'undefined') buildRadar();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = buildRadar;
      document.head.appendChild(s);
    }
  })();

  // ──────── CARD 10: Balance Scale & Life Bars ────────
  (function initBalanceAndLife() {
    const meritsSide = document.getElementById('merits-side');
    const demeritsSide = document.getElementById('demerits-side');
    if (!meritsSide || !demeritsSide) return;

    const merits = ['No fuel','Reliable','Fast sync','Quick load change','Accurate governing','No standby loss','Robust','η ≠ f(age)','Clean','Irrigation'];
    const demerits = ['Large area','Low firm capacity','High cost','Long TL','Dry season'];

    merits.forEach((m, i) => {
      const d = document.createElement('div');
      d.className = 'pp-balance-item merit';
      d.textContent = m;
      d.style.animationDelay = (i * 0.1) + 's';
      meritsSide.appendChild(d);
    });
    demerits.forEach((m, i) => {
      const d = document.createElement('div');
      d.className = 'pp-balance-item demerit';
      d.textContent = m;
      d.style.animationDelay = (i * 0.15) + 's';
      demeritsSide.appendChild(d);
    });

    // Animate life bars on intersection
    const lifeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.pp-life-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
          });
          lifeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    const zone12 = document.getElementById('anim-zone-12');
    if (zone12) lifeObserver.observe(zone12);
  })();

  // ──────── CARD 11: Hf Calculator ────────
  (function initHfCalc() {
    const btn = document.getElementById('btn-hf-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const f = parseFloat(document.getElementById('hf-f').value);
      const L = parseFloat(document.getElementById('hf-L').value);
      const V = parseFloat(document.getElementById('hf-V').value);
      const D = parseFloat(document.getElementById('hf-D').value);
      const Hg = parseFloat(document.getElementById('hf-Hg').value);
      const g = 9.81;

      if (D <= 0) { alert('Diameter must be > 0'); return; }

      const Hf_darcy = (f * L * V * V) / (2 * g * D);
      const f_fanning = f / 4;
      const Hf_fanning = (4 * f_fanning * L * V * V) / (2 * g * D);
      const Hnet = Hg - Hf_darcy;

      const res = document.getElementById('hf-result');
      res.style.display = 'block';
      res.innerHTML =
        '<div style="color:#ef4444;">H<sub>f</sub> (Darcy) = ' + Hf_darcy.toFixed(3) + ' m</div>' +
        '<div style="color:#00f5ff;">H<sub>f</sub> (Fanning) = ' + Hf_fanning.toFixed(3) + ' m</div>' +
        '<div style="color:#00ff88; margin-top:6px; font-size:14px;">H<sub>net</sub> = ' + Hg + ' − ' + Hf_darcy.toFixed(3) + ' = <strong>' + Hnet.toFixed(3) + ' m</strong></div>' +
        '<div style="color:#94a3b8; font-size:10px; margin-top:4px;">f<sub>Darcy</sub> = ' + f + ' → f<sub>Fanning</sub> = ' + f_fanning.toFixed(4) + ' (same H<sub>f</sub>)</div>';

      // Update friction display
      const darcyEl = document.getElementById('friction-darcy');
      const fanningEl = document.getElementById('friction-fanning');
      if (darcyEl) darcyEl.textContent = f.toFixed(4);
      if (fanningEl) fanningEl.textContent = f_fanning.toFixed(4);
    });
  })();

  // ──────── CARD 11: Ns Calculator ────────
  (function initNsCalc() {
    const btn = document.getElementById('btn-ns-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const N = parseFloat(document.getElementById('ns-N').value);
      const P = parseFloat(document.getElementById('ns-P').value);
      const H = parseFloat(document.getElementById('ns-H').value);

      if (H <= 0 || P <= 0) { alert('H and P must be > 0'); return; }

      const Ns = N * Math.sqrt(P) / Math.pow(H, 5 / 4);
      let turbine, color;
      if (Ns <= 50) { turbine = 'Pelton Wheel'; color = '#facc15'; }
      else if (Ns <= 300) { turbine = 'Francis Turbine'; color = '#00f5ff'; }
      else { turbine = 'Kaplan Turbine'; color = '#60a5fa'; }

      const res = document.getElementById('ns-result');
      res.style.display = 'block';
      res.style.background = color.replace('#', 'rgba(') ? 'rgba(' + parseInt(color.slice(1, 3), 16) + ',' + parseInt(color.slice(3, 5), 16) + ',' + parseInt(color.slice(5, 7), 16) + ',0.08)' : '';
      res.style.border = '1px solid ' + color;
      res.style.color = color;
      res.innerHTML = 'N<sub>s</sub> = ' + Ns.toFixed(2) + ' → <strong>' + turbine + '</strong>';
    });
  })();

  // ──────── CARD 12: Rankine Efficiency Calc ────────
  (function initRankineCalc() {
    const btn = document.getElementById('btn-rankine-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const h1 = parseFloat(document.getElementById('rk-h1').value);
      const h2 = parseFloat(document.getElementById('rk-h2').value);
      const h3 = parseFloat(document.getElementById('rk-h3').value);
      const h4 = parseFloat(document.getElementById('rk-h4').value);

      const Wt = h1 - h2;
      const Wp = h4 - h3;
      const Qb = h1 - h4;

      if (Qb === 0) { alert('h1 must ≠ h4'); return; }

      const eta = ((Wt - Wp) / Qb) * 100;
      const heatRate = 3600 / (eta / 100);

      const res = document.getElementById('rankine-result');
      res.style.display = 'block';
      res.innerHTML =
        '<div>W<sub>turbine</sub> = h₁ − h₂ = ' + Wt.toFixed(1) + ' kJ/kg</div>' +
        '<div>W<sub>pump</sub> = h₄ − h₃ = ' + Wp.toFixed(1) + ' kJ/kg</div>' +
        '<div>Q<sub>boiler</sub> = h₁ − h₄ = ' + Qb.toFixed(1) + ' kJ/kg</div>' +
        '<div style="color:#facc15; font-size:14px; margin-top:6px;">η<sub>Rankine</sub> = <strong>' + eta.toFixed(2) + '%</strong></div>' +
        '<div style="color:#ef4444; margin-top:4px;">Heat Rate = ' + heatRate.toFixed(0) + ' kJ/kWh</div>';
    });
  })();

  // ──────── CARD 12: Overall Thermal Efficiency ────────
  (function initThermalEta() {
    const btn = document.getElementById('btn-thermal-eta');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const nb = parseFloat(document.getElementById('th-boiler').value) / 100;
      const nt = parseFloat(document.getElementById('th-turbine').value) / 100;
      const ng = parseFloat(document.getElementById('th-gen').value) / 100;

      const overall = nb * nt * ng * 100;
      const heatRate = 3600 / (overall / 100);

      const res = document.getElementById('thermal-eta-result');
      res.style.display = 'block';
      res.innerHTML =
        '<div>η<sub>overall</sub> = ' + (nb * 100).toFixed(1) + '% × ' + (nt * 100).toFixed(1) + '% × ' + (ng * 100).toFixed(1) + '%</div>' +
        '<div style="color:#facc15; font-size:14px; margin-top:6px;">η<sub>overall</sub> = <strong>' + overall.toFixed(2) + '%</strong></div>' +
        '<div style="color:#ef4444; margin-top:4px;">Heat Rate = ' + heatRate.toFixed(0) + ' kJ/kWh</div>';
    });
  })();

  // ──────── CARD 13: Master Turbine Selector ────────
  (function initTurbSelector() {
    const btn = document.getElementById('btn-turb-sel');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const H = parseFloat(document.getElementById('turb-sel-H').value);
      const N = parseFloat(document.getElementById('turb-sel-N').value);
      const P = parseFloat(document.getElementById('turb-sel-P').value);
      if (H <= 0) { alert('H must be > 0'); return; }

      let turbByHead, headColor;
      if (H < 30) { turbByHead = 'Kaplan'; headColor = '#60a5fa'; }
      else if (H <= 300) { turbByHead = 'Francis'; headColor = '#00f5ff'; }
      else { turbByHead = 'Pelton'; headColor = '#facc15'; }

      let turbByNs = '', nsColor = '', Ns = 0;
      if (P > 0 && N > 0) {
        Ns = N * Math.sqrt(P) / Math.pow(H, 5 / 4);
        if (Ns <= 50) { turbByNs = 'Pelton'; nsColor = '#facc15'; }
        else if (Ns <= 300) { turbByNs = 'Francis'; nsColor = '#00f5ff'; }
        else { turbByNs = 'Kaplan'; nsColor = '#60a5fa'; }
      }

      const match = turbByHead === turbByNs;
      const res = document.getElementById('turb-sel-result');
      res.style.display = 'block';
      res.style.background = match ? 'rgba(0,255,136,0.08)' : 'rgba(250,204,21,0.08)';
      res.style.border = '1px solid ' + (match ? '#00ff88' : '#facc15');
      res.innerHTML =
        '<div style="color:' + headColor + ';">By Head (' + H + ' m): <strong>' + turbByHead + '</strong></div>' +
        (Ns > 0 ? '<div style="color:' + nsColor + ';">By Ns (' + Ns.toFixed(1) + '): <strong>' + turbByNs + '</strong></div>' : '') +
        '<div style="margin-top:6px; color:' + (match ? '#00ff88' : '#facc15') + ';">' + (match ? '✅ Both methods agree!' : '⚠️ Mismatch — verify parameters') + '</div>';
    });
  })();

  // ──────── CARD 13: Complete Hydro Power Calc ────────
  (function initHydroPowerCalc() {
    const btn = document.getElementById('btn-hp-calc');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const Q = parseFloat(document.getElementById('hp-Q').value);
      const Hg = parseFloat(document.getElementById('hp-Hg').value);
      const eta = parseFloat(document.getElementById('hp-eta').value) / 100;
      const f = parseFloat(document.getElementById('hp-f').value);
      const L = parseFloat(document.getElementById('hp-L').value);
      const D = parseFloat(document.getElementById('hp-D').value);
      const g = 9.81;
      const rho = 1000;

      if (D <= 0) { alert('D must be > 0'); return; }

      const A = Math.PI * D * D / 4;
      const V = Q / A;
      const Hf = (f * L * V * V) / (2 * g * D);
      const Hnet = Hg - Hf;
      const P_watts = rho * g * Q * Hnet * eta;
      const P_kW = P_watts / 1000;
      const P_HP = P_watts / 745.7;

      const res = document.getElementById('hp-result');
      res.style.display = 'block';
      res.innerHTML =
        '<div>V = Q/A = ' + V.toFixed(2) + ' m/s</div>' +
        '<div style="color:#ef4444;">H<sub>f</sub> = ' + Hf.toFixed(3) + ' m</div>' +
        '<div style="color:#00ff88;">H<sub>net</sub> = ' + Hnet.toFixed(3) + ' m</div>' +
        '<div style="color:#60a5fa; font-size:14px; margin-top:6px;">P = <strong>' + P_kW.toFixed(2) + ' kW</strong></div>' +
        '<div style="color:#facc15; font-size:14px;">P = <strong>' + P_HP.toFixed(2) + ' HP</strong></div>';
    });
  })();

  // Observe new cards for animation
  document.querySelectorAll('#c11,#c12,#c13,#c14,#c15').forEach(c => ppObserver.observe(c));

  // ═══════════════════════════════════════════════════════
  // MODULE 2 — THERMAL (STEAM) POWER PLANT JAVASCRIPT
  // ═══════════════════════════════════════════════════════

  // ─── Card 16: Rankine Cycle Calculator ───
  function calcRankineC16() {
    var h1 = parseFloat(document.getElementById('c16h1').value) || 0;
    var h2 = parseFloat(document.getElementById('c16h2').value) || 0;
    var h3 = parseFloat(document.getElementById('c16h3').value) || 0;
    var h4 = parseFloat(document.getElementById('c16h4').value) || 0;
    var Wt = h1 - h2;
    var Wp = h4 - h3;
    var Wnet = Wt - Wp;
    var Qin = h1 - h4;
    var eta = Qin > 0 ? (Wnet / Qin) * 100 : 0;
    var HR = eta > 0 ? 3600 / (eta / 100) : Infinity;
    var out = document.getElementById('c16RankineOut');
    out.innerHTML =
      '<div>W<sub>T</sub> = ' + Wt.toFixed(1) + ' kJ/kg &nbsp;|&nbsp; W<sub>P</sub> = ' + Wp.toFixed(1) + ' kJ/kg</div>' +
      '<div>W<sub>net</sub> = ' + Wnet.toFixed(1) + ' kJ/kg &nbsp;|&nbsp; Q<sub>in</sub> = ' + Qin.toFixed(1) + ' kJ/kg</div>' +
      '<div style="font-size:14px;margin-top:4px;color:#00f5ff;">η<sub>Rankine</sub> = <strong>' + eta.toFixed(2) + '%</strong></div>' +
      '<div style="color:#f97316;">Heat Rate = ' + HR.toFixed(0) + ' kJ/kWh</div>';
  }

  // ─── Card 17: Circuit Tab Switcher ───
  function switchCircuitC17(btn, circuit) {
    var tabs = btn.parentElement.querySelectorAll('.pp-circuit-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    var scenes = ['overview', 'coal', 'air', 'steam', 'cooling'];
    scenes.forEach(function(s) {
      var el = document.getElementById('c17-' + s);
      if (el) el.style.display = (s === circuit) ? 'block' : 'none';
    });
  }

  // ─── Card 18: Boiler Type Toggle ───
  function toggleBoilerC18(btn, type) {
    var btns = btn.parentElement.querySelectorAll('.pp-boiler-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var info = document.getElementById('c18BoilerInfo');
    if (type === 'fire') {
      info.innerHTML = '<strong style="color:#f97316">Fire-Tube:</strong> Hot gases flow inside tubes, water surrounds them in shell. Simple, low pressure (≤25 bar). E.g. Lancashire, Cochran, Locomotive boilers.';
    } else {
      info.innerHTML = '<strong style="color:#60a5fa">Water-Tube:</strong> Water flows inside tubes, hot gases outside. High pressure (up to 200+ bar), large capacity (up to 2000 T/hr). E.g. Babcock-Wilcox, Benson, La Mont boilers.';
    }
  }

  // ─── Card 18: Component Expand/Collapse ───
  function toggleCompC18(el) {
    el.classList.toggle('expanded');
  }

  // ─── Card 19: Circuit Calculator Switcher ───
  function switchCalcC19(btn, calc) {
    var tabs = btn.parentElement.querySelectorAll('.pp-circuit-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    var scenes = ['coal', 'draught', 'steam', 'cooling'];
    scenes.forEach(function(s) {
      var el = document.getElementById('c19-' + s);
      if (el) el.style.display = (s === calc) ? 'block' : 'none';
    });
  }

  // ─── Card 19: Coal Consumption Calculator ───
  function calcCoalC19() {
    var P = parseFloat(document.getElementById('c19coalP').value) || 0;
    var eta = parseFloat(document.getElementById('c19coalEta').value) || 0;
    var CV = parseFloat(document.getElementById('c19coalCV').value) || 0;
    var coalRate = (eta > 0 && CV > 0) ? (P * 3600) / ((eta / 100) * CV) : 0;
    var coalPerDay = coalRate * 24;
    var out = document.getElementById('c19coalOut');
    out.innerHTML =
      '<div>Coal Rate = <strong>' + coalRate.toFixed(2) + ' tonnes/hr</strong></div>' +
      '<div style="color:#f97316;">Daily consumption = ' + coalPerDay.toFixed(0) + ' tonnes/day</div>' +
      '<div style="color:#facc15;">Annual (8000 hrs) ≈ ' + (coalRate * 8000).toFixed(0) + ' tonnes/year</div>';
  }

  // ─── Card 19: Natural Draught Calculator ───
  function calcDraughtC19() {
    var H = parseFloat(document.getElementById('c19drH').value) || 0;
    var Ta = parseFloat(document.getElementById('c19drTa').value) || 0;
    var Tg = parseFloat(document.getElementById('c19drTg').value) || 0;
    var hw = (Ta > 0 && Tg > 0) ? 353 * H * (1 / Ta - 1 / Tg) : 0;
    var out = document.getElementById('c19draughtOut');
    out.innerHTML =
      '<div>h<sub>w</sub> = 353 × ' + H + ' × (1/' + Ta + ' − 1/' + Tg + ')</div>' +
      '<div style="font-size:14px;margin-top:4px;color:#00f5ff;">h<sub>w</sub> = <strong>' + hw.toFixed(2) + ' mm of water</strong></div>' +
      '<div style="color:#f97316;">Draught = ' + (hw * 9.81).toFixed(2) + ' Pa</div>';
  }

  // ─── Card 19: Steam Rate Calculator ───
  function calcSteamRateC19() {
    var h1 = parseFloat(document.getElementById('c19stH1').value) || 0;
    var h2 = parseFloat(document.getElementById('c19stH2').value) || 0;
    var h3 = parseFloat(document.getElementById('c19stH3').value) || 0;
    var h4 = parseFloat(document.getElementById('c19stH4').value) || 0;
    var Wnet = (h1 - h2) - (h4 - h3);
    var SR = Wnet > 0 ? 3600 / Wnet : 0;
    var out = document.getElementById('c19steamOut');
    out.innerHTML =
      '<div>W<sub>net</sub> = (' + h1 + '−' + h2 + ') − (' + h4 + '−' + h3 + ') = ' + Wnet.toFixed(1) + ' kJ/kg</div>' +
      '<div style="font-size:14px;margin-top:4px;color:#facc15;">Steam Rate = <strong>' + SR.toFixed(3) + ' kg/kWh</strong></div>';
  }

  // ─── Card 19: Cooling Water Flow Calculator ───
  function calcCWFlowC19() {
    var Q = parseFloat(document.getElementById('c19cwQ').value) || 0;
    var dT = parseFloat(document.getElementById('c19cwDT').value) || 0;
    var Cp = parseFloat(document.getElementById('c19cwCp').value) || 4.18;
    var Qkw = Q * 1000; // MW to kW
    var flow = (dT > 0 && Cp > 0) ? (Qkw) / (Cp * dT) : 0; // kg/s
    var flowM3hr = flow * 3.6; // m3/hr (water density ≈ 1 kg/L)
    var out = document.getElementById('c19cwOut');
    out.innerHTML =
      '<div>Q<sub>cond</sub> = ' + Q + ' MW = ' + Qkw.toFixed(0) + ' kW</div>' +
      '<div style="font-size:14px;margin-top:4px;color:#60a5fa;">Flow = <strong>' + flow.toFixed(1) + ' kg/s</strong></div>' +
      '<div style="color:#06b6d4;">= ' + flowM3hr.toFixed(0) + ' m³/hr</div>';
  }

  // ─── Card 20: Efficiency Comparison Calculator ───
  function calcEffC20() {
    var Th = parseFloat(document.getElementById('c20Th').value) + 273.15;
    var Tl = parseFloat(document.getElementById('c20Tl').value) + 273.15;
    var eB = parseFloat(document.getElementById('c20etaB').value) / 100;
    var eT = parseFloat(document.getElementById('c20etaT').value) / 100;
    var eG = parseFloat(document.getElementById('c20etaG').value) / 100;
    var eA = parseFloat(document.getElementById('c20etaA').value) / 100;

    var etaCarnot = Th > 0 ? (1 - Tl / Th) * 100 : 0;
    var etaOverall = eB * eT * eG * eA * 100;
    var HR = etaOverall > 0 ? 3600 / (etaOverall / 100) : 0;
    var condLoss = 100 - etaOverall - 8 - 6; // approximate breakdown
    if (condLoss < 0) condLoss = 0;

    // Update Sankey bars
    var sankeyOut = document.getElementById('c20sankeyOut');
    var sankeyCondenser = document.getElementById('c20sankeyCondenser');
    var sankeyFlue = document.getElementById('c20sankeyFlue');
    var sankeyOther = document.getElementById('c20sankeyOther');
    if (sankeyOut) { sankeyOut.style.width = etaOverall + '%'; }
    if (sankeyCondenser) { sankeyCondenser.style.width = condLoss + '%'; }
    document.getElementById('c20sankeyOutVal').textContent = etaOverall.toFixed(1) + '%';
    document.getElementById('c20sankeyCondenserVal').textContent = condLoss.toFixed(1) + '%';

    var out = document.getElementById('c20EffOut');
    out.innerHTML =
      '<div style="color:#facc15;">η<sub>Carnot</sub> = ' + etaCarnot.toFixed(2) + '% <span style="font-size:10px;color:var(--pp-muted);">(theoretical max)</span></div>' +
      '<div style="color:#f97316;">η<sub>Overall</sub> = ' + etaOverall.toFixed(2) + '% <span style="font-size:10px;color:var(--pp-muted);">(' + eB.toFixed(2) + '×' + eT.toFixed(2) + '×' + eG.toFixed(2) + '×' + eA.toFixed(2) + ')</span></div>' +
      '<div style="color:#00f5ff;">Heat Rate = ' + HR.toFixed(0) + ' kJ/kWh</div>' +
      '<div style="color:#60a5fa;">Condenser Loss ≈ ' + condLoss.toFixed(1) + '% of input</div>';
  }

  // ─── Card 20: Heat Rate vs Efficiency Chart ───
  (function initHRChartC20() {
    function buildChart() {
      var canvas = document.getElementById('c20HRChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var etas = [];
      var hrs = [];
      for (var e = 25; e <= 50; e += 1) {
        etas.push(e);
        hrs.push(3600 / (e / 100));
      }
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: etas.map(function(v) { return v + '%'; }),
          datasets: [{
            label: 'Heat Rate (kJ/kWh)',
            data: hrs,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e5e7eb', font: { family: 'Share Tech Mono', size: 10 } } }
          },
          scales: {
            x: {
              title: { display: true, text: 'Overall Efficiency (%)', color: '#9ca3af', font: { family: 'Share Tech Mono', size: 10 } },
              ticks: { color: '#6b7280', font: { size: 9 } },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
              title: { display: true, text: 'Heat Rate (kJ/kWh)', color: '#9ca3af', font: { family: 'Share Tech Mono', size: 10 } },
              ticks: { color: '#6b7280', font: { size: 9 } },
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          }
        }
      });
    }
    if (typeof Chart !== 'undefined') { buildChart(); }
    else {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = buildChart;
      document.head.appendChild(s);
    }
  })();

  // ─── Card 21: Master Thermal Plant Calculator ───
  function calcMasterC21() {
    var P = parseFloat(document.getElementById('c21P').value) || 0;
    var CV = parseFloat(document.getElementById('c21CV').value) || 0;
    var ash = parseFloat(document.getElementById('c21ash').value) || 0;
    var eB = parseFloat(document.getElementById('c21eB').value) / 100;
    var eT = parseFloat(document.getElementById('c21eT').value) / 100;
    var eG = parseFloat(document.getElementById('c21eG').value) / 100;
    var eA = parseFloat(document.getElementById('c21eA').value) / 100;
    var Th = parseFloat(document.getElementById('c21Th').value) + 273.15;
    var Tl = parseFloat(document.getElementById('c21Tl').value) + 273.15;

    var etaOverall = eB * eT * eG * eA;
    var HR = etaOverall > 0 ? 3600 / etaOverall : 0;
    var coalRate = (etaOverall > 0 && CV > 0) ? (P * 3600) / (etaOverall * CV) : 0;
    var ashRate = coalRate * (ash / 100);
    var etaCarnot = Th > 0 ? (1 - Tl / Th) * 100 : 0;
    var condLoss = P * (1 / etaOverall - 1) * 0.65; // ~65% of total losses to condenser

    // Update summary grid
    document.getElementById('c21sumEta').textContent = (etaOverall * 100).toFixed(2) + '%';
    document.getElementById('c21sumHR').textContent = HR.toFixed(0) + ' kJ/kWh';
    document.getElementById('c21sumCoal').textContent = coalRate.toFixed(1) + ' t/hr';
    document.getElementById('c21sumCarnot').textContent = etaCarnot.toFixed(1) + '%';

    var out = document.getElementById('c21MasterOut');
    out.innerHTML =
      '<div style="border-bottom:1px solid rgba(239,68,68,0.2);padding-bottom:4px;margin-bottom:4px;">' +
        '<span style="color:#ef4444;">η<sub>overall</sub> = ' + (etaOverall * 100).toFixed(2) + '%</span> &nbsp;|&nbsp; ' +
        '<span style="color:#facc15;">η<sub>Carnot</sub> = ' + etaCarnot.toFixed(2) + '%</span> &nbsp;|&nbsp; ' +
        '<span style="color:#00f5ff;">Carnot Ratio = ' + (etaOverall > 0 && etaCarnot > 0 ? (etaOverall * 100 / etaCarnot * 100 / 100).toFixed(1) : '—') + '%</span>' +
      '</div>' +
      '<div>Heat Rate = <strong>' + HR.toFixed(0) + ' kJ/kWh</strong></div>' +
      '<div style="color:#f97316;">Coal Rate = ' + coalRate.toFixed(2) + ' tonnes/hr (' + (coalRate * 24).toFixed(0) + ' t/day)</div>' +
      '<div style="color:#6b7280;">Ash Produced = ' + ashRate.toFixed(2) + ' tonnes/hr (' + (ashRate * 24).toFixed(0) + ' t/day)</div>' +
      '<div style="color:#60a5fa;">Condenser Heat Rejection ≈ ' + condLoss.toFixed(0) + ' MW</div>' +
      '<div style="color:#9ca3af;">Annual Coal (8000 hrs) ≈ ' + (coalRate * 8000 / 1000).toFixed(1) + ' kilo-tonnes</div>';
  }

  // Observe Module 2 cards for animation
  document.querySelectorAll('#c16,#c17,#c18,#c19,#c20,#c21').forEach(c => ppObserver.observe(c));

  // ═══════════════════════════════════════════════════════════
  // MODULE 3 — COAL CLASSIFICATION & NUCLEAR POWER PLANT JS
  // ═══════════════════════════════════════════════════════════

  // ─── Card 22: Cooling Source Selector ───
  function switchCoolC22(btn, src) {
    var tabs = btn.parentElement.querySelectorAll('.pp-circuit-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    var info = document.getElementById('c22CoolInfo');
    var data = {
      river: '<strong style="color:#60a5fa">River:</strong> Once-through cooling. Water drawn from river, passed through screens, used in condenser, returned at higher T. Cheapest but limited by river flow &amp; thermal pollution limits.',
      canal: '<strong style="color:#06b6d4">Canal:</strong> Similar to river but from man-made canal system. May have limited flow capacity. Requires intake screens &amp; silt removal. Common in inland plants.',
      sea: '<strong style="color:#60a5fa">Sea:</strong> Unlimited supply. Best for coastal plants. Requires corrosion-resistant materials (CuNi tubes). Screens needed to remove marine life. Highest cooling capacity.',
      tower: '<strong style="color:#e5e7eb">Cooling Tower:</strong> Recirculating system. Warm water sprayed inside tower, evaporative cooling. Natural draught (hyperbolic) or mechanical draught. Uses 2-3% make-up water.'
    };
    info.innerHTML = data[src] || data.river;
  }

  // ─── Card 22: Q Cooling Calculator ───
  function calcCoolC22() {
    var mw = parseFloat(document.getElementById('c22mw').value) || 0;
    var tout = parseFloat(document.getElementById('c22tout').value) || 0;
    var tin = parseFloat(document.getElementById('c22tin').value) || 0;
    var cp = 4.18;
    var Q = mw * cp * (tout - tin);
    var QMW = Q / 1000;
    var out = document.getElementById('c22CoolOut');
    out.innerHTML =
      '<div>Q = ' + mw + ' × ' + cp + ' × (' + tout + ' − ' + tin + ') = ' + Q.toFixed(1) + ' kW</div>' +
      '<div style="font-size:14px;color:#60a5fa;margin-top:4px;">Q<sub>cooling</sub> = <strong>' + QMW.toFixed(2) + ' MW</strong></div>';
  }

  // ─── Card 23: Animate Coal Bars on Scroll ───
  (function initCoalBarsC23() {
    var animated = false;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          var bars = document.querySelectorAll('#c23CoalBars .pp-coal-bar-fill');
          bars.forEach(function(bar) {
            var target = bar.getAttribute('data-target');
            setTimeout(function() { bar.style.width = target + '%'; }, 200);
          });
        }
      });
    }, { threshold: 0.3 });
    var el = document.getElementById('c23CoalBars');
    if (el) observer.observe(el);
  })();

  // ─── Card 23: Coal Grade Identifier ───
  function identifyCoalC23() {
    var cv = parseFloat(document.getElementById('c23cv').value) || 0;
    var mass = parseFloat(document.getElementById('c23mass').value) || 0;
    var grade, color;
    if (cv <= 5000) { grade = 'Peat'; color = '#78350f'; }
    else if (cv <= 17600) { grade = 'Lignite'; color = '#92400e'; }
    else if (cv <= 23000) { grade = 'Sub-bituminous'; color = '#57534e'; }
    else if (cv <= 34000) { grade = 'Bituminous'; color = '#facc15'; }
    else if (cv <= 35000) { grade = 'Semi-bituminous'; color = '#1c1917'; }
    else { grade = 'Semi-anthracite / Super anthracite'; color = '#e5e7eb'; }
    var heat = cv * mass;
    var heatMJ = heat / 1000;
    var out = document.getElementById('c23CoalOut');
    out.innerHTML =
      '<div style="color:' + color + ';font-size:14px;">Grade: <strong>' + grade + '</strong></div>' +
      '<div>Heat released = ' + cv + ' × ' + mass + ' = ' + heat.toFixed(0) + ' kJ</div>' +
      '<div style="color:#f97316;">= ' + heatMJ.toFixed(1) + ' MJ = ' + (heatMJ / 3600).toFixed(4) + ' MWh</div>' +
      (grade === 'Bituminous' ? '<div style="color:#facc15;margin-top:4px;">🇮🇳 Most commonly used in India (Gondwana coal fields)</div>' : '');
  }

  // ─── Card 24: E = mc² Calculator ───
  function calcEmc2C24() {
    var m = parseFloat(document.getElementById('c24mass').value) || 0;
    var c = 3e8;
    var E = m * c * c;
    var EMJ = E / 1e6;
    var coalEquiv = E / (25e6); // avg coal CV 25 MJ/kg
    var out = document.getElementById('c24Emc2Out');
    out.innerHTML =
      '<div>E = ' + m + ' × (3×10⁸)² = <strong>' + E.toExponential(3) + ' J</strong></div>' +
      '<div style="color:#a78bfa;font-size:14px;margin-top:4px;">= ' + EMJ.toExponential(3) + ' MJ</div>' +
      '<div style="color:#f97316;">≡ ' + coalEquiv.toExponential(3) + ' kg coal (at 25 MJ/kg)</div>' +
      '<div style="color:#facc15;">= ' + (coalEquiv / 1000).toExponential(2) + ' tonnes of coal!</div>';
  }

  // ─── Card 25: keff Slider ───
  function updateKeffC25() {
    var k = parseFloat(document.getElementById('c25keffSlider').value);
    var display = document.getElementById('c25keffDisplay');
    var status = document.getElementById('c25keffStatus');
    display.innerHTML = 'k<sub>eff</sub> = ' + k.toFixed(2);
    if (k < 0.98) {
      display.style.color = '#60a5fa';
      status.style.color = '#60a5fa';
      status.style.borderColor = '#60a5fa';
      status.style.background = 'rgba(96,165,250,0.1)';
      status.textContent = '● SUB-CRITICAL — Reaction dying out';
    } else if (k <= 1.02) {
      display.style.color = '#00ff88';
      status.style.color = '#00ff88';
      status.style.borderColor = '#00ff88';
      status.style.background = 'rgba(0,255,136,0.1)';
      status.textContent = '● CRITICAL — Sustained chain reaction (steady state)';
    } else {
      display.style.color = '#ef4444';
      status.style.color = '#ef4444';
      status.style.borderColor = '#ef4444';
      status.style.background = 'rgba(239,68,68,0.1)';
      status.textContent = '⚠ SUPER-CRITICAL — Runaway reaction! SCRAM!';
    }
  }

  // ─── Card 25: Radiation Shielding Calculator ───
  function calcShieldC25() {
    var I0 = parseFloat(document.getElementById('c25I0').value) || 0;
    var mu = parseFloat(document.getElementById('c25mu').value) || 0;
    var x = parseFloat(document.getElementById('c25x').value) || 0;
    var I = I0 * Math.exp(-mu * x);
    var attenuation = I0 > 0 ? ((1 - I / I0) * 100) : 0;
    var x99 = mu > 0 ? (Math.log(100) / mu) : 0;
    var out = document.getElementById('c25ShieldOut');
    out.innerHTML =
      '<div>I = ' + I0 + ' × e^(-' + mu + ' × ' + x + ') = <strong>' + I.toFixed(4) + '</strong></div>' +
      '<div style="color:#a78bfa;font-size:14px;margin-top:4px;">Attenuation = ' + attenuation.toFixed(2) + '%</div>' +
      '<div style="color:#f97316;">Thickness for 99% attenuation = ' + x99.toFixed(2) + ' cm</div>';
  }

  // ─── Card 26: Loop Toggle ───
  function switchLoopC26(btn, loop) {
    var tabs = btn.parentElement.querySelectorAll('.pp-circuit-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    var pri = document.getElementById('c26primary');
    var sec = document.getElementById('c26secondary');
    if (pri && sec) {
      pri.style.opacity = (loop === 'secondary') ? '0.15' : '1';
      sec.style.opacity = (loop === 'primary') ? '0.15' : '1';
    }
  }

  // ─── Card 26: Reactor Type Selector ───
  function switchReactorC26(btn, type) {
    var tabs = btn.parentElement.querySelectorAll('.pp-reactor-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    var info = document.getElementById('c26ReactorInfo');
    var data = {
      pwr: '<strong style="color:#a78bfa">PWR (Pressurised Water Reactor):</strong> Coolant is light water under high pressure (~155 bar) — stays liquid at ~320°C. Two-loop design. Most common reactor type worldwide. Uses enriched uranium fuel.',
      bwr: '<strong style="color:#00f5ff">BWR (Boiling Water Reactor):</strong> Water boils directly in the reactor vessel. Steam goes directly to turbine — no separate heat exchanger needed. Simpler design but radioactive steam reaches turbine. Used in Tarapur (India).',
      phwr: '<strong style="color:#facc15">PHWR/CANDU:</strong> Uses heavy water (D₂O) as both coolant and moderator. Can use natural uranium (no enrichment needed). India\'s primary reactor type. Horizontal pressure tube design. E.g., Rawatbhata, Kaiga, Kakrapar.',
      fbr: '<strong style="color:#ef4444">LMFBR (Fast Breeder Reactor):</strong> Uses liquid sodium coolant (no moderator — fast neutrons). Breeds more fissile material (Pu-239) than it consumes. India\'s Prototype FBR at Kalpakkam. Part of India\'s 3-stage nuclear programme.'
    };
    info.innerHTML = data[type] || data.pwr;
  }

  // ─── Card 26: Reactor Heat Output Calculator ───
  function calcReactorHeatC26() {
    var mc = parseFloat(document.getElementById('c26mc').value) || 0;
    var cp = parseFloat(document.getElementById('c26cp').value) || 0;
    var tin = parseFloat(document.getElementById('c26tin').value) || 0;
    var tout = parseFloat(document.getElementById('c26tout').value) || 0;
    var Q = mc * cp * (tout - tin);
    var QMW = Q / 1000;
    var out = document.getElementById('c26HeatOut');
    out.innerHTML =
      '<div>Q = ' + mc + ' × ' + cp + ' × (' + tout + ' − ' + tin + ')</div>' +
      '<div style="font-size:14px;color:#a78bfa;margin-top:4px;">Q = <strong>' + Q.toFixed(1) + ' kW = ' + QMW.toFixed(2) + ' MW</strong></div>' +
      '<div style="color:#facc15;">At η=33%: Electrical output ≈ ' + (QMW * 0.33).toFixed(1) + ' MW</div>';
  }

  // ─── Card 27: Nuclear vs Coal Fuel Calculator ───
  function calcNucVsCoalC27() {
    var P = parseFloat(document.getElementById('c27plantMW').value) || 0;
    var etaCoal = 0.36;
    var cvCoal = 25000; // kJ/kg avg
    var coalRateTPH = (P * 3600) / (etaCoal * cvCoal);
    var coalPerDay = coalRateTPH * 24;
    // uranium: ~1kg U-235 = 82 TJ, burn-up ~45 GWd/t
    var uPerDay = (P * 24) / (45000); // tonnes/day (rough)
    var uKgDay = uPerDay * 1000;
    var co2Coal = coalPerDay * 2.3; // ~2.3 tonnes CO2 per tonne coal
    var out = document.getElementById('c27CompOut');
    out.innerHTML =
      '<div style="border-bottom:1px solid rgba(167,139,250,0.2);padding-bottom:4px;margin-bottom:4px;">' +
        '<span style="color:#f97316;">⛏️ Coal:</span> ' + coalRateTPH.toFixed(1) + ' t/hr = <strong>' + coalPerDay.toFixed(0) + ' tonnes/day</strong>' +
      '</div>' +
      '<div style="border-bottom:1px solid rgba(167,139,250,0.2);padding-bottom:4px;margin-bottom:4px;">' +
        '<span style="color:#a78bfa;">☢️ Uranium:</span> ~<strong>' + uKgDay.toFixed(2) + ' kg/day</strong> (at 45 GWd/t burn-up)' +
      '</div>' +
      '<div style="color:#ef4444;">Coal CO₂ emission: ~' + co2Coal.toFixed(0) + ' tonnes CO₂/day</div>' +
      '<div style="color:#00ff88;">Nuclear CO₂: ~ 0 tonnes/day ✓</div>' +
      '<div style="color:#facc15;margin-top:4px;">Ratio: 1 kg U ≈ ' + (coalPerDay / uKgDay).toFixed(0) + ' kg coal equivalent</div>';
  }

  // ─── Card 28: Quiz System ───
  var quizDataC28 = [
    { q: 'Q1: CV = 28,000 kJ/kg — which coal grade?', opts: ['Peat', 'Lignite', 'Bituminous', 'Anthracite'], ans: 2 },
    { q: 'Q2: 60–90% moisture — which coal?', opts: ['Bituminous', 'Peat', 'Lignite', 'Sub-bituminous'], ans: 1 },
    { q: 'Q3: Shiny black surface — which coal?', opts: ['Lignite', 'Peat', 'Bituminous', 'Super anthracite'], ans: 3 },
    { q: 'Q4: Slows down neutrons — which component?', opts: ['Control rod', 'Moderator', 'Reflector', 'Shield'], ans: 1 },
    { q: 'Q5: Absorbs neutrons — which component?', opts: ['Moderator', 'Coolant', 'Control rod', 'Fuel rod'], ans: 2 },
    { q: 'Q6: Removes heat from reactor — which component?', opts: ['Shield', 'Moderator', 'Reflector', 'Coolant'], ans: 3 },
    { q: 'Q7: Best moderator material?', opts: ['Graphite', 'Heavy water (D₂O)', 'Light water', 'Beryllium'], ans: 1 },
    { q: 'Q8: India\'s main reactor type?', opts: ['PWR', 'BWR', 'PHWR/CANDU', 'LMFBR'], ans: 2 },
    { q: 'Q9: keff = 1 means?', opts: ['Sub-critical', 'Critical (steady)', 'Super-critical', 'Shutdown'], ans: 1 },
    { q: 'Q10: 1 kg U-235 ≡ how much coal?', opts: ['2,700 kg', '27,000 kg', '270,000 kg', '2,700,000 kg'], ans: 3 }
  ];
  var quizIdxC28 = 0;

  function answerQuizC28(btn, isCorrectLegacy) {
    var opts = btn.parentElement.querySelectorAll('.pp-quiz-opt');
    var correctIdx = quizDataC28[quizIdxC28].ans;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.style.pointerEvents = 'none';
      if (i === correctIdx) o.classList.add('correct');
      else if (o === btn && i !== correctIdx) o.classList.add('wrong');
    });
    var fb = document.getElementById('c28qFeedback');
    var clickedIdx = Array.from(opts).indexOf(btn);
    if (clickedIdx === correctIdx) {
      fb.innerHTML = '<span style="color:#00ff88;">✓ Correct!</span>';
    } else {
      fb.innerHTML = '<span style="color:#ef4444;">✗ Wrong — correct answer: ' + quizDataC28[quizIdxC28].opts[correctIdx] + '</span>';
    }
  }

  function nextQuizC28() {
    quizIdxC28 = (quizIdxC28 + 1) % quizDataC28.length;
    var quiz = quizDataC28[quizIdxC28];
    document.getElementById('c28qText').textContent = quiz.q;
    var optsDiv = document.getElementById('c28qOpts');
    optsDiv.innerHTML = '';
    quiz.opts.forEach(function(opt, i) {
      var b = document.createElement('button');
      b.className = 'pp-quiz-opt';
      b.textContent = opt;
      b.onclick = function() { answerQuizC28(b, false); };
      optsDiv.appendChild(b);
    });
    document.getElementById('c28qFeedback').innerHTML = '';
  }

  // Observe Module 3 cards for animation
  document.querySelectorAll('#c22,#c23,#c24,#c25,#c26,#c27,#c28').forEach(c => ppObserver.observe(c));

  // ═══════════════════════════════════════════════════════════
  // MODULE 3 PART 2 — NUCLEAR REACTORS, FUELS & SITE JS
  // ═══════════════════════════════════════════════════════════

  // ─── Card 29: Component Detail Viewer ───
  function showCompDetailC29(comp) {
    var el = document.getElementById('c29CompDetail');
    var data = {
      fuel: '<strong style="color:#facc15;">Fuel Rods:</strong> Contain fissile material (U-235 or UO₂ pellets) clad in zircaloy tubes. Arranged in fuel assemblies inside the reactor core. The source of nuclear fission energy — 200 MeV per fission event.',
      control: '<strong style="color:#ef4444;">Control Rods:</strong> Made of Boron (B), Cadmium (Cd), or Hafnium (Hf). Absorb neutrons to control chain reaction rate. Insert deeper → k decreases. Withdraw → k increases. SCRAM = rapid full insertion for emergency shutdown.',
      moderator: '<strong style="color:#60a5fa;">Moderator:</strong> Slows fast neutrons to thermal speeds for efficient fission. Ranking: D₂O (best) &gt; Graphite &gt; Beryllium &gt; H₂O. FBR uses NO moderator (fast neutrons). Moderator effectiveness depends on mass similarity with neutrons.',
      coolant: '<strong style="color:#06b6d4;">Coolant:</strong> Transfers heat from reactor core to steam generator. Types: Light water (BWR/PWR), Heavy water D₂O (CANDU), CO₂ gas (AGCR), Liquid sodium Na (LMCR/FBR). In BWR, coolant boils directly to form steam.',
      reflector: '<strong style="color:#9ca3af;">Reflector:</strong> Surrounds the core to prevent neutron leakage. Reflected neutrons re-enter the core and sustain the chain reaction. Materials: Graphite, Beryllium, Heavy water. Increases neutron economy of the reactor.',
      shield: '<strong style="color:#6b7280;">Biological Shield:</strong> Thick concrete and lead layers around reactor vessel. Stops α, β, γ radiation. Intensity: I = I₀e^(-μx). α stopped by paper, β by aluminium, γ requires metres of concrete/lead.'
    };
    el.style.display = 'block';
    el.innerHTML = data[comp] || '';
  }

  // ─── Card 29: k-Factor Calculator ───
  function calcKfactorC29() {
    var n2 = parseFloat(document.getElementById('c29nGen2').value) || 0;
    var n1 = parseFloat(document.getElementById('c29nGen1').value) || 1;
    var k = n2 / n1;
    var status, color;
    if (k < 0.98) { status = 'SUB-CRITICAL — Chain reaction dies out'; color = '#60a5fa'; }
    else if (k <= 1.02) { status = 'CRITICAL — Steady chain reaction ✓'; color = '#00ff88'; }
    else { status = '⚠ SUPER-CRITICAL — Runaway reaction!'; color = '#ef4444'; }
    var out = document.getElementById('c29KOut');
    out.innerHTML =
      '<div>k = ' + n2 + ' / ' + n1 + ' = <strong>' + k.toFixed(4) + '</strong></div>' +
      '<div style="color:' + color + ';margin-top:4px;">' + status + '</div>';
  }

  // ─── Card 30: Reactor Type Switcher ───
  function switchRTypeC30(btn, type) {
    var tabs = btn.parentElement.querySelectorAll('.pp-reactor-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); t.style.color = '#9ca3af'; });
    btn.classList.add('active');
    btn.style.color = btn.style.borderColor;
    var panels = ['bwr','pwr','agcr','candu','lmcr','fbr'];
    panels.forEach(function(p) {
      var panel = document.getElementById('c30panel' + p.charAt(0).toUpperCase() + p.slice(1));
      if (panel) panel.classList.toggle('active', p === type);
    });
  }

  // ─── Card 30: Efficiency Bars Animation ───
  (function initEffBarsC30() {
    var animated = false;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          var bars = document.querySelectorAll('#c30EffBars .pp-eff-bar-fill');
          bars.forEach(function(bar) {
            var target = bar.getAttribute('data-target');
            setTimeout(function() { bar.style.width = target + '%'; }, 200);
          });
        }
      });
    }, { threshold: 0.3 });
    var el = document.getElementById('c30EffBars');
    if (el) observer.observe(el);
  })();

  // ─── Card 31: Decay Chain Animation ───
  var decayAnimTimerC31 = null;
  function animateDecayC31() {
    resetDecayC31();
    var nodes = [
      document.getElementById('c31node1'),
      document.getElementById('c31node2'),
      document.getElementById('c31node3'),
      document.getElementById('c31node4')
    ];
    var colors = ['#374151','#60a5fa','#60a5fa','#a78bfa'];
    var step = 0;
    nodes[0].classList.add('active');
    nodes[0].style.borderColor = colors[0];
    decayAnimTimerC31 = setInterval(function() {
      step++;
      if (step >= nodes.length) {
        clearInterval(decayAnimTimerC31);
        return;
      }
      nodes[step].classList.add('active');
      nodes[step].style.borderColor = colors[step];
      nodes[step].style.boxShadow = '0 0 15px ' + colors[step] + '66';
    }, 1200);
  }

  function resetDecayC31() {
    if (decayAnimTimerC31) clearInterval(decayAnimTimerC31);
    for (var i = 1; i <= 4; i++) {
      var n = document.getElementById('c31node' + i);
      if (n) {
        n.classList.remove('active');
        n.style.borderColor = '';
        n.style.boxShadow = '';
      }
    }
    var n1 = document.getElementById('c31node1');
    if (n1) { n1.classList.add('active'); n1.style.borderColor = '#374151'; }
  }

  // ─── Card 31: Fission Energy Calculator ───
  function calcFissionEnergyC31() {
    var fissions = parseFloat(document.getElementById('c31fissions').value) || 0;
    var eMeV = fissions * 200;
    var eJ = fissions * 200 * 1.6e-13;
    var eMJ = eJ / 1e6;
    var perKg = 8.2e13;
    var kgEquiv = eJ / perKg;
    var out = document.getElementById('c31FissOut');
    out.innerHTML =
      '<div>E = ' + fissions.toExponential(2) + ' × 200 MeV = ' + eMeV.toExponential(3) + ' MeV</div>' +
      '<div style="color:#a78bfa;margin-top:4px;">= ' + eJ.toExponential(3) + ' J = ' + eMJ.toExponential(3) + ' MJ</div>' +
      '<div style="color:#facc15;">Equivalent U-235 mass: ' + kgEquiv.toExponential(3) + ' kg</div>';
  }

  // ─── Card 32: Radioactive Decay Calculator ───
  function calcDecayC32() {
    var N0 = parseFloat(document.getElementById('c32N0').value) || 0;
    var tHalf = parseFloat(document.getElementById('c32tHalf').value) || 1;
    var t = parseFloat(document.getElementById('c32t').value) || 0;
    var N = N0 * Math.pow(2, -t / tHalf);
    var halfLives = t / tHalf;
    var pctRemain = N0 > 0 ? (N / N0 * 100) : 0;
    var tSafe = tHalf * Math.log2(N0 / 1);
    var out = document.getElementById('c32DecayOut');
    out.innerHTML =
      '<div>N(' + t + ') = ' + N0 + ' × 2^(-' + t + '/' + tHalf + ') = <strong>' + N.toFixed(2) + '</strong></div>' +
      '<div style="color:#fb7185;margin-top:4px;">' + halfLives.toFixed(1) + ' half-lives elapsed — ' + pctRemain.toFixed(2) + '% remaining</div>' +
      '<div style="color:#a78bfa;">Time to decay to ~1 unit: ' + tSafe.toFixed(1) + ' years</div>';
  }

  // ─── Card 32: Overall Efficiency Calculator ───
  function calcEffC32() {
    var eR = parseFloat(document.getElementById('c32etaR').value) / 100 || 0;
    var eT = parseFloat(document.getElementById('c32etaT').value) / 100 || 0;
    var eG = parseFloat(document.getElementById('c32etaG').value) / 100 || 0;
    var overall = eR * eT * eG * 100;
    var out = document.getElementById('c32EffOut');
    out.innerHTML =
      '<div>η = ' + (eR * 100).toFixed(0) + '% × ' + (eT * 100).toFixed(0) + '% × ' + (eG * 100).toFixed(0) + '% = <strong>' + overall.toFixed(1) + '%</strong></div>' +
      (overall >= 36 ? '<div style="color:#00ff88;margin-top:4px;">✓ Above average nuclear plant efficiency</div>' :
       '<div style="color:#f97316;margin-top:4px;">Below typical best achievable (~42% for FBR with Na)</div>');
  }

  // ─── Card 33: Nuclear Quiz System ───
  var quizDataC33 = [
    { q: 'Q1: Which reactor uses natural uranium (no enrichment)?', opts: ['BWR', 'PWR', 'CANDU', 'FBR'], ans: 2 },
    { q: 'Q2: Highest efficiency reactor type?', opts: ['BWR (33%)', 'AGCR (40%)', 'FBR (42%)', 'CANDU (30%)'], ans: 2 },
    { q: 'Q3: Which reactor has NO moderator?', opts: ['PWR', 'CANDU', 'AGCR', 'FBR'], ans: 3 },
    { q: 'Q4: Which reactor uses CO₂ as coolant?', opts: ['BWR', 'AGCR', 'CANDU', 'LMCR'], ans: 1 },
    { q: 'Q5: PFBR Kalpakkam is which reactor type?', opts: ['BWR', 'PWR', 'PHWR', 'FBR'], ans: 3 },
    { q: 'Q6: Tarapur (India\'s first) is which type?', opts: ['BWR', 'PWR', 'CANDU', 'FBR'], ans: 0 },
    { q: 'Q7: Pu-239 is bred from which isotope?', opts: ['U-235', 'U-238', 'Th-232', 'Np-239'], ans: 1 },
    { q: 'Q8: Best moderator material?', opts: ['H₂O', 'Graphite', 'D₂O', 'Beryllium'], ans: 2 },
    { q: 'Q9: Control rod materials include?', opts: ['Boron & Cadmium', 'Sodium & Lead', 'Graphite & Be', 'Uranium & Th'], ans: 0 },
    { q: 'Q10: Energy per fission of U-235?', opts: ['2 MeV', '20 MeV', '200 MeV', '2000 MeV'], ans: 2 }
  ];
  var quizIdxC33 = 0;

  function answerQuizC33(btn, idx) {
    var opts = btn.parentElement.querySelectorAll('.pp-quiz-opt');
    var correctIdx = quizDataC33[quizIdxC33].ans;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.style.pointerEvents = 'none';
      if (i === correctIdx) o.classList.add('correct');
      else if (o === btn && i !== correctIdx) o.classList.add('wrong');
    });
    var fb = document.getElementById('c33qFeedback');
    if (idx === correctIdx) {
      fb.innerHTML = '<span style="color:#00ff88;">✓ Correct!</span>';
    } else {
      fb.innerHTML = '<span style="color:#ef4444;">✗ Wrong — answer: ' + quizDataC33[quizIdxC33].opts[correctIdx] + '</span>';
    }
  }

  function nextQuizC33() {
    quizIdxC33 = (quizIdxC33 + 1) % quizDataC33.length;
    var quiz = quizDataC33[quizIdxC33];
    document.getElementById('c33qText').textContent = quiz.q;
    var optsDiv = document.getElementById('c33qOpts');
    optsDiv.innerHTML = '';
    quiz.opts.forEach(function(opt, i) {
      var b = document.createElement('button');
      b.className = 'pp-quiz-opt';
      b.textContent = opt;
      b.onclick = function() { answerQuizC33(b, i); };
      optsDiv.appendChild(b);
    });
    document.getElementById('c33qFeedback').innerHTML = '';
  }

  // ─── Card 33: k-Factor Trainer ───
  var kTrainDataC33 = [
    { q: 'Scenario: Control rods inserted deeper. What happens to k?', ans: 1, explain: 'More neutrons absorbed → fewer for fission → k decreases' },
    { q: 'Scenario: Control rods withdrawn. What happens to k?', ans: 0, explain: 'Fewer neutrons absorbed → more fission → k increases' },
    { q: 'Scenario: Moderator removed. What happens to k?', ans: 1, explain: 'Neutrons stay fast → fewer fissions → k generally decreases (thermal reactor)' },
    { q: 'Scenario: More fuel loaded into core. What happens to k?', ans: 0, explain: 'More fissile material → more fissions per generation → k increases' },
    { q: 'Scenario: Coolant lost (LOCA). BWR — what happens to k?', ans: 1, explain: 'In BWR, water is moderator — losing it means fewer slow neutrons → k decreases (negative void coefficient)' },
    { q: 'Scenario: Temperature rises in reactor. What happens to k?', ans: 1, explain: 'Doppler broadening: more neutron absorption at resonance energies → k decreases (negative temperature coefficient)' }
  ];
  var kTrainIdxC33 = 0;

  function answerKTrainC33(btn, idx) {
    var opts = btn.parentElement.querySelectorAll('.pp-ktrain-btn');
    var correctIdx = kTrainDataC33[kTrainIdxC33].ans;
    opts.forEach(function(o, i) {
      o.style.pointerEvents = 'none';
      if (i === correctIdx) o.classList.add('correct');
      else if (o === btn && i !== correctIdx) o.classList.add('wrong');
    });
    var fb = document.getElementById('c33kTrainFb');
    if (idx === correctIdx) {
      fb.innerHTML = '<span style="color:#00ff88;">✓ Correct! ' + kTrainDataC33[kTrainIdxC33].explain + '</span>';
    } else {
      fb.innerHTML = '<span style="color:#ef4444;">✗ ' + kTrainDataC33[kTrainIdxC33].explain + '</span>';
    }
  }

  function nextKTrainC33() {
    kTrainIdxC33 = (kTrainIdxC33 + 1) % kTrainDataC33.length;
    var scenario = kTrainDataC33[kTrainIdxC33];
    document.getElementById('c33kTrainQ').textContent = scenario.q;
    var optsDiv = document.getElementById('c33kTrainOpts');
    optsDiv.innerHTML = '';
    var labels = ['k increases ↑', 'k decreases ↓', 'k stays same'];
    labels.forEach(function(lbl, i) {
      var b = document.createElement('button');
      b.className = 'pp-ktrain-btn';
      b.textContent = lbl;
      b.onclick = function() { answerKTrainC33(b, i); };
      optsDiv.appendChild(b);
    });
    document.getElementById('c33kTrainFb').innerHTML = '';
  }

  // Observe Module 3 Part 2 cards for animation
  document.querySelectorAll('#c29,#c30,#c31,#c32,#c33').forEach(c => ppObserver.observe(c));

  // ═══════════════════════════════════════════════════════
  // MODULE 4 — DIESEL, GAS TURBINE & NON-CONVENTIONAL
  // ═══════════════════════════════════════════════════════

  // ─── c34: Diesel Cycle Efficiency ───
  function calcDieselC34(){
    const r=parseFloat(document.getElementById('c34r').value)||18;
    const rc=parseFloat(document.getElementById('c34rc').value)||2.5;
    const g=parseFloat(document.getElementById('c34gamma').value)||1.4;
    const eta=1-(1/Math.pow(r,g-1))*((Math.pow(rc,g)-1)/(g*(rc-1)));
    document.getElementById('c34DieselOut').innerHTML=
      `η_diesel = 1 - (1/${r}^${(g-1).toFixed(2)}) × (${rc}^${g.toFixed(2)}-1)/(${g.toFixed(2)}×(${rc}-1))<br>`+
      `<span style="color:#f97316;font-size:13px;font-weight:bold;">η = ${(eta*100).toFixed(2)}%</span>`;
  }

  function calcFuelC34(){
    const P=parseFloat(document.getElementById('c34Pout').value)||500;
    const eta=(parseFloat(document.getElementById('c34eta').value)||40)/100;
    const CV=43000; // kJ/kg
    const mfuel=P/(eta*CV);
    document.getElementById('c34FuelOut').innerHTML=
      `ṁ_fuel = ${P} / (${(eta*100).toFixed(1)}% × ${CV} kJ/kg)<br>`+
      `<span style="color:#f97316;font-size:13px;font-weight:bold;">ṁ = ${mfuel.toFixed(4)} kg/s = ${(mfuel*3600).toFixed(2)} kg/hr</span>`;
  }

  // ─── c35: Brayton Cycle ───
  function calcBraytonC35(){
    const rp=parseFloat(document.getElementById('c35rp').value)||15;
    const g=parseFloat(document.getElementById('c35gamma').value)||1.4;
    const eta=1-Math.pow(rp,-(g-1)/g);
    document.getElementById('c35BraytonOut').innerHTML=
      `η_Brayton = 1 - ${rp}^(-(${g.toFixed(2)}-1)/${g.toFixed(2)})<br>`+
      `<span style="color:#f97316;font-size:13px;font-weight:bold;">η = ${(eta*100).toFixed(2)}%</span>`;
  }

  function calcBWRC35(){
    const Wt=parseFloat(document.getElementById('c35Wt').value)||1000;
    const Wc=parseFloat(document.getElementById('c35Wc').value)||550;
    if(Wt<=0){document.getElementById('c35BWROut').textContent='W_T must be > 0';return;}
    const bwr=Wc/Wt;
    const Wnet=Wt-Wc;
    document.getElementById('c35BWROut').innerHTML=
      `BWR = ${Wc}/${Wt} = <span style="color:#f97316;font-weight:bold;">${(bwr*100).toFixed(1)}%</span><br>`+
      `W_net = ${Wt} - ${Wc} = <span style="color:#00ff88;font-size:13px;font-weight:bold;">${Wnet.toFixed(1)} kW</span>`;
  }

  // ─── c36: Startup race animation ───
  function animateStartupBars(){
    const bars=document.querySelectorAll('#c36StartupBars .pp-startup-fill');
    bars.forEach(b=>{
      const t=parseInt(b.dataset.target)||0;
      b.style.width=t+'%';
    });
  }

  // ─── c37: Solar PV Array ───
  function calcSolarC37(){
    const ns=parseInt(document.getElementById('c37ns').value)||6;
    const np=parseInt(document.getElementById('c37np').value)||4;
    const Vc=parseFloat(document.getElementById('c37Vc').value)||0.6;
    const Ic=parseFloat(document.getElementById('c37Ic').value)||9;
    const FF=parseFloat(document.getElementById('c37FF').value)||0.78;
    const Vtot=ns*Vc, Itot=np*Ic;
    const P=Vtot*Itot*FF;
    document.getElementById('c37SolarOut').innerHTML=
      `V_total = ${ns} × ${Vc} = ${Vtot.toFixed(2)} V &nbsp;|&nbsp; I_total = ${np} × ${Ic} = ${Itot.toFixed(2)} A<br>`+
      `<span style="color:#facc15;font-size:13px;font-weight:bold;">P_array = ${Vtot.toFixed(2)} × ${Itot.toFixed(2)} × ${FF} = ${P.toFixed(2)} W (${(P/1000).toFixed(3)} kW)</span>`;
  }

  function calcTempDerateC37(){
    const Pr=parseFloat(document.getElementById('c37Prated').value)||400;
    const T=parseFloat(document.getElementById('c37Temp').value)||45;
    const Pact=Pr*(1-0.004*(T-25));
    const loss=Pr-Pact;
    document.getElementById('c37TempOut').innerHTML=
      `P_actual = ${Pr} × [1 - 0.004(${T}-25)] = ${Pr} × ${(1-0.004*(T-25)).toFixed(4)}<br>`+
      `<span style="color:#facc15;font-size:13px;font-weight:bold;">P = ${Pact.toFixed(2)} W</span> &nbsp;(loss: <span style="color:#ef4444;">${loss.toFixed(2)} W / ${((loss/Pr)*100).toFixed(1)}%</span>)`;
  }

  // ─── c38: CSP Detail ───
  function showCSPC38(type){
    const el=document.getElementById('c38CSPDetail');
    el.style.display='block';
    const info={
      trough:'<b style="color:#facc15;">Parabolic Trough</b> — Most deployed CSP. Long curved mirrors focus sunlight onto receiver tube (linear focus). HTF: synthetic oil or molten salt. T ≈ 400°C. η ≈ 15%. Plants: 50-300 MW. Example: SEGS (California), Noor (Morocco).',
      tower:'<b style="color:#facc15;">Solar Tower (Central Receiver)</b> — Field of heliostats reflects sunlight to tower-top receiver. T ≈ 600°C. Molten salt storage (6-10 hrs). High efficiency. Example: Ivanpah (USA), Gemasolar (Spain).',
      dish:'<b style="color:#facc15;">Parabolic Dish</b> — Point-focus concentrator, highest temperature (~1000°C). Uses Stirling engine at focus. Small units (5-25 kW). Highest solar-to-electric efficiency of any CSP technology.',
      fresnel:'<b style="color:#facc15;">Linear Fresnel Reflector</b> — Flat/slightly curved mirrors approximate parabolic trough. T ≈ 300°C. Lower cost, lower efficiency than trough. Good for direct steam generation (DSG).'
    };
    el.innerHTML=info[type]||'';
  }

  // ─── c39: Wind Power ───
  function calcWindC39(){
    const v=parseFloat(document.getElementById('c39v').value)||12;
    const D=parseFloat(document.getElementById('c39D').value)||80;
    const Cp=parseFloat(document.getElementById('c39Cp').value)||0.4;
    const rho=1.225;
    const A=Math.PI*Math.pow(D/2,2);
    const P=0.5*rho*A*Math.pow(v,3)*Cp;
    let status='',clr='#00ff88';
    if(v<3.5){status='Below cut-in (no output)';clr='#6b7280';}
    else if(v<=15){status='Operating range ✓';clr='#00ff88';}
    else if(v<=25){status='At rated / high wind';clr='#facc15';}
    else{status='Above cut-out — SHUTDOWN!';clr='#ef4444';}
    document.getElementById('c39WindOut').innerHTML=
      `A = π×(${D}/2)² = ${A.toFixed(1)} m² &nbsp;|&nbsp; ρ = ${rho} kg/m³<br>`+
      `P = ½×${rho}×${A.toFixed(1)}×${v}³×${Cp}<br>`+
      `<span style="color:#00f5ff;font-size:13px;font-weight:bold;">P = ${(P/1e6).toFixed(3)} MW (${(P/1000).toFixed(1)} kW)</span><br>`+
      `<span style="color:${clr};">Status: ${status}</span>`;
  }

  // ─── c39: Tidal Energy ───
  function calcTidalC39(){
    const A=parseFloat(document.getElementById('c39tA').value)||1e6;
    const h=parseFloat(document.getElementById('c39th').value)||8;
    const rho=1025, g=9.81;
    const E=0.5*rho*g*A*h*h;
    document.getElementById('c39TidalOut').innerHTML=
      `E = ½×${rho}×${g}×${A.toExponential(2)}×${h}²<br>`+
      `<span style="color:#06b6d4;font-size:13px;font-weight:bold;">E = ${(E/1e9).toFixed(3)} GJ per cycle = ${(E/3.6e9).toFixed(3)} GWh</span>`;
  }

  // ─── c40: Quiz System ───
  const m4Quiz=[
    {q:'Q1: Betz limit for wind turbine Cp_max is?',opts:['0.40','0.593','0.75','0.85'],ans:1},
    {q:'Q2: Which CSP type reaches highest temperature (~1000°C)?',opts:['Parabolic Trough','Solar Tower','Parabolic Dish','Linear Fresnel'],ans:2},
    {q:'Q3: Brayton cycle is used in which power plant?',opts:['Diesel','Gas Turbine','Nuclear','Hydro'],ans:1},
    {q:'Q4: Fill Factor (FF) of a good solar cell is approximately?',opts:['0.3–0.5','0.5–0.6','0.7–0.85','0.9–1.0'],ans:2},
    {q:'Q5: Back work ratio of gas turbine is approximately?',opts:['5–10%','10–25%','40–80%','90–100%'],ans:2},
    {q:'Q6: Minimum tidal range for viable power generation?',opts:['1 m','3 m','5 m','10 m'],ans:2},
    {q:'Q7: India\'s solar installed capacity (approx 2024)?',opts:['30 GW','73 GW','150 GW','280 GW'],ans:1},
    {q:'Q8: Diesel plant is mainly used for?',opts:['Base load','Peak load/Standby','Nuclear backup','Hydro backup'],ans:1}
  ];
  let m4Qi=0;

  function renderQuizC40(){
    const qd=m4Quiz[m4Qi%m4Quiz.length];
    document.getElementById('c40qText').textContent=qd.q;
    const opts=document.getElementById('c40qOpts');
    opts.innerHTML='';
    qd.opts.forEach((o,i)=>{
      const b=document.createElement('button');
      b.className='pp-quiz-opt';
      b.textContent=o;
      b.onclick=function(){answerQuizC40(b,i);};
      opts.appendChild(b);
    });
    document.getElementById('c40qFeedback').textContent='';
  }

  function answerQuizC40(btn,idx){
    const qd=m4Quiz[m4Qi%m4Quiz.length];
    const btns=document.querySelectorAll('#c40qOpts .pp-quiz-opt');
    btns.forEach(b=>b.style.pointerEvents='none');
    if(idx===qd.ans){
      btn.style.background='rgba(0,255,136,0.3)';
      btn.style.borderColor='#00ff88';
      document.getElementById('c40qFeedback').innerHTML='<span style="color:#00ff88;">✓ Correct!</span>';
    }else{
      btn.style.background='rgba(239,68,68,0.3)';
      btn.style.borderColor='#ef4444';
      btns[qd.ans].style.background='rgba(0,255,136,0.2)';
      btns[qd.ans].style.borderColor='#00ff88';
      document.getElementById('c40qFeedback').innerHTML='<span style="color:#ef4444;">✗ Wrong!</span> Correct: <span style="color:#00ff88;">'+qd.opts[qd.ans]+'</span>';
    }
  }

  function nextQuizC40(){
    m4Qi++;
    renderQuizC40();
  }

  // ─── Module 4: Observer-triggered animations ───
  const m4Observer=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const id=e.target.id;
      // Animate efficiency bars
      e.target.querySelectorAll('.pp-eff-bar-fill[data-target]').forEach(b=>{
        setTimeout(()=>{b.style.width=b.dataset.target+'%';},300);
      });
      // Startup race bars (c36)
      if(id==='c36'){
        setTimeout(animateStartupBars,400);
      }
      // India target bars (c40)
      if(id==='c40'){
        setTimeout(()=>{
          document.querySelectorAll('#c40Targets .pp-target-fill[data-target]').forEach(b=>{
            b.style.width=b.dataset.target+'%';
          });
          // Master comparison bars
          document.querySelectorAll('#c40MasterBars .pp-eff-bar-fill[data-target]').forEach(b=>{
            setTimeout(()=>{b.style.width=b.dataset.target+'%';},300);
          });
        },400);
        renderQuizC40();
      }
    });
  },{threshold:0.15});

  // Observe Module 4 cards for animation
  document.querySelectorAll('#c34,#c35,#c36,#c37,#c38,#c39,#c40').forEach(c => m4Observer.observe(c));

  // ═══════════════════════════════════════════════════════
  // MODULE 4 PART 2 — SOLAR DEEP DIVE (c41-c45)
  // ═══════════════════════════════════════════════════════

  // ─── c41: Photon Energy & Surface Irradiance ───
  function calcPhotonC41(){
    const lam=parseFloat(document.getElementById('c41lam').value)||550;
    const h=6.626e-34, c=3e8, eV=1.602e-19;
    const E_J=h*c/(lam*1e-9);
    const E_eV=E_J/eV;
    const Eg=1.12;
    let status,clr;
    if(E_eV<Eg){status='Below Si band gap — NOT absorbed';clr='#ef4444';}
    else if(E_eV<1.5){status='Near band gap — EFFICIENT absorption!';clr='#00ff88';}
    else{status='Above band gap — excess energy → heat';clr='#f97316';}
    document.getElementById('c41PhotonOut').innerHTML=
      `λ = ${lam} nm → E = hc/λ = <span style="color:#facc15;font-size:13px;font-weight:bold;">${E_eV.toFixed(3)} eV</span><br>`+
      `Si E_g = ${Eg} eV → <span style="color:${clr};">${status}</span>`;
  }

  function calcSurfaceIrrC41(){
    const tau=parseFloat(document.getElementById('c41tau').value)||0.75;
    const Gsc=1367;
    const Gs=Gsc*tau;
    document.getElementById('c41PhotonOut').innerHTML=
      `G_surface = G_sc × τ = ${Gsc} × ${tau.toFixed(2)}<br>`+
      `<span style="color:#facc15;font-size:13px;font-weight:bold;">G_surface = ${Gs.toFixed(1)} W/m²</span>`;
  }

  // ─── c42: Fill Factor & Efficiency ───
  function calcFFC42(){
    const Vmp=parseFloat(document.getElementById('c42Vmp').value)||0.5;
    const Imp=parseFloat(document.getElementById('c42Imp').value)||8.5;
    const Voc=parseFloat(document.getElementById('c42Voc').value)||0.62;
    const Isc=parseFloat(document.getElementById('c42Isc').value)||9.5;
    const G=parseFloat(document.getElementById('c42G').value)||1000;
    const A=parseFloat(document.getElementById('c42A').value)||0.0256;
    if(Voc*Isc===0){document.getElementById('c42FFOut').textContent='Voc and Isc must be > 0';return;}
    const FF=(Vmp*Imp)/(Voc*Isc);
    const Pmax=Voc*Isc*FF;
    const Pin=G*A;
    const eta=(Pmax/Pin)*100;
    const quality=FF>=0.8?'Excellent':'(FF≥0.75?\'Good\':\'Low — check cell\')';
    const ffQ=FF>=0.8?'Excellent (≥0.8)':FF>=0.75?'Good (≥0.75)':FF>=0.7?'Fair (≥0.7)':'Low (<0.7)';
    const ffClr=FF>=0.75?'#00ff88':'#f97316';
    document.getElementById('c42FFOut').innerHTML=
      `FF = (${Vmp}×${Imp})/(${Voc}×${Isc}) = <span style="color:#facc15;font-size:13px;font-weight:bold;">${FF.toFixed(4)}</span> → <span style="color:${ffClr};">${ffQ}</span><br>`+
      `P_max = ${Voc}×${Isc}×${FF.toFixed(4)} = <span style="color:#00ff88;font-weight:bold;">${Pmax.toFixed(3)} W</span><br>`+
      `η = ${Pmax.toFixed(3)}/(${G}×${A}) × 100 = <span style="color:#facc15;font-size:13px;font-weight:bold;">${eta.toFixed(2)}%</span>`;
  }

  // ─── c42: Shadow Demo ───
  let c42shadowState=[false,false,false];
  let c42bypassOn=false;

  function toggleShadowC42(n){
    c42shadowState[n-1]=!c42shadowState[n-1];
    updateShadowC42();
  }

  function resetShadowC42(){
    c42shadowState=[false,false,false];
    updateShadowC42();
  }

  function toggleBypassC42(){
    c42bypassOn=!c42bypassOn;
    document.getElementById('c42BypassBtn').textContent=c42bypassOn?'Remove Bypass Diode':'Add Bypass Diode';
    updateShadowC42();
  }

  function updateShadowC42(){
    for(let i=1;i<=3;i++){
      const el=document.getElementById('c42cell'+i);
      if(c42shadowState[i-1]){
        el.style.background='rgba(239,68,68,0.15)';
        el.style.borderColor='#ef4444';
        el.style.color='#ef4444';
        el.innerHTML='Cell '+i+'<br>🌑';
      }else{
        el.style.background='rgba(0,255,136,0.15)';
        el.style.borderColor='#00ff88';
        el.style.color='#00ff88';
        el.innerHTML='Cell '+i+'<br>☀️';
      }
    }
    const shadedCount=c42shadowState.filter(Boolean).length;
    const st=document.getElementById('c42ShadowStatus');
    const info=document.getElementById('c42BypassInfo');
    if(shadedCount===0){
      st.innerHTML='<span style="color:#00ff88;">Series: All lit → Full current ✓</span>';
      info.textContent='';
    }else if(!c42bypassOn){
      st.innerHTML='<span style="color:#ef4444;">⚠️ '+shadedCount+' shaded → String current = 0! Entire string fails!</span>';
      info.innerHTML='<span style="color:#ef4444;">Without bypass diode: P_lost = P_string (total loss)</span>';
    }else{
      st.innerHTML='<span style="color:#00f5ff;">Bypass active → Shaded cell(s) bypassed, '+(3-shadedCount)+'/3 cells producing ✓</span>';
      info.innerHTML='<span style="color:#00f5ff;">With bypass diode: P_lost = P_shaded_module only → String survives!</span>';
    }
  }

  // ─── c43: Cell Type Recommender ───
  function recommendCellC43(){
    const budget=parseFloat(document.getElementById('c43budget').value)||30;
    const etaMin=parseFloat(document.getElementById('c43eta').value)||15;
    let rec='',clr='#facc15';
    if(etaMin>=20){
      rec='<span style="color:#facc15;font-weight:bold;">→ Bifacial</span> (η: 20-24%, premium cost, best efficiency)';
      if(budget<50) rec+='<br><span style="color:#ef4444;">⚠️ Budget may be insufficient for bifacial (₹40-60/W)</span>';
    }else if(etaMin>=17){
      rec='<span style="color:#1e40af;font-weight:bold;">→ Monocrystalline Si</span> (η: 18-22%, good balance)';
      if(budget<25) rec+='<br><span style="color:#f97316;">Consider Poly-Si or Thin film for budget</span>';
    }else if(etaMin>=14){
      rec=budget<25?
        '<span style="color:#60a5fa;font-weight:bold;">→ Polycrystalline Si</span> (η: 15-18%, best value!)':
        '<span style="color:#1e40af;font-weight:bold;">→ Mono-Si</span> (budget allows upgrade, η: 18-22%)';
    }else{
      rec=budget<20?
        '<span style="color:#6b7280;font-weight:bold;">→ Thin Film</span> (η: 10-13%, cheapest, lowest cost/W)':
        '<span style="color:#60a5fa;font-weight:bold;">→ Poly-Si</span> (better η within budget)';
    }
    document.getElementById('c43RecOut').innerHTML=rec;
  }

  // ─── c44: System tabs ───
  function showSysTab(idx){
    document.querySelectorAll('.pp-sys-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
    document.querySelectorAll('.pp-sys-panel').forEach((p,i)=>p.classList.toggle('active',i===idx));
  }

  // ─── c44: Panel sizing ───
  function calcPanelC44(){
    const Ed=parseFloat(document.getElementById('c44Ed').value)||10;
    const Hp=parseFloat(document.getElementById('c44Hp').value)||5;
    const eta=parseFloat(document.getElementById('c44eta').value)||0.75;
    const P=Ed/(Hp*eta);
    document.getElementById('c44PanelOut').innerHTML=
      `P_panel ≥ ${Ed}/(${Hp}×${eta}) = <span style="color:#facc15;font-size:13px;font-weight:bold;">${P.toFixed(2)} kWp</span><br>`+
      `Approx panels (400W): <span style="color:#00ff88;">${Math.ceil(P*1000/400)} panels</span>`;
  }

  // ─── c44: Battery sizing ───
  function calcBatC44(){
    const Ed=parseFloat(document.getElementById('c44Ed').value)||10;
    const days=parseFloat(document.getElementById('c44days').value)||2;
    const dod=parseFloat(document.getElementById('c44dod').value)||0.5;
    const Vb=parseFloat(document.getElementById('c44vb').value)||48;
    const nb=parseFloat(document.getElementById('c44nb').value)||0.85;
    if(dod*nb*Vb===0){document.getElementById('c44BatOut').textContent='Check inputs';return;}
    const Ah=(Ed*1000*days)/(dod*nb*Vb);
    document.getElementById('c44BatOut').innerHTML=
      `C_bat = (${Ed}×1000×${days})/(${dod}×${nb}×${Vb})<br>`+
      `<span style="color:#fb7185;font-size:13px;font-weight:bold;">C_bat = ${Ah.toFixed(1)} Ah @ ${Vb}V</span> (${(Ah*Vb/1000).toFixed(2)} kWh total)`;
  }

  // ─── c45: Quick I-V analysis ───
  function calcQuickIVC45(){
    const Isc=parseFloat(document.getElementById('c45Isc').value)||9.5;
    const Voc=parseFloat(document.getElementById('c45Voc').value)||0.62;
    const FF=parseFloat(document.getElementById('c45FF').value)||0.78;
    const Pmax=Isc*Voc*FF;
    const ffQ=FF>=0.8?'Excellent':FF>=0.75?'Good':FF>=0.7?'Fair':'Low';
    const ffC=FF>=0.75?'#00ff88':'#f97316';
    document.getElementById('c45IVOut').innerHTML=
      `P_max = ${Isc}×${Voc}×${FF} = <span style="color:#facc15;font-size:13px;font-weight:bold;">${Pmax.toFixed(3)} W</span><br>`+
      `FF = ${FF} → <span style="color:${ffC};">${ffQ}</span> | Benchmark: 0.75`;
  }

  // ─── c45: Quiz System ───
  const m4p2Quiz=[
    {q:'Q1: What is the solar constant?',opts:['1000 W/m²','1367 W/m²','1500 W/m²','800 W/m²'],ans:1},
    {q:'Q2: Band gap of Silicon?',opts:['0.67 eV','1.12 eV','1.42 eV','2.26 eV'],ans:1},
    {q:'Q3: Shockley-Queisser limit?',opts:['25.0%','29.4%','33.7%','41.0%'],ans:2},
    {q:'Q4: Most efficient cell type for general use?',opts:['Thin film','Poly-Si','Mono-Si','Bifacial'],ans:3},
    {q:'Q5: Fill Factor of a good cell is approximately?',opts:['0.3–0.5','0.5–0.65','0.7–0.85','0.9–1.0'],ans:2},
    {q:'Q6: Which system needs NO battery?',opts:['OFF Grid','ON Grid','Hybrid','All need batteries'],ans:1},
    {q:'Q7: Shadow effects are worst in which config?',opts:['Parallel','Series','Both equal','Hybrid'],ans:1},
    {q:'Q8: Cheapest solar cell type?',opts:['Mono-Si','Poly-Si','Thin film','Bifacial'],ans:2},
    {q:'Q9: Solar spectrum — visible light percentage?',opts:['7%','25%','46%','47%'],ans:2},
    {q:'Q10: OFF grid system priority order?',opts:['Grid→Battery→Solar','Solar→Grid→Battery','Solar→Battery→Load','Battery→Solar→Load'],ans:2}
  ];
  let m4p2Qi=0;

  function renderQuizC45(){
    const qd=m4p2Quiz[m4p2Qi%m4p2Quiz.length];
    document.getElementById('c45qText').textContent=qd.q;
    const opts=document.getElementById('c45qOpts');
    opts.innerHTML='';
    qd.opts.forEach((o,i)=>{
      const b=document.createElement('button');
      b.className='pp-quiz-opt';
      b.textContent=o;
      b.onclick=function(){answerQuizC45(b,i);};
      opts.appendChild(b);
    });
    document.getElementById('c45qFeedback').textContent='';
  }

  function answerQuizC45(btn,idx){
    const qd=m4p2Quiz[m4p2Qi%m4p2Quiz.length];
    const btns=document.querySelectorAll('#c45qOpts .pp-quiz-opt');
    btns.forEach(b=>b.style.pointerEvents='none');
    if(idx===qd.ans){
      btn.style.background='rgba(0,255,136,0.3)';
      btn.style.borderColor='#00ff88';
      document.getElementById('c45qFeedback').innerHTML='<span style="color:#00ff88;">✓ Correct!</span>';
    }else{
      btn.style.background='rgba(239,68,68,0.3)';
      btn.style.borderColor='#ef4444';
      btns[qd.ans].style.background='rgba(0,255,136,0.2)';
      btns[qd.ans].style.borderColor='#00ff88';
      document.getElementById('c45qFeedback').innerHTML='<span style="color:#ef4444;">✗ Wrong!</span> Correct: <span style="color:#00ff88;">'+qd.opts[qd.ans]+'</span>';
    }
  }

  function nextQuizC45(){
    m4p2Qi++;
    renderQuizC45();
  }

  // ─── Module 4 Part 2: Observer-triggered animations ───
  const m4p2Observer=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const id=e.target.id;
      // Animate efficiency bars
      e.target.querySelectorAll('.pp-eff-bar-fill[data-target]').forEach(b=>{
        setTimeout(()=>{b.style.width=b.dataset.target+'%';},300);
      });
      // Lifespan bars (c43)
      if(id==='c43'){
        setTimeout(()=>{
          document.querySelectorAll('#c43LifeBars .pp-life-fill[data-target]').forEach(b=>{
            b.style.width=b.dataset.target+'%';
          });
        },400);
      }
      // Quiz init (c45)
      if(id==='c45'){
        setTimeout(()=>{
          document.querySelectorAll('#c45MasterBars .pp-eff-bar-fill[data-target]').forEach(b=>{
            setTimeout(()=>{b.style.width=b.dataset.target+'%';},300);
          });
        },400);
        renderQuizC45();
      }
    });
  },{threshold:0.15});

  // Observe Module 4 Part 2 cards for animation
  document.querySelectorAll('#c41,#c42,#c43,#c44,#c45').forEach(c => m4p2Observer.observe(c));

  // ══════════ MODULE 4 PART 3 — Solar Collectors, Solar Thermal & Heliostats JS ══════════

  // --- c46: Advantages/Disadvantages balance animation ---
  function initBalanceC46(){
    const advs=['Renewable','Reduces bills','Diverse apps','Low maintenance','Tech advancing'];
    const diss=['Expensive storage','Weather dependent','No night use','Large area','Low conversion'];
    const advC=document.getElementById('c46Adv'), disC=document.getElementById('c46Dis');
    if(!advC||!disC) return;
    advC.innerHTML=''; disC.innerHTML='';
    advs.forEach((a,i)=>{const d=document.createElement('div');d.className='pp-balance-item pp-balance-adv';d.textContent=a;advC.appendChild(d);setTimeout(()=>d.classList.add('show'),200+i*250);});
    diss.forEach((a,i)=>{const d=document.createElement('div');d.className='pp-balance-item pp-balance-dis';d.textContent=a;disC.appendChild(d);setTimeout(()=>d.classList.add('show'),200+i*250);});
  }

  // Efficiency gauge animation
  function initEtaGaugeC46(){
    const f=document.getElementById('c46EtaFill');
    if(f) setTimeout(()=>{f.style.width='17%';},300);
  }

  // Instrument cards
  function showInstrC46(idx){
    const cards=document.querySelectorAll('#c46Instruments .pp-instr-card');
    cards.forEach((c,i)=>{c.classList.toggle('active',i===idx);});
  }

  // Surface irradiance calculator
  function calcIrrC46(){
    const tau=parseFloat(document.getElementById('c46Tau').value)||0;
    const g=1367*Math.max(0,Math.min(1,tau));
    document.getElementById('c46IrrResult').textContent='G = 1367 × '+tau.toFixed(2)+' = '+g.toFixed(1)+' W/m² '+(tau>0.6?'(Clear ☀️)':'(Cloudy ☁️)');
  }

  // --- c47: Collector tree toggle ---
  function toggleTreeC47(branch){
    if(branch==='low'){const el=document.getElementById('c47LowBranch');el.style.display=el.style.display==='none'?'flex':'none';}
    if(branch==='high'){const el=document.getElementById('c47HighBranch');el.style.display=el.style.display==='none'?'flex':'none';}
    if(branch==='root'){document.getElementById('c47LowBranch').style.display='flex';document.getElementById('c47HighBranch').style.display='flex';}
  }

  // Collector detail panel
  const collectorDataC47={
    fpc:{name:'Flat Plate Collector',temp:'80–100°C',cr:'1 (no concentration)',color:'#60a5fa',desc:'Glazed/unglazed glass cover + absorber plate + insulation. Best for domestic hot water.'},
    evac:{name:'Evacuated Tube',temp:'150–200°C',cr:'1',color:'#a78bfa',desc:'Vacuum tubes reduce heat loss. Better in cold climates than flat plate.'},
    cpc:{name:'Compound Parabolic (CPC)',temp:'100–200°C',cr:'1.5–10',color:'#f97316',desc:'Low-concentration non-imaging optics. Wider acceptance angle.'},
    fresnel:{name:'Linear Fresnel Reflector',temp:'250–400°C',cr:'10–40',color:'#f97316',desc:'Flat mirror strips approximate parabola. Lower cost than trough.'},
    trough:{name:'Parabolic Trough',temp:'300–550°C',cr:'30–80',color:'#facc15',desc:'Curved parabolic mirror, 1-axis tracking. Most common CSP technology.'},
    tower:{name:'Central Tower (Power Tower)',temp:'500–1000°C',cr:'300–1500',color:'#ef4444',desc:'Heliostat field + central receiver. 2-axis tracking. Highest efficiency.'},
    dish:{name:'Parabolic Dish (Dish Stirling)',temp:'750–1000°C',cr:'1000–3000',color:'#fb7185',desc:'Parabolic dish + Stirling engine at focal point. Highest CR.'}
  };

  function showCollectorC47(type){
    const d=collectorDataC47[type], el=document.getElementById('c47Detail');
    if(!d||!el) return;
    el.style.display='block';
    el.innerHTML='<div style="font-size:11px;color:'+d.color+';font-family:Orbitron,sans-serif;">'+d.name+'</div>'+
      '<div style="font-size:9px;color:#d1d5db;margin-top:4px;">'+d.desc+'</div>'+
      '<div style="display:flex;gap:14px;margin-top:6px;">'+
      '<span style="font-size:9px;color:#9ca3af;">T<sub>max</sub>: <span style="color:'+d.color+';">'+d.temp+'</span></span>'+
      '<span style="font-size:9px;color:#9ca3af;">CR: <span style="color:'+d.color+';">'+d.cr+'</span></span></div>';
  }

  // Temperature ladder
  function initTempLadderC47(){
    const data=[
      {name:'Flat Plate',t:100,color:'#60a5fa'},{name:'Evac Tube',t:200,color:'#a78bfa'},
      {name:'Fresnel',t:400,color:'#f97316'},{name:'Trough',t:550,color:'#facc15'},
      {name:'Tower',t:1000,color:'#ef4444'},{name:'Dish',t:1000,color:'#fb7185'}
    ];
    const el=document.getElementById('c47TempLadder');
    if(!el) return;
    el.innerHTML='';
    data.forEach(d=>{
      const row=document.createElement('div');row.className='pp-temp-row';
      row.innerHTML='<div class="pp-temp-name" style="color:'+d.color+'">'+d.name+'</div>'+
        '<div class="pp-temp-bar pp-m4p3-tbar" style="width:0%;background:'+d.color+';max-width:'+(d.t/10)+'%;" data-tw="'+(d.t/10)+'">'+d.t+'°C</div>';
      el.appendChild(row);
    });
  }
  function animTempBarsC47(){
    document.querySelectorAll('#c47TempLadder .pp-m4p3-tbar').forEach(b=>{b.style.width=b.dataset.tw+'%';});
  }

  // Collector efficiency calculator
  function calcCollectorC47(){
    const fr=parseFloat(document.getElementById('c47FR').value)||0;
    const a=parseFloat(document.getElementById('c47Alpha').value)||0;
    const ul=parseFloat(document.getElementById('c47UL').value)||0;
    const tin=parseFloat(document.getElementById('c47Tin').value)||0;
    const ta=parseFloat(document.getElementById('c47Ta').value)||0;
    const g=parseFloat(document.getElementById('c47G').value)||1;
    const ac=parseFloat(document.getElementById('c47Ac').value)||0;
    const eta=fr*(a - ul*(tin-ta)/g);
    const qu=eta*g*ac;
    document.getElementById('c47CalcResult').textContent='η_c = '+fr.toFixed(2)+'×['+a.toFixed(2)+' − '+ul.toFixed(1)+'×'+(tin-ta).toFixed(0)+'/'+g.toFixed(0)+'] = '+(eta*100).toFixed(1)+'% | Q_u = '+(qu/1000).toFixed(2)+' kW';
  }

  // CR calculator
  function calcCRC47(){
    const aap=parseFloat(document.getElementById('c47Aap').value)||1;
    const arec=parseFloat(document.getElementById('c47Arec').value)||1;
    const alpha=parseFloat(document.getElementById('c47CRAlpha').value)||0;
    const ul=parseFloat(document.getElementById('c47CRUL').value)||1;
    const cr=aap/arec;
    const tmax=25+1000*cr*alpha/ul;
    document.getElementById('c47CRResult').textContent='CR = '+aap+'/'+arec+' = '+cr.toFixed(1)+' | T_max = 25 + 1000×'+cr.toFixed(0)+'×'+alpha+'/'+ul+' = '+tmax.toFixed(0)+'°C';
  }

  // --- c48: Thermal storage toggle ---
  function toggleStorageC48(mode){
    const hf=document.getElementById('c48HotFill'),cf=document.getElementById('c48ColdFill');
    const lbl=document.getElementById('c48StorageLabel'),note=document.getElementById('c48StorageNote');
    const dayBtn=document.getElementById('c48DayBtn'),nightBtn=document.getElementById('c48NightBtn');
    const arr=document.getElementById('c48Arrow'),arr2=document.getElementById('c48Arrow2');
    if(mode==='day'){
      hf.style.height='80%';cf.style.height='20%';
      lbl.textContent='Day: Charging ☀️';note.textContent='HTF heats molten salt → hot tank fills';
      dayBtn.style.background='#facc15';dayBtn.style.color='#000';dayBtn.style.border='none';
      nightBtn.style.background='rgba(96,165,250,0.2)';nightBtn.style.color='#60a5fa';nightBtn.style.border='1px solid #60a5fa';
      arr.textContent='→';arr2.textContent='→';
    } else {
      hf.style.height='20%';cf.style.height='80%';
      lbl.textContent='Night: Discharging 🌙';note.textContent='Hot salt → HTF → steam → power continues!';note.style.color='#00ff88';
      nightBtn.style.background='#60a5fa';nightBtn.style.color='#000';nightBtn.style.border='none';
      dayBtn.style.background='rgba(250,204,21,0.2)';dayBtn.style.color='#facc15';dayBtn.style.border='1px solid #facc15';
      arr.textContent='←';arr2.textContent='←';
    }
  }

  // LMTD calculator
  function calcLMTDC48(){
    const dt1=parseFloat(document.getElementById('c48DT1').value)||1;
    const dt2=parseFloat(document.getElementById('c48DT2').value)||1;
    const u=parseFloat(document.getElementById('c48U').value)||0;
    const a=parseFloat(document.getElementById('c48AHX').value)||0;
    if(dt1<=0||dt2<=0){document.getElementById('c48LMTDResult').textContent='ΔT values must be > 0';return;}
    const lmtd=Math.abs(dt1-dt2)/Math.log(dt1/dt2);
    const qhx=u*a*lmtd;
    document.getElementById('c48LMTDResult').textContent='LMTD = ('+dt1+'−'+dt2+')/ln('+dt1+'/'+dt2+') = '+lmtd.toFixed(1)+'°C | Q_HX = '+u+'×'+a+'×'+lmtd.toFixed(1)+' = '+(qhx/1000).toFixed(1)+' kW';
  }

  // CSP power output
  function calcCSPC48(){
    const g=parseFloat(document.getElementById('c48GDNI').value)||0;
    const ac=parseFloat(document.getElementById('c48Acoll').value)||0;
    const eo=(parseFloat(document.getElementById('c48EtaOpt').value)||0)/100;
    const et=(parseFloat(document.getElementById('c48EtaTh').value)||0)/100;
    const p=g*ac*eo*et;
    document.getElementById('c48CSPResult').textContent='P = '+g+'×'+ac+'×'+eo.toFixed(2)+'×'+et.toFixed(2)+' = '+(p/1e6).toFixed(2)+' MW ('+(p/1000).toFixed(0)+' kW)';
  }

  // --- c49: Drawback bars ---
  function initDrawbacksC49(){
    const data=[
      {label:'Energy density',pct:15,color:'#ef4444',val:'~0.2 kW/m²',solution:'Large area needed'},
      {label:'Night time',pct:0,color:'#ef4444',val:'0 W at night',solution:'Storage / Grid'},
      {label:'Cloudy day',pct:25,color:'#f97316',val:'~0.2 kW/m²',solution:'Diffuse still works'},
      {label:'Storage cost',pct:60,color:'#ef4444',val:'High $/kWh',solution:'Molten salt (CSP)'}
    ];
    const el=document.getElementById('c49Drawbacks');
    if(!el) return;
    el.innerHTML='';
    data.forEach(d=>{
      const row=document.createElement('div');row.className='pp-drawback-row';
      row.innerHTML='<div class="pp-drawback-label" style="color:'+d.color+'">'+d.label+'</div>'+
        '<div class="pp-drawback-track"><div class="pp-drawback-fill pp-m4p3-dbar" style="width:0%;background:'+d.color+';" data-dw="'+d.pct+'">'+d.val+'</div></div>'+
        '<div class="pp-drawback-solution">✅ '+d.solution+'</div>';
      el.appendChild(row);
    });
  }
  function animDrawbarsC49(){
    document.querySelectorAll('#c49Drawbacks .pp-m4p3-dbar').forEach(b=>{b.style.width=b.dataset.dw+'%';});
  }

  // Heliostat field calculator
  function calcHelioC49(){
    const p=(parseFloat(document.getElementById('c49Ptower').value)||0)*1e6;
    const g=parseFloat(document.getElementById('c49GDNI').value)||1;
    const eta=(parseFloat(document.getElementById('c49Eta').value)||1)/100;
    const am=parseFloat(document.getElementById('c49Amirror').value)||1;
    const atotal=p/(g*eta);
    const n=Math.ceil(atotal/am);
    document.getElementById('c49HelioResult').textContent='A_total = '+(p/1e6).toFixed(0)+'MW / ('+g+'×'+eta.toFixed(2)+') = '+Math.round(atotal).toLocaleString()+' m² | N = '+n.toLocaleString()+' heliostats';
  }

  // Panel area calculator
  function calcAreaC49(){
    const p=parseFloat(document.getElementById('c49Pdesired').value)||0;
    const eta=(parseFloat(document.getElementById('c49PanelEta').value)||1)/100;
    const a=p*1000/(1000*eta);
    document.getElementById('c49AreaResult').textContent='A = '+p+'kW / (1000×'+eta.toFixed(3)+') = '+a.toFixed(1)+' m² ('+(a/10000).toFixed(3)+' ha)';
    const viz=document.getElementById('c49AreaViz');
    if(viz){
      viz.style.display='flex';
      const squares=Math.min(Math.round(a),40);
      let html='<div class="pp-area-block">';
      for(let i=0;i<squares;i++) html+='<div class="pp-area-sq filled"></div>';
      html+='</div><div class="pp-area-label">'+a.toFixed(0)+' m² = '+squares+' panels shown</div>';
      viz.innerHTML=html;
    }
  }

  // --- c50: Flashcard quiz ---
  const flashcardsC50=[
    {q:'What is a typical solar cell efficiency?',a:'≈ 15%'},
    {q:'1 kW peak power needs how much area?',a:'8 m²'},
    {q:'90% of solar cells are made of?',a:'Silicon (Si)'},
    {q:'Best collector temperature?',a:'Dish Stirling: 750–1000°C'},
    {q:'Solar constant value?',a:'1367 W/m²'},
    {q:'Band gap of Silicon?',a:'1.12 eV'},
    {q:'Shockley-Queisser limit?',a:'33.7%'},
    {q:'Earth solar energy per day?',a:'120 × 10¹⁵ W'},
    {q:'Shape of monocrystalline cell?',a:'Octagonal'},
    {q:'CSP thermal storage hours?',a:'6–15 hours (molten salt)'}
  ];
  let c50Idx=0;
  function renderFlashC50(){
    const fc=flashcardsC50[c50Idx];
    document.getElementById('c50Q').textContent=fc.q;
    document.getElementById('c50A').textContent=fc.a;
    document.getElementById('c50Card').classList.remove('revealed');
    document.getElementById('c50Counter').textContent=(c50Idx+1)+' / '+flashcardsC50.length;
  }
  function revealFlashC50(){document.getElementById('c50Card').classList.toggle('revealed');}
  function nextFlashC50(){c50Idx=(c50Idx+1)%flashcardsC50.length;renderFlashC50();}
  function prevFlashC50(){c50Idx=(c50Idx-1+flashcardsC50.length)%flashcardsC50.length;renderFlashC50();}

  // Temperature ladder for c50
  function initTempLadderC50(){
    const data=[
      {name:'FPC',t:80,color:'#60a5fa'},{name:'Evac Tube',t:200,color:'#a78bfa'},
      {name:'Fresnel',t:300,color:'#f97316'},{name:'Trough',t:400,color:'#facc15'},
      {name:'Tower',t:600,color:'#ef4444'},{name:'Dish',t:900,color:'#fb7185'}
    ];
    const el=document.getElementById('c50TempLadder');
    if(!el) return;
    el.innerHTML='';
    data.forEach(d=>{
      const row=document.createElement('div');row.className='pp-temp-row';
      row.innerHTML='<div class="pp-temp-name" style="color:'+d.color+'">'+d.name+'</div>'+
        '<div class="pp-temp-bar pp-m4p3-t50bar" style="width:0%;background:'+d.color+';" data-tw="'+(d.t/10)+'">'+d.t+'°C</div>';
      el.appendChild(row);
    });
  }
  function animTempBarsC50(){
    document.querySelectorAll('#c50TempLadder .pp-m4p3-t50bar').forEach(b=>{b.style.width=b.dataset.tw+'%';});
  }

  // Area calculator for c50
  function calcAreaC50(){
    const p=parseFloat(document.getElementById('c50Power').value)||0;
    const a=p*8;
    document.getElementById('c50AreaResult').textContent='Area = '+p+' × 8 = '+a.toLocaleString()+' m² = '+(a/10000).toFixed(2)+' ha';
  }

  // --- M4P3 IntersectionObserver ---
  const m4p3Observer=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const id=e.target.id;
      if(id==='c46'){initBalanceC46();initEtaGaugeC46();}
      if(id==='c47'){initTempLadderC47();setTimeout(animTempBarsC47,400);}
      if(id==='c48'){/* CSP SVG auto-animates */}
      if(id==='c49'){initDrawbacksC49();setTimeout(animDrawbarsC49,400);}
      if(id==='c50'){renderFlashC50();initTempLadderC50();setTimeout(animTempBarsC50,400);}
    });
  },{threshold:0.15});

  // Observe Module 4 Part 3 cards
  document.querySelectorAll('#c46,#c47,#c48,#c49,#c50').forEach(c => m4p3Observer.observe(c));

  // ══════════ GLASSMORPHISM SIDEBAR & MODULE SWITCHING ══════════
  (function initPPSidebar(){
    var sidebar = document.getElementById('ppSidebar');
    var overlay = document.getElementById('ppSbOverlay');
    var toggle = document.getElementById('ppSbToggle');
    var closeBtn = document.getElementById('ppSbClose');
    var links = document.querySelectorAll('.pp-sidebar__link[data-mod]');
    var allCards = document.querySelectorAll('.pp-card[id^="c"]');
    var allDividers = document.querySelectorAll('.pp-module-divider');
    var mainEl = document.querySelector('.pp-main');

    // Module-to-card mapping
    var moduleCards = {
      1: ['c1','c2','c3','c4','c5'],
      2: ['c6','c7','c8','c9','c10','c11','c12','c13'],
      3: ['c14','c15','c16','c17','c18','c19','c20','c21'],
      4: ['c22','c23'],
      5: ['c24','c25','c26','c27','c28','c29','c30','c31','c32','c33'],
      6: ['c34'],
      7: ['c35','c36'],
      8: ['c37','c38','c39','c40','c41','c42','c43','c44','c45'],
      9: ['c46','c47','c48','c49','c50'],
      10: ['c51','c52','c53','c54','c55','c56']
    };

    var moduleNames = {
      1: '\u26a1 Module 1 \u2014 Power Systems',
      2: '\ud83d\udca7 Module 2 \u2014 Hydro Power',
      3: '\ud83d\udd25 Module 3 \u2014 Thermal Steam',
      4: '\u26cf\ufe0f Module 4 \u2014 Coal & Fuels',
      5: '\u2622\ufe0f Module 5 \u2014 Nuclear Power',
      6: '\ud83d\udee2\ufe0f Module 6 \u2014 Diesel Power',
      7: '\ud83c\udf00 Module 7 \u2014 Gas Turbine',
      8: '\u2600\ufe0f Module 8 \u2014 Solar Energy',
      9: '\ud83c\udf21\ufe0f Module 9 \u2014 Solar Collectors',
      10: '\ud83c\udf0b Module 10 \u2014 Geothermal & MHD'
    };

    var moduleColors = {
      1:'#f97316', 2:'#60a5fa', 3:'#ef4444', 4:'#f97316',
      5:'#a78bfa', 6:'#f97316', 7:'#f97316', 8:'#facc15', 9:'#facc15', 10:'#00f5ff'
    };

    var currentModule = 0; // 0 = show all

    // Open / Close sidebar
    function openSidebar(){ sidebar.classList.add('open'); overlay.classList.add('open'); }
    function closeSidebar(){ sidebar.classList.remove('open'); overlay.classList.remove('open'); }

    if(toggle) toggle.addEventListener('click', function(){
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    if(closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if(overlay) overlay.addEventListener('click', closeSidebar);

    // Switch module
    function switchModule(modNum){
      modNum = parseInt(modNum);
      currentModule = modNum;

      // Remove existing header
      var oldHdr = mainEl.querySelector('.pp-module-active-header');
      if(oldHdr) oldHdr.remove();

      if(modNum === 0){
        // Show ALL
        allCards.forEach(function(c){ c.classList.remove('pp-mod-hidden'); });
        allDividers.forEach(function(d){ d.classList.remove('pp-mod-hidden'); });
      } else {
        var visibleIds = {};
        (moduleCards[modNum] || []).forEach(function(id){ visibleIds[id] = true; });

        // Hide/show cards
        allCards.forEach(function(c){
          if(visibleIds[c.id]) { c.classList.remove('pp-mod-hidden'); }
          else { c.classList.add('pp-mod-hidden'); }
        });

        // Hide all module dividers in single-module view
        allDividers.forEach(function(d){ d.classList.add('pp-mod-hidden'); });

        // Insert module header
        var hdr = document.createElement('div');
        hdr.className = 'pp-module-active-header';
        hdr.style.setProperty('--mod-hdr-color', moduleColors[modNum] || '#facc15');
        hdr.innerHTML = '<h2>' + (moduleNames[modNum] || 'Module ' + modNum) + '</h2>' +
                        '<p>' + (moduleCards[modNum]||[]).length + ' cards</p>';
        mainEl.insertBefore(hdr, mainEl.firstChild);
      }

      // Update sidebar active link
      links.forEach(function(l){
        if(parseInt(l.dataset.mod) === modNum) { l.classList.add('active'); }
        else { l.classList.remove('active'); }
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-render KaTeX
      if(typeof renderMathInElement === 'function'){
        setTimeout(function(){
          renderMathInElement(document.body, {
            delimiters:[
              {left:'$$',right:'$$',display:true},
              {left:'$',right:'$',display:false}
            ],
            throwOnError: false
          });
        }, 150);
      }

      closeSidebar();
    }

    // Link click handlers
    links.forEach(function(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        switchModule(this.dataset.mod);
      });
    });

    // Keyboard shortcut: Ctrl+B to toggle sidebar
    document.addEventListener('keydown', function(e){
      if(e.ctrlKey && e.key === 'b'){
        e.preventDefault();
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
      }
    });

    // Show all modules by default on load
    switchModule(0);
  })();
  

  (function(){
    document.querySelectorAll('.pp-card').forEach(function(card, i){
      var id = card.id || ('card-' + i);
      var btn = document.createElement('div');
      btn.className = 'pp-bm-corner';
      btn.title = 'Bookmark';
      btn.innerHTML = '<svg viewBox="0 0 32 46" xmlns="http://www.w3.org/2000/svg"><path class="bm-ribbon" d="M0 0 H32 V46 L16 35 L0 46 Z" fill="#dc2626"/></svg>';
      btn.addEventListener('click', function(){
        var saved = btn.classList.toggle('saved');
        btn.title = saved ? 'Saved!' : 'Bookmark';
        localStorage.setItem('bm_pp_' + id, saved ? '1' : '');
      });
      if (localStorage.getItem('bm_pp_' + id) === '1') btn.classList.add('saved');
      card.appendChild(btn);
    });
  })();
  

  // === MODULE 10 INITIALIZATION ===
  (function(){
    // ── Geothermal Resources (Earth Section) ──
    const geoZone = d3.select('#animation-geo-resources');
    if(geoZone.node()){
      const svg = geoZone.append('svg').attr('width','100%').attr('height','100%').attr('viewBox','0 0 400 260');
      const centerX = 200, centerY = 280;
      const layers = [
        {name:'Surface', c:'#22c55e', r:145, temp:25},
        {name:'Crust', c:'#9ca3af', r:140, temp:500},
        {name:'Upper Mantle', c:'#fbbf24', r:120, temp:1000},
        {name:'Lower Mantle', c:'#f97316', r:80, temp:3000},
        {name:'Core', c:'#ef4444', r:40, temp:6000}
      ];
      layers.forEach(l => { svg.append('circle').attr('cx',centerX).attr('cy',centerY).attr('r',l.r * 1.5).attr('fill',l.c); });

      // Labels for layers
      const labelData = [
        {text:'Core', y:140, color:'#ef4444'},
        {text:'Mantle', y:100, color:'#fbbf24'},
        {text:'Crust', y:70, color:'#9ca3af'}
      ];
      labelData.forEach(l => {
        svg.append('text').attr('x',320).attr('y',l.y).attr('fill',l.color)
          .attr('font-size','10px').attr('font-family','Orbitron').text(l.text);
      });

      const borehole = svg.append('line').attr('x1',centerX).attr('y1',80).attr('x2',centerX).attr('y2',90).attr('stroke','#facc15').attr('stroke-width',4);

      // Enhanced Depth Calculator with Surface Temp
      const slider = document.getElementById('depth-slider-main');
      const surfaceInput = document.getElementById('t-surface-main');
      const res = document.getElementById('t-depth-result-main');
      if(slider && res){
        const updateGeoCalc = () => {
          const d = parseFloat(slider.value);
          const ts = surfaceInput ? parseFloat(surfaceInput.value) : 25;
          const g = 30; // 30°C/km
          const td = ts + g * d;
          res.innerText = `At ${d} km: T ≈ ${td.toFixed(1)}°C`;
          borehole.attr('y2', 90 + d * 15);
        };
        slider.oninput = updateGeoCalc;
        if(surfaceInput) surfaceInput.oninput = updateGeoCalc;
        updateGeoCalc();
      }
    }

    // ── Geothermal Plant (High Fidelity SVG) ──
    const plantZone = d3.select('#animation-geo-plant');
    if(plantZone.node()){
      const svg = plantZone.append('svg').attr('width','100%').attr('height','100%').attr('viewBox','0 0 500 240');

      // Ground Level
      svg.append('line').attr('x1',0).attr('y1',200).attr('x2',500).attr('y2',200).attr('stroke','#4b5563').attr('stroke-width',2);

      // Production Well
      svg.append('rect').attr('x',30).attr('y',180).attr('width',20).attr('height',20).attr('fill','#374151');
      svg.append('text').attr('x',10).attr('y',220).attr('fill','#9ca3af').attr('font-size','9px').attr('font-family','Orbitron').text('Prod Well');

      // Injection Well
      svg.append('rect').attr('x',400).attr('y',180).attr('width',20).attr('height',20).attr('fill','#374151');
      svg.append('text').attr('x',380).attr('y',220).attr('fill','#9ca3af').attr('font-size','9px').attr('font-family','Orbitron').text('Inj Well');

      // Turbine House
      svg.append('rect').attr('x',120).attr('y',60).attr('width',100).attr('height',60).attr('fill','rgba(31,41,55,0.8)').attr('stroke','#4b5563');
      svg.append('path').attr('d','M120,60 L170,30 L220,60').attr('fill','#111827').attr('stroke','#4b5563');
      svg.append('circle').attr('cx',170).attr('cy',90).attr('r',20).attr('fill','none').attr('stroke','#00f5ff').attr('stroke-dasharray','4,2');

      // Cooling Tower
      svg.append('path').attr('d','M300,200 L320,80 L380,80 L400,200 Z').attr('fill','rgba(31,41,55,0.6)').attr('stroke','#4b5563');
      svg.append('path').attr('d','M320,80 Q350,60 380,80').attr('fill','none').attr('stroke','#9ca3af');

      // Steam Pipes
      const steamPath = svg.append('path').attr('d','M40,180 L40,100 L120,100').attr('fill','none').attr('stroke','#f97316').attr('stroke-width',3).attr('stroke-dasharray','6,6');
      const waterPath = svg.append('path').attr('d','M220,110 L300,110 M350,200 L350,220 L410,220 L410,200').attr('fill','none').attr('stroke','#3b82f6').attr('stroke-width',2).attr('stroke-dasharray','4,4');

      // Alternator Label
      svg.append('rect').attr('x',230).attr('y',80).attr('width',50).attr('height',30).attr('fill','#fbbf24').attr('rx',3);
      svg.append('text').attr('x',238).attr('y',100).attr('fill','black').attr('font-size','8px').attr('font-family','Orbitron').text('GEN');

      // Animations
      gsap.to(steamPath.node(), { strokeDashoffset:-60, repeat:-1, duration:1.5, ease:'none' });
      gsap.to(waterPath.node(), { strokeDashoffset:48, repeat:-1, duration:2, ease:'none' });
      gsap.to(svg.select('circle').node(), { rotation:360, transformOrigin:'center', repeat:-1, duration:3, ease:'none' });

      // Steam clouds from cooling tower
      const clouds = svg.append('g');
      setInterval(() => {
        const c = clouds.append('circle').attr('cx',350).attr('cy',80).attr('r',5).attr('fill','white').attr('opacity',0.4);
        gsap.to(c.node(), { y:-40, x:360+Math.random()*20, opacity:0, duration:2, onComplete:()=>c.remove() });
      }, 1000);
    }

    // ── Carnot Efficiency Calculator (Interactive) ──
    const thInput = document.getElementById('t-high-main');
    const tlInput = document.getElementById('t-low-main');
    const etaRes = document.getElementById('eta-result-main');
    if(thInput && tlInput && etaRes){
      const updateEta = () => {
        const th = parseFloat(thInput.value) + 273.15;
        const tl = parseFloat(tlInput.value) + 273.15;
        const eta = ((1 - tl / th) * 100).toFixed(1);
        etaRes.innerText = `η ≈ ${eta}%`;
      };
      thInput.oninput = updateEta;
      tlInput.oninput = updateEta;
      updateEta();
    }

    // ── MHD Channel (Enhanced Visualization) ──
    const mhdZone = d3.select('#animation-mhd-channel');
    if(mhdZone.node()){
      const svg = mhdZone.append('svg').attr('width','100%').attr('height','100%').attr('viewBox','0 0 500 240');
      // Channel
      svg.append('rect').attr('x',50).attr('y',60).attr('width',400).attr('height',120).attr('fill','#1f2937').attr('stroke','#374151');
      // Magnets
      svg.append('rect').attr('x',50).attr('y',20).attr('width',400).attr('height',40).attr('fill','#3b82f6').attr('opacity',0.6);
      svg.append('text').attr('x',230).attr('y',45).attr('fill','white').attr('font-size','12px').attr('font-family','Orbitron').text('N');
      svg.append('rect').attr('x',50).attr('y',180).attr('width',400).attr('height',40).attr('fill','#ef4444').attr('opacity',0.6);
      svg.append('text').attr('x',230).attr('y',205).attr('fill','white').attr('font-size','12px').attr('font-family','Orbitron').text('S');

      // Magnetic field arrows
      for(let i=100; i<450; i+=100) {
        svg.append('line').attr('x1',i).attr('y1',60).attr('x2',i).attr('y2',180).attr('stroke','#60a5fa').attr('stroke-width',1).attr('stroke-dasharray','4,4').attr('opacity',0.4);
      }

      // Particles
      const parts = svg.append('g');
      setInterval(() => {
        const isPos = Math.random() > 0.5;
        const p = parts.append('circle').attr('cx',50).attr('cy',80+Math.random()*80).attr('r',3).attr('fill',isPos?'#ef4444':'#60a5fa');
        gsap.to(p.node(),{ x:400, y:isPos?-30:30, duration:2, ease:'none', onComplete:()=>p.remove() });
      }, 250);
    }

    // ── MHD Combined Cycle ──
    const combZone = d3.select('#animation-mhd-combined');
    if(combZone.node()){
      const svg = combZone.append('svg').attr('width','100%').attr('height','100%').attr('viewBox','0 0 500 220');
      const comps = [{x:20,n:"MHD",c:'#00f5ff'},{x:140,n:"Boiler",c:'#f97316'},{x:260,n:"Steam",c:'#fbbf24'},{x:380,n:"Gen",c:'#00ff88'}];
      svg.selectAll('.comp').data(comps).enter().append('rect').attr('x',d=>d.x).attr('y',80).attr('width',80).attr('height',50).attr('fill',d=>d.c).attr('rx',5).attr('opacity',0.85);
      svg.selectAll('.label').data(comps).enter().append('text').attr('x',d=>d.x+10).attr('y',110).attr('fill','black').attr('font-size','10px').attr('font-family','Orbitron').text(d=>d.n);

      // Flow arrows between components
      const arrows = [{x1:100,x2:140},{x1:220,x2:260},{x1:340,x2:380}];
      arrows.forEach(a => {
        const arrow = svg.append('line').attr('x1',a.x1).attr('y1',105).attr('x2',a.x2).attr('y2',105).attr('stroke','rgba(255,255,255,0.5)').attr('stroke-width',2).attr('stroke-dasharray','6,4');
        gsap.to(arrow.node(), { strokeDashoffset:-40, repeat:-1, duration:1, ease:'none' });
      });

      // Temperature labels
      svg.append('text').attr('x',40).attr('y',70).attr('fill','#ef4444').attr('font-size','9px').attr('font-family','Orbitron').text('2700°C');
      svg.append('text').attr('x',160).attr('y',70).attr('fill','#f97316').attr('font-size','9px').attr('font-family','Orbitron').text('900°C');
      svg.append('text').attr('x',280).attr('y',70).attr('fill','#fbbf24').attr('font-size','9px').attr('font-family','Orbitron').text('540°C');
      svg.append('text').attr('x',400).attr('y',70).attr('fill','#00ff88').attr('font-size','9px').attr('font-family','Orbitron').text('Output');
    }

    // ── MHD EMF Calculator ──
    const mhdB = document.getElementById('mhd-b-main');
    const mhdV = document.getElementById('mhd-v-main');
    const mhdE = document.getElementById('mhd-emf-result-main');
    if(mhdB && mhdV && mhdE){
      const updateMHD = () => {
        const b = parseFloat(mhdB.value);
        const v = parseFloat(mhdV.value);
        mhdE.innerText = `E = ${(b * v * 0.5).toFixed(0)}V (B=${b}T, v=${v}m/s)`;
      };
      mhdB.oninput = updateMHD;
      mhdV.oninput = updateMHD;
      updateMHD();
    }

    // ── India Geothermal Map (Enhanced with Site Names) ──
    const statsZone = d3.select('#animation-geo-stats');
    if(statsZone.node()){
      const svg = statsZone.append('svg').attr('width','100%').attr('height','100%').attr('viewBox','0 0 400 260');
      svg.append('path').attr('d', "M180,20 L220,40 L230,100 L200,200 L120,220 L100,100 L130,50 Z").attr('fill','#1f2937').attr('stroke','#4b5563');
      const sites = [
        {name:"Puga Valley, Ladakh", lon:78.4, lat:33.2, t:84},
        {name:"Tattapani, MP", lon:82.5, lat:23.4, t:90},
        {name:"Manikaran, HP", lon:77.3, lat:32.0, t:95},
        {name:"Cambay, Gujarat", lon:72.6, lat:22.3, t:80},
        {name:"Bakreshwar, WB", lon:87.4, lat:23.9, t:89}
      ];
      sites.forEach(s => {
        const cx = (s.lon-68)*14 + 50;
        const cy = 260 - (s.lat-8)*8;
        svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5).attr('fill','#00f5ff')
          .attr('style','cursor:pointer;')
          .on('mouseover', function(){ d3.select(this).attr('r',8); })
          .on('mouseout', function(){ d3.select(this).attr('r',5); });
        svg.append('text').attr('x', cx+8).attr('y', cy+4).attr('fill','#9ca3af').attr('font-size','8px').text(s.name);
      });
      // Title
      svg.append('text').attr('x',200).attr('y',15).attr('fill','#00f5ff').attr('font-size','11px').attr('font-family','Orbitron').attr('text-anchor','middle').text('India Geothermal Sites');
    }

    // ── Master Quiz (10 Questions — merged from module10) ──
    const questions = [
        { q: "Most abundant geothermal source?", a: ["Hydrothermal", "Petrothermal", "Geopressured", "Volcanic"], c: 1 },
        { q: "Typical efficiency of geothermal plants?", a: ["30-40%", "7-10%", "2-5%", "50-60%"], c: 1 },
        { q: "Best seeding agent for MHD?", a: ["Potassium", "Sodium", "Cesium", "Argon"], c: 2 },
        { q: "MHD gas velocity required?", a: ["100 m/s", "500 m/s", "1000 m/s", "5000 m/s"], c: 2 },
        { q: "India's most promising geothermal site?", a: ["Cambay", "Puga Valley", "Tattapani", "Bakreshwar"], c: 1 },
        { q: "Lorentz Force formula?", a: ["F = ma", "F = qvB", "F = BIL", "F = qE"], c: 1 },
        { q: "MHD output power is proportional to?", a: ["v", "v²", "√v", "1/v"], c: 1 },
        { q: "Geothermal gradient (°C/km)?", a: ["10-15", "25-30", "50-60", "100+"], c: 1 },
        { q: "MHD Combined cycle efficiency?", a: ["40%", "58%", "80%", "95%"], c: 1 },
        { q: "Cesium is used in MHD to increase?", a: ["Velocity", "Temperature", "Conductivity", "Pressure"], c: 2 }
    ];
    let currentQ = 0;
    const qText = document.getElementById('quiz-question-main');
    const qOpts = document.getElementById('quiz-options-main');
    const startBtn = document.getElementById('start-quiz-btn-main');

    function loadQuestion() {
      if(currentQ >= questions.length){
        qText.innerText = "Quiz Completed! Well Done! 🎉";
        qOpts.innerHTML = `<button class="pp-hero-cta" onclick="location.reload()" style="grid-column: span 2; border-color:#00ff88; color:#00ff88;">Restart</button>`;
        return;
      }
      const data = questions[currentQ];
      qText.innerText = `Q${currentQ+1}/${questions.length}: ${data.q}`;
      qOpts.innerHTML = '';
      data.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'pp-hero-cta';
        btn.style.fontSize = '10px';
        btn.style.padding = '8px 12px';
        btn.innerText = opt;
        btn.onclick = () => {
          if(i === data.c){
            btn.style.borderColor = '#00ff88'; btn.style.color = '#00ff88';
            setTimeout(() => { currentQ++; loadQuestion(); }, 600);
          } else {
            btn.style.borderColor = '#ef4444'; btn.style.color = '#ef4444';
          }
        };
        qOpts.appendChild(btn);
      });
    }
    if(startBtn) startBtn.onclick = loadQuestion;
  })();