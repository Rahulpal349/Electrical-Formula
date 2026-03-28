/* ===== UTILIZATION — Core Rendering Engine ===== */
(function () {
    const D = window.UTIL_DATA;
    if (!D) return;
    const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
    const main = $('#main-content'), sidebar = $('#sidebar-nav');
    let activeUnit = 1;

    /* --- Build Sidebar --- */
    function buildSidebar(unitId) {
        if (!sidebar) return;
        const u = D.units.find(x => x.id === unitId);
        if (!u) return;
        sidebar.innerHTML = `<h3 style="color:${u.color}">${u.icon} ${u.title}</h3>
    <ul class="sidebar-links">${u.cards.map(c => `<li><a href="#card-${c.id}" style="border-left-color:${u.color}">${c.id} ${c.title}</a></li>`).join('')}</ul>`;
    }

    /* --- Render Formula Block --- */
    function fmlaHTML(f) {
        const hl = f.highlight ? 'border-left:3px solid currentColor;padding-left:12px;' : '';
        return `<div style="margin-bottom:8px;${hl}"><span class="text-sm" style="color:inherit;font-weight:600;">${f.label}</span><div>$$${f.tex}$$</div></div>`;
    }

    /* --- Render Info Cards --- */
    function infoHTML(cards, color) {
        return `<div class="info-cards-row">${cards.map(c => `<div class="info-card" style="border-color:${c.color || color}"><h4 style="color:${c.color || color}">${c.title}</h4><p>${c.desc}</p></div>`).join('')}</div>`;
    }

    /* --- Render Table --- */
    function tableHTML(t, color) {
        return `<div class="table-container"><table class="comparison-table"><thead><tr style="color:${color}">${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }

    /* --- Render Tabs --- */
    function tabsHTML(card, color) {
        if (!card.tabs) return '';
        const tid = card.id.replace('.', '');
        return `<div class="tab-row">${card.tabs.map((t, i) => `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${tid}-${i}" style="${i === 0 ? 'background:' + color + ';color:#000;' : ''}" onclick="window._utSwitchTab('${tid}',${i},'${color}')">${t}</button>`).join('')}</div>
  ${card.tabContent.map((tc, i) => `<div class="tab-pane" id="tp-${tid}-${i}" style="${i > 0 ? 'display:none' : ''}"><div class="formula-zone" style="color:${color}">${tc.formulas.map(f => fmlaHTML(f)).join('')}</div></div>`).join('')}`;
    }

    /* --- Tab Switch --- */
    window._utSwitchTab = function (tid, idx, color) {
        document.querySelectorAll(`.tab-btn[data-tab^="${tid}-"]`).forEach((b, i) => {
            b.classList.toggle('active', i === idx);
            b.style.background = i === idx ? color : '';
            b.style.color = i === idx ? '#000' : '';
        });
        document.querySelectorAll(`[id^="tp-${tid}-"]`).forEach((p, i) => { p.style.display = i === idx ? '' : 'none'; });
        reRenderMath();
    };

    /* --- SVG Generators --- */
    const svgGenerators = {
        'drive-block': function () {
            return `<svg viewBox="0 0 880 120" width="100%" height="100%">
      <defs><marker id="ah1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f97316"/></marker></defs>
      ${[{ x: 20, l: 'Power\\nSupply', c: '#f97316' }, { x: 200, l: 'Converter', c: '#fb923c' }, { x: 380, l: 'Motor', c: '#facc15' }, { x: 560, l: 'Gearbox', c: '#22c55e' }, { x: 720, l: 'Load', c: '#00f5ff' }].map(b =>
                `<rect x="${b.x}" y="30" width="140" height="60" rx="8" fill="#1e293b" stroke="${b.c}" stroke-width="2" class="pulse-glow"/>
         <text x="${b.x + 70}" y="65" fill="${b.c}" text-anchor="middle" font-size="13" font-family="Orbitron,sans-serif">${b.l.replace('\\n', '')}</text>`).join('')}
      ${[170, 350, 530, 700].map(x => `<line x1="${x}" y1="60" x2="${x + 20}" y2="60" stroke="#f97316" stroke-width="3" marker-end="url(#ah1)"/>`).join('')}
      <circle cx="100" cy="60" r="3" fill="#ff6b35" class="flow-particle"/><circle cx="280" cy="60" r="3" fill="#ff6b35" class="flow-particle" style="animation-delay:.5s"/>
      <circle cx="460" cy="60" r="3" fill="#ff6b35" class="flow-particle" style="animation-delay:1s"/><circle cx="640" cy="60" r="3" fill="#ff6b35" class="flow-particle" style="animation-delay:1.5s"/>
    </svg>`;
        },
        'torque-speed': function () { return `<div id="tn-chart-container" style="width:100%;height:260px"><canvas id="tn-chart"></canvas></div>`; },
        'load-types': function () { return `<div id="load-chart-container" style="width:100%;height:260px"><canvas id="load-chart"></canvas></div>`; },
        'braking-curves': function () { return `<div id="braking-chart-container" style="width:100%;height:260px"><canvas id="braking-chart"></canvas></div>`; },
        'inverse-square': function () {
            return `<svg viewBox="0 0 500 200" width="100%" height="100%">
      <circle cx="50" cy="100" r="18" fill="#facc15" class="pulse-glow"/><text x="50" y="105" text-anchor="middle" fill="#000" font-size="10" font-weight="bold">I</text>
      ${[1, 2, 3].map((d, i) => {
                const x = 50 + d * 120, w = 30 + d * 20; return `
        <line x1="50" y1="${100 - 10 * d}" x2="${x}" y2="${60 - i * 5}" stroke="rgba(250,204,21,0.3)" stroke-width="1"/>
        <line x1="50" y1="${100 + 10 * d}" x2="${x}" y2="${140 + i * 5}" stroke="rgba(250,204,21,0.3)" stroke-width="1"/>
        <rect x="${x - w / 2}" y="${100 - w / 2}" width="${w}" height="${w}" fill="none" stroke="#facc15" stroke-width="1.5" opacity="${1 / d}"/>
        <text x="${x}" y="${100 + w / 2 + 15}" fill="#94a3b8" text-anchor="middle" font-size="10">${d}d → E=${d === 1 ? 'I/d²' : 'I/' + d * d + 'd²'}</text>`;
            }).join('')}
    </svg>`;
        },
        'lamp-efficacy-chart': function () { return `<div id="lamp-chart-container" style="width:100%;height:280px"><canvas id="lamp-chart"></canvas></div>`; },
        'furnace-types': function () {
            return `<svg viewBox="0 0 700 180" width="100%" height="100%">
      <g transform="translate(30,10)"><rect width="180" height="160" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
        <text x="90" y="20" fill="#ef4444" text-anchor="middle" font-size="11" font-family="Orbitron">RESISTANCE</text>
        <rect x="20" y="40" width="140" height="90" fill="#0f172a" rx="4"/><text x="90" y="90" fill="#94a3b8" text-anchor="middle" font-size="10">Charge</text>
        ${[40, 70, 100, 130].map(x => `<line x1="${x}" y1="45" x2="${x}" y2="125" stroke="#ef4444" stroke-width="2" class="pulse-glow"/>`).join('')}
      </g>
      <g transform="translate(250,10)"><rect width="180" height="160" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
        <text x="90" y="20" fill="#a78bfa" text-anchor="middle" font-size="11" font-family="Orbitron">INDUCTION</text>
        <rect x="50" y="40" width="80" height="90" fill="#0f172a" rx="4"/><text x="90" y="90" fill="#94a3b8" text-anchor="middle" font-size="10">Crucible</text>
        <ellipse cx="90" cy="85" rx="35" ry="40" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 3" class="spin-anim"/>
      </g>
      <g transform="translate(470,10)"><rect width="180" height="160" rx="8" fill="#1e293b" stroke="#facc15" stroke-width="2"/>
        <text x="90" y="20" fill="#facc15" text-anchor="middle" font-size="11" font-family="Orbitron">ARC</text>
        <rect x="20" y="80" width="140" height="50" fill="#0f172a" rx="4"/><text x="90" y="110" fill="#94a3b8" text-anchor="middle" font-size="10">Metal Bath</text>
        <line x1="60" y1="35" x2="60" y2="75" stroke="#facc15" stroke-width="3"/><line x1="120" y1="35" x2="120" y2="75" stroke="#facc15" stroke-width="3"/>
        <path d="M60,75 Q90,50 120,75" stroke="#fff" stroke-width="2" fill="none" class="pulse-glow"/>
      </g>
    </svg>`;
        },
        'welding-anim': function () {
            return `<svg viewBox="0 0 500 160" width="100%" height="100%">
      <rect x="50" y="90" width="400" height="25" fill="#475569" rx="2"/><rect x="50" y="115" width="400" height="25" fill="#64748b" rx="2"/>
      <g id="weld-torch"><rect x="200" y="20" width="12" height="65" fill="#94a3b8" rx="2"/>
        <circle cx="206" cy="88" r="8" fill="#facc15" opacity="0.8" class="pulse-glow"/>
        <circle cx="206" cy="88" r="4" fill="#fff"/>
      </g>
      <rect x="50" y="100" width="155" height="8" fill="#f97316" rx="1" opacity="0.7"/>
      <text x="250" y="155" fill="#94a3b8" text-anchor="middle" font-size="10">Arc Welding — Electrode moves along joint</text>
    </svg>`;
        },
        'speed-time-curve': function () { return `<div id="vt-chart-container" style="width:100%;height:280px"><canvas id="vt-chart"></canvas></div>`; },
        'electrolysis-tank': function () {
            return `<svg viewBox="0 0 500 200" width="100%" height="100%">
      <rect x="50" y="20" width="400" height="160" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
      <rect x="60" y="30" width="380" height="140" rx="4" fill="rgba(167,139,250,0.1)"/>
      <rect x="100" y="40" width="20" height="110" fill="#a78bfa" rx="2"/><text x="110" y="165" fill="#a78bfa" text-anchor="middle" font-size="9">Anode +</text>
      <rect x="380" y="40" width="20" height="110" fill="#00f5ff" rx="2"/><text x="390" y="165" fill="#00f5ff" text-anchor="middle" font-size="9">Cathode −</text>
      ${[0, 1, 2, 3, 4].map(i => `<circle cx="${180 + i * 40}" cy="${70 + i * 15}" r="4" fill="#a78bfa" opacity="0.8"><animate attributeName="cx" from="${180 + i * 40}" to="${350}" dur="${2 + i * 0.3}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.3;1" dur="${2 + i * 0.3}s" repeatCount="indefinite"/></circle>`).join('')}
      <text x="250" y="110" fill="#94a3b8" text-anchor="middle" font-size="11">M²⁺ ions → Cathode</text>
      <rect x="375" y="45" width="30" height="100" fill="rgba(0,245,255,0.15)" rx="2"><animate attributeName="width" from="30" to="35" dur="4s" repeatCount="indefinite"/></rect>
    </svg>`;
        },
        'vapour-compression': function () {
            return `<svg viewBox="0 0 500 250" width="100%" height="100%">
      <defs><marker id="ah2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#60a5fa"/></marker></defs>
      ${[{ x: 180, y: 20, l: 'CONDENSER', c: '#ef4444' }, { x: 180, y: 170, l: 'EVAPORATOR', c: '#00f5ff' }, { x: 380, y: 95, l: 'COMPRESSOR', c: '#f97316' }, { x: 30, y: 95, l: 'EXP. VALVE', c: '#22c55e' }].map(b =>
                `<rect x="${b.x}" y="${b.y}" width="130" height="50" rx="8" fill="#1e293b" stroke="${b.c}" stroke-width="2"/>
         <text x="${b.x + 65}" y="${b.y + 30}" fill="${b.c}" text-anchor="middle" font-size="10" font-family="Orbitron">${b.l}</text>`).join('')}
      <path d="M310,45 L380,95" stroke="#ef4444" stroke-width="2" marker-end="url(#ah2)"/>
      <path d="M380,145 L310,195" stroke="#00f5ff" stroke-width="2" marker-end="url(#ah2)"/>
      <path d="M180,195 L95,145" stroke="#22c55e" stroke-width="2" marker-end="url(#ah2)"/>
      <path d="M95,95 L180,45" stroke="#60a5fa" stroke-width="2" marker-end="url(#ah2)"/>
      <text x="360" y="65" fill="#ef4444" font-size="9">1→2</text><text x="360" y="180" fill="#00f5ff" font-size="9">4→1</text>
      <text x="120" y="180" fill="#22c55e" font-size="9">3→4</text><text x="120" y="65" fill="#60a5fa" font-size="9">2→3</text>
      <text x="450" y="125" fill="#f97316" font-size="9">W_in</text><text x="250" y="15" fill="#ef4444" font-size="9">Q_H out</text><text x="250" y="245" fill="#00f5ff" font-size="9">Q_L in</text>
    </svg>`;
        },
        'fridge-circuit': function () {
            return `<svg viewBox="0 0 500 220" width="100%" height="100%">
      <text x="250" y="15" fill="#60a5fa" text-anchor="middle" font-size="12" font-family="Orbitron">Refrigerator Wiring Diagram</text>
      <line x1="50" y1="40" x2="50" y2="200" stroke="#ef4444" stroke-width="2"/><text x="45" y="35" fill="#ef4444" font-size="9">L</text>
      <line x1="450" y1="40" x2="450" y2="200" stroke="#3b82f6" stroke-width="2"/><text x="445" y="35" fill="#3b82f6" font-size="9">N</text>
      <rect x="100" y="50" width="100" height="35" rx="5" fill="#1e293b" stroke="#facc15" stroke-width="1.5"/><text x="150" y="72" fill="#facc15" text-anchor="middle" font-size="9">THERMOSTAT</text>
      <line x1="50" y1="67" x2="100" y2="67" stroke="#fff" stroke-width="1"/><line x1="200" y1="67" x2="250" y2="67" stroke="#fff" stroke-width="1"/>
      <rect x="250" y="50" width="100" height="35" rx="5" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/><text x="300" y="72" fill="#ef4444" text-anchor="middle" font-size="9">OVERLOAD</text>
      <line x1="350" y1="67" x2="400" y2="67" stroke="#fff" stroke-width="1"/>
      <circle cx="425" cy="130" r="40" fill="#1e293b" stroke="#f97316" stroke-width="2"/><text x="425" y="125" fill="#f97316" text-anchor="middle" font-size="9">COMPRESSOR</text><text x="425" y="138" fill="#94a3b8" text-anchor="middle" font-size="8">MOTOR</text>
      <line x1="400" y1="67" x2="425" y2="90" stroke="#fff" stroke-width="1"/><line x1="425" y1="170" x2="450" y2="200" stroke="#fff" stroke-width="1"/>
      <rect x="100" y="140" width="120" height="35" rx="5" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/><text x="160" y="162" fill="#22c55e" text-anchor="middle" font-size="9">DEFROST TIMER</text>
      <line x1="50" y1="157" x2="100" y2="157" stroke="#fff" stroke-width="1"/><line x1="220" y1="157" x2="270" y2="157" stroke="#fff" stroke-width="1"/>
      <rect x="270" y="140" width="100" height="35" rx="5" fill="#1e293b" stroke="#00f5ff" stroke-width="1.5"/><text x="320" y="162" fill="#00f5ff" text-anchor="middle" font-size="9">DEFROST HTR</text>
      <line x1="370" y1="157" x2="450" y2="157" stroke="#fff" stroke-width="1"/>
    </svg>`;
        }
    };

    /* --- Calc HTML Generators --- */
    function calcHTML(type, color) {
        const C = {
            'motor-power': {
                title: '🧮 Motor Power Calculator', fields: [
                    { id: 'mp-torque', label: 'Torque (N·m)', val: 50 }, { id: 'mp-speed', label: 'Speed (rpm)', val: 1500 }, { id: 'mp-eff', label: 'Efficiency η', val: 0.9 }
                ], fn: 'calcMotorPower'
            },
            'affinity-laws': {
                title: '🧮 Affinity Laws Calculator', fields: [
                    { id: 'af-n1', label: 'Speed N₁ (rpm)', val: 1500 }, { id: 'af-n2', label: 'Speed N₂ (rpm)', val: 1200 }, { id: 'af-p1', label: 'Power P₁ (kW)', val: 100 }
                ], fn: 'calcAffinity'
            },
            'illuminance': {
                title: '🧮 Illuminance Calculator', fields: [
                    { id: 'il-I', label: 'Intensity I (cd)', val: 1000 }, { id: 'il-h', label: 'Height h (m)', val: 5 }, { id: 'il-x', label: 'Horiz. dist x (m)', val: 3 }
                ], fn: 'calcIlluminance'
            },
            'lumen-method': {
                title: '🧮 Lumen Method Calculator', fields: [
                    { id: 'lm-E', label: 'Required Lux', val: 500 }, { id: 'lm-A', label: 'Room Area (m²)', val: 100 }, { id: 'lm-phi', label: 'Lumens/lamp', val: 3000 },
                    { id: 'lm-n', label: 'Lamps/luminaire', val: 1 }, { id: 'lm-UF', label: 'UF (0-1)', val: 0.6 }, { id: 'lm-MF', label: 'MF (0-1)', val: 0.8 }
                ], fn: 'calcLumen'
            },
            'heating-time': {
                title: '🧮 Heating Time Calculator', fields: [
                    { id: 'ht-m', label: 'Mass (kg)', val: 10 }, { id: 'ht-c', label: 'Sp. Heat (kJ/kg·K)', val: 4.186 }, { id: 'ht-dt', label: 'Temp Rise (°C)', val: 80 },
                    { id: 'ht-P', label: 'Power (kW)', val: 3 }, { id: 'ht-eff', label: 'Efficiency', val: 0.9 }
                ], fn: 'calcHeating'
            },
            'speed-time': {
                title: '🧮 Speed-Time Curve Solver', fields: [
                    { id: 'st-vm', label: 'Vmax (km/h)', val: 80 }, { id: 'st-t1', label: 't₁ accel (s)', val: 30 }, { id: 'st-t2', label: 't₂ free run (s)', val: 50 }, { id: 'st-t3', label: 't₃ brake (s)', val: 25 }
                ], fn: 'calcSpeedTime'
            },
            'faraday': {
                title: '🧮 Faraday\'s Law Calculator', fields: [
                    { id: 'fa-I', label: 'Current I (A)', val: 10 }, { id: 'fa-t', label: 'Time (min)', val: 60 }, { id: 'fa-M', label: 'Molar Mass (g/mol)', val: 63.5 }, { id: 'fa-n', label: 'Valency', val: 2 }
                ], fn: 'calcFaraday'
            },
            'plating': {
                title: '🧮 Plating Thickness', fields: [
                    { id: 'pl-I', label: 'Current I (A)', val: 10 }, { id: 'pl-t', label: 'Time (min)', val: 60 }, { id: 'pl-A', label: 'Area (cm²)', val: 100 },
                    { id: 'pl-M', label: 'Molar Mass', val: 63.5 }, { id: 'pl-n', label: 'Valency', val: 2 }, { id: 'pl-rho', label: 'Density (g/cm³)', val: 8.96 }
                ], fn: 'calcPlating'
            },
            'cop': {
                title: '🧮 COP Calculator', fields: [
                    { id: 'cp-TL', label: 'T_low (°C)', val: -5 }, { id: 'cp-TH', label: 'T_high (°C)', val: 40 }
                ], fn: 'calcCOP'
            },
            'ac-load': {
                title: '🧮 AC Cooling Load', fields: [
                    { id: 'ac-L', label: 'Room Length (m)', val: 5 }, { id: 'ac-W', label: 'Room Width (m)', val: 4 }, { id: 'ac-H', label: 'Height (m)', val: 3 },
                    { id: 'ac-dt', label: 'Temp diff (°C)', val: 10 }
                ], fn: 'calcACLoad'
            }
        };
        const c = C[type]; if (!c) return '';
        return `<div class="calc-panel"><h4 style="color:${color}">${c.title}</h4>
    <div class="calc-row">${c.fields.map(f => `<label>${f.label}<input type="number" id="${f.id}" value="${f.val}" step="any"></label>`).join('')}</div>
    <button class="calc-btn" style="background:${color}" onclick="window._utCalc('${c.fn}')"">CALCULATE</button>
    <div class="calc-result" id="res-${type}"></div></div>`;
    }

    /* --- Calculator Functions --- */
    window._utCalc = function (fn) { window._utCalcFns[fn](); };
    window._utCalcFns = {
        calcMotorPower() {
            const T = +$('#mp-torque').value, N = +$('#mp-speed').value, e = +$('#mp-eff').value;
            const P = (T * 2 * Math.PI * N / 60) / 1000, Pin = P / e;
            showRes('motor-power', `Output = <b>${P.toFixed(2)} kW</b> (${(P / 0.746).toFixed(2)} HP)<br>Input = <b>${Pin.toFixed(2)} kW</b>`);
        },
        calcAffinity() {
            const N1 = +$('#af-n1').value, N2 = +$('#af-n2').value, P1 = +$('#af-p1').value;
            const r = N2 / N1, P2 = P1 * Math.pow(r, 3), saving = ((P1 - P2) / P1 * 100);
            showRes('affinity-laws', `Q₂/Q₁ = <b>${r.toFixed(3)}</b><br>H₂/H₁ = <b>${(r * r).toFixed(3)}</b><br>P₂ = <b>${P2.toFixed(2)} kW</b> (${(r * r * r * 100).toFixed(1)}%)<br>Energy Saving = <b>${saving.toFixed(1)}%</b>`);
        },
        calcIlluminance() {
            const I = +$('#il-I').value, h = +$('#il-h').value, x = +$('#il-x').value;
            const d = Math.sqrt(h * h + x * x), cosT = h / d, E = I * Math.pow(cosT, 3) / (h * h);
            showRes('illuminance', `Distance d = <b>${d.toFixed(2)} m</b><br>cos³θ = <b>${Math.pow(cosT, 3).toFixed(4)}</b><br>Illuminance E = <b>${E.toFixed(2)} lux</b>`);
        },
        calcLumen() {
            const E = +$('#lm-E').value, A = +$('#lm-A').value, phi = +$('#lm-phi').value, n = +$('#lm-n').value, UF = +$('#lm-UF').value, MF = +$('#lm-MF').value;
            const N = Math.ceil(E * A / (phi * n * UF * MF));
            showRes('lumen-method', `Number of luminaires = <b>${N}</b><br>Total lumens = <b>${(N * phi * n).toLocaleString()} lm</b>`);
        },
        calcHeating() {
            const m = +$('#ht-m').value, c = +$('#ht-c').value, dt = +$('#ht-dt').value, P = +$('#ht-P').value, e = +$('#ht-eff').value;
            const t = (m * c * dt) / (P * e), Q = m * c * dt;
            showRes('heating-time', `Heat Required = <b>${Q.toFixed(1)} kJ</b><br>Time = <b>${t.toFixed(1)} sec</b> = <b>${(t / 60).toFixed(2)} min</b>`);
        },
        calcSpeedTime() {
            const Vm = +$('#st-vm').value, t1 = +$('#st-t1').value, t2 = +$('#st-t2').value, t3 = +$('#st-t3').value;
            const s1 = Vm * t1 / 7.2, s2 = Vm * t2 / 3.6, s3 = Vm * t3 / 7.2, D = s1 + s2 + s3;
            const Tt = t1 + t2 + t3, Vavg = D / Tt * 3.6, alpha = Vm / t1, beta = Vm / t3;
            showRes('speed-time', `α = <b>${alpha.toFixed(2)} km/h/s</b>, β = <b>${beta.toFixed(2)} km/h/s</b><br>s₁=${s1.toFixed(0)}m, s₂=${s2.toFixed(0)}m, s₃=${s3.toFixed(0)}m<br>Total D = <b>${D.toFixed(0)} m</b> = ${(D / 1000).toFixed(2)} km<br>V_avg = <b>${Vavg.toFixed(1)} km/h</b>`);
        },
        calcFaraday() {
            const I = +$('#fa-I').value, t = +$('#fa-t').value * 60, M = +$('#fa-M').value, n = +$('#fa-n').value;
            const F = 96500, m = M * I * t / (n * F), Z = M / (n * F);
            showRes('faraday', `Z = <b>${Z.toExponential(3)} g/C</b><br>Charge Q = <b>${(I * t).toLocaleString()} C</b><br>Mass deposited = <b>${m.toFixed(4)} g</b>`);
        },
        calcPlating() {
            const I = +$('#pl-I').value, t = +$('#pl-t').value * 60, A = +$('#pl-A').value, M = +$('#pl-M').value, n = +$('#pl-n').value, rho = +$('#pl-rho').value;
            const Z = M / (n * 96500), m = Z * I * t, d = m / (rho * A) * 10000;
            showRes('plating', `Mass = <b>${m.toFixed(4)} g</b><br>Thickness = <b>${d.toFixed(2)} μm</b>`);
        },
        calcCOP() {
            const TL = +$('#cp-TL').value + 273.15, TH = +$('#cp-TH').value + 273.15;
            const cop = TL / (TH - TL), copHP = cop + 1, eer = cop * 3.412;
            let star = eer >= 5 ? '⭐⭐⭐⭐⭐' : eer >= 4.5 ? '⭐⭐⭐⭐' : eer >= 3.5 ? '⭐⭐⭐' : eer >= 2.5 ? '⭐⭐' : '⭐';
            showRes('cop', `COP (Carnot) = <b>${cop.toFixed(2)}</b><br>COP Heat Pump = <b>${copHP.toFixed(2)}</b><br>EER = <b>${eer.toFixed(2)}</b><br>Star Rating ≈ ${star}`);
        },
        calcACLoad() {
            const L = +$('#ac-L').value, W = +$('#ac-W').value, H = +$('#ac-H').value, dt = +$('#ac-dt').value;
            const V = L * W * H, Qs = 1.2 * 1.005 * V * dt / 3, TR = Qs / 3.517, tons = Math.ceil(TR);
            showRes('ac-load', `Room Volume = <b>${V} m³</b><br>Approx. Load = <b>${Qs.toFixed(2)} kW</b><br>= <b>${TR.toFixed(2)} TR</b><br>Recommended: <b>${tons} Ton AC</b>`);
        }
    };
    function showRes(type, html) { const el = $(`#res-${type}`); if (el) { el.innerHTML = html; el.classList.add('show'); } }

    /* --- Build a Unit Section --- */
    function buildUnit(u) {
        let html = `<section id="unit-${u.id}" class="module-section${u.id === activeUnit ? ' active' : ''}">
    <div class="module-header"><h2 class="module-title">UNIT ${u.id}<span class="module-subtitle"> — ${u.title}</span></h2>
    <div class="module-line" style="background:${u.color};box-shadow:0 0 10px ${u.color}"></div></div><div class="card-grid">`;
        u.cards.forEach(c => {
            html += `<div class="machine-card" style="grid-column:1/-1" id="card-${c.id}">
      <div class="card-strip" style="background:${u.color}"></div>
      <div class="card-header"><h3>${c.id} ${c.title}</h3></div>`;
            // SVG animation zone
            if (c.svg && svgGenerators[c.svg]) {
                html += `<div class="anim-zone" style="min-height:160px;background:rgba(0,0,0,0.3);border-radius:0;margin:0">${svgGenerators[c.svg]()}</div>`;
            }
            html += `<div class="formula-zone" style="color:${u.color}">`;
            // Info cards
            if (c.infoCards) html += infoHTML(c.infoCards, u.color);
            // Tabs
            if (c.tabs) html += tabsHTML(c, u.color);
            // Regular formulas
            if (c.formulas && !c.tabs) c.formulas.forEach(f => { html += fmlaHTML(f); });
            // Notes
            if (c.notes) html += `<div class="text-xs" style="color:#94a3b8;margin-top:8px">${c.notes.map(n => `• ${n}`).join('<br>')}</div>`;
            // Table
            if (c.table) html += tableHTML(c.table, u.color);
            // Calculator
            if (c.calculator) html += calcHTML(c.calculator, u.color);
            html += `</div></div>`;
        });
        html += `</div></section>`;
        return html;
    }

    /* --- Render All --- */
    function renderAll() {
        main.innerHTML = D.units.map(u => buildUnit(u)).join('');
        buildSidebar(activeUnit);
        reRenderMath();
        initCharts();
        initAOS();
    }

    /* --- KaTeX re-render --- */
    function reRenderMath() {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(main, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
        } else { setTimeout(reRenderMath, 200); }
    }

    /* --- Unit Tab Switching --- */
    $$('.unit-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.unit-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeUnit = +btn.dataset.unit;
            $$('.module-section').forEach(s => s.classList.remove('active'));
            const sec = $(`#unit-${activeUnit}`);
            if (sec) sec.classList.add('active');
            buildSidebar(activeUnit);
            reRenderMath();
            setTimeout(initCharts, 100);
        });
    });

    /* --- Sidebar Click --- */
    if (sidebar) {
        sidebar.addEventListener('click', e => {
            const a = e.target.closest('a');
            if (!a) return;
            e.preventDefault();
            const target = $(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /* --- Charts (Chart.js) --- */
    function initCharts() {
        // T-N Curves
        const tnCtx = $('#tn-chart');
        if (tnCtx && !tnCtx._chartDone) {
            tnCtx._chartDone = true;
            const pts = 80;
            const labels = Array.from({ length: pts }, (_, i) => i * 20);
            new Chart(tnCtx, {
                type: 'line', data: {
                    labels, datasets: [
                        { label: 'DC Shunt', data: labels.map(n => n < 100 ? 0 : Math.max(5, 95 - n * 0.02)), borderColor: '#f97316', tension: 0.3, pointRadius: 0 },
                        { label: 'DC Series', data: labels.map(n => n < 50 ? 0 : Math.max(5, 8000 / (n + 20))), borderColor: '#facc15', tension: 0.3, pointRadius: 0 },
                        { label: 'Induction Motor', data: labels.map(n => { const s = (1500 - n) / 1500; return n > 1500 ? -20 : s < 0 ? 0 : 300 * s / (0.04 + s * s) * 0.04; }), borderColor: '#00f5ff', tension: 0.3, pointRadius: 0 },
                        { label: 'BLDC/PMSM', data: labels.map(n => n < 100 ? 0 : n < 1000 ? 90 : 90 * 1000 / n), borderColor: '#a78bfa', tension: 0.3, pointRadius: 0 }
                    ]
                }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { title: { display: true, text: 'Speed (rpm)', color: '#94a3b8' }, ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { title: { display: true, text: 'Torque (N·m)', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
            });
        }
        // Load type curves
        const ldCtx = $('#load-chart');
        if (ldCtx && !ldCtx._chartDone) {
            ldCtx._chartDone = true;
            const labels = Array.from({ length: 50 }, (_, i) => (i + 1) * 30);
            new Chart(ldCtx, {
                type: 'line', data: {
                    labels, datasets: [
                        { label: 'Constant Torque', data: labels.map(() => 80), borderColor: '#f97316', tension: 0, pointRadius: 0, borderDash: [5, 3] },
                        { label: 'Variable Torque (T∝N²)', data: labels.map(n => 80 * Math.pow(n / 1500, 2)), borderColor: '#facc15', tension: 0.3, pointRadius: 0 },
                        { label: 'Constant Power (T∝1/N)', data: labels.map(n => n < 300 ? 200 : 80 * 1500 / n), borderColor: '#00f5ff', tension: 0.3, pointRadius: 0 }
                    ]
                }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { title: { display: true, text: 'Speed (rpm)', color: '#94a3b8' }, ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { title: { display: true, text: 'Torque', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
            });
        }
        // Braking curves
        const brCtx = $('#braking-chart');
        if (brCtx && !brCtx._chartDone) {
            brCtx._chartDone = true;
            const labels = Array.from({ length: 40 }, (_, i) => i * 0.5);
            new Chart(brCtx, {
                type: 'line', data: {
                    labels: labels.map(t => t.toFixed(1) + 's'), datasets: [
                        { label: 'Regenerative', data: labels.map(t => Math.max(0, 100 - t * 8)), borderColor: '#22c55e', tension: 0.3, pointRadius: 0 },
                        { label: 'Plugging', data: labels.map(t => Math.max(0, 100 - t * 18)), borderColor: '#ef4444', tension: 0.3, pointRadius: 0 },
                        { label: 'Dynamic', data: labels.map(t => 100 * Math.exp(-t * 0.3)), borderColor: '#f97316', tension: 0.3, pointRadius: 0 },
                        { label: 'DC Injection', data: labels.map(t => Math.max(0, 100 - t * 10)), borderColor: '#a78bfa', tension: 0.3, pointRadius: 0 }
                    ]
                }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { title: { display: true, text: 'Time', color: '#94a3b8' }, ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { title: { display: true, text: 'Speed (%)', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
            });
        }
        // Lamp efficacy chart
        const lpCtx = $('#lamp-chart');
        if (lpCtx && !lpCtx._chartDone) {
            lpCtx._chartDone = true;
            new Chart(lpCtx, {
                type: 'bar', data: {
                    labels: ['Incan.', 'Halogen', 'CFL', 'Fluor.', 'HPMV', 'LPS Na', 'HPS Na', 'MH', 'LED'], datasets: [
                        { label: 'Efficacy (lm/W)', data: [12, 20, 60, 75, 50, 175, 105, 88, 150], backgroundColor: ['#78716c', '#a8a29e', '#22c55e', '#22d3ee', '#94a3b8', '#facc15', '#f97316', '#60a5fa', '#a78bfa'] }
                    ]
                }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Efficacy (lm/W)', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
            });
        }
        // Speed-time curve
        const vtCtx = $('#vt-chart');
        if (vtCtx && !vtCtx._chartDone) {
            vtCtx._chartDone = true;
            const Vm = 80, t1 = 30, t2 = 50, t3 = 25, pts2 = [];
            for (let t = 0; t <= t1; t += 1) pts2.push({ x: t, y: Vm * t / t1 });
            for (let t = t1; t <= t1 + t2; t += 1) pts2.push({ x: t, y: Vm });
            for (let t = 0; t <= t3; t += 1) pts2.push({ x: t1 + t2 + t, y: Vm * (1 - t / t3) });
            new Chart(vtCtx, {
                type: 'line', data: { datasets: [{ label: 'Speed-Time', data: pts2, borderColor: '#00f5ff', backgroundColor: 'rgba(0,245,255,0.1)', fill: true, tension: 0, pointRadius: 0, borderWidth: 2 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } }, annotation: {} }, scales: { x: { type: 'linear', title: { display: true, text: 'Time (s)', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { title: { display: true, text: 'Speed (km/h)', color: '#94a3b8' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
            });
        }
    }

    /* --- AOS init --- */
    function initAOS() { if (typeof AOS !== 'undefined') AOS.init({ duration: 600, once: true, offset: 50 }); }

    /* --- Mobile Menu --- */
    const mmBtn = $('#mobile-menu-btn'), navLinks = $('.navbar__links');
    if (mmBtn && navLinks) { mmBtn.addEventListener('click', () => navLinks.classList.toggle('open')); }

    /* --- Init --- */
    document.addEventListener('DOMContentLoaded', () => { setTimeout(renderAll, 100); });
})();
