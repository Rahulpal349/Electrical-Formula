/* ============================================
   Estimation & Costing — Rendering Engine
   ============================================ */
(function () {
    'use strict';
    const ALL_UNITS = (typeof EST_UNITS_A !== 'undefined' ? EST_UNITS_A : []).concat(typeof EST_UNITS_B !== 'undefined' ? EST_UNITS_B : []);

    /* ---------- Render KaTeX safely ---------- */
    function renderTex(tex, el, display) {
        try { katex.render(tex, el, { throwOnError: false, displayMode: !!display }); }
        catch (e) { el.textContent = tex; }
    }

    /* ---------- Build Sidebar ---------- */
    function buildSidebar() {
        const sb = document.getElementById('est-sidebar');
        if (!sb) return;
        let html = '';
        ALL_UNITS.forEach(u => {
            html += `<h4>${u.icon} Unit ${u.id}</h4>`;
            u.cards.forEach(c => {
                html += `<a href="#${c.id}">${c.title.replace(/^\d+\.\d+ — /, '')}</a>`;
            });
        });
        sb.innerHTML = html;
    }

    /* ---------- Build Single Card ---------- */
    function buildCard(card, unitId) {
        let inner = `<h3 class="est-card__title">${card.title}</h3>`;

        // Glossary type
        if (card.type === 'glossary' && card.items) {
            inner += '<div class="info-cards">';
            card.items.forEach(it => {
                inner += `<div class="info-card" onclick="this.classList.toggle('expanded')">
        <div class="info-card__term">${it.term}</div>
        <div class="info-card__def">${it.def}</div>
        <div class="info-card__formula" id="gl-${it.term.toLowerCase().replace(/\s/g, '')}"></div>
      </div>`;
            });
            inner += '</div>';
        }

        // Problem type
        if (card.type === 'problem') {
            inner += `<div class="problem-block__given"><strong>Given:</strong> ${card.given}</div>`;
            if (card.steps) {
                card.steps.forEach(s => {
                    inner += `<div class="step"><div class="step__label">${s.label}</div>
          <div class="formula-block" data-tex="${s.tex.replace(/"/g, '&quot;')}"></div>`;
                    if (s.extra) inner += `<p class="formula-desc">${s.extra}</p>`;
                    inner += '</div>';
                });
            }
        }

        // Formulas
        if (card.formulas) {
            card.formulas.forEach(f => {
                if (f.label) inner += `<div class="formula-label">${f.label}</div>`;
                inner += `<div class="formula-block" data-tex="${f.tex.replace(/"/g, '&quot;')}"></div>`;
                if (f.note) inner += `<p class="formula-desc">${f.note}</p>`;
            });
        }

        // Where list
        if (card.where) {
            inner += '<ul class="where-list">';
            card.where.forEach(w => inner += `<li>${w}</li>`);
            inner += '</ul>';
        }

        // Notes
        if (card.notes) {
            inner += '<div class="est-card__subtitle">Key Values</div><ul class="where-list">';
            card.notes.forEach(n => inner += `<li>${n}</li>`);
            inner += '</ul>';
        }

        // Checklist (tender)
        if (card.checklist) {
            inner += '<ol class="tender-checklist">';
            card.checklist.forEach(it => inner += `<li>${it}</li>`);
            inner += '</ol>';
        }

        // BOQ Table
        if (card.boq) {
            inner += buildBOQ(card.boq);
        }

        // Maintenance table
        if (card.maintTable) {
            inner += buildMaintTable(card.maintTable);
        }

        // Calculator
        if (card.calculator) {
            inner += buildCalculator(card.calculator);
        }

        return `<div class="est-card" id="${card.id}">${inner}</div>`;
    }

    /* ---------- BOQ Table Builder ---------- */
    function buildBOQ(boq) {
        let h = `<div class="est-card__subtitle">${boq.title}</div><div class="boq-table-wrapper"><table class="boq-table"><thead><tr>`;
        boq.cols.forEach(c => h += `<th>${c}</th>`);
        h += '</tr></thead><tbody>';
        boq.rows.forEach(r => {
            h += '<tr>';
            r.forEach((cell, ci) => {
                if (boq.editable && (ci === 3 || ci === 4)) {
                    h += `<td><input type="number" value="${cell === '—' ? '' : cell}" data-col="${ci}" onchange="recalcBOQ(this)"/></td>`;
                } else if (boq.editable && ci === 5) {
                    h += `<td class="boq-amt">—</td>`;
                } else {
                    h += `<td>${cell}</td>`;
                }
            });
            h += '</tr>';
        });
        h += '</tbody>';
        if (boq.editable) h += '<tfoot><tr><td colspan="5" style="text-align:right;">Total</td><td class="boq-total">₹ 0</td></tr></tfoot>';
        h += '</table></div>';
        return h;
    }

    /* ---------- Maintenance Table ---------- */
    function buildMaintTable(mt) {
        let h = '<div class="est-card__subtitle">Maintenance Intervals</div><table class="maint-table"><thead><tr>';
        mt.cols.forEach(c => h += `<th>${c}</th>`);
        h += '</tr></thead><tbody>';
        mt.rows.forEach(r => {
            h += '<tr>';
            r.forEach(cell => h += `<td>${cell}</td>`);
            h += '</tr>';
        });
        h += '</tbody></table>';
        return h;
    }

    /* ---------- Calculator Panels ---------- */
    function buildCalculator(type) {
        const calcs = {
            costBuilder: {
                title: '💰 Cost Builder Calculator',
                fields: [
                    { id: 'cb-mat', label: 'Material Cost (₹)', ph: 'e.g. 50000' },
                    { id: 'cb-lab', label: 'Labor Cost (₹)', ph: 'e.g. 20000' },
                    { id: 'cb-oh', label: 'Overhead %', ph: '12', val: '12' },
                    { id: 'cb-cont', label: 'Contingency %', ph: '7', val: '7' },
                    { id: 'cb-prof', label: 'Profit %', ph: '12', val: '12' }
                ], fn: 'calcCostBuilder'
            },
            cableSizer: {
                title: '🔌 Cable Sizing Calculator',
                fields: [
                    { id: 'cs-p', label: 'Load Power (W)', ph: 'e.g. 6000' },
                    { id: 'cs-v', label: 'Voltage (V)', ph: '230', val: '230' },
                    { id: 'cs-pf', label: 'Power Factor', ph: '0.85', val: '0.85' },
                    { id: 'cs-l', label: 'Cable Length (m)', ph: 'e.g. 15' },
                    { id: 'cs-mat', label: 'Conductor', ph: '', type: 'select', opts: ['Copper', 'Aluminum'] }
                ], fn: 'calcCableSizer'
            },
            voltageDrop: {
                title: '⚡ Voltage Drop Checker',
                fields: [
                    { id: 'vd-i', label: 'Current (A)', ph: 'e.g. 30' },
                    { id: 'vd-l', label: 'One-way Length (m)', ph: 'e.g. 25' },
                    { id: 'vd-a', label: 'Cable CSA (mm²)', ph: 'e.g. 6' },
                    { id: 'vd-mat', label: 'Conductor', ph: '', type: 'select', opts: ['Copper', 'Aluminum'] },
                    { id: 'vd-v', label: 'Supply Voltage (V)', ph: '230', val: '230' }
                ], fn: 'calcVoltageDrop'
            },
            motorPanel: {
                title: '⚙️ Motor Feeder Calculator',
                fields: [
                    { id: 'mp-kw', label: 'Motor kW', ph: 'e.g. 7.5' },
                    { id: 'mp-v', label: 'Voltage (V)', ph: '415', val: '415' },
                    { id: 'mp-pf', label: 'Power Factor', ph: '0.85', val: '0.85' },
                    { id: 'mp-eff', label: 'Efficiency', ph: '0.88', val: '0.88' }
                ], fn: 'calcMotorPanel'
            },
            lumenCalc: {
                title: '💡 Lumen Method Calculator',
                fields: [
                    { id: 'lm-e', label: 'Required Lux', ph: 'e.g. 300' },
                    { id: 'lm-l', label: 'Room Length (m)', ph: 'e.g. 6' },
                    { id: 'lm-w', label: 'Room Width (m)', ph: 'e.g. 4' },
                    { id: 'lm-phi', label: 'Lumens/Lamp', ph: 'e.g. 3200' },
                    { id: 'lm-n', label: 'Lamps/Luminaire', ph: '1', val: '1' },
                    { id: 'lm-uf', label: 'Utilization Factor', ph: '0.6', val: '0.6' },
                    { id: 'lm-mf', label: 'Maintenance Factor', ph: '0.8', val: '0.8' }
                ], fn: 'calcLumen'
            },
            transformerSizer: {
                title: '🔋 Transformer Sizing Tool',
                fields: [
                    { id: 'ts-kw', label: 'Maximum Demand (kW)', ph: 'e.g. 75' },
                    { id: 'ts-pf', label: 'Power Factor', ph: '0.85', val: '0.85' }
                ], fn: 'calcTransformer'
            },
            earthCalc: {
                title: '🌍 Earth Resistance Calculator',
                fields: [
                    { id: 'ec-rho', label: 'Soil Resistivity (Ω·m)', ph: 'e.g. 50' },
                    { id: 'ec-l', label: 'Pipe Length (m)', ph: '3', val: '3' },
                    { id: 'ec-d', label: 'Pipe Diameter (m)', ph: '0.05', val: '0.05' },
                    { id: 'ec-req', label: 'Required R (Ω)', ph: '5', val: '5' }
                ], fn: 'calcEarth'
            }
        };
        const c = calcs[type];
        if (!c) return '';
        let h = `<div class="calc-panel"><div class="calc-panel__title">${c.title}</div><div class="calc-panel__grid">`;
        c.fields.forEach(f => {
            if (f.type === 'select') {
                h += `<div class="calc-field"><label>${f.label}</label><select id="${f.id}">`;
                f.opts.forEach(o => h += `<option>${o}</option>`);
                h += '</select></div>';
            } else {
                h += `<div class="calc-field"><label>${f.label}</label><input type="number" step="any" id="${f.id}" placeholder="${f.ph}" ${f.val ? 'value="' + f.val + '"' : ''}/></div>`;
            }
        });
        h += `</div><button class="calc-btn" onclick="${c.fn}()">⚡ CALCULATE</button>`;
        h += `<div class="calc-result" id="res-${type}"><div class="calc-result__label">Result</div><div class="calc-result__value">—</div><div class="calc-result__breakdown"></div></div></div>`;
        return h;
    }

    /* ---------- Render All Units ---------- */
    function renderEstimation() {
        const main = document.getElementById('est-main');
        if (!main || ALL_UNITS.length === 0) return;

        let html = '';
        ALL_UNITS.forEach(u => {
            html += `<section class="unit-section" data-unit="${u.id}" id="unit-${u.id}">`;
            html += `<div class="unit-header"><h2>${u.icon} UNIT ${u.id} — ${u.title}</h2></div>`;
            u.cards.forEach(c => html += buildCard(c, u.id));

            // Add pie chart for Unit 1
            if (u.id === 1) html += '<div class="chart-container"><canvas id="cost-pie-chart"></canvas></div>';
            html += '</section>';
        });
        main.innerHTML = html;

        // Render all KaTeX blocks
        document.querySelectorAll('.formula-block[data-tex]').forEach(el => {
            renderTex(el.dataset.tex, el, true);
        });

        // Render inline KaTeX in where-list and formula-desc
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(main, {
                delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
                throwOnError: false
            });
        }

        buildSidebar();
        initTabs();
        initCharts();
    }

    /* ---------- Tab Navigation ---------- */
    function initTabs() {
        const tabs = document.querySelectorAll('.unit-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const u = tab.dataset.unit;
                const sec = document.getElementById('unit-' + u);
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Update active tab on scroll
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const uid = e.target.dataset.unit;
                    tabs.forEach(t => t.classList.toggle('active', t.dataset.unit === uid));
                }
            });
        }, { rootMargin: '-100px 0px -60% 0px' });
        document.querySelectorAll('.unit-section').forEach(s => observer.observe(s));

        // Sidebar active link
        const sideLinks = document.querySelectorAll('.est-sidebar a');
        const cardObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    sideLinks.forEach(l => l.classList.toggle('active-link', l.getAttribute('href') === '#' + e.target.id));
                }
            });
        }, { rootMargin: '-120px 0px -70% 0px' });
        document.querySelectorAll('.est-card').forEach(c => cardObserver.observe(c));
    }

    /* ---------- Charts ---------- */
    function initCharts() {
        const ctx = document.getElementById('cost-pie-chart');
        if (!ctx || typeof Chart === 'undefined') return;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Material', 'Labor', 'Overhead', 'Contingency', 'Profit', 'GST'],
                datasets: [{
                    data: [40, 20, 12, 7, 12, 18],
                    backgroundColor: ['#facc15', '#00f5ff', '#f97316', '#00ff88', '#a78bfa', '#fb7185'],
                    borderColor: '#111827', borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#8892b0', font: { family: 'Inter', size: 12 } } },
                    title: { display: true, text: 'Typical Cost Breakdown', color: '#facc15', font: { family: 'Orbitron', size: 14 } }
                }
            }
        });
    }

    /* ---------- Calculator Functions ---------- */
    window.calcCostBuilder = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const mat = v('cb-mat'), lab = v('cb-lab'), oh = v('cb-oh') / 100, cont = v('cb-cont') / 100, prof = v('cb-prof') / 100;
        const dir = mat + lab, ohAmt = dir * oh, contAmt = (dir + ohAmt) * cont, profAmt = (dir + ohAmt + contAmt) * prof;
        const sub = dir + ohAmt + contAmt + profAmt, gst = sub * 0.18, total = sub + gst;
        const res = document.querySelector('#res-costBuilder');
        res.querySelector('.calc-result__value').textContent = '₹ ' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Direct: ₹${dir.toLocaleString()}<br>Overhead (${(oh * 100)}%): ₹${ohAmt.toLocaleString()}<br>Contingency (${(cont * 100)}%): ₹${contAmt.toLocaleString()}<br>Profit (${(prof * 100)}%): ₹${profAmt.toLocaleString()}<br>Subtotal: ₹${sub.toLocaleString()}<br>GST (18%): ₹${gst.toLocaleString()}<br><strong style="color:var(--neon-cyan)">Final Tender: ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>`;
    };

    window.calcCableSizer = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const P = v('cs-p'), V = v('cs-v'), pf = v('cs-pf'), L = v('cs-l');
        const mat = document.getElementById('cs-mat')?.value || 'Copper';
        const rho = mat === 'Copper' ? 1.72e-8 : 2.82e-8;
        const I = P / (V * pf);
        const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];
        const allowed = V * 0.05;
        let sel = sizes[sizes.length - 1];
        for (const s of sizes) { if (2 * rho * L * I / (s * 1e-6) <= allowed) { sel = s; break; } }
        const vd = 2 * rho * L * I / (sel * 1e-6);
        const pctVd = (vd / V) * 100;
        const res = document.querySelector('#res-cableSizer');
        res.querySelector('.calc-result__value').textContent = sel + 'mm² ' + mat;
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Current: ${I.toFixed(1)} A<br>VD: ${vd.toFixed(2)} V (${pctVd.toFixed(1)}%)<br>Status: ${pctVd <= 5 ? '<span style="color:#00ff88">✓ PASS</span>' : '<span style="color:#fb7185">✗ FAIL — increase CSA</span>'}`;
    };

    window.calcVoltageDrop = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const I = v('vd-i'), L = v('vd-l'), A = v('vd-a'), Vs = v('vd-v');
        const mat = document.getElementById('vd-mat')?.value || 'Copper';
        const rho = mat === 'Copper' ? 1.72e-8 : 2.82e-8;
        const vd = 2 * rho * L * I / (A * 1e-6);
        const pct = (vd / Vs) * 100;
        const res = document.querySelector('#res-voltageDrop');
        res.querySelector('.calc-result__value').textContent = vd.toFixed(2) + ' V (' + pct.toFixed(1) + '%)';
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Allowed: ${(Vs * 0.05).toFixed(1)} V (5%)<br>Status: ${pct <= 5 ? '<span style="color:#00ff88">✓ Within IE limits</span>' : '<span style="color:#fb7185">✗ Exceeds 5% — use larger cable</span>'}`;
    };

    window.calcMotorPanel = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const kW = v('mp-kw'), V = v('mp-v'), pf = v('mp-pf'), eff = v('mp-eff');
        const Pin = kW / eff * 1000;
        const Ifl = Pin / (Math.sqrt(3) * V * pf);
        const Icable = 1.25 * Ifl;
        const Ifuse = 2 * Ifl;
        const Imccb = 1.5 * Ifl;
        const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
        const ratings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
        let cable = sizes[sizes.length - 1];
        // Rough current capacity lookup
        const caps = [15, 21, 28, 36, 50, 68, 89, 111, 133, 171, 207, 239, 272, 310, 364];
        for (let i = 0; i < sizes.length; i++) { if (caps[i] >= Icable) { cable = sizes[i]; break; } }
        let mccb = ratings[ratings.length - 1];
        for (const r of ratings) { if (r >= Imccb) { mccb = r; break; } }
        const res = document.querySelector('#res-motorPanel');
        res.querySelector('.calc-result__value').textContent = `${cable}mm² cable, ${mccb}A MCCB`;
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Input Power: ${(Pin / 1000).toFixed(2)} kW<br>FL Current: ${Ifl.toFixed(1)} A<br>Cable rated ≥ ${Icable.toFixed(1)} A → ${cable}mm²<br>HRC Fuse: ${Math.ceil(Ifuse)} A<br>MCCB: ${mccb} A<br>OLR: ${(1.1 * Ifl).toFixed(1)}–${(1.25 * Ifl).toFixed(1)} A`;
    };

    window.calcLumen = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const E = v('lm-e'), L = v('lm-l'), W = v('lm-w'), phi = v('lm-phi'), n = v('lm-n') || 1, uf = v('lm-uf'), mf = v('lm-mf');
        const A = L * W;
        const N = Math.ceil((E * A) / (phi * n * uf * mf));
        const Hm = 2.7 - 0.8; // typical
        const K = (L * W) / (Hm * (L + W));
        const wperm2 = (N * phi / (mf * 100)) / A; // rough
        const res = document.querySelector('#res-lumenCalc');
        res.querySelector('.calc-result__value').textContent = N + ' luminaires';
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Room Area: ${A} m²<br>Room Index K: ${K.toFixed(2)}<br>Max Spacing: ${(1.0 * Hm).toFixed(1)} m<br>Layout: ${Math.ceil(Math.sqrt(N))} × ${Math.ceil(N / Math.ceil(Math.sqrt(N)))} grid`;
    };

    window.calcTransformer = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const kW = v('ts-kw'), pf = v('ts-pf');
        const kva = kW / pf;
        const std = [25, 63, 100, 160, 250, 315, 400, 500, 630, 1000];
        let sel = std[std.length - 1];
        for (const s of std) { if (s >= kva / 0.75) { sel = s; break; } }
        const Ihv = (sel * 1000) / (Math.sqrt(3) * 11000);
        const Ilv = (sel * 1000) / (Math.sqrt(3) * 415);
        const res = document.querySelector('#res-transformerSizer');
        res.querySelector('.calc-result__value').textContent = sel + ' kVA Transformer';
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Required kVA: ${kva.toFixed(1)}<br>Selected (75% loading): ${sel} kVA<br>HV Current (11kV): ${Ihv.toFixed(2)} A<br>LV Current (415V): ${Ilv.toFixed(1)} A<br>HV Fuse: ${Math.ceil(2 * Ihv)} A<br>LV MCCB: ≥ ${Math.ceil(1.25 * Ilv)} A`;
    };

    window.calcEarth = function () {
        const v = id => parseFloat(document.getElementById(id)?.value) || 0;
        const rho = v('ec-rho'), L = v('ec-l'), d = v('ec-d'), Rreq = v('ec-req');
        const R1 = (rho / (2 * Math.PI * L)) * Math.log(4 * L / d);
        const n = Math.ceil(R1 / Rreq);
        const Rp = R1 / n * 1.2; // spacing factor
        const res = document.querySelector('#res-earthCalc');
        res.querySelector('.calc-result__value').textContent = n + ' electrodes (R ≈ ' + Rp.toFixed(1) + ' Ω)';
        res.querySelector('.calc-result__breakdown').innerHTML =
            `Single electrode R: ${R1.toFixed(2)} Ω<br>Required R: ≤ ${Rreq} Ω<br>Electrodes needed: ${n}<br>Parallel R (with factor): ${Rp.toFixed(2)} Ω<br>Salt: ${n * 10} kg, Charcoal: ${n * 10} kg`;
    };

    /* ---------- BOQ Recalculate ---------- */
    window.recalcBOQ = function (input) {
        const row = input.closest('tr');
        const qtyInput = row.querySelector('[data-col="3"]');
        const rateInput = row.querySelector('[data-col="4"]');
        const amtCell = row.querySelector('.boq-amt');
        if (qtyInput && rateInput && amtCell) {
            const qty = parseFloat(qtyInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            amtCell.textContent = '₹ ' + (qty * rate).toLocaleString();
        }
        // Update total
        const table = input.closest('table');
        const totalCell = table?.querySelector('.boq-total');
        if (totalCell) {
            let total = 0;
            table.querySelectorAll('.boq-amt').forEach(c => {
                total += parseFloat(c.textContent.replace(/[₹,\s]/g, '')) || 0;
            });
            totalCell.textContent = '₹ ' + total.toLocaleString();
        }
    };

    /* ---------- Init ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for KaTeX to load
        const waitKatex = setInterval(() => {
            if (typeof katex !== 'undefined') {
                clearInterval(waitKatex);
                renderEstimation();
            }
        }, 100);
        // Fallback after 3s
        setTimeout(() => { clearInterval(waitKatex); renderEstimation(); }, 3000);
    });
})();
