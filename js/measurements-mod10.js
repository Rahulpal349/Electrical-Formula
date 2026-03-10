/* ═══════════════════════════════════════════════════════════
   MODULE 10 — CRO & Electronic Measurements
   Accent: #00f5ff (Cyan — Oscilloscope)
   6 Cards | D3.js + SVG + KaTeX
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── Colour Constants ────────────────────────────────── */
    const CYAN   = '#00f5ff', GREEN  = '#00ff88', GOLD   = '#facc15',
          BLUE   = '#60a5fa', ORANGE = '#f97316', VIOLET = '#a78bfa',
          ROSE   = '#fb7185', RED    = '#ef4444', MUTED  = '#94a3b8';

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
        document.querySelectorAll('.m10-bookmark-btn').forEach(btn => {
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
       CARD 10.1 — Energy Meter: Speed & Temperature Compensation
       ══════════════════════════════════════════════════════ */
    function initCard101() {
        /* MUTEMP temperature chart */
        const chartW = 260, chartH = 100, margin = { t: 10, r: 10, b: 28, l: 36 };
        const cW = chartW - margin.l - margin.r, cH = chartH - margin.t - margin.b;
        const container = el('m10-mutemp-chart');
        if (!container || typeof d3 === 'undefined') return;

        const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${chartW} ${chartH}`)
            .style('width', '100%').style('max-width', chartW + 'px');
        const g = svg.append('g').attr('transform', `translate(${margin.l},${margin.t})`);

        const xScale = d3.scaleLinear().domain([20, 80]).range([0, cW]);
        const yScale = d3.scaleLinear().domain([0.6, 1.4]).range([cH, 0]);

        g.append('g').attr('transform', `translate(0,${cH})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '°'))
            .selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
        g.append('g').call(d3.axisLeft(yScale).ticks(4)).selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
        g.selectAll('.domain, .tick line').attr('stroke', '#334155');

        // Without MUTEMP: speed increases with temp
        const noMuData = d3.range(20, 81, 2).map(t => ({ t, s: 1 + 0.008 * (t - 25) }));
        g.append('path').datum(noMuData).attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => xScale(d.t)).y(d => yScale(d.s)));

        // With MUTEMP: speed stays ~1
        const muData = d3.range(20, 81, 2).map(t => ({ t, s: 1 + 0.0005 * (t - 25) }));
        g.append('path').datum(muData).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => xScale(d.t)).y(d => yScale(d.s)));

        // Temp indicator line
        const tempLine = g.append('line').attr('y1', 0).attr('y2', cH).attr('stroke', VIOLET).attr('stroke-width', 1).attr('stroke-dasharray', '3 2');

        // Labels
        g.append('text').attr('x', cW - 4).attr('y', yScale(1 + 0.008 * (80 - 25)) + 3).attr('fill', RED).attr('font-size', '6px').attr('text-anchor', 'end').text('No MUTEMP');
        g.append('text').attr('x', cW - 4).attr('y', yScale(1 + 0.0005 * (80 - 25)) - 4).attr('fill', GREEN).attr('font-size', '6px').attr('text-anchor', 'end').text('MUTEMP');
        g.append('text').attr('x', cW / 2).attr('y', cH + 22).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('Temperature (°C)');
        g.append('text').attr('transform', 'rotate(-90)').attr('x', -cH / 2).attr('y', -26).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('Rel. Speed');

        const tempSlider = el('m10-temp');
        const tempVal = el('m10-temp-val');
        const noMuBadge = el('m10-no-mutemp');
        const muBadge = el('m10-with-mutemp');

        function updateTemp() {
            const t = +tempSlider.value;
            tempVal.textContent = t;
            tempLine.attr('x1', xScale(t)).attr('x2', xScale(t));
            const speedNo = 1 + 0.008 * (t - 25);
            const speedMu = 1 + 0.0005 * (t - 25);
            noMuBadge.textContent = `Without MUTEMP: ×${fmt(speedNo, 2)}`;
            muBadge.textContent = `With MUTEMP: ×${fmt(speedMu, 3)} ✓`;
        }
        tempSlider.addEventListener('input', updateTemp);
        updateTemp();

        /* Brake magnet position */
        const brakeSlider = el('m10-brake-pos');
        const brakeVal = el('m10-brake-val');
        const brakeBadge = el('m10-brake-badge');
        function updateBrake() {
            const p = +brakeSlider.value;
            brakeVal.textContent = p;
            const braking = p < 35 ? 'Low' : p < 70 ? 'Medium' : 'High';
            const speed = p < 35 ? 'Fast' : p < 70 ? 'Medium' : 'Slow';
            brakeBadge.textContent = `${braking} braking → ${speed} speed`;
        }
        brakeSlider.addEventListener('input', updateBrake);
        updateBrake();

        /* Creeping calculator */
        calcOn(['m10-crp-rev', 'm10-crp-load'], () => {
            const rev = num('m10-crp-rev'), load = num('m10-crp-load');
            if (load <= 0) { el('m10-crp-result').textContent = 'Load rev must be > 0'; return; }
            const pct = (rev / load) * 100;
            el('m10-crp-result').textContent = `Creeping Error = ${fmt(pct, 3)}%`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 10.2 — CRO Overview
       ══════════════════════════════════════════════════════ */
    function initCard102() {
        const modeYt = el('m10-mode-yt');
        const modeXy = el('m10-mode-xy');
        const waveform = el('m10-waveform');
        const screenLabel = el('m10-screen-label');
        const croInfo = el('m10-cro-info');
        if (!modeYt || !waveform) return;

        let mode = 'yt';

        function drawYt() {
            let d = '';
            for (let x = 2; x <= 218; x++) {
                const y = 70 - 45 * Math.sin(2 * Math.PI * (x - 2) / 108);
                d += (x === 2 ? 'M' : 'L') + x + ',' + y.toFixed(1);
            }
            waveform.setAttribute('d', d);
            waveform.setAttribute('stroke', GREEN);
            screenLabel.textContent = 'y-t: Voltage vs Time';
            croInfo.textContent = 'Sine wave | y-t mode';
            croInfo.style.borderColor = GREEN;
            croInfo.style.color = GREEN;
        }

        function drawXy() {
            let d = '';
            for (let i = 0; i <= 360; i++) {
                const rad = deg2rad(i);
                const x = 110 + 80 * Math.sin(rad);
                const y = 70 - 55 * Math.sin(rad + Math.PI / 2);
                d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            }
            waveform.setAttribute('d', d);
            waveform.setAttribute('stroke', GOLD);
            screenLabel.textContent = 'x-y: Lissajous — circle (φ = 90°)';
            croInfo.textContent = 'Circle | x-y mode (φ=90°)';
            croInfo.style.borderColor = GOLD;
            croInfo.style.color = GOLD;
        }

        function setMode(m) {
            mode = m;
            modeYt.classList.toggle('active', m === 'yt');
            modeXy.classList.toggle('active', m === 'xy');
            if (m === 'yt') drawYt(); else drawXy();
        }

        modeYt.addEventListener('click', () => setMode('yt'));
        modeXy.addEventListener('click', () => setMode('xy'));
        setMode('yt');

        /* Animate phosphor spot glow */
        const spot = el('m10-spot');
        if (spot) {
            let phase = 0;
            (function pulse() {
                phase += 0.04;
                const opacity = 0.6 + 0.4 * Math.sin(phase);
                spot.setAttribute('opacity', opacity.toFixed(2));
                requestAnimationFrame(pulse);
            })();
        }
    }

    /* ══════════════════════════════════════════════════════
       CARD 10.3 — CRO Deflection: Electrostatic vs Magnetic
       ══════════════════════════════════════════════════════ */
    function initCard103() {
        /* Electrostatic deflection interactive SVG */
        const vdSlider = el('m10-vd');
        const vdVal = el('m10-vd-val');
        const beam = el('m10-esd-beam');
        const spot = el('m10-esd-spot');
        const darrow = el('m10-esd-darrow1');
        const dlbl = el('m10-esd-dlbl');
        const deflBadge = el('m10-defl-badge');
        const sensBadge = el('m10-sens-badge');

        // Default CRT params for visual
        const L = 0.15, ld = 0.04, d_plates = 0.012, Ea = 2000;

        function updateEsd() {
            if (!vdSlider) return;
            const Vd = +vdSlider.value;
            vdVal.textContent = Vd;
            const D_m = (L * ld * Vd) / (2 * d_plates * Ea);
            const S = (L * ld) / (2 * d_plates * Ea);
            const pxDefl = Math.max(-50, Math.min(50, D_m * 1200)); // map to SVG px
            const spotY = 60 - pxDefl;

            beam.setAttribute('d', `M 10 60 Q 110 60 240 ${spotY.toFixed(1)}`);
            spot.setAttribute('cy', spotY.toFixed(1));
            if (darrow) {
                darrow.setAttribute('y1', 60);
                darrow.setAttribute('y2', spotY.toFixed(1));
            }
            if (dlbl) dlbl.setAttribute('y', ((60 + spotY) / 2).toFixed(1));
            if (deflBadge) deflBadge.textContent = `D = ${fmt(D_m * 1000, 2)} mm`;
            if (sensBadge) sensBadge.textContent = `S = ${fmt(S * 1000, 3)} mm/V`;
        }
        if (vdSlider) { vdSlider.addEventListener('input', updateEsd); updateEsd(); }

        /* S vs Ea comparison chart */
        const chartContainer = el('m10-s-vs-ea-chart');
        if (!chartContainer || typeof d3 === 'undefined') return;
        const cW = 280, cH = 110, m = { t: 10, r: 10, b: 28, l: 40 };
        const w = cW - m.l - m.r, h = cH - m.t - m.b;

        const svg = d3.select(chartContainer).append('svg').attr('viewBox', `0 0 ${cW} ${cH}`)
            .style('width', '100%').style('max-width', cW + 'px');
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

        const xSc = d3.scaleLinear().domain([500, 5000]).range([0, w]);
        const ySc = d3.scaleLinear().domain([0, 1]).range([h, 0]);

        g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xSc).ticks(5).tickFormat(d => d / 1000 + 'k'))
            .selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
        g.append('g').call(d3.axisLeft(ySc).ticks(4)).selectAll('text').attr('fill', MUTED).attr('font-size', '6px');
        g.selectAll('.domain, .tick line').attr('stroke', '#334155');

        // Electrostatic: S ∝ 1/Ea
        const esData = d3.range(500, 5001, 100).map(ea => ({ ea, s: 1 / (ea / 500) }));
        g.append('path').datum(esData).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => xSc(d.ea)).y(d => ySc(d.s)));

        // Magnetic: Sm ∝ 1/√Ea
        const mgData = d3.range(500, 5001, 100).map(ea => ({ ea, s: 1 / Math.sqrt(ea / 500) }));
        g.append('path').datum(mgData).attr('fill', 'none').attr('stroke', VIOLET).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => xSc(d.ea)).y(d => ySc(d.s)));

        g.append('text').attr('x', w - 4).attr('y', ySc(esData[esData.length - 1].s) - 4).attr('fill', CYAN).attr('font-size', '6px').attr('text-anchor', 'end').text('Electrostatic');
        g.append('text').attr('x', w - 4).attr('y', ySc(mgData[mgData.length - 1].s) - 4).attr('fill', VIOLET).attr('font-size', '6px').attr('text-anchor', 'end').text('Magnetic');
        g.append('text').attr('x', w / 2).attr('y', h + 22).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('Ea (V)');
        g.append('text').attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -30).attr('fill', MUTED).attr('font-size', '6px').attr('text-anchor', 'middle').text('Relative S');

        /* Electrostatic Deflection Calculator */
        calcOn(['m10-dc-L', 'm10-dc-ld', 'm10-dc-d', 'm10-dc-Ea', 'm10-dc-Vd'], () => {
            const cL = num('m10-dc-L'), cLd = num('m10-dc-ld'), cD = num('m10-dc-d'),
                  cEa = num('m10-dc-Ea'), cVd = num('m10-dc-Vd');
            if (cD <= 0 || cEa <= 0) { el('m10-dc-result').textContent = 'd and Ea must be > 0'; return; }
            const D_calc = (cL * cLd * cVd) / (2 * cD * cEa);
            const S_calc = (cL * cLd) / (2 * cD * cEa);
            const G_calc = 1 / S_calc;
            el('m10-dc-result').textContent =
                `D = ${fmt(D_calc * 1000, 3)} mm | S = ${fmt(S_calc * 1000, 4)} mm/V | G = ${fmt(G_calc / 1000, 2)} kV/m`;
        });

        /* Bandwidth–Rise Time */
        calcOn(['m10-bw'], () => {
            const bw = num('m10-bw');
            if (bw <= 0) { el('m10-bw-result').textContent = 'BW must be > 0'; return; }
            const tr = 0.35 / (bw * 1e6);
            el('m10-bw-result').textContent = `t_r = 0.35 / ${bw} MHz = ${fmt(tr * 1e9, 2)} ns`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 10.4 — Lissajous Patterns
       ══════════════════════════════════════════════════════ */
    function initCard104() {
        const lissPath = el('m10-liss-path');
        const ratioSel = el('m10-liss-ratio');
        const phiSlider = el('m10-liss-phi');
        const phiVal = el('m10-liss-phi-val');
        const nhBadge = el('m10-liss-nh');
        const nvBadge = el('m10-liss-nv');
        const shapeBadge = el('m10-liss-shape');
        if (!lissPath || !ratioSel) return;

        function parseRatio(s) {
            const [a, b] = s.split(':').map(Number);
            return { fx: a, fy: b };
        }

        function drawLissajous() {
            const { fx, fy } = parseRatio(ratioSel.value);
            const phi = deg2rad(+phiSlider.value);
            phiVal.textContent = phiSlider.value;

            let d = '';
            const steps = 720;
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * 2 * Math.PI;
                const x = 100 + 80 * Math.sin(fx * t + phi);
                const y = 100 - 80 * Math.sin(fy * t);
                d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
            }
            lissPath.setAttribute('d', d);

            // Update Nh/Nv badges
            nhBadge.innerHTML = `N<sub>h</sub> = ${fy}`;
            nvBadge.innerHTML = `N<sub>v</sub> = ${fx}`;

            // Shape description
            const phiDeg = +phiSlider.value % 360;
            let shape = 'Ellipse';
            if (fx === fy) {
                if (phiDeg === 0 || phiDeg === 180) shape = 'Line';
                else if (phiDeg === 90 || phiDeg === 270) shape = 'Circle';
            } else {
                shape = `${fx}:${fy} pattern`;
            }
            shapeBadge.textContent = shape;
        }

        ratioSel.addEventListener('change', drawLissajous);
        phiSlider.addEventListener('input', drawLissajous);
        drawLissajous();

        /* Presets */
        document.querySelectorAll('.m10-liss-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                ratioSel.value = btn.dataset.r;
                phiSlider.value = btn.dataset.p;
                drawLissajous();
            });
        });

        /* Lissajous Frequency Calculator */
        calcOn(['m10-lfc-fy', 'm10-lfc-nh', 'm10-lfc-nv'], () => {
            const fy = num('m10-lfc-fy'), nh = num('m10-lfc-nh'), nv = num('m10-lfc-nv');
            if (nv <= 0) { el('m10-lfc-result').textContent = 'Nv must be > 0'; return; }
            const fxCalc = fy * nh / nv;
            el('m10-lfc-result').textContent = `fx = ${fmt(fy)} × ${fmt(nh)}/${fmt(nv)} = ${fmt(fxCalc, 2)} Hz`;
        });

        /* Phase from Ellipse */
        calcOn(['m10-pec-y0', 'm10-pec-ymax'], () => {
            const y0 = num('m10-pec-y0'), ymax = num('m10-pec-ymax');
            if (ymax <= 0) { el('m10-pec-result').textContent = 'Ymax must be > 0'; return; }
            const ratio = Math.min(Math.abs(y0 / ymax), 1);
            const phi = rad2deg(Math.asin(ratio));
            el('m10-pec-result').textContent = `sin φ = ${fmt(ratio, 4)} → φ = ${fmt(phi, 2)}° or ${fmt(180 - phi, 2)}°`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 10.5 — CRO Measurements: y-t Mode
       ══════════════════════════════════════════════════════ */
    function initCard105() {
        const ch1 = el('m10-yt-ch1');
        const ch2 = el('m10-yt-ch2');
        const vdivSel = el('m10-yt-vdiv');
        const tdivSel = el('m10-yt-tdiv');
        const phaseSlider = el('m10-yt-phase');
        const phaseVal = el('m10-yt-phase-val');
        const vpBadge = el('m10-yt-vpeak');
        const vrmsBadge = el('m10-yt-vrms');
        const freqBadge = el('m10-yt-freq');
        const phiBadge = el('m10-yt-phi');
        if (!ch1) return;

        function drawDual() {
            const vdiv = parseFloat(vdivSel.value);
            const tdiv = parseFloat(tdivSel.value);
            const phPct = +phaseSlider.value;
            phaseVal.textContent = phPct;
            const phRad = (phPct / 100) * 2 * Math.PI;

            // Waveform params: 2 cycles across 10 divs
            const cyclesShown = 2;
            const amp = 50; // pixels
            const nDiv = cyclesShown * (1 / tdiv) * tdiv; // just 2 cycles

            let d1 = '', d2 = '';
            for (let x = 0; x <= 240; x++) {
                const t = (x / 240) * cyclesShown * 2 * Math.PI;
                const y1 = 80 - amp * Math.sin(t);
                const y2 = 80 - amp * 0.7 * Math.sin(t - phRad);
                d1 += (x === 0 ? 'M' : 'L') + x + ',' + y1.toFixed(1);
                d2 += (x === 0 ? 'M' : 'L') + x + ',' + y2.toFixed(1);
            }
            ch1.setAttribute('d', d1);
            ch2.setAttribute('d', d2);

            // Readouts
            const divPeakPk = amp * 2 / (160 / 8); // divs of pk-pk
            const Vpp = divPeakPk * vdiv;
            const Vp = Vpp / 2;
            const Vrms = Vp / Math.SQRT2;
            const divsPerCycle = 240 / cyclesShown / 24; // divs per cycle (24px per div)
            const T = divsPerCycle * tdiv;
            const f = T > 0 ? 1 / T : 0;
            const phDeg = (phPct / 100) * 360;

            vpBadge.innerHTML = `V<sub>p</sub> = ${fmt(Vp, 2)} V`;
            vrmsBadge.innerHTML = `V<sub>rms</sub> = ${fmt(Vrms, 2)} V`;
            freqBadge.innerHTML = `f = ${f < 1000 ? fmt(f, 1) + ' Hz' : fmt(f / 1000, 2) + ' kHz'}`;
            phiBadge.innerHTML = `φ = ${fmt(phDeg, 1)}°`;
        }

        vdivSel.addEventListener('change', drawDual);
        tdivSel.addEventListener('change', drawDual);
        phaseSlider.addEventListener('input', drawDual);
        drawDual();

        /* y-t Measurement Calculator */
        calcOn(['m10-ytc-ndv', 'm10-ytc-vdiv', 'm10-ytc-ndt', 'm10-ytc-tdiv'], () => {
            const ndv = num('m10-ytc-ndv'), vd = num('m10-ytc-vdiv'),
                  ndt = num('m10-ytc-ndt'), td = num('m10-ytc-tdiv');
            const Vpp = ndv * vd;
            const Vp = Vpp / 2;
            const Vrms = Vp / Math.SQRT2;
            const T_ms = ndt * td;
            const f = T_ms > 0 ? 1 / (T_ms / 1000) : 0;
            el('m10-ytc-result').textContent =
                `Vpp = ${fmt(Vpp, 2)} V | Vp = ${fmt(Vp, 2)} V | Vrms = ${fmt(Vrms, 3)} V | T = ${fmt(T_ms, 2)} ms | f = ${fmt(f, 2)} Hz`;
        });

        /* Phase Difference (Dual Trace) */
        calcOn(['m10-phc-dt', 'm10-phc-T'], () => {
            const dt = num('m10-phc-dt'), T = num('m10-phc-T');
            if (T <= 0) { el('m10-phc-result').textContent = 'T must be > 0'; return; }
            const phi = (dt / T) * 360;
            el('m10-phc-result').textContent = `φ = (${fmt(dt)} / ${fmt(T)}) × 360° = ${fmt(phi, 2)}°`;
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 10.6 — CRO Complete Reference
       ══════════════════════════════════════════════════════ */
    function initCard106() {
        const masterWave = el('m10-master-wave');
        const ampSlider = el('m10-master-amp');
        const freqSlider = el('m10-master-freq');
        const vpBadge = el('m10-master-vp');
        const vrmsBadge = el('m10-master-vrms');
        const tBadge = el('m10-master-T');
        const fBadge = el('m10-master-f');
        if (!masterWave) return;

        let waveType = 'sine';
        const btns = document.querySelectorAll('#m10-card6 [data-wave]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                waveType = btn.dataset.wave;
                drawMaster();
            });
        });

        function waveFunc(t) {
            switch (waveType) {
                case 'sine': return Math.sin(t);
                case 'square': return Math.sin(t) >= 0 ? 1 : -1;
                case 'triangle': return 2 * Math.abs(2 * (t / (2 * Math.PI) - Math.floor(t / (2 * Math.PI) + 0.5))) - 1;
                case 'sawtooth': return 2 * (t / (2 * Math.PI) - Math.floor(t / (2 * Math.PI) + 0.5));
                default: return Math.sin(t);
            }
        }

        function drawMaster() {
            const amp = +ampSlider.value;
            const freq = +freqSlider.value;
            let d = '';
            for (let x = 2; x <= 218; x++) {
                const t = ((x - 2) / 216) * freq * 2 * Math.PI;
                const y = 70 - amp * waveFunc(t);
                d += (x === 2 ? 'M' : 'L') + x + ',' + Math.max(10, Math.min(130, y)).toFixed(1);
            }
            masterWave.setAttribute('d', d);

            // Badges
            vpBadge.innerHTML = `V<sub>p</sub> = ${fmt(amp, 0)}`;
            vrmsBadge.innerHTML = `V<sub>rms</sub> = ${fmt(amp / Math.SQRT2, 1)}`;
            const cycles = freq;
            const T = cycles > 0 ? 1 / cycles : 0;
            tBadge.innerHTML = `T = ${fmt(T, 2)} div`;
            fBadge.innerHTML = `f = ${fmt(cycles, 1)} cyc/screen`;
        }

        ampSlider.addEventListener('input', drawMaster);
        freqSlider.addEventListener('input', drawMaster);
        drawMaster();

        /* Master Calculator */
        calcOn(['m10-mc-ndv', 'm10-mc-vdiv', 'm10-mc-ndt', 'm10-mc-tdiv'], () => {
            const ndv = num('m10-mc-ndv'), vd = num('m10-mc-vdiv'),
                  ndt = num('m10-mc-ndt'), td = num('m10-mc-tdiv');
            const Vpp = ndv * vd;
            const Vp = Vpp / 2;
            const Vrms = Vp / Math.SQRT2;
            const T = ndt * td;
            const f = T > 0 ? 1 / (T / 1000) : 0;
            const BW = f > 0 ? 0.35 / (1 / f) : 0;
            el('m10-mc-result').textContent =
                `Vpp=${fmt(Vpp, 2)}V | Vp=${fmt(Vp, 2)}V | Vrms=${fmt(Vrms, 3)}V | T=${fmt(T, 2)}ms | f=${fmt(f, 2)}Hz`;
        });
    }

    /* ══════════════════════════════════════════════════════
       INIT
       ══════════════════════════════════════════════════════ */
    function init() {
        initBookmarks();
        initCard101();
        initCard102();
        initCard103();
        initCard104();
        initCard105();
        initCard106();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
