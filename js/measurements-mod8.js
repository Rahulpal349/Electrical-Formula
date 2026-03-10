/* ═══════════════════════════════════════════════════════════════
   MODULE 8 — Wattmeter Errors & Polyphase Power Measurement
   Color: #00ff88 (Green — Power Accuracy)
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const GREEN = '#00ff88', CYAN = '#00f5ff', GOLD = '#facc15',
          ROSE  = '#fb7185', ORANGE = '#f97316', VIOLET = '#a78bfa',
          BLUE  = '#60a5fa', RED = '#ef4444';

    const el  = id => document.getElementById(id);
    const num = id => parseFloat(el(id)?.value ?? 0);
    const deg2rad = d => d * Math.PI / 180;
    const rad2deg = r => r * 180 / Math.PI;
    const fmt = (v, d) => Number.isFinite(v) ? v.toFixed(d ?? 2) : '—';

    /* ── bookmarks ────────────────────────────────── */
    document.querySelectorAll('.m8-bookmark-btn').forEach(btn => {
        const key = 'bm_' + btn.dataset.card;
        if (localStorage.getItem(key) === '1') btn.textContent = '★ Saved';
        btn.addEventListener('click', () => {
            const on = localStorage.getItem(key) === '1';
            localStorage.setItem(key, on ? '0' : '1');
            btn.textContent = on ? '🔖 Bookmark' : '★ Saved';
        });
    });

    /* ── shared calc listener helper ─────────────── */
    function calcOn(zoneId, ids, fn) {
        ids.forEach(id => { const e = el(id); if (e) e.addEventListener('input', fn); });
        fn();
    }

    /* ══════════════════════════════════════════════════
       CARD 8.1 — EDM Wattmeter Connections A / B
       ══════════════════════════════════════════════════ */
    function initCard81() {
        let connType = 'A'; // 'A' or 'B'

        const aBtn = el('m8-connA-btn'), bBtn = el('m8-connB-btn');
        if (aBtn) aBtn.addEventListener('click', () => { connType = 'A'; aBtn.classList.add('active'); bBtn.classList.remove('active'); redraw(); });
        if (bBtn) bBtn.addEventListener('click', () => { connType = 'B'; bBtn.classList.add('active'); aBtn.classList.remove('active'); redraw(); });

        function redraw() {
            const RCC = parseFloat(el('m8-rcc')?.value ?? 2);
            const RPC = parseFloat(el('m8-rpc')?.value ?? 10) * 1000;
            const RL  = parseFloat(el('m8-rl')?.value ?? 100);
            if (el('m8-rcc-val')) el('m8-rcc-val').textContent = RCC;
            if (el('m8-rpc-val')) el('m8-rpc-val').textContent = el('m8-rpc').value;
            if (el('m8-rl-val'))  el('m8-rl-val').textContent  = RL;

            const Rc = Math.sqrt(RCC * RPC);
            const errA = (RCC / RL) * 100;
            const errB = (RL / RPC) * 100;

            // Update SVG elements based on connection
            const reading = el('m8-watt-reading');
            const errLbl  = el('m8-err-lbl');
            const badgeTxt = el('m8-badge-text');
            const badgeBg  = el('m8-badge-bg');
            const pcBox = el('m8-pc-box');
            const pcTop = el('m8-pc-top');
            const pcBot = el('m8-pc-bot');

            if (connType === 'A') {
                // PC before CC → near supply
                if (pcBox) { pcBox.setAttribute('x', '42'); }
                if (el('m8-pc-lbl')) el('m8-pc-lbl').setAttribute('x', '62');
                if (pcTop) { pcTop.setAttribute('x1', '60'); pcTop.setAttribute('x2', '60'); }
                if (pcBot) { pcBot.setAttribute('x1', '60'); pcBot.setAttribute('x2', '60'); }
                if (reading) reading.textContent = 'Pm = Pt + I²Rcc';
                if (errLbl) { errLbl.textContent = `Error: ${fmt(errA, 2)}% (I²RCC)`; errLbl.setAttribute('fill', RED); }
                if (badgeTxt) { badgeTxt.textContent = 'Use for small load current'; badgeTxt.setAttribute('fill', CYAN); }
                if (badgeBg) badgeBg.setAttribute('stroke', CYAN);
            } else {
                // PC after CC → near load
                if (pcBox) { pcBox.setAttribute('x', '160'); }
                if (el('m8-pc-lbl')) el('m8-pc-lbl').setAttribute('x', '180');
                if (pcTop) { pcTop.setAttribute('x1', '180'); pcTop.setAttribute('x2', '180'); }
                if (pcBot) { pcBot.setAttribute('x1', '180'); pcBot.setAttribute('x2', '180'); }
                if (reading) reading.textContent = 'Pm = Pt + V²/Rpc';
                if (errLbl) { errLbl.textContent = `Error: ${fmt(errB, 2)}% (V²/RPC)`; errLbl.setAttribute('fill', ROSE); }
                if (badgeTxt) { badgeTxt.textContent = 'Use for large load current'; badgeTxt.setAttribute('fill', ORANGE); }
                if (badgeBg) badgeBg.setAttribute('stroke', ORANGE);
            }

            // Recommendation
            const rec = el('m8-conn-recommend');
            if (rec) {
                const better = RL > Rc ? 'A (MC short)' : 'B (LC short)';
                rec.textContent = `Rcrit = ${fmt(Rc, 1)} Ω | RL=${RL}Ω → Use Connection ${better}`;
                rec.style.color = RL > Rc ? CYAN : ORANGE;
                rec.style.borderColor = RL > Rc ? CYAN : ORANGE;
            }

            buildConnChart(RCC, RPC);
        }

        ['m8-rcc', 'm8-rpc', 'm8-rl'].forEach(id => {
            const e = el(id); if (e) e.addEventListener('input', redraw);
        });

        // Calculator
        calcOn('m8-conn-calc', ['m8-cc-rl', 'm8-cc-rcc', 'm8-cc-rpc', 'm8-cc-v', 'm8-cc-i'], () => {
            const RL = num('m8-cc-rl'), RCC = num('m8-cc-rcc'), RPC = num('m8-cc-rpc') * 1000;
            const V = num('m8-cc-v'), I = num('m8-cc-i');
            const P = V * I;
            const eA = P > 0 ? (I * I * RCC) / P * 100 : 0;
            const eB = P > 0 ? (V * V / RPC) / P * 100 : 0;
            const Rc = Math.sqrt(RCC * RPC);
            const better = RL > Rc ? 'A' : 'B';
            el('m8-cc-result').textContent = `Conn A: ${fmt(eA, 3)}% | Conn B: ${fmt(eB, 3)}% | Rc=${fmt(Rc, 1)}Ω → ${better}`;
        });

        redraw();
    }

    function buildConnChart(RCC, RPC) {
        const c = el('m8-conn-error-chart');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const w = 270, h = 200, m = { t: 20, r: 15, b: 30, l: 45 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const RLs = d3.range(1, 5001, 50);
        const aData = RLs.map(rl => ({ rl, err: (RCC / rl) * 100 }));
        const bData = RLs.map(rl => ({ rl, err: (rl / RPC) * 100 }));
        const Rc = Math.sqrt(RCC * RPC);

        const x = d3.scaleLog().domain([1, 5000]).range([m.l, w - m.r]);
        const maxErr = Math.min(50, Math.max(d3.max(aData, d => d.err), d3.max(bData, d => d.err), 5));
        const y = d3.scaleLinear().domain([0, maxErr]).range([h - m.b, m.t]);

        svg.append('g').attr('transform', `translate(0,${h - m.b})`)
            .call(d3.axisBottom(x).ticks(4, ',.0f').tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.append('g').attr('transform', `translate(${m.l},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.selectAll('.domain,.tick line').attr('stroke', '#334155');

        svg.append('path').datum(aData).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.rl)).y(d => y(Math.min(d.err, maxErr))));
        svg.append('path').datum(bData).attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.rl)).y(d => y(Math.min(d.err, maxErr))));

        if (Rc > 1 && Rc < 5000) {
            svg.append('line').attr('x1', x(Rc)).attr('x2', x(Rc))
                .attr('y1', m.t).attr('y2', h - m.b)
                .attr('stroke', GREEN).attr('stroke-dasharray', '4 2').attr('stroke-width', 1);
            svg.append('text').attr('x', x(Rc)).attr('y', m.t - 4).attr('fill', GREEN)
                .attr('font-size', '8px').attr('text-anchor', 'middle').text(`Rc=${fmt(Rc, 0)}Ω`);
        }

        svg.append('text').attr('x', w - m.r).attr('y', m.t + 10).attr('fill', CYAN)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('Conn A');
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 22).attr('fill', ORANGE)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('Conn B');
        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('RL (Ω)');
    }

    /* ══════════════════════════════════════════════════
       CARD 8.2 — Errors in EDM Wattmeter
       ══════════════════════════════════════════════════ */
    function initCard82() {
        function draw() {
            const phi  = parseFloat(el('m8-phi')?.value ?? 30);
            const beta = parseFloat(el('m8-beta')?.value ?? 3);
            if (el('m8-phi-val'))  el('m8-phi-val').textContent  = phi;
            if (el('m8-beta-val')) el('m8-beta-val').textContent = beta;

            const phiR  = deg2rad(phi);
            const betaR = deg2rad(beta);
            const CF = Math.cos(phiR) / (Math.cos(betaR) * Math.cos(phiR + betaR));
            const errPct = Math.tan(phiR) * Math.tan(betaR) * 100;

            // CF gauge needle
            const maxCF = 5;
            const cfClamped = Math.min(CF, maxCF);
            const angle = Math.PI + (cfClamped - 1) / (maxCF - 1) * Math.PI; // 180° to 0°
            const nx = 100 + 70 * Math.cos(angle);
            const ny = 120 + 70 * Math.sin(angle);
            const needle = el('m8-cf-needle');
            if (needle) { needle.setAttribute('x2', nx); needle.setAttribute('y2', ny); }

            const cfText = el('m8-cf-text');
            if (cfText) {
                cfText.textContent = `CF = ${fmt(CF, 4)}`;
                cfText.setAttribute('fill', CF < 1.05 ? GREEN : CF < 1.2 ? GOLD : RED);
            }

            // Error badge
            const errBadge = el('m8-err-pct-badge');
            if (errBadge) {
                errBadge.textContent = `Error ≈ ${fmt(errPct, 2)}%`;
                errBadge.style.color = errPct < 5 ? GREEN : errPct < 15 ? ORANGE : RED;
                errBadge.style.borderColor = errBadge.style.color;
            }
            const pfWarn = el('m8-pf-warn-badge');
            if (pfWarn) {
                const pf = Math.cos(phiR);
                if (pf < 0.5) {
                    pfWarn.textContent = '⚠️ Use LPF Wattmeter';
                    pfWarn.style.color = RED; pfWarn.style.borderColor = RED;
                } else {
                    pfWarn.textContent = 'PF OK';
                    pfWarn.style.color = GREEN; pfWarn.style.borderColor = GREEN;
                }
            }

            buildErrorBars(phi, beta);
        }

        ['m8-phi', 'm8-beta'].forEach(id => {
            const e = el(id); if (e) e.addEventListener('input', draw);
        });

        // CF Calculator
        calcOn('m8-cf-calc', ['m8-cfc-phi', 'm8-cfc-beta', 'm8-cfc-reading'], () => {
            const phi = deg2rad(num('m8-cfc-phi'));
            const beta = deg2rad(num('m8-cfc-beta'));
            const reading = num('m8-cfc-reading');
            const CF = Math.cos(phi) / (Math.cos(beta) * Math.cos(phi + beta));
            const trueP = CF * reading;
            const errPct = Math.tan(phi) * Math.tan(beta) * 100;
            el('m8-cfc-result').textContent = `CF = ${fmt(CF, 4)} | True P = ${fmt(trueP, 1)} W | Error ≈ ${fmt(errPct, 2)}%`;
        });

        // Compensation Calculator
        calcOn('m8-comp-calc', ['m8-compc-lpc', 'm8-compc-rpc'], () => {
            const Lpc = num('m8-compc-lpc') / 1000; // mH → H
            const Rpc = num('m8-compc-rpc') * 1000;  // kΩ → Ω
            const C = 0.4 * Lpc / (Rpc * Rpc);
            const Cuf = C * 1e6;
            el('m8-compc-result').textContent = `C = ${fmt(Cuf, 6)} μF`;
        });

        draw();
    }

    function buildErrorBars(phi, beta) {
        const c = el('m8-error-bars');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const phiR = deg2rad(phi), betaR = deg2rad(beta);
        const indErr = Math.abs(Math.tan(phiR) * Math.tan(betaR)) * 100;
        const capErr = Math.abs(Math.tan(phiR) * Math.tan(betaR) * 0.3) * 100; // simplified
        const connErr = 2; // constant placeholder

        const data = [
            { label: 'Inductance', value: Math.min(indErr, 80), color: ORANGE },
            { label: 'Capacitance', value: Math.min(capErr, 40), color: BLUE },
            { label: 'Connection', value: connErr, color: RED }
        ];

        const w = 270, h = 200, m = { t: 20, r: 10, b: 25, l: 75 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const maxV = Math.max(d3.max(data, d => d.value), 10);
        const x = d3.scaleLinear().domain([0, maxV]).range([m.l, w - m.r]);
        const yScale = d3.scaleBand().domain(data.map(d => d.label)).range([m.t, h - m.b]).padding(0.3);

        data.forEach(d => {
            svg.append('rect').attr('x', m.l).attr('y', yScale(d.label))
                .attr('width', 0).attr('height', yScale.bandwidth())
                .attr('fill', d.color).attr('opacity', 0.7).attr('rx', 4)
                .transition().duration(800).attr('width', x(d.value) - m.l);
            svg.append('text').attr('x', m.l - 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', d.color).attr('font-size', '8px').attr('text-anchor', 'end').text(d.label);
            svg.append('text')
                .attr('x', x(d.value) + 4).attr('y', yScale(d.label) + yScale.bandwidth() / 2 + 4)
                .attr('fill', '#94a3b8').attr('font-size', '8px').text(`${fmt(d.value, 1)}%`);
        });

        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('% Error');

        if (phi > 60) {
            svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', RED)
                .attr('font-size', '9px').attr('text-anchor', 'middle').text('⚠️ Low PF — Inductance error dominates!');
        }
    }

    /* ══════════════════════════════════════════════════
       CARD 8.3 — LPF Wattmeter
       ══════════════════════════════════════════════════ */
    function initCard83() {
        function draw() {
            const pf = parseFloat(el('m8-lpf-pf')?.value ?? 0.2);
            if (el('m8-lpf-pf-val')) el('m8-lpf-pf-val').textContent = pf.toFixed(2);

            const deflPct = pf * 100; // Standard: deflection proportional to PF

            // Standard meter needle
            const stdAngle = Math.PI - (deflPct / 100) * Math.PI;
            const sx = 90 + 70 * Math.cos(stdAngle);
            const sy = 90 + 70 * Math.sin(stdAngle);
            const stdNeedle = el('m8-std-needle');
            if (stdNeedle) { stdNeedle.setAttribute('x2', sx); stdNeedle.setAttribute('y2', sy); }
            const stdReading = el('m8-std-reading');
            if (stdReading) {
                stdReading.textContent = `${fmt(deflPct, 0)}% FSD`;
                stdReading.setAttribute('fill', deflPct < 30 ? RED : GOLD);
            }

            // Deflection arc for standard
            const stdDefl = el('m8-std-defl');
            if (stdDefl) {
                const startX = 20, startY = 90;
                const sweepAngle = (deflPct / 100) * Math.PI;
                const endX = 90 + 80 * Math.cos(Math.PI - sweepAngle);
                const endY = 90 + 80 * Math.sin(Math.PI - sweepAngle);
                const largeArc = sweepAngle > Math.PI / 2 ? 1 : 0;
                stdDefl.setAttribute('d', `M ${startX} ${startY} A 80 80 0 ${largeArc} 1 ${endX} ${endY}`);
                stdDefl.setAttribute('stroke', deflPct < 30 ? RED : GOLD);
            }

            // LPF meter — expanded scale: always high deflection for low PF
            const lpfDeflPct = pf < 0.5 ? 70 + (0.5 - pf) * 60 : pf * 100;
            const lpfAngle = Math.PI - (Math.min(lpfDeflPct, 95) / 100) * Math.PI;
            const lx = 90 + 70 * Math.cos(lpfAngle);
            const ly = 90 + 70 * Math.sin(lpfAngle);
            const lpfNeedle = el('m8-lpf-needle');
            if (lpfNeedle) { lpfNeedle.setAttribute('x2', lx); lpfNeedle.setAttribute('y2', ly); }
            const lpfReading = el('m8-lpf-reading');
            if (lpfReading) {
                lpfReading.textContent = pf < 0.5 ? 'Optimized for low PF' : `${fmt(lpfDeflPct, 0)}% FSD`;
            }
            const lpfDefl = el('m8-lpf-defl');
            if (lpfDefl) {
                const sweepAngle = (Math.min(lpfDeflPct, 95) / 100) * Math.PI;
                const endX = 90 + 80 * Math.cos(Math.PI - sweepAngle);
                const endY = 90 + 80 * Math.sin(Math.PI - sweepAngle);
                const largeArc = sweepAngle > Math.PI / 2 ? 1 : 0;
                lpfDefl.setAttribute('d', `M 20 90 A 80 80 0 ${largeArc} 1 ${endX} ${endY}`);
            }

            // Iron loss PF
            const ironPf = el('m8-iron-pf');
            if (ironPf) ironPf.textContent = `cos φ₀ ≈ ${pf.toFixed(2)}`;

            // Recommendation
            const rec = el('m8-lpf-recommend');
            if (rec) {
                if (pf < 0.5) {
                    rec.textContent = `Standard: ${fmt(deflPct, 0)}% FSD (cramped) → Use LPF Wattmeter`;
                    rec.style.color = RED; rec.style.borderColor = RED;
                } else {
                    rec.textContent = `Standard: ${fmt(deflPct, 0)}% FSD → Standard wattmeter OK`;
                    rec.style.color = GREEN; rec.style.borderColor = GREEN;
                }
            }
        }

        const pfSlider = el('m8-lpf-pf');
        if (pfSlider) pfSlider.addEventListener('input', draw);

        // Calculator
        calcOn('m8-lpf-calc', ['m8-lpfc-pf'], () => {
            const pf = num('m8-lpfc-pf');
            const rec = pf < 0.5 ? '⚠️ Use LPF Wattmeter (cos φ < 0.5)' :
                        pf < 0.7 ? 'Consider LPF Wattmeter for better accuracy' :
                        '✓ Standard wattmeter sufficient';
            el('m8-lpfc-result').textContent = rec;
        });

        draw();
    }

    /* ══════════════════════════════════════════════════
       CARD 8.4 — Blondel's Theorem & Two Wattmeter
       ══════════════════════════════════════════════════ */
    function initCard84() {
        const VL = 415, IL = 10;

        // Blondel's theorem visualizer
        function drawBlondel() {
            const N = parseInt(el('m8-nwire')?.value ?? 3);
            const neutral = el('m8-neutral-chk')?.checked ?? false;
            if (el('m8-nwire-val')) el('m8-nwire-val').textContent = N;

            const wattmeters = neutral ? N : N - 1;
            const result = el('m8-blondel-result');
            if (result) {
                result.textContent = `Use ${wattmeters} wattmeter${wattmeters > 1 ? 's' : ''}`;
                result.style.color = neutral ? VIOLET : GREEN;
                result.style.borderColor = neutral ? VIOLET : GREEN;
            }

            // Draw wires
            const svg = el('m8-blondel-svg');
            if (!svg) return;
            svg.innerHTML = '';
            const ns = 'http://www.w3.org/2000/svg';
            const colors = [RED, GOLD, BLUE, GREEN, ORANGE, VIOLET];
            const wireSpacing = 130 / (N + 1);

            for (let i = 0; i < N; i++) {
                const y = 20 + (i + 1) * wireSpacing;
                // Wire
                const line = document.createElementNS(ns, 'line');
                line.setAttribute('x1', '10'); line.setAttribute('y1', y);
                line.setAttribute('x2', '230'); line.setAttribute('y2', y);
                line.setAttribute('stroke', colors[i % colors.length]);
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
                // Wire label
                const txt = document.createElementNS(ns, 'text');
                txt.setAttribute('x', '5'); txt.setAttribute('y', y - 4);
                txt.setAttribute('fill', colors[i % colors.length]);
                txt.setAttribute('font-size', '8'); txt.textContent = `W${i + 1}`;
                svg.appendChild(txt);
            }

            // Wattmeter boxes (N-1 or N)
            const wmCount = wattmeters;
            for (let j = 0; j < Math.min(wmCount, N); j++) {
                const y = 20 + (j + 1) * wireSpacing;
                const rect = document.createElementNS(ns, 'rect');
                rect.setAttribute('x', '90'); rect.setAttribute('y', y - 9);
                rect.setAttribute('width', '35'); rect.setAttribute('height', '18');
                rect.setAttribute('rx', '4');
                rect.setAttribute('fill', 'rgba(0,255,136,0.08)');
                rect.setAttribute('stroke', GREEN); rect.setAttribute('stroke-width', '1.5');
                svg.appendChild(rect);
                const label = document.createElementNS(ns, 'text');
                label.setAttribute('x', '107'); label.setAttribute('y', y + 4);
                label.setAttribute('fill', GREEN); label.setAttribute('font-size', '8');
                label.setAttribute('text-anchor', 'middle');
                label.textContent = `W${j + 1}`;
                svg.appendChild(label);
            }

            // Neutral indicator
            if (neutral) {
                const nTxt = document.createElementNS(ns, 'text');
                nTxt.setAttribute('x', '200'); nTxt.setAttribute('y', '155');
                nTxt.setAttribute('fill', VIOLET); nTxt.setAttribute('font-size', '10');
                nTxt.setAttribute('text-anchor', 'middle');
                nTxt.textContent = 'N (neutral)';
                svg.appendChild(nTxt);
            }

            // Load box
            const loadRect = document.createElementNS(ns, 'rect');
            loadRect.setAttribute('x', '180'); loadRect.setAttribute('y', '15');
            loadRect.setAttribute('width', '45'); loadRect.setAttribute('height', wireSpacing * N + 10);
            loadRect.setAttribute('rx', '6'); loadRect.setAttribute('fill', 'rgba(255,255,255,0.02)');
            loadRect.setAttribute('stroke', '#475569'); loadRect.setAttribute('stroke-width', '1.5');
            svg.appendChild(loadRect);
            const loadTxt = document.createElementNS(ns, 'text');
            loadTxt.setAttribute('x', '202'); loadTxt.setAttribute('y', 20 + wireSpacing * N / 2);
            loadTxt.setAttribute('fill', '#fff'); loadTxt.setAttribute('font-size', '10');
            loadTxt.setAttribute('text-anchor', 'middle'); loadTxt.textContent = 'Load';
            svg.appendChild(loadTxt);
        }

        const nWire = el('m8-nwire');
        const nCheck = el('m8-neutral-chk');
        if (nWire) nWire.addEventListener('input', drawBlondel);
        if (nCheck) nCheck.addEventListener('change', drawBlondel);

        // Two wattmeter chart with PF zones
        function draw2W() {
            const phi = parseFloat(el('m8-2w-phi')?.value ?? 30);
            if (el('m8-2w-phi-val')) el('m8-2w-phi-val').textContent = phi;

            const phiR = deg2rad(phi);
            const W1 = VL * IL * Math.cos(deg2rad(30) - phiR);
            const W2 = VL * IL * Math.cos(deg2rad(30) + phiR);
            const P  = W1 + W2;
            const Q  = Math.sqrt(3) * (W1 - W2);
            const S  = Math.sqrt(P * P + Q * Q);
            const pf = Math.cos(phiR);

            const w1b = el('m8-2w-w1badge');
            if (w1b) w1b.textContent = `W₁ = ${fmt(W1, 0)} W`;
            const w2b = el('m8-2w-w2badge');
            if (w2b) {
                w2b.textContent = `W₂ = ${fmt(W2, 0)} W`;
                w2b.style.color = W2 >= 0 ? ORANGE : RED;
                w2b.style.borderColor = w2b.style.color;
            }
            const ptb = el('m8-2w-ptbadge');
            if (ptb) ptb.textContent = `P = ${fmt(P, 0)} W`;
            const pfb = el('m8-2w-pfbadge');
            if (pfb) {
                pfb.textContent = `pf = ${fmt(pf, 3)}`;
                pfb.style.color = pf > 0.5 ? GREEN : pf === 0.5 ? GOLD : RED;
                pfb.style.borderColor = pfb.style.color;
            }
            const revb = el('m8-2w-revbadge');
            if (revb) revb.style.display = phi > 60 ? '' : 'none';

            build2WChart(phi);
        }

        const phi2w = el('m8-2w-phi');
        if (phi2w) phi2w.addEventListener('input', draw2W);

        // Two Wattmeter Calculator
        calcOn('m8-2w-calc', ['m8-2wc-w1', 'm8-2wc-w2'], () => {
            const W1 = num('m8-2wc-w1'), W2 = num('m8-2wc-w2');
            const P = W1 + W2;
            const Q = Math.sqrt(3) * (W1 - W2);
            const S = Math.sqrt(P * P + Q * Q);
            const tanPhi = P !== 0 ? Math.sqrt(3) * (W1 - W2) / P : 0;
            const phi = Math.atan(tanPhi);
            const cosPhi = Math.cos(phi);
            el('m8-2wc-result').textContent =
                `P=${fmt(P,0)}W | Q=${fmt(Q,0)}VAR | S=${fmt(S,0)}VA | tanφ=${fmt(tanPhi,4)} | cosφ=${fmt(cosPhi,4)}`;
        });

        // Blondel Calculator
        calcOn('m8-blondel-calc', ['m8-bc-n'], () => {
            const N = parseInt(num('m8-bc-n'));
            const neutral = el('m8-bc-neutral')?.checked ?? false;
            const wm = neutral ? N : N - 1;
            el('m8-bc-result').textContent = `Wattmeters needed: ${wm} (${neutral ? 'with neutral → N' : 'no neutral → N-1'})`;
        });
        const bcNeutral = el('m8-bc-neutral');
        if (bcNeutral) bcNeutral.addEventListener('change', () => {
            const N = parseInt(num('m8-bc-n'));
            const neutral = bcNeutral.checked;
            const wm = neutral ? N : N - 1;
            el('m8-bc-result').textContent = `Wattmeters needed: ${wm} (${neutral ? 'with neutral → N' : 'no neutral → N-1'})`;
        });

        drawBlondel();
        draw2W();
    }

    function build2WChart(currentPhi) {
        const c = el('m8-2w-chart');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const VL = 415, IL = 10;
        const w = 310, h = 220, m = { t: 25, r: 15, b: 30, l: 45 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const phis = d3.range(0, 91, 2);
        const w1Data = phis.map(p => ({ phi: p, val: VL * IL * Math.cos(deg2rad(30 - p)) }));
        const w2Data = phis.map(p => ({ phi: p, val: VL * IL * Math.cos(deg2rad(30 + p)) }));

        const x = d3.scaleLinear().domain([0, 90]).range([m.l, w - m.r]);
        const allVals = [...w1Data.map(d => d.val), ...w2Data.map(d => d.val)];
        const y = d3.scaleLinear().domain([d3.min(allVals) * 1.1, d3.max(allVals) * 1.1]).range([h - m.b, m.t]);

        // PF zones
        // Green zone: 0-60 (pf 1→0.5, both positive)
        svg.append('rect').attr('x', x(0)).attr('y', m.t)
            .attr('width', x(60) - x(0)).attr('height', h - m.b - m.t)
            .attr('fill', 'rgba(0,255,136,0.04)');
        // Gold zone: pf=0.5 marker
        svg.append('line').attr('x1', x(60)).attr('x2', x(60))
            .attr('y1', m.t).attr('y2', h - m.b)
            .attr('stroke', GOLD).attr('stroke-dasharray', '3 2');
        svg.append('text').attr('x', x(60) + 3).attr('y', m.t + 10).attr('fill', GOLD)
            .attr('font-size', '7px').text('pf=0.5');
        // Red zone: >60
        svg.append('rect').attr('x', x(60)).attr('y', m.t)
            .attr('width', x(90) - x(60)).attr('height', h - m.b - m.t)
            .attr('fill', 'rgba(239,68,68,0.04)');

        // Axes
        svg.append('g').attr('transform', `translate(0,${h - m.b})`)
            .call(d3.axisBottom(x).ticks(6).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.append('g').attr('transform', `translate(${m.l},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.selectAll('.domain,.tick line').attr('stroke', '#334155');

        // Zero line
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r)
            .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#475569').attr('stroke-dasharray', '2 2');

        // W1 line
        svg.append('path').datum(w1Data).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.phi)).y(d => y(d.val)));
        // W2 line
        svg.append('path').datum(w2Data).attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.phi)).y(d => y(d.val)));

        // Current phi marker
        const w1v = VL * IL * Math.cos(deg2rad(30 - currentPhi));
        const w2v = VL * IL * Math.cos(deg2rad(30 + currentPhi));
        svg.append('circle').attr('cx', x(currentPhi)).attr('cy', y(w1v)).attr('r', 4)
            .attr('fill', CYAN).attr('stroke', '#fff').attr('stroke-width', 1);
        svg.append('circle').attr('cx', x(currentPhi)).attr('cy', y(w2v)).attr('r', 4)
            .attr('fill', ORANGE).attr('stroke', '#fff').attr('stroke-width', 1);
        svg.append('line').attr('x1', x(currentPhi)).attr('x2', x(currentPhi))
            .attr('y1', m.t).attr('y2', h - m.b)
            .attr('stroke', '#fff').attr('stroke-dasharray', '2 3').attr('stroke-opacity', 0.3);

        // Legend
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 10).attr('fill', CYAN)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('W₁');
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 22).attr('fill', ORANGE)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('W₂');

        // Axis labels
        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('φ (degrees)');
        svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', GREEN)
            .attr('font-size', '9px').attr('text-anchor', 'middle').text('W₁, W₂ vs φ (PF Zones)');
    }

    /* ══════════════════════════════════════════════════
       CARD 8.5 — Summary Dashboard
       ══════════════════════════════════════════════════ */
    function initCard85() {
        const ox = 30, oy = 170;

        function draw() {
            const W1 = parseFloat(el('m8-sum-w1')?.value ?? 1500);
            const W2 = parseFloat(el('m8-sum-w2')?.value ?? 800);
            if (el('m8-sum-w1-val')) el('m8-sum-w1-val').textContent = W1;
            if (el('m8-sum-w2-val')) el('m8-sum-w2-val').textContent = W2;

            const P = W1 + W2;
            const Q = Math.sqrt(3) * (W1 - W2);
            const S = Math.sqrt(P * P + Q * Q);
            const tanPhi = P !== 0 ? Math.sqrt(3) * (W1 - W2) / P : 0;
            const phi = Math.atan(Math.abs(tanPhi));
            const pf = Math.cos(phi);

            // Scale
            const maxLen = 170;
            const s = S > 0 ? maxLen / S : 1;
            const pLen = Math.abs(P) * s;
            const qLen = Math.abs(Q) * s;

            // P line
            const pLine = el('m8-sum-P');
            if (pLine) pLine.setAttribute('x2', ox + pLen);
            const pLbl = el('m8-sum-P-lbl');
            if (pLbl) { pLbl.setAttribute('x', ox + pLen / 2); pLbl.textContent = `P = ${fmt(P, 0)} W`; }

            // Q line
            const qLine = el('m8-sum-Q');
            if (qLine) {
                qLine.setAttribute('x1', ox + pLen); qLine.setAttribute('y1', oy);
                qLine.setAttribute('x2', ox + pLen); qLine.setAttribute('y2', oy - qLen);
            }
            const qLbl = el('m8-sum-Q-lbl');
            if (qLbl) {
                qLbl.setAttribute('x', ox + pLen + 8); qLbl.setAttribute('y', oy - qLen / 2);
                qLbl.textContent = `Q = ${fmt(Q, 0)} VAR`;
            }

            // S line
            const sLine = el('m8-sum-S');
            if (sLine) { sLine.setAttribute('x2', ox + pLen); sLine.setAttribute('y2', oy - qLen); }
            const sLbl = el('m8-sum-S-lbl');
            if (sLbl) {
                sLbl.setAttribute('x', ox + pLen / 2 - 20); sLbl.setAttribute('y', oy - qLen / 2 - 8);
                sLbl.textContent = `S = ${fmt(S, 0)} VA`;
            }

            // φ arc
            const arcR = 40;
            const ex = ox + arcR * Math.cos(phi);
            const ey = oy - arcR * Math.sin(phi);
            const arc = el('m8-sum-phi-arc');
            if (arc) arc.setAttribute('d', `M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${ex} ${ey}`);
            const phiLbl = el('m8-sum-phi-lbl');
            if (phiLbl) { phiLbl.setAttribute('x', ox + arcR + 5); phiLbl.textContent = `φ = ${fmt(rad2deg(phi), 1)}°`; }

            // Readout
            const readout = el('m8-sum-readout');
            if (readout) readout.textContent = `P=${fmt(P,0)} | Q=${fmt(Q,0)} | S=${fmt(S,0)} | cosφ=${fmt(pf,3)}`;

            buildPFZoneChart(pf);
        }

        ['m8-sum-w1', 'm8-sum-w2'].forEach(id => {
            const e = el(id); if (e) e.addEventListener('input', draw);
        });

        // Calculator
        calcOn('m8-sum-calc', ['m8-sumc-w1', 'm8-sumc-w2'], () => {
            const W1 = num('m8-sumc-w1'), W2 = num('m8-sumc-w2');
            const P = W1 + W2, Q = Math.sqrt(3) * (W1 - W2);
            const S = Math.sqrt(P * P + Q * Q);
            const tanPhi = P !== 0 ? Math.sqrt(3) * (W1 - W2) / P : 0;
            const phi = Math.atan(Math.abs(tanPhi));
            const pf = Math.cos(phi);
            el('m8-sumc-result').textContent = `P=${fmt(P,0)} W | Q=${fmt(Q,0)} VAR | S=${fmt(S,0)} VA | cosφ=${fmt(pf,4)}`;
        });

        draw();
    }

    function buildPFZoneChart(currentPF) {
        const c = el('m8-pf-zone-chart');
        if (!c || typeof d3 === 'undefined') return;
        c.innerHTML = '';

        const w = 290, h = 190, m = { t: 25, r: 10, b: 30, l: 15 };
        const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const barY = 60, barH = 40;
        const x = d3.scaleLinear().domain([0, 1]).range([m.l, w - m.r]);

        // Zone 1: pf 1→0.5 (green)
        svg.append('rect').attr('x', x(0.5)).attr('y', barY)
            .attr('width', x(1) - x(0.5)).attr('height', barH)
            .attr('fill', 'rgba(0,255,136,0.2)').attr('rx', 4);
        svg.append('text').attr('x', (x(0.5) + x(1)) / 2).attr('y', barY + barH / 2 + 4)
            .attr('fill', GREEN).attr('font-size', '8px').attr('text-anchor', 'middle')
            .text('W₁,W₂ > 0');

        // Zone 2: pf=0.5 marker
        svg.append('line').attr('x1', x(0.5)).attr('x2', x(0.5))
            .attr('y1', barY - 5).attr('y2', barY + barH + 5)
            .attr('stroke', GOLD).attr('stroke-width', 2);
        svg.append('text').attr('x', x(0.5)).attr('y', barY - 10)
            .attr('fill', GOLD).attr('font-size', '8px').attr('text-anchor', 'middle')
            .text('pf=0.5: W₂=0');

        // Zone 3: pf <0.5 (red)
        svg.append('rect').attr('x', x(0)).attr('y', barY)
            .attr('width', x(0.5) - x(0)).attr('height', barH)
            .attr('fill', 'rgba(239,68,68,0.15)').attr('rx', 4);
        svg.append('text').attr('x', (x(0) + x(0.5)) / 2).attr('y', barY + barH / 2 + 4)
            .attr('fill', RED).attr('font-size', '8px').attr('text-anchor', 'middle')
            .text('W₂ < 0 ⚠️');

        // Current PF dot
        const dotX = x(Math.max(0, Math.min(1, currentPF)));
        svg.append('circle').attr('cx', dotX).attr('cy', barY + barH / 2)
            .attr('r', 8).attr('fill', currentPF > 0.5 ? GREEN : RED)
            .attr('stroke', '#fff').attr('stroke-width', 2);
        svg.append('text').attr('x', dotX).attr('y', barY + barH + 25)
            .attr('fill', '#fff').attr('font-size', '10px').attr('text-anchor', 'middle')
            .text(`pf = ${fmt(currentPF, 3)}`);

        // Axis
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r)
            .attr('y1', barY + barH + 2).attr('y2', barY + barH + 2)
            .attr('stroke', '#475569');
        [0, 0.25, 0.5, 0.75, 1].forEach(v => {
            svg.append('text').attr('x', x(v)).attr('y', barY + barH + 14)
                .attr('fill', '#94a3b8').attr('font-size', '7px').attr('text-anchor', 'middle')
                .text(v);
        });

        // Title
        svg.append('text').attr('x', w / 2).attr('y', 15).attr('fill', GREEN)
            .attr('font-size', '9px').attr('text-anchor', 'middle').text('Power Factor Zones (Two Wattmeter)');

        // Description
        svg.append('text').attr('x', w / 2).attr('y', h - 5).attr('fill', '#94a3b8')
            .attr('font-size', '7px').attr('text-anchor', 'middle')
            .text('cos φ axis →');
    }

    /* ══════════════════════════════════════════════════
       INIT ALL CARDS
       ══════════════════════════════════════════════════ */
    function init() {
        initCard81();
        initCard82();
        initCard83();
        initCard84();
        initCard85();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
