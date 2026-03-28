/* ═══════════════════════════════════════════════════════════════
   MODULE 9 — 3-Phase Power, Reactive Power & Energy Meters
   Color: #f97316 (Orange — Energy)
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const ORANGE = '#f97316', CYAN = '#00f5ff', GOLD = '#facc15',
          GREEN = '#00ff88', ROSE = '#fb7185', BLUE = '#60a5fa',
          VIOLET = '#a78bfa', RED = '#ef4444';

    const el  = id => document.getElementById(id);
    const num = id => parseFloat(el(id)?.value ?? 0);
    const deg2rad = d => d * Math.PI / 180;
    const rad2deg = r => r * 180 / Math.PI;
    const fmt = (v, d) => Number.isFinite(v) ? v.toFixed(d ?? 2) : '—';

    /* ── bookmarks ─────────────────────────────── */
    document.querySelectorAll('.m9-bookmark-btn').forEach(btn => {
        const key = 'bm_' + btn.dataset.card;
        if (localStorage.getItem(key) === '1') btn.textContent = '★ Saved';
        btn.addEventListener('click', () => {
            const on = localStorage.getItem(key) === '1';
            localStorage.setItem(key, on ? '0' : '1');
            btn.textContent = on ? '🔖 Bookmark' : '★ Saved';
        });
    });

    /* ── shared calc helper ────────────────────── */
    function calcOn(ids, fn) {
        ids.forEach(id => { const e = el(id); if (e) e.addEventListener('input', fn); });
        fn();
    }

    /* ══════════════════════════════════════════════════
       CARD 9.1 — Two Wattmeter Method: Complete Analysis
       ══════════════════════════════════════════════════ */
    function initCard91() {
        const VL = 415, IL = 10;

        function draw() {
            const phi = parseFloat(el('m9-2w-phi')?.value ?? 30);
            if (el('m9-2w-phi-val')) el('m9-2w-phi-val').textContent = phi;

            const phiR = deg2rad(phi);
            const W1 = VL * IL * Math.cos(deg2rad(30) - phiR);
            const W2 = VL * IL * Math.cos(deg2rad(30) + phiR);
            const P  = W1 + W2;
            const Q  = Math.sqrt(3) * (W1 - W2);
            const S  = Math.sqrt(P * P + Q * Q);
            const pf = Math.cos(phiR);

            // Badges
            const w1b = el('m9-2w-w1badge');
            if (w1b) { w1b.textContent = `W₁ = ${fmt(W1, 0)} W`; }
            const w2b = el('m9-2w-w2badge');
            if (w2b) {
                w2b.textContent = `W₂ = ${fmt(W2, 0)} W`;
                w2b.style.color = W2 >= 0 ? GOLD : RED;
                w2b.style.borderColor = w2b.style.color;
            }
            const rev = el('m9-2w-revbadge');
            if (rev) rev.style.display = phi > 60 ? '' : 'none';

            const pb = el('m9-2w-pbadge');
            if (pb) pb.textContent = `P = ${fmt(P, 0)} W`;
            const qb = el('m9-2w-qbadge');
            if (qb) qb.textContent = `Q = ${fmt(Q, 0)} VAR`;
            const pfb = el('m9-2w-pfbadge');
            if (pfb) {
                pfb.textContent = `cosφ = ${fmt(pf, 3)}`;
                pfb.style.color = pf > 0.5 ? GREEN : pf === 0.5 ? GOLD : RED;
                pfb.style.borderColor = pfb.style.color;
            }

            // Highlight table row
            const table = el('m9-phi-table');
            if (table) {
                table.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active-row'));
                let target;
                if (phi === 0) target = '0';
                else if (phi === 30) target = '30';
                else if (phi === 60) target = '60';
                else if (phi === 90) target = '90';
                else if (phi < 60) target = 'lt60';
                else target = 'gt60';
                const row = table.querySelector(`tr[data-phi="${target}"]`);
                if (row) row.classList.add('active-row');
            }

            // Power triangle
            drawPowerTriangle('m9-tri', 'm9-power-tri', P, Q, S, phiR);

            // W1/W2 bar chart
            buildW1W2Bars(W1, W2, P, Q);
        }

        const phiSlider = el('m9-2w-phi');
        if (phiSlider) phiSlider.addEventListener('input', draw);

        // Calculator
        calcOn(['m9-2wc-w1', 'm9-2wc-w2'], () => {
            const W1 = num('m9-2wc-w1'), W2 = num('m9-2wc-w2');
            const P = W1 + W2, Q = Math.sqrt(3) * (W1 - W2);
            const S = Math.sqrt(P * P + Q * Q);
            const tanPhi = P !== 0 ? Q / P : 0;
            const phi = Math.atan(Math.abs(tanPhi));
            const cosPhi = Math.cos(phi);
            const lag = W1 >= W2 ? 'Lagging' : 'Leading';
            el('m9-2wc-result').textContent =
                `P=${fmt(P,0)}W | Q=${fmt(Q,0)}VAR | S=${fmt(S,0)}VA | tanφ=${fmt(tanPhi,4)} | cosφ=${fmt(cosPhi,4)} | ${lag}`;
        });

        draw();
    }

    function buildW1W2Bars(W1, W2, P, Q) {
        const c = el('m9-2w-bar-chart');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const data = [
            { label: 'W₁', value: W1, color: CYAN },
            { label: 'W₂', value: W2, color: W2 >= 0 ? GOLD : RED },
            { label: 'P', value: P, color: GREEN },
            { label: 'Q', value: Math.abs(Q), color: ROSE }
        ];

        const w = 320, h = 150, m = { t: 15, r: 10, b: 25, l: 35 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const maxV = Math.max(d3.max(data, d => Math.abs(d.value)), 500);
        const x = d3.scaleLinear().domain([0, maxV]).range([m.l, w - m.r]);
        const yScale = d3.scaleBand().domain(data.map(d => d.label)).range([m.t, h - m.b]).padding(0.25);

        data.forEach(d => {
            const barW = Math.max(0, x(Math.abs(d.value)) - m.l);
            svg.append('rect').attr('x', m.l).attr('y', yScale(d.label))
                .attr('width', 0).attr('height', yScale.bandwidth())
                .attr('fill', d.color).attr('opacity', 0.7).attr('rx', 3)
                .transition().duration(500).attr('width', barW);

            svg.append('text').attr('x', m.l - 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', d.color).attr('font-size', '8px').attr('text-anchor', 'end').text(d.label);

            svg.append('text')
                .attr('x', m.l + barW + 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', '#94a3b8').attr('font-size', '7px').text(fmt(d.value, 0));
        });
    }

    /* shared power triangle drawer */
    function drawPowerTriangle(prefix, svgId, P, Q, S, phiR) {
        const ox = 20, oy = 150, maxLen = 170;
        const s = S > 0 ? maxLen / S : 1;
        const pLen = Math.abs(P) * s;
        const qLen = Math.abs(Q) * s;

        const pLine = el(prefix + '-P');
        if (pLine) pLine.setAttribute('x2', ox + pLen);
        const pLbl = el(prefix + '-P-lbl');
        if (pLbl) { pLbl.setAttribute('x', ox + pLen / 2); pLbl.textContent = `P=${fmt(P,0)}W`; }

        const qLine = el(prefix + '-Q');
        if (qLine) {
            qLine.setAttribute('x1', ox + pLen); qLine.setAttribute('y1', oy);
            qLine.setAttribute('x2', ox + pLen); qLine.setAttribute('y2', oy - qLen);
        }
        const qLbl = el(prefix + '-Q-lbl');
        if (qLbl) {
            qLbl.setAttribute('x', ox + pLen + 12); qLbl.setAttribute('y', oy - qLen / 2);
            qLbl.textContent = `Q=${fmt(Q,0)}`;
        }

        const sLine = el(prefix + '-S');
        if (sLine) { sLine.setAttribute('x2', ox + pLen); sLine.setAttribute('y2', oy - qLen); }
        const sLbl = el(prefix + '-S-lbl');
        if (sLbl) {
            sLbl.setAttribute('x', ox + pLen / 2 - 15); sLbl.setAttribute('y', oy - qLen / 2 - 6);
            sLbl.textContent = `S=${fmt(S,0)}`;
        }

        const arcR = 35;
        const ex = ox + arcR * Math.cos(phiR);
        const ey = oy - arcR * Math.sin(phiR);
        const arc = el(prefix + '-arc');
        if (arc) arc.setAttribute('d', `M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${ex} ${ey}`);
        const phiLbl = el(prefix + '-phi-lbl');
        if (phiLbl) { phiLbl.setAttribute('x', ox + arcR + 4); phiLbl.textContent = `φ=${fmt(rad2deg(phiR),1)}°`; }
    }

    /* ══════════════════════════════════════════════════
       CARD 9.2 — Measurement of Energy
       ══════════════════════════════════════════════════ */
    function initCard92() {
        let running = false, elapsed = 0, animId = null, lastTime = 0;
        let discAngle = 0;

        function getK() { return parseFloat(el('m9-em-K')?.value ?? 1200); }
        function getP() { return parseFloat(el('m9-em-power')?.value ?? 2); }

        function updateDisplay() {
            const P = getP(), K = getK();
            if (el('m9-em-power-val')) el('m9-em-power-val').textContent = P.toFixed(1);

            const tHours = elapsed / 3600;
            const E = P * tHours;
            const N = Math.round(K * E);
            const rpm = K * P / 60;

            if (el('m9-kwh-display')) el('m9-kwh-display').textContent = fmt(E, 4);
            if (el('m9-rev-display')) el('m9-rev-display').textContent = N;
            if (el('m9-em-time')) el('m9-em-time').textContent = `t = ${fmt(elapsed, 1)} s`;
            if (el('m9-em-rpm-badge')) el('m9-em-rpm-badge').textContent = `${fmt(rpm, 1)} RPM`;
            if (el('m9-speed-badge')) el('m9-speed-badge').textContent = `Speed = ${fmt(rpm, 1)} RPM (∝ ${P} kW)`;
        }

        function animFrame(ts) {
            if (!running) return;
            if (lastTime) {
                const dt = (ts - lastTime) / 1000; // seconds
                elapsed += dt * 60; // ×60 speed-up for visibility
                const P = getP(), K = getK();
                const rpm = K * P / 60;
                discAngle += rpm * 6 * dt * 60; // degrees per frame (accelerated)
            }
            lastTime = ts;
            updateDisplay();

            // Rotate disc arrow
            const arrow = el('m9-disc-arrow');
            if (arrow) {
                arrow.style.transform = `rotate(${discAngle % 360}deg)`;
                arrow.style.transformOrigin = '130px 90px';
            }

            animId = requestAnimationFrame(animFrame);
        }

        const startBtn = el('m9-em-start');
        const resetBtn = el('m9-em-reset');
        if (startBtn) startBtn.addEventListener('click', () => {
            if (running) {
                running = false; startBtn.textContent = '▶ Start';
                cancelAnimationFrame(animId);
            } else {
                running = true; lastTime = 0; startBtn.textContent = '⏸ Pause';
                animId = requestAnimationFrame(animFrame);
            }
        });
        if (resetBtn) resetBtn.addEventListener('click', () => {
            running = false; elapsed = 0; discAngle = 0; lastTime = 0;
            if (startBtn) startBtn.textContent = '▶ Start';
            cancelAnimationFrame(animId);
            updateDisplay();
        });

        const pSlider = el('m9-em-power');
        if (pSlider) pSlider.addEventListener('input', updateDisplay);

        // Calculator: Energy Meter
        calcOn(['m9-emc-K', 'm9-emc-P', 'm9-emc-t'], () => {
            const K = num('m9-emc-K'), P = num('m9-emc-P'), t = num('m9-emc-t');
            const N = K * P * t;
            const E = P * t;
            const rpm = K * P / 60;
            el('m9-emc-result').textContent =
                `N = ${fmt(N, 0)} rev | E = ${fmt(E, 2)} kWh | Disc = ${fmt(rpm, 1)} RPM`;
        });

        updateDisplay();
    }

    /* ══════════════════════════════════════════════════
       CARD 9.3 — Energy Meter: Working Principle
       ══════════════════════════════════════════════════ */
    function initCard93() {
        const R = 80; // phasor arm length
        const cx = 120, cy = 120;

        function draw() {
            const phi = parseFloat(el('m9-ph-phi')?.value ?? 30);
            if (el('m9-ph-phi-val')) el('m9-ph-phi-val').textContent = phi;
            const phiR = deg2rad(phi);
            const theta = 90 + phi;

            // V reference: straight up (−90° in screen coords → 270° math)
            // In SVG: up = negative Y.
            // phasor angles referenced from +X axis, CW in SVG

            // V: 0° reference = pointing up
            // Ip: ~85° behind V (almost horizontal right)
            const ipAngle = 85; // degrees lag from V
            const ipAngleR = deg2rad(ipAngle);
            const ipx = cx + R * 0.7 * Math.sin(ipAngleR);
            const ipy = cy - R * 0.7 * Math.cos(ipAngleR);
            setLine('m9-ph-Ip', cx, cy, ipx, ipy);
            setTextPos('m9-ph-Ip-lbl', ipx + 3, ipy - 3);

            // φsh: lags Ip by ~90° (points roughly down-right)
            const phishAngle = ipAngle + 90;
            const phishR = deg2rad(phishAngle);
            const phishx = cx + R * 0.6 * Math.sin(phishR);
            const phishy = cy - R * 0.6 * Math.cos(phishR);
            setLine('m9-ph-phish', cx, cy, phishx, phishy);
            setTextPos('m9-ph-phish-lbl', phishx + 3, phishy + 3);

            // Ic: lags V by φ
            const icx = cx + R * 0.8 * Math.sin(phiR);
            const icy = cy - R * 0.8 * Math.cos(phiR);
            setLine('m9-ph-Ic', cx, cy, icx, icy);
            setTextPos('m9-ph-Ic-lbl', icx + 3, icy - 3);

            // φse: in phase with Ic (same direction, shorter)
            setLine('m9-ph-phise', cx, cy, icx * 0.6 + cx * 0.4, icy * 0.6 + cy * 0.4);

            // θ label
            if (el('m9-ph-theta-lbl')) el('m9-ph-theta-lbl').textContent = `θ = ${theta}°`;

            // Speed badge
            const pf = Math.cos(phiR);
            const speedBadge = el('m9-ph-speed-badge');
            if (speedBadge) speedBadge.textContent = `Speed ∝ VIcos${phi}° = ${fmt(pf, 3)} × VI`;
            const thetaBadge = el('m9-ph-theta-badge');
            if (thetaBadge) thetaBadge.textContent = `θ = ${theta}°`;

            // Torque bars
            buildTorqueBars(pf);
        }

        function setLine(id, x1, y1, x2, y2) {
            const e = el(id);
            if (!e) return;
            e.setAttribute('x1', x1); e.setAttribute('y1', y1);
            e.setAttribute('x2', x2); e.setAttribute('y2', y2);
        }
        function setTextPos(id, x, y) {
            const e = el(id);
            if (!e) return;
            e.setAttribute('x', x); e.setAttribute('y', y);
        }

        const phiSlider = el('m9-ph-phi');
        if (phiSlider) phiSlider.addEventListener('input', draw);

        // Disc speed calculator
        calcOn(['m9-dsc-K', 'm9-dsc-P'], () => {
            const K = num('m9-dsc-K'), P = num('m9-dsc-P');
            const rpm = K * P / 60;
            const revH = K * P;
            el('m9-dsc-result').textContent = `Speed = ${fmt(rpm, 2)} RPM (${fmt(revH, 0)} rev/hr)`;
        });

        draw();
    }

    function buildTorqueBars(pf) {
        const c = el('m9-torque-bars');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const Td = pf;       // normalised driving torque
        const Tb = pf * 0.95; // braking ≈ Td at steady state
        const data = [
            { label: 'T_drive', value: Td, color: GREEN },
            { label: 'T_brake', value: Tb, color: RED }
        ];

        const w = 280, h = 80, m = { t: 10, r: 10, b: 20, l: 55 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const x = d3.scaleLinear().domain([0, 1]).range([m.l, w - m.r]);
        const yScale = d3.scaleBand().domain(data.map(d => d.label)).range([m.t, h - m.b]).padding(0.3);

        data.forEach(d => {
            svg.append('rect').attr('x', m.l).attr('y', yScale(d.label))
                .attr('width', 0).attr('height', yScale.bandwidth())
                .attr('fill', d.color).attr('opacity', 0.65).attr('rx', 3)
                .transition().duration(500).attr('width', x(d.value) - m.l);
            svg.append('text').attr('x', m.l - 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', d.color).attr('font-size', '8px').attr('text-anchor', 'end').text(d.label);
            svg.append('text')
                .attr('x', x(d.value) + 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', '#94a3b8').attr('font-size', '7px').text(fmt(d.value, 3));
        });

        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '7px').attr('text-anchor', 'middle')
            .text(pf < 0.05 ? '⚠️ Pure reactive — disc stops!' : `At equilibrium: T_d ≈ T_b → speed ∝ P`);
    }

    /* ══════════════════════════════════════════════════
       CARD 9.4 — Energy Meter: Compensations & Errors
       ══════════════════════════════════════════════════ */
    function initCard94() {
        // Tab selector for 5 compensation panels
        const panels = ['lag', 'lowload', 'creep', 'overload', 'overvolt'];
        const card4 = el('m9-card4');
        if (card4) {
            card4.querySelectorAll('.m9-btn[data-comp]').forEach(btn => {
                btn.addEventListener('click', () => {
                    card4.querySelectorAll('.m9-btn[data-comp]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    panels.forEach(p => {
                        const panel = el('m9-comp-' + p);
                        if (panel) panel.style.display = (p === btn.dataset.comp) ? 'block' : 'none';
                    });
                });
            });
        }

        // Error vs load chart
        buildErrorLoadChart();

        // Meter accuracy calculator
        calcOn(['m9-acc-K', 'm9-acc-P', 'm9-acc-t', 'm9-acc-N'], () => {
            const K = num('m9-acc-K'), P = num('m9-acc-P'), t = num('m9-acc-t');
            const Nact = num('m9-acc-N');
            const Nexp = K * P * t;
            const errPct = Nexp !== 0 ? ((Nact - Nexp) / Nexp) * 100 : 0;
            const pass = Math.abs(errPct) <= 2;
            el('m9-acc-result').textContent =
                `N_exp = ${fmt(Nexp, 0)} | N_act = ${Nact} | Error = ${fmt(errPct, 2)}% | ${pass ? '✓ PASS (±2%)' : '✗ FAIL'}`;
            const res = el('m9-acc-result');
            if (res) {
                res.style.color = pass ? GREEN : RED;
                res.style.borderColor = pass ? GREEN : RED;
            }
        });
    }

    function buildErrorLoadChart() {
        const c = el('m9-error-load-chart');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const w = 310, h = 200, m = { t: 25, r: 15, b: 30, l: 45 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const loads = d3.range(5, 130, 5);

        // Without compensation: large error at light load, settles
        const uncomp = loads.map(l => ({
            load: l,
            err: l < 20 ? -6 + l * 0.25 : (l < 50 ? -1 + (l - 20) * 0.02 : (l > 100 ? (l - 100) * 0.05 : 0.2))
        }));
        // With compensation: nearly flat
        const comp = loads.map(l => ({
            load: l,
            err: l < 10 ? -0.8 : (l > 110 ? 0.5 : (Math.random() - 0.5) * 0.4)
        }));

        const x = d3.scaleLinear().domain([0, 130]).range([m.l, w - m.r]);
        const y = d3.scaleLinear().domain([-8, 4]).range([h - m.b, m.t]);

        // ±2% band
        svg.append('rect').attr('x', m.l).attr('y', y(2))
            .attr('width', w - m.l - m.r).attr('height', y(-2) - y(2))
            .attr('fill', 'rgba(0,255,136,0.04)');
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r).attr('y1', y(2)).attr('y2', y(2))
            .attr('stroke', GREEN).attr('stroke-dasharray', '3 2').attr('opacity', 0.4);
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r).attr('y1', y(-2)).attr('y2', y(-2))
            .attr('stroke', GREEN).attr('stroke-dasharray', '3 2').attr('opacity', 0.4);
        svg.append('text').attr('x', w - m.r - 2).attr('y', y(2) - 3).attr('fill', GREEN)
            .attr('font-size', '6px').attr('text-anchor', 'end').text('+2%');
        svg.append('text').attr('x', w - m.r - 2).attr('y', y(-2) + 10).attr('fill', GREEN)
            .attr('font-size', '6px').attr('text-anchor', 'end').text('−2%');

        // Zero line
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r).attr('y1', y(0)).attr('y2', y(0))
            .attr('stroke', '#475569').attr('stroke-dasharray', '2 2');

        // Axes
        svg.append('g').attr('transform', `translate(0,${h - m.b})`)
            .call(d3.axisBottom(x).ticks(6).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.append('g').attr('transform', `translate(${m.l},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.selectAll('.domain,.tick line').attr('stroke', '#334155');

        // Uncompensated line
        svg.append('path').datum(uncomp).attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.load)).y(d => y(d.err)).curve(d3.curveCatmullRom));
        // Compensated line
        svg.append('path').datum(comp).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.load)).y(d => y(d.err)).curve(d3.curveCatmullRom));

        // Legend
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 10).attr('fill', RED)
            .attr('font-size', '7px').attr('text-anchor', 'end').text('Uncompensated');
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 22).attr('fill', GREEN)
            .attr('font-size', '7px').attr('text-anchor', 'end').text('Compensated');

        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('% Load →');
        svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', ORANGE)
            .attr('font-size', '9px').attr('text-anchor', 'middle').text('% Error vs % Load');
    }

    /* ══════════════════════════════════════════════════
       CARD 9.5 — Energy Meter: Complete Reference
       ══════════════════════════════════════════════════ */
    function initCard95() {
        function draw() {
            const W1 = parseFloat(el('m9-sum-w1')?.value ?? 2000);
            const W2 = parseFloat(el('m9-sum-w2')?.value ?? 1000);
            if (el('m9-sum-w1-val')) el('m9-sum-w1-val').textContent = W1;
            if (el('m9-sum-w2-val')) el('m9-sum-w2-val').textContent = W2;

            const P = W1 + W2;
            const Q = Math.sqrt(3) * (W1 - W2);
            const S = Math.sqrt(P * P + Q * Q);
            const tanPhi = P !== 0 ? Q / P : 0;
            const phi = Math.atan(Math.abs(tanPhi));
            const pf = Math.cos(phi);

            if (el('m9-sum-P'))      el('m9-sum-P').textContent      = `P = ${fmt(P, 0)} W`;
            if (el('m9-sum-Q'))      el('m9-sum-Q').textContent      = `Q = ${fmt(Q, 0)} VAR`;
            if (el('m9-sum-S'))      el('m9-sum-S').textContent      = `S = ${fmt(S, 0)} VA`;
            if (el('m9-sum-pf'))     el('m9-sum-pf').textContent     = `cosφ = ${fmt(pf, 4)}`;
            if (el('m9-sum-tanphi')) el('m9-sum-tanphi').textContent = `tanφ = ${fmt(tanPhi, 4)}`;

            // Color-code PF badge
            const pfEl = el('m9-sum-pf');
            if (pfEl) {
                pfEl.style.color = pf > 0.5 ? GREEN : pf === 0.5 ? GOLD : RED;
                pfEl.style.borderColor = pfEl.style.color;
            }

            // Power triangle
            drawPowerTriangle('m9-st', 'm9-sum-tri', P, Q, S, phi);

            // PF zone chart
            buildPFZoneChart(pf);
        }

        ['m9-sum-w1', 'm9-sum-w2'].forEach(id => {
            const e = el(id); if (e) e.addEventListener('input', draw);
        });

        // Reactive Power Calculator
        calcOn(['m9-rpc-vl', 'm9-rpc-il', 'm9-rpc-phi'], () => {
            const VL = num('m9-rpc-vl'), IL = num('m9-rpc-il'), phi = deg2rad(num('m9-rpc-phi'));
            const Q = Math.sqrt(3) * VL * IL * Math.sin(phi);
            const P = Math.sqrt(3) * VL * IL * Math.cos(phi);
            const S = Math.sqrt(3) * VL * IL;
            el('m9-rpc-result').textContent = `Q = ${fmt(Q, 1)} VAR | P = ${fmt(P, 1)} W | S = ${fmt(S, 1)} VA`;
        });

        // W1 W2 Relationship Finder
        calcOn(['m9-wrf-phi'], () => {
            const phi = num('m9-wrf-phi');
            const phiR = deg2rad(phi);
            const VL = 415, IL = 10;
            const W1 = VL * IL * Math.cos(deg2rad(30) - phiR);
            const W2 = VL * IL * Math.cos(deg2rad(30) + phiR);
            let rel;
            if (phi === 0) rel = 'W₁ = W₂ (UPF)';
            else if (Math.abs(phi - 30) < 1) rel = 'W₁ ≈ 2W₂';
            else if (Math.abs(phi - 60) < 1) rel = 'W₂ = 0 (pf = 0.5)';
            else if (phi > 60 && phi < 90) rel = 'W₁(+), W₂(−) — reverse W₂!';
            else if (Math.abs(phi - 90) < 1) rel = 'W₁ = −W₂ (pf = 0)';
            else rel = `W₁(+), W₂(+)`;
            el('m9-wrf-result').textContent = `φ=${phi}° | W₁=${fmt(W1,0)}W | W₂=${fmt(W2,0)}W | ${rel}`;
        });

        draw();
    }

    function buildPFZoneChart(currentPF) {
        const c = el('m9-sum-pf-zone');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const w = 290, h = 120, m = { t: 20, r: 10, b: 25, l: 10 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const barY = 30, barH = 35;
        const x = d3.scaleLinear().domain([0, 1]).range([m.l, w - m.r]);

        // Green zone: pf 0.5–1
        svg.append('rect').attr('x', x(0.5)).attr('y', barY)
            .attr('width', x(1) - x(0.5)).attr('height', barH)
            .attr('fill', 'rgba(0,255,136,0.15)').attr('rx', 4);
        svg.append('text').attr('x', (x(0.5) + x(1)) / 2).attr('y', barY + barH / 2 + 4)
            .attr('fill', GREEN).attr('font-size', '7px').attr('text-anchor', 'middle').text('W₁,W₂ > 0');

        // pf=0.5 line
        svg.append('line').attr('x1', x(0.5)).attr('x2', x(0.5))
            .attr('y1', barY - 5).attr('y2', barY + barH + 5)
            .attr('stroke', GOLD).attr('stroke-width', 2);
        svg.append('text').attr('x', x(0.5)).attr('y', barY - 8)
            .attr('fill', GOLD).attr('font-size', '7px').attr('text-anchor', 'middle').text('W₂=0');

        // Red zone: pf 0–0.5
        svg.append('rect').attr('x', x(0)).attr('y', barY)
            .attr('width', x(0.5) - x(0)).attr('height', barH)
            .attr('fill', 'rgba(239,68,68,0.12)').attr('rx', 4);
        svg.append('text').attr('x', (x(0) + x(0.5)) / 2).attr('y', barY + barH / 2 + 4)
            .attr('fill', RED).attr('font-size', '7px').attr('text-anchor', 'middle').text('W₂ < 0 ⚠️');

        // Current dot
        const dotX = x(Math.max(0, Math.min(1, currentPF)));
        svg.append('circle').attr('cx', dotX).attr('cy', barY + barH / 2)
            .attr('r', 7).attr('fill', currentPF > 0.5 ? GREEN : RED)
            .attr('stroke', '#fff').attr('stroke-width', 1.5);
        svg.append('text').attr('x', dotX).attr('y', barY + barH + 20)
            .attr('fill', '#fff').attr('font-size', '9px').attr('text-anchor', 'middle')
            .text(`pf = ${fmt(currentPF, 3)}`);

        // Scale
        [0, 0.25, 0.5, 0.75, 1].forEach(v => {
            svg.append('text').attr('x', x(v)).attr('y', barY + barH + 12)
                .attr('fill', '#94a3b8').attr('font-size', '6px').attr('text-anchor', 'middle').text(v);
        });

        svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', ORANGE)
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('PF Zones (Two Wattmeter)');
    }

    /* ══════════════════════════════════════════════════
       INIT ALL CARDS
       ══════════════════════════════════════════════════ */
    function init() {
        initCard91();
        initCard92();
        initCard93();
        initCard94();
        initCard95();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
