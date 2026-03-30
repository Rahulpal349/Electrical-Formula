/* =========================================================
   MODULE 10 PART 2 JAVASCRIPT
   MHD, Fuel Cells, Thermoelectricity
========================================================= */

// Utils
const $id = id => document.getElementById(id);

/* --- 1. MHD DUCT CALCULATOR & ANIMATION --- */
function updateMHDCalc() {
  const B = parseFloat($id('mhd-b').value);
  const v = parseFloat($id('mhd-v').value);
  const d = parseFloat($id('mhd-d').value);
  
  $id('mhd-b-val').textContent = B.toFixed(1) + ' T';
  $id('mhd-v-val').textContent = v + ' m/s';
  $id('mhd-d-val').textContent = d.toFixed(1) + ' m';
  
  const E = B * v * d;
  
  // Power approximation: somewhat proportional to B^2 * v^2 for fun illustrative purposes
  // Real formula P = sigma * v^2 * B^2 * V_ch
  const sigma = 10; // conductivity
  const vol = d * 1 * 0.5; // channel volume approx
  const P = sigma * (v*v) * (B*B) * vol / 1000; // in kW
  
  if($id('mhd-emf-out')) $id('mhd-emf-out').textContent = `E = ${E.toLocaleString()} V`;
  if($id('mhd-kw-out')) $id('mhd-kw-out').textContent = `P = ${Math.round(P).toLocaleString()} kW`;
}
['mhd-b','mhd-v','mhd-d'].forEach(id => {
  if($id(id)) $id(id).addEventListener('input', updateMHDCalc);
});

// MHD Particles Animation
function spawnMHDParticle() {
  const g = $id('mhd-particles');
  if(!g) return;
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  p.setAttribute('cy', 85 + Math.random()*90);
  p.setAttribute('cx', 200);
  p.setAttribute('r', 1.5 + Math.random()*2);
  p.setAttribute('fill', Math.random() > 0.5 ? '#facc15' : '#ef4444');
  g.appendChild(p);

  const speed = 2 + (parseFloat($id('mhd-v')?.value || 1500) / 1000) * 1.5;
  
  gsap.to(p, {
    attr: { cx: 600 },
    duration: 3 / speed,
    ease: "none",
    onComplete: () => p.remove()
  });
}
if($id('mhd-particles')) {
  setInterval(spawnMHDParticle, 50);
  updateMHDCalc();
}

// Open/Closed Tabs
const mhdOpenBtn = $id('mhd-open-btn');
const mhdClosedBtn = $id('mhd-closed-btn');
const mhdCycleDesc = $id('mhd-cycle-desc');
if(mhdOpenBtn && mhdClosedBtn) {
  mhdOpenBtn.onclick = () => {
    mhdOpenBtn.classList.add('active-cyan'); mhdClosedBtn.classList.remove('active-cyan');
    mhdCycleDesc.innerHTML = 'Combustion Chamber → Nozzle → MHD Duct → Pre-heater → Seed Recovery Unit → Exhaust';
  };
  mhdClosedBtn.onclick = () => {
    mhdClosedBtn.classList.add('active-cyan'); mhdOpenBtn.classList.remove('active-cyan');
    mhdCycleDesc.innerHTML = 'Nuclear/Heat Source → Heat Exchanger → MHD Generator → Cooler/Condenser → Compressor → (Recirculate Noble Gas)';
  };
}

/* --- 2. FUEL CELL CALCULATOR & ANIMATION --- */
function updateFCCalc() {
  const i = parseFloat($id('fc-i').value);
  const r = parseFloat($id('fc-r').value);
  
  $id('fc-i-val').textContent = i + ' mA/cm²';
  $id('fc-r-val').textContent = r.toFixed(1) + ' Ω·cm²';
  
  // V = 1.23 - activation_loss - ohmic_loss
  // Simplified for illustration
  const v_ohm = (i / 1000) * r; // A/cm2 * ohm*cm2 = V
  const v_act = 0.05 + 0.1 * Math.log10(i/10); 
  
  let V = 1.23 - v_act - v_ohm - 0.05; // -0.05 conc
  if(V < 0) V = 0;
  
  const refTempVolt = 1.48; // lower heating value voltage ref
  const eff = (V / refTempVolt) * 100;
  
  if($id('fc-res')){
    $id('fc-res').innerHTML = `Vcell = ${V.toFixed(2)} V<br>η: ${eff.toFixed(1)}%`;
  }
}
['fc-i','fc-r'].forEach(id => {
  if($id(id)) $id(id).addEventListener('input', updateFCCalc);
});
if($id('fc-i')) updateFCCalc();

// Fuel Cell Tabs
function updateFCType(type) {
  const tabs = document.querySelectorAll('#c58 .pill-tab');
  tabs.forEach(t => {
    if(t.textContent === type) t.classList.add('active-cyan');
    else t.classList.remove('active-cyan');
  });
  
  const desc = $id('fc-type-desc');
  const types = {
    'PEMFC': '<strong>PEMFC (Polymer Electrolyte)</strong> | Temp: 60-80°C | App: Vehicles, portable, zero emissions.',
    'AFC': '<strong>AFC (Alkaline)</strong> | Temp: 60-220°C | App: Space shuttles, submarines. Sensitive to CO2.',
    'PAFC': '<strong>PAFC (Phosphoric Acid)</strong> | Temp: 150-200°C | App: Commercial buildings, stationary power.',
    'MCFC': '<strong>MCFC (Molten Carbonate)</strong> | Temp: 600-700°C | App: Utility power, high temp uses CO2 + O2.',
    'SOFC': '<strong>SOFC (Solid Oxide)</strong> | Temp: 800-1000°C | App: Large continuous power, CHP, very high efficiency.',
    'DMFC': '<strong>DMFC (Direct Methanol)</strong> | Temp: 60-130°C | App: Portable electronics, small military devices.'
  };
  if(desc) desc.innerHTML = types[type] || '';
  
  // Change electrolyte color visualization
  const svg = $id('fc-svg');
  if(svg) {
    const elRect = svg.querySelector('rect[fill="#a78bfa"]');
    if(elRect) {
      if(type==='PEMFC' || type==='DMFC') elRect.setAttribute('fill', '#00f5ff');
      else if(type==='SOFC' || type==='MCFC') elRect.setAttribute('fill', '#ef4444');
      else elRect.setAttribute('fill', '#a78bfa');
    }
  }
}

// FC Particles
function spawnFCParticles() {
  const gH2 = $id('fc-h2-particles');
  const gHP = $id('fc-hplus-particles');
  const gE = $id('fc-e-particles');
  if(!gH2) return;

  // H2 moving right into anode
  const h2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  h2.setAttribute('cx', 150); h2.setAttribute('cy', 80 + Math.random()*40); h2.setAttribute('r', 2); h2.setAttribute('fill', '#60a5fa');
  gH2.appendChild(h2);
  gsap.to(h2, { attr:{cx:245}, duration:1.5, onComplete: () => h2.remove() });

  // H+ migrating through electrolyte
  const hp = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hp.setAttribute('cx', 270); hp.setAttribute('cy', 45 + Math.random()*170); hp.setAttribute('r', 1.5); hp.setAttribute('fill', '#00f5ff');
  gHP.appendChild(hp);
  gsap.to(hp, { attr:{cx:525}, duration:2.5, ease:"power1.inOut", onComplete: () => hp.remove() });

  // Electron flowing external circuit (left to right)
  const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  e.setAttribute('r', 2); e.setAttribute('fill', '#00ff88');
  gE.appendChild(e);
  
  // Path: 265,40 -> 265,15 -> 535,15 -> 535,40
  const tl = gsap.timeline({onComplete: () => e.remove()});
  tl.set(e, {attr:{cx:265, cy:40}})
    .to(e, {attr:{cy:15}, duration:0.3})
    .to(e, {attr:{cx:535}, duration:1.0})
    .to(e, {attr:{cy:40}, duration:0.3});
}
if($id('fc-h2-particles')) setInterval(spawnFCParticles, 150);


/* --- 3. THERMOELECTRIC TAB/CALCULATOR --- */
function updateTECalc() {
  const a = parseFloat($id('te-alpha').value);
  const th = parseFloat($id('te-th').value);
  const tc = parseFloat($id('te-tc').value);
  
  $id('te-alpha-val').textContent = a + ' μV/K';
  $id('te-th-val').textContent = th + ' °C';
  $id('te-tc-val').textContent = tc + ' °C';
  
  const E = (a * (th - tc)) / 1000; // in mV
  if($id('te-res')) $id('te-res').textContent = `EMF = ${E.toFixed(2)} mV`;
  if($id('te-out-volts')) $id('te-out-volts').textContent = `${parseFloat(E.toFixed(1))}mV`;
  
  // Update colors of top and bottom bars if they exist
  if($id('te-hot-txt')) $id('te-hot-txt').textContent = `T_Hot: ${th} °C`;
  if($id('te-cold-txt')) $id('te-cold-txt').textContent = `T_Cold: ${tc} °C`;
}
['te-alpha','te-th','te-tc'].forEach(id => {
  if($id(id)) $id(id).addEventListener('input', updateTECalc);
});

if($id('te-alpha')) updateTECalc();

function setTEEffect(type) {
  const tabs = document.querySelectorAll('#te-tabs .pill-tab');
  tabs.forEach(t => t.classList.remove('active-orange'));
  
  const desc = $id('te-effect-desc');
  
  if(type==='seebeck') {
    tabs[0].classList.add('active-orange');
    if(desc) desc.innerHTML = `<tspan x="600" dy="0">Seebeck Effect:</tspan><tspan x="600" dy="20">Temp diff</tspan><tspan x="600" dy="20">creats EMF</tspan>`;
  } else if(type==='peltier') {
    tabs[1].classList.add('active-orange');
    if(desc) desc.innerHTML = `<tspan x="600" dy="0">Peltier Effect:</tspan><tspan x="600" dy="20">Applied current</tspan><tspan x="600" dy="20">heats/cools</tspan>`;
  } else if(type==='thomson') {
    tabs[2].classList.add('active-orange');
    if(desc) desc.innerHTML = `<tspan x="600" dy="0">Thomson Effect:</tspan><tspan x="600" dy="20">Current in gradient</tspan><tspan x="600" dy="20">releases heat</tspan>`;
  } else if(type==='joule') {
    tabs[3].classList.add('active-orange');
    if(desc) desc.innerHTML = `<tspan x="600" dy="0">Joule Heating:</tspan><tspan x="600" dy="20">I²R constant heat</tspan><tspan x="600" dy="20">(pure loss)</tspan>`;
  }
}

/* --- 4. ZT & THERMIONIC CALCULATOR --- */
function updateZTCalc() {
  const a = parseFloat($id('te-alpha')?.value || 200) * 1e-6; // V/K
  const sig = parseFloat($id('zt-sigma').value);
  const kap = parseFloat($id('zt-kappa').value);
  const T = parseFloat($id('te-th')?.value || 300) + 273.15; // in K
  
  $id('zt-sigma-val').textContent = sig + ' S/m';
  $id('zt-kappa-val').textContent = kap.toFixed(1) + ' W/mK';
  
  const zt = ((a*a) * sig * T)/kap;
  
  let pfx = "(Poor)";
  $id('zt-res-disp').style.borderColor = "#ef4444";
  $id('zt-res-disp').style.color = "#ef4444";
  
  if(zt > 1) { pfx = "(Good)"; $id('zt-res-disp').style.borderColor = "#facc15"; $id('zt-res-disp').style.color = "#facc15"; }
  if(zt > 2) { pfx = "(Excellent)"; $id('zt-res-disp').style.borderColor = "#00ff88"; $id('zt-res-disp').style.color = "#00ff88"; }
  
  if($id('zt-res-disp')) $id('zt-res-disp').textContent = `ZT = ${zt.toFixed(2)} ${pfx}`;
}
['te-alpha','te-th','zt-sigma','zt-kappa'].forEach(id => {
  if($id(id)) $id(id).addEventListener('input', updateZTCalc);
});
if($id('zt-sigma')) updateZTCalc();

// Thermionic
function updateTICalc() {
  const T = parseFloat($id('ti-t').value);
  const phi = parseFloat($id('ti-phi').value);
  
  $id('ti-t-val').textContent = T + ' K';
  $id('ti-phi-val').textContent = phi.toFixed(1) + ' eV';
  
  const A = 1.2e6; // Richardson constant approx for typical metals A/m2K2
  const k = 8.617e-5; // eV/K
  
  const J = A * (T*T) * Math.exp(-phi / (k*T)); // A/m2
  let jCm = J / 10000; // A/cm2
  
  let ext = "";
  if(jCm < 0.01) ext = " (Negligible)";
  if(jCm > 1e10) jCm = 9999999;
  
  if($id('ti-res')) $id('ti-res').textContent = `J ≈ ${jCm.toExponential(2)} A/cm² ${ext}`;
  
  // Animate density of electrons
  const speed = Math.max(0.1, Math.min(J / 1e5, 50)); 
  window.ti_speed = speed;
}
['ti-t','ti-phi'].forEach(id => {
  if($id(id)) $id(id).addEventListener('input', updateTICalc);
});
if($id('ti-t')) updateTICalc();

function spawnTIElectrons() {
  const g = $id('ti-electrons');
  if(!g) return;
  
  // speed scales amount
  const S = window.ti_speed || 0.1;
  const num = Math.min(Math.floor(S * 2), 10);
  
  for(let i=0; i<num; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    p.setAttribute('cx', 290);
    p.setAttribute('cy', 40 + Math.random()*100);
    p.setAttribute('r', 1.5);
    p.setAttribute('fill', '#00f5ff');
    g.appendChild(p);
    
    gsap.to(p, {
      attr: { cx: 550 },
      duration: 0.5 + Math.random()*1,
      ease: "power2.inOut",
      onComplete: () => p.remove()
    });
  }
}
if($id('ti-electrons')) setInterval(spawnTIElectrons, 100);


/* --- 5. MODULE SUMMARY: FLASHCARDS & D3 --- */

const m10_flashcards = [
  { q: "MHD main difficulty?", a: "Finding Duct Material (must withstand 2500°C and strong B-field)" },
  { q: "What is the Hall Effect in MHD?", a: "Current/voltage induced perpendicular to primary current J, causing an energy loss." },
  { q: "Fuel cell overall reaction (H2)?", a: "H₂ + ½O₂ → H₂O + Heat + Electricity" },
  { q: "Theoretical voltage of H2/O2 fuel cell?", a: "1.23 V (at STP)" },
  { q: "Seebeck Effect definition?", a: "ΔT between two dissimilar metal junctions generates an EMF. E = α·ΔT" },
  { q: "Seebeck coefficient (α) typical units?", a: "μV/K (Microvolts per Kelvin)" },
  { q: "What is the Peltier Effect?", a: "Applying an electric current across a junction causes Heating or Cooling. (Reverse of Seebeck)" },
  { q: "Ideal Figure of Merit (ZT) for TE material?", a: "ZT > 1 is good, ZT ~2-3 is excellent state-of-the-art." },
  { q: "Why is Bi₂Te₃ common?", a: "It provides a decent ZT near room temperature (up to 200°C)." },
  { q: "Richardson-Dushman equation governs?", a: "Thermionic Emission (electrons boiling off a hot cathode)." }
];
let fc_idx = 0;

function updateFCardUI() {
  if(!$id('fc-q-text')) return;
  $id('fc-q-text').textContent = m10_flashcards[fc_idx].q;
  $id('fc-a-text').textContent = m10_flashcards[fc_idx].a;
  $id('fc-count').textContent = `${fc_idx+1} of ${m10_flashcards.length} • Click to flip`;
  document.getElementById('master-flashcard').classList.remove('is-flipped');
}
function nextFlashcard() {
  fc_idx = (fc_idx + 1) % m10_flashcards.length;
  updateFCardUI();
}
function prevFlashcard() {
  fc_idx = (fc_idx - 1 + m10_flashcards.length) % m10_flashcards.length;
  updateFCardUI();
}
if($id('fc-q-text')) updateFCardUI();

// Efficiency Bar Chart D3
if(typeof d3 !== 'undefined' && $id('d3-eff-chart')) {
  function drawChart() {
    const data = [
      { name: 'Fuel Cell (CHP)', val: 80, col: '#f1c40f' },
      { name: 'MHD (Combined)', val: 55, col: '#00f5ff' },
      { name: 'Fuel Cell (Elec)', val: 40, col: '#2ecc71' },
      { name: 'Thermionic', val: 15, col: '#e74c3c' },
      { name: 'Thermoelectric', val: 8, col: '#e67e22' }
    ];
    
    const w = $id('d3-eff-chart').clientWidth || 600;
    const h = 200;
    $id('d3-eff-chart').innerHTML = '';
    
    const svg = d3.select('#d3-eff-chart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${w} ${h}`);
      
    const x = d3.scaleLinear().domain([0, 100]).range([120, w-40]);
    const y = d3.scaleBand().domain(data.map(d=>d.name)).range([20, h-20]).padding(0.3);
    
    // Grid lines
    svg.append('g').selectAll('.grid')
      .data(x.ticks(5)).enter()
      .append('line').attr('class','grid')
      .attr('x1', d=>x(d)).attr('x2', d=>x(d))
      .attr('y1', 20).attr('y2', h-20)
      .attr('stroke', '#1f2937').attr('stroke-dasharray','3,3');
      
    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class','bar')
      .attr('y', d => y(d.name))
      .attr('height', y.bandwidth())
      .attr('x', x(0))
      .attr('width', 0)
      .attr('fill', d => d.col)
      .attr('rx', 3)
      .transition().duration(1000)
      .attr('width', d => x(d.val) - x(0));
      
    // Text Labels
    svg.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('y', d => y(d.name) + y.bandwidth()/2 + 4)
      .attr('x', 110)
      .attr('text-anchor', 'end')
      .attr('fill', '#c8e6f5')
      .attr('font-size', '12px')
      .attr('font-family', 'Share Tech Mono')
      .text(d => d.name);
      
    // Value Labels
    svg.selectAll('.val-label')
      .data(data)
      .enter().append('text')
      .attr('y', d => y(d.name) + y.bandwidth()/2 + 4)
      .attr('x', x(0)+5)
      .attr('fill', '#050a0f')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text(d => d.val + '%')
      .transition().duration(1000)
      .attr('x', d => x(d.val) + 5)
      .attr('fill', d => d.col);
  }
  
  // Call immediately, and set responsive redraw
  setTimeout(drawChart, 200);
  window.addEventListener('resize', drawChart);
}
