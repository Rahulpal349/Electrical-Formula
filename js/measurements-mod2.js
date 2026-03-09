/* ═══════════════════════════════════════════════════════════════════════
   MODULE 2 — MEASURING INSTRUMENTS
   Animations, Calculators & Interactivity
   Tech: D3.js v7, GSAP 3, SVG
   Accent: #f97316 (Orange)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const ORANGE = '#f97316', CYAN = '#00f5ff', GOLD = '#facc15',
        PURPLE = '#a78bfa', BLUE = '#60a5fa', GREEN = '#00ff88',
        RED = '#ef4444', ROSE = '#fb7185', GREY = '#94a3b8',
        BG = '#0d1117';

    /* ──────────────────────────────────────────────────
       UTILITY: safe D3 container
       ────────────────────────────────────────────────── */
    function d3Container(id, w, h) {
        const el = document.getElementById(id);
        if (!el) return null;
        el.innerHTML = '';
        return d3.select('#' + id)
            .append('svg')
            .attr('width', w).attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`)
            .style('overflow', 'visible');
    }

    /* ──────────────────────────────────────────────────
       CARD 1 — SWAMP RESISTANCE
       R vs Temperature graph (with/without swamp)
       ────────────────────────────────────────────────── */
    function initSwampResistance() {
        const W = 340, H = 200, M = { t: 25, r: 20, b: 35, l: 45 };
        const svg = d3Container('m2-swamp-graph', W, H);
        if (!svg) return;

        const xScale = d3.scaleLinear().domain([0, 100]).range([M.l, W - M.r]);
        const yScale = d3.scaleLinear().domain([0, 30]).range([H - M.b, M.t]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${H - M.b})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '°C'))
            .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);

        svg.append('g')
            .attr('transform', `translate(${M.l},0)`)
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + 'Ω'))
            .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);

        // Labels
        svg.append('text').attr('x', W / 2).attr('y', H - 2)
            .attr('fill', GREY).attr('font-size', 10).attr('text-anchor', 'middle').text('Temperature');
        svg.append('text').attr('x', 12).attr('y', M.t - 8)
            .attr('fill', GREY).attr('font-size', 10).text('R (Ω)');

        // Data generators
        const baseR = 10;
        function withoutSwamp(t) { return baseR * (1 + 0.004 * t); }  // high α copper
        function withSwamp(t) { return (baseR + 8) * (1 + 0.0002 * t); }  // near-zero α

        const temps = d3.range(0, 101, 2);
        const lineGen = d3.line().x(d => xScale(d)).curve(d3.curveBasis);

        // Without swamp line (red, steep)
        const pathNo = svg.append('path')
            .datum(temps)
            .attr('d', lineGen.y(d => yScale(withoutSwamp(d))))
            .attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 2.5);

        // With swamp line (green, flat)
        const pathYes = svg.append('path')
            .datum(temps)
            .attr('d', lineGen.y(d => yScale(withSwamp(d))))
            .attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2.5);

        // Legend
        svg.append('rect').attr('x', M.l + 10).attr('y', M.t + 2).attr('width', 14).attr('height', 3).attr('fill', RED);
        svg.append('text').attr('x', M.l + 28).attr('y', M.t + 7).attr('fill', RED).attr('font-size', 9).text('Without Swamp');
        svg.append('rect').attr('x', M.l + 10).attr('y', M.t + 14).attr('width', 14).attr('height', 3).attr('fill', GREEN);
        svg.append('text').attr('x', M.l + 28).attr('y', M.t + 19).attr('fill', GREEN).attr('font-size', 9).text('With Swamp');

        // Temperature marker
        const marker = svg.append('g');
        const mLine = marker.append('line')
            .attr('y1', M.t).attr('y2', H - M.b)
            .attr('stroke', ORANGE).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');
        const mCircleR = marker.append('circle').attr('r', 4).attr('fill', RED);
        const mCircleG = marker.append('circle').attr('r', 4).attr('fill', GREEN);
        const mTextR = marker.append('text').attr('fill', RED).attr('font-size', 9).attr('text-anchor', 'start');
        const mTextG = marker.append('text').attr('fill', GREEN).attr('font-size', 9).attr('text-anchor', 'start');

        function updateTemp(t) {
            const xp = xScale(t);
            const yrNo = yScale(withoutSwamp(t));
            const yrYes = yScale(withSwamp(t));
            mLine.attr('x1', xp).attr('x2', xp);
            mCircleR.attr('cx', xp).attr('cy', yrNo);
            mCircleG.attr('cx', xp).attr('cy', yrYes);
            mTextR.attr('x', xp + 6).attr('y', yrNo - 4).text(withoutSwamp(t).toFixed(1) + 'Ω');
            mTextG.attr('x', xp + 6).attr('y', yrYes + 12).text(withSwamp(t).toFixed(1) + 'Ω');
        }

        const slider = document.getElementById('m2-swamp-temp');
        const valEl = document.getElementById('m2-swamp-temp-val');
        if (slider) {
            slider.addEventListener('input', function () {
                const t = +this.value;
                valEl.textContent = t + '°C';
                updateTemp(t);
            });
        }
        updateTemp(25);

        // Calculator
        initCalcListener(['m2-sw-rm', 'm2-sw-m'], function () {
            const Rm = +document.getElementById('m2-sw-rm').value;
            const m = +document.getElementById('m2-sw-m').value;
            if (m <= 1) { setResult('m2-sw-result', 'm must be > 1'); return; }
            const Rsw = Rm / (m - 1);
            setResult('m2-sw-result', `R_sw = ${Rsw.toFixed(3)} Ω`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 2 — MULTIRANGE AMMETER (Individual Shunts)
       Current splitting bar chart + range switching
       ────────────────────────────────────────────────── */
    function initMultirangeAmmeter() {
        const Im = 0.001, Rm = 100;
        const ranges = [
            { name: 'Range 1', I: 1, color: BLUE },
            { name: 'Range 2', I: 5, color: CYAN },
            { name: 'Range 3', I: 10, color: PURPLE }
        ];

        // Bar chart
        const W = 200, H = 200, M = { t: 20, r: 10, b: 30, l: 40 };
        const svg = d3Container('m2-current-bars', W, H);
        if (!svg) return;

        function drawBars(rangeIdx) {
            svg.selectAll('*').remove();
            const r = ranges[rangeIdx];
            const m = r.I / Im;
            const Is = r.I - Im;

            const data = [
                { label: 'I_total', val: r.I, color: GREEN },
                { label: 'I_m', val: Im, color: ORANGE },
                { label: 'I_s', val: Is, color: BLUE }
            ];

            const xScale = d3.scaleBand().domain(data.map(d => d.label)).range([M.l, W - M.r]).padding(0.3);
            const yScale = d3.scaleLinear().domain([0, r.I * 1.1]).range([H - M.b, M.t]);

            svg.append('g').attr('transform', `translate(0,${H - M.b})`)
                .call(d3.axisBottom(xScale)).selectAll('text').attr('fill', GREY).attr('font-size', 9);
            svg.selectAll('.domain,.tick line').attr('stroke', GREY);

            svg.selectAll('.bar')
                .data(data).enter()
                .append('rect')
                .attr('x', d => xScale(d.label))
                .attr('width', xScale.bandwidth())
                .attr('y', H - M.b)
                .attr('height', 0)
                .attr('fill', d => d.color)
                .attr('rx', 3)
                .transition().duration(600)
                .attr('y', d => yScale(d.val))
                .attr('height', d => H - M.b - yScale(d.val));

            svg.selectAll('.bar-label')
                .data(data).enter()
                .append('text')
                .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.val) - 5)
                .attr('fill', d => d.color).attr('font-size', 8).attr('text-anchor', 'middle')
                .text(d => d.val.toFixed(4) + 'A');

            // Title
            svg.append('text').attr('x', W / 2).attr('y', 12)
                .attr('fill', ORANGE).attr('font-size', 10).attr('text-anchor', 'middle')
                .text(`m = ${m.toFixed(0)}, Rsh = ${(Rm / (m - 1)).toFixed(4)}Ω`);
        }

        // SVG highlight for selected shunt
        function highlightShunt(idx) {
            const shunts = ['m2-sh1', 'm2-sh2', 'm2-sh3'];
            shunts.forEach((id, i) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (i === idx) {
                    el.setAttribute('stroke', ORANGE);
                    el.setAttribute('stroke-width', '3');
                    el.setAttribute('fill', 'rgba(249,115,22,0.15)');
                    el.style.filter = 'drop-shadow(0 0 6px rgba(249,115,22,0.5))';
                } else {
                    el.setAttribute('stroke', BLUE);
                    el.setAttribute('stroke-width', i === idx ? '3' : '1.5');
                    el.setAttribute('fill', 'rgba(96,165,250,0.05)');
                    el.style.filter = 'none';
                    el.style.opacity = '0.4';
                }
            });
            if (document.getElementById(shunts[idx])) {
                document.getElementById(shunts[idx]).style.opacity = '1';
            }
            // Move switch arm
            const arm = document.getElementById('m2-switch-arm');
            if (arm) {
                const yPositions = [90, 130, 170];
                arm.setAttribute('y2', yPositions[idx]);
            }
        }

        // Range buttons
        ['m2-range1', 'm2-range2', 'm2-range3'].forEach((id, i) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('#m2-range1,#m2-range2,#m2-range3').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    drawBars(i);
                    highlightShunt(i);
                });
            }
        });

        drawBars(0);
        highlightShunt(0);

        // Calculator
        initCalcListener(['m2-sh-im', 'm2-sh-rm', 'm2-sh-i'], function () {
            const im = +document.getElementById('m2-sh-im').value;
            const rm = +document.getElementById('m2-sh-rm').value;
            const I = +document.getElementById('m2-sh-i').value;
            if (im <= 0 || I <= im) { setResult('m2-sh-result', 'I must be > Im'); return; }
            const m = I / im;
            const Rsh = rm / (m - 1);
            setResult('m2-sh-result', `m = ${m.toFixed(2)}, Rsh = ${Rsh.toFixed(4)} Ω`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 3 — AYRTON (UNIVERSAL) SHUNT
       Safe switching animation
       ────────────────────────────────────────────────── */
    function initAyrtonShunt() {
        const rangeConfigs = [
            { tap: 'all', label: 'Range 1 (Lowest): All R in shunt path', armX: 80, highlight: [0, 1, 2] },
            { tap: 'R2+R3', label: 'Range 2: R₂ + R₃ shunting', armX: 170, highlight: [1, 2] },
            { tap: 'R3', label: 'Range 3 (Highest): Only R₃ shunting', armX: 260, highlight: [2] }
        ];

        function setRange(idx) {
            const cfg = rangeConfigs[idx];
            // Highlight resistors
            ['m2-ay-r1', 'm2-ay-r2', 'm2-ay-r3'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (cfg.highlight.includes(i)) {
                    el.setAttribute('fill', 'rgba(249,115,22,0.2)');
                    el.setAttribute('stroke', ORANGE);
                    el.setAttribute('stroke-width', '3');
                } else {
                    el.setAttribute('fill', 'rgba(96,165,250,0.08)');
                    el.setAttribute('stroke', BLUE);
                    el.setAttribute('stroke-width', '1.5');
                }
            });
            // Move switch arm
            const arm = document.getElementById('m2-ay-arm');
            const sw = document.getElementById('m2-ay-switch');
            if (arm && sw && typeof gsap !== 'undefined') {
                gsap.to(arm, { attr: { x1: cfg.armX, y1: 102, x2: cfg.armX, y2: 60 }, duration: 0.4 });
                gsap.to(sw, { attr: { cx: cfg.armX }, duration: 0.4 });
            }
            // Status text
            const statusEl = document.getElementById('m2-ay-status');
            if (statusEl) statusEl.textContent = '✓ ' + cfg.label;
        }

        ['m2-ay-range1', 'm2-ay-range2', 'm2-ay-range3'].forEach((id, i) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('#m2-ay-range1,#m2-ay-range2,#m2-ay-range3').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    setRange(i);
                });
            }
        });

        // vs Individual toggle
        const vsBtn = document.getElementById('m2-ay-vs-toggle');
        if (vsBtn) {
            let showing = false;
            vsBtn.addEventListener('click', function () {
                showing = !showing;
                const statusBox = document.getElementById('m2-ay-status-box');
                const statusEl = document.getElementById('m2-ay-status');
                if (showing) {
                    if (statusBox) statusBox.setAttribute('stroke', RED);
                    if (statusEl) {
                        statusEl.setAttribute('fill', RED);
                        statusEl.textContent = '⚠ Individual Shunts: Switch gap → meter open-circuited → DANGEROUS!';
                    }
                    this.style.background = 'rgba(0,255,136,0.15)';
                    this.style.borderColor = GREEN;
                    this.style.color = GREEN;
                    this.textContent = '✓ Show Ayrton (Safe)';
                } else {
                    if (statusBox) statusBox.setAttribute('stroke', GREEN);
                    if (statusEl) {
                        statusEl.setAttribute('fill', GREEN);
                        statusEl.textContent = '✓ Ayrton: Meter always has a path — never open-circuited';
                    }
                    this.style.background = 'rgba(239,68,68,0.15)';
                    this.style.borderColor = RED;
                    this.style.color = RED;
                    this.textContent = '⚠ vs Individual Shunts';
                }
            });
        }

        setRange(0);

        // Calculator
        initCalcListener(['m2-ay-rm', 'm2-ay-im', 'm2-ay-i1', 'm2-ay-i2', 'm2-ay-i3'], function () {
            const Rm = +document.getElementById('m2-ay-rm').value;
            const Im = +document.getElementById('m2-ay-im').value;
            const I1 = +document.getElementById('m2-ay-i1').value;
            const I2 = +document.getElementById('m2-ay-i2').value;
            const I3 = +document.getElementById('m2-ay-i3').value;
            if (Im <= 0) { setResult('m2-ay-result', 'Im must be > 0'); return; }
            const m1 = I1 / Im, m2 = I2 / Im, m3 = I3 / Im;
            if (m1 <= 1 || m2 <= 1 || m3 <= 1) { setResult('m2-ay-result', 'All I ranges must be > Im'); return; }
            const R1 = Rm / (m1 - 1);
            const R2 = (Rm + R1) / m2 - R1;
            const R3 = (Rm + R1 + R2) / m3;
            setResult('m2-ay-result', `R₁ = ${R1.toFixed(4)}Ω, R₂ = ${R2.toFixed(4)}Ω, R₃ = ${R3.toFixed(4)}Ω`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 4 — VOLTMETER MULTIPLIER
       Pointer animation + multirange D3
       ────────────────────────────────────────────────── */
    function initVoltmeterMultiplier() {
        const Rm = 100, Ifsd = 0.001;
        const Vm = Ifsd * Rm; // 0.1V FSD

        const slider = document.getElementById('m2-volt-v');
        const valEl = document.getElementById('m2-volt-v-val');
        const rseLabel = document.getElementById('m2-rse-label');
        const fsdText = document.getElementById('m2-fsd-text');
        const fsdBox = document.getElementById('m2-fsd-box');
        const sensText = document.getElementById('m2-sens-text');
        const pointer = document.getElementById('m2-volt-pointer');

        function updateV(V) {
            const m = V / Vm;
            const Rse = (m - 1) * Rm;
            if (valEl) valEl.textContent = V + ' V';
            if (rseLabel) rseLabel.textContent = 'Rse = ' + Rse.toFixed(0) + 'Ω';
            const S = 1 / Ifsd;
            if (sensText) sensText.textContent = `S = ${S.toFixed(0)} Ω/V — Rtotal = ${(S * V).toFixed(0)}Ω`;

            // Pointer rotation: map V to angle (-45 to 45 deg)
            const frac = Math.min(V / (Vm * 100), 1);
            const angle = -45 + frac * 90;
            if (pointer && typeof gsap !== 'undefined') {
                gsap.to(pointer, { rotation: angle, transformOrigin: '270px 90px', duration: 0.3 });
            }

            // FSD indicator
            if (fsdBox && fsdText) {
                if (V <= Vm * 100) {
                    fsdBox.setAttribute('stroke', GREEN);
                    fsdText.setAttribute('fill', GREEN);
                    fsdText.textContent = 'FSD ✓';
                } else {
                    fsdBox.setAttribute('stroke', RED);
                    fsdText.setAttribute('fill', RED);
                    fsdText.textContent = 'OVER!';
                }
            }
        }

        if (slider) {
            slider.addEventListener('input', function () { updateV(+this.value); });
        }
        updateV(10);

        // Multirange voltmeter D3 mini chart
        const W = 200, H = 180, M = { t: 20, r: 10, b: 30, l: 50 };
        const svg = d3Container('m2-volt-multirange', W, H);
        if (svg) {
            const voltRanges = [
                { V: 10, Rse: (10 / Vm - 1) * Rm },
                { V: 50, Rse: (50 / Vm - 1) * Rm },
                { V: 100, Rse: (100 / Vm - 1) * Rm }
            ];
            const xScale = d3.scaleBand().domain(voltRanges.map(d => d.V + 'V')).range([M.l, W - M.r]).padding(0.3);
            const yScale = d3.scaleLinear().domain([0, d3.max(voltRanges, d => d.Rse) * 1.1]).range([H - M.b, M.t]);

            svg.append('g').attr('transform', `translate(0,${H - M.b})`)
                .call(d3.axisBottom(xScale)).selectAll('text').attr('fill', GREY).attr('font-size', 9);
            svg.append('g').attr('transform', `translate(${M.l},0)`)
                .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => d / 1000 + 'kΩ')).selectAll('text').attr('fill', GREY).attr('font-size', 8);
            svg.selectAll('.domain,.tick line').attr('stroke', GREY);

            svg.selectAll('.mr-bar')
                .data(voltRanges).enter()
                .append('rect')
                .attr('x', d => xScale(d.V + 'V'))
                .attr('width', xScale.bandwidth())
                .attr('y', d => yScale(d.Rse))
                .attr('height', d => H - M.b - yScale(d.Rse))
                .attr('fill', GREEN).attr('rx', 3).attr('opacity', 0.7);

            svg.selectAll('.mr-label')
                .data(voltRanges).enter()
                .append('text')
                .attr('x', d => xScale(d.V + 'V') + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.Rse) - 5)
                .attr('fill', GREEN).attr('font-size', 8).attr('text-anchor', 'middle')
                .text(d => (d.Rse / 1000).toFixed(0) + 'kΩ');

            svg.append('text').attr('x', W / 2).attr('y', 12)
                .attr('fill', ORANGE).attr('font-size', 10).attr('text-anchor', 'middle')
                .text('Multirange Rse');
        }

        // Calculator
        initCalcListener(['m2-mu-im', 'm2-mu-rm', 'm2-mu-v'], function () {
            const im = +document.getElementById('m2-mu-im').value;
            const rm = +document.getElementById('m2-mu-rm').value;
            const V = +document.getElementById('m2-mu-v').value;
            if (im <= 0) { setResult('m2-mu-result', 'IFSD must be > 0'); return; }
            const vm = im * rm;
            const m = V / vm;
            const Rse = (m - 1) * rm;
            const S = 1 / im;
            setResult('m2-mu-result', `m = ${m.toFixed(2)}, Rse = ${Rse.toFixed(2)} Ω, S = ${S.toFixed(0)} Ω/V`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 5 — MOVING IRON (MI) INSTRUMENT
       Scale comparison + frequency error + hysteresis
       ────────────────────────────────────────────────── */
    function initMovingIron() {
        // Scale comparison: PMMC (linear) vs MI (I²)
        const W1 = 280, H1 = 160, M1 = { t: 25, r: 15, b: 30, l: 40 };
        const svg1 = d3Container('m2-mi-scale-compare', W1, H1);
        if (svg1) {
            const xScale = d3.scaleLinear().domain([0, 100]).range([M1.l, W1 - M1.r]);
            const yScale = d3.scaleLinear().domain([0, 100]).range([H1 - M1.b, M1.t]);

            svg1.append('g').attr('transform', `translate(0,${H1 - M1.b})`)
                .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '%'))
                .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);
            svg1.append('g').attr('transform', `translate(${M1.l},0)`)
                .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '%'))
                .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);

            const pts = d3.range(0, 101, 2);
            const lineGen = d3.line().x(d => xScale(d)).curve(d3.curveBasis);

            // PMMC linear
            svg1.append('path').datum(pts)
                .attr('d', lineGen.y(d => yScale(d)))
                .attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 2);
            // MI square law
            svg1.append('path').datum(pts)
                .attr('d', lineGen.y(d => yScale(d * d / 100)))
                .attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2);

            // Current marker
            const mGroup = svg1.append('g');
            const mLine = mGroup.append('line')
                .attr('y1', M1.t).attr('y2', H1 - M1.b)
                .attr('stroke', ORANGE).attr('stroke-width', 1).attr('stroke-dasharray', '3 3');
            const cPmmc = mGroup.append('circle').attr('r', 4).attr('fill', CYAN);
            const cMi = mGroup.append('circle').attr('r', 4).attr('fill', GOLD);

            window._m2MiScaleUpdate = function (pct) {
                const xp = xScale(pct);
                mLine.attr('x1', xp).attr('x2', xp);
                cPmmc.attr('cx', xp).attr('cy', yScale(pct));
                cMi.attr('cx', xp).attr('cy', yScale(pct * pct / 100));
            };
            window._m2MiScaleUpdate(50);

            // Legend
            svg1.append('rect').attr('x', M1.l + 5).attr('y', M1.t).attr('width', 12).attr('height', 3).attr('fill', CYAN);
            svg1.append('text').attr('x', M1.l + 20).attr('y', M1.t + 5).attr('fill', CYAN).attr('font-size', 8).text('PMMC (θ∝I)');
            svg1.append('rect').attr('x', M1.l + 5).attr('y', M1.t + 12).attr('width', 12).attr('height', 3).attr('fill', GOLD);
            svg1.append('text').attr('x', M1.l + 20).attr('y', M1.t + 17).attr('fill', GOLD).attr('font-size', 8).text('MI (θ∝I²)');

            svg1.append('text').attr('x', W1 / 2).attr('y', H1 - 2)
                .attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Current (% of FSD)');
        }

        // Frequency error graph
        const W2 = 240, H2 = 160, M2 = { t: 25, r: 15, b: 30, l: 40 };
        const svg2 = d3Container('m2-mi-freq-graph', W2, H2);
        let freqDataPath, freqCompPath;
        if (svg2) {
            const xScale = d3.scaleLinear().domain([10, 200]).range([M2.l, W2 - M2.r]);
            const yScale = d3.scaleLinear().domain([0, 1.2]).range([H2 - M2.b, M2.t]);

            svg2.append('g').attr('transform', `translate(0,${H2 - M2.b})`)
                .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => d + 'Hz'))
                .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);
            svg2.append('g').attr('transform', `translate(${M2.l},0)`)
                .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => (d * 100).toFixed(0) + '%'))
                .selectAll('text,line,path').attr('stroke', GREY).attr('fill', GREY);

            const Rm = 50, Rs = 500, Lm = 0.5, V = 100;
            const freqs = d3.range(10, 201, 2);
            const lineGen = d3.line().x(d => xScale(d)).curve(d3.curveBasis);

            function Im_f(f) {
                const w = 2 * Math.PI * f;
                return V / Math.sqrt(Math.pow(Rm + Rs, 2) + Math.pow(w * Lm, 2));
            }
            const Im50 = Im_f(50);

            // Without compensation
            freqDataPath = svg2.append('path').datum(freqs)
                .attr('d', lineGen.y(d => yScale(Im_f(d) / Im50)))
                .attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 2);

            // With compensation (flat)
            freqCompPath = svg2.append('path').datum(freqs)
                .attr('d', lineGen.y(d => yScale(1)))
                .attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 2)
                .attr('stroke-dasharray', '5 3').attr('opacity', 0);

            // Labels
            svg2.append('text').attr('x', W2 / 2).attr('y', H2 - 2)
                .attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Frequency');
            svg2.append('text').attr('x', W2 / 2).attr('y', M2.t - 8)
                .attr('fill', RED).attr('font-size', 9).attr('text-anchor', 'middle').text('Reading vs Frequency');

            // Frequency marker
            const fMarker = svg2.append('g');
            const fLine = fMarker.append('line').attr('y1', M2.t).attr('y2', H2 - M2.b)
                .attr('stroke', ORANGE).attr('stroke-width', 1).attr('stroke-dasharray', '3 3');
            const fDot = fMarker.append('circle').attr('r', 4).attr('fill', RED);
            const fLabel = fMarker.append('text').attr('fill', RED).attr('font-size', 8);

            window._m2FreqUpdate = function (f) {
                const xp = xScale(f);
                fLine.attr('x1', xp).attr('x2', xp);
                const reading = Im_f(f) / Im50;
                fDot.attr('cx', xp).attr('cy', yScale(reading));
                fLabel.attr('x', xp + 5).attr('y', yScale(reading) - 5).text((reading * 100).toFixed(1) + '%');
            };
            window._m2FreqUpdate(50);
        }

        // Current slider → scale compare + MI iron animation
        const currSlider = document.getElementById('m2-mi-current');
        const currVal = document.getElementById('m2-mi-curr-val');
        const miIron = document.getElementById('m2-mi-moving-iron');
        if (currSlider) {
            currSlider.addEventListener('input', function () {
                const pct = +this.value;
                currVal.textContent = pct + '%';
                if (window._m2MiScaleUpdate) window._m2MiScaleUpdate(pct);
                // Rotate MI iron vane based on I²
                if (miIron && typeof gsap !== 'undefined') {
                    const angle = (pct / 100) * (pct / 100) * 35;
                    gsap.to(miIron, { rotation: angle, transformOrigin: '90px 80px', duration: 0.3 });
                }
            });
        }

        // Frequency slider
        const freqSlider = document.getElementById('m2-mi-freq');
        const freqVal = document.getElementById('m2-mi-freq-val');
        if (freqSlider) {
            freqSlider.addEventListener('input', function () {
                const f = +this.value;
                freqVal.textContent = f + ' Hz';
                if (window._m2FreqUpdate) window._m2FreqUpdate(f);
            });
        }

        // Compensation toggle
        const compToggle = document.getElementById('m2-mi-comp-toggle');
        if (compToggle) {
            let compOn = false;
            compToggle.addEventListener('click', function () {
                compOn = !compOn;
                if (freqCompPath) {
                    freqCompPath.attr('opacity', compOn ? 1 : 0);
                }
                if (compOn) {
                    this.style.background = 'rgba(0,245,255,0.25)';
                    this.textContent = '✓ C Compensation ON';
                } else {
                    this.style.background = 'rgba(0,245,255,0.15)';
                    this.textContent = '+ C Compensation';
                }
            });
        }

        // Calculator
        initCalcListener(['m2-mi-rm', 'm2-mi-rs', 'm2-mi-lm', 'm2-mi-f'], function () {
            const Rm = +document.getElementById('m2-mi-rm').value;
            const Rs = +document.getElementById('m2-mi-rs').value;
            const Lm = +document.getElementById('m2-mi-lm').value;
            const f = +document.getElementById('m2-mi-f').value;
            const w = 2 * Math.PI * f;
            const V = 100;
            const Im = V / Math.sqrt(Math.pow(Rm + Rs, 2) + Math.pow(w * Lm, 2));
            const C = 0.4 * Lm / (Rs * Rs);
            setResult('m2-mi-result',
                `Im = ${(Im * 1000).toFixed(3)} mA, C = ${(C * 1e6).toFixed(3)} μF`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 6 — ELECTRODYNAMOMETER
       Power triangle + mode switching
       ────────────────────────────────────────────────── */
    function initElectrodynamometer() {
        // Power triangle D3
        const W = 220, H = 200, cx = 110, cy = 130;
        const svg = d3Container('m2-edyn-power', W, H);
        let ptGroup;
        if (svg) {
            svg.append('text').attr('x', cx).attr('y', 18)
                .attr('fill', PURPLE).attr('font-size', 11).attr('text-anchor', 'middle')
                .attr('font-family', 'Orbitron').text('Power Triangle');
            ptGroup = svg.append('g');
        }

        function drawPowerTriangle(Vs, Is, phiDeg) {
            if (!ptGroup) return;
            ptGroup.selectAll('*').remove();
            const phi = phiDeg * Math.PI / 180;
            const S = Vs * Is;
            const P = S * Math.cos(phi);
            const Q = S * Math.sin(phi);

            const scale = 100 / Math.max(S, 1);
            const px = P * scale, qy = Q * scale;

            // P (real power) — horizontal
            ptGroup.append('line')
                .attr('x1', cx - px / 2).attr('y1', cy)
                .attr('x2', cx + px / 2).attr('y2', cy)
                .attr('stroke', GREEN).attr('stroke-width', 3);
            ptGroup.append('text')
                .attr('x', cx).attr('y', cy + 16)
                .attr('fill', GREEN).attr('font-size', 9).attr('text-anchor', 'middle')
                .text('P = ' + P.toFixed(1) + 'W');

            // Q (reactive power) — vertical
            ptGroup.append('line')
                .attr('x1', cx + px / 2).attr('y1', cy)
                .attr('x2', cx + px / 2).attr('y2', cy - qy)
                .attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '4 2');
            ptGroup.append('text')
                .attr('x', cx + px / 2 + 8).attr('y', cy - qy / 2)
                .attr('fill', GOLD).attr('font-size', 8)
                .text('Q = ' + Q.toFixed(1) + 'VAR');

            // S (apparent power) — hypotenuse
            ptGroup.append('line')
                .attr('x1', cx - px / 2).attr('y1', cy)
                .attr('x2', cx + px / 2).attr('y2', cy - qy)
                .attr('stroke', PURPLE).attr('stroke-width', 2);
            ptGroup.append('text')
                .attr('x', cx - 5).attr('y', cy - qy / 2 - 5)
                .attr('fill', PURPLE).attr('font-size', 9).attr('text-anchor', 'end')
                .text('S = ' + S.toFixed(1) + 'VA');

            // φ arc
            const arcR = 25;
            const arcPath = d3.arc()({ innerRadius: arcR - 1, outerRadius: arcR, startAngle: 0, endAngle: -phi });
            ptGroup.append('path')
                .attr('d', arcPath)
                .attr('transform', `translate(${cx - px / 2},${cy})`)
                .attr('fill', ORANGE);
            ptGroup.append('text')
                .attr('x', cx - px / 2 + 30).attr('y', cy - 8)
                .attr('fill', ORANGE).attr('font-size', 9)
                .text('φ = ' + phiDeg + '°');

            // Wattmeter reading badge
            ptGroup.append('rect')
                .attr('x', cx - 55).attr('y', cy + 28)
                .attr('width', 110).attr('height', 24)
                .attr('rx', 6).attr('fill', 'rgba(0,255,136,0.1)').attr('stroke', GREEN);
            ptGroup.append('text')
                .attr('x', cx).attr('y', cy + 44)
                .attr('fill', GREEN).attr('font-size', 10).attr('text-anchor', 'middle')
                .text('θ ∝ P = ' + P.toFixed(1) + 'W');
        }

        function updateEdyn() {
            const V = +document.getElementById('m2-edyn-v').value;
            const I = +document.getElementById('m2-edyn-i').value;
            const phi = +document.getElementById('m2-edyn-phi').value;
            document.getElementById('m2-edyn-v-val').textContent = V + 'V';
            document.getElementById('m2-edyn-i-val').textContent = I + 'A';
            document.getElementById('m2-edyn-phi-val').textContent = phi + '°';
            drawPowerTriangle(V, I, phi);

            // Rotate moving coil (GSAP)
            const moving = document.getElementById('m2-edyn-moving');
            if (moving && typeof gsap !== 'undefined') {
                const P = V * I * Math.cos(phi * Math.PI / 180);
                const maxP = 240 * 20;
                const angle = (P / maxP) * 60;
                gsap.to(moving, { rotation: angle, transformOrigin: '120px 110px', duration: 0.4 });
            }
        }

        ['m2-edyn-v', 'm2-edyn-i', 'm2-edyn-phi'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateEdyn);
        });

        // Mode buttons (Wattmeter / Ammeter / Voltmeter)
        const modeInfo = {
            'watt': { formula: 'θ ∝ VIcosφ = Power' },
            'amm': { formula: 'θ ∝ I² (both coils in series)' },
            'volt': { formula: 'θ ∝ V² (both coils in series)' }
        };
        ['m2-edyn-watt', 'm2-edyn-amm', 'm2-edyn-volt'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('#m2-edyn-watt,#m2-edyn-amm,#m2-edyn-volt')
                        .forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            }
        });

        updateEdyn();

        // Calculator
        initCalcListener(['m2-wt-v', 'm2-wt-i', 'm2-wt-pf'], function () {
            const V = +document.getElementById('m2-wt-v').value;
            const I = +document.getElementById('m2-wt-i').value;
            const pf = +document.getElementById('m2-wt-pf').value;
            const P = V * I * pf;
            setResult('m2-wt-result', `P = ${P.toFixed(2)} W`);
        });
    }

    /* ──────────────────────────────────────────────────
       CARD 7 — THREE-PANEL POINTER COMPARISON
       PMMC (linear) vs MI (I²) vs Electrodynamometer
       ────────────────────────────────────────────────── */
    function initComparisonPointers() {
        const container = document.getElementById('m2-compare-pointers');
        if (!container) return;

        const instruments = [
            { name: 'PMMC', color: CYAN, law: pct => pct, scaleLabel: 'θ ∝ I' },
            { name: 'MI', color: GOLD, law: pct => (pct * pct) / 100, scaleLabel: 'θ ∝ I²' },
            { name: 'Electrodyn', color: PURPLE, law: pct => pct * 0.8, scaleLabel: 'θ ∝ P' }
        ];

        const meterW = 160, meterH = 120;
        const svgs = [];

        instruments.forEach((inst, idx) => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'text-align:center;';
            const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgEl.setAttribute('viewBox', `0 0 ${meterW} ${meterH}`);
            svgEl.setAttribute('width', meterW);
            svgEl.setAttribute('height', meterH);
            svgEl.style.cssText = 'background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid #333;';

            // Scale arc
            const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arc.setAttribute('d', `M 15 ${meterH - 15} A 65 65 0 0 1 ${meterW - 15} ${meterH - 15}`);
            arc.setAttribute('fill', 'none');
            arc.setAttribute('stroke', '#475569');
            arc.setAttribute('stroke-width', '3');
            svgEl.appendChild(arc);

            // Scale markings
            const cx = meterW / 2, cy = meterH - 15, r = 60;
            for (let i = 0; i <= 10; i++) {
                const pct = i * 10;
                const deflection = inst.law(pct);
                const angle = -Math.PI + (deflection / 100) * Math.PI;
                const x1 = cx + (r - 5) * Math.cos(angle);
                const y1 = cy + (r - 5) * Math.sin(angle);
                const x2 = cx + r * Math.cos(angle);
                const y2 = cy + r * Math.sin(angle);
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x1); tick.setAttribute('y1', y1);
                tick.setAttribute('x2', x2); tick.setAttribute('y2', y2);
                tick.setAttribute('stroke', inst.color);
                tick.setAttribute('stroke-width', i % 5 === 0 ? '2' : '1');
                svgEl.appendChild(tick);
            }

            // Needle
            const needleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            needleG.style.transformOrigin = `${cx}px ${cy}px`;
            const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            needle.setAttribute('x1', cx); needle.setAttribute('y1', cy);
            needle.setAttribute('x2', cx - r + 5); needle.setAttribute('y2', cy);
            needle.setAttribute('stroke', inst.color);
            needle.setAttribute('stroke-width', '2');
            needle.setAttribute('stroke-linecap', 'round');
            needleG.appendChild(needle);
            const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pivot.setAttribute('cx', cx); pivot.setAttribute('cy', cy);
            pivot.setAttribute('r', '4'); pivot.setAttribute('fill', '#fff');
            needleG.appendChild(pivot);
            svgEl.appendChild(needleG);

            wrap.appendChild(svgEl);

            // Label
            const label = document.createElement('div');
            label.style.cssText = `color:${inst.color};font-size:11px;font-family:Orbitron;margin-top:5px;`;
            label.textContent = inst.name;
            wrap.appendChild(label);
            const subLabel = document.createElement('div');
            subLabel.style.cssText = `color:${GREY};font-size:9px;`;
            subLabel.textContent = inst.scaleLabel;
            wrap.appendChild(subLabel);

            container.appendChild(wrap);
            svgs.push({ needleG, inst, cx, cy });
        });

        // Slider
        const slider = document.getElementById('m2-compare-current');
        const valEl = document.getElementById('m2-compare-val');
        function updatePointers(pct) {
            valEl.textContent = pct + '%';
            svgs.forEach(({ needleG, inst, cx, cy }) => {
                const deflection = inst.law(pct);
                const angle = -180 + (deflection / 100) * 180;
                if (typeof gsap !== 'undefined') {
                    gsap.to(needleG, { rotation: angle, transformOrigin: `${cx}px ${cy}px`, duration: 0.3 });
                } else {
                    needleG.style.transform = `rotate(${angle}deg)`;
                }
            });
        }
        if (slider) {
            slider.addEventListener('input', function () { updatePointers(+this.value); });
        }
        updatePointers(50);
    }

    /* ──────────────────────────────────────────────────
       BOOKMARKS
       ────────────────────────────────────────────────── */
    function initBookmarks() {
        const KEY = 'ee_m2_bookmarks';
        let bm = JSON.parse(localStorage.getItem(KEY) || '[]');

        function save() { localStorage.setItem(KEY, JSON.stringify(bm)); }
        function updateUI() {
            document.querySelectorAll('.m2-bookmark-btn').forEach(btn => {
                const card = btn.getAttribute('data-card');
                if (bm.includes(card)) {
                    btn.classList.add('bookmarked');
                    btn.textContent = '🔖 Bookmarked';
                } else {
                    btn.classList.remove('bookmarked');
                    btn.textContent = '🔖 Bookmark';
                }
            });
        }

        document.querySelectorAll('.m2-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const card = this.getAttribute('data-card');
                const idx = bm.indexOf(card);
                if (idx >= 0) bm.splice(idx, 1); else bm.push(card);
                save();
                updateUI();
            });
        });
        updateUI();
    }

    /* ──────────────────────────────────────────────────
       CALCULATOR HELPER
       ────────────────────────────────────────────────── */
    function initCalcListener(ids, calcFn) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', calcFn);
        });
        // Initial calculation
        setTimeout(calcFn, 100);
    }

    function setResult(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    /* ──────────────────────────────────────────────────
       GSAP ENTRANCE ANIMATIONS
       ────────────────────────────────────────────────── */
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') return;

        // Animate all M2 cards on scroll
        gsap.utils.toArray('.m2-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: card,
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power2.out'
            });
        });

        // Pulsing badge
        gsap.utils.toArray('.m2-badge').forEach(badge => {
            gsap.to(badge, {
                boxShadow: '0 0 12px rgba(249,115,22,0.5)',
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 2.8: ELECTRODYNAMOMETER COMPLETE ANALYSIS
       ══════════════════════════════════════════════════════ */
    function initEDMComplete() {
        const vSlider  = document.getElementById('m2-edm8-v');
        const iSlider  = document.getElementById('m2-edm8-i');
        const phiSlider= document.getElementById('m2-edm8-phi');
        if (!vSlider || !iSlider || !phiSlider) return;

        const vVal   = document.getElementById('m2-edm8-v-val');
        const iVal   = document.getElementById('m2-edm8-i-val');
        const phiVal = document.getElementById('m2-edm8-phi-val');
        const powerTxt = document.getElementById('m2-edm8-power');
        const modeLabel= document.getElementById('m2-edm8-mode-label');

        let mode = 'watt'; // watt | dc | amm | voltm

        // Mode buttons
        const modes = {dc:'m2-edm8-dc', watt:'m2-edm8-watt', amm:'m2-edm8-amm', voltm:'m2-edm8-voltm'};
        Object.entries(modes).forEach(([m, id]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => {
                mode = m;
                Object.values(modes).forEach(bid => {
                    const b = document.getElementById(bid);
                    if (b) b.classList.remove('active');
                });
                btn.classList.add('active');
                update();
            });
        });

        // Time-constant bar chart
        const tcW = 200, tcH = 200;
        const tcSvg = d3Container('m2-edm8-tc-bars', tcW, tcH);
        if (tcSvg) {
            tcSvg.append('text').attr('x', tcW/2).attr('y', 15).attr('fill','#94a3b8').attr('font-size',10).attr('text-anchor','middle').text('L/R Time Constants');
        }

        function drawTC() {
            if (!tcSvg) return;
            tcSvg.selectAll('.tc-bar,.tc-lbl').remove();
            const data = [
                {label:'τ_sh', val: 0.5/50, color: BLUE},
                {label:'τ_coil', val: 1/100, color: GOLD}
            ];
            const barW = 50, gap = 30;
            const maxV = Math.max(...data.map(d=>d.val), 0.02);
            const startX = (tcW - data.length*(barW+gap) + gap)/2;
            data.forEach((d,i) => {
                const h = (d.val/maxV) * 130;
                tcSvg.append('rect').attr('class','tc-bar').attr('x', startX + i*(barW+gap)).attr('y', tcH - 30 - h).attr('width', barW).attr('height', h).attr('rx',4).attr('fill', d.color).attr('opacity',0.7);
                tcSvg.append('text').attr('class','tc-lbl').attr('x', startX + i*(barW+gap) + barW/2).attr('y', tcH - 30 - h - 5).attr('fill', d.color).attr('font-size',9).attr('text-anchor','middle').text((d.val*1000).toFixed(2)+' ms');
                tcSvg.append('text').attr('class','tc-lbl').attr('x', startX + i*(barW+gap) + barW/2).attr('y', tcH - 15).attr('fill','#94a3b8').attr('font-size',9).attr('text-anchor','middle').text(d.label);
            });
            const match = Math.abs(data[0].val - data[1].val) < 0.001;
            tcSvg.append('text').attr('class','tc-lbl').attr('x', tcW/2).attr('y', tcH - 2).attr('fill', match ? GREEN : RED).attr('font-size',9).attr('text-anchor','middle').text(match ? '✓ Matched' : '✗ Not matched');
        }
        drawTC();

        function update() {
            const V = +vSlider.value, I = +iSlider.value, phi = +phiSlider.value;
            vVal.textContent = V + 'V';
            iVal.textContent = I + 'A';
            phiVal.textContent = phi + '°';

            let P, label;
            const cosPhi = Math.cos(phi * Math.PI/180);
            switch(mode) {
                case 'dc':
                    P = I * I * 10; // θ ∝ I²
                    label = 'DC — θ ∝ I² = ' + P.toFixed(1);
                    break;
                case 'watt':
                    P = V * I * cosPhi;
                    label = 'Wattmeter — P = ' + P.toFixed(1) + ' W (Linear)';
                    break;
                case 'amm':
                    P = I * I;
                    label = 'Ammeter — θ ∝ I² = ' + P.toFixed(1);
                    break;
                case 'voltm':
                    P = V * V / 10000;
                    label = 'Voltmeter — θ ∝ V² = ' + P.toFixed(4);
                    break;
                default:
                    P = V * I * cosPhi;
                    label = 'Wattmeter — P = ' + P.toFixed(1) + ' W';
            }
            if (powerTxt) powerTxt.textContent = 'P = ' + (V * I * cosPhi).toFixed(1) + ' W';
            if (modeLabel) modeLabel.textContent = 'Mode: ' + label;
        }

        [vSlider, iSlider, phiSlider].forEach(s => s.addEventListener('input', update));
        update();

        // Wattmeter calculator
        initCalcListener(['m2-e8-v','m2-e8-i','m2-e8-pf'], function() {
            const v = +document.getElementById('m2-e8-v').value;
            const i = +document.getElementById('m2-e8-i').value;
            const pf = +document.getElementById('m2-e8-pf').value;
            const p = v * i * pf;
            setResult('m2-e8-result', 'P = ' + p.toFixed(2) + ' W, θ ∝ ' + p.toFixed(2));
        });

        // Time constant calculator
        initCalcListener(['m2-e8-lsh','m2-e8-rsh','m2-e8-lm','m2-e8-rm'], function() {
            const lsh = +document.getElementById('m2-e8-lsh').value / 1000;
            const rsh = +document.getElementById('m2-e8-rsh').value;
            const lm  = +document.getElementById('m2-e8-lm').value / 1000;
            const rm  = +document.getElementById('m2-e8-rm').value;
            const tSh = (lsh/rsh)*1000, tM = (lm/rm)*1000;
            const match = Math.abs(tSh - tM) < 0.01;
            setResult('m2-e8-tc-result',
                'τ<sub>shunt</sub> = ' + tSh.toFixed(3) + ' ms, τ<sub>coil</sub> = ' + tM.toFixed(3) + ' ms ' +
                (match ? '<span style="color:#00ff88;">✓ Matched</span>' : '<span style="color:#ef4444;">✗ Not matched — adjust L/R</span>')
            );
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 2.9: ELECTROTHERMIC INSTRUMENTS
       ══════════════════════════════════════════════════════ */
    function initElectrothermic() {
        const iSlider = document.getElementById('m2-thermo-i');
        if (!iSlider) return;
        const iVal   = document.getElementById('m2-thermo-i-val');
        const wire   = document.getElementById('m2-hw-wire');
        const glow   = document.getElementById('m2-hw-glow');
        const pointer= document.getElementById('m2-hw-pointer');
        const tcGlow = document.getElementById('m2-tc-glow');
        const tcEmf  = document.getElementById('m2-tc-emf');
        const tcHot  = document.getElementById('m2-tc-hot');

        let waveType = 'sine';

        // Waveform buttons
        const waveButtons = {sine:'m2-wave-sine', square:'m2-wave-square', tri:'m2-wave-tri'};
        Object.entries(waveButtons).forEach(([w, id]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => {
                waveType = w;
                Object.values(waveButtons).forEach(bid => {
                    const b = document.getElementById(bid);
                    if (b) b.classList.remove('active');
                });
                btn.classList.add('active');
                drawWaveform();
            });
        });

        // RMS waveform D3
        const rmsW = 220, rmsH = 190;
        const rmsSvg = d3Container('m2-thermo-rms', rmsW, rmsH);

        function drawWaveform() {
            if (!rmsSvg) return;
            rmsSvg.selectAll('.wave-path,.wave-rms,.wave-label').remove();
            const pct = +iSlider.value / 100;
            const amp = pct * 70;
            const midY = rmsH / 2;
            const pts = 200;
            const data = [];
            for (let i = 0; i <= pts; i++) {
                const t = i / pts;
                let y;
                switch(waveType) {
                    case 'sine':   y = amp * Math.sin(2 * Math.PI * t * 3); break;
                    case 'square': y = amp * (Math.sin(2 * Math.PI * t * 3) >= 0 ? 1 : -1); break;
                    case 'tri':    y = amp * (2 * Math.abs(2 * ((t*3) % 1) - 1) - 1); break;
                    default:       y = 0;
                }
                data.push({x: 20 + t * (rmsW - 40), y: midY - y});
            }

            const line = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX);
            rmsSvg.append('path').attr('class','wave-path').attr('d', line(data)).attr('fill','none').attr('stroke', ORANGE).attr('stroke-width',2);

            // RMS line
            let rmsF;
            switch(waveType) {
                case 'sine':   rmsF = 0.707; break;
                case 'square': rmsF = 1; break;
                case 'tri':    rmsF = 1/Math.sqrt(3); break;
                default:       rmsF = 0.707;
            }
            const rmsY = midY - amp * rmsF;
            rmsSvg.append('line').attr('class','wave-rms').attr('x1',20).attr('y1',rmsY).attr('x2',rmsW-20).attr('y2',rmsY).attr('stroke', GREEN).attr('stroke-width',1.5).attr('stroke-dasharray','4 3');
            rmsSvg.append('text').attr('class','wave-label').attr('x',rmsW - 15).attr('y',rmsY - 4).attr('fill', GREEN).attr('font-size',8).attr('text-anchor','end').text('RMS');

            // Labels
            rmsSvg.append('text').attr('class','wave-label').attr('x',rmsW/2).attr('y',14).attr('fill','#94a3b8').attr('font-size',9).attr('text-anchor','middle').text(waveType.charAt(0).toUpperCase() + waveType.slice(1) + ' — RMS factor: ' + rmsF.toFixed(3));
            rmsSvg.append('text').attr('class','wave-label').attr('x',rmsW/2).attr('y', rmsH - 5).attr('fill', ORANGE).attr('font-size',9).attr('text-anchor','middle').text('I_rms = ' + (pct * 10 * rmsF).toFixed(2) + ' A');
        }

        function updateHotWire() {
            const pct = +iSlider.value / 100;
            if (iVal) iVal.textContent = iSlider.value + '%';

            // Sag wire
            const sag = 100 + pct * 40;
            if (wire) wire.setAttribute('d', 'M 30 100 Q 100 ' + sag + ' 170 100');

            // Glow
            if (glow) {
                glow.setAttribute('cy', String(sag));
                glow.setAttribute('fill', 'rgba(249,115,22,' + (pct * 0.5) + ')');
                glow.classList.toggle('hw-glow-anim', pct > 0.1);
            }

            // Pointer rotation
            if (pointer) {
                const angle = pct * 45;
                pointer.style.transform = 'rotate(' + angle + 'deg)';
            }

            // Thermocouple
            const tempRise = pct * pct * 200; // T ∝ I²
            const emf = (pct * pct * 12).toFixed(1);
            if (tcGlow) {
                tcGlow.setAttribute('fill', 'rgba(249,115,22,' + (pct * 0.6) + ')');
                tcGlow.classList.toggle('tc-glow-anim', pct > 0.1);
            }
            if (tcEmf) tcEmf.textContent = 'E = ' + emf + ' mV';
            if (tcHot) tcHot.textContent = 'T_H = ' + tempRise.toFixed(0) + '°C';

            drawWaveform();
        }

        iSlider.addEventListener('input', updateHotWire);
        updateHotWire();

        // Thermocouple RMS calculator
        initCalcListener(['m2-tc-peak'], function() {
            const wave = document.getElementById('m2-tc-wave');
            const peak = +document.getElementById('m2-tc-peak').value;
            let factor;
            switch(wave ? wave.value : 'sine') {
                case 'sine':    factor = 0.707; break;
                case 'square':  factor = 1; break;
                case 'triangle':factor = 1/Math.sqrt(3); break;
                default:        factor = 0.707;
            }
            setResult('m2-tc-result', 'I<sub>rms</sub> = ' + (peak * factor).toFixed(3) + ' A  (factor = ' + factor.toFixed(4) + ')');
        });
        // Also trigger on select change
        const waveSelect = document.getElementById('m2-tc-wave');
        if (waveSelect) waveSelect.addEventListener('change', function() {
            const peak = +document.getElementById('m2-tc-peak').value;
            let factor;
            switch(waveSelect.value) {
                case 'sine':    factor = 0.707; break;
                case 'square':  factor = 1; break;
                case 'triangle':factor = 1/Math.sqrt(3); break;
                default:        factor = 0.707;
            }
            setResult('m2-tc-result', 'I<sub>rms</sub> = ' + (peak * factor).toFixed(3) + ' A  (factor = ' + factor.toFixed(4) + ')');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 2.10: ELECTROSTATIC INSTRUMENT
       ══════════════════════════════════════════════════════ */
    function initElectrostatic() {
        const vSlider = document.getElementById('m2-estat-v');
        if (!vSlider) return;
        const vVal     = document.getElementById('m2-estat-v-val');
        const movingG  = document.getElementById('m2-estat-moving');
        const fieldG   = document.getElementById('m2-estat-field');

        // V² scale chart
        const scW = 280, scH = 195;
        const scSvg = d3Container('m2-estat-scale', scW, scH);
        if (scSvg) {
            scSvg.append('text').attr('x', scW/2).attr('y',14).attr('fill','#94a3b8').attr('font-size',9).attr('text-anchor','middle').text('Deflection θ vs Voltage (V² scale)');
        }

        function drawScale(V) {
            if (!scSvg) return;
            scSvg.selectAll('.sc-elem').remove();
            const margin = {t:25, r:15, b:30, l:40};
            const w = scW - margin.l - margin.r;
            const h = scH - margin.t - margin.b;
            const g = scSvg.append('g').attr('class','sc-elem').attr('transform','translate('+margin.l+','+margin.t+')');

            // V² curve
            const data = [];
            for (let v = 0; v <= 100; v += 2) {
                data.push({v: v, theta: (v*v)/10000});
            }
            const xScale = d3.scaleLinear().domain([0,100]).range([0,w]);
            const yScale = d3.scaleLinear().domain([0,1]).range([h,0]);

            // Axes
            g.append('line').attr('x1',0).attr('y1',h).attr('x2',w).attr('y2',h).attr('stroke','#475569');
            g.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',h).attr('stroke','#475569');
            g.append('text').attr('x',w/2).attr('y',h+22).attr('fill','#94a3b8').attr('font-size',8).attr('text-anchor','middle').text('Voltage (V)');
            g.append('text').attr('x',-h/2).attr('y',-28).attr('fill','#94a3b8').attr('font-size',8).attr('text-anchor','middle').attr('transform','rotate(-90)').text('θ (norm.)');

            // Curve
            const line = d3.line().x(d => xScale(d.v)).y(d => yScale(d.theta)).curve(d3.curveMonotoneX);
            g.append('path').attr('d', line(data)).attr('fill','none').attr('stroke', BLUE).attr('stroke-width',2);

            // Current reading point
            const normTheta = (V*V)/10000;
            g.append('circle').attr('cx', xScale(V)).attr('cy', yScale(normTheta)).attr('r',5).attr('fill', ORANGE);
            g.append('text').attr('x', xScale(V) + 8).attr('y', yScale(normTheta)).attr('fill', ORANGE).attr('font-size',8).text('θ=' + normTheta.toFixed(3));

            // "Linear scale" reference line
            g.append('line').attr('x1',0).attr('y1',yScale(0)).attr('x2',xScale(100)).attr('y2',yScale(1)).attr('stroke', GREEN).attr('stroke-width',1).attr('stroke-dasharray','4 3').attr('opacity',0.4);
            g.append('text').attr('x',w-5).attr('y',yScale(0.95)).attr('fill', GREEN).attr('font-size',7).attr('text-anchor','end').attr('opacity',0.5).text('linear ref');

            // Label
            g.append('text').attr('x',w/2).attr('y',h+14).attr('fill', BLUE).attr('font-size',7).attr('text-anchor','middle').text('Non-linear (V²)');
        }

        function update() {
            const V = +vSlider.value;
            if (vVal) vVal.textContent = V + ' V';

            // Rotate moving vane proportionally to V²
            const normV = V / 100;
            const angle = normV * normV * 25; // max 25 degrees
            if (movingG) movingG.style.transform = 'rotate(' + angle + 'deg)';

            // Field line opacity
            if (fieldG) fieldG.setAttribute('opacity', String(0.15 + normV * 0.6));
            if (fieldG) fieldG.classList.toggle('estat-field-anim', V > 10);

            drawScale(V);
        }

        vSlider.addEventListener('input', update);
        update();

        // Calculator
        initCalcListener(['m2-es-v','m2-es-dc','m2-es-k'], function() {
            const v  = +document.getElementById('m2-es-v').value;
            const dc = +document.getElementById('m2-es-dc').value * 1e-12; // pF → F
            const k  = +document.getElementById('m2-es-k').value;
            const theta = (0.5 * v * v * dc) / k;
            setResult('m2-es-result', 'θ = ' + theta.toFixed(6) + ' rad (' + (theta * 180/Math.PI).toFixed(4) + '°)');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 2.11: RANGE EXTENSION — ELECTROSTATIC VOLTMETERS
       ══════════════════════════════════════════════════════ */
    function initRangeExtension() {
        const vSlider = document.getElementById('m2-div-v');
        const fSlider = document.getElementById('m2-div-f');
        if (!vSlider || !fSlider) return;
        const vVal = document.getElementById('m2-div-v-val');
        const fVal = document.getElementById('m2-div-f-val');

        // SVG labels
        const rdivVm = document.getElementById('m2-rdiv-vm');
        const rdivM  = document.getElementById('m2-rdiv-m');
        const rdivP  = document.getElementById('m2-rdiv-p');
        const cdivVm = document.getElementById('m2-cdiv-vm');
        const cdivM  = document.getElementById('m2-cdiv-m');
        const rdivHeat = document.getElementById('m2-rdiv-heat');

        // Fixed divider params for interactive
        const R = 10000, r = 1000; // Resistance divider
        const Cs = 10, Cv = 100;   // pF - Capacitance divider

        // Frequency response chart
        const frW = 240, frH = 195;
        const frSvg = d3Container('m2-divider-freq', frW, frH);
        if (frSvg) {
            frSvg.append('text').attr('x', frW/2).attr('y',14).attr('fill','#94a3b8').attr('font-size',9).attr('text-anchor','middle').text('Divider Ratio vs Frequency');
        }

        function drawFreqResponse(freq) {
            if (!frSvg) return;
            frSvg.selectAll('.fr-elem').remove();
            const margin = {t:25, r:15, b:30, l:40};
            const w = frW - margin.l - margin.r;
            const h = frH - margin.t - margin.b;
            const g = frSvg.append('g').attr('class','fr-elem').attr('transform','translate('+margin.l+','+margin.t+')');

            const xScale = d3.scaleLog().domain([10,1000]).range([0,w]);
            const yScale = d3.scaleLinear().domain([0, 15]).range([h,0]);

            // Axes
            g.append('line').attr('x1',0).attr('y1',h).attr('x2',w).attr('y2',h).attr('stroke','#475569');
            g.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',h).attr('stroke','#475569');
            g.append('text').attr('x',w/2).attr('y',h+22).attr('fill','#94a3b8').attr('font-size',8).attr('text-anchor','middle').text('Frequency (Hz)');
            g.append('text').attr('x',-h/2).attr('y',-28).attr('fill','#94a3b8').attr('font-size',8).attr('text-anchor','middle').attr('transform','rotate(-90)').text('m (ratio)');

            // R-divider: ratio varies with frequency due to stray capacitance (~5pF)
            const Cstray = 5e-12;
            const dataR = [], dataC = [];
            for (let f = 10; f <= 1000; f += 5) {
                const omega = 2 * Math.PI * f;
                // R divider with stray C across r: Zr = r || (1/jωCstray)
                const Zr_mag = r / Math.sqrt(1 + (omega * Cstray * r) * (omega * Cstray * r));
                const mR = R / Zr_mag;
                dataR.push({f: f, m: Math.min(mR, 15)});
                // C divider: m = 1 + Cv/Cs (frequency independent)
                const mC = 1 + Cv/Cs;
                dataC.push({f: f, m: mC});
            }

            const lineGen = d3.line().x(d => xScale(d.f)).y(d => yScale(d.m)).curve(d3.curveMonotoneX);

            // R-divider line (drifts with freq)
            g.append('path').attr('d', lineGen(dataR)).attr('fill','none').attr('stroke', RED).attr('stroke-width',2);
            g.append('text').attr('x',w-5).attr('y', yScale(dataR[dataR.length-1].m) - 5).attr('fill', RED).attr('font-size',7).attr('text-anchor','end').text('R-div');

            // C-divider line (flat)
            g.append('path').attr('d', lineGen(dataC)).attr('fill','none').attr('stroke', CYAN).attr('stroke-width',2);
            g.append('text').attr('x',w-5).attr('y', yScale(dataC[0].m) - 5).attr('fill', CYAN).attr('font-size',7).attr('text-anchor','end').text('C-div');

            // Current frequency marker
            if (freq >= 10 && freq <= 1000) {
                const omega = 2 * Math.PI * freq;
                const Zr = r / Math.sqrt(1 + (omega * Cstray * r) * (omega * Cstray * r));
                const mRf = Math.min(R / Zr, 15);
                g.append('circle').attr('cx', xScale(freq)).attr('cy', yScale(mRf)).attr('r',4).attr('fill', RED);
                g.append('circle').attr('cx', xScale(freq)).attr('cy', yScale(1 + Cv/Cs)).attr('r',4).attr('fill', CYAN);
                g.append('line').attr('x1', xScale(freq)).attr('y1',0).attr('x2', xScale(freq)).attr('y2',h).attr('stroke','#475569').attr('stroke-dasharray','3 3');
            }

            // Tick marks
            [10, 50, 100, 500, 1000].forEach(f => {
                g.append('text').attr('x', xScale(f)).attr('y', h+12).attr('fill','#475569').attr('font-size',7).attr('text-anchor','middle').text(f);
            });
        }

        function update() {
            const V = +vSlider.value, f = +fSlider.value;
            if (vVal) vVal.textContent = V + 'V';
            if (fVal) fVal.textContent = f + ' Hz';

            // Resistance divider
            const Vm_r = (r / R) * V;
            const mR = R / r;
            const Ploss = (V * V) / R;
            if (rdivVm) rdivVm.textContent = 'Vm = ' + Vm_r.toFixed(1) + ' V';
            if (rdivM)  rdivM.textContent  = 'm = R/r = ' + mR.toFixed(1);
            if (rdivP)  rdivP.textContent  = 'P_loss = ' + Ploss.toFixed(2) + ' W';
            if (rdivHeat) {
                const heatOpacity = Math.min(Ploss / 200, 0.4);
                rdivHeat.setAttribute('fill', 'rgba(239,68,68,' + heatOpacity + ')');
                rdivHeat.classList.toggle('rdiv-heat-anim', Ploss > 5);
            }

            // Capacitance divider
            const Vm_c = (Cs / (Cs + Cv)) * V;
            const mC = 1 + Cv / Cs;
            if (cdivVm) cdivVm.textContent = 'Vm = ' + Vm_c.toFixed(1) + ' V';
            if (cdivM)  cdivM.textContent  = 'm = 1+Cv/Cs = ' + mC.toFixed(1);

            drawFreqResponse(f);
        }

        vSlider.addEventListener('input', update);
        fSlider.addEventListener('input', update);
        update();

        // R-divider calculator
        initCalcListener(['m2-rd-R','m2-rd-r','m2-rd-v'], function() {
            const Rv = +document.getElementById('m2-rd-R').value;
            const rv = +document.getElementById('m2-rd-r').value;
            const Vv = +document.getElementById('m2-rd-v').value;
            const vm = (rv / Rv) * Vv;
            const m  = Rv / rv;
            const p  = (Vv * Vv) / Rv;
            setResult('m2-rd-result', 'V<sub>m</sub> = ' + vm.toFixed(2) + ' V, m = ' + m.toFixed(2) + ', P<sub>loss</sub> = ' + p.toFixed(2) + ' W');
        });

        // C-divider calculator
        initCalcListener(['m2-cd-cv','m2-cd-cs','m2-cd-v'], function() {
            const cv = +document.getElementById('m2-cd-cv').value;
            const cs = +document.getElementById('m2-cd-cs').value;
            const Vv = +document.getElementById('m2-cd-v').value;
            const vm = (cs / (cs + cv)) * Vv;
            const m  = 1 + cv / cs;
            setResult('m2-cd-result', 'V<sub>m</sub> = ' + vm.toFixed(2) + ' V, m = ' + m.toFixed(2) + ' (Zero power loss)');
        });
    }

    /* ──────────────────────────────────────────────────
       INIT ALL
       ────────────────────────────────────────────────── */
    function initModule2() {
        initSwampResistance();
        initMultirangeAmmeter();
        initAyrtonShunt();
        initVoltmeterMultiplier();
        initMovingIron();
        initElectrodynamometer();
        initComparisonPointers();
        initEDMComplete();
        initElectrothermic();
        initElectrostatic();
        initRangeExtension();
        initBookmarks();
        initGSAPAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModule2);
    } else {
        initModule2();
    }
})();
