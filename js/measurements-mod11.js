/* ═══════════════════════════════════════════════════════════
   MODULE 11 — Lissajous Phase, DVM, Q-Meter,
   Transducers & Sensors
   Accent: #a78bfa (Purple — Sensors)
   8 Cards | D3.js + SVG + KaTeX
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── Colour Constants ────────────────────────────────── */
    const PURPLE = '#a78bfa', GREEN  = '#00ff88', CYAN   = '#00f5ff',
          GOLD   = '#facc15', ORANGE = '#f97316', ROSE   = '#fb7185',
          BLUE   = '#60a5fa', RED    = '#ef4444', MUTED  = '#94a3b8';

    /* ── Helpers ─────────────────────────────────────────── */
    const el  = id => document.getElementById(id);
    const num = id => parseFloat(el(id)?.value) || 0;
    const fmt = (v, d = 4) => Number.isFinite(v) ? +v.toFixed(d) : '—';
    const deg2rad = d => d * Math.PI / 180;
    const rad2deg = r => r * 180 / Math.PI;

    function calcOn(ids, fn) {
        ids.forEach(id => {
            const e = el(id);
            if (e) e.addEventListener('input', fn);
        });
        fn();
    }

    /* ── Bookmarks ──────────────────────────────────────── */
    function initBookmarks() {
        document.querySelectorAll('.m11-bookmark-btn').forEach(btn => {
            const key = 'bkmk_' + btn.dataset.card;
            if (localStorage.getItem(key) === '1') btn.textContent = '🔖 ✓';
            btn.addEventListener('click', () => {
                const on = localStorage.getItem(key) === '1';
                localStorage.setItem(key, on ? '0' : '1');
                btn.textContent = on ? '🔖 Bookmark' : '🔖 ✓';
            });
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.1 — Lissajous Patterns: Phase Measurement
       ══════════════════════════════════════════════════════ */
    function initCard111() {
        const lissPath  = el('m11-liss-path');
        const phiSlider = el('m11-liss-phi');
        const phiVal    = el('m11-liss-phi-val');
        const shapeBadge  = el('m11-liss-shape');
        const quadBadge   = el('m11-liss-quad');
        const computedBdg = el('m11-liss-computed');
        const x0Line  = el('m11-x0-line');
        const xmLine  = el('m11-xm-line');
        const x0Label = el('m11-x0-label');
        const xmLabel = el('m11-xm-label');
        const dirArrow = el('m11-dir-arrow');
        if (!lissPath || !phiSlider) return;

        function drawLissajous() {
            const phiDeg = +phiSlider.value;
            const phi = deg2rad(phiDeg);
            phiVal.textContent = phiDeg;

            // Draw 1:1 Lissajous: x = sin(t+φ), y = sin(t)
            let d = '';
            const amp = 80;
            for (let i = 0; i <= 720; i++) {
                const t = (i / 720) * 2 * Math.PI;
                const x = 100 + amp * Math.sin(t + phi);
                const y = 100 - amp * Math.sin(t);
                d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            }
            lissPath.setAttribute('d', d);

            // Compute X0 (x-intercept: where y=0, i.e. t=0 → x=sin(φ))
            const X0 = Math.abs(Math.sin(phi));
            const Xm = 1; // max amplitude always 1 for 1:1

            // Measurement overlay: X0 line (horizontal from center to intercept)
            const x0px = 100 + amp * Math.sin(phi);
            x0Line.setAttribute('x1', '100'); x0Line.setAttribute('y1', '100');
            x0Line.setAttribute('x2', x0px.toFixed(1)); x0Line.setAttribute('y2', '100');
            x0Label.setAttribute('x', ((100 + x0px) / 2).toFixed(1));
            x0Label.setAttribute('y', '96');

            // Xm line (from center to max x)
            xmLine.setAttribute('x1', '100'); xmLine.setAttribute('y1', '100');
            xmLine.setAttribute('x2', (100 + amp).toFixed(1)); xmLine.setAttribute('y2', '100');
            xmLabel.setAttribute('x', ((100 + 100 + amp) / 2).toFixed(1));
            xmLabel.setAttribute('y', '112');

            // Shape description
            const pNorm = phiDeg % 360;
            let shape, isQ13;
            if (pNorm === 0 || pNorm === 360) {
                shape = 'Line (Q I,III)'; isQ13 = true;
            } else if (pNorm > 0 && pNorm < 90) {
                shape = 'Ellipse (Q I,III)'; isQ13 = true;
            } else if (pNorm === 90) {
                shape = 'Circle (CW)'; isQ13 = true;
            } else if (pNorm > 90 && pNorm < 180) {
                shape = 'Ellipse (Q II,IV)'; isQ13 = false;
            } else if (pNorm === 180) {
                shape = 'Line (Q II,IV)'; isQ13 = false;
            } else if (pNorm > 180 && pNorm < 270) {
                shape = 'Ellipse (Q II,IV)'; isQ13 = false;
            } else if (pNorm === 270) {
                shape = 'Circle (CCW)'; isQ13 = false;
            } else {
                shape = 'Ellipse (Q I,III)'; isQ13 = true;
            }
            shapeBadge.textContent = shape;

            // Quadrant formula badge
            const sinPhi = X0 / Xm;
            const baseAngle = fmt(rad2deg(Math.asin(Math.min(sinPhi, 1))), 1);
            if (isQ13) {
                quadBadge.textContent = `φ = sin⁻¹(X₀/Xm)`;
                computedBdg.textContent = `φ = ${baseAngle}° (or ${fmt(360 - baseAngle, 1)}°)`;
            } else {
                quadBadge.textContent = `φ = 180°−sin⁻¹(X₀/Xm)`;
                computedBdg.textContent = `φ = ${fmt(180 - baseAngle, 1)}° (or ${fmt(360 - (180 - baseAngle), 1)}°)`;
            }

            // Direction arrow
            if (pNorm <= 180) {
                dirArrow.textContent = '↻ CW (0°→180°)';
                dirArrow.setAttribute('fill', GOLD);
            } else {
                dirArrow.textContent = '↺ CCW (180°→360°)';
                dirArrow.setAttribute('fill', ORANGE);
            }
        }

        phiSlider.addEventListener('input', drawLissajous);
        drawLissajous();

        // Presets
        document.querySelectorAll('.m11-liss-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                phiSlider.value = btn.dataset.p;
                drawLissajous();
            });
        });

        // Calculator
        calcOn(['m11-lpc-x0', 'm11-lpc-xm'], () => {
            const x0 = Math.abs(num('m11-lpc-x0'));
            const xm = num('m11-lpc-xm');
            const quad = el('m11-lpc-quad')?.value;
            if (xm <= 0) { el('m11-lpc-result').textContent = 'Xm must be > 0'; return; }
            const ratio = Math.min(x0 / xm, 1);
            const base = rad2deg(Math.asin(ratio));
            if (quad === '13') {
                el('m11-lpc-result').textContent =
                    `φ = sin⁻¹(${fmt(ratio, 4)}) = ${fmt(base, 2)}° | 2nd: ${fmt(360 - base, 2)}°`;
            } else {
                el('m11-lpc-result').textContent =
                    `φ = 180°−sin⁻¹(${fmt(ratio, 4)}) = ${fmt(180 - base, 2)}° | 2nd: ${fmt(360 - (180 - base), 2)}°`;
            }
        });
        el('m11-lpc-quad')?.addEventListener('change', () => {
            const fn = el('m11-lpc-x0');
            if (fn) fn.dispatchEvent(new Event('input'));
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.2 — Digital Voltmeters (DVM)
       ══════════════════════════════════════════════════════ */
    function initCard112() {
        const vxSlider = el('m11-dvm-vx');
        const vxVal    = el('m11-dvm-vx-val');
        const segDisp  = el('m11-7seg');
        const ramp1    = el('m11-dvm-ramp1');
        const ramp2    = el('m11-dvm-ramp2');
        const t2line   = el('m11-dvm-t2line');
        const t2lbl    = el('m11-dvm-t2lbl');
        const zeroDot  = el('m11-dvm-zero');
        const t2badge  = el('m11-dvm-t2badge');
        const cntBadge = el('m11-dvm-counter');
        const nSel     = el('m11-dvm-N');
        const resBadge = el('m11-dvm-res-badge');
        if (!vxSlider) return;

        const Vref = 5; // reference voltage

        function updateDVM() {
            const Vx = +vxSlider.value;
            vxVal.textContent = Vx.toFixed(1);

            // T2 ∝ Vx: T2/T1 = Vx/Vref
            const T1_px = 110; // fixed pixels for T1
            const T2_frac = Vx / Vref;
            const T2_px = T1_px * T2_frac;
            const peakY = 120 - (90 * T2_frac); // ramp height ∝ Vx

            // Update ramp SVG
            ramp1.setAttribute('x2', 150); ramp1.setAttribute('y2', peakY.toFixed(1));
            ramp2.setAttribute('x1', 150); ramp2.setAttribute('y1', peakY.toFixed(1));
            const zeroX = 150 + T2_px;
            ramp2.setAttribute('x2', Math.min(zeroX, 280).toFixed(1)); ramp2.setAttribute('y2', '120');
            t2line.setAttribute('x2', Math.min(zeroX, 280).toFixed(1));
            t2lbl.setAttribute('x', ((150 + Math.min(zeroX, 280)) / 2).toFixed(1));
            zeroDot.setAttribute('cx', Math.min(zeroX, 280).toFixed(1));

            // Counter value
            const N = parseFloat(nSel.value);
            const fullN = Math.floor(N);
            const maxCount = Math.pow(10, fullN) * (N % 1 >= 0.5 ? 2 : 1);
            const count = Math.round((Vx / Vref) * Math.pow(10, fullN));
            const digits = String(count).padStart(4, '0');
            segDisp.textContent = digits;

            t2badge.innerHTML = `T₂/T₁ = ${fmt(T2_frac, 3)}`;
            cntBadge.textContent = `Count = ${count}`;

            // Resolution
            const res = 1 / Math.pow(10, fullN);
            resBadge.textContent = `Res = ${fmt(res * 100, 3)}%`;
        }

        vxSlider.addEventListener('input', updateDVM);
        nSel.addEventListener('change', updateDVM);
        updateDVM();

        // DVM Calculator
        calcOn(['m11-dvmc-N', 'm11-dvmc-range'], () => {
            const N = num('m11-dvmc-N');
            const range = num('m11-dvmc-range');
            const fullN = Math.floor(N);
            const res = 1 / Math.pow(10, fullN);
            const sens = res * range;
            el('m11-dvmc-res-result').textContent =
                `Resolution = 1/10^${fullN} = ${fmt(res * 100, 4)}% | Sensitivity = ${fmt(sens * 1000, 2)} mV`;
        });

        calcOn(['m11-dvmc-vref', 'm11-dvmc-t1', 'm11-dvmc-t2'], () => {
            const vref = num('m11-dvmc-vref'), t1 = num('m11-dvmc-t1'), t2 = num('m11-dvmc-t2');
            if (t1 <= 0) { el('m11-dvmc-ds-result').textContent = 'T₁ must be > 0'; return; }
            const vx = vref * t2 / t1;
            el('m11-dvmc-ds-result').textContent =
                `Vx = ${fmt(vref)} × ${fmt(t2)}/${fmt(t1)} = ${fmt(vx, 4)} V | Tconv = ${fmt(t1 + t2)} ms`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.3 — Q-Meter: Quality Factor Measurement
       ══════════════════════════════════════════════════════ */
    function initCard113() {
        const fSlider = el('m11-qm-f');
        const fVal    = el('m11-qm-f-val');
        const qBadge  = el('m11-qm-q-badge');
        const vcBadge = el('m11-qm-vc-badge');
        if (!fSlider) return;

        // Default coil params
        const L = 0.01; // 10mH
        const R = 5;    // 5 Ohm
        const Vs = 1;   // 1V source

        // Resonance chart
        const container = el('m11-qm-chart');
        if (container && typeof d3 !== 'undefined') {
            const cW = 260, cH = 90, m = { t: 8, r: 8, b: 24, l: 32 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const xSc = d3.scaleLinear().domain([10, 1000]).range([0, w]);
            const ySc = d3.scaleLinear().domain([0, 1]).range([h, 0]);

            g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
            g.append('g').call(d3.axisLeft(ySc).ticks(4)).selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            // Compute resonance frequency
            // C for resonance at ~500kHz not realistic, so we'll model a normalized response
            // Peak at f_res, Q determines bandwidth
            const fRes = 500; // kHz
            const Q = (2 * Math.PI * fRes * 1000 * L) / R;
            const data = d3.range(10, 1001, 5).map(f => {
                const ratio = f / fRes;
                const mag = 1 / Math.sqrt(1 + Q * Q * (ratio - 1 / ratio) * (ratio - 1 / ratio));
                return { f, mag };
            });

            g.append('path').datum(data).attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 1.5)
                .attr('d', d3.line().x(d => xSc(d.f)).y(d => ySc(d.mag)));

            // Frequency indicator line
            const freqLine = g.append('line').attr('y1', 0).attr('y2', h).attr('stroke', PURPLE).attr('stroke-width', 1).attr('stroke-dasharray', '3 2');

            g.append('text').attr('x', w / 2).attr('y', h + 18).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('f (kHz)');
            g.append('text').attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -22).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('Response');

            function updateQ() {
                const f = +fSlider.value;
                fVal.textContent = f;
                freqLine.attr('x1', xSc(f)).attr('x2', xSc(f));

                const ratio = f / fRes;
                const mag = 1 / Math.sqrt(1 + Q * Q * (ratio - 1 / ratio) * (ratio - 1 / ratio));
                const Vc = mag * Q * Vs;
                const Qdisp = mag * Q;

                qBadge.innerHTML = `Q = ${fmt(Qdisp, 1)}`;
                vcBadge.innerHTML = `V<sub>C</sub> = ${fmt(Vc, 2)} V`;
            }

            fSlider.addEventListener('input', updateQ);
            updateQ();
        }

        // Q calculator
        calcOn(['m11-qmc-w', 'm11-qmc-L', 'm11-qmc-R'], () => {
            const w = num('m11-qmc-w'), L_mH = num('m11-qmc-L'), R_ohm = num('m11-qmc-R');
            if (R_ohm <= 0) { el('m11-qmc-q-result').textContent = 'R must be > 0'; return; }
            const Q = (w * L_mH / 1000) / R_ohm;
            el('m11-qmc-q-result').textContent = `Q = ω·L/R = ${fmt(w)}×${fmt(L_mH / 1000)}/${fmt(R_ohm)} = ${fmt(Q, 2)}`;
        });

        // Distributed capacitance
        calcOn(['m11-qmc-c1', 'm11-qmc-c2', 'm11-qmc-n'], () => {
            const C1 = num('m11-qmc-c1'), C2 = num('m11-qmc-c2'), n = num('m11-qmc-n');
            if (n * n - 1 === 0) { el('m11-qmc-cd-result').textContent = 'n must be ≠ 1'; return; }
            const Cd = (C1 * n * n - C2) / (n * n - 1);
            el('m11-qmc-cd-result').textContent = `Cd = (${fmt(C1)}×${fmt(n)}²−${fmt(C2)})/(${fmt(n)}²−1) = ${fmt(Cd, 2)} pF`;
        });

        // True Q
        calcOn(['m11-qmc-qm', 'm11-qmc-rs', 'm11-qmc-r2'], () => {
            const Qm = num('m11-qmc-qm'), Rs = num('m11-qmc-rs'), R2 = num('m11-qmc-r2');
            if (R2 <= 0) { el('m11-qmc-qt-result').textContent = 'R must be > 0'; return; }
            const Qt = Qm * (1 + Rs / R2);
            const pctErr = (-Rs / (R2 + Rs)) * 100;
            el('m11-qmc-qt-result').textContent =
                `Qtrue = ${fmt(Qm)}×(1+${fmt(Rs)}/${fmt(R2)}) = ${fmt(Qt, 2)} | %err = ${fmt(pctErr, 2)}%`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.4 — Galvanometer & Transducer Overview
       ══════════════════════════════════════════════════════ */
    function initCard114() {
        const iSlider = el('m11-galv-I');
        const iVal    = el('m11-galv-I-val');
        const ptr     = el('m11-galv-ptr');
        const thetaLbl = el('m11-galv-theta');
        if (!iSlider) return;

        // G/K ratio for display: max deflection ~45° at 50mA
        function updateGalv() {
            const I = +iSlider.value;
            iVal.textContent = I;
            const thetaDeg = I * 0.9; // ≈45° at 50mA
            const thetaRad = deg2rad(thetaDeg);
            // Rotate pointer around pivot (130, 35) → endpoint
            const ptrLen = 25;
            const px = 130 + ptrLen * Math.sin(thetaRad);
            const py = 35 - ptrLen * Math.cos(thetaRad);
            ptr.setAttribute('x1', '130'); ptr.setAttribute('y1', '35');
            ptr.setAttribute('x2', px.toFixed(1)); ptr.setAttribute('y2', py.toFixed(1));
            thetaLbl.textContent = `θ = ${fmt(Math.abs(thetaDeg), 1)}° ${I >= 0 ? '(+)' : '(−)'}`;
        }

        iSlider.addEventListener('input', updateGalv);
        updateGalv();

        // Calculator
        calcOn(['m11-gc-B', 'm11-gc-N', 'm11-gc-A', 'm11-gc-K', 'm11-gc-I'], () => {
            const B = num('m11-gc-B'), N = num('m11-gc-N'), A = num('m11-gc-A') / 1e4,
                  K = num('m11-gc-K'), I = num('m11-gc-I') / 1000;
            if (K <= 0) { el('m11-gc-result').textContent = 'K must be > 0'; return; }
            const theta = (B * N * A * I) / K;
            const thetaDeg = rad2deg(theta);
            const SI = (B * N * A) / K;
            el('m11-gc-result').textContent =
                `θ = ${fmt(thetaDeg, 2)}° (${fmt(theta, 4)} rad) | SI = ${fmt(SI, 2)} rad/A`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.5 — Strain Gauge & Thermistor
       ══════════════════════════════════════════════════════ */
    function initCard115() {
        const epsSlider = el('m11-sg-eps');
        const epsVal    = el('m11-sg-eps-val');
        const drLabel   = el('m11-sg-dr');
        if (!epsSlider) return;

        const Gf = 2.1; // typical metal gauge factor
        function updateSG() {
            const eps = +epsSlider.value;
            epsVal.textContent = eps;
            const strain = eps * 1e-6;
            const dR_R = Gf * strain;
            drLabel.textContent = `ΔR/R = ${fmt(dR_R, 6)} (Gf=${Gf})`;
        }
        epsSlider.addEventListener('input', updateSG);
        updateSG();

        // Gf bar chart: Metal vs Semiconductor
        const gfContainer = el('m11-gf-chart');
        if (gfContainer && typeof d3 !== 'undefined') {
            const cW = 240, cH = 60, m = { t: 4, r: 8, b: 16, l: 70 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(gfContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const data = [{ label: 'Metal', gf: 2.5, color: BLUE }, { label: 'Semiconductor', gf: 120, color: RED }];
            const xSc = d3.scaleLinear().domain([0, 150]).range([0, w]);
            const ySc = d3.scaleBand().domain(data.map(d => d.label)).range([0, h]).padding(0.3);

            data.forEach(d => {
                g.append('rect').attr('x', 0).attr('y', ySc(d.label)).attr('width', xSc(d.gf)).attr('height', ySc.bandwidth())
                    .attr('fill', d.color).attr('opacity', 0.6).attr('rx', 3);
                g.append('text').attr('x', -4).attr('y', ySc(d.label) + ySc.bandwidth() / 2 + 3)
                    .attr('fill', d.color).attr('font-size', '6px').attr('text-anchor', 'end').text(d.label);
                g.append('text').attr('x', xSc(d.gf) + 4).attr('y', ySc(d.label) + ySc.bandwidth() / 2 + 3)
                    .attr('fill', d.color).attr('font-size', '7px').text(`Gf≈${d.gf}`);
            });
            g.append('text').attr('x', w / 2).attr('y', h + 12).attr('fill', MUTED).attr('font-size', '5px').attr('text-anchor', 'middle').text('Gauge Factor');
        }

        // Thermistor R vs T curve
        const thermContainer = el('m11-therm-chart');
        const betaSlider = el('m11-therm-beta');
        const betaVal    = el('m11-therm-beta-val');
        if (thermContainer && typeof d3 !== 'undefined') {
            const cW = 260, cH = 100, m = { t: 8, r: 8, b: 24, l: 40 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(thermContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const xSc = d3.scaleLinear().domain([-100, 300]).range([0, w]);
            // Log scale for resistance
            const ySc = d3.scaleLog().domain([1, 1e6]).range([h, 0]);

            g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5).tickFormat(d => d + '°'))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.append('g').call(d3.axisLeft(ySc).ticks(3, '.0e')).selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            const R0 = 10000; // 10kΩ at T0=25°C
            const T0K = 298.15;

            // NTC thermistor path
            const ntcPath = g.append('path').attr('fill', 'none').attr('stroke', ROSE).attr('stroke-width', 1.5);
            // RTD comparison line (linear, PTC)
            const rtdPath = g.append('path').attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1).attr('stroke-dasharray', '4 2');

            g.append('text').attr('x', w - 4).attr('y', 6).attr('fill', ROSE).attr('font-size', '6px').attr('text-anchor', 'end').text('Thermistor (NTC)');
            g.append('text').attr('x', w - 4).attr('y', h - 4).attr('fill', CYAN).attr('font-size', '6px').attr('text-anchor', 'end').text('RTD (PTC)');
            g.append('text').attr('x', w / 2).attr('y', h + 18).attr('fill', MUTED).attr('font-size', '5px').attr('text-anchor', 'middle').text('Temperature (°C)');
            g.append('text').attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -30).attr('fill', MUTED).attr('font-size', '5px').attr('text-anchor', 'middle').text('R (Ω)');

            function updateTherm() {
                const beta = +betaSlider.value;
                betaVal.textContent = beta;

                const ntcData = d3.range(-100, 301, 5).map(t => {
                    const TK = t + 273.15;
                    const R = R0 * Math.exp(beta * (1 / TK - 1 / T0K));
                    return { t, R: Math.max(1, Math.min(1e6, R)) };
                });
                ntcPath.datum(ntcData).attr('d', d3.line().x(d => xSc(d.t)).y(d => ySc(d.R)));

                // RTD: R = R0*(1 + alpha*T), alpha ~= 0.00385/°C, R0 = 100Ω at 0°C
                const rtdData = d3.range(-100, 301, 5).map(t => {
                    const R = 100 * (1 + 0.00385 * t);
                    return { t, R: Math.max(1, R) };
                });
                rtdPath.datum(rtdData).attr('d', d3.line()
                    .defined(d => d.R >= 1 && d.R <= 1e6)
                    .x(d => xSc(d.t)).y(d => ySc(d.R)));
            }

            betaSlider.addEventListener('input', updateTherm);
            updateTherm();
        }

        // Strain gauge calculator
        calcOn(['m11-sgc-dr', 'm11-sgc-dl'], () => {
            const dR = num('m11-sgc-dr'), dL = num('m11-sgc-dl');
            if (dL <= 0) { el('m11-sgc-result').textContent = 'ε must be > 0'; return; }
            const gf = dR / dL;
            el('m11-sgc-result').textContent = `Gf = (${fmt(dR)})/(${fmt(dL)}) = ${fmt(gf, 3)}`;
        });

        // Thermistor calculator
        calcOn(['m11-thc-rt2', 'm11-thc-beta', 'm11-thc-t1', 'm11-thc-t2'], () => {
            const Rt2 = num('m11-thc-rt2'), beta = num('m11-thc-beta'),
                  t1c = num('m11-thc-t1'), t2c = num('m11-thc-t2');
            const T1K = t1c + 273.15, T2K = t2c + 273.15;
            if (T1K <= 0 || T2K <= 0) { el('m11-thc-result').textContent = 'Temperatures must be > −273.15°C'; return; }
            const Rt1 = Rt2 * Math.exp(beta * (1 / T1K - 1 / T2K));
            el('m11-thc-result').textContent =
                `RT1 = ${fmt(Rt2)} × exp[${fmt(beta)}×(1/${fmt(T1K, 1)}−1/${fmt(T2K, 1)})] = ${fmt(Rt1, 3)} kΩ`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.6 — Thermocouple & LVDT
       ══════════════════════════════════════════════════════ */
    function initCard116() {
        /* Thermocouple */
        const dtSlider = el('m11-tc-dt');
        const dtVal    = el('m11-tc-dt-val');
        const emfLabel = el('m11-tc-emf');
        const typeSel  = el('m11-tc-type');
        if (!dtSlider) return;

        // Approximate a,b constants per type (mV units)
        const tcParams = {
            cu:  { a: 0.040, b: 0.00004, name: 'Cu–Const', range: '−250→+400°C' },
            fe:  { a: 0.052, b: 0.00003, name: 'Fe–Const', range: '−200→+850°C' },
            pt:  { a: 0.006, b: 0.000012, name: 'Pt/Rh–Pt', range: '0→+1400°C' },
            rh:  { a: 0.005, b: 0.000008, name: 'Rh–Ir', range: '0→+2100°C' }
        };

        function updateTC() {
            const dt = +dtSlider.value;
            dtVal.textContent = dt;
            const type = typeSel.value;
            const p = tcParams[type];
            const E = p.a * dt + p.b * dt * dt;
            emfLabel.textContent = `E = ${fmt(E, 3)} mV (${p.name})`;
        }
        dtSlider.addEventListener('input', updateTC);
        typeSel.addEventListener('change', updateTC);
        updateTC();

        /* LVDT */
        const posSlider = el('m11-lvdt-pos');
        const posVal    = el('m11-lvdt-pos-val');
        const voutBadge = el('m11-lvdt-vout');
        const core      = el('m11-lvdt-core');
        const coreLbl   = el('m11-lvdt-core-lbl');
        if (!posSlider) return;

        function updateLVDT() {
            const pos = +posSlider.value;
            posVal.textContent = pos;
            // Core x position: center=110, range ±40
            const coreX = 110 + (pos / 100) * 40;
            core.setAttribute('x', coreX.toFixed(1));
            coreLbl.setAttribute('x', (coreX + 30).toFixed(1));

            const Vout = pos * 0.05; // arbitrary scaling: ±5V at ±100%
            if (Math.abs(pos) < 3) {
                voutBadge.innerHTML = `V<sub>out</sub> = 0 (Null ✓)`;
                voutBadge.style.borderColor = GREEN;
                voutBadge.style.color = GREEN;
            } else if (pos > 0) {
                voutBadge.innerHTML = `V<sub>out</sub> = +${fmt(Math.abs(Vout), 2)} V (→)`;
                voutBadge.style.borderColor = CYAN;
                voutBadge.style.color = CYAN;
            } else {
                voutBadge.innerHTML = `V<sub>out</sub> = −${fmt(Math.abs(Vout), 2)} V (←)`;
                voutBadge.style.borderColor = ROSE;
                voutBadge.style.color = ROSE;
            }
        }
        posSlider.addEventListener('input', updateLVDT);
        updateLVDT();

        // LVDT linearity chart
        const lvdtContainer = el('m11-lvdt-chart');
        if (lvdtContainer && typeof d3 !== 'undefined') {
            const cW = 240, cH = 80, m = { t: 8, r: 8, b: 20, l: 32 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(lvdtContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const xSc = d3.scaleLinear().domain([-100, 100]).range([0, w]);
            const ySc = d3.scaleLinear().domain([-5, 5]).range([h, 0]);

            g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.append('g').call(d3.axisLeft(ySc).ticks(4)).selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            const lineData = d3.range(-100, 101, 5).map(x => ({ x, y: x * 0.05 }));
            g.append('path').datum(lineData).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1.5)
                .attr('d', d3.line().x(d => xSc(d.x)).y(d => ySc(d.y)));

            // Null dot
            g.append('circle').attr('cx', xSc(0)).attr('cy', ySc(0)).attr('r', 3).attr('fill', GREEN);
            g.append('text').attr('x', xSc(0) + 4).attr('y', ySc(0) - 4).attr('fill', GREEN).attr('font-size', '6px').text('Null');
            g.append('text').attr('x', w / 2).attr('y', h + 16).attr('fill', MUTED).attr('font-size', '5px').attr('text-anchor', 'middle').text('Displacement (%)');
        }

        // Thermocouple EMF Calculator
        calcOn(['m11-tcc-a', 'm11-tcc-b', 'm11-tcc-dth'], () => {
            const a = num('m11-tcc-a'), b = num('m11-tcc-b'), dth = num('m11-tcc-dth');
            const E = a * dth + b * dth * dth;
            el('m11-tcc-result').textContent =
                `E = ${fmt(a)}×${fmt(dth)} + ${fmt(b)}×${fmt(dth)}² = ${fmt(E, 4)} mV`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.7 — Piezoelectric Transducer & Measurements
       ══════════════════════════════════════════════════════ */
    function initCard117() {
        const fSlider = el('m11-piezo-F');
        const fVal    = el('m11-piezo-F-val');
        const qBadge  = el('m11-piezo-q');
        const eoBadge = el('m11-piezo-eo');
        const eoLabel = el('m11-piezo-v');
        if (!fSlider) return;

        // Quartz: d ≈ 2.3 pC/N, g ≈ 0.05 V·m/N, t = 2mm
        const d_piezo = 2.3e-12; // C/N
        const g_piezo = 0.05;    // V·m/N
        const t_piezo = 0.002;   // m
        const area = 0.001 * 0.001; // 1cm² = 1e-4 m²

        function updatePiezo() {
            const F = +fSlider.value;
            fVal.textContent = F;
            const Q = d_piezo * F;
            const p = F / (0.01 * 0.01); // pressure = F/area (1cm² face)
            const Eo = g_piezo * t_piezo * p;
            qBadge.textContent = `Q = ${fmt(Q * 1e12, 1)} pC`;
            eoBadge.textContent = `E₀ = ${fmt(Eo, 2)} V`;
            eoLabel.textContent = `E₀ = ${fmt(Eo, 2)} V`;
        }
        fSlider.addEventListener('input', updatePiezo);
        updatePiezo();

        // Temperature sensor range chart
        const tempContainer = el('m11-temp-range-chart');
        if (tempContainer && typeof d3 !== 'undefined') {
            const sensors = [
                { name: 'Bimetallic', lo: 20, hi: 35, color: GOLD },
                { name: 'Thermistor', lo: -100, hi: 300, color: PURPLE },
                { name: 'RTD', lo: 0, hi: 600, color: CYAN },
                { name: 'Thermocouple', lo: 0, hi: 1400, color: ORANGE },
                { name: 'Pyrometer', lo: 1200, hi: 3500, color: RED }
            ];
            const cW = 260, cH = 80, m = { t: 4, r: 8, b: 16, l: 70 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(tempContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const xSc = d3.scaleLinear().domain([-200, 3600]).range([0, w]);
            const ySc = d3.scaleBand().domain(sensors.map(s => s.name)).range([0, h]).padding(0.25);

            g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5).tickFormat(d => d + '°'))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            sensors.forEach(s => {
                g.append('rect').attr('x', xSc(s.lo)).attr('y', ySc(s.name)).attr('width', Math.max(2, xSc(s.hi) - xSc(s.lo)))
                    .attr('height', ySc.bandwidth()).attr('fill', s.color).attr('opacity', 0.5).attr('rx', 2);
                g.append('text').attr('x', -4).attr('y', ySc(s.name) + ySc.bandwidth() / 2 + 3)
                    .attr('fill', s.color).attr('font-size', '5px').attr('text-anchor', 'end').text(s.name);
            });
        }

        // Pressure gauge range chart
        const pressContainer = el('m11-pressure-chart');
        if (pressContainer && typeof d3 !== 'undefined') {
            const gauges = [
                { name: 'Ionization', lo: -8, hi: -7, color: BLUE },
                { name: 'McLeod', lo: -4, hi: -3, color: PURPLE },
                { name: 'Thermistor', lo: -2.6, hi: -1.9, color: ROSE },
                { name: 'TC vacuum', lo: -2, hi: -1, color: ORANGE },
                { name: 'Pirani', lo: -3, hi: -1, color: CYAN }
            ];
            const cW = 260, cH = 70, m = { t: 4, r: 8, b: 16, l: 64 };
            const w = cW - m.l - m.r, h = cH - m.t - m.b;
            const svg = d3.select(pressContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
                .style('width', '100%').style('max-width', cW + 'px');
            const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

            const xSc = d3.scaleLinear().domain([-9, 0]).range([0, w]);
            const ySc = d3.scaleBand().domain(gauges.map(s => s.name)).range([0, h]).padding(0.25);

            g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5).tickFormat(d => '10^' + d))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '5px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            gauges.forEach(s => {
                g.append('rect').attr('x', xSc(s.lo)).attr('y', ySc(s.name)).attr('width', Math.max(2, xSc(s.hi) - xSc(s.lo)))
                    .attr('height', ySc.bandwidth()).attr('fill', s.color).attr('opacity', 0.5).attr('rx', 2);
                g.append('text').attr('x', -4).attr('y', ySc(s.name) + ySc.bandwidth() / 2 + 3)
                    .attr('fill', s.color).attr('font-size', '5px').attr('text-anchor', 'end').text(s.name);
            });
        }

        // Piezoelectric calculator
        calcOn(['m11-pc-d', 'm11-pc-F', 'm11-pc-g', 'm11-pc-t', 'm11-pc-p'], () => {
            const d_c = num('m11-pc-d'), F = num('m11-pc-F'), g_c = num('m11-pc-g'),
                  t_c = num('m11-pc-t'), p_c = num('m11-pc-p');
            const Q_calc = d_c * F; // pC
            const Eo = (g_c / 1000) * (t_c / 1000) * (p_c * 1000); // V
            el('m11-pc-result').textContent =
                `Q = ${fmt(d_c)}×${fmt(F)} = ${fmt(Q_calc, 1)} pC | E₀ = ${fmt(g_c/1000, 4)}×${fmt(t_c/1000, 4)}×${fmt(p_c * 1000)} = ${fmt(Eo, 3)} V`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 11.8 — Module 11 Complete Reference
       ══════════════════════════════════════════════════════ */
    function initCard118() {
        // Flip cards
        document.querySelectorAll('.m11-flip-card').forEach(card => {
            const inner = card.querySelector('div');
            if (!inner) return;
            let flipped = false;
            const front = card.dataset.front;
            const back  = card.dataset.back;
            inner.addEventListener('click', () => {
                flipped = !flipped;
                inner.textContent = flipped ? back : front;
                inner.style.borderColor = flipped ? 'rgba(167,139,250,0.6)' : '';
            });
        });

        // Quiz
        const quizQ = el('m11-quiz-q');
        const feedback = el('m11-quiz-feedback');
        const quizBtns = document.querySelectorAll('.m11-quiz-btn');

        const questions = [
            { q: 'Measure temperature up to 2000°C?', ans: 2, explain: 'Thermocouple (Rh/Ir): range 0–2100°C' },
            { q: 'Measure very small displacement?', ans: 1, explain: 'LVDT: frictionless, infinite resolution' },
            { q: 'Measure dynamic pressure?', ans: 0, explain: 'Piezoelectric: ideal for dynamic forces' },
            { q: 'Measure strain on a structure?', ans: 3, explain: 'Strain gauge: Gf = (ΔR/R)/ε' }
        ];
        const answers = [
            ['Thermistor', 'RTD', 'Thermocouple (Rh/Ir)', 'Strain Gauge'],
            ['Potentiometer', 'LVDT', 'Pyrometer', 'Bimetallic'],
            ['Piezoelectric', 'RTD', 'Bourdon tube', 'LVDT'],
            ['Thermistor', 'Pyrometer', 'LVDT', 'Strain Gauge']
        ];

        let qIdx = 0;
        function loadQuiz() {
            if (qIdx >= questions.length) qIdx = 0;
            const qq = questions[qIdx];
            quizQ.textContent = qq.q;
            feedback.textContent = '';
            quizBtns.forEach((btn, i) => {
                btn.textContent = answers[qIdx][i];
                btn.dataset.a = i === qq.ans ? '1' : '0';
                btn.style.borderColor = '';
                btn.style.color = '';
            });
        }

        quizBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const correct = btn.dataset.a === '1';
                if (correct) {
                    btn.style.borderColor = GREEN;
                    btn.style.color = GREEN;
                    feedback.textContent = '✓ ' + questions[qIdx].explain;
                    feedback.style.color = GREEN;
                    setTimeout(() => { qIdx++; loadQuiz(); }, 2000);
                } else {
                    btn.style.borderColor = RED;
                    btn.style.color = RED;
                    feedback.textContent = '✗ Try again!';
                    feedback.style.color = RED;
                }
            });
        });
        loadQuiz();
    }

    /* ══════════════════════════════════════════════════════
       INIT
       ══════════════════════════════════════════════════════ */
    function init() {
        initBookmarks();
        initCard111();
        initCard112();
        initCard113();
        initCard114();
        initCard115();
        initCard116();
        initCard117();
        initCard118();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
